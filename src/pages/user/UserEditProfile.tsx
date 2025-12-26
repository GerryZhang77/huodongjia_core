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
import { Button, Input, Textarea } from "@/components/ui";
import { mockUserProfile } from "@/mocks/data/user-profile";
import { UserLayout } from "@/components/layout/UserLayout";

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
    // TODO: 调用API保存数据
    console.log("保存表单数据:", formData);
    navigate(-1);
  };

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: "个人资料", path: "/u/profile" },
        { label: "编辑名片" },
      ]}
      topBarRightContent={
        <Button onClick={handleSubmit} size="small">
          保存
        </Button>
      }
    >
      <div className="md:py-6 lg:py-8 pb-24">
        {/* 头像区域 */}
        <div className="flex flex-col items-center py-6 bg-gradient-to-b from-slate-50 to-white">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="头像"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg">
              <Camera size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">点击更换头像</p>
        </div>

        {/* 表单区域 */}
        <div className="px-4 md:px-6 py-4 space-y-4">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">基本信息</h3>

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
            <h3 className="text-sm font-semibold text-slate-900">联系方式</h3>

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
            <h3 className="text-sm font-semibold text-slate-900">个人简介</h3>
            <Textarea
              placeholder="介绍一下自己..."
              value={formData.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-slate-400 text-right">
              {formData.bio.length}/200
            </p>
          </div>

          {/* 兴趣爱好 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">兴趣爱好</h3>
              <span className="text-xs text-slate-400">
                {formData.interests.length}/6
              </span>
            </div>

            {/* 已选择的标签 */}
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-500 text-xs font-medium rounded-full"
                  >
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center"
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={12} />
                    {interest}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* 底部保存按钮 */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-white border-t border-gray-100 px-4 pt-4 pb-6 md:px-6 md:pb-4">
            <Button onClick={handleSubmit} block className="h-12">
              保存名片
            </Button>
            <div className="h-safe-bottom" />
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserEditProfile;
