# HuoDongJia 活动家平台 - Claude 项目配置

本文档为 Claude Code 提供项目上下文，帮助 AI 助手更好地理解项目结构和开发需求。

---

## 📋 项目概览

**项目名称**: HuoDongJia (活动家) 智能连接平台
**项目类型**: 社交活动管理 + AI 智能匹配平台
**架构**: B端商家 + C端用户双端设计

### 技术栈

**前端** (本仓库):

- React 19 + TypeScript 5 + Vite 6
- TailwindCSS v4 (CSS-first 配置)
- Zustand 5 (状态管理) + TanStack Query 5 (服务端状态)
- MSW 2.x (Mock Service Worker)

**后端** (独立仓库):

- 位置: `/Users/guangmingpeng/Desktop/event-club/Eventclub-backend`
- 分支: `pgm/backend_dev` ⚠️ 已切换新分支
- Express.js + TypeScript + Supabase (双数据库架构)
- Xunfei Spark LLM (AI 匹配规则生成)

---

## 🗂️ 项目记忆文档

详细的项目上下文存储在 `docs-private/claude-memory/` 目录下：

### 核心文档

1. **[MEMORY.md](../docs-private/claude-memory/MEMORY.md)** - 记忆索引文件
2. **[project_overview.md](../docs-private/claude-memory/project_overview.md)** - 项目定位、技术栈、双端架构
3. **[project_backend.md](../docs-private/claude-memory/project_backend.md)** - 后端服务详情 (更新: 2026-04-04)
4. **[project_api_alignment.md](../docs-private/claude-memory/project_api_alignment.md)** - API 对齐状态 (更新: 2026-04-04)
5. **[project_integration_testing.md](../docs-private/claude-memory/project_integration_testing.md)** - 集成测试指南 (新增: 2026-04-04)
6. **[user_profile.md](../docs-private/claude-memory/user_profile.md)** - 开发者信息
7. **[reference_docs.md](../docs-private/claude-memory/reference_docs.md)** - 文档索引
8. **[reference_env.md](../docs-private/claude-memory/reference_env.md)** - 环境配置速查

---

## 🚀 快速启动

### 前端开发模式

```bash
# MSW Mock 模式（默认，无需后端）
npm run dev

# 连接本地后端（需后端运行在 3006 端口）
npm run dev:local

# 连接远程测试服务器
npm run dev:staging
```

### 后端启动（联调时需要）

```bash
cd /Users/guangmingpeng/Desktop/event-club/Eventclub-backend
git checkout pgm/backend_dev  # 确保在正确分支
npm run dev
# → Express API: http://localhost:3006
# → 健康检查: http://localhost:3006/api/health
```

---

## 🔧 关键配置信息

### 端口配置

- **前端开发服务器**: 5173 (Vite)
- **后端 Express API**: 3006 ⚠️ 注意不是 3001

### 环境变量文件

- `env/.env.development` - MSW Mock 模式
- `env/.env.local` - 本地后端联调模式
- `env/.env.staging` - 远程测试环境
- `env/.env.production` - 生产环境

### 数据库

- **类型**: Supabase (PostgreSQL) - 双数据库架构
- **BASE_DATABASE**: 主业务数据（用户、活动、报名）
- **CHAT_DATABASE**: AI/匹配数据（关键词、词嵌入、匹配分数）
- **认证**: JWT (7天有效期，密钥: Eventclub)

---

## 📡 API 对齐状态 (更新: 2026-04-04)

### 🔴 关键阻塞问题

**必须修复才能开始联调**:

1. **登录接口不匹配**: 前端调用 `/api/auth/login`，后端分为 `/login-account` 和 `/login-phone`
2. **报名路径不同**: 前端用 `/api/events/:id/enrollments/*`，后端用 `/api/enrollments/:event_id/*`
3. **匹配路径前缀**: 前端用 `/api/match/*`，后端用 `/api/matching/*`

### ⚠️ 缺失接口

- `/api/auth/logout` - 登出接口
- 短信验证码相关接口（注册/重置密码流程）
- 报名通知发送接口
- 多个匹配高级功能接口

### ✅ 完全对齐模块

- **活动管理**: 所有 CRUD 操作完全匹配
- **基础匹配**: 核心流程存在，仅路径前缀不同

### 快速修复方案

**后端改动** (推荐，3个文件):
1. 添加 `/api/auth/login` 统一入口
2. 添加 `/api/auth/logout` 接口
3. 将 `/api/matching` 改为 `/api/match`

**前端改动** (1个文件):
1. 适配报名接口路径到 `/api/enrollments/:event_id`

详细分析见: `docs-private/backend-integration-analysis.md`

---

## 🧪 测试账号（MSW Mock）

```
商家账号:   org1 / 123456
管理员:     admin1 / admin123
用户:       user1 / 123456
短信验证码: 123456 (固定)
```

---

## 📚 重要文档索引

### 开发规范

- `.github/copilot-instructions.md` - 项目总览、命名规范、设计系统
- `docs-private/architecture/` - 架构设计文档（01-07）
- `docs-private/api-integration/` - API 集成文档

### 联调相关

- `docs-private/backend-integration-analysis.md` - **前后端 API 对齐完整分析** (新增: 2026-04-04)
- `docs-private/integration-testing-plan.md` - **集成测试详细计划** (新增: 2026-04-04)
- `docs-private/claude-memory/` - Claude 项目记忆文档

### 设计系统

- `docs-private/design-system/设计系统快速参考.md` - 设计规范速查

---

## 🎯 当前开发重点

1. **前后端联调准备** ⚠️ 需要修复关键 API 路径不匹配问题
2. **后端快速修复** - 添加统一登录接口、登出接口、调整匹配路由前缀
3. **前端适配** - 调整报名接口路径以匹配后端
4. **分模块测试** - 按认证 → 活动 → 报名 → 匹配顺序测试
5. **Taro 跨端迁移** - 新组件优先使用 Taro 兼容写法

---

## 🔗 相关仓库

- **前端**: 当前仓库 (`huodongjia_core`)
- **后端**: `/Users/guangmingpeng/Desktop/event-club/Eventclub-backend`
- **Git 远程**:
  - `origin` - GerryZhang77/huodongjia_core (开发协作)
  - `guangming` - guangmingpeng/huodongjia_core (生产部署)

---

## 💡 开发提示

1. **优先查阅 memory 文档**: 遇到问题先查看 `docs-private/claude-memory/` 下的相关文档
2. **遵循设计系统**: 使用 TailwindCSS 类名，主色 #3B82F6，辅助色 #F97316
3. **Feature-Based 架构**: 新功能放在 `src/features/` 对应模块下
4. **API 调用**: 统一通过 `src/services/` 层，不直接使用 axios
5. **Mock 数据**: 存放在 `src/mocks/data/`，handler 在 `src/mocks/handlers/`

---

**文档更新时间**: 2026-04-04
**后端分支**: pgm/backend_dev
**前端分支**: refactor/tailwind-v3
**Claude Memory 版本**: v1.1 (后端集成分析完成)
