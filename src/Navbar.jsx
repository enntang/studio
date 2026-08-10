import { useEffect, useState } from 'react'
import { BASE, FILTERS } from './data'

const MENU_FADE_MS = 300

/**
 * 全站共用的頂部導覽列（原本是左側欄，改成橫向置頂）。
 *
 * overHero：首頁有滿版第一屏時傳 true。此時導覽列是透明的、疊在大圖上，
 * logo 反白、選單文字先不出現；捲過第一屏之後才換成白底並淡入選單。
 * 其他頁面沒有第一屏，一律直接是白底完整狀態。
 */
const CATEGORY_ITEMS = [
  { key: 'all', href: '#/', label: 'ALL WORK' },
  ...FILTERS.map((f) => ({ key: f.key, href: `#/${f.key}`, label: f.label })),
]

const PAGE_ITEMS = [
  { key: 'profile', href: '#/about', label: 'PROFILE' },
  { key: 'contact', href: '#/contact', label: 'CONTACT' },
]

const NAV_ITEMS = [...CATEGORY_ITEMS, ...PAGE_ITEMS]

function NavLinks({ active, onNavigate, className = '' }) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.key}
          href={item.href}
          onClick={onNavigate}
          className={`${className} hover:opacity-50 transition-opacity ${
            active === item.key ? 'underline underline-offset-4' : ''
          }`}
        >
          {item.label}
        </a>
      ))}
    </>
  )
}

function Navbar({ active, overHero = false }) {
  const [menuOpen, setMenuOpen] = useState(false) // 行動版漢堡選單
  const [menuRendered, setMenuRendered] = useState(false) // 淡出播完才移除
  const [menuVisible, setMenuVisible] = useState(false) // 控制 opacity
  const [scrolled, setScrolled] = useState(!overHero)

  useEffect(() => {
    if (!overHero) {
      setScrolled(true)
      return
    }
    // 捲過 60% 視窗高度才換成白底，這時第一屏大圖已經退場大半
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    onScroll() // 重新整理時可能已經停在頁面中段，先判斷一次
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [overHero])

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

  // 選單展開時強制用白底，否則行動版選單會浮在大圖上看不清楚
  const solid = scrolled || menuOpen

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-500 ${
        solid ? 'bg-surface/90 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className='px-6 md:px-10 h-20 md:h-24 flex items-center justify-between gap-6'>
        <a href='#/' className='block shrink-0 hover:opacity-60 transition-opacity'>
          {/* 疊在大圖上時反白：brightness-0 先壓成黑、invert 再翻成白，
              logo.svg 有藍字與深咖啡字兩色，用 filter 才能一次都轉乾淨 */}
          <img
            src={BASE + 'logo.svg'}
            alt='一元復始'
            className={`h-12 md:h-14 w-auto transition-[filter] duration-500 ${
              solid ? '' : 'brightness-0 invert'
            }`}
          />
        </a>

        {/* 桌機版橫向選單 */}
        <nav
          aria-hidden={solid ? undefined : 'true'}
          className={`hidden md:flex items-center gap-7 text-[13px] tracking-[0.15em] text-ink-700 transition-opacity duration-500 ${
            solid ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <NavLinks active={active} />
          <a
            href='https://www.instagram.com/enn.illust/'
            target='_blank'
            rel='noreferrer'
            aria-label='Instagram'
            className='block hover:opacity-50 transition-opacity'
          >
            <img src={BASE + 'ins.svg'} alt='Instagram' className='w-5 h-5' />
          </a>
        </nav>

        {/* 行動版漢堡。三條橫槓用 rotate/opacity 變形成 X，而不是切換 ☰／✕ 文字符號
            （兩個字符字重、大小不同，切換時會忽大忽小） */}
        <button
          aria-label={menuOpen ? '關閉選單' : '開啟選單'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className='md:hidden p-1'
        >
          <div className='w-6 h-3.5 relative'>
            <span
              className={`absolute left-0 w-full h-0.5 transition-all duration-300 ease-in-out ${
                solid ? 'bg-ink-800' : 'bg-white'
              } ${menuOpen ? 'top-1.5 rotate-45' : 'top-0 rotate-0'}`}
            />
            <span
              className={`absolute left-0 w-full h-0.5 transition-all duration-300 ease-in-out ${
                solid ? 'bg-ink-800' : 'bg-white'
              } ${menuOpen ? 'opacity-0' : 'opacity-100'}`}
              style={{ top: '6px' }}
            />
            <span
              className={`absolute left-0 w-full h-0.5 transition-all duration-300 ease-in-out ${
                solid ? 'bg-ink-800' : 'bg-white'
              } ${menuOpen ? 'top-1.5 -rotate-45' : 'top-3 rotate-0'}`}
            />
          </div>
        </button>
      </div>

      {menuRendered && (
        <nav
          className={`md:hidden px-6 pb-6 flex flex-col gap-4 text-sm tracking-[0.15em] text-ink-700 border-t border-line pt-5 transition-opacity duration-300 ease-in-out ${
            menuVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <NavLinks active={active} onNavigate={() => setMenuOpen(false)} />
          <a
            href='mailto:enntang.work@gmail.com'
            className='text-sm text-body normal-case tracking-normal'
          >
            enntang.work@gmail.com
          </a>
        </nav>
      )}
    </header>
  )
}

export default Navbar
