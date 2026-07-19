import { useEffect, useState } from 'react'
import { BASE, FILTERS } from './data'

const MENU_FADE_MS = 300

/**
 * 首頁、Profile、Contact 共用的左側導覽，確保切頁時選單維持完整、只有 active 狀態不同。
 * ALL WORK / PROJECT / ILLUSTRATION 都是連到對應 hash 路由的連結（見 App.jsx 的
 * categoryFromHash），所以從任何頁面點擊都能回首頁並套用篩選，不只是首頁內部切換。
 */
const CATEGORY_ITEMS = [
  { key: 'all', href: '#/', label: 'ALL WORK' },
  ...FILTERS.map((f) => ({ key: f.key, href: `#/${f.key}`, label: f.label })),
]

const PAGE_ITEMS = [
  { key: 'profile', href: '#/about', label: 'PROFILE' },
  { key: 'contact', href: '#/contact', label: 'CONTACT' },
]

function NavLinks({ active, onNavigate }) {
  return (
    <>
      {[...CATEGORY_ITEMS, ...PAGE_ITEMS].map((item) => (
        <a
          key={item.key}
          href={item.href}
          onClick={onNavigate}
          className={`text-left hover:opacity-50 transition-opacity ${active === item.key ? 'underline underline-offset-4' : ''}`}
        >
          {item.label}
        </a>
      ))}
    </>
  )
}

function Sidebar({ active }) {
  const [menuOpen, setMenuOpen] = useState(false) // 行動版漢堡選單（使用者的開關意圖）
  const [menuRendered, setMenuRendered] = useState(false) // 選單是否還在 DOM 裡，淡出播完才移除
  const [menuVisible, setMenuVisible] = useState(false) // 控制 opacity，觸發淡入／淡出

  useEffect(() => {
    if (menuOpen) {
      setMenuRendered(true)
      // 先掛載成 opacity-0，下一輪 paint 再切成 opacity-100，transition 才有起點可以淡入
      const id = requestAnimationFrame(() => setMenuVisible(true))
      return () => cancelAnimationFrame(id)
    }
    setMenuVisible(false)
    const timeoutId = setTimeout(() => setMenuRendered(false), MENU_FADE_MS)
    return () => clearTimeout(timeoutId)
  }, [menuOpen])

  return (
    <>
      {/* 固定左欄（桌面版） */}
      <aside className='fixed left-6 md:left-10 top-0 z-20 pt-10 md:pt-14 w-56 hidden md:flex flex-col h-full'>
        <a href='#/' className='block mb-10 hover:opacity-60 transition-opacity'>
          <img src={BASE + 'logo.svg'} alt='一元復始' className='h-[80px] w-auto' />
        </a>

        {/* pl-5：logo.svg 圖檔本身「一」字左側留白，加這個 padding 讓選單文字跟字視覺對齊 */}
        <nav className='flex flex-col gap-4 pl-5 text-[13px] tracking-[0.15em] text-neutral-700'>
          <NavLinks active={active} />

          <div className='mt-10 flex flex-col gap-2 items-start text-sm italic text-neutral-600 normal-case tracking-normal'>
            <a
              href='https://www.instagram.com/enn.illust/'
              target='_blank'
              rel='noreferrer'
              aria-label='Instagram'
              className='block hover:opacity-50 transition-opacity'
            >
              <img src={BASE + 'ins.svg'} alt='Instagram' className='w-5 h-5' />
            </a>
            <a href='mailto:enntang.work@gmail.com' className='not-italic hover:opacity-50 transition-opacity'>enntang.work@gmail.com</a>
          </div>
        </nav>
      </aside>

      {/* 行動版頂部列 */}
      <header className='md:hidden sticky top-0 z-20 bg-white/90 backdrop-blur'>
        <div className='px-8 py-4 flex items-center justify-between'>
          <a href='#/' className='block shrink-0'>
            <img src={BASE + 'logo.svg'} alt='一元復始' className='h-[60px] w-auto' />
          </a>
          {/* 漢堡／叉叉圖示沿用 portfolio 專案 Navbar.jsx 的做法：三條固定尺寸的橫槓用
              rotate/opacity 變形成 X，而不是切換 ☰／✕ 文字符號（兩個字符字重、大小不同，
              切換時大小會不一致） */}
          <button
            aria-label={menuOpen ? '關閉選單' : '開啟選單'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className='p-1'
          >
            <div className='w-6 h-3.5 relative'>
              <span
                className={`absolute left-0 w-full h-0.5 bg-neutral-800 transition-all duration-300 ease-in-out ${
                  menuOpen ? 'top-1.5 rotate-45' : 'top-0 rotate-0'
                }`}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-neutral-800 transition-all duration-300 ease-in-out ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ top: '6px' }}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-neutral-800 transition-all duration-300 ease-in-out ${
                  menuOpen ? 'top-1.5 -rotate-45' : 'top-3 rotate-0'
                }`}
              />
            </div>
          </button>
        </div>

        {menuRendered && (
          <nav
            className={`px-8 pb-6 flex flex-col gap-4 text-sm tracking-[0.15em] text-neutral-700 border-t border-neutral-100 pt-5 transition-opacity duration-300 ease-in-out ${
              menuVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <NavLinks active={active} onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}
      </header>
    </>
  )
}

export default Sidebar
