import Foundation
import Darwin

/// UDP link to the Rabbit Box (see claude/rabbit-box-protocol.md in the Project):
/// - the box is 192.168.4.1 on its own Wi-Fi (RabbitBox....)
/// - we bind locally to port 11912 and send one byte 0x01 to 192.168.4.1:11912 every second ("hello")
/// - the box answers to the last client that said hello, to that client's port 11912,
///   with ASCII messages ending in "|": pulse=A;B;T;00|  btUp=A;B|  lap=A;B|  ...
final class RabbitLink {
    static let boxHost = "192.168.4.1"
    static let port: UInt16 = 11912

    /// Called on the main queue with the raw text of each datagram.
    var onText: ((String) -> Void)?
    /// Called on the main queue: "listening", "denied", "error", "stopped".
    var onState: ((String) -> Void)?

    private var fd: Int32 = -1
    private var readSource: DispatchSourceRead?
    private var helloTimer: DispatchSourceTimer?
    private let queue = DispatchQueue(label: "rabbit.udp")
    private var box = sockaddr_in()

    var isRunning: Bool { fd >= 0 }

    func start() {
        queue.async { self.openSocket() }
    }

    func stop() {
        queue.async { self.closeSocket(report: true) }
    }

    // MARK: - private (always on `queue`)

    private func openSocket() {
        if fd >= 0 { return }
        let s = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
        guard s >= 0 else { report("error"); return }

        var yes: Int32 = 1
        setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &yes, socklen_t(MemoryLayout<Int32>.size))
        setsockopt(s, SOL_SOCKET, SO_REUSEPORT, &yes, socklen_t(MemoryLayout<Int32>.size))

        var local = sockaddr_in()
        local.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)
        local.sin_family = sa_family_t(AF_INET)
        local.sin_port = RabbitLink.port.bigEndian
        local.sin_addr = in_addr(s_addr: INADDR_ANY)
        let bound = withUnsafePointer(to: &local) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                bind(s, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }
        guard bound == 0 else { close(s); report("error"); return }

        // non-blocking reads driven by a dispatch source
        let flags = fcntl(s, F_GETFL, 0)
        _ = fcntl(s, F_SETFL, flags | O_NONBLOCK)

        box = sockaddr_in()
        box.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)
        box.sin_family = sa_family_t(AF_INET)
        box.sin_port = RabbitLink.port.bigEndian
        inet_pton(AF_INET, RabbitLink.boxHost, &box.sin_addr)

        fd = s

        let rs = DispatchSource.makeReadSource(fileDescriptor: s, queue: queue)
        rs.setEventHandler { [weak self] in self?.readAll() }
        rs.setCancelHandler { close(s) }
        rs.resume()
        readSource = rs

        let t = DispatchSource.makeTimerSource(queue: queue)
        t.schedule(deadline: .now(), repeating: .seconds(1))
        t.setEventHandler { [weak self] in self?.sendHello() }
        t.resume()
        helloTimer = t

        report("listening")
    }

    private func sendHello() {
        guard fd >= 0 else { return }
        var b: UInt8 = 0x01
        let r = withUnsafePointer(to: &box) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                sendto(fd, &b, 1, 0, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }
        // EHOSTUNREACH / ENETUNREACH: not on the box's Wi-Fi yet, just keep trying.
        // EPERM or similar after the first try usually means "Local Network" permission was refused.
        if r < 0 && errno == EPERM { report("denied") }
    }

    private func readAll() {
        var buf = [UInt8](repeating: 0, count: 2048)
        while fd >= 0 {
            let n = recv(fd, &buf, buf.count, 0)
            if n <= 0 { break }
            let text = String(decoding: buf[0..<n], as: UTF8.self)
            DispatchQueue.main.async { [weak self] in self?.onText?(text) }
        }
    }

    private func closeSocket(report r: Bool) {
        helloTimer?.cancel(); helloTimer = nil
        fd = -1                                  // the read source's cancel handler closes the socket
        readSource?.cancel(); readSource = nil
        if r { report("stopped") }
    }

    private func report(_ s: String) {
        DispatchQueue.main.async { [weak self] in self?.onState?(s) }
    }
}
