/**
 * ButtonShowcase - 按钮组件展示模块
 */

import { FC, useState } from "react";
import { Button } from "@/components/ui";
import {
  AddOutline,
  DeleteOutline,
  CheckOutline,
  RightOutline,
} from "antd-mobile-icons";

const ButtonShowcase: FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 尺寸展示 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          按钮尺寸 (Size)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Large (52px)</div>
            <Button size="large">立即报名</Button>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
              <code>{`<Button size="large">立即报名</Button>`}</code>
            </pre>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500">Medium (44px) ⭐ 默认</div>
            <Button size="medium">确定</Button>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
              <code>{`<Button>确定</Button>`}</code>
            </pre>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500">Small (36px)</div>
            <Button size="small">保存</Button>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
              <code>{`<Button size="small">保存</Button>`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* 变体展示 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          按钮变体 (Variant)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Primary</div>
            <Button variant="primary">提交</Button>
            <p className="text-xs text-gray-500">天空蓝渐变 + 蓝色阴影</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Secondary</div>
            <Button variant="secondary">热门</Button>
            <p className="text-xs text-gray-500">活力橙渐变 + 橙色阴影</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Accent</div>
            <Button variant="accent">智能匹配</Button>
            <p className="text-xs text-gray-500">梦幻紫渐变 + 紫色阴影</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Success</div>
            <Button variant="success">完成</Button>
            <p className="text-xs text-gray-500">成功绿渐变 + 绿色阴影</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Danger</div>
            <Button variant="danger">删除</Button>
            <p className="text-xs text-gray-500">危险红渐变 + 红色阴影</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Outline</div>
            <Button variant="outline">取消</Button>
            <p className="text-xs text-gray-500">白色背景 + 品牌色边框</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Light</div>
            <Button variant="light">查看详情</Button>
            <p className="text-xs text-gray-500">淡蓝背景 + 蓝色文字</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Ghost</div>
            <Button variant="ghost">更多</Button>
            <p className="text-xs text-gray-500">透明背景，悬停显示</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Text</div>
            <Button variant="text">查看详情</Button>
            <p className="text-xs text-gray-500">无背景无边框</p>
          </div>
        </div>
      </div>

      {/* 状态展示 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          按钮状态 (State)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Default</div>
            <Button>默认状态</Button>
            <p className="text-xs text-gray-400">悬停查看效果</p>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500">Disabled</div>
            <Button disabled>禁用状态</Button>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
              <code>{`<Button disabled>禁用</Button>`}</code>
            </pre>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500">Loading</div>
            <Button loading>加载中...</Button>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
              <code>{`<Button loading>加载中</Button>`}</code>
            </pre>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-500">Interactive</div>
            <Button loading={isLoading} onClick={handleLoadingTest}>
              {isLoading ? "提交中..." : "点击测试"}
            </Button>
            <p className="text-xs text-gray-400">点击查看加载</p>
          </div>
        </div>
      </div>

      {/* 带图标 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">带图标按钮</h3>
        <div className="flex flex-wrap gap-4">
          <Button icon={<AddOutline />}>新增</Button>
          <Button icon={<DeleteOutline />} variant="secondary">
            删除
          </Button>
          <Button icon={<CheckOutline />} variant="success" size="small">
            确认
          </Button>
          <Button iconRight={<RightOutline />} variant="outline">
            下一步
          </Button>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`import { AddOutline } from 'antd-mobile-icons';

<Button icon={<AddOutline />}>新增</Button>
<Button iconRight={<RightOutline />}>下一步</Button>`}</code>
        </pre>
      </div>

      {/* 块级按钮 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          块级按钮 (Block)
        </h3>
        <div className="space-y-3 max-w-md">
          <Button block>占满整行的按钮</Button>
          <Button block variant="secondary">
            次要块级按钮
          </Button>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Button block>占满整行</Button>`}</code>
        </pre>
      </div>

      {/* 实际应用 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          实际应用示例
        </h3>

        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              表单操作
            </div>
            <div className="flex gap-3">
              <Button>提交</Button>
              <Button variant="secondary">取消</Button>
              <Button variant="text">重置</Button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              对话框操作
            </div>
            <div className="flex gap-3">
              <Button size="small">确定</Button>
              <Button size="small" variant="outline">
                取消
              </Button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              页面主操作
            </div>
            <Button size="large" icon={<AddOutline />}>
              创建新活动
            </Button>
          </div>
        </div>
      </div>

      {/* 设计规范 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📐 设计规范
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">尺寸</p>
            <ul className="space-y-0.5 text-xs">
              <li>• Large: 52px 高度, 16px 字号, 26px 圆角</li>
              <li>• Medium: 44px 高度, 14px 字号, 22px 圆角 ⭐</li>
              <li>• Small: 36px 高度, 13px 字号, 18px 圆角</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">样式</p>
            <ul className="space-y-0.5 text-xs">
              <li>• 圆角: Pill 胶囊形状 (全圆角)</li>
              <li>• 渐变: 135° 渐变背景</li>
              <li>• 阴影: 彩色阴影 (与按钮颜色匹配)</li>
              <li>• 悬停: 上移 0.5px + 阴影增强</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonShowcase;
