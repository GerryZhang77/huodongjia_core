/**
 * Mock 匹配数据
 *
 * 基于报名数据的维度生成匹配规则：
 * - 年龄段
 * - 性别
 * - 职业/行业
 * - 城市
 * - 兴趣标签
 * - 技能特长
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
  /** 规则类型：similarity(相似匹配) | diversity(多样性匹配) | constraint(约束条件) */
  type?: "similarity" | "diversity" | "constraint";
  /** 匹配维度：age | gender | occupation | industry | city | interests | skills */
  dimension?: string;
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
    gender?: string;
    profile: {
      age: number;
      occupation: string;
      company: string;
      industry?: string;
      city?: string;
    };
  }[];
  similarity_score: number;
  match_reasons: string[];
  is_locked: boolean;
}

// ========================================
// Mock 匹配规则 (基于报名数据维度)
// ========================================
export const mockMatchingRules: MockMatchRule[] = [
  {
    id: "rule_001",
    name: "兴趣爱好相似匹配",
    description:
      "根据用户填写的兴趣爱好进行匹配，让有共同兴趣的人更容易建立话题",
    weight: 25,
    enabled: true,
    type: "similarity",
    dimension: "interests",
  },
  {
    id: "rule_002",
    name: "技能互补匹配",
    description: "基于专业技能进行互补匹配，让不同技能的人可以相互学习",
    weight: 20,
    enabled: true,
    type: "diversity",
    dimension: "skills",
  },
  {
    id: "rule_003",
    name: "行业多样性",
    description: "保证每组有不同行业的人，促进跨行业交流",
    weight: 20,
    enabled: true,
    type: "diversity",
    dimension: "industry",
  },
  {
    id: "rule_004",
    name: "年龄段均衡",
    description: "让不同年龄段的人分布在各组，促进代际交流",
    weight: 15,
    enabled: true,
    type: "diversity",
    dimension: "age",
  },
  {
    id: "rule_005",
    name: "性别比例平衡",
    description: "保持各组男女比例相对均衡，避免性别过于集中",
    weight: 10,
    enabled: true,
    type: "constraint",
    dimension: "gender",
  },
  {
    id: "rule_006",
    name: "城市分布均衡",
    description: "平衡各组的地域分布，促进不同城市之间的交流",
    weight: 10,
    enabled: false,
    type: "diversity",
    dimension: "city",
  },
];

// ========================================
// Mock 参与者关键词数据 (扩展到 35 人)
// ========================================
export const mockParticipantKeywords: MockParticipantKeywords[] = [
  // 第一组成员 (9人)
  {
    user_id: "user_001",
    name: "王小明",
    keywords: ["前端开发", "React", "TypeScript", "用户体验"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_002",
    name: "李小红",
    keywords: ["产品管理", "用户研究", "数据分析", "Figma"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_003",
    name: "张三丰",
    keywords: ["后端开发", "Java", "微服务", "架构设计"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_004",
    name: "赵小燕",
    keywords: ["UI设计", "视觉设计", "Sketch", "品牌设计"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_005",
    name: "刘大伟",
    keywords: ["创业", "商业模式", "融资", "团队管理"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_006",
    name: "陈小静",
    keywords: ["数据分析", "Python", "机器学习", "数据可视化"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_007",
    name: "周杰",
    keywords: ["运营管理", "内容策划", "社群运营", "增长黑客"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_008",
    name: "吴敏",
    keywords: ["人力资源", "招聘", "组织发展", "企业文化"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_009",
    name: "郑强",
    keywords: ["市场营销", "品牌推广", "活动策划", "新媒体"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  // 第二组成员 (9人)
  {
    user_id: "user_010",
    name: "孙丽娜",
    keywords: ["财务管理", "投资分析", "风险控制", "审计"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_011",
    name: "朱浩然",
    keywords: ["全栈开发", "Node.js", "Vue.js", "DevOps"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_012",
    name: "林雅琪",
    keywords: ["交互设计", "用户体验", "原型设计", "设计系统"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_013",
    name: "杨志刚",
    keywords: ["销售管理", "客户关系", "商务拓展", "谈判技巧"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_014",
    name: "黄美玲",
    keywords: ["法务合规", "知识产权", "合同管理", "风险评估"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_015",
    name: "马晓东",
    keywords: ["算法工程", "深度学习", "自然语言处理", "推荐系统"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_016",
    name: "徐佳怡",
    keywords: ["公关传播", "媒体关系", "危机公关", "品牌传播"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_017",
    name: "高俊峰",
    keywords: ["项目管理", "敏捷开发", "Scrum", "团队协作"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_018",
    name: "谢雨桐",
    keywords: ["内容创作", "短视频", "直播", "私域流量"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  // 第三组成员 (9人)
  {
    user_id: "user_019",
    name: "韩子涵",
    keywords: ["iOS开发", "Swift", "移动端架构", "性能优化"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_020",
    name: "冯晓萱",
    keywords: ["战略咨询", "商业分析", "市场调研", "竞品分析"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_021",
    name: "蒋伟",
    keywords: ["测试工程", "自动化测试", "性能测试", "质量保证"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_022",
    name: "沈佳琪",
    keywords: ["品牌设计", "插画", "3D设计", "动效设计"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_023",
    name: "邓志豪",
    keywords: ["安全工程", "渗透测试", "安全架构", "隐私保护"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_024",
    name: "罗梦瑶",
    keywords: ["教育培训", "课程设计", "知识管理", "学习体验"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_025",
    name: "潘宇航",
    keywords: ["供应链", "物流管理", "采购", "库存优化"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_026",
    name: "唐静怡",
    keywords: ["客户成功", "用户留存", "客户体验", "满意度提升"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_027",
    name: "曹明辉",
    keywords: ["云计算", "AWS", "容器化", "基础设施"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  // 第四组成员 (8人)
  {
    user_id: "user_028",
    name: "许雪儿",
    keywords: ["医疗健康", "健康管理", "医疗科技", "养老服务"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_029",
    name: "陆天宇",
    keywords: ["Android开发", "Kotlin", "跨平台", "Flutter"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_030",
    name: "苏婉清",
    keywords: ["用户研究", "定性研究", "可用性测试", "用户画像"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_031",
    name: "魏晨阳",
    keywords: ["电商运营", "店铺管理", "流量转化", "爆款打造"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_032",
    name: "姜思雨",
    keywords: ["新能源", "智能制造", "碳中和", "绿色科技"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_033",
    name: "何志远",
    keywords: ["区块链", "Web3", "DeFi", "智能合约"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_034",
    name: "夏雨萱",
    keywords: ["心理咨询", "情绪管理", "团队建设", "领导力"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
  {
    user_id: "user_035",
    name: "袁子杰",
    keywords: ["投资银行", "并购", "IPO", "资本市场"],
    embedding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
  },
];

// ========================================
// Mock 匹配分组结果 (4组，每组8-9人)
// ========================================
export const mockMatchingGroups: MockMatchGroup[] = [
  {
    group_id: "group_001",
    group_name: "创新技术组",
    members: [
      {
        user_id: "user_001",
        name: "王小明",
        avatar: "https://i.pravatar.cc/150?img=10",
        keywords: ["前端开发", "React"],
        gender: "male",
        profile: {
          age: 28,
          occupation: "前端工程师",
          company: "字节跳动",
          industry: "互联网",
          city: "北京",
        },
      },
      {
        user_id: "user_002",
        name: "李小红",
        avatar: "https://i.pravatar.cc/150?img=20",
        keywords: ["产品设计", "用户体验"],
        gender: "female",
        profile: {
          age: 26,
          occupation: "产品经理",
          company: "阿里巴巴",
          industry: "电商",
          city: "杭州",
        },
      },
      {
        user_id: "user_003",
        name: "张三丰",
        avatar: "https://i.pravatar.cc/150?img=30",
        keywords: ["后端开发", "架构设计"],
        gender: "male",
        profile: {
          age: 32,
          occupation: "后端架构师",
          company: "腾讯",
          industry: "互联网",
          city: "深圳",
        },
      },
      {
        user_id: "user_006",
        name: "陈小静",
        avatar: "https://i.pravatar.cc/150?img=25",
        keywords: ["数据分析", "机器学习"],
        gender: "female",
        profile: {
          age: 29,
          occupation: "数据科学家",
          company: "美团",
          industry: "本地生活",
          city: "北京",
        },
      },
      {
        user_id: "user_015",
        name: "马晓东",
        avatar: "https://i.pravatar.cc/150?img=35",
        keywords: ["算法工程", "深度学习"],
        gender: "male",
        profile: {
          age: 30,
          occupation: "算法工程师",
          company: "小米",
          industry: "智能硬件",
          city: "北京",
        },
      },
      {
        user_id: "user_017",
        name: "高俊峰",
        avatar: "https://i.pravatar.cc/150?img=37",
        keywords: ["项目管理", "敏捷开发"],
        gender: "male",
        profile: {
          age: 34,
          occupation: "技术总监",
          company: "京东",
          industry: "电商",
          city: "北京",
        },
      },
      {
        user_id: "user_021",
        name: "蒋伟",
        avatar: "https://i.pravatar.cc/150?img=41",
        keywords: ["测试工程", "质量保证"],
        gender: "male",
        profile: {
          age: 27,
          occupation: "QA工程师",
          company: "网易",
          industry: "游戏",
          city: "广州",
        },
      },
      {
        user_id: "user_027",
        name: "曹明辉",
        avatar: "https://i.pravatar.cc/150?img=47",
        keywords: ["云计算", "DevOps"],
        gender: "male",
        profile: {
          age: 31,
          occupation: "云架构师",
          company: "华为",
          industry: "通信",
          city: "深圳",
        },
      },
      {
        user_id: "user_012",
        name: "林雅琪",
        avatar: "https://i.pravatar.cc/150?img=22",
        keywords: ["交互设计", "用户体验"],
        gender: "female",
        profile: {
          age: 25,
          occupation: "交互设计师",
          company: "蚂蚁集团",
          industry: "金融科技",
          city: "杭州",
        },
      },
    ],
    similarity_score: 0.87,
    match_reasons: [
      "技术背景互补",
      "产品与技术协作经验丰富",
      "年龄分布合理",
      "性别比例均衡",
    ],
    is_locked: false,
  },
  {
    group_id: "group_002",
    group_name: "商业创新组",
    members: [
      {
        user_id: "user_005",
        name: "刘大伟",
        avatar: "https://i.pravatar.cc/150?img=50",
        keywords: ["创业", "商业模式"],
        gender: "male",
        profile: {
          age: 35,
          occupation: "创业者",
          company: "自创公司",
          industry: "科技创业",
          city: "上海",
        },
      },
      {
        user_id: "user_010",
        name: "孙丽娜",
        avatar: "https://i.pravatar.cc/150?img=26",
        keywords: ["财务管理", "投资分析"],
        gender: "female",
        profile: {
          age: 33,
          occupation: "财务总监",
          company: "红杉资本",
          industry: "投资",
          city: "上海",
        },
      },
      {
        user_id: "user_013",
        name: "杨志刚",
        avatar: "https://i.pravatar.cc/150?img=33",
        keywords: ["销售管理", "商务拓展"],
        gender: "male",
        profile: {
          age: 36,
          occupation: "销售总监",
          company: "Salesforce",
          industry: "企业服务",
          city: "上海",
        },
      },
      {
        user_id: "user_014",
        name: "黄美玲",
        avatar: "https://i.pravatar.cc/150?img=24",
        keywords: ["法务合规", "知识产权"],
        gender: "female",
        profile: {
          age: 31,
          occupation: "法务经理",
          company: "高盛",
          industry: "金融",
          city: "香港",
        },
      },
      {
        user_id: "user_020",
        name: "冯晓萱",
        avatar: "https://i.pravatar.cc/150?img=28",
        keywords: ["战略咨询", "商业分析"],
        gender: "female",
        profile: {
          age: 29,
          occupation: "咨询顾问",
          company: "麦肯锡",
          industry: "咨询",
          city: "北京",
        },
      },
      {
        user_id: "user_035",
        name: "袁子杰",
        avatar: "https://i.pravatar.cc/150?img=55",
        keywords: ["投资银行", "并购"],
        gender: "male",
        profile: {
          age: 32,
          occupation: "投行分析师",
          company: "中金公司",
          industry: "金融",
          city: "上海",
        },
      },
      {
        user_id: "user_031",
        name: "魏晨阳",
        avatar: "https://i.pravatar.cc/150?img=51",
        keywords: ["电商运营", "流量转化"],
        gender: "male",
        profile: {
          age: 28,
          occupation: "运营总监",
          company: "拼多多",
          industry: "电商",
          city: "上海",
        },
      },
      {
        user_id: "user_008",
        name: "吴敏",
        avatar: "https://i.pravatar.cc/150?img=18",
        keywords: ["人力资源", "组织发展"],
        gender: "female",
        profile: {
          age: 30,
          occupation: "HRBP",
          company: "贝壳",
          industry: "房产",
          city: "北京",
        },
      },
    ],
    similarity_score: 0.82,
    match_reasons: [
      "商业思维一致",
      "创业与投资经验互补",
      "跨行业资源丰富",
      "决策能力强",
    ],
    is_locked: false,
  },
  {
    group_id: "group_003",
    group_name: "品牌创意组",
    members: [
      {
        user_id: "user_004",
        name: "赵小燕",
        avatar: "https://i.pravatar.cc/150?img=40",
        keywords: ["UI设计", "视觉设计"],
        gender: "female",
        profile: {
          age: 24,
          occupation: "UI设计师",
          company: "网易",
          industry: "互联网",
          city: "杭州",
        },
      },
      {
        user_id: "user_007",
        name: "周杰",
        avatar: "https://i.pravatar.cc/150?img=17",
        keywords: ["运营管理", "内容策划"],
        gender: "male",
        profile: {
          age: 27,
          occupation: "运营经理",
          company: "B站",
          industry: "视频",
          city: "上海",
        },
      },
      {
        user_id: "user_009",
        name: "郑强",
        avatar: "https://i.pravatar.cc/150?img=19",
        keywords: ["市场营销", "品牌推广"],
        gender: "male",
        profile: {
          age: 29,
          occupation: "市场总监",
          company: "完美日记",
          industry: "消费品",
          city: "广州",
        },
      },
      {
        user_id: "user_016",
        name: "徐佳怡",
        avatar: "https://i.pravatar.cc/150?img=36",
        keywords: ["公关传播", "媒体关系"],
        gender: "female",
        profile: {
          age: 28,
          occupation: "公关经理",
          company: "蓝色光标",
          industry: "传媒",
          city: "北京",
        },
      },
      {
        user_id: "user_018",
        name: "谢雨桐",
        avatar: "https://i.pravatar.cc/150?img=38",
        keywords: ["内容创作", "短视频"],
        gender: "female",
        profile: {
          age: 25,
          occupation: "内容创作者",
          company: "MCN机构",
          industry: "新媒体",
          city: "成都",
        },
      },
      {
        user_id: "user_022",
        name: "沈佳琪",
        avatar: "https://i.pravatar.cc/150?img=42",
        keywords: ["品牌设计", "3D设计"],
        gender: "female",
        profile: {
          age: 26,
          occupation: "品牌设计师",
          company: "奈雪",
          industry: "餐饮",
          city: "深圳",
        },
      },
      {
        user_id: "user_024",
        name: "罗梦瑶",
        avatar: "https://i.pravatar.cc/150?img=44",
        keywords: ["教育培训", "课程设计"],
        gender: "female",
        profile: {
          age: 30,
          occupation: "培训总监",
          company: "得到",
          industry: "教育",
          city: "北京",
        },
      },
      {
        user_id: "user_026",
        name: "唐静怡",
        avatar: "https://i.pravatar.cc/150?img=46",
        keywords: ["客户成功", "用户留存"],
        gender: "female",
        profile: {
          age: 27,
          occupation: "客户成功经理",
          company: "有赞",
          industry: "SaaS",
          city: "杭州",
        },
      },
      {
        user_id: "user_034",
        name: "夏雨萱",
        avatar: "https://i.pravatar.cc/150?img=54",
        keywords: ["心理咨询", "团队建设"],
        gender: "female",
        profile: {
          age: 32,
          occupation: "心理顾问",
          company: "壹心理",
          industry: "心理服务",
          city: "广州",
        },
      },
    ],
    similarity_score: 0.79,
    match_reasons: [
      "创意能力突出",
      "内容与设计协同",
      "品牌营销经验丰富",
      "用户触达能力强",
    ],
    is_locked: false,
  },
  {
    group_id: "group_004",
    group_name: "科技前沿组",
    members: [
      {
        user_id: "user_011",
        name: "朱浩然",
        avatar: "https://i.pravatar.cc/150?img=31",
        keywords: ["全栈开发", "Node.js"],
        gender: "male",
        profile: {
          age: 28,
          occupation: "全栈工程师",
          company: "Shopify",
          industry: "电商",
          city: "多伦多",
        },
      },
      {
        user_id: "user_019",
        name: "韩子涵",
        avatar: "https://i.pravatar.cc/150?img=39",
        keywords: ["iOS开发", "移动端架构"],
        gender: "male",
        profile: {
          age: 29,
          occupation: "iOS工程师",
          company: "苹果",
          industry: "科技",
          city: "上海",
        },
      },
      {
        user_id: "user_023",
        name: "邓志豪",
        avatar: "https://i.pravatar.cc/150?img=43",
        keywords: ["安全工程", "渗透测试"],
        gender: "male",
        profile: {
          age: 31,
          occupation: "安全工程师",
          company: "奇安信",
          industry: "安全",
          city: "北京",
        },
      },
      {
        user_id: "user_025",
        name: "潘宇航",
        avatar: "https://i.pravatar.cc/150?img=45",
        keywords: ["供应链", "物流管理"],
        gender: "male",
        profile: {
          age: 33,
          occupation: "供应链总监",
          company: "顺丰",
          industry: "物流",
          city: "深圳",
        },
      },
      {
        user_id: "user_028",
        name: "许雪儿",
        avatar: "https://i.pravatar.cc/150?img=48",
        keywords: ["医疗健康", "医疗科技"],
        gender: "female",
        profile: {
          age: 30,
          occupation: "产品总监",
          company: "微医",
          industry: "医疗",
          city: "杭州",
        },
      },
      {
        user_id: "user_029",
        name: "陆天宇",
        avatar: "https://i.pravatar.cc/150?img=49",
        keywords: ["Android开发", "Flutter"],
        gender: "male",
        profile: {
          age: 27,
          occupation: "移动开发工程师",
          company: "小红书",
          industry: "社交",
          city: "上海",
        },
      },
      {
        user_id: "user_030",
        name: "苏婉清",
        avatar: "https://i.pravatar.cc/150?img=52",
        keywords: ["用户研究", "可用性测试"],
        gender: "female",
        profile: {
          age: 26,
          occupation: "用户研究员",
          company: "滴滴",
          industry: "出行",
          city: "北京",
        },
      },
      {
        user_id: "user_032",
        name: "姜思雨",
        avatar: "https://i.pravatar.cc/150?img=53",
        keywords: ["新能源", "碳中和"],
        gender: "female",
        profile: {
          age: 28,
          occupation: "产品经理",
          company: "宁德时代",
          industry: "新能源",
          city: "福州",
        },
      },
      {
        user_id: "user_033",
        name: "何志远",
        avatar: "https://i.pravatar.cc/150?img=56",
        keywords: ["区块链", "Web3"],
        gender: "male",
        profile: {
          age: 29,
          occupation: "区块链开发",
          company: "Binance",
          industry: "加密货币",
          city: "新加坡",
        },
      },
    ],
    similarity_score: 0.84,
    match_reasons: [
      "前沿技术领域覆盖广",
      "跨行业技术视野",
      "移动与安全能力互补",
      "国际化背景丰富",
    ],
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

// 引入报名数据
import { mockEnrollments, type MockEnrollment } from "./enrollments";

/**
 * 根据活动ID获取参与者并生成匹配分组
 * 解决 mockMatchingGroups 与实际活动报名数据不匹配的问题
 */
export function generateMatchingGroupsForActivity(
  activityId: string,
): MockMatchingGroup[] {
  // 获取该活动的报名数据
  const activityEnrollments = mockEnrollments.filter(
    (e) => e.activity_id === activityId && e.status !== "cancelled",
  );

  if (activityEnrollments.length === 0) {
    return [];
  }

  // 将报名数据转换为匹配组成员格式
  const members: MockGroupMember[] = activityEnrollments.map((enrollment) => ({
    user_id: enrollment.user_id,
    name: enrollment.name,
    avatar:
      enrollment.avatar || `https://i.pravatar.cc/150?u=${enrollment.user_id}`,
    keywords: [...enrollment.interests, ...enrollment.skills].slice(0, 3),
    gender: enrollment.gender as "male" | "female",
    profile: {
      age: enrollment.age,
      occupation: enrollment.occupation,
      company: enrollment.company,
      industry: enrollment.company, // 使用 company 作为 industry 的近似值
      city: enrollment.city,
    },
  }));

  // 简单分组算法：根据成员数量分成若干组
  const groupSize = 4; // 每组4人
  const groups: MockMatchingGroup[] = [];

  for (let i = 0; i < members.length; i += groupSize) {
    const groupMembers = members.slice(i, i + groupSize);
    const groupIndex = Math.floor(i / groupSize);

    // 根据成员特征生成匹配理由
    const reasons = generateMatchReasons(groupMembers);

    groups.push({
      group_id: `group_${activityId}_${groupIndex + 1}`,
      group_name: `第${groupIndex + 1}组`,
      members: groupMembers,
      similarity_score: 0.75 + Math.random() * 0.2, // 随机相似度 0.75-0.95
      match_reasons: reasons,
      is_locked: false,
    });
  }

  return groups;
}

/**
 * 根据成员特征生成匹配理由
 */
function generateMatchReasons(members: MockGroupMember[]): string[] {
  const reasons: string[] = [];

  // 检查性别比例
  const maleCount = members.filter((m) => m.gender === "male").length;
  const femaleCount = members.filter((m) => m.gender === "female").length;
  if (maleCount > 0 && femaleCount > 0) {
    reasons.push("性别比例均衡");
  }

  // 检查年龄分布
  const ages = members.map((m) => m.profile.age).filter(Boolean);
  if (ages.length > 1) {
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);
    if (maxAge - minAge <= 10) {
      reasons.push("年龄相近");
    } else {
      reasons.push("年龄分布合理");
    }
  }

  // 检查城市分布
  const cities = [
    ...new Set(members.map((m) => m.profile.city).filter(Boolean)),
  ];
  if (cities.length > 1) {
    reasons.push("跨城市交流机会");
  } else if (cities.length === 1) {
    reasons.push(`同城（${cities[0]}）便于线下交流`);
  }

  // 检查职业多样性
  const occupations = [
    ...new Set(members.map((m) => m.profile.occupation).filter(Boolean)),
  ];
  if (occupations.length > 1) {
    reasons.push("职业背景多样");
  }

  // 检查关键词匹配
  const allKeywords = members.flatMap((m) => m.keywords);
  const keywordCounts = allKeywords.reduce(
    (acc, kw) => {
      acc[kw] = (acc[kw] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const commonKeywords = Object.entries(keywordCounts)
    .filter(([, count]) => count > 1)
    .map(([kw]) => kw);
  if (commonKeywords.length > 0) {
    reasons.push(`共同兴趣：${commonKeywords.slice(0, 2).join("、")}`);
  }

  // 确保至少有一个理由
  if (reasons.length === 0) {
    reasons.push("综合匹配度较高");
  }

  return reasons.slice(0, 4); // 最多返回4个理由
}

/**
 * 根据自然语言描述调整规则权重
 */
export function adjustRulesByDescription(description: string): MockMatchRule[] {
  const rules = JSON.parse(
    JSON.stringify(mockMatchingRules),
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

// ========================================
// 匹配历史记录
// ========================================
export interface MockMatchingHistory {
  id: string;
  activityId: string;
  executedAt: string;
  rules: MockMatchRule[];
  groups: MockMatchGroup[];
  statistics: {
    totalParticipants: number;
    totalGroups: number;
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
  isPublished: boolean;
  createdBy?: string;
  note?: string;
}

// 内存存储匹配历史
const matchingHistoryStore: Map<string, MockMatchingHistory[]> = new Map();

// 预置一些历史记录 for ma_001 (使用真实的分组数据)
const presetHistoryGroups = mockMatchingGroups.slice(0, 2); // 取前两个分组作为历史记录
const presetTotalParticipants = presetHistoryGroups.reduce(
  (sum, g) => sum + g.members.length,
  0,
);

matchingHistoryStore.set("ma_001", [
  {
    id: "history_001",
    activityId: "ma_001",
    executedAt: "2025-01-15T10:30:00Z",
    rules: mockMatchingRules.slice(0, 4),
    groups: presetHistoryGroups,
    statistics: {
      totalParticipants: presetTotalParticipants,
      totalGroups: presetHistoryGroups.length,
      avgScore:
        presetHistoryGroups.reduce((sum, g) => sum + g.similarity_score, 0) /
        presetHistoryGroups.length,
      minScore: Math.min(...presetHistoryGroups.map((g) => g.similarity_score)),
      maxScore: Math.max(...presetHistoryGroups.map((g) => g.similarity_score)),
    },
    isPublished: false,
    createdBy: "merchant_001",
    note: "首次测试匹配",
  },
]);

/**
 * 获取活动的匹配历史记录
 */
export function getMatchingHistory(activityId: string): MockMatchingHistory[] {
  return matchingHistoryStore.get(activityId) || [];
}

/**
 * 保存匹配结果到历史记录
 */
export function saveMatchingHistory(
  activityId: string,
  rules: MockMatchRule[],
  groups: MockMatchGroup[],
  note?: string,
): MockMatchingHistory {
  const history: MockMatchingHistory = {
    id: `history_${Date.now()}`,
    activityId,
    executedAt: new Date().toISOString(),
    rules: JSON.parse(JSON.stringify(rules)),
    groups: JSON.parse(JSON.stringify(groups)),
    statistics: {
      totalParticipants: groups.reduce((sum, g) => sum + g.members.length, 0),
      totalGroups: groups.length,
      avgScore:
        groups.length > 0
          ? groups.reduce((sum, g) => sum + g.similarity_score, 0) /
            groups.length
          : 0,
      minScore:
        groups.length > 0
          ? Math.min(...groups.map((g) => g.similarity_score))
          : 0,
      maxScore:
        groups.length > 0
          ? Math.max(...groups.map((g) => g.similarity_score))
          : 0,
    },
    isPublished: false,
    createdBy: "merchant_001",
    note,
  };

  const existingHistory = matchingHistoryStore.get(activityId) || [];
  existingHistory.unshift(history); // 新记录放在前面
  matchingHistoryStore.set(activityId, existingHistory);

  return history;
}

/**
 * 发布匹配结果
 */
export function publishMatchingHistory(historyId: string): boolean {
  for (const [activityId, histories] of matchingHistoryStore) {
    const history = histories.find((h) => h.id === historyId);
    if (history) {
      // 先取消其他已发布的
      histories.forEach((h) => {
        h.isPublished = false;
      });
      // 发布当前的
      history.isPublished = true;
      return true;
    }
  }
  return false;
}

// ========================================
// 匹配任务 (用于异步匹配进度追踪)
// ========================================
export interface MockMatchingTask {
  id: string;
  activityId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  startedAt: string;
  completedAt?: string;
  resultId?: string;
}

// 内存存储匹配任务
const matchingTaskStore: Map<string, MockMatchingTask> = new Map();

/**
 * 创建匹配任务
 */
export function createMatchingTask(activityId: string): MockMatchingTask {
  const task: MockMatchingTask = {
    id: `task_${Date.now()}`,
    activityId,
    status: "pending",
    progress: 0,
    message: "任务已创建，等待处理...",
    startedAt: new Date().toISOString(),
  };
  matchingTaskStore.set(task.id, task);
  return task;
}

/**
 * 获取匹配任务状态
 */
export function getMatchingTask(taskId: string): MockMatchingTask | null {
  return matchingTaskStore.get(taskId) || null;
}

/**
 * 更新匹配任务状态
 */
export function updateMatchingTask(
  taskId: string,
  updates: Partial<MockMatchingTask>,
): MockMatchingTask | null {
  const task = matchingTaskStore.get(taskId);
  if (task) {
    Object.assign(task, updates);
    return task;
  }
  return null;
}

/**
 * 模拟异步匹配过程
 */
export async function simulateAsyncMatching(
  taskId: string,
  activityId: string,
  rules: MockMatchRule[],
): Promise<void> {
  const progressSteps = [
    { progress: 10, message: "正在加载参与者数据..." },
    { progress: 25, message: "正在分析用户特征..." },
    { progress: 40, message: "正在计算相似度矩阵..." },
    { progress: 60, message: "正在应用匹配规则..." },
    { progress: 80, message: "正在优化分组结果..." },
    { progress: 95, message: "正在生成匹配报告..." },
  ];

  updateMatchingTask(taskId, { status: "processing" });

  for (const step of progressSteps) {
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 500),
    );
    updateMatchingTask(taskId, {
      progress: step.progress,
      message: step.message,
    });
  }

  // 生成结果
  const groups = generateMatchingGroupsForActivity(activityId);

  // 保存到历史记录
  const history = saveMatchingHistory(activityId, rules, groups);

  // 完成任务
  updateMatchingTask(taskId, {
    status: "completed",
    progress: 100,
    message: "匹配完成",
    completedAt: new Date().toISOString(),
    resultId: history.id,
  });
}
