/**
 * 用户端活动报名页面
 * 根据设计稿 04-registration.svg 实现
 */

import { FC, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button, Input, Checkbox } from "@/components/ui";
import { UserLayout } from "@/components/layout/UserLayout";
import { useActivityDetail } from "@/features/user";
import dayjs from "dayjs";

// 兴趣标签选项
const interestOptions = [
  { id: "outdoor", label: "户外" },
  { id: "photography", label: "摄影" },
  { id: "food", label: "美食" },
  { id: "sports", label: "运动" },
  { id: "reading", label: "阅读" },
  { id: "music", label: "音乐" },
  { id: "travel", label: "旅行" },
  { id: "tech", label: "科技" },
];

// 年龄段选项
const ageGroupOptions = [
  { value: "18-24", label: "18-24岁" },
  { value: "25-30", label: "25-30岁" },
  { value: "31-35", label: "31-35岁" },
  { value: "36-40", label: "36-40岁" },
  { value: "41+", label: "41岁以上" },
];

// 格式化日期
const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日");
};

const UserRegistration: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 使用 hooks 获取活动详情
  const { data: activityData, isLoading } = useActivityDetail(id);

  const activity = useMemo(() => {
    return activityData?.data;
  }, [activityData]);

  // 返回上一页，如果没有历史记录则返回活动详情页
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/u/activities/${id}`);
    }
  };

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    ageGroup: "",
    interests: [] as string[],
    emergencyContact: "",
    agreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activity) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
          <AlertCircle
            size={40}
            className="text-gray-300 dark:text-gray-600 mb-3"
          />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            活动不存在
          </p>
          <button
            onClick={() => navigate("/u/home")}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg"
          >
            返回首页
          </button>
        </div>
      </UserLayout>
    );
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.gender ||
      !formData.agreed
    ) {
      return;
    }

    setIsSubmitting(true);
    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    // 跳转到活动详情页
    navigate(`/u/activities/${id}`, { replace: true });
  };

  const isFormValid =
    formData.name && formData.phone && formData.gender && formData.agreed;

  return (
    <UserLayout
      showTabBar={true}
      showTopBar={true}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: activity.title, path: `/u/activities/${id}` },
        { label: "报名" },
      ]}
      bgColor="bg-gray-50 dark:bg-gray-900"
    >
      {/* 页面内容 - 添加底部padding避免被按钮遮挡 */}
      <div className="min-h-screen pb-[180px] md:pb-32">
        {/* 活动预览卡片 */}
        <div className="px-4 pt-4 md:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex gap-3 shadow-sm">
            <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center flex-shrink-0">
              <Calendar size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {activity.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(activity.eventStartTime)}
                <span className="mx-1">·</span>
                <MapPin size={12} />
                {activity.location.split(" ")[0]}
              </p>
              <p className="text-sm font-bold text-primary-500 dark:text-primary-400 mt-1">
                ¥68/人
              </p>
            </div>
            <div className="flex items-start">
              <span className="px-2 py-1 bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-[10px] font-medium rounded-full">
                报名中
              </span>
            </div>
          </div>
        </div>

        {/* 表单区域 */}
        <div className="px-4 py-5 md:px-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              填写报名信息
            </h2>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
            请准确填写以下信息，以便我们为您提供更好的服务
          </p>

          {/* 姓名 */}
          <div className="mb-4">
            <Input
              label="姓名"
              placeholder="请输入您的姓名"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              prefix={<User size={18} />}
              required
            />
          </div>

          {/* 手机号 */}
          <div className="mb-4">
            <Input
              label="手机号"
              type="tel"
              placeholder="请输入您的手机号"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              prefix={<Phone size={18} />}
              suffix={
                <button className="px-3 py-1.5 bg-primary-50 text-primary-500 text-xs font-medium rounded-full whitespace-nowrap">
                  获取验证码
                </button>
              }
              required
            />
          </div>

          {/* 性别 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              性别 <span className="text-error-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["male", "female"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleInputChange("gender", gender)}
                  className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                    formData.gender === gender
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.gender === gender
                        ? "border-primary-400 bg-primary-400"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {formData.gender === gender && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      formData.gender === gender
                        ? "text-primary-500 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {gender === "male" ? "男" : "女"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 年龄段 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              年龄段
            </label>
            <select
              value={formData.ageGroup}
              onChange={(e) => handleInputChange("ageGroup", e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <option value="">请选择年龄段</option>
              {ageGroupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 兴趣标签 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              兴趣标签（多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((option) => {
                const isSelected = formData.interests.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleInterestToggle(option.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary-400 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 紧急联系人 */}
          <div className="mb-6">
            <Input
              label="紧急联系人（选填）"
              type="tel"
              placeholder="请输入紧急联系人电话"
              value={formData.emergencyContact}
              onChange={(e) =>
                handleInputChange("emergencyContact", e.target.value)
              }
            />
          </div>

          {/* 协议勾选 */}
          <div className="mb-6">
            <Checkbox
              checked={formData.agreed}
              onChange={(checked) => handleInputChange("agreed", checked)}
              size="medium"
            >
              <span className="text-gray-500">
                我已阅读并同意
                <span className="text-primary-500 font-medium">
                  《活动须知》
                </span>
                和
                <span className="text-primary-500 font-medium">
                  《免责声明》
                </span>
              </span>
            </Checkbox>
          </div>
        </div>

        {/* 底部操作栏 - 适配 TabBar，在其上方显示 */}
        <div className="fixed bottom-14 left-0 right-0 z-40 md:bottom-0">
          <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-3 pb-3 md:px-6 md:pb-4 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-4">
              {/* 价格信息 */}
              <div className="flex-shrink-0">
                <p className="text-xs text-gray-400 dark:text-gray-500">合计</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  ¥68
                </p>
              </div>

              {/* 提交按钮 */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid}
                loading={isSubmitting}
                className="flex-1 h-12 text-base"
              >
                确认报名
              </Button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserRegistration;
