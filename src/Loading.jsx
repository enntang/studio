import { useEffect, useRef, useState } from 'react'
import BlinkLogo, { BLINK_ROUND_MS } from './BlinkLogo'

/**
 * 全螢幕 Loading 畫面：眨眼 logo + 進度條，跑到 100% 後整片向上滑出。
 *
 * 進度條的推進方式：
 * - 主軸是時間，在 MIN_VISIBLE_MS 內線性推到 100%，確保眨眼動畫至少完整跑一輪
 * - 但資源還沒載完時會卡在 STALL_AT 不再前進，等 load 事件到了才補完最後那段。
 *   這樣進度條不會出現「已經 100% 了畫面卻還沒好」的假象
 * - 條子本身另外吃一段 CSS transition，載很慢時最後那一跳才不會生硬
 *
 * 收起動畫刻意做成「下緣帶弧度的白幕向上掀開」，比單純淡出更有連續感；
 * 使用者若在系統設定關掉動態效果，就退回單純淡出。
 */

const MIN_VISIBLE_MS = BLINK_ROUND_MS // 最短顯示時間＝完整眨完三下
const STALL_AT = 92 // 資源還沒載完時，進度條停在這個百分比
const EXIT_MS = 900 // 白幕掀開的時間
const FAILSAFE_MS = 6000 // 圖片壞掉或網路卡住時，最多擋這麼久

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function Loading() {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [removed, setRemoved] = useState(false)
  const readyRef = useRef(false) // 資源載完了沒（放 ref 是因為要在 rAF 迴圈裡讀最新值）

  // 標記資源載入完成
  useEffect(() => {
    const markReady = () => {
      readyRef.current = true
    }
    if (document.readyState === 'complete') markReady()
    else window.addEventListener('load', markReady, { once: true })

    const failsafe = setTimeout(markReady, FAILSAFE_MS)
    return () => {
      window.removeEventListener('load', markReady)
      clearTimeout(failsafe)
    }
  }, [])

  // 進度推進。這裡用 setInterval 而不是 requestAnimationFrame：rAF 在背景分頁
  // 完全不會執行，使用者用 ⌘-click 在背景開這個網站時，進度條會凍在 0% 不動。
  // 計時器在背景只是被降頻到約一秒一次，至少還會前進，切回來就跑完了。
  // 視覺上的平滑交給條子自己的 CSS transition，不需要每幀更新
  useEffect(() => {
    const start = performance.now()

    const tick = () => {
      const timed = Math.min(100, ((performance.now() - start) / MIN_VISIBLE_MS) * 100)
      const target = readyRef.current ? timed : Math.min(STALL_AT, timed)
      setProgress(target)
      if (target >= 100) {
        clearInterval(id)
        setExiting(true)
      }
    }

    const id = setInterval(tick, 30)
    return () => clearInterval(id)
  }, [])

  // 掀開動畫播完才從 DOM 移除
  useEffect(() => {
    if (!exiting) return
    const id = setTimeout(() => setRemoved(true), EXIT_MS)
    return () => clearTimeout(id)
  }, [exiting])

  if (removed) return null

  const reduced = prefersReducedMotion()
  const exitStyle = reduced
    ? {
        opacity: exiting ? 0 : 1,
        transition: `opacity ${EXIT_MS}ms ease-out`,
      }
    : {
        transform: exiting ? 'translateY(-100%)' : 'translateY(0)',
        // 掀開時下緣帶出一道橫向大弧，白幕才不會像一塊硬邦邦的方塊被抽走
        borderBottomLeftRadius: exiting ? '50% 14vh' : '0',
        borderBottomRightRadius: exiting ? '50% 14vh' : '0',
        transition: `transform ${EXIT_MS}ms cubic-bezier(0.76, 0, 0.24, 1), border-radius ${EXIT_MS}ms ease-out`,
      }

  return (
    <div
      role='status'
      aria-live='polite'
      aria-label='載入中'
      className={`fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center ${
        exiting ? 'pointer-events-none' : ''
      }`}
      style={exitStyle}
    >
      <BlinkLogo className='w-24 md:w-28' />

      {/* 進度條 */}
      <div className='mt-7 w-40 md:w-48 h-px bg-line'>
        <div
          className='h-full bg-ink-800 transition-[width] duration-300 ease-out'
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className='mt-3 text-[11px] tracking-[0.25em] text-muted tabular-nums'>
        {Math.round(progress)}%
      </div>
    </div>
  )
}

export default Loading
