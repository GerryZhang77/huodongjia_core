/**
 * 用户端编辑名片页面
 * 编辑个人名片信息
 */

import { FC, useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Camera,
  User,
  Briefcase,
  Building2,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Plus,
  X,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, Switch, Textarea } from "@/components/ui";
import { useUserProfile, useUpdateProfile } from "@/features/user";
import { useImageUpload } from "@/features/uploads";
import { UserLayout } from "@/components/layout/UserLayout";
import RegistrationPhoneVerification from "@/features/user/enrollment/components/RegistrationPhoneVerification";
import { eventBus, EVENTS } from "@/utils/eventBus";
import { sanitizeRedirectPath } from "@/utils/redirect";
import type { ProfilePrivacySettings } from "@/services/userApi";

// 兴趣标签选项
const interestOptions = [
  "户外运动",
  "摄影",
  "读书",
  "美食",
  "旅行",
  "音乐",
  "电影",
  "健身",
  "游戏",
  "科技",
  "艺术",
  "社交",
];

const DEFAULT_PRIVACY: Required<ProfilePrivacySettings> = {
  phone: false,
  email: false,
  wechat: false,
  company: false,
  city: false,
  industry: true,
  occupation: true,
  bio: true,
};

const privacyRows: Array<{ key: keyof ProfilePrivacySettings; label: string }> = [
  { key: "occupation", label: "职业" },
  { key: "company", label: "公司" },
  { key: "industry", label: "行业" },
  { key: "city", label: "城市" },
  { key: "phone", label: "手机号码" },
  { key: "email", label: "邮箱地址" },
  { key: "wechat", label: "微信号" },
  { key: "bio", label: "个人简介" },
];

function mergePrivacySettings(
  settings?: ProfilePrivacySettings | null,
): Required<ProfilePrivacySettings> {
  return { ...DEFAULT_PRIVACY, ...(settings || {}) };
}

const UserEditProfile: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用 hooks 获取用户资料
  const { data: profileData, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const profile = useMemo(() => {
    return profileData?.profile;
  }, [profileData]);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    occupation: "",
    company: "",
    industry: "",
    city: "",
    email: "",
    phone: "",
    wechat: "",
    bio: "",
    interests: [] as string[],
  });
  const [privacySettings, setPrivacySettings] =
    useState<Required<ProfilePrivacySettings>>(DEFAULT_PRIVACY);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  // 自定义兴趣输入
  const [customInterest, setCustomInterest] = useState("");
  const isComposingRef = useRef(false);
  const MAX_INTEREST_LEN = 8;

  // 头像 / 照片墙：用统一的 useImageUpload（pending+tempId 模式）
  const avatarUpload = useImageUpload({ kind: "avatar" });
  const photoUpload = useImageUpload({ kind: "photo" });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>("");

  const [photos, setPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  // 是否有照片正在上传中（仅用于禁用「+」按钮防止重复触发 file 选择）
  const photoUploading = photos.some((u) => u.startsWith("blob:"));

  const MAX_PHOTOS = 9;
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"));

  // 当 profile 加载后初始化表单
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        occupation: profile.occupation || "",
        company: profile.company || "",
        industry: profile.industry || "",
        city: profile.city || "",
        email: profile.contact?.email || profile.email || "",
        phone: profile.contact?.phone || profile.phone || "",
        wechat: profile.contact?.wechat || profile.wechat || "",
        bio: profile.bio || "",
        interests: profile.tags || [],
      });
      setCurrentAvatar(profile.avatar || "");
      setPhotos(profile.photos || []);
      setPrivacySettings(mergePrivacySettings(profile.privacy_settings));
    }
  }, [profile]);

  // 更新表单字段
  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 添加兴趣标签
  const addInterest = (interest: string) => {
    if (
      !formData.interests.includes(interest) &&
      formData.interests.length < 6
    ) {
      updateField("interests", [...formData.interests, interest]);
    }
  };

  // 移除兴趣标签
  const removeInterest = (interest: string) => {
    updateField(
      "interests",
      formData.interests.filter((i) => i !== interest),
    );
  };

  // 处理照片墙上传：每张图先以 blob: 预览插入列表，server 返回后替换为真实 url
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      const handle = photoUpload.uploadWithPreview(file);
      if (!handle.tempUrl) continue; // 校验未通过
      setPhotos((prev) => [...prev, handle.tempUrl]);
      handle.finalUrlPromise
        .then((real) => {
          setPhotos((prev) => prev.map((u) => (u === handle.tempUrl ? real : u)));
        })
        .catch(() => {
          // hook 内部已 toast；这里只清理预览
          setPhotos((prev) => prev.filter((u) => u !== handle.tempUrl));
        });
    }

    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));
  const updatePrivacyField = (field: keyof ProfilePrivacySettings, value: boolean) => {
    setPrivacySettings((prev) => ({ ...prev, [field]: value }));
  };
  const openPhotoPicker = () => {
    if (photoUploading) return;
    if (photoInputRef.current) photoInputRef.current.value = "";
    photoInputRef.current?.click();
  };

  // 头像上传：先把 blob: 预览写到 currentAvatar，server 返回后替换
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const handle = avatarUpload.uploadWithPreview(file);
    if (!handle.tempUrl) return;

    const previousAvatar = currentAvatar;
    setCurrentAvatar(handle.tempUrl);
    setAvatarUploading(true);

    handle.finalUrlPromise
      .then((real) => {
        setCurrentAvatar(real);
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        queryClient.removeQueries({ queryKey: ["nfc"] });
        if (profile?.id) {
          queryClient.invalidateQueries({ queryKey: ["publicProfile", profile.id] });
        }
        Toast.show({ icon: "success", content: "头像更新成功" });
      })
      .catch(() => {
        // hook 已 toast；这里只回滚到旧头像
        setCurrentAvatar(previousAvatar);
      })
      .finally(() => {
        setAvatarUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  // 提交表单
  const handleSubmit = () => {
    try {
      // 使用 mutation 更新用户资料
      updateProfileMutation.mutate(
        {
          name: formData.name,
          occupation: formData.occupation,
          company: formData.company,
          industry: formData.industry,
          city: formData.city,
          bio: formData.bio,
          tags: formData.interests,
          photos,
          email: formData.email || undefined,
          wechat: formData.wechat || undefined,
          privacy_settings: privacySettings,
        },
        {
          onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["nfc"] });
            if (profile?.id) {
              queryClient.invalidateQueries({ queryKey: ["publicProfile", profile.id] });
            }

            // 3. 触发全局事件，通知其他组件刷新数据
            eventBus.emit(EVENTS.PROFILE_UPDATED, {
              timestamp: Date.now(),
            });

            // 4. 显示成功提示
            Toast.show({
              icon: "success",
              content: "保存成功",
            });

            // 5. 返回上一页
            setTimeout(() => {
              if (redirect) {
                navigate(redirect, { replace: true });
              } else {
                navigate(-1);
              }
            }, 300);
          },
          onError: () => {
            Toast.show({
              icon: "fail",
              content: "保存失败，请重试",
            });
          },
        },
      );
    } catch (error) {
      console.error("保存失败:", error);
      Toast.show({
        icon: "fail",
        content: "保存失败，请重试",
      });
    }
  };

  // 加载中状态
  if (isLoading || !profile) {
    return (
      <UserLayout
        showTabBar={true}
        showTopBar={true}
        showBreadcrumb={true}
        breadcrumbItems={[
          { label: "首页", path: "/u/home" },
          { label: "我的", path: "/u/profile" },
          { label: "编辑资料" },
        ]}
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-gray-500">加载中...</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: "个人中心", path: "/u/profile" },
        { label: "编辑名片" },
      ]}
      topBarRightContent={
        <Button onClick={handleSubmit} size="small">
          保存
        </Button>
      }
    >
      {/* 页面内容 - 桌面端限制宽度并居中 */}
      <div className="lg:max-w-2xl lg:mx-auto">
        {/* 头像区域 */}
        <div className="flex flex-col items-center py-6 bg-gradient-to-b from-slate-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="relative">
            <img
              src={currentAvatar || profile.avatar}
              alt="头像"
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 active:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Camera size={16} className={avatarUploading ? "animate-pulse" : ""} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">
            {avatarUploading ? "上传中..." : "点击更换头像"}
          </p>
        </div>

        {/* 表单区域 */}
        <div className="px-4 md:px-6 py-4 space-y-4">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">
              基本信息
            </h3>

            {/* 姓名 */}
            <Input
              placeholder="姓名"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              prefix={<User size={18} />}
            />

            {/* 职业 */}
            <Input
              placeholder="职业"
              value={formData.occupation}
              onChange={(e) => updateField("occupation", e.target.value)}
              prefix={<Briefcase size={18} />}
            />

            {/* 公司 */}
            <Input
              placeholder="公司"
              value={formData.company}
              onChange={(e) => updateField("company", e.target.value)}
              prefix={<Building2 size={18} />}
            />

            {/* 行业 */}
            <Input
              placeholder="行业"
              value={formData.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              prefix={<Sparkles size={18} />}
            />

            {/* 城市 */}
            <Input
              placeholder="城市"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              prefix={<MapPin size={18} />}
            />
          </div>

          {/* 联系方式 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">
              联系方式
            </h3>

            {/* 手机 */}
            <div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <Input
                  type="tel"
                  placeholder="手机号码"
                  value={formData.phone}
                  disabled
                  prefix={<Phone size={18} />}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPhoneVerification(true)}
                >
                  更换手机号
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                为确保报名短信发送到本人，手机号变更必须完成短信验证。
              </p>
            </div>

            {/* 邮箱 */}
            <Input
              type="email"
              placeholder="邮箱地址"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              prefix={<Mail size={18} />}
            />

            {/* 微信 */}
            <Input
              type="text"
              placeholder="微信号"
              value={formData.wechat}
              onChange={(e) => updateField("wechat", e.target.value)}
              prefix={<MessageCircle size={18} />}
            />
          </div>

          {/* NFC 公开信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">
              NFC 公开信息
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-gray-700 dark:bg-gray-800">
              {privacyRows.map((item) => (
                <div
                  key={item.key}
                  className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0 dark:border-gray-700"
                >
                  <span className="text-sm text-slate-700 dark:text-gray-200">
                    {item.label}
                  </span>
                  <Switch
                    size="small"
                    checked={privacySettings[item.key]}
                    onChange={(checked) => updatePrivacyField(item.key, checked)}
                    aria-label={`${item.label}公开开关`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 个人简介 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">
              个人简介
            </h3>
            <Textarea
              placeholder="介绍一下自己..."
              value={formData.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-slate-400 dark:text-gray-500 text-right">
              {formData.bio.length}/200
            </p>
          </div>

          {/* 兴趣爱好 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                兴趣爱好
              </h3>
              <span className="text-xs text-slate-400 dark:text-gray-500">
                {formData.interests.length}/6
              </span>
            </div>

            {/* 已选择的标签 */}
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                  className="inline-flex max-w-full flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-500 dark:bg-primary-900/30 dark:text-primary-400"
                  >
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-800/50 flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 可选标签 */}
            <div className="flex flex-wrap gap-2">
              {interestOptions
                .filter((i) => !formData.interests.includes(i))
                .map((interest) => (
                  <button
                    key={interest}
                    onClick={() => addInterest(interest)}
                    disabled={formData.interests.length >= 6}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-medium rounded-full hover:bg-slate-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={12} />
                    {interest}
                  </button>
                ))}
            </div>

            {/* 自定义兴趣 */}
            {formData.interests.length < 6 && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInterest}
                    onCompositionStart={() => { isComposingRef.current = true; }}
                    onCompositionEnd={(e) => {
                      isComposingRef.current = false;
                      const val = (e.target as HTMLInputElement).value;
                      if (val.length > MAX_INTEREST_LEN) {
                        setCustomInterest(val.slice(0, MAX_INTEREST_LEN));
                      }
                    }}
                    onChange={(e) => {
                      if (isComposingRef.current) {
                        setCustomInterest(e.target.value);
                      } else {
                        setCustomInterest(e.target.value.slice(0, MAX_INTEREST_LEN));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isComposingRef.current) {
                        e.preventDefault();
                        const val = customInterest.trim();
                        if (val && !formData.interests.includes(val)) {
                          addInterest(val);
                          setCustomInterest("");
                        }
                      }
                    }}
                    placeholder="添加其他兴趣爱好"
                    className="w-full px-3 py-1.5 text-xs rounded-full border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    {customInterest.length}/{MAX_INTEREST_LEN}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const val = customInterest.trim();
                    if (val && !formData.interests.includes(val)) {
                      addInterest(val);
                      setCustomInterest("");
                    }
                  }}
                  disabled={!customInterest.trim() || formData.interests.includes(customInterest.trim())}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 transition-colors"
                >
                  添加
                </button>
              </div>
            )}
          </div>

          {/* 照片墙 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">照片墙</h3>
              <span className="text-xs text-slate-400 dark:text-gray-500">{photos.length}/{MAX_PHOTOS}</span>
            </div>
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
              {photos.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative aspect-[4/3] w-[78vw] max-w-sm flex-none snap-center overflow-hidden rounded-2xl bg-slate-100 shadow-sm dark:bg-gray-700 sm:w-80"
                >
                  <img src={url} alt={`照片 ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white shadow-sm transition-colors hover:bg-black/70"
                    aria-label={`删除照片 ${idx + 1}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  disabled={photoUploading}
                  className="flex aspect-[4/3] w-[78vw] max-w-sm flex-none snap-center flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-primary-400 hover:text-primary-400 disabled:opacity-50 dark:border-gray-600 dark:text-gray-500 sm:w-80"
                >
                  <ImagePlus size={24} />
                  <span className="text-sm">{photoUploading ? "处理中" : "添加照片"}</span>
                </button>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* 底部保存按钮 - 在表单内容流中，自然对齐 */}
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button onClick={handleSubmit} block className="h-12">
              保存名片
            </Button>
          </div>
        </div>
      </div>
      {showPhoneVerification && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setShowPhoneVerification(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-t-2xl bg-white shadow-2xl dark:bg-gray-800 sm:rounded-2xl">
            <button
              type="button"
              aria-label="关闭手机号验证"
              onClick={() => setShowPhoneVerification(false)}
              className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <RegistrationPhoneVerification
              activityTitle="账号安全"
              initialPhone={formData.phone}
              title="验证新手机号"
              description="新手机号验证通过后，将用于登录、报名身份识别和主办方发送的活动报名通知。"
              successMessage="手机号更换成功"
              compact
              onVerified={async (phone) => {
                updateField("phone", phone);
                setShowPhoneVerification(false);
                await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
              }}
            />
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserEditProfile;
