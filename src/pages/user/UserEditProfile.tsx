/**
 * 用户端编辑名片页面
 * 编辑个人名片信息
 */

import { FC, useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, Textarea } from "@/components/ui";
import { useUserProfile, useUpdateProfile } from "@/features/user";
import { userApi } from "@/services";
import { UserLayout } from "@/components/layout/UserLayout";
import { eventBus, EVENTS } from "@/utils/eventBus";

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

const UserEditProfile: FC = () => {
  const navigate = useNavigate();
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
    city: "",
    email: "",
    phone: "",
    wechat: "",
    bio: "",
    interests: [] as string[],
  });

  // 自定义兴趣输入
  const [customInterest, setCustomInterest] = useState("");
  const isComposingRef = useRef(false);
  const MAX_INTEREST_LEN = 8;

  // 头像上传状态
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>("");

  // 照片墙状态
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTOS = 9;

  // 当 profile 加载后初始化表单
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        occupation: profile.occupation || "",
        company: profile.company || "",
        city: profile.city || "",
        email: profile.contact?.email || profile.email || "",
        phone: profile.contact?.phone || profile.phone || "",
        wechat: profile.contact?.wechat || profile.wechat || "",
        bio: profile.bio || "",
        interests: profile.tags || [],
      });
      setCurrentAvatar(profile.avatar || "");
      setPhotos(profile.photos || []);
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

  // 处理照片墙上传
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = files.slice(0, remaining);
    setPhotoUploading(true);
    try {
      const results = await Promise.all(toUpload.map((f) => userApi.uploadPhoto(f)));
      const urls = results.filter((r) => r.success && r.url).map((r) => r.url!);
      if (urls.length) setPhotos((prev) => [...prev, ...urls]);
      else Toast.show({ icon: "fail", content: "上传失败，请重试" });
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  // 处理头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      Toast.show({ icon: "fail", content: "请选择图片文件" });
      return;
    }

    // 验证文件大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      Toast.show({ icon: "fail", content: "图片大小不能超过 5MB" });
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await userApi.uploadAvatar(file);
      if (res.success && res.avatarUrl) {
        setCurrentAvatar(res.avatarUrl);
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        Toast.show({ icon: "success", content: "头像更新成功" });
      } else {
        Toast.show({ icon: "fail", content: "上传失败，请重试" });
      }
    } catch (error) {
      console.error("头像上传失败:", error);
      Toast.show({ icon: "fail", content: "上传失败，请稍后重试" });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
          city: formData.city,
          bio: formData.bio,
          tags: formData.interests,
          photos,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          wechat: formData.wechat || undefined,
        },
        {
          onSuccess: () => {
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
              navigate(-1);
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
            <Input
              type="tel"
              placeholder="手机号码"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              prefix={<Phone size={18} />}
            />

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
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 text-xs font-medium rounded-full"
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
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-700">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-gray-500 hover:border-primary-400 hover:text-primary-400 transition-colors disabled:opacity-50"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs">{photoUploading ? "上传中" : "添加"}</span>
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
    </UserLayout>
  );
};

export default UserEditProfile;
