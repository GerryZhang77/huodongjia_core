/**
 * 用户端活动报名页面
 */

import { FC, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Calendar, MapPin, AlertCircle } from "lucide-react";
import { Toast } from "antd-mobile";
import { Button, Input } from "@/components/ui";
import { UserLayout } from "@/components/layout/UserLayout";
import { useActivityDetail } from "@/features/user";
import { useSubmitEnrollment } from "@/features/user/enrollment/hooks/useSubmitEnrollment";
import type { EnrollmentFormData } from "@/features/user/enrollment/types";
import dayjs from "dayjs";

// ============================================
// 选项配置
// ============================================

const industryOptions = [
  "人工智能", "互联网与平台经济", "元宇宙与区块链科技",
  "金融科技", "医疗健康", "新能源与环保", "消费与零售",
  "文化与娱乐", "教育科技", "硬件与IoT", "企业服务", "其他",
];

const softwareSkillOptions = [
  "PS", "PR", "Excel", "PPT", "Notion", "飞书", "编程",
  "Python", "Java", "React", "Figma", "Axure", "SQL", "Word", "其他",
];

const expertiseOptions = [
  "设计", "文案", "技术", "数据", "策划", "产品", "运营", "销售", "市场", "其他",
];

const workSceneOptions = ["对内统筹", "活动现场", "远程协作", "对外合作"];

const motivationOptions = ["能力提升", "项目经验", "视野", "资源"];

const departmentOptions = [
  "技术部", "产品部", "设计部", "运营部", "品牌管理部", "市场部", "其他",
];

const gradeOptions = [
  "24本", "23本", "22本", "25硕", "24硕", "23硕", "博士", "其他",
];

// ============================================
// 多选标签组件
// ============================================

const MultiSelectTags: FC<{
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
}> = ({ options, selected, onChange, allowCustom = false }) => {
  const [customInput, setCustomInput] = useState("");
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]
    );
  };
  const addCustom = () => {
    const val = customInput.trim();
    if (val && !selected.includes(val)) {
      onChange([...selected, val]);
    }
    setCustomInput("");
  };
  // 区分预设和自定义
  const customItems = selected.filter((s) => !options.includes(s));
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selected.includes(opt)
                ? "bg-primary-400 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {opt}
          </button>
        ))}
        {customItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary-400 text-white flex items-center gap-1"
          >
            {item} <span className="text-xs opacity-70">×</span>
          </button>
        ))}
      </div>
      {allowCustom && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="输入其他选项"
            className="flex-1 h-9 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-all"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="px-3 h-9 bg-primary-400 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-primary-500 transition-colors"
          >
            添加
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// 主页面
// ============================================

const UserRegistration: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: activityData } = useActivityDetail(id);
  const { mutateAsync: submitEnrollment, isPending: isSubmitting } = useSubmitEnrollment(id || "");

  const activity = useMemo(() => activityData?.data, [activityData]);

  // ---- 表单状态 ----
  const [formData, setFormData] = useState({
    姓名: "",
    性别: "",
    student_id: "",
    联系方式: "",
    学院专业: "",
    年级: "",
    一句话自我介绍: "",
    兴趣爱好: "",
    所在职能部门: "",
    过往相关经历: "",
    所在创投俱乐部: "",
    过往成果: "",
    核心人脉资源: "",
    工作风格: "",
    可投入时间: "",
    对社团的理解: "",
  });

  // 多选字段（存为数组，提交时转 comma-separated string）
  const [industrySelected, setIndustrySelected] = useState<string[]>([]);
  const [softwareSelected, setSoftwareSelected] = useState<string[]>([]);
  const [expertiseSelected, setExpertiseSelected] = useState<string[]>([]);
  const [workSceneSelected, setWorkSceneSelected] = useState<string[]>([]);
  const [motivationSelected, setMotivationSelected] = useState<string[]>([]);

  // 所在职能部门：是否处于"其他"自定义输入模式
  const [deptIsCustom, setDeptIsCustom] = useState(false);
  const [deptCustomValue, setDeptCustomValue] = useState("");

  const set = (field: string, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // 必填匹配字段是否已填
  const matchingFieldsFilled =
    formData["兴趣爱好"].trim() &&
    formData["所在职能部门"].trim() &&
    industrySelected.length > 0 &&
    softwareSelected.length > 0 &&
    expertiseSelected.length > 0;

  const isFormValid =
    formData["姓名"].trim() &&
    formData["性别"] &&
    formData["student_id"].trim() &&
    formData["联系方式"].trim() &&
    matchingFieldsFilled;

  const handleSubmit = async () => {
    if (!isFormValid) {
      Toast.show({ icon: "fail", content: "请填写所有必填项" });
      return;
    }

    const data: EnrollmentFormData = {
      姓名: formData["姓名"],
      性别: formData["性别"],
      student_id: formData["student_id"],
      联系方式: formData["联系方式"],
      学院专业: formData["学院专业"] || undefined,
      年级: formData["年级"] || undefined,
      一句话自我介绍: formData["一句话自我介绍"] || undefined,
      兴趣爱好: formData["兴趣爱好"],
      所在职能部门: formData["所在职能部门"],
      "关注/从事的行业方向": industrySelected.join(","),
      软件技能: softwareSelected.join(","),
      擅长领域: expertiseSelected.join(","),
      过往相关经历: formData["过往相关经历"] || undefined,
      所在创投俱乐部: formData["所在创投俱乐部"] || undefined,
      过往成果: formData["过往成果"] || undefined,
      核心人脉资源: formData["核心人脉资源"] || undefined,
      工作风格: formData["工作风格"] || undefined,
      擅长工作场景: workSceneSelected.length > 0 ? workSceneSelected.join(",") : undefined,
      加入初衷: motivationSelected.length > 0 ? motivationSelected.join(",") : undefined,
      可投入时间: formData["可投入时间"] || undefined,
      对社团的理解: formData["对社团的理解"] || undefined,
    };

    try {
      await submitEnrollment(data);
      Toast.show({ icon: "success", content: "报名成功！", duration: 2000 });
      setTimeout(() => navigate(`/u/activities/${id}`, { replace: true }), 2000);
    } catch (error: any) {
      Toast.show({ icon: "fail", content: error.message || "报名失败，请稍后重试", duration: 3000 });
    }
  };

  if (!activity) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
          <AlertCircle size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">活动不存在</p>
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
      <div className="min-h-screen pb-[180px] md:pb-32">
        {/* 活动预览卡片 */}
        <div className="px-4 pt-4 md:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex gap-3 shadow-sm">
            <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center flex-shrink-0">
              <Calendar size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{activity.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {dayjs(activity.eventStartTime).format("M月D日")}
                <span className="mx-1">·</span>
                <MapPin size={12} />
                {activity.location.split(" ")[0]}
              </p>
            </div>
            <span className="px-2 py-1 h-fit bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-[10px] font-medium rounded-full">
              报名中
            </span>
          </div>
        </div>

        <div className="px-4 py-5 md:px-6 space-y-6">
          {/* ====== 基本信息 ====== */}
          <section>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary-400 rounded-full" />
              基本信息
            </h2>
            <div className="space-y-4">
              {/* 姓名 */}
              <Input
                label="姓名"
                placeholder="请输入您的姓名"
                value={formData["姓名"]}
                onChange={(e) => set("姓名", e.target.value)}
                prefix={<User size={18} />}
                required
              />

              {/* 学号 */}
              <Input
                label="学号"
                placeholder="请输入学号"
                value={formData["student_id"]}
                onChange={(e) => set("student_id", e.target.value)}
                required
              />

              {/* 性别 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  性别 <span className="text-error-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ val: "男", label: "男" }, { val: "女", label: "女" }].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => set("性别", val)}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                        formData["性别"] === val
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30"
                          : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData["性别"] === val ? "border-primary-400 bg-primary-400" : "border-gray-300 dark:border-gray-500"
                        }`}
                      >
                        {formData["性别"] === val && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`text-sm font-medium ${formData["性别"] === val ? "text-primary-500 dark:text-primary-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 联系方式 */}
              <Input
                label="联系方式"
                type="tel"
                placeholder="请输入手机号"
                value={formData["联系方式"]}
                onChange={(e) => set("联系方式", e.target.value)}
                prefix={<Phone size={18} />}
                required
              />

              {/* 学院专业 */}
              <Input
                label="学院专业（选填）"
                placeholder="如：心理与认知科学学院应用心理学"
                value={formData["学院专业"]}
                onChange={(e) => set("学院专业", e.target.value)}
              />

              {/* 年级 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  年级（选填）
                </label>
                <select
                  value={formData["年级"]}
                  onChange={(e) => set("年级", e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 12px center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <option value="">请选择年级</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* 一句话自我介绍 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  一句话自我介绍（选填）
                </label>
                <input
                  type="text"
                  value={formData["一句话自我介绍"]}
                  onChange={(e) => set("一句话自我介绍", e.target.value)}
                  placeholder="用一句话介绍自己"
                  maxLength={50}
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all"
                />
              </div>
            </div>
          </section>

          {/* ====== 匹配信息（必填） ====== */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-4 bg-warning-400 rounded-full" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">匹配信息</h2>
              <span className="px-2 py-0.5 bg-warning-50 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400 text-[10px] font-medium rounded-full">必填</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 ml-3">以下信息用于智能分组匹配，请认真填写</p>

            <div className="bg-warning-50/50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800/50 rounded-2xl p-4 space-y-5">
              {/* 兴趣爱好 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  兴趣爱好 <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData["兴趣爱好"]}
                  onChange={(e) => set("兴趣爱好", e.target.value)}
                  placeholder="如：篮球、编程、阅读"
                  className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all"
                />
              </div>

              {/* 所在职能部门 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  所在职能部门 <span className="text-error-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {departmentOptions.filter((d) => d !== "其他").map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        set("所在职能部门", dept);
                        setDeptIsCustom(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        !deptIsCustom && formData["所在职能部门"] === dept
                          ? "bg-primary-400 text-white"
                          : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setDeptIsCustom(true);
                      set("所在职能部门", deptCustomValue);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      deptIsCustom
                        ? "bg-primary-400 text-white"
                        : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    其他
                  </button>
                </div>
                {deptIsCustom && (
                  <input
                    type="text"
                    value={deptCustomValue}
                    placeholder="请输入所在部门"
                    className="w-full h-10 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all"
                    onChange={(e) => {
                      setDeptCustomValue(e.target.value);
                      set("所在职能部门", e.target.value);
                    }}
                  />
                )}
              </div>

              {/* 关注/从事的行业方向 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  关注/从事的行业方向 <span className="text-error-500">*</span>
                </label>
                <MultiSelectTags
                  options={industryOptions}
                  selected={industrySelected}
                  onChange={setIndustrySelected}
                  allowCustom
                />
              </div>

              {/* 软件技能 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  软件技能 <span className="text-error-500">*</span>
                </label>
                <MultiSelectTags
                  options={softwareSkillOptions}
                  selected={softwareSelected}
                  onChange={setSoftwareSelected}
                  allowCustom
                />
              </div>

              {/* 擅长领域 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  擅长领域 <span className="text-error-500">*</span>
                </label>
                <MultiSelectTags
                  options={expertiseOptions}
                  selected={expertiseSelected}
                  onChange={setExpertiseSelected}
                  allowCustom
                />
              </div>
            </div>
          </section>

          {/* ====== 补充信息（选填） ====== */}
          <section>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-gray-300 dark:bg-gray-500 rounded-full" />
              补充信息（选填）
            </h2>
            <div className="space-y-4">
              {/* 过往相关经历 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  过往相关经历
                </label>
                <textarea
                  value={formData["过往相关经历"]}
                  onChange={(e) => set("过往相关经历", e.target.value)}
                  placeholder="请描述过往与活动/社团/创业相关的经历"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all resize-none"
                />
              </div>

              {/* 所在创投俱乐部 */}
              <Input
                label="所在创投俱乐部"
                placeholder="如：PKU Innovation Club，或不在以上部门"
                value={formData["所在创投俱乐部"]}
                onChange={(e) => set("所在创投俱乐部", e.target.value)}
              />

              {/* 过往成果 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  过往成果
                </label>
                <textarea
                  value={formData["过往成果"]}
                  onChange={(e) => set("过往成果", e.target.value)}
                  placeholder="请描述过往的项目成果、获奖经历等"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all resize-none"
                />
              </div>

              {/* 核心人脉资源 */}
              <Input
                label="核心人脉资源"
                placeholder="如：学院内的老师、投资人等"
                value={formData["核心人脉资源"]}
                onChange={(e) => set("核心人脉资源", e.target.value)}
              />

              {/* 工作风格 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  工作风格
                </label>
                <div className="flex gap-2">
                  {["偏执行", "偏策划", "均衡"].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => set("工作风格", style)}
                      className={`flex-1 h-10 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData["工作风格"] === style
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400"
                          : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* 擅长工作场景 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  擅长工作场景
                </label>
                <MultiSelectTags
                  options={workSceneOptions}
                  selected={workSceneSelected}
                  onChange={setWorkSceneSelected}
                />
              </div>

              {/* 加入初衷 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  加入初衷
                </label>
                <MultiSelectTags
                  options={motivationOptions}
                  selected={motivationSelected}
                  onChange={setMotivationSelected}
                />
              </div>

              {/* 可投入时间 */}
              <Input
                label="可投入时间"
                placeholder="如：周末、周中都可以"
                value={formData["可投入时间"]}
                onChange={(e) => set("可投入时间", e.target.value)}
              />

              {/* 对社团的理解 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  对社团的理解
                </label>
                <textarea
                  value={formData["对社团的理解"]}
                  onChange={(e) => set("对社团的理解", e.target.value)}
                  placeholder="你对这个社团的期望和理解是什么？"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* 底部操作栏 */}
        <div className="fixed bottom-14 left-0 right-0 z-40 md:bottom-0">
          <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-3 pb-3 md:px-6 md:pb-4 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              loading={isSubmitting}
              className="w-full h-12 text-base"
            >
              确认报名
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserRegistration;
