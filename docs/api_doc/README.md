# 活动家平台 API 文档

## 🎯 API 模块说明

### 1️⃣ 认证模块 (`auth.openapi.json`)

**基础路径**: `/api/auth`

**功能**: 用户认证、注册、登录等

**设计特点**: 采用**分角色登录端点**设计（方案 3），不同角色使用独立的登录 URL，便于前端路由管理和用户体验优化。

**核心接口**:

**登录接口（三种角色）**:

- `POST /api/auth/login` - 普通用户登录
- `POST /api/auth/organizer/login` - 商家登录
- `POST /api/auth/admin/login` - 超级管理员登录

**注册接口**:

- `POST /api/auth/register` - 普通用户注册
- `POST /api/auth/organizer/register` - 商家注册

**通用接口**:

- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/password` - 修改密码
- `POST /api/auth/logout` - 登出

---

### 2️⃣ 活动管理模块 (`events.openapi.json`)

**基础路径**: `/api/events`

**功能**: 活动的创建、编辑、查询、报名管理

**核心接口**:

- `GET /api/events` - 获取活动列表
- `POST /api/events` - 创建活动
- `GET /api/events/{eventId}` - 获取活动详情
- `PUT /api/events/{eventId}` - 修改活动
- `DELETE /api/events/{eventId}` - 删除活动
- `GET /api/events/my` - 获取我创建的活动
- `GET /api/events/{eventId}/participants` - 获取报名信息
- `GET /api/events/{eventId}/match-rules` - 提取匹配规则
- `POST /api/events/extract-headers` - 提取 Excel 表头

---

### 3️⃣ 匹配模块 (`matching.openapi.json`)

**基础路径**: `/api/matching`

**功能**: 智能匹配算法

**核心接口**:

- `GET /api/matching/{eventId}/do-match` - 执行智能匹配
- `GET /api/matching/{eventId}/extract-keywords` - 提取用户关键词
- `GET /api/matching/{eventId}/result` - 获取匹配结果

---

### 4️⃣ 词嵌入模块 (`embedding.openapi.json`)

**基础路径**: `/api/embedding`

**功能**: 词嵌入计算和相似度分析

**核心接口**:

- `POST /api/embedding/get-embedding` - 获取词向量
- `GET /api/embedding/{eventId}/calculate` - 计算词嵌入
- `GET /api/embedding/{eventId}/similarity` - 计算相似度
- `POST /api/embedding/{eventId}/score` - 计算综合分数

---

## 🔧 使用方式

### 方式 1: 导入到 Apifox（推荐）

1. 打开 Apifox
2. 创建新项目或选择现有项目
3. 点击 **导入** → **OpenAPI**
4. 选择对应的模块文件（或全部导入）
5. 确认导入

**分模块导入的优势**:

- ✅ 清晰的模块划分
- ✅ 便于维护和更新
- ✅ 团队协作更高效

### 方式 2: 生成客户端代码

使用 [OpenAPI Generator](https://openapi-generator.tech/) 生成各种语言的客户端 SDK：

```bash
# 生成 TypeScript Axios 客户端
openapi-generator-cli generate \
  -i modules/auth.openapi.json \
  -g typescript-axios \
  -o ./generated/auth-client
```

---

## 🌐 环境配置

### Apifox 环境变量建议

**开发环境（使用 Apifox Mock）**:

```json
{
  "baseUrl": "https://mock.apifox.com/m1/你的项目ID",
  "Authorization": "Bearer test-token-123"
}
```

**本地测试环境**:

```json
{
  "baseUrl": "http://localhost:3000",
  "Authorization": "Bearer {{dynamicToken}}"
}
```

**生产环境**:

```json
{
  "baseUrl": "https://api.huodongjia.com",
  "Authorization": "Bearer {{prodToken}}"
}
```

---

## 📝 API 设计规范

### RESTful 规范

- ✅ 使用名词复数: `/api/events` 而非 `/api/event`
- ✅ 使用 HTTP 方法表达操作:
  - `GET` - 查询
  - `POST` - 创建
  - `PUT` - 全量更新
  - `PATCH` - 部分更新
  - `DELETE` - 删除
- ✅ 使用路径参数: `/api/events/{eventId}` 而非 `/api/events?id=xxx`

### 响应格式

**成功响应**:

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"  // 可选
}
```

**错误响应**:

```json
{
  "success": false,
  "message": "错误描述",
  "code": "ERROR_CODE" // 可选
}
```

### 认证方式

所有需要认证的接口使用 **Bearer Token**:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔄 版本历史

### v1.0.0 (2025-10-26)

✅ **重构完成**:

- **采用：分角色登录端点设计**
  - 普通用户: `POST /api/auth/login`
  - 商家: `POST /api/auth/organizer/login`
  - 超管: `POST /api/auth/admin/login`
- 规范化所有 API 路径，统一使用 `/api/{module}` 前缀
- 修复路径参数硬编码问题（使用 `{eventId}` 替代硬编码 UUID）
- 添加完整的 OpenAPI 3.0 schemas 定义
- 保留所有原始返回数据示例

❌ **修复的问题**:

1. **路径冲突**: `POST /login-password` 和 `POST /api/auth/login-password` 重复 → 统一为 `POST /api/auth/{role}/login`
2. **硬编码 UUID**: `/detail/7ea8f4b1-8b70-4356-a39a-e43e81ed597b` → `/api/events/{eventId}`
3. **缺失路径前缀**: `/extract-form-header` → `/api/events/extract-headers`
4. **错误路径格式**: `/localhost:5000/get_embedding` → `/api/embedding/get-embedding`

📦 **备份说明**:

- 旧版本文档已备份至 `api-archive/` 目录
- 备份文件: `登录模块.openapi.json`, `活动管理模块.openapi.json`, `匹配模块.openapi.json`, `词嵌入模块.openapi.json`

---

如需修改 API 文档，请遵循以下步骤：

1. **修改对应的模块文件** (例如 `modules/auth.openapi.json`)
2. **验证 OpenAPI 格式** (使用 Swagger Editor 或 Apifox)
3. **更新此 README** (如有新增接口)
4. **提交 Git Commit** (使用规范的提交信息)

---

## ❓ 常见问题

### Q1: 路径参数 `{eventId}` 需要在 Apifox 中创建环境变量吗？

**A**: 不需要。Apifox 会自动识别路径参数（花括号包裹的变量），您在调用时直接输入具体的 UUID 值即可。例如：

- API 定义: `GET /api/events/{eventId}`
- 实际调用: `GET /api/events/7ea8f4b1-8b70-4356-a39a-e43e81ed597b`

### Q2: 为什么要分 3 个登录端点而不是一个统一的登录接口？

**A**: 采用分角色登录端点（方案 3）有以下优势：

**前端路由优势**:

- 用户访问 `/login` → 调用 `POST /api/auth/login`
- 商家访问 `/organizer/login` → 调用 `POST /api/auth/organizer/login`
- 超管访问 `/admin/login` → 调用 `POST /api/auth/admin/login`

**用户体验优势**:

- 不同角色的登录页面可以有不同的 UI 设计
- 商家登录页可以展示"创建活动"引导
- 用户登录页可以展示"浏览活动"推荐

**安全性优势**:

- 超管登录入口不对外公开，降低攻击风险
- 可以针对不同角色设置不同的安全策略（如验证码强度）

**开发维护优势**:

- API 结构清晰，职责明确
- 便于后期扩展（如第三方登录）
- 减少前后端沟通成本

### Q3: 如何合并多个模块为一个完整文档？

**A**: 可以使用工具（如 `swagger-cli`）合并，或者手动复制 `paths` 到同一个文件中。

```bash
# 使用 swagger-cli 合并
swagger-cli bundle modules/auth.openapi.json -o complete-api.json
```

**建议**: 保持模块化组织，按需导入到 Apifox 更灵活。

### Q4: Apifox Mock URL 应该配置在哪里？

**A**: **不要**在 OpenAPI 文档的 `servers` 字段中配置 Mock URL。正确做法：

1. OpenAPI 文档的 `servers` 只配置真实的后端服务器地址
2. Apifox Mock URL 在 Apifox 的**环境配置**中设置
3. 切换环境即可在真实 API 和 Mock 之间切换

**示例**:

```json
// ✅ 正确: OpenAPI 文档中
"servers": [
  { "url": "http://localhost:3000", "description": "本地开发" },
  { "url": "https://api.huodongjia.com", "description": "生产环境" }
]

// ✅ 正确: Apifox 环境配置中
{
  "name": "Mock环境",
  "baseUrl": "https://mock.apifox.com/m1/你的项目ID"
}
```

### Q5: 词嵌入模块的 Python 服务如何配置？

**A**: 词嵌入模块包含两个服务地址：

- `http://localhost:3000` - Node.js 主服务器（转发请求）
- `http://localhost:5000` - Python 词嵌入服务（内部调用）

**生产环境部署建议**:

- Python 服务部署为内网微服务
- Node.js 服务作为网关统一对外暴露 API
- 前端只需要调用 `https://api.huodongjia.com/api/embedding/*`

---
