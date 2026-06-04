import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json())

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`)
  next()
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// 微博热榜
app.get('/api/hot/weibo', (req, res) => {
  const weiboHotData = {
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
  res.json(weiboHotData)
})

// 知乎热榜
app.get('/api/hot/zhihu', (req, res) => {
  const zhihuHotData = {
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
  res.json(zhihuHotData)
})

// B站热榜
app.get('/api/hot/bilibili', (req, res) => {
  const bilibiliHotData = {
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
  res.json(bilibiliHotData)
})

// 聚合热榜
app.get('/api/hot', (req, res) => {
  const weiboData = {
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

  const zhihuData = {
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

  const bilibiliData = {
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

  res.json({
    platforms: [weiboData, zhihuData, bilibiliData]
  })
})

// 无效 source 返回 404
app.use('/api/hot/:source', (req, res) => {
  res.status(404).json({
    error: true,
    message: '平台不存在'
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
