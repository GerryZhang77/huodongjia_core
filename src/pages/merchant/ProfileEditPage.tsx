/**
 * 商家端个人资料编辑页面
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  type MerchantProfileResponse,
  type MerchantPrivacySettings,
  type UpdateMerchantProfileRequest,
} from "@/services";
import { sanitizeRedirectPath } from "@/utils/redirect";
import { useMerchantProfile } from "@/features/merchant/hooks";
import { merchantQueryKeys } from "@/features/merchant/queryKeys";
import { useAuthStore } from "@/features/auth/stores";

const PROFILE_KEY = merchantQueryKeys.profile();

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

const getErrorMessage = (error: unknown) => {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return apiError.response?.data?.message || apiError.message || "保存失败，请重试";
};

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [avatarList, setAvatarList] = useState<any[]>([]);
  const [industryVisible, setIndustryVisible] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<Required<MerchantPrivacySettings>>(DEFAULT_PRIVACY);
  const returnPath = sanitizeRedirectPath(searchParams.get("redirect")) || "/dashboard/profile";
  const goBack = () => navigate(returnPath);

  // 拉真实商家资料
  const { data: profileResp, isLoading } = useMerchantProfile();
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

  const normalizeText = (value: unknown) => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed ? trimmed : null;
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload: UpdateMerchantProfileRequest = {
        ...values,
        avatar: avatarList[0]?.url ?? null,
        email: normalizeText(values.email),
        phone: normalizeText(values.phone),
        wechat: normalizeText(values.wechat),
        city: normalizeText(values.city),
        company: normalizeText(values.company),
        occupation: normalizeText(values.occupation),
        bio: normalizeText(values.bio),
        industry: selectedIndustry[0] ?? null,
        privacy_settings: privacy,
      };

      const res = await merchantApi.updateMerchantProfile(payload);
      if (!res.success) {
        Toast.show({ icon: "fail", content: res.message || "保存失败" });
        return;
      }

      const savedIdentity = res.data?.user;
      const savedName =
        savedIdentity?.name ?? String(payload.name || "").trim();
      const savedAvatar = savedIdentity?.avatar ?? payload.avatar ?? null;
      const savedPhone = savedIdentity?.phone ?? payload.phone ?? null;
      const savedOccupation =
        savedIdentity?.occupation ?? payload.occupation ?? null;
      const savedCompany = savedIdentity?.company ?? payload.company ?? null;

      queryClient.setQueryData<MerchantProfileResponse>(
        PROFILE_KEY,
        (current) =>
          current?.profile
            ? {
                ...current,
                profile: {
                  ...current.profile,
                  ...payload,
                  ...(savedIdentity || {}),
                },
              }
            : current,
      );
      updateUser({
        name: savedName,
        avatar: savedAvatar,
        phone: savedPhone,
        occupation: savedOccupation,
        company: savedCompany,
        ...(savedIdentity?.tags ? { tags: savedIdentity.tags } : {}),
      });

      Toast.show({ icon: "success", content: "资料已更新" });
      void queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      queryClient.removeQueries({ queryKey: ["nfc"] });
      const profileId = savedIdentity?.id || profile?.id;
      if (profileId) {
        void queryClient.invalidateQueries({
          queryKey: ["publicProfile", profileId],
        });
      }
      navigate(returnPath);
    } catch (error) {
      console.error("提交失败:", error);
      Toast.show({ icon: "fail", content: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // 字段标签 + 行内"公开"开关
  // 私密默认的字段开启后，参与者才能在你的公开主页 / 活动详情看到该字段
  const PrivacyToggle: React.FC<{
    fieldKey: keyof MerchantPrivacySettings;
    label: string;
  }> = ({ fieldKey, label }) => (
    <div className="flex items-center justify-between w-full">
      <span>{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
        公开
        <Switch
          checked={!!privacy[fieldKey]}
          onChange={(v) => setPrivacy((prev) => ({ ...prev, [fieldKey]: v }))}
          style={
            {
              "--height": "20px",
              "--width": "36px",
              "--checked-color": "var(--primary-500, #6366f1)",
            } as React.CSSProperties
          }
        />
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <MerchantLayout
        title="编辑资料"
        showBack
        showTabBar={false}
        onBack={goBack}
      >
        <div className="flex items-center justify-center h-64 text-gray-400">加载中...</div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout
      title="编辑资料"
      showBack
      showTabBar={false}
      onBack={goBack}
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
                label={<PrivacyToggle fieldKey="phone" label="手机号" />}
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
                label={<PrivacyToggle fieldKey="email" label="邮箱" />}
                rules={[{ type: "email", message: "请输入正确的邮箱格式" }]}
              >
                <Input
                  placeholder="请输入邮箱 (选填)"
                  type="email"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="wechat"
                label={<PrivacyToggle fieldKey="wechat" label="微信号" />}
              >
                <Input
                  placeholder="请输入微信号 (选填)"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="city"
                label={<PrivacyToggle fieldKey="city" label="所在城市" />}
              >
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
              <Form.Item
                name="company"
                label={<PrivacyToggle fieldKey="company" label="公司 / 组织" />}
              >
                <Input
                  placeholder="请输入公司或组织名称"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="occupation"
                label={<PrivacyToggle fieldKey="occupation" label="职业 / 职位" />}
              >
                <Input
                  placeholder="如：产品经理"
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<PrivacyToggle fieldKey="industry" label="所属行业" />}
              >
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
              <PrivacyToggle fieldKey="bio" label="个人介绍" />
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

          {/* 公开展示提示 */}
          <p className="px-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="text-primary-500">公开</span>开关已内联在每个字段旁，关闭后该项不会出现在公开主页和活动详情中。
          </p>
        </Form>

        {/* 提交按钮 - 固定在底部 */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 safe-area-pb bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-10">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              block
              fill="outline"
              onClick={goBack}
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
