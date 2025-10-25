import { Activity, Enrollment } from '../store'

export const mockActivities: Activity[] = [
  {
    id: '1',
    title: '科技创新交流会',
    description: '汇聚科技行业精英，探讨前沿技术趋势，促进跨领域合作与创新。',
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=technology%20innovation%20conference%20modern%20blue%20theme&image_size=landscape_16_9',
    status: 'recruiting',
    registrationStart: '2024-01-15T00:00:00Z',
    registrationEnd: '2024-01-25T23:59:59Z',
    activityStart: '2024-02-01T09:00:00Z',
    activityEnd: '2024-02-01T18:00:00Z',
    location: '上海国际会议中心',
    capacity: 100,
    enrolledCount: 45,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    title: '投资人与创业者对接会',
    description: '为优秀创业项目与投资机构搭建桥梁，促进资本与项目的精准匹配。',
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=business%20networking%20event%20professional%20meeting%20room&image_size=landscape_16_9',
    status: 'ongoing',
    registrationStart: '2024-01-01T00:00:00Z',
    registrationEnd: '2024-01-20T23:59:59Z',
    activityStart: '2024-01-22T14:00:00Z',
    activityEnd: '2024-01-22T20:00:00Z',
    location: '北京金融街威斯汀大酒店',
    capacity: 80,
    enrolledCount: 72,
    createdAt: '2023-12-25T09:00:00Z',
    updatedAt: '2024-01-20T16:45:00Z'
  },
  {
    id: '3',
    title: '医疗健康产业峰会',
    description: '聚焦医疗健康领域最新发展，邀请行业专家分享前沿技术与市场趋势。',
    coverImage: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20healthcare%20summit%20professional%20conference%20hall&image_size=landscape_16_9',
    status: 'ended',
    registrationStart: '2023-12-01T00:00:00Z',
    registrationEnd: '2023-12-15T23:59:59Z',
    activityStart: '2023-12-20T09:00:00Z',
    activityEnd: '2023-12-20T17:00:00Z',
    location: '深圳会展中心',
    capacity: 150,
    enrolledCount: 138,
    createdAt: '2023-11-20T11:00:00Z',
    updatedAt: '2023-12-20T18:00:00Z'
  }
]

export const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    activityId: '1',
    name: '张伟',
    gender: 'male',
    age: 32,
    profession: '软件工程师',
    contact: '13800138001',
    city: '上海',
    bio: '10年软件开发经验，专注于人工智能和机器学习领域',
    requirements: '希望结识投资人和产品经理，探讨AI技术商业化',
    tags: ['人工智能', '机器学习', '技术创新'],
    status: 'approved',
    createdAt: '2024-01-16T09:30:00Z'
  },
  {
    id: '2',
    activityId: '1',
    name: '李娜',
    gender: 'female',
    age: 28,
    profession: '产品经理',
    contact: '13900139002',
    city: '北京',
    bio: '5年产品管理经验，擅长用户体验设计和数据分析',
    requirements: '寻找技术合伙人，共同开发创新产品',
    tags: ['产品设计', '用户体验', '数据分析'],
    status: 'approved',
    createdAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '3',
    activityId: '1',
    name: '王强',
    gender: 'male',
    age: 35,
    profession: '投资经理',
    contact: '13700137003',
    city: '深圳',
    bio: '专注早期科技项目投资，关注AI、区块链等前沿技术',
    requirements: '寻找优质科技创业项目进行投资',
    tags: ['投资', '科技', '创业'],
    status: 'pending',
    createdAt: '2024-01-17T10:15:00Z'
  },
  {
    id: '4',
    activityId: '1',
    name: '陈美',
    gender: 'female',
    age: 30,
    profession: '市场总监',
    contact: '13600136004',
    city: '广州',
    bio: '8年市场营销经验，专长品牌建设和数字化营销',
    requirements: '希望了解最新技术趋势，拓展业务合作机会',
    tags: ['市场营销', '品牌建设', '数字化'],
    status: 'approved',
    createdAt: '2024-01-17T16:45:00Z'
  },
  {
    id: '5',
    activityId: '1',
    name: '刘洋',
    gender: 'male',
    age: 26,
    profession: '创业者',
    contact: '13500135005',
    city: '杭州',
    bio: '连续创业者，目前专注于教育科技领域',
    requirements: '寻找投资人和技术合伙人',
    tags: ['创业', '教育科技', '产品开发'],
    status: 'rejected',
    createdAt: '2024-01-18T11:30:00Z'
  }
]

export const getStatusText = (status: Activity['status']) => {
  const statusMap = {
    recruiting: '报名中',
    recruiting_ended: '报名结束',
    ongoing: '活动中',
    ended: '活动结束'
  }
  return statusMap[status]
}

export const getStatusColor = (status: Activity['status']) => {
  const colorMap = {
    recruiting: 'text-green-600 bg-green-100',
    recruiting_ended: 'text-orange-600 bg-orange-100',
    ongoing: 'text-blue-600 bg-blue-100',
    ended: 'text-gray-600 bg-gray-100'
  }
  return colorMap[status]
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}