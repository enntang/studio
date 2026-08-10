import { BASE } from './data'
import Navbar from './Navbar'

/**
 * 個人簡介頁（版面參照 zaoridraws.cargo.site 的 Profile 頁）：
 * - 左欄：跟首頁共用的 Sidebar（見 Sidebar.jsx），選單維持完整、PROFILE 為 active 狀態
 * - 右側：大頭照、簡介文字、學歷
 *
 * 簡介文字目前是預留內容，請直接改這個檔案裡的文字。
 */
function About() {
  return (
    <div className='min-h-screen bg-surface font-serif text-ink'>
      <Navbar active='profile' />

      <main className='px-8 md:px-24 pt-28 md:pt-40 pb-24 max-w-2xl mx-auto'>
        <img
          src={BASE + 'avatar.png'}
          alt='Enn Tang'
          className='w-40 h-40 object-cover rounded-full mb-10'
        />

        <h2 className='text-xl font-bold tracking-wide mb-4'>Enn Tang</h2>

        {/* 以下為預留文字，請改成你自己的簡介 */}
        <p className='text-sm leading-relaxed text-body mb-10'>
          台灣接案設計師與插畫家。作品橫跨 UI / UX 設計、插畫、品牌視覺等領域。
        </p>

        <h3 className='text-xs tracking-[0.2em] text-muted mb-3'>學歷</h3>
        <p className='text-sm leading-relaxed text-body mb-10'>
          國立臺灣科技大學 設計系 碩士
        </p>

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
            <a href='mailto:enntang.work@gmail.com' className='font-bold underline underline-offset-4 hover:opacity-60'>
              enntang.work@gmail.com
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About
