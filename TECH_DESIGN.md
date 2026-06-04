# 今日热搜 · 技术设计

## 技术栈
- 前端：React + TypeScript + Vite + CSS（可用 CSS Modules，不强制 UI 库）
- 后端：Node.js + Express
- 数据：各平台 JSON 接口（fetch 解析，非 HTML 爬虫）
- 缓存：内存 Map（TTL 300～600 秒）
- 部署：前端 Vercel / 后端 Railway（示例）

## 项目结构
mini-hot-hub/
├── client/                 # Vite + React
│   ├── src/
│   │   ├── components/     # HotCard、Layout
│   │   ├── api/            # fetchHot
│   │   ├── types/          # HotPlatform、HotItem
│   │   └── mock/           # Mock 阶段数据
├── server/
│   ├── routes/hot.js
│   ├── services/           # weibo.ts、zhihu.ts、bilibili.ts
│   └── utils/cache.js
└── README.md

## 数据模型

### HotItem
- rank: number
- title: string
- heat?: string
- url: string

### HotPlatform（接口响应）
- source: string          // weibo | zhihu | bilibili
- sourceName: string     // 微博
- listName: string        // 热搜榜
- updatedAt: string       // ISO8601
- items: HotItem[]
- error?: boolean
- message?: string

## 核心流程
1. 用户打开首页 → 前端请求 /api/hot
2. 后端查缓存 → 未命中则 fetch 上游 JSON → 解析 → 写入缓存 → 返回
3. 前端按平台渲染 HotCard
4. 某平台失败 → 该卡片 error 态，其他正常

## 开发环境代理
- Vite 将 /api 代理到 http://localhost:3001
- 生产：VITE_API_BASE 指向后端域名，或 Nginx 反代

## 数据方案备注
- 主路线：自建 Express 拉取各平台 JSON（0 元）
- 救急：免费第三方热搜 API（不稳定，仅短期）
- 不推荐：微博 OAuth、HTML 爬虫

## 接口 JSON 示例（成功 + 失败）

### ✅ 成功响应（GET /api/hot/weibo）
```json
{
  "source": "weibo",
  "sourceName": "微博热搜",
  "listName": "热搜榜",
  "updatedAt": "2026-06-02T10:30:00.000Z",
  "items": [
    { "rank": 1, "title": "某明星官宣", "heat": "890万", "url": "https://..." },
    { "rank": 2, "title": "科技新品", "heat": "560万", "url": "https://..." }
  ]
}
### ❌ 失败响应（GET /api/hot/weibo）
```json
{
  "source": "weibo",
  "sourceName": "微博热搜",
  "listName": "热搜榜",
  "updatedAt": "2026-06-02T10:35:00.000Z",
  "items": [],
  "error": true,
  "message": "上游接口暂时不可用，请稍后重试"
}
