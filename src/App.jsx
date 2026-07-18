import { useState, useEffect } from 'react'
import Home from './Home'
import WorkDetail from './WorkDetail'
import Wallpapers from './Wallpapers'
import { WORKS } from './data'

/**
 * Enn Studio — 接案作品目錄
 * 以 hash 路由切換頁面（不需額外套件，靜態主機也能部署）：
 * - #/            首頁（瀑布流），見 Home.jsx
 * - #/work/<slug> 作品獨立頁面，見 WorkDetail.jsx
 * - #/wallpapers  手機桌布下載頁，見 Wallpapers.jsx
 */

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function App() {
  const hash = useHashRoute()

  useEffect(() => {
    // 換頁時回到頂端（頁內錨點如 #pricing 交給瀏覽器處理）
    if (hash.startsWith('#/')) window.scrollTo(0, 0)
  }, [hash])

  const workMatch = hash.match(/^#\/work\/([^/]+)/)
  if (workMatch) {
    const work = WORKS.find((w) => w.slug === workMatch[1])
    if (work) return <WorkDetail work={work} />
  }

  if (hash.startsWith('#/wallpapers')) {
    return <Wallpapers />
  }

  return <Home />
}

export default App
