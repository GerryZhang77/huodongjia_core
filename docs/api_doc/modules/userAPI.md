登陆模块 发送手机登录/注册验证码 /api/auth/send-verification-code POST 补充项：用于手机号登录或注册时的验证码发送。
登陆模块 手机验证码登录/注册 /api/auth/phone-login POST 补充项：使用手机号和验证码进行登录或注册。
默认模块 查询用户个人信息 /api/users/{userId} GET "
"
默认模块 更新用户个人信息 /api/users/{userId} PUT/PATCH 补充项：用于用户修改个人资料。
活动管理模块 获取所有活动列表 /api/events GET "
"
活动管理模块 获取特定活动信息（包括当前报名人数情况） /api/events/{eventId} GET "
"
活动管理模块 编辑活动 /api/events/{eventId} PUT 补充项：供商家/管理员创建活动。
报名管理模块 用户报名参加活动 /api/events/{eventId}/enroll POST 补充项：用户报名。
报名管理模块 用户取消活动报名 /api/events/{eventId}/enroll DELETE 补充项：用户取消报名。
报名管理模块 批量发送报名通知（低优先级） /api/events/{eventId}/enrollments/notify POST "
"
默认模块 提取用户关键词条 /api/matching/{eventId}/extract-keywords GET "
"
匹配模块 获取匹配结果 /api/match/{eventId}/results GET "
"
默认模块 NFC 刷卡 /api/nfc/{eventId}/{otherUserId} GET "
"
信箱模块 获取本人信箱全部信息 /api/mailbox GET 路径调整：统一使用 /api/mailbox 作为基础路径。
信箱模块 设为已读 /api/mailbox/{messageId} PUT 路径调整：规范为对资源的 PUT/PATCH 操作。
信箱模块 删除消息 /api/mailbox/{messageId} DELETE "
"
通知模块 向当前活动所有用户广播信息 /api/notifications/{eventId}/broadcast POST "
"
通知模块 获取系统通知/活动提醒列表 /api/notifications GET 补充项：获取非信箱类的通知列表。
