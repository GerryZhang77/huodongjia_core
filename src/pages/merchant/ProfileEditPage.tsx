/**
 * 商家端个人资料编辑页面
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  Input,
  TextArea,
  Button,
  ImageUploader,
  Picker,
  Switch,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import { PictureOutline } from "antd-mobile-icons";
import { MerchantLayout } from "@/components/layout";
import {
  merchantApi,
  uploadMerchantAvatar,
  type MerchantPrivacySettings,
} from "@/services";

// 行业选项
const industryOptions = [
  [
    { label: "互联网/IT", value: "internet" },
    { label: "金融/投资", value: "finance" },
    { label: "教育/培训", value: "education" },
    { label: "医疗/健康", value: "healthcare" },
    { label: "房地产/建筑", value: "realestate" },
    { label: "制造业", value: "manufacturing" },
    { label: "零售/电商", value: "retail" },
    { label: "文化/传媒", value: "media" },
    { label: "咨询/服务", value: "consulting" },
    { label: "其他", value: "other" },
  ],
];

// 默认隐私值（与后端迁移保持一致）
const DEFAULT_PRIVACY: Required<MerchantPrivacySettings> = {
  phone: false,
  email: false,
  wechat: false,
  company: false,
  city: false,
  industry: true,
  occupation: true,
  bio: true,
};

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [avatarList, setAvatarList] = useState<any[]>([]);
  const [industryVisible, setIndustryVisible] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<Required<MerchantPrivacySettings>>(DEFAULT_PRIVACY);

  // 拉真实商家资料
  const { data: profileResp, isLoading } = useQuery({
    queryKey: ["merchant", "profile"],
    queryFn: () => merchantApi.getMerchantProfile(),
  });
  const profile = profileResp?.profile;

  // 初始化表单数据
  useEffect(() => {
    if (!profile) return;
    form.setFieldsValue({
      name: profile.name || "",
      phone: profile.phone || "",
      email: profile.email || "",
      wechat: profile.wechat || "",
      company: profile.company || "",
      occupation: profile.occupation || "",
      city: profile.city || "",
      bio: profile.bio || "",
    });

    if (profile.avatar) {
      setAvatarList([{ url: profile.avatar, key: "avatar" }]);
    }

    if (profile.industry) {
      setSelectedIndustry([profile.industry]);
    }

    setPrivacy({ ...DEFAULT_PRIVACY, ...(profile.privacy_settings || {}) });
  }, [profile, form]);

  // 自动聚焦：从 ProfilePage 通过 ?focus=phone 跳过来
  useEffect(() => {
    if (!profile) return;
    const focus = searchParams.get("focus");
    if (!focus) return;
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(
        `input[name="${focus}"], textarea[name="${focus}"]`,
      );
      input?.focus();
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [profile, searchParams]);

  // 处理头像上传：直传后端，得到真实 url
  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadMerchantAvatar(file);
      if (res.success && res.data?.url) {
        Toast.show({ icon: "success", content: "头像上传成功" });
        return { url: res.data.url };
      }
      throw new Error(res.message || "上传失败");
    } catch (error) {
      Toast.show({ icon: "fail", content: "上传失败，请重试" });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 获取行业名称
  const getIndustryLabel = () => {
    if (selectedIndustry.length === 0) return "请选择";
    const option = industryOptions[0].find(
      (item) => item.value === selectedIndustry[0],
    );
    return option?.label || "请选择";
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        avatar: avatarList[0]?.url,
        industry: selectedIndustry[0],
        privacy_settings: privacy,
      };

      const res = await merchantApi.updateMerchantProfile(payload);
      if (!res.success) {
        Toast.show({ icon: "fail", content: res.message || "保存失败" });
        return;
      }

      Toast.show({ icon: "success", content: "资料已更新" });
      queryClient.invalidateQueries({ queryKey: ["merchant", "profile"] });
      navigate("/dashboard/profile");
    } catch (error) {
      console.error("提交失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 隐私开关行
  const PrivacyRow: React.FC<{
    fieldKey: keyof MerchantPrivacySettings;
    label: string;
    desc: string;
  }> = ({ fieldKey, label, desc }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
      </div>
      <Switch
        checked={!!privacy[fieldKey]}
        onChange={(v) => setPrivacy((prev) => ({ ...prev, [fieldKey]: v }))}
        style={{ "--checked-color": "var(--primary-500, #6366f1)" } as React.CSSProperties}
      />
    </div>
  );

  if (isLoading) {
    return (
      <MerchantLayout title="编辑资料" showBack onBack={() => navigate("/dashboard/profile")}>
        <div className="flex items-center justify-center h-64 text-gray-400">加载中...</div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout
      title="编辑资料"
      showBack
      onBack={() => navigate("/dashboard/profile")}
    >
      <div className="pb-24">
        <Form form={form} layout="vertical" className="space-y-4">
          {/* 头像区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                点击更换头像
              </p>
              <ImageUploader
                value={avatarList}
                onChange={setAvatarList}
                upload={handleAvatarUpload}
                maxCount={1}
                style={{ "--cell-size": "80px" } as React.CSSProperties}
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
                  {avatarList.length > 0 ? (
                    <img
                      src={avatarList[0].url}
                      alt="头像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PictureOutline className="text-2xl text-gray-400" />
                  )}
                </div>
              </ImageUploader>
              {uploading && (
                <p className="text-xs text-gray-400 mt-2">上传中...</p>
              )}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                基本信息
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: "请输入姓名" }]}
              >
                <Input
                  placeholder="请输入姓名"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: "请输入手机号" },
                  { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
                ]}
              >
                <Input
                  placeholder="请输入手机号"
                  type="tel"
                  maxLength={11}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ type: "email", message: "请输入正确的邮箱格式" }]}
              >
                <Input
                  placeholder="请输入邮箱 (选填)"
                  type="email"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item name="wechat" label="微信号">
                <Input
                  placeholder="请输入微信号 (选填)"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item name="city" label="所在城市">
                <Input
                  placeholder="如：上海"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>
            </div>
          </div>

          {/* 职业信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                职业信息
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <Form.Item name="company" label="公司/组织">
                <Input
                  placeholder="请输入公司或组织名称"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item name="occupation" label="职业 / 职位">
                <Input
                  placeholder="如：产品经理"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item label="所属行业">
                <div
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer"
                  onClick={() => setIndustryVisible(true)}
                >
                  <span
                    className={
                      selectedIndustry.length > 0
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-400"
                    }
                  >
                    {getIndustryLabel()}
                  </span>
                  <span className="text-gray-400">›</span>
                </div>
              </Form.Item>
            </div>
          </div>

          {/* 个人介绍 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                个人介绍
              </h3>
            </div>
            <div className="p-4">
              <Form.Item name="bio">
                <TextArea
                  placeholder="介绍一下自己，让参与者更了解你..."
                  maxLength={200}
                  showCount
                  rows={4}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>
            </div>
          </div>

          {/* 公开展示设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                公开展示设置
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                关闭的字段不会出现在你的公开主页中
              </p>
            </div>
            <div className="px-4 divide-y divide-gray-100 dark:divide-gray-700">
              <PrivacyRow fieldKey="phone" label="手机号" desc="开启后用户可看到你的手机号" />
              <PrivacyRow fieldKey="email" label="邮箱" desc="开启后用户可看到你的邮箱" />
              <PrivacyRow fieldKey="wechat" label="微信号" desc="开启后用户可看到你的微信号" />
              <PrivacyRow fieldKey="company" label="公司" desc="是否在公开主页展示公司信息" />
              <PrivacyRow fieldKey="city" label="城市" desc="是否在公开主页展示所在城市" />
            </div>
          </div>
        </Form>

        {/* 提交按钮 - 固定在底部 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-10">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              block
              fill="outline"
              onClick={() => navigate("/dashboard/profile")}
              className="flex-1"
              style={
                {
                  "--border-radius": "12px",
                  height: "44px",
                } as React.CSSProperties
              }
            >
              取消
            </Button>
            <Button
              block
              color="primary"
              loading={loading}
              onClick={handleSubmit}
              className="flex-1"
              style={
                {
                  "--border-radius": "12px",
                  height: "44px",
                } as React.CSSProperties
              }
            >
              保存
            </Button>
          </div>
        </div>

        {/* 行业选择器 */}
        <Picker
          columns={industryOptions}
          visible={industryVisible}
          onClose={() => setIndustryVisible(false)}
          value={selectedIndustry}
          onConfirm={(val) => {
            setSelectedIndustry(val as string[]);
          }}
        />
      </div>
    </MerchantLayout>
  );
};

export default ProfileEditPage;
