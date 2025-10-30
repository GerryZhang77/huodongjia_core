/**
 * 测试后端报名数据转换
 */

// 模拟后端返回的数据结构
const backendData = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  event_id: "00000000-0000-0000-0000-000000000000",
  user_id: null,
  name: "张三",
  sex: "male",
  age: 30,
  occupation: "产品经理",
  other_info: JSON.stringify({
    phone: "13800138000",
    email: "zhangsan@example.com",
    company: "某科技公司",
    industry: "互联网",
    city: "北京",
    学历: "本科",
    毕业院校: "清华大学",
    工作年限: "5年",
  }),
  status: "pending",
  created_at: "2025-10-30T22:16:06.523453+00:00",
  updated_at: "2025-10-30T22:16:06.523453+00:00",
};

// 解析 other_info
const otherInfo = JSON.parse(backendData.other_info);

console.log("后端数据:");
console.log(JSON.stringify(backendData, null, 2));

console.log("\n解析后的 other_info:");
console.log(JSON.stringify(otherInfo, null, 2));

// 转换后的前端数据
const frontendData = {
  id: backendData.id,
  activityId: backendData.event_id,
  userId: backendData.user_id || undefined,
  name: backendData.name,
  gender: backendData.sex,
  age: backendData.age,
  phone: otherInfo.phone,
  email: otherInfo.email,
  occupation: backendData.occupation,
  company: otherInfo.company,
  industry: otherInfo.industry,
  city: otherInfo.city,
  customFields: otherInfo,
  status: backendData.status,
  enrolledAt: backendData.created_at,
  updatedAt: backendData.updated_at,
};

console.log("\n转换后的前端数据:");
console.log(JSON.stringify(frontendData, null, 2));

console.log("\n✅ 数据转换测试完成！");
