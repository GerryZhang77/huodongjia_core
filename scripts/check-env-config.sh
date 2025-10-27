#!/bin/bash

# ========================================
# 环境变量诊断脚本
# ========================================
# 功能：检查 Apifox Mock 环境变量配置是否正确
# 使用：./scripts/check-env-config.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  环境变量配置诊断"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 .env.mock 文件是否存在
ENV_FILE="env/.env.mock"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}❌ 错误: $ENV_FILE 文件不存在${NC}"
  exit 1
fi

echo "✅ 配置文件: $ENV_FILE"
echo ""

# 提取环境变量
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  已配置的 Mock URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 读取配置
AUTH_URL=$(grep "^VITE_AUTH_MOCK_URL=" "$ENV_FILE" | cut -d'=' -f2)
EVENT_URL=$(grep "^VITE_EVENT_MOCK_URL=" "$ENV_FILE" | cut -d'=' -f2)
ENROLLMENT_URL=$(grep "^VITE_ENROLLMENT_MOCK_URL=" "$ENV_FILE" | cut -d'=' -f2)
MATCHING_URL=$(grep "^VITE_MATCHING_MOCK_URL=" "$ENV_FILE" | cut -d'=' -f2)
EMBEDDING_URL=$(grep "^VITE_EMBEDDING_MOCK_URL=" "$ENV_FILE" | cut -d'=' -f2)

echo "1. 认证模块:"
echo "   $AUTH_URL"
echo ""

echo "2. 活动模块:"
echo "   $EVENT_URL"
echo ""

echo "3. 报名管理模块 (⭐ 新增):"
if [ -z "$ENROLLMENT_URL" ]; then
  echo -e "   ${RED}❌ 未配置${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  需要在 $ENV_FILE 中添加:${NC}"
  echo "   VITE_ENROLLMENT_MOCK_URL=https://m1.apifoxmock.com/m1/7269221-6996856-6423067"
else
  echo "   $ENROLLMENT_URL"
fi
echo ""

echo "4. 匹配模块:"
echo "   $MATCHING_URL"
echo ""

echo "5. 词嵌入模块:"
echo "   $EMBEDDING_URL"
echo ""

# 检查 Mock ID 是否正确
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Mock ID 验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

function check_mock_id() {
  local NAME=$1
  local URL=$2
  local EXPECTED_ID=$3
  
  if [ -z "$URL" ]; then
    echo -e "${RED}❌ $NAME: 未配置${NC}"
    return
  fi
  
  ACTUAL_ID=$(echo "$URL" | grep -oE '6[0-9]{6}' | head -1)
  
  if [ "$ACTUAL_ID" == "$EXPECTED_ID" ]; then
    echo -e "${GREEN}✅ $NAME: $ACTUAL_ID (正确)${NC}"
  else
    echo -e "${RED}❌ $NAME: $ACTUAL_ID (期望: $EXPECTED_ID)${NC}"
  fi
}

check_mock_id "认证模块     " "$AUTH_URL" "6378684"
check_mock_id "活动模块     " "$EVENT_URL" "6383074"
check_mock_id "报名管理模块 " "$ENROLLMENT_URL" "6423067"
check_mock_id "匹配模块     " "$MATCHING_URL" "6402615"
check_mock_id "词嵌入模块   " "$EMBEDDING_URL" "6408049"

echo ""

# 检查是否需要重启服务器
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚠️  重要提示"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}如果修改了环境变量，必须完全重启开发服务器：${NC}"
echo ""
echo "  1. 停止服务器 (Ctrl+C)"
echo "  2. 重新运行: npm run dev:mock"
echo ""

# 测试接口连通性
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  接口连通性测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$ENROLLMENT_URL" ]; then
  echo -e "${YELLOW}⚠️  跳过测试（报名管理模块未配置）${NC}"
  exit 0
fi

# 获取 Token
TOKEN=$(grep "^VITE_APIFOX_TOKEN=" "$ENV_FILE" | cut -d'=' -f2)

echo "测试: 发送报名通知接口"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  "${ENROLLMENT_URL}/api/events/1/enrollments/notify?apifoxApiId=367358266&apifoxToken=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentIds": ["1"],
    "type": "approval",
    "title": "测试",
    "content": "测试内容",
    "enrollments": [{"id": "1", "name": "测试", "phone": "", "email": ""}],
    "activityInfo": {"id": "1", "title": "测试", "startTime": "", "location": ""}
  }')

if [ "$RESPONSE" -eq 200 ]; then
  echo -e "${GREEN}✅ 接口测试通过 (HTTP 200)${NC}"
else
  echo -e "${RED}❌ 接口测试失败 (HTTP $RESPONSE)${NC}"
  echo ""
  echo "可能的原因:"
  echo "  1. Mock URL 配置错误"
  echo "  2. Apifox API ID 不在该 Mock 环境中"
  echo "  3. Apifox Token 无效"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
