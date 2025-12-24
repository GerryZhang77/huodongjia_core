/**
 * TagShowcase - 标签组件展示模块
 */

import { FC } from "react";
import { Tag, TagGroup } from "@/components/ui";
import { CheckOutline } from "antd-mobile-icons";

const TagShowcase: FC = () => {
  return (
    <div className="space-y-8">
      {/* 颜色展示 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          标签颜色 (Colors)
        </h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Soft 变体（推荐）</div>
            <TagGroup>
              <Tag color="primary" variant="soft">
                天空蓝
              </Tag>
              <Tag color="secondary" variant="soft">
                活力橙
              </Tag>
              <Tag color="accent" variant="soft">
                梦幻紫
              </Tag>
              <Tag color="success" variant="soft">
                成功
              </Tag>
              <Tag color="warning" variant="soft">
                警告
              </Tag>
              <Tag color="error" variant="soft">
                错误
              </Tag>
              <Tag color="gray" variant="soft">
                灰色
              </Tag>
            </TagGroup>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Filled 变体</div>
            <TagGroup>
              <Tag color="primary" variant="filled">
                天空蓝
              </Tag>
              <Tag color="secondary" variant="filled">
                活力橙
              </Tag>
              <Tag color="accent" variant="filled">
                梦幻紫
              </Tag>
              <Tag color="success" variant="filled">
                成功
              </Tag>
              <Tag color="warning" variant="filled">
                警告
              </Tag>
              <Tag color="error" variant="filled">
                错误
              </Tag>
              <Tag color="gray" variant="filled">
                灰色
              </Tag>
            </TagGroup>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Outline 变体</div>
            <TagGroup>
              <Tag color="primary" variant="outline">
                天空蓝
              </Tag>
              <Tag color="secondary" variant="outline">
                活力橙
              </Tag>
              <Tag color="accent" variant="outline">
                梦幻紫
              </Tag>
              <Tag color="success" variant="outline">
                成功
              </Tag>
              <Tag color="warning" variant="outline">
                警告
              </Tag>
              <Tag color="error" variant="outline">
                错误
              </Tag>
              <Tag color="gray" variant="outline">
                灰色
              </Tag>
            </TagGroup>
          </div>
        </div>
      </div>

      {/* 尺寸展示 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          标签尺寸 (Size)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 w-20">Large</span>
            <Tag size="large" color="primary">
              28px 高度
            </Tag>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 w-20">Medium ⭐</span>
            <Tag size="medium" color="primary">
              24px 高度
            </Tag>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 w-20">Small</span>
            <Tag size="small" color="primary">
              20px 高度
            </Tag>
          </div>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Tag size="large">大标签</Tag>
<Tag size="medium">默认标签</Tag>
<Tag size="small">小标签</Tag>`}</code>
        </pre>
      </div>

      {/* 带图标 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">带图标标签</h3>
        <TagGroup>
          <Tag icon={<CheckOutline />} color="success">
            已完成
          </Tag>
          <Tag icon={<CheckOutline />} color="primary">
            已报名
          </Tag>
          <Tag icon={<CheckOutline />} color="accent">
            VIP
          </Tag>
        </TagGroup>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`import { CheckOutline } from 'antd-mobile-icons';

<Tag icon={<CheckOutline />} color="success">
  已完成
</Tag>`}</code>
        </pre>
      </div>

      {/* 可关闭 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">可关闭标签</h3>
        <TagGroup>
          <Tag closable onClose={() => console.log("关闭")}>
            可关闭
          </Tag>
          <Tag color="secondary" closable onClose={() => console.log("关闭")}>
            活动标签
          </Tag>
          <Tag color="accent" closable onClose={() => console.log("关闭")}>
            智能匹配
          </Tag>
        </TagGroup>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Tag closable onClose={() => handleClose()}>
  可关闭标签
</Tag>`}</code>
        </pre>
      </div>

      {/* 可点击 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">可点击标签</h3>
        <TagGroup>
          <Tag onClick={() => console.log("点击")}>点击我</Tag>
          <Tag color="secondary" onClick={() => console.log("点击")}>
            筛选标签
          </Tag>
          <Tag color="accent" onClick={() => console.log("点击")}>
            分类
          </Tag>
        </TagGroup>
        <p className="text-xs text-gray-500 mt-2">悬停查看交互效果</p>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Tag onClick={() => handleClick()}>
  点击我
</Tag>`}</code>
        </pre>
      </div>

      {/* 标签组 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          标签组 (TagGroup)
        </h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">Small 间距</div>
            <TagGroup gap="small">
              <Tag color="primary">React</Tag>
              <Tag color="secondary">TypeScript</Tag>
              <Tag color="accent">Tailwind</Tag>
              <Tag color="success">Vite</Tag>
            </TagGroup>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Medium 间距</div>
            <TagGroup gap="medium">
              <Tag color="primary">React</Tag>
              <Tag color="secondary">TypeScript</Tag>
              <Tag color="accent">Tailwind</Tag>
              <Tag color="success">Vite</Tag>
            </TagGroup>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Large 间距</div>
            <TagGroup gap="large">
              <Tag color="primary">React</Tag>
              <Tag color="secondary">TypeScript</Tag>
              <Tag color="accent">Tailwind</Tag>
              <Tag color="success">Vite</Tag>
            </TagGroup>
          </div>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<TagGroup gap="medium">
  <Tag>标签1</Tag>
  <Tag>标签2</Tag>
  <Tag>标签3</Tag>
</TagGroup>`}</code>
        </pre>
      </div>

      {/* 实际应用 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          实际应用示例
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              活动标签
            </h4>
            <TagGroup>
              <Tag color="secondary" variant="soft">
                热门
              </Tag>
              <Tag color="primary" variant="soft">
                线上活动
              </Tag>
              <Tag color="accent" variant="soft">
                限时优惠
              </Tag>
              <Tag color="success" variant="soft">
                报名中
              </Tag>
            </TagGroup>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              用户标签
            </h4>
            <TagGroup>
              <Tag size="small" color="accent" variant="filled">
                VIP
              </Tag>
              <Tag size="small" color="primary" variant="outline">
                认证用户
              </Tag>
              <Tag size="small" color="gray" variant="soft">
                新用户
              </Tag>
            </TagGroup>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              技能标签（可点击筛选）
            </h4>
            <TagGroup>
              <Tag color="primary" onClick={() => {}}>
                设计
              </Tag>
              <Tag color="secondary" onClick={() => {}}>
                开发
              </Tag>
              <Tag color="accent" onClick={() => {}}>
                产品
              </Tag>
              <Tag color="success" onClick={() => {}}>
                运营
              </Tag>
            </TagGroup>
          </div>
        </div>
      </div>

      {/* 设计规范 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📐 设计规范
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ 样式: Pill 全圆角</li>
          <li>✅ 尺寸: Large(28px) / Medium(24px) / Small(20px)</li>
          <li>✅ 变体: Soft(淡色背景，推荐) / Filled / Outline</li>
          <li>✅ 7 种颜色: 主色/辅助色/强调色 + 语义色 + 灰色</li>
          <li>✅ 支持图标、可关闭、可点击</li>
          <li>⚠️ 一个页面避免使用超过 3-4 种颜色</li>
        </ul>
      </div>
    </div>
  );
};

export default TagShowcase;
