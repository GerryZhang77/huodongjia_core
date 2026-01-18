# C端用户 API 文档

> **版本**: 1.0.0  
> **更新日期**: 2026-01-18  
> **OpenAPI 版本**: 3.0.3

## 概览

本目录包含活动家平台 C 端（用户端）的 API 接口文档，采用 OpenAPI 3.0.3 规范。

## 文档索引

| 模块     | 文件                                                                 | 接口数 | 说明                              |
| -------- | -------------------------------------------------------------------- | ------ | --------------------------------- |
| 用户资料 | [user-profile.openapi.json](./user-profile.openapi.json)             | 4      | 获取/更新资料、上传头像、统计数据 |
| 用户活动 | [user-activities.openapi.json](./user-activities.openapi.json)       | 5      | 我的活动、推荐、搜索、分类、详情  |
| 收藏管理 | [user-favorites.openapi.json](./user-favorites.openapi.json)         | 4      | 获取收藏、添加/取消收藏、切换收藏 |
| 通知消息 | [user-notifications.openapi.json](./user-notifications.openapi.json) | 3      | 获取通知、标记已读、全部已读      |
| 账号设置 | [user-account.openapi.json](./user-account.openapi.json)             | 2      | 修改密码、删除账号                |

**合计: 18 个 API 接口**

## 认证方式

所有需要认证的接口使用 **JWT Bearer Token** 认证：

```http
Authorization: Bearer <your_jwt_token>
```

## 基础路径

```
/api
```

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "code": "ERROR_CODE"
}
```

### 常见错误码

| HTTP 状态码 | 错误码         | 说明                     |
| ----------- | -------------- | ------------------------ |
| 401         | UNAUTHORIZED   | 未授权，Token 无效或过期 |
| 403         | FORBIDDEN      | 无权限访问               |
| 404         | NOT_FOUND      | 资源不存在               |
| 400         | BAD_REQUEST    | 请求参数错误             |
| 500         | INTERNAL_ERROR | 服务器内部错误           |

## 代码来源映射

确保文档与代码保持一致的来源映射：

| 文档内容             | 代码来源                              |
| -------------------- | ------------------------------------- |
| 类型定义 (schemas)   | `src/services/userApi.ts`             |
| Mock 处理 (handlers) | `src/mocks/handlers/user.handlers.ts` |
| Hooks 调用           | `src/features/user/*/hooks/`          |
| Mock 数据            | `src/mocks/data/`                     |

## 使用方式

### 1. 导入到 Apifox / Postman

直接导入 `.openapi.json` 文件即可生成接口文档和测试用例。

### 2. 使用 Swagger UI 预览

```bash
# 安装 swagger-ui-express (可选)
npm install swagger-ui-express

# 或使用在线工具
# https://editor.swagger.io/
```

### 3. 代码生成

可使用 OpenAPI Generator 生成客户端代码：

```bash
npx @openapitools/openapi-generator-cli generate \
  -i docs/api_doc/c-end/user-profile.openapi.json \
  -g typescript-axios \
  -o generated/api
```

## 更新日志

### v1.0.0 (2026-01-18)

- 初始版本
- 包含用户资料、活动、收藏、通知、账号共 18 个接口
- 从 `src/services/userApi.ts` 和 `src/mocks/handlers/user.handlers.ts` 提取
