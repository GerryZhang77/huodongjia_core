/**
 * Mock 匹配数据
 */

// ========================================
// 类型定义
// ========================================
export interface MockMatchRule {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
}

export interface MockParticipantKeywords {
  user_id: string;
  name: string;
  keywords: string[];
  embedding: number[];
}

export interface MockMatchGroup {
  group_id: string;
  group_name: string;
  members: {
    user_id: string;
    name: string;
    avatar: string | null;
    keywords: string[];
    profile: {
      age: number;
      occupation: string;
      company: string;
    };
  }[];
  similarity_score: number;
  match_reasons: string[];
  is_locked: boolean;
}

// ========================================
// Mock 匹配规则
// ========================================
export const mockMatchingRules: MockMatchRule[] = [
  {
    id: "rule_001",
    name: "兴趣爱好匹配",
    description: "根据用户的兴趣爱好进行匹配，让有共同兴趣的人组成团队",
    weight: 40,
    enabled: true,
  },
  {
    id: "rule_002",
    name: "专业技能匹配",
    description: "基于专业技能和工作经验进行匹配，促进技能互补",
    weight: 35,
    enabled: true,
  },
  {
    id: "rule_003",
    name: "地域分布平衡",
    description: "平衡各组的地域分布，促进不同地区的交流",
    weight: 15,
    enabled: true,
  },
  {
    id: "rule_004",
    name: "性别比例平衡",
    description: "保持各组性别比例的相对平衡",
    weight: 10,
    enabled: false,
  },
];

// ========================================
// Mock 参与者关键词数据
// ========================================
export const mockParticipantKeywords: MockParticipantKeywords[] = [
  {
    user_id: "user_001",
    name: "王小明",
    keywords: ["前端开发", "React", "JavaScript", "用户体验", "产品设计"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_002",
    name: "李小红",
    keywords: ["产品管理", "用户研究", "数据分析", "Figma", "项目管理"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_003",
    name: "张三丰",
    keywords: ["后端开发", "Java", "微服务", "架构设计", "云计算"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_004",
    name: "赵小燕",
    keywords: ["UI设计", "视觉设计", "Sketch", "用户体验", "插画"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_005",
    name: "刘大伟",
    keywords: ["创业", "商业模式", "融资", "团队管理", "战略规划"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_006",
    name: "陈小静",
    keywords: ["数据分析", "Python", "机器学习", "金融科技", "数据可视化"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
];

// ========================================
// Mock 匹配分组结果
// ========================================
export const mockMatchingGroups: MockMatchGroup[] = [
  {
    group_id: "group_001",
    group_name: "技术产品组",
    members: [
      {
        user_id: "user_001",
        name: "王小明",
        avatar: "https://i.pravatar.cc/150?img=10",
        keywords: ["前端开发", "React"],
        profile: {
          age: 28,
          occupation: "前端工程师",
          company: "科技公司A",
        },
      },
      {
        user_id: "user_002",
        name: "李小红",
        avatar: "https://i.pravatar.cc/150?img=20",
        keywords: ["产品设计", "用户体验"],
        profile: {
          age: 26,
          occupation: "产品经理",
          company: "科技公司B",
        },
      },
    ],
    similarity_score: 0.85,
    match_reasons: ["技术背景相似", "都关注用户体验", "年龄相近"],
    is_locked: false,
  },
  {
    group_id: "group_002",
    group_name: "创业设计组",
    members: [
      {
        user_id: "user_004",
        name: "赵小燕",
        avatar: "https://i.pravatar.cc/150?img=40",
        keywords: ["UI设计", "视觉设计"],
        profile: {
          age: 24,
          occupation: "UI设计师",
          company: "设计工作室D",
        },
      },
      {
        user_id: "user_005",
        name: "刘大伟",
        avatar: "https://i.pravatar.cc/150?img=50",
        keywords: ["创业", "商业模式"],
        profile: {
          age: 35,
          occupation: "创业者",
          company: "创业公司E",
        },
      },
    ],
    similarity_score: 0.72,
    match_reasons: ["创意与商业结合", "互补技能", "目标一致"],
    is_locked: false,
  },
  {
    group_id: "group_003",
    group_name: "数据技术组",
    members: [
      {
        user_id: "user_003",
        name: "张三丰",
        avatar: "https://i.pravatar.cc/150?img=30",
        keywords: ["后端开发", "架构设计"],
        profile: {
          age: 32,
          occupation: "后端工程师",
          company: "互联网公司C",
        },
      },
      {
        user_id: "user_006",
        name: "陈小静",
        avatar: "https://i.pravatar.cc/150?img=60",
        keywords: ["数据分析", "机器学习"],
        profile: {
          age: 29,
          occupation: "数据分析师",
          company: "金融公司F",
        },
      },
    ],
    similarity_score: 0.78,
    match_reasons: ["数据处理背景", "技术能力互补", "职业发展方向相近"],
    is_locked: false,
  },
];

// ========================================
// Mock 相似度矩阵
// ========================================
export const mockSimilarityMatrix = [
  [1.0, 0.85, 0.62, 0.73, 0.45, 0.68],
  [0.85, 1.0, 0.58, 0.82, 0.52, 0.71],
  [0.62, 0.58, 1.0, 0.48, 0.55, 0.78],
  [0.73, 0.82, 0.48, 1.0, 0.72, 0.59],
  [0.45, 0.52, 0.55, 0.72, 1.0, 0.51],
  [0.68, 0.71, 0.78, 0.59, 0.51, 1.0],
];

// ========================================
// 辅助函数
// ========================================

/**
 * 根据自然语言描述调整规则权重
 */
export function adjustRulesByDescription(description: string): MockMatchRule[] {
  const rules = JSON.parse(
    JSON.stringify(mockMatchingRules)
  ) as MockMatchRule[];

  if (description.includes("兴趣") || description.includes("爱好")) {
    rules[0].weight = 50;
    rules[1].weight = 30;
  }

  if (description.includes("技能") || description.includes("专业")) {
    rules[1].weight = 50;
    rules[0].weight = 30;
  }

  if (
    description.includes("平衡") ||
    description.includes("性别") ||
    description.includes("年龄")
  ) {
    rules[3].enabled = true;
    rules[3].weight = 20;
  }

  return rules;
}

/**
 * 生成随机词向量
 */
export function generateMockEmbedding(dimension: number = 128): number[] {
  return Array.from({ length: dimension }, () => Math.random() * 2 - 1);
}
