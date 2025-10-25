import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Button, 
  Form, 
  Input, 
  TextArea, 
  DatePicker, 
  NavBar, 
  Toast,
  ImageUploader,
  Card,
  Space
} from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { useAppStore } from '../store'

const ActivityCreate = () => {
  const navigate = useNavigate()
  const addActivity = useAppStore(state => state.addActivity)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<any[]>([])

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 处理封面图片
      const coverImageUrl = coverImage.length > 0 
        ? coverImage[0].url 
        : 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=event%20activity%20default%20cover%20modern%20design&image_size=landscape_16_9'

      // 创建活动
      addActivity({
        title: values.title,
        description: values.description,
        coverImage: coverImageUrl,
        status: 'recruiting',
        registrationStart: values.registrationStart.toISOString(),
        registrationEnd: values.registrationEnd.toISOString(),
        activityStart: values.activityStart.toISOString(),
        activityEnd: values.activityEnd.toISOString(),
        location: values.location,
        capacity: parseInt(values.capacity)
      })

      Toast.show({
        icon: 'success',
        content: '活动创建成功'
      })
      
      navigate('/dashboard')
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '创建失败，请重试'
      })
    } finally {
      setLoading(false)
    }
  }

  const mockUpload = async (file: File) => {
    // Mock上传，返回一个示例图片URL
    return {
      url: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=activity%20event%20cover%20image%20professional%20modern&image_size=landscape_16_9`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        left={
          <Button
            fill="none"
            onClick={() => navigate('/dashboard')}
          >
            <LeftOutline />
          </Button>
        }
        className="bg-white border-b border-gray-200"
      >
        创建活动
      </NavBar>

      <div className="p-4">
        <Card>
          <Form
            form={form}
            onFinish={handleSubmit}
            footer={
              <Button
                block
                type="submit"
                color="primary"
                size="large"
                loading={loading}
                className="mt-6"
              >
                创建活动
              </Button>
            }
          >
            <Form.Item
              name="title"
              label="活动名称"
              rules={[
                { required: true, message: '请输入活动名称' },
                { max: 40, message: '活动名称不能超过40个字符' }
              ]}
            >
              <Input placeholder="请输入活动名称（不超过40字）" clearable />
            </Form.Item>

            <Form.Item
              name="description"
              label="活动简介"
              rules={[
                { required: true, message: '请输入活动简介' },
                { max: 200, message: '活动简介不能超过200个字符' }
              ]}
            >
              <TextArea
                placeholder="请输入活动简介（不超过200字）"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="coverImage"
              label="封面图片"
              rules={[{ required: true, message: '请上传封面图片' }]}
            >
              <ImageUploader
                value={coverImage}
                onChange={setCoverImage}
                upload={mockUpload}
                maxCount={1}
                placeholder="点击上传封面图片"
              />
            </Form.Item>

            <Space direction="vertical" className="w-full">
              <div className="text-sm font-medium text-gray-700 mb-2">报名时间</div>
              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="registrationStart"
                  label="开始时间"
                  rules={[{ required: true, message: '请选择报名开始时间' }]}
                >
                  <DatePicker precision="minute">
                    {value => value ? value.toLocaleDateString() : '选择开始时间'}
                  </DatePicker>
                </Form.Item>

                <Form.Item
                  name="registrationEnd"
                  label="结束时间"
                  rules={[{ required: true, message: '请选择报名结束时间' }]}
                >
                  <DatePicker precision="minute">
                    {value => value ? value.toLocaleDateString() : '选择结束时间'}
                  </DatePicker>
                </Form.Item>
              </div>
            </Space>

            <Space direction="vertical" className="w-full">
              <div className="text-sm font-medium text-gray-700 mb-2">活动时间</div>
              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="activityStart"
                  label="开始时间"
                  rules={[{ required: true, message: '请选择活动开始时间' }]}
                >
                  <DatePicker precision="minute">
                    {value => value ? value.toLocaleDateString() : '选择开始时间'}
                  </DatePicker>
                </Form.Item>

                <Form.Item
                  name="activityEnd"
                  label="结束时间"
                  rules={[{ required: true, message: '请选择活动结束时间' }]}
                >
                  <DatePicker precision="minute">
                    {value => value ? value.toLocaleDateString() : '选择结束时间'}
                  </DatePicker>
                </Form.Item>
              </div>
            </Space>

            <Form.Item
              name="location"
              label="活动地点"
              rules={[{ required: true, message: '请输入活动地点' }]}
            >
              <Input placeholder="请输入活动地点" clearable />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="人数上限"
              rules={[
                { required: true, message: '请输入人数上限' },
                { pattern: /^\d+$/, message: '请输入有效的数字' }
              ]}
            >
              <Input placeholder="请输入人数上限" type="number" clearable />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default ActivityCreate