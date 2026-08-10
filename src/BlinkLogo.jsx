import { useEffect, useState } from 'react'
import frameOpen from './blink/frame-open.svg?raw'
import frameHalf from './blink/frame-half.svg?raw'
import frameClosed from './blink/frame-closed.svg?raw'

/**
 * 會眨眼的 logo 標記。三幀的節奏沿用 public/blink-test.html 測試頁的設定：
 * 一次眨眼 0.2s（開→半→閉→半→開），快速眨兩下後停一下，再眨一次，然後長休息。
 *
 * SVG 用 ?raw 內嵌進 bundle（而不是放 public/ 用 <img> 抓），
 * loading 畫面在最開頭就要出現，這樣才不會等圖片下載完才開始動。
 */

const FRAMES = { open: frameOpen, half: frameHalf, closed: frameClosed }

const BLINK_STEP = 50 // 一次眨眼切三段，每段 50ms
const LEAD_IN = 300 // 開場先睜眼一下再眨，不會一出現就抽動
const QUICK_GAP = 100 // 快速眨兩下之間
const SHORT_GAP = 350 // 第三下之前的短間隔
const LONG_GAP = 1500 // 重複之前的長休息

const blinkMotion = () => [
  { frame: 'half', duration: BLINK_STEP },
  { frame: 'closed', duration: BLINK_STEP * 2 },
  { frame: 'half', duration: BLINK_STEP },
]

// 長休息放在最後而不是最前面：循環播放時兩者等價，但擺前面會讓元件一出現就
// 靜止 1.5 秒，用在 Loading 上等於還沒眨就被收掉了
const SEQUENCE = [
  { frame: 'open', duration: LEAD_IN },
  ...blinkMotion(), // 第 1 下
  { frame: 'open', duration: QUICK_GAP },
  ...blinkMotion(), // 第 2 下（跟第 1 下構成快速兩連眨）
  { frame: 'open', duration: SHORT_GAP },
  ...blinkMotion(), // 第 3 下
  { frame: 'open', duration: LONG_GAP },
]

// 完整眨完三下所需的時間（不含結尾長休息），末尾補一段睜眼讓動作收乾淨。
// Loading.jsx 用這個值決定最短顯示時間——之後調上面任何一個常數都會自動跟著變，
// 不用兩邊各自維護一個數字
const END_OPEN_MS = 300
export const BLINK_ROUND_MS =
  SEQUENCE.slice(0, -1).reduce((total, step) => total + step.duration, 0) + END_OPEN_MS

function BlinkLogo({ className = '' }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    // 使用者若在系統設定關掉動態效果，就停在睜眼那一幀
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => setStep((s) => s + 1), SEQUENCE[step % SEQUENCE.length].duration)
    return () => clearTimeout(id)
  }, [step])

  const active = SEQUENCE[step % SEQUENCE.length].frame

  return (
    <div className={`relative aspect-[3/2] ${className}`} role='img' aria-label='一元復始'>
      {Object.entries(FRAMES).map(([name, svg]) => (
        <div
          key={name}
          aria-hidden='true'
          className='absolute inset-0 [&>svg]:w-full [&>svg]:h-full'
          style={{ opacity: name === active ? 1 : 0 }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ))}
    </div>
  )
}

export default BlinkLogo
