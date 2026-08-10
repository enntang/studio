import AppKit
import Foundation

// argv: <in.svg> <out.png> <size>
let inPath = CommandLine.arguments[1]
let outPath = CommandLine.arguments[2]
let size = Int(CommandLine.arguments[3])!

guard let src = NSImage(contentsOfFile: inPath) else {
    print("NSImage 讀不到 \(inPath)"); exit(1)
}
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
rep.size = NSSize(width: size, height: size)

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
NSGraphicsContext.current?.imageInterpolation = .high
src.draw(in: NSRect(x: 0, y: 0, width: size, height: size),
         from: .zero, operation: .sourceOver, fraction: 1.0)
NSGraphicsContext.restoreGraphicsState()

guard let data = rep.representation(using: .png, properties: [:]) else {
    print("PNG 編碼失敗"); exit(1)
}
try data.write(to: URL(fileURLWithPath: outPath))
print("\(outPath) — \(size)×\(size), \(data.count) bytes")
