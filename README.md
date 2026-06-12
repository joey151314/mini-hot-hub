# 迷你今日热榜

聚合微博、知乎、B站等平台热点资讯的学习项目。

## 本地启动说明

### 安装依赖

```bash
cd client && npm install
cd ../server && npm install
```

### 启动服务

```bash
# 终端 1：启动后端服务（端口 3001）
cd server && npm run dev

# 终端 2：启动前端服务（端口 5173）
cd client && npm run dev
```

### 技术栈

- 前端：React + TypeScript + Vite
- 后端：Node.js + Express

## 注意事项

- 本项目仅供学习研究，非商用
- 数据来源于各平台公开信息

## 📊 数据来源说明

### 微博热搜
- 接口地址： `https://weibo.com/ajax/side/hotSearch`
- 解析字段：从 data.realtime 数组提取 word（标题）、num（热度值）
- 热度格式化：根据数值大小显示为“xxx.x万”或“xxx.x亿”

### 知乎热榜
- 接口地址： `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50`
- 解析字段：从 data 数组的 target 对象中提取 title（标题）、detail_text（热度文本）
- 链接补全：自动补全为 `https://www.zhihu.com/...`  格式

### B站热搜
- 接口地址： `https://api.bilibili.com/x/web-interface/search/square?limit=50`
- 解析字段：从 data.trending.list 数组提取 show_name（标题）、heat_score（热度值）
- 热度格式化：heat_score 除以 10000 后保留一位小数，显示为“xxx.x万”

## ⏱️ 更新频率
- 缓存 TTL 默认 600 秒（10 分钟），可通过环境变量 CACHE_TTL 调整。
- 同一接口在缓存有效期内不会重复请求，减少对上游服务的压力。

## 📜 免责声明
- 本项目为个人学习项目，非商业用途。
- 所有数据均来自各平台公开接口，版权归原平台所有。
- 数据仅供参考，不保证完全准确和实时。
- 如有侵权或违规，请联系 your-email@example.com。
