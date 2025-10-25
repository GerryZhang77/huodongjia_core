import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  NavBar,
  Card,
  Button,
  Form,
  Input,
  Selector,
  Stepper,
  Switch,
  Toast,
  Space,
  Divider,
  List,
  Tag,
  ActionSheet,
  Dialog
} from 'antd-mobile';
import { LeftOutline, MoreOutline } from 'antd-mobile-icons';
import { useAppStore } from '../store';

const MatchConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, matchRules, matchGroups, addMatchRule, updateMatchRule, addMatchGroup, clearMatchGroups } = useAppStore();
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'results'>('rules');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const activity = activities.find(a => a.id === id);

  useEffect(() => {
    if (!activity) {
      Toast.show('活动不存在');
      navigate('/dashboard');
    }
  }, [activity, navigate]);

  // 匹配规则选项
  const ruleTypeOptions = [
    { label: '年龄匹配', value: 'age' },
    { label: '性别匹配', value: 'gender' },
    { label: '兴趣爱好', value: 'interests' },
    { label: '地理位置', value: 'location' },
    { label: '技能水平', value: 'skill' }
  ];

  const priorityOptions = [
    { label: '高', value: 'high' },
    { label: '中', value: 'medium' },
    { label: '低', value: 'low' }
  ];

  // 添加匹配规则
  const handleAddRule = async (values: any) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const newRule = {
        id: Date.now().toString(),
        activityId: id,
        type: values.type,
        priority: values.priority,
        weight: values.weight || 1,
        enabled: values.enabled !== false,
        conditions: values.conditions || {},
        createdAt: new Date().toISOString()
      };
      
      addMatchRule(newRule);
      form.resetFields();
      Toast.show('规则添加成功');
    } catch (error) {
      Toast.show('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 执行智能匹配
  const handleRunMatch = async () => {
    if (!id) return;
    
    const activityRules = matchRules.filter(rule => rule.activityId === id && rule.enabled);
    
    if (activityRules.length === 0) {
      Toast.show('请先添加匹配规则');
      return;
    }

    setLoading(true);
    try {
      // 清除之前的匹配结果
      clearMatchGroups(id);
      
      // 模拟匹配算法
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成模拟匹配结果
      const mockGroups = [
        {
          id: '1',
          activityId: id,
          name: '小组A',
          members: [
            { id: '1', name: '张三', age: 25, gender: '男', interests: ['运动', '音乐'] },
            { id: '2', name: '李四', age: 26, gender: '女', interests: ['运动', '阅读'] },
            { id: '3', name: '王五', age: 24, gender: '男', interests: ['音乐', '电影'] }
          ],
          matchScore: 0.85,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          activityId: id,
          name: '小组B',
          members: [
            { id: '4', name: '赵六', age: 28, gender: '女', interests: ['旅行', '摄影'] },
            { id: '5', name: '钱七', age: 27, gender: '男', interests: ['旅行', '美食'] },
            { id: '6', name: '孙八', age: 29, gender: '女', interests: ['摄影', '艺术'] }
          ],
          matchScore: 0.78,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          activityId: id,
          name: '小组C',
          members: [
            { id: '7', name: '周九', age: 23, gender: '男', interests: ['游戏', '科技'] },
            { id: '8', name: '吴十', age: 22, gender: '女', interests: ['游戏', '动漫'] }
          ],
          matchScore: 0.72,
          createdAt: new Date().toISOString()
        }
      ];
      
      mockGroups.forEach(group => addMatchGroup(group));
      
      Toast.show('匹配完成！');
      setActiveTab('results');
    } catch (error) {
      Toast.show('匹配失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除规则
  const handleDeleteRule = (ruleId: string) => {
    Dialog.confirm({
      content: '确定要删除这个匹配规则吗？',
      onConfirm: () => {
        // 这里应该调用删除规则的方法
        Toast.show('规则已删除');
      }
    });
  };

  // 导出匹配结果
  const handleExportResults = () => {
    const activityGroups = matchGroups.filter(group => group.activityId === id);
    
    if (activityGroups.length === 0) {
      Toast.show('暂无匹配结果');
      return;
    }
    
    // 模拟导出功能
    Toast.show('匹配结果已导出');
  };

  const activityRules = matchRules.filter(rule => rule.activityId === id);
  const activityGroups = matchGroups.filter(group => group.activityId === id);

  if (!activity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        back="返回"
        onBack={() => navigate(`/activities/${id}`)}
        right={
          <MoreOutline 
            fontSize={20} 
            onClick={() => setShowActionSheet(true)}
          />
        }
      >
        匹配配置
      </NavBar>

      <div className="p-4">
        {/* 活动信息 */}
        <Card className="mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={activity.coverImage} 
              alt={activity.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{activity.title}</h3>
              <p className="text-gray-600 text-sm">
                报名人数：{activity.currentParticipants}/{activity.maxParticipants}
              </p>
            </div>
          </div>
        </Card>

        {/* 标签页切换 */}
        <div className="flex bg-white rounded-lg mb-4 p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-center transition-colors ${
              activeTab === 'rules' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('rules')}
          >
            匹配规则
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-center transition-colors ${
              activeTab === 'results' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('results')}
          >
            匹配结果
          </button>
        </div>

        {/* 匹配规则页面 */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            {/* 添加规则表单 */}
            <Card title="添加匹配规则">
              <Form
                form={form}
                onFinish={handleAddRule}
                footer={
                  <Button 
                    block 
                    type="submit" 
                    color="primary"
                    loading={loading}
                  >
                    添加规则
                  </Button>
                }
              >
                <Form.Item name="type" label="规则类型" rules={[{ required: true }]}>
                  <Selector options={ruleTypeOptions} />
                </Form.Item>
                
                <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
                  <Selector options={priorityOptions} />
                </Form.Item>
                
                <Form.Item name="weight" label="权重">
                  <Stepper min={1} max={10} defaultValue={1} />
                </Form.Item>
                
                <Form.Item name="enabled" label="启用规则" valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Form>
            </Card>

            {/* 现有规则列表 */}
            <Card title="当前规则">
              {activityRules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无匹配规则，请添加规则
                </div>
              ) : (
                <List>
                  {activityRules.map((rule) => (
                    <List.Item
                      key={rule.id}
                      extra={
                        <Space>
                          <Tag color={rule.enabled ? 'success' : 'default'}>
                            {rule.enabled ? '启用' : '禁用'}
                          </Tag>
                          <Button
                            size="mini"
                            color="danger"
                            fill="none"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            删除
                          </Button>
                        </Space>
                      }
                    >
                      <div>
                        <div className="font-medium">
                          {ruleTypeOptions.find(opt => opt.value === rule.type)?.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          优先级：{priorityOptions.find(opt => opt.value === rule.priority)?.label} | 
                          权重：{rule.weight}
                        </div>
                      </div>
                    </List.Item>
                  ))}
                </List>
              )}
            </Card>

            {/* 执行匹配按钮 */}
            {activityRules.length > 0 && (
              <Button
                block
                color="primary"
                size="large"
                loading={loading}
                onClick={handleRunMatch}
              >
                执行智能匹配
              </Button>
            )}
          </div>
        )}

        {/* 匹配结果页面 */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {activityGroups.length === 0 ? (
              <Card>
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">暂无匹配结果</p>
                  <Button 
                    color="primary" 
                    onClick={() => setActiveTab('rules')}
                  >
                    去设置匹配规则
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* 匹配统计 */}
                <Card>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-500">
                        {activityGroups.length}
                      </div>
                      <div className="text-sm text-gray-600">匹配小组</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">
                        {activityGroups.reduce((sum, group) => sum + group.members.length, 0)}
                      </div>
                      <div className="text-sm text-gray-600">匹配成员</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">
                        {Math.round(activityGroups.reduce((sum, group) => sum + group.matchScore, 0) / activityGroups.length * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">平均匹配度</div>
                    </div>
                  </div>
                </Card>

                {/* 匹配结果列表 */}
                {activityGroups.map((group) => (
                  <Card key={group.id} title={group.name}>
                    <div className="mb-3">
                      <Tag color="primary">
                        匹配度：{Math.round(group.matchScore * 100)}%
                      </Tag>
                      <Tag color="default">
                        {group.members.length}人
                      </Tag>
                    </div>
                    
                    <div className="space-y-2">
                      {group.members.map((member) => (
                        <div 
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-600">
                              {member.age}岁 · {member.gender}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">兴趣爱好</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.interests.map((interest, index) => (
                                <Tag key={index} color="default" className="text-xs">
                                  {interest}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}

                {/* 导出按钮 */}
                <Button
                  block
                  color="primary"
                  size="large"
                  onClick={handleExportResults}
                >
                  导出匹配结果
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 操作菜单 */}
      <ActionSheet
        visible={showActionSheet}
        actions={[
          { text: '重新匹配', key: 'rematch' },
          { text: '清空结果', key: 'clear', danger: true },
          { text: '匹配设置', key: 'settings' }
        ]}
        onClose={() => setShowActionSheet(false)}
        onAction={(action) => {
          setShowActionSheet(false);
          switch (action.key) {
            case 'rematch':
              handleRunMatch();
              break;
            case 'clear':
              Dialog.confirm({
                content: '确定要清空所有匹配结果吗？',
                onConfirm: () => {
                  if (id) {
                    clearMatchGroups(id);
                    Toast.show('匹配结果已清空');
                  }
                }
              });
              break;
            case 'settings':
              setActiveTab('rules');
              break;
          }
        }}
      />
    </div>
  );
};

export default MatchConfig;