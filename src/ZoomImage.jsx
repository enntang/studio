import { useRef, useState } from 'react'

// 放大鏡的縮放倍率與鏡頭大小。字面上的「200 倍」做出來鏡頭裡只會剩一小塊色塊，
// 完全看不出圖案，這裡先抓一個能看清筆觸細節、又不會失焦模糊的倍率，
// 之後想更誇張或更保守都只要改這兩個數字
const ZOOM = 2.5
const LENS_SIZE = 180

// 只有滑鼠＋精準指標裝置（桌機）才需要放大鏡，觸控裝置沒有 hover 概念，
// 直接跳過、渲染一般的圖片
const canHover =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

function ZoomImage({ src, alt = '', className = '' }) {
  const containerRef = useRef(null)
  const [lens, setLens] = useState(null) // null = 目前沒有 hover

  if (!canHover) {
    return <img src={src} alt={alt} className={className} />
  }

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    setLens({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      w: rect.width,
      h: rect.height,
    })
  }

  return (
    <div
      ref={containerRef}
      className='relative'
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setLens(null)}
    >
      <img src={src} alt={alt} className={className} />
      {lens && (
        <div
          className='pointer-events-none absolute rounded-full ring-1 ring-black/10 shadow-xl'
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lens.x - LENS_SIZE / 2,
            top: lens.y - LENS_SIZE / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${lens.w * ZOOM}px ${lens.h * ZOOM}px`,
            backgroundPosition: `${-(lens.x * ZOOM - LENS_SIZE / 2)}px ${-(lens.y * ZOOM - LENS_SIZE / 2)}px`,
          }}
        />
      )}
    </div>
  )
}

export default ZoomImage
