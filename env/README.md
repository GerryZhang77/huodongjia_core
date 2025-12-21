# 环境变量配置说明

## 📁 目录结构

```
env/
├── .env.development   # 本地开发（MSW Mock）⭐ 推荐
├── .env.staging       # 预发布环境（真实后端 + Vercel 代理）
├── .env.production    # 生产环境
├── .env.test          # 单元测试
└── .env.example       # 模板文件（仅供参考）
```

## 🚀 快速开始

### 1. 本地开发（推荐）

```bash
npm run dev
```

- 加载配置：`env/.env.development`
- Mock 方式：MSW (Mock Service Worker)
- 特点：开箱即用，无需启动后端

### 2. 连接真实后端（联调/预发布）

```bash
npm run dev:staging
```

- 加载配置：`env/.env.staging`
- 连接后端：`http://47.92.0.104:12345`
- 特点：用于与后端联调测试

### 3. 生产构建

```bash
npm run build
```

- 加载配置：`env/.env.production`
- 连接后端：生产环境 API

### 4. 预发布构建（部署到 Vercel）

```bash
npm run build:staging
```

- 加载配置：`env/.env.staging`
- 通过 Vercel Serverless Function 代理到真实后端

## 📝 环境变量说明

### Mock 模式对照表

| 环境     | `VITE_USE_MOCK` | 说明          | 命令                  |
| -------- | --------------- | ------------- | --------------------- |
| 本地开发 | `msw`           | MSW 本地 Mock | `npm run dev`         |
| 预发布   | `false`         | 连接真实后端  | `npm run dev:staging` |
| 生产     | `false`         | 连接生产 API  | `npm run build`       |
| 测试     | `msw`           | MSW Mock      | `npm run dev:test`    |

### 关键环境变量

| 变量名                 | 说明                     | 示例值                  |
| ---------------------- | ------------------------ | ----------------------- |
| `VITE_USE_MOCK`        | Mock 模式控制            | `msw` / `false`         |
| `VITE_API_BASE_URL`    | 后端 API 地址            | `http://localhost:3001` |
| `VITE_DEMO_MODE`       | 演示模式（显示演示数据） | `true` / `false`        |
| `VITE_PRODUCTION_MODE` | 生产模式标识             | `true` / `false`        |

## ⚙️ 工作原理

### Vite 环境变量加载

```bash
# npm run dev
vite --mode development
# 加载 env/.env.development

# npm run dev:staging
vite --mode staging
# 加载 env/.env.staging

# npm run build
vite build --mode production
# 加载 env/.env.production
```

### Vercel 部署流程

1. 前端代码请求相对路径：`/api/auth/login`
2. Vercel rewrites 拦截：`/api/* -> /serverless/proxy`
3. Serverless Function 转发到真实后端
4. 返回响应给浏览器（HTTPS）

## 🔧 自定义配置

### 方法 1：创建本地覆盖文件

```bash
# 创建 .env.development.local（不会被 Git 跟踪）
cp env/.env.development env/.env.development.local
# 修改后的配置会覆盖原配置
```

### 方法 2：添加新环境

1. 创建新配置文件：`env/.env.custom`
2. 添加 npm script：
   ```json
   "dev:custom": "vite --mode custom"
   ```

## ⚠️ 注意事项

1. **修改环境变量后必须重启** 开发服务器
2. `.env.*.local` 文件不会被 Git 跟踪，适合存放敏感信息
3. 敏感信息（如 API Key）应通过 Vercel 环境变量配置，不要提交到代码库
