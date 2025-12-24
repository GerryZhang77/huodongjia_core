/**
 * CardShowcase - 卡片组件展示模块
 */

import { FC } from "react";
import { Card, Button, Tag } from "@/components/ui";

const CardShowcase: FC = () => {
  return (
    <div className="space-y-8">
      {/* 基础卡片 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          基础卡片 (Basic Card)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <p className="text-gray-700">这是一个基础卡片</p>
          </Card>

          <Card title="卡片标题">
            <p className="text-gray-700">带标题的卡片</p>
          </Card>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Card>
  <p>卡片内容</p>
</Card>

<Card title="标题">
  <p>内容</p>
</Card>`}</code>
        </pre>
      </div>

      {/* 带操作的卡片 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          带操作的卡片
        </h3>
        <Card
          title="活动信息"
          extra={
            <Button size="small" variant="text">
              编辑
            </Button>
          }
        >
          <div className="space-y-2">
            <p className="text-gray-700">活动名称: 周末户外徒步</p>
            <p className="text-gray-500 text-sm">时间: 2024年12月23日</p>
            <p className="text-gray-500 text-sm">地点: 香山公园</p>
          </div>
        </Card>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Card 
  title="活动信息" 
  extra={<Button size="small">编辑</Button>}
>
  <p>内容...</p>
</Card>`}</code>
        </pre>
      </div>

      {/* 阴影变体 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          阴影变体 (Shadow)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card shadow="none" title="无阴影">
            <p className="text-sm text-gray-600">shadow="none"</p>
          </Card>

          <Card shadow="sm" title="小阴影">
            <p className="text-sm text-gray-600">shadow="sm"</p>
          </Card>

          <Card shadow="default" title="默认阴影 ⭐">
            <p className="text-sm text-gray-600">shadow="default"</p>
          </Card>

          <Card shadow="lg" title="大阴影">
            <p className="text-sm text-gray-600">shadow="lg"</p>
          </Card>
        </div>
      </div>

      {/* 可点击卡片 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          可点击卡片 (Hoverable)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            hoverable
            onClick={() => console.log("卡片被点击")}
            title="悬停查看效果"
          >
            <p className="text-gray-700">悬停时会显示蓝色光晕 + 轻微上移</p>
            <p className="text-sm text-gray-500 mt-2">点击查看交互</p>
          </Card>

          <Card hoverable onClick={() => console.log("卡片被点击")}>
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-gray-900">
                周末户外徒步
              </h4>
              <div className="flex gap-2">
                <Tag color="secondary" size="small" variant="soft">
                  热门
                </Tag>
                <Tag color="success" size="small" variant="soft">
                  报名中
                </Tag>
              </div>
              <p className="text-sm text-gray-600">
                时间: 2024年12月23日 09:00
              </p>
              <p className="text-sm text-gray-600">地点: 香山公园</p>
            </div>
          </Card>
        </div>
      </div>

      {/* 不同内容的卡片 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          实际应用示例
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 活动卡片 */}
          <Card hoverable onClick={() => {}}>
            <div className="space-y-3">
              <div className="aspect-video bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-semibold">
                活动封面
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                团队建设活动
              </h4>
              <div className="flex gap-2">
                <Tag color="secondary" size="small" variant="soft">
                  热门
                </Tag>
                <Tag color="primary" size="small" variant="soft">
                  线下
                </Tag>
              </div>
              <p className="text-sm text-gray-500">已报名 28/50 人</p>
            </div>
          </Card>

          {/* 统计卡片 */}
          <Card>
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold text-primary-400">156</p>
              <p className="text-sm text-gray-500">总活动数</p>
            </div>
          </Card>

          {/* 用户卡片 */}
          <Card hoverable onClick={() => {}}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                张
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">张三</h4>
                <p className="text-xs text-gray-500">产品经理</p>
              </div>
              <Tag color="accent" size="small" variant="filled">
                VIP
              </Tag>
            </div>
          </Card>

          {/* 表单卡片 */}
          <Card title="快速创建" className="md:col-span-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">
                  活动名称
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                  placeholder="输入活动名称"
                />
              </div>
              <div className="flex gap-2">
                <Button size="small">创建</Button>
                <Button size="small" variant="outline">
                  取消
                </Button>
              </div>
            </div>
          </Card>

          {/* 空状态卡片 */}
          <Card>
            <div className="text-center py-8 space-y-2">
              <p className="text-gray-400 text-sm">暂无数据</p>
              <Button size="small">创建第一个</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 卡片布局组合 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          卡片布局组合
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧主卡片 */}
          <Card className="lg:col-span-2" title="活动列表">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-gray-900">
                      活动 {i}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">2024年12月23日</p>
                  </div>
                  <Tag color="success" size="small" variant="soft">
                    进行中
                  </Tag>
                </div>
              ))}
            </div>
          </Card>

          {/* 右侧辅助卡片 */}
          <div className="space-y-4">
            <Card title="本周统计">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">新增活动</span>
                  <span className="text-sm font-semibold text-gray-900">
                    12
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总报名</span>
                  <span className="text-sm font-semibold text-gray-900">
                    328
                  </span>
                </div>
              </div>
            </Card>

            <Card title="快捷操作">
              <div className="space-y-2">
                <Button block size="small">
                  创建活动
                </Button>
                <Button block size="small" variant="outline">
                  导入报名
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 设计规范 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📐 设计规范
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ 圆角: 16px (rounded-xl)</li>
          <li>✅ 默认阴影: 0 4px 12px rgba(0,0,0,0.06)</li>
          <li>
            ✅ 悬停效果: 蓝色光晕 + 阴影增强 + 轻微上移 (-translate-y-0.5)
          </li>
          <li>✅ 内边距: 16px (p-4)</li>
          <li>✅ 标题字重: SemiBold (600)</li>
          <li>⚠️ 避免嵌套过深，保持结构清晰</li>
        </ul>
      </div>
    </div>
  );
};

export default CardShowcase;
