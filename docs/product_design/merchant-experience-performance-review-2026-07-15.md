# 活动家商家端体验与性能审查实施记录

日期：2026-07-15
范围：活动列表、活动详情、报名管理、匹配配置/结果、活动表单、通知、用户与个人资料
测试活动：`cba35223-b422-45dd-94d9-012d6627257b`

## 结论

本轮已经完成前端、后端与真实页面流程的实现和回归。首次自动匹配直接生成可编辑的 `draft`，不克隆任何结果；只有已发布版本需要再次修改时，才从该 `published` 版本创建一个新的调整草稿。

共享 Supabase 的 `20260715_complete_match_adjustment_drafts.sql` 已由用户执行，并完成迁移后回归。测试活动当前保留 `published v1`（match status 40），同时存在来源指向 40 的未发布 `draft v2`（match status 41）；本轮没有发布 v2。

## 1. 报名图片缓存

### 原因与调用链

旧流程由资料抽屉挂载时临时请求图片列表，再逐张请求受保护内容并创建 Object URL；抽屉卸载时 Blob/Object URL 生命周期结束，重新打开就重复走远端存储下载。图片不是公开地址，也没有需要反复生成的签名 URL，实际链路是：

```text
报名参与记录
  -> GET /api/enrollments/:eventId/:participantId/images
  -> 返回不含 storage_path 的安全元数据
  -> GET /api/enrollments/:eventId/:participantId/images/:assetId/content
  -> 后端校验 JWT、商家身份、活动归属、图片归属
  -> Supabase private bucket download
  -> 授权响应 Blob
  -> Object URL
  -> <img>
```

性能慢的直接证据是同一真实图片首次读取耗时约 1.6 秒，另一张约 3.6 秒；旧实现会在每次资料抽屉挂载时重复支付这段远端存储时间。

### 已实施策略

| 层级 | 策略 | 安全/失效边界 |
| --- | --- | --- |
| React Query 元数据 | key：`merchant/protected-enrollment-images/{userId}/{eventId}/{participantId}/metadata`；`staleTime=10m`，`gcTime=20m` | key 包含当前登录主体，避免跨账号命中 |
| React Query Blob | 每个 asset 独立 key；`staleTime=10m`，`gcTime=20m` | 401、退出登录、切换账号时清理 |
| Object URL | 进程内 LRU 风格缓存；最多 80 个，空闲 20 分钟回收 | 不写 localStorage/IndexedDB，不跨标签或登录会话持久化 |
| HTTP | 稳定 ETag；`Cache-Control: private, no-cache, must-revalidate`；`Vary: Authorization` | 每次复用前重新授权，禁止 shared/public cache |
| 预取 | 仅 `imageCount > 0` 的报名卡片在 pointer enter/focus 时预取 | 不对整页所有图片盲目下载 |

认证和活动归属检查发生在比较 `If-None-Match` 之前，因此未授权请求即使持有正确 ETag 也只能得到 401，不能借 304 探测受保护资源。

### 实测验收

- 测试活动本身 159 名参与人、图片数为 0；另选同一商家有真实图片的活动进行验证。
- 元数据 200，2 个图片资源。
- 图片内容 200，`Content-Type: image/jpeg`，稳定 ETag 存在。
- 携带 ETag 的已授权复验返回 304。
- 携带相同 ETag 但不携带身份的请求返回 401，而不是 304。
- 首次打开资料：1 个元数据请求 + 2 个内容请求。
- 关闭后再次打开：0 个图片请求。
- 离开报名路由使组件卸载，再返回并打开：0 个图片请求。

推荐方案即当前实现。备选方案是短效签名 URL + 浏览器私有缓存，但 URL 轮换会降低命中率，泄露后在过期前可被直接读取，也不如当前逐次授权代理适合商家端受保护报名资料。

## 2. 匹配配置页面与结果调整

### 信息架构

桌面与移动端统一为五步主流程：

```text
┌──────────────── MerchantLayout ────────────────┐
│ 选择参与人 → 设置规则 → 预览/校验 → 执行匹配 → 查看结果 │
├───────────────────────────────────────────────┤
│ 当前步骤的唯一主任务                            │
│                                               │
│ 参与人：按报名类型确认、进入报名管理             │
│ 规则：字段、方向、权重、人数约束                 │
│ 校验：人数/字段覆盖/硬规则诊断                   │
│ 执行：进度、最小化                              │
│ 结果：版本状态、检索、编辑/锁定、校验、发布       │
├───────────────────────────────────────────────┤
│ 上一步                                  下一步 │
└───────────────────────────────────────────────┘
```

移动端五个短标签等宽展示，不再强制 650px 横向滚动；桌面端显示完整步骤名。商家侧栏在桌面持续可见，移动端保留底部导航。

### 正确状态机

首次匹配：

```text
设置规则 -> 预检 -> 执行 -> completed + draft
                         -> 人工调整/锁定
                         -> 冲突校验
                         -> 发布 -> published
```

已发布后再次调整：

```text
查看 published
  -> 创建调整草稿
  -> 克隆该 published 的规则快照、best_matches、scores
  -> 新版本 completed + draft（幂等复用同一来源的未发布草稿）
  -> 增删/替换/排序/锁定
  -> 冲突校验
  -> 保存草稿
  -> 发布新版本
  -> 旧 published 标记 superseded
```

克隆只用于保护已经发布、参与者正在使用的版本；首次匹配没有已发布源，绝不克隆。

迁移后回归还识别并处理了旧结果兼容：历史 v1 实际保存 Top 5，但旧规则快照仍记录默认上限 3。创建/复用调整草稿时，后端会把**克隆草稿**的快照上限提升到已发布结果实际最大人数，而不会批量删除商家已经发布的匹配对象。该兼容只作用于有 `source_match_status_id` 的克隆草稿，不改变首次匹配或全新重跑的配置。

### 入口与能力

- 当前结果是 `published`：结果页底部显示“创建调整草稿”。
- 当前结果是 `draft`：每个用户结果可进入调整，支持候选搜索、增删、替换、排序和锁定；底部显示“校验草稿 / 发布结果”。
- 活动列表“已匹配”现在可点击，直接进入匹配结果，而不是无行为状态按钮。
- 历史 API 当前只返回版本元数据时，不再展示会打开空白内容的“查看详情”；将来返回完整 groups 快照后按钮自动出现。
- 校验失败时按参与者归组展示冲突；即使某位合格参与者没有旧结果行，也会出现可点击的“调整”入口，由人工编辑 RPC 通过 upsert 创建结果。

### 后端接口

| 接口 | 用途 |
| --- | --- |
| `GET /api/match/:eventId/results` | 当前最新 completed 版本及 `resultState/version/revision/sourceMatchStatusId` |
| `POST /api/match/:eventId/adjustment-drafts` | 仅从 published 创建/复用调整草稿 |
| `PUT /api/match/:eventId/results/:sourceUserId` | 修改当前 draft 的某个用户结果 |
| `PUT /api/match/:eventId/results/:sourceUserId/lock` | 锁定/解锁当前 draft 用户结果 |
| `GET /api/match/:eventId/validation` | 严格校验当前 draft 的人数、重复、自匹配、候选与硬规则冲突 |
| `POST /api/match/:eventId/publish` | 仅允许 validated draft 单向发布 |

## 3. 创建/编辑活动的多报名表单

报名类型不再硬编码为“嘉宾”。页面先提供多个报名类型的清晰切换区，再在单一选中卡片中完成该类型全部配置：

```text
报名表单与报名类型                 [新增表单]
┌ 1. 参会嘉宾 ┐  ┌ 2. 参会观众 ┐

┌ 当前表单：名称 / 默认 / 公开或名单 / 是否匹配 ──────┐
│ 名称、说明                         前移 后移 复制 删除 │
├ 1. 报名资格：公开报名 / 仅指定平台用户               ┤
├ 2. 匹配资格：此报名类型是否进入候选池                 ┤
└ 3. 报名问卷：编辑字段 / 导入模板 / 保存模板            ┘

互动功能（活动级）
其他信息（活动级）
```

已验证测试活动的“参会嘉宾”和“参会观众”可以独立切换；复制为深拷贝，删除需确认，排序反馈明确。空的指定用户名单仍表示“无人有资格”，不会错误回退成公开报名。

## 4. 缓存、预加载与返回状态审计

| 页面/数据 | 请求与 queryKey | 返回时行为 | 当前 stale/gc | 预取与精确失效 |
| --- | --- | --- | --- | --- |
| 活动列表 | `GET /api/events/organizer/my`；`merchant/activities` | 30 秒内直接命中，过期后缓存内容先显示并后台刷新 | 30s / 20m | 卡片 hover/focus 预取目标详情；创建、编辑、取消、删除、匹配发布后失效列表 |
| 活动详情 | `GET /api/events/organizer/:id`；`merchant/activity/:id` | 2 分钟内不请求；过期时静默 revalidate，不出现全屏 loading | 2m / 30m | 卡片 hover/focus 预取代码+数据；编辑/取消后精确失效该 id 与列表 |
| 详情参与者 | 报名分页接口；`merchant/enrollment/:id/list/detail-preview/{status}/{page}` | previousData 占位，切页不闪空 | 45s / 20m | 仅进入参与者 tab 后请求；审核/导入后失效 enrollment root |
| 报名管理 | 全量报名接口；`merchant/enrollment/:id/list` | 返回立即恢复；过期后台更新 | 45s / 20m | 详情/卡片 hover 只预取有图片用户；审核、导入精确失效报名、活动、匹配参与人 |
| 匹配参与人 | 报名参与人接口；`merchant/matching/:id/participants` | 短缓存，避免审核后长期脏数据 | 30s / 30m | 进入匹配前预取；报名审核/导入后失效 |
| 匹配规则/配置 | rules/config；对应统一 matching keys | 返回不重载编辑器 | 10m / 30m | 匹配入口 hover 同时预取；保存后 setQueryData/精确失效 |
| 字段目录 | field-catalog key | 稳定 schema 中期缓存 | 5m / 30m | 匹配入口预取；活动报名表单修改后失效 matching root |
| 匹配结果 | results key | 30 秒内命中，之后后台刷新 | 30s / 30m | 匹配完成、人工调整、创建草稿、发布后精确更新/失效 results、history、validation、activities |
| 匹配历史 | history key | 版本元数据短缓存 | 60s / 30m | 匹配完成/发布后失效 |
| 报名图片 | 登录主体+event+participant+asset keys | 抽屉与路由卸载后仍命中 | 10m / 20m | 仅 imageCount>0 预取；退出、401、换账号清空 Object URL |
| 通知 | `merchant/notifications` | 短缓存并后台刷新 | 30s / 15m | 已读/删除后精确失效 |
| 商家用户池 | user pool/custom tags/platform users/quota 独立 keys | 分数据变化频率缓存 | 1m–5m / Query 默认或现有 gc | 邀请、标签、用户池操作只失效对应 key |
| 商家资料 | `merchant/profile` | 稳定资料缓存 | 5m / Query 默认 gc | 保存资料后 setQueryData + invalidate |

路由代码和数据均在 `pointerEnter`/focus 时预加载，点击仍作为兜底。匹配预取并行发起 rules、participants、field catalog、config、history、results，页面本身使用完全相同的 queryKey，避免“预取了但页面未命中”。

### 状态归属

| 状态 | 保存位置 |
| --- | --- |
| 活动列表状态筛选 | URL |
| 报名搜索、审核状态、页码 | URL |
| 报名高级筛选条件 | 当前标签页 sessionStorage |
| 活动详情 tab、参与者状态、页码 | URL |
| 匹配当前步骤 | URL `step` |
| 通知筛选 | URL |
| 页面滚动位置 | 按 history location key 存 sessionStorage；POP 返回恢复 |
| 页面间返回目标 | React Router location state，仅保存导航意图 |
| 服务端数据 | React Query，不复制到 route state/sessionStorage |
| 未提交复杂活动表单 | 保持组件内并有放弃确认；未把联系人、指定用户名单等敏感草稿通用持久化到浏览器 |

## 5. MerchantLayout 与公共路由

- 商家活动详情 `/dashboard/activity/:id/detail` 已接入 `MerchantLayout`。
- 桌面显示持续侧栏，内容放宽至 `max-w-6xl`；移动端使用底部导航。
- 删除封面上的重复返回按钮，只保留布局顶栏返回。
- 编辑、报名、匹配、二维码四个操作位于普通文档流，不再绝对定位覆盖正文。
- 公共 `/activity/:id` 明确使用用户活动详情组件，不会出现商家侧栏。

## 6. 主要文件

### 前端

- `src/features/merchant/queryKeys.ts`
- `src/hooks/usePrefetchMerchantActivity.ts`
- `src/components/routing/RouteScrollRestoration.tsx`
- `src/features/enrollment/hooks/useEnrollmentImages.ts`
- `src/services/protectedImageCache.ts`
- `src/components/enrollment/PrivateEnrollmentImageGallery.tsx`
- `src/pages/merchant/DashboardNew.tsx`
- `src/pages/common/ActivityDetail.tsx`
- `src/pages/merchant/EnrollmentManagementNew.tsx`
- `src/pages/merchant/MatchingConfig/index.tsx`
- `src/features/matching/hooks/useMatchingLogic.ts`
- `src/features/matching/services/matchingApi.ts`
- `src/features/matching/components/ResultsTab/index.tsx`
- `src/features/matching/components/ManualMatchEditor.tsx`
- `src/features/matching/components/MatchingHistoryPanel/index.tsx`
- `src/features/activities/components/ActivityForm/RegistrationTypesBuilder.tsx`
- `src/App.tsx`

### 后端

- `api/routes/match.ts`
- `api/services/matchControlService.ts`
- `api/services/matchService.ts`
- `api/services/organizer/enrollmentImageService.organizer.ts`
- `api/services/organizer/enrollmentService.organizer.ts`
- `api/services/organizer/eventService.organizer.ts`
- `database/migrations/20260715_complete_match_adjustment_drafts.sql`

## 7. 性能后端改动

- 活动列表的待审核数和是否已有匹配结果改为按当前页活动批量聚合，去掉逐活动 N+1 查询。
- 活动详情并行读取报名类型与报名人数，修复详情显示 0 人的问题。
- 报名参与者的用户资料与图片数并行批量读取，去掉逐用户/逐图片串行查询。
- 匹配结果查询对迁移前缺少 `source_match_status_id`、`is_locked` 的数据库做滚动发布兼容，单个查询错误不再触发未处理 rejection 导致进程退出。

## 8. 验收结果、风险与待确认项

已通过：

- 前端 `npm run check`。
- 前端 5 个测试文件、17 个测试全部通过。
- 前端 production build 通过。
- 本轮核心改动文件定向 ESLint 通过。
- 后端 `npx tsc --noEmit` 通过。
- 前后端 `git diff --check` 通过。
- 测试账号登录、活动列表、159 人详情、159 人报名管理、156 条匹配结果、结果校验接口均返回成功。
- 桌面与 390×844 移动视口实际页面验证通过。
- 返回详情时缓存内容立即恢复；超过 staleTime 后只有后台刷新，不再显示空白加载。

已知仓库级问题：完整 `npm run lint` 仍被原有参考目录、旧页面和旧 mock 的 103 个问题阻塞；本轮没有无关扩散清理。后端的 ESLint 9 脚本缺少 `eslint.config.*`，所以以 TypeScript 检查作为静态验证。

迁移后验收结果：

- 从 published v1 创建 draft v2 成功；重复请求幂等复用 v2，没有产生 v3。
- v2 的规则、156 行 best matches 和分数快照完成克隆；v1 保持 published。
- 人工删除、排序、保存成功，revision 从 3 增至 4；恢复原名单后为 revision 5。
- 锁定与解锁成功，状态仅写入 v2，最终保持未锁定。
- 旧 Top 5/快照上限 3 的兼容校准成功，批量冲突从 155 个降为 0。
- 严格校验目前仅剩 3 名参与者没有结果（每人 0，最少 1）；页面已提供三个人各自的调整入口。
- 未执行发布，因此 v1 继续作为参与者侧可见版本，v2 仅为商家草稿。

仍需明确授权才能执行：推送、远程部署，以及在补齐 3 名参与者后正式发布 v2。本轮没有执行这些操作。
