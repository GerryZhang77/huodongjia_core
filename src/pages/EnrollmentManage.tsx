import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Button, 
  Card, 
  NavBar, 
  Tag, 
  Space,
  Tabs,
  List,
  Checkbox,
  Selector,
  Toast,
  Modal,
  TextArea,
  ActionSheet
} from 'antd-mobile'
import { LeftOutline, UploadOutline, FilterOutline, SendOutline } from 'antd-mobile-icons'
import { useAppStore } from '../store'
import { mockEnrollments } from '../utils/mockData'
import type { Enrollment } from '../store'

const EnrollmentManage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    activities, 
    currentActivity, 
    setCurrentActivity,
    enrollments,
    addEnrollments,
    updateEnrollmentStatus
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('list')
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: [] as string[],
    gender: [] as string[],
    city: [] as string[]
  })
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationContent, setNotificationContent] = useState('')

  useEffect(() => {
    if (id) {
      const activity = activities.find(a => a.id === id)
      if (activity) {
        setCurrentActivity(activity)
        
        // 初始化mock报名数据
        const activityEnrollments = enrollments.filter(e => e.activityId === id)
        if (activityEnrollments.length === 0) {
          addEnrollments(mockEnrollments.filter(e => e.activityId === id))
        }
      } else {
        Toast.show({
          icon: 'fail',
          content: '活动不存在'
        })
        navigate('/dashboard')
      }
    }
  }, [id, activities, setCurrentActivity, navigate, enrollments, addEnrollments])

  const activityEnrollments = enrollments.filter(e => e.activityId === id)
  
  // 应用筛选条件
  const filteredEnrollments = activityEnrollments.filter(enrollment => {
    if (filters.status.length > 0 && !filters.status.includes(enrollment.status)) {
      return false
    }
    if (filters.gender.length > 0 && !filters.gender.includes(enrollment.gender)) {
      return false
    }
    if (filters.city.length > 0 && !filters.city.includes(enrollment.city)) {
      return false
    }
    return true
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEnrollments(filteredEnrollments.map(e => e.id))
    } else {
      setSelectedEnrollments([])
    }
  }

  const handleSelectEnrollment = (enrollmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedEnrollments(prev => [...prev, enrollmentId])
    } else {
      setSelectedEnrollments(prev => prev.filter(id => id !== enrollmentId))
    }
  }

  const handleBatchAction = (action: 'approve' | 'reject') => {
    selectedEnrollments.forEach(id => {
      updateEnrollmentStatus(id, action === 'approve' ? 'approved' : 'rejected')
    })
    
    Toast.show({
      icon: 'success',
      content: `已${action === 'approve' ? '通过' : '拒绝'}${selectedEnrollments.length}个报名`
    })
    
    setSelectedEnrollments([])
  }

  const handleSendNotification = () => {
    if (selectedEnrollments.length === 0) {
      Toast.show({
        icon: 'fail',
        content: '请先选择要通知的用户'
      })
      return
    }
    setShowNotificationModal(true)
  }

  const confirmSendNotification = () => {
    if (!notificationContent.trim()) {
      Toast.show({
        icon: 'fail',
        content: '请输入通知内容'
      })
      return
    }

    // Mock发送通知
    Toast.show({
      icon: 'success',
      content: `已向${selectedEnrollments.length}位用户发送通知`
    })
    
    setShowNotificationModal(false)
    setNotificationContent('')
    setSelectedEnrollments([])
  }

  const handleImportData = () => {
    // Mock导入数据
    const mockNewEnrollments = [
      {
        activityId: id!,
        name: '赵六',
        gender: 'male' as const,
        age: 29,
        profession: '数据分析师',
        contact: '13400134006',
        city: '成都',
        bio: '专注数据挖掘和商业智能分析',
        requirements: '希望学习最新的AI技术应用',
        tags: ['数据分析', 'AI', '商业智能'],
        status: 'pending' as const
      }
    ]
    
    addEnrollments(mockNewEnrollments)
    
    Toast.show({
      icon: 'success',
      content: '导入成功，新增1条报名记录'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      default: return 'warning'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '已通过'
      case 'rejected': return '已拒绝'
      default: return '待审核'
    }
  }

  if (!currentActivity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        left={
          <Button
            fill="none"
            onClick={() => navigate(`/activities/${currentActivity.id}`)}
          >
            <LeftOutline />
          </Button>
        }
        className="bg-white border-b border-gray-200"
      >
        报名管理
      </NavBar>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="bg-white"
      >
        <Tabs.Tab title="报名列表" key="list">
          <div className="p-4 space-y-4">
            {/* 操作工具栏 */}
            <Card>
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    共 {filteredEnrollments.length} 条记录
                    {selectedEnrollments.length > 0 && (
                      <span className="text-blue-600 ml-2">
                        已选择 {selectedEnrollments.length} 条
                      </span>
                    )}
                  </span>
                  <Button
                    size="small"
                    fill="outline"
                    onClick={() => {
                      ActionSheet.show({
                        actions: [
                          { text: '全部', key: 'all' },
                          { text: '已通过', key: 'approved' },
                          { text: '已拒绝', key: 'rejected' },
                          { text: '待审核', key: 'pending' }
                        ].map(item => ({
                          ...item,
                          onClick: () => {
                            if (item.key === 'all') {
                              setFilters(prev => ({ ...prev, status: [] }))
                            } else {
                              setFilters(prev => ({ ...prev, status: [item.key] }))
                            }
                          }
                        })),
                        cancelText: '取消'
                      })
                    }}
                  >
                    <FilterOutline className="mr-1" />
                    筛选
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <Checkbox
                    checked={selectedEnrollments.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                    indeterminate={selectedEnrollments.length > 0 && selectedEnrollments.length < filteredEnrollments.length}
                    onChange={handleSelectAll}
                  >
                    全选
                  </Checkbox>
                  
                  {selectedEnrollments.length > 0 && (
                    <Space>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleBatchAction('approve')}
                      >
                        批量通过
                      </Button>
                      <Button
                        size="small"
                        color="danger"
                        onClick={() => handleBatchAction('reject')}
                      >
                        批量拒绝
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={handleSendNotification}
                      >
                        <SendOutline className="mr-1" />
                        发送通知
                      </Button>
                    </Space>
                  )}
                </div>
              </Space>
            </Card>

            {/* 报名列表 */}
            <List>
              {filteredEnrollments.map((enrollment) => (
                <List.Item
                  key={enrollment.id}
                  prefix={
                    <Checkbox
                      checked={selectedEnrollments.includes(enrollment.id)}
                      onChange={(checked) => handleSelectEnrollment(enrollment.id, checked)}
                    />
                  }
                  extra={
                    <Tag color={getStatusColor(enrollment.status)}>
                      {getStatusText(enrollment.status)}
                    </Tag>
                  }
                  description={
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>{enrollment.gender === 'male' ? '男' : '女'} · {enrollment.age}岁 · {enrollment.profession}</div>
                      <div>📱 {enrollment.contact}</div>
                      <div>📍 {enrollment.city}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {enrollment.tags.map((tag, index) => (
                          <Tag key={index} color="primary" className="text-xs">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <div className="font-medium">{enrollment.name}</div>
                </List.Item>
              ))}
            </List>
          </div>
        </Tabs.Tab>

        <Tabs.Tab title="导入数据" key="import">
          <div className="p-4 space-y-4">
            <Card title="导入报名信息">
              <Space direction="vertical" className="w-full">
                <div className="text-sm text-gray-600 mb-4">
                  支持导入 CSV、XLS、XLSX 格式的文件，系统会自动识别表头并映射到相应字段。
                </div>
                
                <Button
                  block
                  color="primary"
                  onClick={handleImportData}
                >
                  <UploadOutline className="mr-2" />
                  选择文件导入
                </Button>
                
                <div className="text-xs text-gray-500 mt-2">
                  <div className="font-medium mb-1">支持的字段：</div>
                  <div>姓名、性别、年龄、职业、联系方式、城市、个人简介、匹配需求、标签等</div>
                </div>
              </Space>
            </Card>

            <Card title="字段映射说明">
              <div className="text-sm text-gray-600 space-y-2">
                <div><span className="font-medium">必填字段：</span>姓名、性别、联系方式</div>
                <div><span className="font-medium">可选字段：</span>年龄、职业、城市、个人简介、匹配需求、标签</div>
                <div><span className="font-medium">数据格式：</span>性别请使用"男/女"或"male/female"</div>
              </div>
            </Card>
          </div>
        </Tabs.Tab>
      </Tabs>

      {/* 发送通知弹窗 */}
      <Modal
        visible={showNotificationModal}
        title="发送通知"
        onClose={() => setShowNotificationModal(false)}
        content={
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              将向 {selectedEnrollments.length} 位用户发送通知
            </div>
            <TextArea
              placeholder="请输入通知内容..."
              value={notificationContent}
              onChange={setNotificationContent}
              rows={4}
              showCount
              maxLength={200}
            />
          </div>
        }
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setShowNotificationModal(false)
          },
          {
            key: 'confirm',
            text: '发送',
            primary: true,
            onClick: confirmSendNotification
          }
        ]}
      />
    </div>
  )
}

export default EnrollmentManage