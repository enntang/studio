/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // ── 色彩系統 ──────────────────────────────────────────────
      // 完整說明與對比度檢查表見 public/color-palette-preview.html
      //
      // 兩層結構：
      //   下層 brand / ink 是字面色階，只描述「這是什麼顏色」
      //   上層 primary / body / muted… 是語意別名，描述「這個顏色拿來做什麼」
      // 元件請盡量用語意層，之後換色只要改這裡的指向，不必全站搜尋替換。
      //
      // 輔色（secondary）尚未決定，待補。
      colors: {
        // logo.svg 主色。500 就是 logo 原色；小字「一元復始」的 #413030 目前
        // 只存在於 logo 檔案內，沒有進入系統
        brand: {
          DEFAULT: '#5182DE',
          50: '#F1F6FF',
          100: '#E0EBFF',
          200: '#C2D8FF',
          300: '#9DC0FF',
          400: '#70A2FE',
          500: '#5182DE', // = logo 原色。對白 3.75:1，只夠大字，不可當內文
          600: '#406EC7', // 對白 4.91:1，藍色小字要用這一階
          700: '#2C57AA',
          800: '#1B428E',
          900: '#092C70',
        },

        // 中性灰。色值沿用 Tailwind neutral，所以現有畫面完全不變。
        // 之後若輔色走暖色系，這一組可以整組換成帶暖度的灰，改這裡就好
        ink: {
          DEFAULT: '#262626',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3', // 對白僅 2.52:1，未達 AA，只能用於裝飾與大字
          500: '#737373', // 對白 4.74:1，這是「淡灰文字」的安全下限
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },

        // ── 語意層 ──
        primary: '#406EC7', // brand-600：可當內文的品牌藍
        body: '#525252', // ink-600：內文
        muted: '#737373', // ink-500：次要文字（達 AA 的最淡灰）
        faint: '#A3A3A3', // ink-400：僅裝飾，勿用於需要讀的文字
        line: '#E5E5E5', // ink-200：分隔線、外框
        surface: {
          DEFAULT: '#FFFFFF', // 頁面底色
          subtle: '#F5F5F5', // 圖片載入前的底、區塊底色
        },
      },
      // 首頁第一屏輪播的進退場。用 keyframes 而不是 transition，是因為進場要「一掛載
      // 就從放大狀態開始縮回來」，transition 需要先渲染起始值再翻轉，會有一幀閃爍
      keyframes: {
        'hero-image-in': {
          from: { opacity: '0', transform: 'scale(1.12)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'hero-image-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(1.05)' },
        },
        'hero-text-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'hero-text-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-10px)' },
        },
        'hero-scrim-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'hero-scrim-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        // 通用的淡入上浮，給不需要捲動偵測的進場（例如 About 首屏的主視覺）
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // both 是關鍵：動畫前後都保持在起訖值，不會播完彈回原狀
        'hero-image-in': 'hero-image-in 1000ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-image-out': 'hero-image-out 600ms cubic-bezier(0.4, 0, 1, 1) both',
        'hero-text-in': 'hero-text-in 700ms cubic-bezier(0.22, 1, 0.36, 1) 250ms both',
        'hero-text-out': 'hero-text-out 400ms ease-in both',
        'hero-scrim-in': 'hero-scrim-in 800ms ease-out both',
        'hero-scrim-out': 'hero-scrim-out 400ms ease-in both',
        'fade-up': 'fade-up 800ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      fontFamily: {
        // 全站字體。英數字走 Courier Prime（index.html 從 Google Fonts 引入），
        // 中文字 Courier Prime 沒有字型，會自動往後掉到 Noto Serif TC。
        serif: ['"Courier Prime"', 'Georgia', 'Times', '"Noto Serif TC"', 'serif'],
      },
    },
  },
  plugins: [],
}
