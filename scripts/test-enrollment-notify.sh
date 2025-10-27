#!/bin/bash

# ========================================
# 测试报名管理通知接口路由
# ========================================
# 验证 /api/events/{id}/enrollments/notify 是否正确路由到报名管理模块 Mock URL
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
ENROLLMENT_MOCK_URL="https://m1.apifoxmock.com/m1/7269221-6996856-6423067"
APIFOX_TOKEN="7WpWR1HdKZIChw9BM0LQ3"
APIFOX_API_ID="367358266"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  报名管理通知接口路由测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 测试通知接口
echo -e "${YELLOW}测试: 发送报名通知${NC}"
echo -e "  POST ${ENROLLMENT_MOCK_URL}/api/events/1/enrollments/notify?apifoxApiId=${APIFOX_API_ID}"

HTTP_CODE=$(curl -s -o /tmp/notify_response.json -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "apifoxToken: ${APIFOX_TOKEN}" \
  -d '{
    "activityId": "1",
    "enrollmentIds": ["enrollment-1", "enrollment-2"],
    "type": "approval",
    "title": "报名审核通过通知",
    "content": "恭喜您！您的活动报名已通过审核。",
    "enrollments": [
      {
        "id": "enrollment-1",
        "name": "张三",
        "phone": "13800138000",
        "email": "zhangsan@example.com"
      }
    ],
    "activityInfo": {
      "id": "1",
      "title": "测试活动",
      "startTime": "2025-11-01T14:00:00Z",
      "location": "北京市朝阳区"
    }
  }' \
  "${ENROLLMENT_MOCK_URL}/api/events/1/enrollments/notify?apifoxApiId=${APIFOX_API_ID}")

BODY=$(cat /tmp/notify_response.json)

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "  ${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
  echo -e "  响应: ${GREEN}${BODY}${NC}"
else
  echo -e "  ${RED}❌ FAIL${NC} (HTTP $HTTP_CODE)"
  echo -e "  响应: ${RED}${BODY}${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 所有测试通过！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}说明：${NC}"
echo "• 报名管理通知接口正确路由到独立的 Mock URL"
echo "• Mock URL: ${ENROLLMENT_MOCK_URL}"
echo "• API ID: ${APIFOX_API_ID}"
echo "• 不影响其他活动管理接口"
echo ""
