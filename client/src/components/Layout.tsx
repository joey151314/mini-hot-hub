import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <main className="main">
        {children}
      </main>
      <footer className="footer">
  <p>本站为个人学习项目</p>
  <p>数据来源于各平台公开信息，非官方</p>
  <p>更新频率约 {Math.round((parseInt(import.meta.env.VITE_CACHE_TTL) || 600) / 60)} 分钟</p>
  <p>如有侵权或违规请联系：195698839@qq.com</p>
</footer>
    </div>
  )
}

export default Layout
