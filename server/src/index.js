import express from 'express'
import cors from 'cors'
import { getCache, setCache } from '../utils/cache.js'
import { fetchWeiboHot } from '../services/weibo.js'
import { fetchZhihuHot } from '../services/zhihu.js'
import { fetchBilibiliHot } from '../services/bilibili.js'

// 全局错误捕获
process.on('uncaughtException', (err) => console.error('FATAL ERROR:', err));
process.on('unhandledRejection', (reason) => console.error('UNHANDLED REJECTION:', reason));

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}))

app.use(express.json())

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`)
  next()
})

// 测试路由
app.get('/test', (req, res) => {
  console.log('[/test] received');
  res.send('OK');
});

app.get('/api/health', (req, res) => {
  console.log('[/api/health] handler entered');
  res.json({ ok: true })
})

// 生成微博热榜数据
function generateWeiboData() {
  return {
    source: 'weibo',
    sourceName: '微博',
    listName: '热搜榜',
    items: [
      { rank: 1, title: '人工智能技术突破', heat: '234万', url: '#' },
      { rank: 2, title: '教育改革新政策', heat: '189万', url: '#' },
      { rank: 3, title: '夏季高温天气预警', heat: '156万', url: '#' },
      { rank: 4, title: '新能源汽车销量创新高', heat: '123万', url: '#' },
      { rank: 5, title: '世界杯预选赛战况', heat: '98万', url: '#' },
      { rank: 6, title: '科技巨头发布新品', heat: '87万', url: '#' },
      { rank: 7, title: '旅游旺季来临', heat: '76万', url: '#' },
      { rank: 8, title: '人工智能应用普及', heat: '65万', url: '#' },
      { rank: 9, title: '教育行业数字化转型', heat: '54万', url: '#' },
      { rank: 10, title: '健康生活方式', heat: '43万', url: '#' }
    ],
    updatedAt: new Date().toISOString(),
    error: false,
    message: ''
  }
}

// 生成知乎热榜数据
function generateZhihuData() {
  return {
    source: 'zhihu',
    sourceName: '知乎',
    listName: '热榜',
    items: [
      { rank: 1, title: '如何看待最近的科技发展趋势？', heat: '120万', url: '#' },
      { rank: 2, title: '年轻人的职业选择', heat: '98万', url: '#' },
      { rank: 3, title: '人工智能的未来', heat: '87万', url: '#' },
      { rank: 4, title: '房价走势分析', heat: '76万', url: '#' },
      { rank: 5, title: '教育内卷现象', heat: '65万', url: '#' },
      { rank: 6, title: '职场经验分享', heat: '54万', url: '#' },
      { rank: 7, title: '读书推荐', heat: '43万', url: '#' },
      { rank: 8, title: '健身打卡', heat: '32万', url: '#' },
      { rank: 9, title: '美食探店', heat: '21万', url: '#' },
      { rank: 10, title: '宠物饲养', heat: '10万', url: '#' }
    ],
    updatedAt: new Date().toISOString(),
    error: false,
    message: ''
  }
}

// 生成B站热榜数据
function generateBilibiliData() {
  return {
    source: 'bilibili',
    sourceName: 'B站',
    listName: '热搜榜',
    items: [
      { rank: 1, title: '年度游戏大作发布', heat: '680万', url: '#' },
      { rank: 2, title: '动画新番开播', heat: '520万', url: '#' },
      { rank: 3, title: 'UP主自制短剧', heat: '450万', url: '#' },
      { rank: 4, title: '科技数码测评', heat: '380万', url: '#' },
      { rank: 5, title: '美食制作教程', heat: '320万', url: '#' },
      { rank: 6, title: '舞蹈翻跳', heat: '260万', url: '#' },
      { rank: 7, title: '知识科普', heat: '200万', url: '#' },
      { rank: 8, title: '音乐翻唱', heat: '150万', url: '#' },
      { rank: 9, title: '生活vlog', heat: '100万', url: '#' },
      { rank: 10, title: '手办开箱', heat: '80万', url: '#' }
    ],
    updatedAt: new Date().toISOString(),
    error: false,
    message: ''
  }
}

// 微博热榜（使用真实数据）
app.get('/api/hot/weibo', async (req, res) => {
  const cacheKey = 'hot:weibo'
  const refresh = req.query.refresh === '1'
  
  // refresh=1 强制刷新，跳过缓存
  if (!refresh) {
    const cached = getCache(cacheKey)
    if (cached) {
      console.log(`[cache hit] GET ${req.path}`)
      return res.json(cached)
    }
  }
  
  console.log(`[cache miss] GET ${req.path}`)
  
  try {
    const data = await fetchWeiboHot()
    
    // 如果是真实请求（非 refresh），则缓存结果
    if (!refresh) {
      setCache(cacheKey, data)
    }
    
    // 打印刷新日志
    if (refresh) {
      console.log(`[refresh] GET ${req.path}`)
    }
    
    // 即使 fetchWeiboHot 返回 error: true，也返回该数据
    // 因为 service 层已经处理了错误逻辑和错误消息
    return res.json(data)
  } catch (error) {
    console.error(`[Weibo] Fetch error: ${error.message}`)
    return res.status(500).json({
      source: 'weibo',
      sourceName: '微博',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: [],
      error: true,
      message: '微博热搜暂时无法获取'
    })
  }
})

// 知乎热榜（使用真实数据）
app.get('/api/hot/zhihu', async (req, res) => {
  const cacheKey = 'hot:zhihu'
  const refresh = req.query.refresh === '1'
  
  // refresh=1 强制刷新，跳过缓存
  if (!refresh) {
    const cached = getCache(cacheKey)
    if (cached) {
      console.log(`[cache hit] GET ${req.path}`)
      return res.json(cached)
    }
  }
  
  console.log(`[cache miss] GET ${req.path}`)
  
  try {
    const data = await fetchZhihuHot()
    
    // 如果是真实请求（非 refresh），则缓存结果
    if (!refresh) {
      setCache(cacheKey, data)
    } else {
      console.log(`[refresh] GET ${req.path}`)
    }
    
    return res.json(data)
  } catch (error) {
    console.error(`[Zhihu] Fetch error: ${error.message}`)
    return res.status(500).json({
      source: 'zhihu',
      sourceName: '知乎',
      listName: '热榜',
      updatedAt: new Date().toISOString(),
      items: [],
      error: true,
      message: '知乎热榜暂时无法获取'
    })
  }
})

// B站热榜（使用真实数据）
app.get('/api/hot/bilibili', async (req, res) => {
  const cacheKey = 'hot:bilibili'
  const refresh = req.query.refresh === '1'
  
  // refresh=1 强制刷新，跳过缓存
  if (!refresh) {
    const cached = getCache(cacheKey)
    if (cached) {
      console.log(`[cache hit] GET ${req.path}`)
      return res.json(cached)
    }
  }
  
  console.log(`[cache miss] GET ${req.path}`)
  
  try {
    const data = await fetchBilibiliHot()
    
    // 如果是真实请求（非 refresh），则缓存结果
    if (!refresh) {
      setCache(cacheKey, data)
    } else {
      console.log(`[refresh] GET ${req.path}`)
    }
    
    return res.json(data)
  } catch (error) {
    console.error(`[Bilibili] Fetch error: ${error.message}`)
    return res.status(500).json({
      source: 'bilibili',
      sourceName: 'B站',
      listName: '热搜榜',
      updatedAt: new Date().toISOString(),
      items: [],
      error: true,
      message: 'B站热搜暂时无法获取'
    })
  }
})

// 带超时的 Promise 包装函数
function withTimeout(promise, timeoutMs, name) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      console.error(`[${name}] Request timeout after ${timeoutMs}ms`)
      reject(new Error(`${name} timeout`))
    }, timeoutMs)
  })
  return Promise.race([promise, timeoutPromise])
}

// 聚合热榜
app.get('/api/hot', async (req, res) => {
  console.log('[/api/hot] handler started')
  
  const cacheKey = 'hot:all'
  const refresh = req.query.refresh === '1'
  const timeoutMs = 10000 // 10秒超时
  
  if (!refresh) {
    const cached = getCache(cacheKey)
    if (cached) {
      console.log(`[/api/hot] cache hit`)
      return res.json(cached)
    }
  }
  
  console.log(`[/api/hot] cache miss, fetching real data`)
  
  try {
    // 并行调用三个平台真实服务获取数据，每个请求设置10秒超时
    const [weiboData, zhihuData, bilibiliData] = await Promise.all([
      withTimeout(fetchWeiboHot(), timeoutMs, 'Weibo'),
      withTimeout(fetchZhihuHot(), timeoutMs, 'Zhihu'),
      withTimeout(fetchBilibiliHot(), timeoutMs, 'Bilibili')
    ])
    
    console.log('[/api/hot] all fetches completed successfully')
    
    const data = {
      platforms: [weiboData, zhihuData, bilibiliData]
    }
    
    if (!refresh) {
      setCache(cacheKey, data)
      console.log('[/api/hot] data cached')
    } else {
      console.log('[/api/hot] refresh mode, skipping cache')
    }
    
    res.json(data)
    console.log('[/api/hot] response sent successfully')
  } catch (error) {
    console.error(`[/api/hot] Fetch error: ${error.message}`, error.stack)
    // 获取失败时，返回错误信息但保留其他平台数据
    const data = {
      platforms: [
        {
          source: 'weibo',
          sourceName: '微博',
          listName: '热搜榜',
          updatedAt: new Date().toISOString(),
          items: [],
          error: true,
          message: '微博热搜暂时无法获取'
        },
        {
          source: 'zhihu',
          sourceName: '知乎',
          listName: '热榜',
          updatedAt: new Date().toISOString(),
          items: [],
          error: true,
          message: '知乎热榜暂时无法获取'
        },
        {
          source: 'bilibili',
          sourceName: 'B站',
          listName: '热搜榜',
          updatedAt: new Date().toISOString(),
          items: [],
          error: true,
          message: 'B站热搜暂时无法获取'
        }
      ]
    }
    res.json(data)
    console.log('[/api/hot] error response sent')
  }
})

// 无效 source 返回 404
app.use('/api/hot/:source', (req, res) => {
  res.status(404).json({
    error: true,
    message: '平台不存在'
  })
})

app.get('/', (req, res) => {
  res.send('OK')
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('EXPRESS ERROR:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT}`)
})
