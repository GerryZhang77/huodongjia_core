/**
 * SendNotificationDialog Component - 发送通知对话框
 * 支持批准、拒绝、自定义三种通知类型
 */

import { FC, useState, useEffect } from "react";
import { Modal, Form, Input, Radio, Space, TextArea } from "antd-mobile";
import type { NotificationType } from "@/features/enrollment/types";

/**
 * 通知类型配置
 */
const NOTIFICATION_TYPES = [
  {
    value: "approval" as const,
    label: "批准通过",
    title: "报名审核通过通知",
    defaultContent:
      "恭喜您！您的活动报名已通过审核，期待您的参与。请准时参加活动，如有问题请及时联系我们。",
  },
  {
    value: "rejection" as const,
    label: "拒绝报名",
    title: "报名审核未通过通知",
    defaultContent:
      "很抱歉，您的活动报名未能通过审核。感谢您的关注，欢迎参加我们的其他活动。",
  },
  {
    value: "custom" as const,
    label: "自定义通知",
    title: "",
    defaultContent: "",
  },
];

/**
 * 组件 Props
 */
export interface SendNotificationDialogProps {
  visible: boolean;
  recipientCount: number; // 接收通知的人数
  onClose: () => void;
  onConfirm: (type: NotificationType, title: string, content: string) => void;
}

/**
 * 发送通知对话框组件
 */
export const SendNotificationDialog: FC<SendNotificationDialogProps> = ({
  visible,
  recipientCount,
  onClose,
  onConfirm,
}) => {
  const [form] = Form.useForm();
  const [notificationType, setNotificationType] =
    useState<NotificationType>("approval");
  const [loading, setLoading] = useState(false);

  // 监听通知类型变化，自动填充标题和内容
  useEffect(() => {
    if (!visible) return;

    const typeConfig = NOTIFICATION_TYPES.find(
      (t) => t.value === notificationType
    );
    if (typeConfig) {
      form.setFieldsValue({
        title: typeConfig.title,
        content: typeConfig.defaultContent,
      });
    }
  }, [notificationType, visible, form]);

  // 重置表单
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setNotificationType("approval");
    }
  }, [visible, form]);

  // 处理发送
  const handleSend = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 自定义类型必须填写标题
      if (notificationType === "custom" && !values.title?.trim()) {
        form.setFields([
          {
            name: "title",
            errors: ["自定义通知必须填写标题"],
          },
        ]);
        setLoading(false);
        return;
      }

      await onConfirm(notificationType, values.title, values.content);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("表单验证失败:", error);
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="发送通知"
      content={
        <div className="py-4">
          {/* 接收人数提示 */}
          <div className="mb-4 p-3 bg-primary-50 rounded-lg">
            <div className="text-sm text-gray-700">
              将向{" "}
              <span className="text-primary-600 font-semibold">
                {recipientCount}
              </span>{" "}
              人发送通知
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            footer={null}
            requiredMarkStyle="asterisk"
          >
            {/* 通知类型选择 */}
            <Form.Item label="通知类型" name="type">
              <Radio.Group
                value={notificationType}
                onChange={(val) => setNotificationType(val as NotificationType)}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {NOTIFICATION_TYPES.map((type) => (
                    <Radio
                      key={type.value}
                      value={type.value}
                      className="w-full"
                      style={{
                        "--font-size": "15px",
                        "--icon-size": "20px",
                      }}
                    >
                      <span className="text-gray-900">{type.label}</span>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>

            {/* 通知标题 */}
            <Form.Item
              label="通知标题"
              name="title"
              rules={[
                {
                  required: notificationType === "custom",
                  message: "自定义通知必须填写标题",
                },
                { max: 50, message: "标题最多50个字符" },
              ]}
              help={
                notificationType !== "custom" && (
                  <span className="text-xs text-gray-500">
                    系统将使用默认标题，也可以自定义
                  </span>
                )
              }
            >
              <Input
                placeholder={
                  notificationType === "custom"
                    ? "请输入通知标题"
                    : "可选，留空使用默认标题"
                }
                maxLength={50}
                className="rounded-lg"
              />
            </Form.Item>

            {/* 通知内容 */}
            <Form.Item
              label="通知内容"
              name="content"
              rules={[
                { required: true, message: "请输入通知内容" },
                { min: 10, message: "通知内容至少10个字符" },
                { max: 500, message: "通知内容最多500个字符" },
              ]}
            >
              <TextArea
                placeholder="请输入通知内容..."
                rows={4}
                maxLength={500}
                showCount
                className="rounded-lg"
              />
            </Form.Item>
          </Form>
        </div>
      }
      closeOnAction
      onClose={onClose}
      actions={[
        {
          key: "cancel",
          text: "取消",
          onClick: onClose,
        },
        {
          key: "confirm",
          text: loading ? "发送中..." : "发送",
          primary: true,
          disabled: loading,
          onClick: handleSend,
        },
      ]}
      bodyClassName="px-0"
    />
  );
};
