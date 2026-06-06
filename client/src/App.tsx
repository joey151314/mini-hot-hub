import HotCard from './components/HotCard'
import Layout from './components/Layout'
import { useHotList } from './hooks/useHotList'
import { HotPlatform } from './types/hot'

function App() {
  const { data, loading, error, retry } = useHotList()

  // 全屏加载状态
  if (loading) {
    return (
      <div className="fullscreen-loader">
        <div className="loader-content">
          <div className="loader-spinner"></div>
          <p className="loader-text">正在加载热榜数据...</p>
        </div>
      </div>
    )
  }

  // 整体错误状态（后端挂掉、网络错误等）
  if (error) {
    return (
      <Layout>
        <div className="error-page">
          <p>加载失败</p>
          <p>{error}</p>
          <button onClick={retry}>点击重试</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <header className="header">
        <div className="header-content">
          <div>
            <h1>迷你今日热榜</h1>
            <p className="subtitle">聚合微博、知乎、B站等平台热点资讯</p>
          </div>
          <button
            className="refresh-btn"
            onClick={retry}
            disabled={loading}
          >
            <span className="refresh-icon">🔄</span>
            {loading ? '刷新中...' : '刷新数据'}
          </button>
        </div>
      </header>

      <div className="hot-grid animate-fade-in">
        {data.map((platform: HotPlatform) => (
          <HotCard
            key={platform.source}
            platform={platform}
            error={!!platform.error}
            onRetry={retry}
          />
        ))}
      </div>
    </Layout>
  )
}

export default App
