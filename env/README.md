# 环境变量配置说明

## 📁 目录结构

```
env/
├── .env.mock        # Apifox Mock 模式（主要用于开发）⭐
├── .env.local       # 本地真实后端模式
├── .env.test        # MSW 测试模式
├── .env.production  # 生产环境
└── .env.example     # 模板文件（仅供参考）
```

## 🚀 快速开始

### 1. 使用 Apifox Mock（推荐）

```bash
npm run dev:mock
```

自动加载：`env/.env.mock`

### 2. 使用本地真实后端

```bash
npm run dev
```

自动加载：`env/.env.local`

### 3. 使用 MSW 测试模式

```bash
npm run dev:test
```

自动加载：`env/.env.test`

### 4. 生产构建

```bash
npm run build
```

自动加载：`env/.env.production`

## 📝 配置说明

### Mock 模式对照表

| 模式     | 环境变量值             | 说明                  | 配置文件              |
| -------- | ---------------------- | --------------------- | --------------------- |
| Apifox   | `VITE_USE_MOCK=apifox` | 使用 Apifox 云端 Mock | `env/.env.mock`       |
| 真实后端 | `VITE_USE_MOCK=false`  | 连接本地/远程后端服务 | `env/.env.local`      |
| MSW      | `VITE_USE_MOCK=msw`    | 使用 MSW 本地 Mock    | `env/.env.test`       |
| 生产环境 | `VITE_USE_MOCK=false`  | 连接生产环境 API      | `env/.env.production` |

### 关键环境变量

| 变量名                    | 说明                | 必填    | 示例                               |
| ------------------------- | ------------------- | ------- | ---------------------------------- |
| `VITE_USE_MOCK`           | Mock 模式控制       | ✅ 是   | `apifox` / `false` / `msw`         |
| `VITE_API_BASE_URL`       | 真实后端地址        | ✅ 是   | `http://localhost:3001`            |
| `VITE_AUTH_MOCK_URL`      | 认证模块 Mock URL   | Mock 时 | `https://m1.apifoxmock.com/m1/...` |
| `VITE_EVENT_MOCK_URL`     | 活动模块 Mock URL   | Mock 时 | `https://m1.apifoxmock.com/m1/...` |
| `VITE_MATCHING_MOCK_URL`  | 匹配模块 Mock URL   | Mock 时 | `https://m1.apifoxmock.com/m1/...` |
| `VITE_EMBEDDING_MOCK_URL` | 词嵌入模块 Mock URL | Mock 时 | `https://m1.apifoxmock.com/m1/...` |
| `VITE_APIFOX_TOKEN`       | Apifox 访问令牌     | Mock 时 | `7WpWR1HdKZIChw9BM0LQ3`            |

## 🔧 自定义配置

### 方法 1: 修改现有配置文件

直接编辑 `env/` 目录下的对应文件。

### 方法 2: 创建新配置文件

1. 复制 `env/.env.example` 为新文件
2. 修改 `package.json` 添加对应的启动命令
3. 使用新命令启动

示例：

```json
{
  "scripts": {
    "dev:custom": "vite --mode custom --envDir env"
  }
}
```

## ⚙️ 工作原理

### 命令与配置文件映射

启动命令通过 `--mode` 参数指定加载哪个配置文件：

```bash
# npm run dev:mock
vite --mode mock --envDir env
# → 加载 env/.env.mock

# npm run dev
vite --mode local --envDir env
# → 加载 env/.env.local

# npm run dev:test
vite --mode test --envDir env
# → 加载 env/.env.test
```

### Vite 环境变量加载规则

1. 优先加载 `env/.env.[mode]` 文件
2. 只有 `VITE_` 开头的变量会暴露给客户端代码
3. 通过 `import.meta.env.VITE_XXX` 访问

## 🔍 验证配置

### 1. 检查当前使用的配置

启动开发服务器后，查看控制台输出：

```
🔧 Vite 配置信息:
   模式: mock
   Mock 模式: apifox
   代理状态: ❌ 禁用
```

### 2. 检查 API 请求

打开浏览器控制台 → Network 标签，查看 API 请求地址：

- **Apifox Mock**: `https://m1.apifoxmock.com/m1/...`
- **真实后端**: `http://localhost:3001/api/...`

### 3. 运行配置测试

```bash
# 测试 API 配置
npx tsx scripts/test-api-config.ts

# 测试 Apifox Mock 接口
./scripts/test-apifox-mock.sh
```

## ⚠️ 注意事项

### 1. 不要提交敏感信息

- ✅ 提交：`env/.env.example`（模板文件）
- ❌ 不提交：包含真实 Token/密钥的配置文件

建议在 `.gitignore` 中添加：

```
# 环境变量（除了示例文件）
env/.env.*
!env/.env.example
```

### 2. 环境变量优先级

如果同时存在多个配置源，优先级为：

1. 命令行参数
2. `.env.[mode]` 文件
3. `.env` 文件（如果存在）

### 3. 修改配置后需重启

修改 `env/` 目录下的文件后，需要重启开发服务器才能生效。

## 📚 相关文档

- [API 集成指南](../../docs-private/api-integration/README.md)
- [开发规范](../../docs-private/architecture/06-开发规范与流程.md)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
