# 测试脚本说明

本目录包含用于测试活动家平台 API 和功能的脚本。

---

## 📋 核心脚本

### 1. `test-all-apis.sh` ⭐ 推荐使用

**用途**: 统一的 API 可用性验证脚本  
**覆盖**: 21 个核心 API 接口  
**运行**: `./scripts/test-all-apis.sh`

**测试内容**:

- ✅ 认证模块 (2 个): 登录、获取用户信息
- ✅ 活动管理 (4 个): 列表、详情、创建、上传图片
- ✅ 报名管理 (3 个): 列表、通知、批量导入
- ✅ 匹配功能 (12 个): 基础匹配、规则设置、执行与结果

**优势**:

- 自动加载环境变量 (`env/.env.mock`)
- 彩色输出，清晰的测试报告
- 支持多种 HTTP 状态码验证
- 详细的环境信息展示

**示例输出**:

```bash
🧪 活动家平台 - API 可用性验证
测试时间: 2025-10-28 15:08:33
Mock模式: apifox
Token: 7WpWR1HdKZIChw9BM0LQ3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1️⃣  认证模块 (Authentication)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing: 获取当前用户信息
  GET https://m1.apifoxmock.com/...
  ✅ PASS (HTTP 200)

...

总计: 21 个接口
通过: 21
🎉 所有测试通过！
```

---

### 2. `check-env-config.sh`

**用途**: 环境变量诊断工具  
**运行**: `./scripts/check-env-config.sh`

**功能**:

- 验证 `env/.env.mock` 文件是否存在
- 检查所有 Mock URL 配置
- 验证 Mock URL 格式正确性
- 测试接口连接性

**使用场景**: 环境配置问题排查

---

### 3. `test-api-config.ts`

**用途**: 验证 API ID 配置是否正确  
**运行**: `npx tsx scripts/test-api-config.ts`

**功能**:

- 检查 `src/config/apifox-api-ids.ts` 配置
- 验证 API 路径与 API ID 的映射关系
- 查找未配置的 API
- 确保前端能正确找到对应的 Mock 接口

**使用场景**: 添加新 API 后验证配置完整性

**输出示例**:

```
🧪 测试 API 配置...

📊 测试结果: 9 通过, 0 失败

✅ 所有 API 都已配置 API ID

🎉 配置检查完成！
```

---

## 🗑️ 已废弃的脚本

以下脚本功能已被 `test-all-apis.sh` 覆盖，已删除：

- ❌ `test-apifox-mock.sh` - 旧版 API 测试（功能重复）
- ❌ `test-activity-create.sh` - 仅测试创建活动（已包含在统一脚本）
- ❌ `test-create-activity-mock.sh` - 功能重复
- ❌ `test-enrollment-notify.sh` - 仅测试通知（已包含）
- ❌ `test-import-final.sh` - 仅测试导入（已包含）
- ❌ `test-match-result.sh` - 仅测试匹配结果（已包含）
- ❌ `test-notification-api.sh` - 功能重复
- ❌ `test-notification-export.sh` - 功能重复
- ❌ `test-rules-mock.sh` - 功能重复
- ❌ `test-matching-feature.sh` - 匹配功能专项测试（所有 12 个 API 已被 test-all-apis.sh 覆盖）

---

## � 使用指南

### 快速开始

1. **每次开发前验证 API**（推荐）⭐

   ```bash
   ./scripts/test-all-apis.sh
   ```

2. **检查环境配置**

   ```bash
   ./scripts/check-env-config.sh
   ```

3. **验证 API ID 配置**
   ```bash
   npx tsx scripts/test-api-config.ts
   ```

### 添加新的 API 测试

在 `test-all-apis.sh` 中添加新测试：

```bash
test_api \
    "接口名称" \
    "GET/POST" \
    "${VITE_XXX_MOCK_URL}/path?apifoxToken=${VITE_APIFOX_TOKEN}" \
    '{"key":"value"}' \  # POST 数据（GET 为空字符串）
    "200 201"            # 允许的状态码
```

### 环境要求

- **Shell**: Bash 4.0+
- **工具**: `curl`, `grep`, `sed`
- **Node.js**: 18+ (用于 TypeScript 脚本)
- **环境变量**: `env/.env.mock` 必须存在并配置正确

---

## 🎯 最佳实践

1. **开发前运行**: 每次开始开发前运行 `test-all-apis.sh` 确保 API 可用
2. **提交前验证**: Git commit 前运行测试，确保没有破坏现有功能
3. **持续集成**: 在 CI/CD 流程中集成这些测试脚本
4. **问题定位**: 如果测试失败，查看详细的错误信息和响应内容

---

## 📚 相关文档

- **API 文档**: `docs/api_doc/modules/`
- **环境配置**: `env/README.md`
- **API 集成指南**: `docs-private/api-integration/README.md`
- **问题汇总**: `docs-private/api-integration/API测试问题汇总.md`

---

## ❓ 常见问题

### Q1: 测试失败怎么办？

1. 检查 `env/.env.mock` 文件是否存在
2. 验证 Mock URL 和 Token 是否正确
3. 查看错误响应内容，确认是路径问题还是数据格式问题
4. 登录 Apifox 检查接口是否存在

### Q2: 如何添加新模块的测试？

1. 在 `env/.env.mock` 中添加新模块的 Mock URL
2. 在 `test-all-apis.sh` 中添加对应的测试用例
3. 运行测试验证

### Q3: 为什么有些接口使用完整路径，有些使用简化路径？

Apifox Mock 支持两种路径格式：

- **完整路径**: `/api/xxx/...` (如 `/api/auth/me`)
- **简化路径**: `/xxx` 或 `/{id}/xxx` (如 `/login`, `/1/extract-keywords`)

具体使用哪种格式取决于 Apifox 中的接口定义。

---

**最后更新**: 2025-10-28  
**维护者**: 前端开发团队
