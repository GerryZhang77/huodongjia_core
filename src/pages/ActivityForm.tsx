import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Form,
  Input,
  TextArea,
  DatePicker,
  Button,
  NavBar,
  Toast,
  ImageUploader,
  Selector,
  Stepper,
  Switch,
  Card,
  Space
} from 'antd-mobile'
import { LeftOutline, PictureOutline } from 'antd-mobile-icons'
import { useStore } from '../store'

interface ActivityFormData {
  title: string
  description: string
  start_time: Date
  end_time: Date
  location: string
  max_participants: number
  registration_start: Date
  registration_end: Date
  category: string
  tags: string[]
  cover_image?: string
  requirements?: string
  contact_info?: string
  is_public: boolean
  allow_waitlist: boolean
}

const ActivityForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState<any[]>([])

  const isEdit = Boolean(id)

  // 活动分类选项
  const categoryOptions = [
    { label: '商务会议', value: 'business' },
    { label: '技术交流', value: 'tech' },
    { label: '社交聚会', value: 'social' },
    { label: '培训学习', value: 'training' },
    { label: '文化活动', value: 'culture' },
    { label: '体育运动', value: 'sports' },
    { label: '其他', value: 'other' }
  ]

  // 标签选项
  const tagOptions = [
    { label: '线上', value: 'online' },
    { label: '线下', value: 'offline' },
    { label: '免费', value: 'free' },
    { label: '付费', value: 'paid' },
    { label: '限时', value: 'limited' },
    { label: '热门', value: 'popular' },
    { label: '新手友好', value: 'beginner' },
    { label: '专业级', value: 'professional' }
  ]

  // 获取活动详情（编辑模式）
  const fetchActivityDetail = async () => {
    if (!id) return

    try {
      const response = await fetch(`/api/event-detail/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        const activity = data.event
        form.setFieldsValue({
          title: activity.title,
          description: activity.description,
          start_time: new Date(activity.start_time),
          end_time: new Date(activity.end_time),
          location: activity.location,
          max_participants: activity.max_participants,
          registration_start: new Date(activity.registration_start),
          registration_end: new Date(activity.registration_end),
          category: activity.category,
          tags: activity.tags || [],
          requirements: activity.requirements,
          contact_info: activity.contact_info,
          is_public: activity.is_public !== false,
          allow_waitlist: activity.allow_waitlist === true
        })

        if (activity.cover_image) {
          setFileList([{
            url: activity.cover_image,
            key: 'cover'
          }])
        }
      } else {
        Toast.show(data.message || '获取活动详情失败')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Fetch activity detail error:', error)
      Toast.show('网络错误，请重试')
      navigate('/dashboard')
    }
  }

  useEffect(() => {
    if (isEdit) {
      fetchActivityDetail()
    } else {
      // 新建活动时设置默认值
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      form.setFieldsValue({
        registration_start: now,
        registration_end: tomorrow,
        start_time: tomorrow,
        end_time: nextWeek,
        max_participants: 50,
        is_public: true,
        allow_waitlist: false,
        category: 'business',
        tags: []
      })
    }
  }, [id, isEdit])

  // 图片上传
  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      
      if (data.success) {
        return {
          url: data.url,
          key: Date.now().toString()
        }
      } else {
        Toast.show(data.message || '图片上传失败')
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      Toast.show('图片上传失败，请重试')
      throw error
    } finally {
      setUploading(false)
    }
  }

  // 表单提交
  const handleSubmit = async (values: ActivityFormData) => {
    setLoading(true)
    try {
      const submitData = {
        ...values,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        registration_start: values.registration_start.toISOString(),
        registration_end: values.registration_end.toISOString(),
        cover_image: fileList[0]?.url || null,
        tags: values.tags || []
      }

      const url = isEdit ? `/api/update-event/${id}` : '/api/create-event'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()
      
      if (data.success) {
        Toast.show(isEdit ? '活动更新成功' : '活动创建成功')
        navigate('/dashboard')
      } else {
        Toast.show(data.message || (isEdit ? '更新失败' : '创建失败'))
      }
    } catch (error) {
      console.error('Submit error:', error)
      Toast.show('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 表单验证
  const validateForm = (values: any) => {
    const errors: any = {}

    if (!values.title?.trim()) {
      errors.title = '请输入活动标题'
    }

    if (!values.description?.trim()) {
      errors.description = '请输入活动描述'
    }

    if (!values.location?.trim()) {
      errors.location = '请输入活动地点'
    }

    if (values.max_participants < 1) {
      errors.max_participants = '参与人数至少为1人'
    }

    if (values.registration_start >= values.registration_end) {
      errors.registration_end = '报名结束时间必须晚于开始时间'
    }

    if (values.start_time >= values.end_time) {
      errors.end_time = '活动结束时间必须晚于开始时间'
    }

    if (values.registration_end > values.start_time) {
      errors.registration_end = '报名结束时间不能晚于活动开始时间'
    }

    return errors
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        back="返回"
        onBack={() => navigate('/dashboard')}
        style={{
          '--height': '48px',
          '--border-bottom': '1px solid #f0f0f0',
        }}
      >
        {isEdit ? '编辑活动' : '创建活动'}
      </NavBar>

      <div className="p-4">
        <Form
          form={form}
          onFinish={handleSubmit}
          validateTrigger="onBlur"
          mode="card"
          style={{
            '--border-radius': '12px',
          }}
        >
          {/* 基本信息 */}
          <Card title="基本信息" className="mb-4" style={{ '--border-radius': '12px' }}>
            <Form.Item
              name="title"
              label="活动标题"
              rules={[{ required: true, message: '请输入活动标题' }]}
            >
              <Input
                placeholder="请输入活动标题"
                maxLength={50}
                showCount
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="活动描述"
              rules={[{ required: true, message: '请输入活动描述' }]}
            >
              <TextArea
                placeholder="请详细描述活动内容、目的和亮点"
                maxLength={500}
                showCount
                rows={4}
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>

            <Form.Item name="category" label="活动分类">
              <Selector
                options={categoryOptions}
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>

            <Form.Item name="tags" label="活动标签">
              <Selector
                options={tagOptions}
                multiple
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>

            <Form.Item name="cover_image" label="封面图片">
              <ImageUploader
                value={fileList}
                onChange={setFileList}
                upload={handleImageUpload}
                maxCount={1}
                style={{ '--border-radius': '8px' }}
              >
                <div className="flex flex-col items-center justify-center h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <PictureOutline className="text-2xl text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">
                    {uploading ? '上传中...' : '点击上传封面'}
                  </span>
                </div>
              </ImageUploader>
            </Form.Item>
          </Card>

          {/* 时间地点 */}
          <Card title="时间地点" className="mb-4" style={{ '--border-radius': '12px' }}>
            <Form.Item
              name="location"
              label="活动地点"
              rules={[{ required: true, message: '请输入活动地点' }]}
            >
              <Input
                placeholder="请输入详细地址"
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="start_time"
              label="开始时间"
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <DatePicker precision="minute">
                {value => value ? value.toLocaleString() : '请选择开始时间'}
              </DatePicker>
            </Form.Item>

            <Form.Item
              name="end_time"
              label="结束时间"
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <DatePicker precision="minute">
                {value => value ? value.toLocaleString() : '请选择结束时间'}
              </DatePicker>
            </Form.Item>
          </Card>

          {/* 报名设置 */}
          <Card title="报名设置" className="mb-4" style={{ '--border-radius': '12px' }}>
            <Form.Item
              name="registration_start"
              label="报名开始"
              rules={[{ required: true, message: '请选择报名开始时间' }]}
            >
              <DatePicker precision="minute">
                {value => value ? value.toLocaleString() : '请选择报名开始时间'}
              </DatePicker>
            </Form.Item>

            <Form.Item
              name="registration_end"
              label="报名截止"
              rules={[{ required: true, message: '请选择报名截止时间' }]}
            >
              <DatePicker precision="minute">
                {value => value ? value.toLocaleString() : '请选择报名截止时间'}
              </DatePicker>
            </Form.Item>

            <Form.Item
              name="max_participants"
              label="最大参与人数"
              rules={[{ required: true, message: '请设置参与人数' }]}
            >
              <Stepper
                min={1}
                max={1000}
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>

            <Form.Item name="allow_waitlist" label="允许候补">
              <Switch />
            </Form.Item>

            <Form.Item name="is_public" label="公开活动">
              <Switch />
            </Form.Item>
          </Card>

          {/* 其他信息 */}
          <Card title="其他信息" className="mb-4" style={{ '--border-radius': '12px' }}>
            <Form.Item name="requirements" label="参与要求">
              <TextArea
                placeholder="请描述参与者需要满足的条件或准备的物品"
                maxLength={200}
                showCount
                rows={3}
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>

            <Form.Item name="contact_info" label="联系方式">
              <Input
                placeholder="请输入联系电话或微信号"
                style={{ '--border-radius': '8px' }}
              />
            </Form.Item>
          </Card>

          {/* 提交按钮 */}
          <div className="mt-6 space-y-3">
            <Button
              type="submit"
              color="primary"
              size="large"
              block
              loading={loading}
              style={{
                '--border-radius': '12px',
                '--background-color': '#1890ff',
                height: '48px',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              {loading ? (isEdit ? '更新中...' : '创建中...') : (isEdit ? '更新活动' : '创建活动')}
            </Button>

            <Button
              size="large"
              block
              fill="outline"
              onClick={() => navigate('/dashboard')}
              style={{
                '--border-radius': '12px',
                height: '48px',
                fontSize: '16px',
              }}
            >
              取消
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default ActivityForm