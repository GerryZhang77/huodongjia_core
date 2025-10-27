#!/bin/bash

# 报名筛选与通知功能测试脚本
# 测试通知发送和导出功能

set -e

echo "==========================================="
echo "报名筛选与通知功能测试"
echo "==========================================="

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 加载环境变量
if [ -f "env/.env.mock" ]; then
    source env/.env.mock
    echo -e "${GREEN}✓ 已加载 Mock 环境配置${NC}"
else
    echo -e "${RED}✗ 找不到 env/.env.mock 文件${NC}"
    exit 1
fi

# 1. 测试通知 API
echo ""
echo "1️⃣  测试发送通知 API"
echo "-------------------------------------------"

ACTIVITY_ID="test-activity-123"
API_ENDPOINT="${VITE_API_BASE_URL}/api/events/${ACTIVITY_ID}/enrollments/notify"

echo "API 端点: $API_ENDPOINT"

# 构造测试请求数据
read -r -d '' REQUEST_DATA <<'EOF' || true
{
  "enrollmentIds": ["enroll-1", "enroll-2", "enroll-3"],
  "type": "approval",
  "title": "报名审核通过通知",
  "content": "恭喜您！您的活动报名已通过审核，期待您的参与。",
  "enrollments": [
    {
      "id": "enroll-1",
      "name": "张三",
      "phone": "13800138001",
      "email": "zhangsan@example.com"
    },
    {
      "id": "enroll-2",
      "name": "李四",
      "phone": "13800138002",
      "email": "lisi@example.com"
    },
    {
      "id": "enroll-3",
      "name": "王五",
      "phone": "13800138003",
      "email": "wangwu@example.com"
    }
  ],
  "activityInfo": {
    "id": "test-activity-123",
    "title": "技术分享会",
    "startTime": "2024-02-01T14:00:00Z",
    "location": "北京市朝阳区"
  }
}
EOF

# 发送请求
echo "发送测试请求..."
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "$REQUEST_DATA")

# 检查响应
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ 通知 API 测试通过${NC}"
    echo "响应数据:"
    echo "$RESPONSE" | jq '.'
else
    echo -e "${RED}✗ 通知 API 测试失败${NC}"
    echo "响应数据:"
    echo "$RESPONSE"
fi

# 2. 验证 TypeScript 类型
echo ""
echo "2️⃣  验证 TypeScript 类型定义"
echo "-------------------------------------------"

if npx tsc --noEmit --project tsconfig.json 2>&1 | grep -q "error TS"; then
    echo -e "${RED}✗ TypeScript 类型检查失败${NC}"
    npx tsc --noEmit --project tsconfig.json
    exit 1
else
    echo -e "${GREEN}✓ TypeScript 类型检查通过${NC}"
fi

# 3. 检查关键文件
echo ""
echo "3️⃣  检查关键文件"
echo "-------------------------------------------"

FILES=(
    "src/features/enrollment/components/SendNotificationDialog/index.tsx"
    "src/features/enrollment/services/enrollmentApi.ts"
    "src/utils/excelExport.ts"
    "docs/api_doc/modules/报名管理-通知与导出API.openapi.json"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (文件不存在)"
    fi
done

# 4. 检查依赖包
echo ""
echo "4️⃣  检查依赖包安装"
echo "-------------------------------------------"

DEPENDENCIES=(
    "xlsx"
    "file-saver"
)

for dep in "${DEPENDENCIES[@]}"; do
    if npm list "$dep" &> /dev/null; then
        VERSION=$(npm list "$dep" | grep "$dep" | head -1 | awk -F@ '{print $NF}')
        echo -e "${GREEN}✓${NC} $dep@$VERSION"
    else
        echo -e "${RED}✗${NC} $dep (未安装)"
    fi
done

# 5. 测试不同通知类型
echo ""
echo "5️⃣  测试不同通知类型"
echo "-------------------------------------------"

NOTIFICATION_TYPES=("approval" "rejection" "custom")

for type in "${NOTIFICATION_TYPES[@]}"; do
    echo "测试类型: $type"
    
    # 根据类型设置不同的标题和内容
    case $type in
        "approval")
            TITLE="报名审核通过通知"
            CONTENT="恭喜您！您的活动报名已通过审核。"
            ;;
        "rejection")
            TITLE="报名审核未通过通知"
            CONTENT="很抱歉，您的活动报名未能通过审核。"
            ;;
        "custom")
            TITLE="活动重要通知"
            CONTENT="活动时间有所调整，请查看最新通知。"
            ;;
    esac
    
    # 构造请求
    TYPE_REQUEST=$(jq -n \
        --arg type "$type" \
        --arg title "$TITLE" \
        --arg content "$CONTENT" \
        '{
            enrollmentIds: ["test-1"],
            type: $type,
            title: $title,
            content: $content,
            enrollments: [{
                id: "test-1",
                name: "测试用户",
                phone: "13800138000",
                email: "test@example.com"
            }],
            activityInfo: {
                id: "test-activity",
                title: "测试活动",
                startTime: "2024-02-01T14:00:00Z",
                location: "测试地点"
            }
        }')
    
    # 发送请求
    TYPE_RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "$TYPE_REQUEST")
    
    if echo "$TYPE_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}  ✓ $type 类型测试通过${NC}"
    else
        echo -e "${RED}  ✗ $type 类型测试失败${NC}"
    fi
done

echo ""
echo "==========================================="
echo -e "${GREEN}测试完成！${NC}"
echo "==========================================="
echo ""
echo "📝 手动测试检查清单:"
echo "  1. ✓ 未选中报名时，发送通知和导出按钮应禁用"
echo "  2. ✓ 选中报名后，按钮应启用"
echo "  3. ✓ 点击发送通知，对话框正确显示"
echo "  4. ✓ 三种通知类型（批准/拒绝/自定义）都能正确选择和发送"
echo "  5. ✓ 自定义类型必须填写标题"
echo "  6. ✓ 通知内容至少10个字符"
echo "  7. ✓ 导出功能生成正确的 Excel 文件"
echo "  8. ✓ 导出包含标准字段和自定义字段"
echo "  9. ✓ 网络失败时显示错误提示"
echo "  10. ✓ 发送成功后清空选择"
echo ""
