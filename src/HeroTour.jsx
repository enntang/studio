import { useEffect, useRef, useState } from 'react'
import { BASE, TOUR } from './data'

/**
 * Hero Tour：捲動驅動的展示區塊。
 *
 * 版面結構是「高容器 + sticky 舞台」：外層拉高到好幾個視窗高度，裡面一個
 * h-screen 的 sticky 舞台固定在畫面上，靠捲動進度去驅動舞台內的動畫。
 * 所以使用者感覺是在原地捲，畫面卻在演。
 *
 * 一組主題的生命週期（局部進度 u 從 0 到 1）：
 *   u 0.00–0.38  沿著底部弧線從右邊進場，圖片收攏成一小叢
 *   u 0.38–0.50  抵達中心，往上散開成錯落排列，文字浮現
 *   u 0.50–0.68  停留
 *   u 0.68–1.00  收攏、繼續沿弧線往左離場，文字淡出
 *
 * 尊重 prefers-reduced-motion：關掉動態效果時改成普通的直式堆疊，不做捲動綁定。
 */

const TITLE_SPAN = 0.9 // 滿版標題佔多少「幕」，數字越大停留越久
const SCENE_SPAN = 1 // 每一組主題各佔一幕
const VH_PER_ACT = 1.7 // 一幕換算成幾個視窗高度的捲動距離

// 散開後每張圖的落點。x / y 是相對舞台中心的百分比，w 是寬度佔舞台寬的百分比
const SCATTER = [
  { x: -28, y: -2, w: 18, r: -5 },
  { x: -14, y: 15, w: 20, r: 4 },
  { x: 0, y: -13, w: 12, r: -7 },
  { x: 9, y: 11, w: 13, r: 6 },
  { x: 26, y: -1, w: 22, r: 3 },
]

const clamp01 = (n) => Math.min(1, Math.max(0, n))
const lerp = (a, b, t) => a + (b - a) * t
// 兩端平滑的插值，避免等速移動看起來很機械
const smooth = (t) => t * t * (3 - 2 * t)
// 在 [a,b] 區間內把值正規化到 0~1
const range = (v, a, b) => clamp01((v - a) / (b - a))

/**
 * 底部弧線：s 從 0（右側畫面外）到 1（左側畫面外），回傳舞台百分比座標。
 * 軌道走在畫面下緣附近（兩端 82%），中段微微上拱到 70%。
 * 散開時圖片會從這條線往上升到畫面中央，所以兩者要拉開距離。
 */
const ARC_Y_EDGE = 82
const ARC_Y_PEAK = 70

function arcPoint(s) {
  return {
    x: lerp(118, -18, s),
    y: ARC_Y_EDGE - (ARC_Y_EDGE - ARC_Y_PEAK) * Math.sin(Math.PI * s),
  }
}

function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 用 scroll 事件而不是 rAF 迴圈：背景分頁不會空轉，而且捲動本來就是事件驅動
    const update = () => {
      const rect = el.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) return setProgress(0)
      setProgress(clamp01(-rect.top / scrollable))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref])

  return progress
}

/** 沒填圖時的虛線佔位框，讓動畫節奏先看得到 */
function Slot({ src, index }) {
  if (src) return <img src={BASE + src} alt='' className='w-full h-auto block rounded-lg' />
  return (
    <div className='w-full aspect-[4/3] rounded-lg border border-dashed border-ink-300 bg-surface-subtle/70 flex items-center justify-center text-[10px] tracking-[0.2em] text-faint'>
      IMG {index + 1}
    </div>
  )
}

function Scene({ scene, u }) {
  // u < 0 或 > 1 代表這一組還沒輪到／已經離場，直接不畫
  if (u <= 0 || u >= 1) return null

  const travel = smooth(u) // 沿弧線前進的位置
  const base = arcPoint(travel)
  // 散開程度：中段最大，兩端收攏
  const spread = smooth(range(u, 0.3, 0.5)) * (1 - smooth(range(u, 0.66, 0.9)))
  // 文字比圖片稍晚出現、稍早離開
  const textIn = smooth(range(u, 0.36, 0.5)) * (1 - smooth(range(u, 0.64, 0.78)))

  return (
    <>
      {/* 文字 */}
      <div
        className='absolute inset-x-0 top-[8%] px-8 text-center pointer-events-none'
        style={{ opacity: textIn, transform: `translateY(${(1 - textIn) * 18}px)` }}
      >
        <div className='text-xs tracking-[0.3em] text-muted min-h-[1rem]'>{scene.eyebrow}</div>
        <h3 className='mt-3 text-3xl md:text-5xl font-bold tracking-wide text-ink min-h-[1.2em]'>
          {scene.title}
        </h3>
        <p className='mt-4 mx-auto max-w-xl text-sm md:text-base leading-relaxed text-body'>
          {scene.description}
        </p>
      </div>

      {/* 圖片：沿弧線移動，到中心散開 */}
      {SCATTER.map((slot, i) => {
        // 收攏時擠在弧線上的一點，散開時各自飛到自己的落點
        const x = lerp(base.x + (i - 2) * 3, 50 + slot.x, spread)
        const y = lerp(base.y + (i - 2) * 1.5, 50 + slot.y, spread)
        const scale = lerp(0.55, 1, spread)
        const rotate = lerp((i - 2) * 6, slot.r, spread)

        return (
          <div
            key={i}
            className='absolute'
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${slot.w}%`,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
              opacity: clamp01(u * 6) * clamp01((1 - u) * 6),
            }}
          >
            <Slot src={scene.images?.[i]} index={i} />
          </div>
        )
      })}
    </>
  )
}

function HeroTour() {
  const ref = useRef(null)
  const progress = useScrollProgress(ref)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const scenes = TOUR.scenes || []
  if (scenes.length === 0) return null

  const totalActs = TITLE_SPAN + scenes.length * SCENE_SPAN

  // 關掉動態效果時不做捲動綁定，改成一般的直式堆疊，內容一樣看得完整
  if (reduced) {
    return (
      <section className='mb-14 md:mb-20'>
        <div className='text-center py-16'>
          <h2 className='text-3xl md:text-5xl font-bold tracking-wide text-brand'>{TOUR.title}</h2>
          <p className='mt-3 text-xs tracking-[0.3em] text-muted'>{TOUR.subtitle}</p>
        </div>
        {scenes.map((scene, i) => (
          <div key={i} className='mb-16 text-center'>
            <div className='text-xs tracking-[0.3em] text-muted'>{scene.eyebrow}</div>
            <h3 className='mt-3 text-2xl md:text-4xl font-bold tracking-wide text-ink'>{scene.title}</h3>
            <p className='mt-4 mx-auto max-w-xl text-sm leading-relaxed text-body'>{scene.description}</p>
            <div className='mt-8 grid grid-cols-2 md:grid-cols-3 gap-4'>
              {SCATTER.map((_, j) => (
                <Slot key={j} src={scene.images?.[j]} index={j} />
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  // 標題幕的進度：0 → 1 之間淡出讓位給第一組
  const titleU = clamp01((progress * totalActs) / TITLE_SPAN)
  const titleOut = smooth(range(titleU, 0.55, 1))

  return (
    <section
      ref={ref}
      aria-label='服務項目導覽'
      style={{ height: `${totalActs * VH_PER_ACT * 100}vh` }}
      className='relative -mx-8 md:-mx-24'
    >
      {/* sticky 舞台：固定在畫面上，內容靠捲動進度演出 */}
      <div className='sticky top-0 h-screen [@supports(height:100svh)]:h-[100svh] overflow-hidden'>
        {/* 底部那條點狀弧線，是所有主題行進的軌道 */}
        <svg
          className='absolute inset-0 w-full h-full pointer-events-none'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
          aria-hidden='true'
        >
          {/* 二次貝茲的最高點 =（起點 + 2×控制點 + 終點）/ 4。
              要讓峰值落在 ARC_Y_PEAK(70)、端點 ARC_Y_EDGE(82)，控制點 y 得是 58 */}
          <path
            d='M -18 82 Q 50 58 118 82'
            fill='none'
            stroke='currentColor'
            className='text-ink-200'
            strokeWidth='2'
            strokeDasharray='2 7'
            strokeLinecap='round'
            vectorEffect='non-scaling-stroke'
          />
        </svg>

        {/* 滿版標題 */}
        <div
          className='absolute inset-0 flex items-center justify-center px-8 pointer-events-none'
          style={{
            opacity: 1 - titleOut,
            transform: `translateY(${titleOut * -40}px) scale(${1 - titleOut * 0.06})`,
          }}
        >
          <div className='text-center'>
            <h2 className='text-4xl md:text-7xl font-bold tracking-[0.08em] text-brand min-h-[1.2em]'>
              {TOUR.title}
            </h2>
            <p className='mt-4 text-xs md:text-sm tracking-[0.3em] text-muted'>{TOUR.subtitle}</p>
          </div>
        </div>

        {/* 三組主題 */}
        {scenes.map((scene, i) => {
          const start = TITLE_SPAN + i * SCENE_SPAN
          const u = (progress * totalActs - start) / SCENE_SPAN
          return <Scene key={i} scene={scene} u={u} />
        })}
      </div>
    </section>
  )
}

export default HeroTour
