import { useEffect, useState } from 'react'
import BlinkLogo from './BlinkLogo'

/**
 * 全螢幕 Loading 畫面：中間是會眨眼的 logo。
 *
 * 收起條件是「頁面資源載完」與「最短顯示時間」兩個都滿足：
 * - 只等 load 事件的話，快取命中時會閃一下就消失，反而像破圖
 * - 只等固定秒數的話，圖還沒好就把畫面讓出去
 * 淡出期間用 pointer-events-none，才不會擋住底下已經可以操作的頁面。
 */

const MIN_VISIBLE_MS = 1200 // 最短顯示時間，讓眨眼動畫至少完整跑一輪
const FADE_MS = 500

function Loading() {
  const [done, setDone] = useState(false) // 資源載完 + 最短時間到
  const [removed, setRemoved] = useState(false) // 淡出播完才從 DOM 移除

  useEffect(() => {
    let settled = false
    const finish = () => {
      if (!settled) {
        settled = true
        setDone(true)
      }
    }

    const startedAt = Date.now()
    const release = () => {
      const waited = Date.now() - startedAt
      setTimeout(finish, Math.max(0, MIN_VISIBLE_MS - waited))
    }

    if (document.readyState === 'complete') {
      release()
    } else {
      window.addEventListener('load', release, { once: true })
    }

    // 保險：圖片壞掉或網路卡住時 load 可能一直不來，最多擋 6 秒
    const failsafe = setTimeout(finish, 6000)

    return () => {
      window.removeEventListener('load', release)
      clearTimeout(failsafe)
    }
  }, [])

  useEffect(() => {
    if (!done) return
    const id = setTimeout(() => setRemoved(true), FADE_MS)
    return () => clearTimeout(id)
  }, [done])

  if (removed) return null

  return (
    <div
      role='status'
      aria-live='polite'
      aria-label='載入中'
      className={`fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <BlinkLogo className='w-40 md:w-52' />
    </div>
  )
}

export default Loading
