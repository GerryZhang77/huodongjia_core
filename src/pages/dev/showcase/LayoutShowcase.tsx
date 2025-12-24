/**
 * LayoutShowcase - 布局组件展示模块
 */

import { FC } from "react";
import { Container, Stack, Grid, Card } from "@/components/ui";

const LayoutShowcase: FC = () => {
  return (
    <div className="space-y-8">
      {/* Container */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Container - 内容容器
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Small (640px)</p>
            <Container maxWidth="sm" className="bg-white p-4 rounded border">
              <p className="text-sm">最大宽度 640px 的内容容器</p>
            </Container>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Medium (768px) ⭐</p>
            <Container maxWidth="md" className="bg-white p-4 rounded border">
              <p className="text-sm">最大宽度 768px 的内容容器</p>
            </Container>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Large (1024px)</p>
            <Container maxWidth="lg" className="bg-white p-4 rounded border">
              <p className="text-sm">最大宽度 1024px 的内容容器</p>
            </Container>
          </div>
        </div>
        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Container maxWidth="md">
  <p>内容区域</p>
</Container>`}</code>
        </pre>
      </div>

      {/* Stack */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stack - 垂直/水平堆叠
        </h3>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">垂直堆叠 (默认)</p>
            <Stack spacing={4} className="max-w-md">
              <Card>
                <p className="text-sm">项目 1</p>
              </Card>
              <Card>
                <p className="text-sm">项目 2</p>
              </Card>
              <Card>
                <p className="text-sm">项目 3</p>
              </Card>
            </Stack>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">水平堆叠</p>
            <Stack direction="horizontal" spacing={4}>
              <Card className="flex-1">
                <p className="text-sm">项目 1</p>
              </Card>
              <Card className="flex-1">
                <p className="text-sm">项目 2</p>
              </Card>
              <Card className="flex-1">
                <p className="text-sm">项目 3</p>
              </Card>
            </Stack>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">对齐方式</p>
            <Stack direction="horizontal" spacing={4} align="center">
              <div className="w-12 h-12 bg-primary-400 rounded"></div>
              <div className="w-12 h-16 bg-secondary-400 rounded"></div>
              <div className="w-12 h-8 bg-accent-400 rounded"></div>
            </Stack>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">间距选项</p>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500">spacing=2 (8px)</span>
                <Stack direction="horizontal" spacing={2}>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                </Stack>
              </div>
              <div>
                <span className="text-xs text-gray-500">
                  spacing=4 (16px) ⭐
                </span>
                <Stack direction="horizontal" spacing={4}>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                </Stack>
              </div>
              <div>
                <span className="text-xs text-gray-500">spacing=6 (24px)</span>
                <Stack direction="horizontal" spacing={6}>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                </Stack>
              </div>
            </div>
          </div>
        </div>

        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Stack spacing={4}>
  <Card>项目 1</Card>
  <Card>项目 2</Card>
</Stack>

<Stack direction="horizontal" spacing={6}>
  <Card>左侧</Card>
  <Card>右侧</Card>
</Stack>`}</code>
        </pre>
      </div>

      {/* Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Grid - 网格布局
        </h3>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">2 列网格</p>
            <Grid columns={2} gap={4}>
              <Card>
                <p className="text-sm">项目 1</p>
              </Card>
              <Card>
                <p className="text-sm">项目 2</p>
              </Card>
              <Card>
                <p className="text-sm">项目 3</p>
              </Card>
              <Card>
                <p className="text-sm">项目 4</p>
              </Card>
            </Grid>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">3 列网格</p>
            <Grid columns={3} gap={4}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <p className="text-sm">项目 {i}</p>
                </Card>
              ))}
            </Grid>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">4 列网格</p>
            <Grid columns={4} gap={2}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded"
                ></div>
              ))}
            </Grid>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">响应式网格 (使用 cols)</p>
            <Grid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i}>
                  <p className="text-sm text-center">项目 {i}</p>
                </Card>
              ))}
            </Grid>
            <p className="text-xs text-gray-500 mt-2">
              移动端 1 列，平板 2 列，桌面 3-4 列
            </p>
          </div>
        </div>

        <pre className="text-xs bg-gray-50 p-3 rounded mt-4 overflow-x-auto">
          <code>{`<Grid columns={3} gap={4}>
  <Card>项目 1</Card>
  <Card>项目 2</Card>
  <Card>项目 3</Card>
</Grid>

// 响应式
<Grid cols={{ default: 1, sm: 2, md: 3 }} gap={4}>
  <Card>项目 1</Card>
  <Card>项目 2</Card>
</Grid>`}</code>
        </pre>
      </div>

      {/* 组合使用 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          组合使用示例
        </h3>

        <Container maxWidth="lg">
          <Stack spacing={6}>
            {/* 页面标题 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">活动列表</h2>
              <p className="text-sm text-gray-500 mt-1">共 28 个活动</p>
            </div>

            {/* 统计卡片 */}
            <Grid cols={{ default: 2, md: 4 }} gap={4}>
              {[
                { label: "总活动", value: "156" },
                { label: "进行中", value: "28" },
                { label: "已完成", value: "120" },
                { label: "总参与", value: "2,340" },
              ].map((stat, i) => (
                <Card key={i}>
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold text-primary-400">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </Card>
              ))}
            </Grid>

            {/* 内容区 */}
            <Grid cols={{ default: 1, lg: 3 }} gap={4}>
              <div className="lg:col-span-2">
                <Card title="最近活动">
                  <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-linear-to-br from-primary-400 to-primary-500 rounded shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            活动 {i}
                          </p>
                          <p className="text-xs text-gray-500">
                            2024年12月23日
                          </p>
                        </div>
                      </div>
                    ))}
                  </Stack>
                </Card>
              </div>

              <Stack spacing={4}>
                <Card title="快捷操作">
                  <Stack spacing={2}>
                    <button className="w-full px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm">
                      创建活动
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      导入数据
                    </button>
                  </Stack>
                </Card>

                <Card title="本周统计">
                  <Stack spacing={2}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">新增</span>
                      <span className="font-semibold text-gray-900">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">完成</span>
                      <span className="font-semibold text-gray-900">8</span>
                    </div>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </div>

      {/* 设计规范 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📐 设计规范
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Container: 限制最大宽度 (sm/md/lg/xl/2xl)，内容居中</li>
          <li>
            ✅ Stack: 简化垂直/水平间距布局，spacing 使用数字 (0/1/2/3/4/6/8/12)
          </li>
          <li>✅ Grid: 响应式网格，支持 1-6 列，gap 使用数字</li>
          <li>✅ 间距基于 8px 网格: 2=8px / 4=16px / 6=24px / 8=32px</li>
          <li>✅ 优先使用组件而非手写 flex/grid</li>
          <li>⚠️ 避免过度嵌套，保持结构扁平</li>
        </ul>
      </div>
    </div>
  );
};

export default LayoutShowcase;
