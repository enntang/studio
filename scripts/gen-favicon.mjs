/**
 * 從 src/blink/frame-open.svg（眨眼動畫的睜眼幀）產生網站圖示。
 *
 * 用法：
 *   node scripts/gen-favicon.mjs
 *   swift scripts/rasterize-svg.swift /tmp/apple-touch-icon.svg public/apple-touch-icon.png 180
 *   swift scripts/rasterize-svg.swift public/favicon.svg public/favicon-96.png 96
 *   swift scripts/rasterize-svg.swift public/favicon.svg public/favicon-32.png 32
 *
 * PNG 是必要的：apple-touch-icon 不吃 SVG，舊瀏覽器也需要退路。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = '/Users/programming/enn-studio/src/blink/frame-open.svg'
const OUT = '/Users/programming/enn-studio/public'

const svg = readFileSync(SRC, 'utf8')
const inner = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>')).trim()

// 原檔是 144×96 的橫幅，favicon 必須是正方形。
// 把內容置中放進 144×144 的畫布：內容中心 (72,48) 移到畫布中心 (72,72)，
// 再縮小一點留邊，避免圖形貼死邊緣。
const fit = (scale) => `translate(72 72) scale(${scale}) translate(-72 -48)`

const wrap = (opts = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
${opts.bg ? `  <rect width="144" height="144" fill="${opts.bg}"/>\n` : ''}  <g transform="${fit(opts.scale ?? 0.94)}">
    ${inner.split('\n').join('\n    ')}
  </g>
</svg>
`

// 分頁用：透明底，藍色圖形在深淺瀏覽器介面上都讀得到
writeFileSync(`${OUT}/favicon.svg`, wrap({ scale: 0.94 }))
// iOS 主畫面用的中繼檔：iOS 不處理透明（會變黑底），所以給白底並多留一點邊，
// 因為系統還會自己再切圓角。這個檔只是拿來轉 PNG，不放進 public/
writeFileSync('/tmp/apple-touch-icon.svg', wrap({ scale: 0.76, bg: '#FFFFFF' }))

console.log('public/favicon.svg 已產生；/tmp/apple-touch-icon.svg 待轉成 PNG')
