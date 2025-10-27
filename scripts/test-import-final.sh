#!/bin/bash

# 最终验证脚本 - 测试批量导入功能

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  批量导入功能最终验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 测试数据
ACTIVITY_ID="1"
EVENT_MOCK_URL="https://m1.apifoxmock.com/m1/7269221-6996856-6383074"
APIFOX_TOKEN="7WpWR1HdKZIChw9BM0LQ3"
API_ID="367265653"

# 构建完整 URL
URL="${EVENT_MOCK_URL}/api/events/${ACTIVITY_ID}/enrollments/batch-import?apifoxToken=${APIFOX_TOKEN}&apifoxApiId=${API_ID}"

echo "📍 测试接口: POST /api/events/${ACTIVITY_ID}/enrollments/batch-import"
echo "🔗 完整 URL: $URL"
echo ""

# 测试请求体
REQUEST_BODY='{
  "enrollments": [
    {
      "name": "张三",
      "gender": "male",
      "age": 28,
      "occupation": "软件工程师",
      "industry": "互联网",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "city": "北京",
      "bio": "热爱技术，喜欢交流",
      "tags": ["技术", "创业"]
    },
    {
      "name": "李四",
      "gender": "female",
      "age": 25,
      "occupation": "产品经理",
      "industry": "互联网",
      "phone": "13800138001",
      "email": "lisi@example.com",
      "city": "上海",
      "bio": "关注用户体验",
      "tags": ["产品", "设计"]
    }
  ]
}'

echo "📤 请求数据:"
echo "$REQUEST_BODY" | jq '.' 2>/dev/null || echo "$REQUEST_BODY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  执行测试..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 执行请求
HTTP_CODE=$(curl -s -w "%{http_code}" -o /tmp/response_body.txt \
  -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

# 读取响应体
HTTP_BODY=$(cat /tmp/response_body.txt)

echo "📥 HTTP 状态码: $HTTP_CODE"
echo ""
echo "📥 响应数据:"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
echo ""

# 验证结果
if [ "$HTTP_CODE" = "200" ]; then
  SUCCESS=$(echo "$HTTP_BODY" | jq -r '.success' 2>/dev/null)
  if [ "$SUCCESS" = "true" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ 测试通过！批量导入功能正常工作"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    TOTAL=$(echo "$HTTP_BODY" | jq -r '.result.total' 2>/dev/null)
    SUCCESS_COUNT=$(echo "$HTTP_BODY" | jq -r '.result.successCount' 2>/dev/null)
    FAILED_COUNT=$(echo "$HTTP_BODY" | jq -r '.result.failedCount' 2>/dev/null)
    
    echo ""
    echo "📊 导入统计:"
    echo "   总数: $TOTAL"
    echo "   成功: $SUCCESS_COUNT"
    echo "   失败: $FAILED_COUNT"
    exit 0
  else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ❌ 测试失败: success = false"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
  fi
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ❌ 测试失败: HTTP $HTTP_CODE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
