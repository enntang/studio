import { useState } from 'react'
import { BASE } from './data'
import { LOADING_TOTAL_MS } from './Loading'
import Navbar from './Navbar'

/**
 * 個人簡介頁：頂部一張橫幅插畫當主視覺，下方接姓名、簡介、學歷與聯絡方式。
 * 導覽列是全站共用的 Navbar（見 Navbar.jsx），PROFILE 為 active 狀態。
 *
 * 簡介文字目前是預留內容，請直接改這個檔案裡的文字。
 */
function About() {
  // 直接開啟這一頁時，Loading 白幕會先蓋住畫面約 2.5 秒。進場動畫如果立刻播，
  // 等於在白幕後面播完，使用者看不到。所以掛載當下算一次還要等多久，
  // 從別頁點過來（沒有 loading 畫面）時 performance.now() 早就超過，延遲自然是 0
  const [entranceDelay] = useState(() => Math.max(0, LOADING_TOTAL_MS - performance.now()))

  return (
    <div className='min-h-screen bg-surface font-serif text-ink'>
      <Navbar active='profile' />

      <main className='px-8 md:px-24 pt-28 md:pt-40 pb-24'>
        {/* 主視覺插畫。比下方文字欄寬，才不會顯得小。
            width/height 帶原始尺寸，瀏覽器會自己算出比例預留空間，
            圖片載入前後版面不會跳動，也不必在 CSS 裡寫死長寬比。

            進場用純 CSS 動畫而不是 Reveal：這張圖在首屏、不需要捲動偵測，
            而 Reveal 靠 IntersectionObserver，萬一沒觸發，結果是圖永遠看不到，
            失敗模式太重。CSS 動畫沒有這個依賴 */}
        <div
          className='mb-12 max-w-5xl mx-auto motion-safe:animate-fade-up'
          style={{ animationDelay: `${entranceDelay}ms` }}
        >
          <img
            src={BASE + 'about-illustration.webp'}
            alt='Enn Tang 與貓'
            width={2048}
            height={1110}
            className='w-full h-auto block'
          />
        </div>

        <div className='max-w-2xl mx-auto'>
          <h2 className='text-xl font-bold tracking-wide mb-4'>Enn Tang</h2>

          {/* 以下為預留文字，請改成你自己的簡介 */}
          <p className='text-sm leading-relaxed text-body mb-10'>
            台灣接案設計師與插畫家。作品橫跨 UI / UX 設計、插畫、品牌視覺等領域。
          </p>

          <h3 className='text-xs tracking-[0.2em] text-muted mb-3'>學歷</h3>
          <p className='text-sm leading-relaxed text-body mb-10'>國立臺灣科技大學 設計系 碩士</p>

          <div className='text-sm text-body space-y-2'>
            <div>
              近期動態 →{' '}
              <a
                href='https://www.instagram.com/enn.illust/'
                target='_blank'
                rel='noreferrer'
                className='font-bold underline underline-offset-4 hover:opacity-60'
              >
                Instagram
              </a>
            </div>
            <div>
              工作邀約 →{' '}
              <a
                href='mailto:enntang.work@gmail.com'
                className='font-bold underline underline-offset-4 hover:opacity-60'
              >
                enntang.work@gmail.com
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About
