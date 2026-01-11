/**
 * 用户端编辑名片页面
 * 编辑个人名片信息
 */

import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  User,
  Briefcase,
  Building2,
  MapPin,
  Mail,
  Phone,
  Plus,
  X,
} from "lucide-react";
import { Toast } from "antd-mobile";
import { Button, Input, Textarea } from "@/components/ui";
import {
  mockUserProfile,
  updateUserProfile,
  InterestTag,
} from "@/mocks/data/user-profile";
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
  const profile = mockUserProfile;

  // 表单状态
  const [formData, setFormData] = useState({
    name: profile.name,
    occupation: profile.occupation,
    company: profile.company,
    city: profile.city,
    email: profile.contact?.email || "",
    phone: profile.contact?.phone || "",
    bio: profile.bio,
    interests: profile.interestTags.map((t) => t.name),
  });

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
      formData.interests.filter((i) => i !== interest)
    );
  };

  // 提交表单
  const handleSubmit = () => {
    try {
      // 1. 构建新的兴趣标签数据（添加 id 和随机颜色）
      const TAG_COLOR_TYPES: InterestTag["colorType"][] = [
        "primary",
        "secondary",
        "accent",
        "warning",
        "default",
      ];
      const newInterestTags: InterestTag[] = formData.interests.map(
        (name, index) => ({
          id: `tag_${Date.now()}_${index}`,
          name,
          colorType:
            TAG_COLOR_TYPES[Math.floor(Math.random() * TAG_COLOR_TYPES.length)],
        })
      );

      // 2. 更新 mock 数据（Mock 模式）
      updateUserProfile({
        name: formData.name,
        occupation: formData.occupation,
        company: formData.company,
        city: formData.city,
        bio: formData.bio,
        interestTags: newInterestTags,
        contact: {
          phone: formData.phone,
          email: formData.email,
        },
      });

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

      // TODO: 迁移到真实 API 时的替换步骤
      // ============================================
      // 第一步：引入 API hooks
      // import { useUpdateProfile } from '@/features/user/profile/hooks';
      //
      // 第二步：在组件中使用 mutation
      // const { mutate: updateProfile, isPending } = useUpdateProfile();
      //
      // 第三步：替换上面的同步代码为：
      // updateProfile(
      //   {
      //     name: formData.name,
      //     occupation: formData.occupation,
      //     company: formData.company,
      //     city: formData.city,
      //     bio: formData.bio,
      //     interests: formData.interests, // 只传标签名称
      //     contact: {
      //       phone: formData.phone,
      //       email: formData.email,
      //     },
      //   },
      //   {
      //     onSuccess: () => {
      //       Toast.show({ icon: 'success', content: '保存成功' });
      //       setTimeout(() => navigate(-1), 300);
      //     },
      //     onError: (error) => {
      //       Toast.show({ icon: 'fail', content: '保存失败，请重试' });
      //       console.error('更新失败:', error);
      //     },
      //   }
      // );
      // ============================================
    } catch (error) {
      console.error("保存失败:", error);
      Toast.show({
        icon: "fail",
        content: "保存失败，请重试",
      });
    }
  };

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
              src={profile.avatar}
              alt="头像"
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg">
              <Camera size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">
            点击更换头像
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
