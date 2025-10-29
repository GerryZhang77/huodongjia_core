/**
 * 临时演示活动数据
 * 基于：网页-骨干大团建活动公告.md
 * 用途：临时演示，后续可通过环境变量关闭
 */

import type { Activity } from "@/features/activities/types";

/**
 * 活动流程项
 */
interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

/**
 * 活动亮点
 */
interface Highlight {
  icon: string;
  title: string;
  description: string;
}

/**
 * 活动公告
 */
interface Announcement {
  title: string;
  content: string[];
}

/**
 * 扩展的演示活动类型
 */
export interface DemoActivity extends Activity {
  organizerName?: string;
  organizerLogo?: string;
  fee?: string;
  duration?: string;
  schedule?: ScheduleItem[];
  highlights?: Highlight[];
  announcement?: Announcement;
}

/**
 * 演示活动 - 北京大学学生创新学社秋季骨干迎新会
 */
export const demoActivity: DemoActivity = {
  id: "act-pku-innovation-2025-fall",
  title: "北京大学学生创新学社秋季骨干迎新会",
  description:
    '青春逢创新，骨干聚初心。北京大学学生创新学社2025年秋季骨干迎新会以"创新"为纽带，连接新老骨干，打造"有温度、有活力、有资源"的社群生态。',
  coverImage:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", // 临时占位图：团队活动场景
  category: "social" as const,
  tags: ["offline", "free", "popular"] as const,

  // 时间信息
  registrationStart: "2025-10-25T00:00:00+08:00",
  registrationEnd: "2025-10-30T23:59:59+08:00",
  activityStart: "2025-10-31T18:00:00+08:00",
  activityEnd: "2025-10-31T23:00:00+08:00",

  // 地点与容量
  location: "海淀区青龙桥街道二河开21号艺术区wespace 轰趴营地",
  capacity: 220,
  enrolledCount: 180,

  // 状态
  status: "recruiting",
  isPublic: true,
  allowWaitlist: false,

  // 元数据
  createdAt: "2025-10-20T10:00:00+08:00",
  updatedAt: "2025-10-28T15:30:00+08:00",

  // 扩展信息（用于详情页展示）
  organizerName: "北京大学学生创新学社",
  organizerLogo:
    "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=200&q=80", // 临时占位图：学校logo
  fee: "免费",
  duration: "5小时",

  // 活动流程
  schedule: [
    {
      time: "17:30-18:00",
      title: "暖场签到",
      description: "签到时可领取定制伴手礼哟",
    },
    {
      time: "18:00-18:10",
      title: "开场仪式",
      description: "",
    },
    {
      time: "18:10-18:30",
      title: "会长致辞，部长团介绍",
      description: "",
    },
    {
      time: "18:30-19:40",
      title: "节目与互动，游戏与抽奖",
      description: "",
    },
    {
      time: "19:40-22:40",
      title: "自由交流，匹配与链接",
      description: "NFC互动匹配、茶歇区自由交流",
    },
  ],

  // 活动亮点
  highlights: [
    {
      icon: "🎯",
      title: "NFC互动匹配",
      description:
        "根据学院、部门、年级、兴趣、创投资源等信息为你匹配契合的伙伴。可通过现场二维码查询，或通过手机贴近对方的NFC手环，实时查看两人匹配度。",
    },
    {
      icon: "☕",
      title: "茶歇交流区",
      description:
        '提供餐食和饮品，大家可自由交流，或约匹配骨干一起探讨未来想做的活动项目、资源对接或其他需求（如"想找技术合伙人"）。',
    },
    {
      icon: "🎁",
      title: "定制伴手礼",
      description: "签到时可领取学社定制伴手礼，包括NFC手环等周边产品。",
    },
    {
      icon: "🎉",
      title: "游戏与抽奖",
      description: "精心准备的互动游戏和抽奖环节，让活动更加精彩。",
    },
  ],

  // 活动公告
  announcement: {
    title: "温馨提示",
    content: [
      "请工作人员及节目组提前15分钟到场，确保活动顺利开展",
      "现场设有NFC手环互动匹配系统，可查询匹配度并进行资源对接",
      "活动提供茶歇服务，请适量取用并保持场地整洁",
      "如遇紧急情况，请联系现场工作人员或拨打负责人电话：19950747357",
    ],
  },
};

/**
 * 检查是否为演示活动
 */
export const isDemoActivity = (activityId: string): boolean => {
  return activityId === demoActivity.id;
};

/**
 * 获取演示模式状态
 */
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === "true";
};
