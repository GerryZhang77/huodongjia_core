# MSW Mock 架构说明

> 本项目使用 **MSW (Mock Service Worker)** 进行本地 Mock，实现开发与后端的解耦。

---

## 📁 目录结构

```
src/mocks/
├── browser.ts              # MSW Worker 配置（浏览器环境）
├── data/                   # Mock 数据层
│   ├── index.ts            # 统一导出
│   ├── users.ts            # 用户数据 + 认证辅助函数
│   ├── activities.ts       # 活动数据
│   ├── enrollments.ts      # 报名数据
│   └── matching.ts         # 匹配规则/结果数据
└── handlers/               # API 处理层
    ├── index.ts            # 统一导出
    ├── auth.handlers.ts    # 认证模块 API
    ├── events.handlers.ts  # 活动模块 API
    ├── enrollment.handlers.ts  # 报名模块 API
    └── matching.handlers.ts    # 匹配模块 API
```

---

## 🚀 使用方式

### 启动开发 (MSW Mock)

```bash
npm run dev
```

默认使用 MSW 模式，所有 API 请求被 Service Worker 拦截，返回 Mock 数据。

### 切换到真实后端

修改 `env/.env.development`:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:3001
```

然后重启开发服务器。

---

## 📝 测试账号

| 账号类型 | 用户名 | 密码     | 说明         |
| -------- | ------ | -------- | ------------ |
| 商家     | org1   | 123456   | 商家测试账号 |
| 管理员   | admin1 | admin123 | 管理员账号   |
| 参与者   | user1  | 123456   | 参与者账号   |

手机号登录验证码固定为: `123456`

---

## 🔧 如何添加新的 Mock API

### 1. 添加数据 (src/mocks/data/)

```typescript
// src/mocks/data/myModule.ts
export interface MyData {
  id: string;
  name: string;
}

export const mockMyData: MyData[] = [
  { id: "1", name: "Item 1" },
  { id: "2", name: "Item 2" },
];
```

### 2. 添加 Handler (src/mocks/handlers/)

```typescript
// src/mocks/handlers/myModule.handlers.ts
import { http, HttpResponse, delay } from "msw";
import { mockMyData } from "../data/myModule";

export const myModuleHandlers = [
  http.get("/api/my-data", async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: mockMyData,
    });
  }),
];
```

### 3. 注册 Handler (src/mocks/handlers/index.ts)

```typescript
import { myModuleHandlers } from "./myModule.handlers";

export const handlers = [
  ...authHandlers,
  ...activityHandlers,
  ...enrollmentHandlers,
  ...matchingHandlers,
  ...myModuleHandlers, // 添加这行
];
```

---

## 📖 MSW 工作原理

```
浏览器发起请求
     ↓
Service Worker 拦截
     ↓
匹配 handlers 中的路由规则
     ↓
返回 Mock 响应 (或放行到真实服务器)
     ↓
业务代码收到响应
```

**优势**:

- ✅ 真实的网络请求，在 DevTools Network 面板可见
- ✅ 无需修改业务代码，切换 Mock/真实后端只需改环境变量
- ✅ 支持延迟模拟，更接近真实场景
- ✅ 支持条件响应（根据请求参数返回不同数据）

---

## 🔗 相关文档

- [MSW 官方文档](https://mswjs.io/)
- [项目 API 规范](/docs/api_doc/modules/)
