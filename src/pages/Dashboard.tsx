import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Button, 
  Card, 
  List, 
  Tag, 
  Toast, 
  PullToRefresh, 
  InfiniteScroll,
  Empty,
  SearchBar,
  Tabs
} from 'antd-mobile'
import { 
  AddOutline, 
  UserOutline, 
  CalendarOutline,
  LocationOutline,
  MoreOutline
} from 'antd-mobile-icons'
import { useStore } from '../store'

interface Activity {
  activity_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  max_participants: number
  current_participants: number
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, token } = useStore()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [hasMore, setHasMore] = useState(true)

  // 获取活动列表
  const fetchActivities = async (refresh = false) => {
    if (loading) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/my-events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        const newActivities = data.events || []
        if (refresh) {
          setActivities(newActivities)
        } else {
          setActivities(prev => [...prev, ...newActivities])
        }
        setHasMore(newActivities.length >= 10) // 假设每页10条
      } else {
        Toast.show(data.message || '获取活动列表失败')
      }
    } catch (error) {
      console.error('Fetch activities error:', error)
      Toast.show('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities(true)
  }, [])

  // 状态标签配置
  const getStatusTag = (status: string) => {
    const statusConfig = {
      draft: { text: '草稿', color: '#999' },
      published: { text: '已发布', color: '#1890ff' },
      ongoing: { text: '进行中', color: '#52c41a' },
      completed: { text: '已结束', color: '#722ed1' },
      cancelled: { text: '已取消', color: '#ff4d4f' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Tag color={config.color} fill="outline">{config.text}</Tag>
  }

  // 筛选活动
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchText.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    return matchesSearch && activity.status === activeTab
  })

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 计算参与率
  const getParticipationRate = (current: number, max: number) => {
    if (max === 0) return 0
    return Math.round((current / max) * 100)
  }

  const tabItems = [
    { key: 'all', title: '全部' },
    { key: 'published', title: '已发布' },
    { key: 'ongoing', title: '进行中' },
    { key: 'completed', title: '已结束' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
            <p className="text-sm text-gray-600">欢迎回来，{user?.name || '商家'}</p>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0) || '商'}
            </span>
          </div>
        </div>

        {/* 搜索框 */}
        <SearchBar
          placeholder="搜索活动名称或描述"
          value={searchText}
          onChange={setSearchText}
          style={{
            '--border-radius': '12px',
            '--background': '#f5f5f5',
            '--height': '40px',
          }}
        />
      </div>

      {/* 快捷操作 */}
      <div className="px-4 py-3">
        <Button
          color="primary"
          size="large"
          block
          onClick={() => navigate('/activity/create')}
          style={{
            '--border-radius': '12px',
            '--background-color': '#1890ff',
            height: '48px',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          <AddOutline className="mr-2" />
          创建新活动
        </Button>
      </div>

      {/* 状态筛选标签 */}
      <div className="bg-white">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{
            '--content-padding': '0',
            '--title-font-size': '14px',
          }}
        >
          {tabItems.map(item => (
            <Tabs.Tab title={item.title} key={item.key} />
          ))}
        </Tabs>
      </div>

      {/* 活动列表 */}
      <div className="px-4 pb-4">
        <PullToRefresh onRefresh={() => fetchActivities(true)}>
          {filteredActivities.length === 0 ? (
            <div className="mt-8">
              <Empty
                description="暂无活动"
                image="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=empty%20state%20illustration%20with%20calendar%20icon%20minimalist%20blue%20gray&image_size=square"
              />
              <div className="text-center mt-4">
                <Button
                  color="primary"
                  fill="outline"
                  onClick={() => navigate('/activity/create')}
                  style={{ '--border-radius': '12px' }}
                >
                  创建第一个活动
                </Button>
              </div>
            </div>
          ) : (
            <List>
              {filteredActivities.map((activity) => (
                <List.Item
                  key={activity.activity_id}
                  onClick={() => navigate(`/activity/${activity.activity_id}`)}
                  arrow={<MoreOutline />}
                  style={{
                    '--padding-left': '0',
                    '--padding-right': '0',
                  }}
                >
                  <Card
                    className="mb-3 shadow-sm"
                    style={{
                      '--border-radius': '12px',
                      '--header-border-bottom': 'none',
                      '--body-padding': '16px',
                    }}
                  >
                    <div className="space-y-3">
                      {/* 标题和状态 */}
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-medium text-gray-900 flex-1 mr-2">
                          {activity.title}
                        </h3>
                        {getStatusTag(activity.status)}
                      </div>

                      {/* 描述 */}
                      {activity.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {activity.description}
                        </p>
                      )}

                      {/* 时间和地点 */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarOutline className="mr-2 text-blue-500" />
                          <span>
                            {formatDate(activity.start_time)} - {formatDate(activity.end_time)}
                          </span>
                        </div>
                        
                        {activity.location && (
                          <div className="flex items-center text-sm text-gray-500">
                            <LocationOutline className="mr-2 text-blue-500" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                      </div>

                      {/* 参与情况 */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500">
                          <UserOutline className="mr-1 text-blue-500" />
                          <span>
                            {activity.current_participants}/{activity.max_participants} 人
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ 
                                width: `${getParticipationRate(activity.current_participants, activity.max_participants)}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {getParticipationRate(activity.current_participants, activity.max_participants)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              ))}
            </List>
          )}

          <InfiniteScroll
            loadMore={() => fetchActivities(false)}
            hasMore={hasMore}
          />
        </PullToRefresh>
      </div>
    </div>
  )
}

export default Dashboard