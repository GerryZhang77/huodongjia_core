#!/bin/bash

# 测试创建活动 API Mock 响应
# 用于验证 Apifox Mock 是否正确配置

echo "======================================"
echo "  测试创建活动 API Mock"
echo "======================================"
echo ""

# 读取环境变量
MOCK_URL=$(grep VITE_EVENT_MOCK_URL env/.env.mock | cut -d '=' -f2)
TOKEN=$(grep VITE_APIFOX_TOKEN env/.env.mock | cut -d '=' -f2)

echo "Mock URL: $MOCK_URL"
echo "Token: $TOKEN"
echo ""

# 准备测试数据
REQUEST_DATA='{
  "title": "测试活动",
  "description": "这是一个测试活动描述",
  "cover_image": "https://example.com/cover.jpg",
  "start_time": "2025-11-01T09:00:00Z",
  "end_time": "2025-11-01T17:00:00Z",
  "location": "测试地点",
  "max_participants": 50,
  "fee": 0,
  "tags": ["测试", "活动"],
  "expectation": "测试期望",
  "registration_deadline": "2025-10-30T23:59:59Z"
}'

echo "发送请求..."
echo "请求数据:"
echo "$REQUEST_DATA" | jq .
echo ""

# 发送请求
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "apifoxToken: $TOKEN" \
  "$MOCK_URL/api/events/create?apifoxApiId=366698241" \
  -d "$REQUEST_DATA")

# 分离响应体和状态码
HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "响应状态码: $HTTP_STATUS"
echo ""
echo "响应数据:"
echo "$HTTP_BODY" | jq .
echo ""

# 检查响应
if [ "$HTTP_STATUS" = "200" ]; then
  SUCCESS=$(echo "$HTTP_BODY" | jq -r '.success // false')
  
  if [ "$SUCCESS" = "true" ]; then
    echo "✅ 测试通过：API 返回成功"
    
    # 检查是否有 event 字段
    HAS_EVENT=$(echo "$HTTP_BODY" | jq 'has("event")')
    if [ "$HAS_EVENT" = "true" ]; then
      echo "✅ 响应包含 event 字段"
      EVENT_ID=$(echo "$HTTP_BODY" | jq -r '.event.id // "N/A"')
      EVENT_TITLE=$(echo "$HTTP_BODY" | jq -r '.event.title // "N/A"')
      echo "   - ID: $EVENT_ID"
      echo "   - 标题: $EVENT_TITLE"
    else
      echo "❌ 响应缺少 event 字段"
    fi
  else
    echo "❌ 测试失败：success = false"
    MESSAGE=$(echo "$HTTP_BODY" | jq -r '.message // "无错误信息"')
    echo "   错误信息: $MESSAGE"
  fi
else
  echo "❌ HTTP 请求失败，状态码: $HTTP_STATUS"
fi

echo ""
echo "======================================"
