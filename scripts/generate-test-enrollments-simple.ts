/**
 * 生成精简版测试报名数据Excel文件
 * 只包含必需字段，避免混淆
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

interface TestEnrollment {
  姓名: string;
  student_id: string; // 英文字段名，后端直接读取
  学号: string; // 保留学号列作为备用
  性别: string;
  联系方式: string;
  兴趣爱好: string;
  所在职能部门: string;
  "关注/从事的行业方向": string;
  软件技能: string;
  擅长领域: string;
  个人简介: string;
  职位: string;
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

const positions = [
  "品牌经理",
  "市场专员",
  "运营主管",
  "技术总监",
  "产品经理",
  "设计师",
  "销售代表",
  "研发工程师",
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

const bios = [
  "热爱学习，积极向上，希望结识更多志同道合的朋友",
  "对新技术充满热情，喜欢团队协作",
  "注重细节，追求完美，善于沟通",
  "创新思维，执行力强，责任心强",
  "善于学习，乐于分享，团队意识强",
];

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

    enrollments.push({
      姓名: name,
      student_id: studentId, // 英文字段名，后端直接读取
      学号: studentId, // 学号列作为备用
      性别: gender,
      联系方式: generatePhone(),
      兴趣爱好: randomChoice(interests),
      所在职能部门: randomChoice(departments),
      "关注/从事的行业方向": randomChoice(industries),
      软件技能: randomChoice(softwareSkills),
      擅长领域: randomChoice(expertise),
      个人简介: randomChoice(bios),
      职位: randomChoice(positions),
    });
  }

  return enrollments;
}

// 主函数
function main() {
  const count = parseInt(process.argv[2] || "30", 10);
  console.log(`正在生成 ${count} 条精简版测试报名数据...`);

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

  const filename = `test-enrollments-simple-${Date.now()}.xlsx`;
  const filepath = path.join(outputDir, filename);
  XLSX.writeFile(workbook, filepath);

  console.log(`✅ 成功生成精简版测试数据文件: ${filepath}`);
  console.log(`📊 包含 ${count} 条记录`);
  console.log(`\n包含的字段（共12个）：`);
  console.log(`  1. 姓名（必需）`);
  console.log(`  2. student_id（必需，后端创建用户的account字段）`);
  console.log(`  3. 学号（备用）`);
  console.log(`  4. 性别`);
  console.log(`  5. 联系方式`);
  console.log(`  6. 兴趣爱好（匹配必需）`);
  console.log(`  7. 所在职能部门（匹配必需）`);
  console.log(`  8. 关注/从事的行业方向（匹配必需）`);
  console.log(`  9. 软件技能（匹配必需）`);
  console.log(`  10. 擅长领域（匹配必需）`);
  console.log(`  11. 个人简介`);
  console.log(`  12. 职位`);
  console.log(`\n💡 提示：`);
  console.log(`  - student_id和学号的值相同，格式：TEST{时间戳}_{序号}`);
  console.log(`  - 后端会读取student_id字段作为用户account`);
  console.log(`  - 包含5个匹配维度字段，确保embedding计算成功`);
}

main();
