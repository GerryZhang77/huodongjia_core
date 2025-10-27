#!/bin/bash

# ========================================
# 测试通知 API
# ========================================
# 验证 Apifox Mock 环境是否正确配置
# ========================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  报名通知 API 测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 新的 Mock URL
MOCK_BASE_URL="https://m1.apifoxmock.com/m1/7269221-6996856-6423067"
API_ID="367358266"
TOKEN="7WpWR1HdKZIChw9BM0LQ3"

echo "📋 测试配置:"
echo "  Mock URL: $MOCK_BASE_URL"
echo "  API ID: $API_ID"
echo "  Token: $TOKEN"
echo ""

# 测试通知接口
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing: 发送报名通知"
echo "  POST $MOCK_BASE_URL/api/events/1/enrollments/notify"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "apifoxToken: $TOKEN" \
  -d '{
    "activityId": "1",
    "enrollmentIds": ["e1", "e2"],
    "type": "approval",
    "title": "报名审核通过通知",
    "content": "恭喜您！您的活动报名已通过审核。",
    "enrollments": [
      {
        "id": "e1",
        "name": "张三",
        "phone": "13800138000",
        "email": "zhangsan@example.com"
      }
    ],
    "activityInfo": {
      "id": "1",
      "title": "测试活动",
      "startTime": "2025-11-01 14:00:00",
      "location": "北京市朝阳区"
    }
  }' \
  "$MOCK_BASE_URL/api/events/1/enrollments/notify?apifoxApiId=$API_ID")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "  ✅ PASS (HTTP $HTTP_CODE)"
  echo "  Response: $BODY"
else
  echo "  ❌ FAIL (HTTP $HTTP_CODE)"
  echo "  Response: $BODY"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 测试完成！"
echo ""
echo "📌 重要提示："
echo "  1. 环境变量已更新为新的 Mock URL: $MOCK_BASE_URL"
echo "  2. 请重启开发服务器使配置生效: npm run dev:mock"
echo "  3. 如果测试通过，前端应用中的通知功能应该正常工作"
echo ""
