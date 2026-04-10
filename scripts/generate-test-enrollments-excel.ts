/**
 * 生成测试报名数据Excel文件
 * 使用方式：tsx scripts/generate-test-enrollments-excel.ts [数量]
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

interface TestEnrollment {
  姓名: string;
  性别: string;
  学号: string;
  账号: string; // 后端必需字段
  学院专业: string;
  年级: string;
  "部门/职位": string;
  联系方式: string;
  一句话自我介绍: string;
  兴趣爱好: string;
  过往相关经历: string;
  所在职能部门: string;
  所在创投俱乐部: string;
  "关注/从事的行业方向": string;
  擅长领域: string;
  软件技能: string;
  过往成果: string;
  核心人脉资源: string;
  工作风格: string;
  擅长工作场景: string;
  加入初衷: string;
  可投入时间: string;
  对社团的理解: string;
}

// 数据池
const surnames = ["张", "王", "李", "赵", "刘", "陈", "杨", "黄", "周", "吴", "徐", "孙", "马", "朱", "胡", "郭", "何", "林", "罗", "高"];
const givenNames = ["伟", "芳", "娜", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "涛", "明", "超", "秀", "英", "华", "文"];
const genders = ["男", "女"];

const departments = [
  "品牌管理部",
  "市场部",
  "运营部",
  "技术部",
  "产品部",
  "设计部",
  "销售部",
  "研发部",
];

const industries = [
  "人工智能,互联网与平台经济,元宇宙与区块链科技",
  "金融科技,区块链,数字货币",
  "教育科技,在线学习,知识付费",
  "医疗健康,生物科技,智能医疗",
  "新能源,智能制造,碳中和",
  "电子商务,新零售,社交电商",
  "文化娱乐,内容创作,短视频",
  "企业服务,SaaS,云计算",
];

const expertise = [
  "设计,文案,技术,数据,策划",
  "市场营销,品牌推广,活动策划",
  "产品设计,需求分析,用户研究",
  "前端开发,UI交互,性能优化",
  "后端开发,算法设计,系统架构",
  "数据分析,增长黑客,用户运营",
  "内容运营,社群运营,新媒体",
  "项目管理,团队协作,敏捷开发",
];

const softwareSkills = [
  "PS,PR,Excel,PPT,Notion,飞书,编程",
  "Figma,Sketch,Photoshop,Illustrator",
  "Python,Java,React,Node.js",
  "Excel,PPT,数据分析,SQL",
  "Tableau,Power BI,SQL,Python",
  "Google Analytics,SEO,SEM,数据分析",
  "微信公众号,抖音,小红书,视频剪辑",
  "Jira,Confluence,Trello,Asana",
];

const interests = [
  "看书听音乐,旅游,摄影",
  "音乐,编程,电影,阅读",
  "跑步,健身,游戏,社交",
  "摄影,绘画,旅游,美食",
  "阅读,写作,分享,演讲",
  "音乐,舞蹈,演讲,表演",
  "旅游,摄影,社交,探险",
  "篮球,编程,阅读,电影",
];

const majors = [
  "心理与认知科学学院应用心理学",
  "计算机科学与技术学院软件工程",
  "经济管理学院工商管理",
  "新闻传播学院新媒体",
  "设计学院视觉传达",
  "数据科学学院数据分析",
  "外国语学院商务英语",
  "法学院法律",
];

const grades = ["25硕", "24硕", "23硕", "25本", "24本", "23本", "22本"];

function generateName(): string {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName1 = givenNames[Math.floor(Math.random() * givenNames.length)];
  const givenName2 = givenNames[Math.floor(Math.random() * givenNames.length)];
  return surname + givenName1 + givenName2;
}

function generatePhone(): string {
  const prefix = ["130", "131", "132", "133", "135", "136", "137", "138", "139", "150", "151", "152", "153", "155", "156", "157", "158", "159", "186", "187", "188", "189"];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
  return randomPrefix + randomSuffix;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTestEnrollments(count: number): TestEnrollment[] {
  const enrollments: TestEnrollment[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < count; i++) {
    const name = generateName();
    const gender = randomChoice(genders);
    const studentId = `TEST${timestamp}_${(i + 1).toString().padStart(4, "0")}`;
    const account = `test${timestamp}_${(i + 1).toString().padStart(4, "0")}`; // 生成唯一账号

    enrollments.push({
      姓名: name,
      性别: gender,
      学号: studentId,
      账号: account,
      学院专业: randomChoice(majors),
      年级: randomChoice(grades),
      "部门/职位": randomChoice(departments),
      联系方式: generatePhone(),
      一句话自我介绍: "热爱学习，积极向上，希望结识更多志同道合的朋友",
      兴趣爱好: randomChoice(interests),
      过往相关经历: "参与过多个项目，有丰富的团队协作经验",
      所在职能部门: randomChoice(departments),
      所在创投俱乐部: Math.random() > 0.5 ? randomChoice(departments) : "不在以上部门",
      "关注/从事的行业方向": randomChoice(industries),
      擅长领域: randomChoice(expertise),
      软件技能: randomChoice(softwareSkills),
      过往成果: "完成多个项目，获得团队认可",
      核心人脉资源: "学院内的老师和同学",
      工作风格: Math.random() > 0.5 ? "偏执行" : "偏策划",
      擅长工作场景: Math.random() > 0.5 ? "对内统筹,活动现场" : "对外联络,线上协作",
      加入初衷: "能力提升,项目经验,视野,资源",
      可投入时间: Math.random() > 0.5 ? "周中都可以" : "周末为主",
      对社团的理解: "希望通过社团活动提升自己，结识更多朋友",
    });
  }

  return enrollments;
}

// 主函数
function main() {
  const count = parseInt(process.argv[2] || "30", 10);
  console.log(`正在生成 ${count} 条测试报名数据...`);

  const enrollments = generateTestEnrollments(count);

  // 创建工作簿
  const worksheet = XLSX.utils.json_to_sheet(enrollments);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "报名数据");

  // 保存文件
  const outputDir = path.join(process.cwd(), "test-data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `test-enrollments-${Date.now()}.xlsx`;
  const filepath = path.join(outputDir, filename);
  XLSX.writeFile(workbook, filepath);

  console.log(`✅ 成功生成测试数据文件: ${filepath}`);
  console.log(`📊 包含 ${count} 条记录`);
  console.log(`\n包含的字段：`);
  console.log(`  - 姓名（必需）`);
  console.log(`  - 性别`);
  console.log(`  - 学号（唯一标识，使用时间戳避免重复）`);
  console.log(`  - 兴趣爱好（匹配必需）`);
  console.log(`  - 所在职能部门（匹配必需）`);
  console.log(`  - 关注/从事的行业方向（匹配必需）`);
  console.log(`  - 软件技能（匹配必需）`);
  console.log(`  - 擅长领域（匹配必需）`);
  console.log(`\n💡 提示：每次生成的学号都包含时间戳，确保不会与数据库中已有数据冲突`);
}

main();
