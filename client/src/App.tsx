import HotCard from './components/HotCard'
import Layout from './components/Layout'
import { useHotList } from './hooks/useHotList'
import { HotPlatform } from './types/hot'

function App() {
  const { data, loading, error, retry } = useHotList()

  return (
    <Layout>
      <header className="header">
        <h1>迷你今日热榜</h1>
        <p className="subtitle">聚合微博、知乎、B站等平台热点资讯</p>
      </header>

      <div className="hot-grid">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <HotCard key={i} platform={null} loading={true} />
            ))}
          </>
        ) : (
          data.map((platform: HotPlatform) => (
            <HotCard
              key={platform.source}
              platform={platform}
              error={!!platform.error}
              onRetry={retry}
            />
          ))
        )}
      </div>
    </Layout>
  )
}

export default App
