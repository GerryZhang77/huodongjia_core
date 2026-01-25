/**
 * 商家端帮助中心页面
 * 支持后端配置 + 前端兜底数据
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  FileText,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import { Toast, SearchBar, Collapse } from "antd-mobile";
import { MerchantLayout } from "@/components/layout";

// 帮助文章类型
interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
}

// 帮助分类类型
interface HelpCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  articles: HelpArticle[];
}

// 常见问题类型
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// 兜底的帮助数据
const defaultHelpData: {
  categories: HelpCategory[];
  faqs: FAQ[];
  contactInfo: {
    phone: string;
    email: string;
    workTime: string;
  };
} = {
  categories: [
    {
      id: "activity",
      title: "活动管理",
      icon: FileText,
      articles: [
        {
          id: "a1",
          title: "如何创建一个新活动？",
          content:
            "点击底部导航栏的「创建」按钮，填写活动基本信息、时间地点、报名设置等，完成后点击「发布活动」即可。",
          category: "activity",
        },
        {
          id: "a2",
          title: "如何编辑已发布的活动？",
          content:
            "进入活动详情页面，点击右上角「编辑」按钮，修改相关信息后保存即可。注意：已开始的活动部分信息不可修改。",
          category: "activity",
        },
        {
          id: "a3",
          title: "如何取消活动？",
          content:
            "进入活动管理页面，点击「更多操作」，选择「取消活动」。取消后将自动通知已报名的参与者。",
          category: "activity",
        },
        {
          id: "a4",
          title: "活动封面图有什么要求？",
          content:
            "建议使用 16:9 比例的图片，尺寸不小于 750x422 像素，文件大小不超过 5MB，支持 JPG、PNG 格式。",
          category: "activity",
        },
      ],
    },
    {
      id: "enrollment",
      title: "报名管理",
      icon: FileText,
      articles: [
        {
          id: "e1",
          title: "如何导入报名信息？",
          content:
            "进入活动的「报名管理」页面，点击「导入数据」，下载模板并按格式填写，然后上传 Excel 文件即可批量导入。",
          category: "enrollment",
        },
        {
          id: "e2",
          title: "如何导出报名名单？",
          content:
            "在报名管理页面，点击「导出」按钮，选择需要导出的字段，系统将生成 Excel 文件供下载。",
          category: "enrollment",
        },
        {
          id: "e3",
          title: "如何审核报名？",
          content:
            "在报名列表中，点击单个报名条目查看详情，然后选择「通过」或「拒绝」。也可以批量选择后进行批量操作。",
          category: "enrollment",
        },
      ],
    },
    {
      id: "matching",
      title: "智能匹配",
      icon: HelpCircle,
      articles: [
        {
          id: "m1",
          title: "什么是智能匹配？",
          content:
            "智能匹配是基于参与者信息，通过算法自动进行分组的功能。系统会根据您设置的匹配规则（如性别均衡、行业互补等）进行最优分组。",
          category: "matching",
        },
        {
          id: "m2",
          title: "如何设置匹配规则？",
          content:
            "进入活动的「匹配配置」页面，在「规则设置」tab 中，可以添加和调整匹配规则，设置各规则的权重。",
          category: "matching",
        },
        {
          id: "m3",
          title: "匹配结果不满意怎么办？",
          content:
            "您可以在「分组结果」页面手动调整分组，将参与者拖动到其他组，或者重新执行匹配算法。",
          category: "matching",
        },
      ],
    },
    {
      id: "account",
      title: "账户设置",
      icon: FileText,
      articles: [
        {
          id: "ac1",
          title: "如何修改个人信息？",
          content:
            "进入「我的」页面，点击头像旁的编辑按钮，可以修改头像、昵称、公司等信息。",
          category: "account",
        },
        {
          id: "ac2",
          title: "如何修改登录密码？",
          content:
            "进入「账户设置」>「账户安全」，点击「修改密码」，输入原密码和新密码即可。",
          category: "account",
        },
      ],
    },
  ],
  faqs: [
    {
      id: "faq1",
      question: "活动发布后还能修改吗？",
      answer:
        "可以修改。但如果活动已开始报名，部分关键信息（如活动时间、地点、人数上限）修改后会通知已报名的参与者。",
    },
    {
      id: "faq2",
      question: "报名人数超过上限怎么办？",
      answer:
        "如果开启了候补功能，超出的报名将自动进入候补名单。当有人取消报名时，候补者会按顺序自动递补。",
    },
    {
      id: "faq3",
      question: "如何通知参与者？",
      answer:
        "您可以在报名管理页面选择参与者，点击「发送通知」，支持发送活动提醒、通知公告等消息。",
    },
    {
      id: "faq4",
      question: "匹配算法的准确率如何？",
      answer:
        "我们的智能匹配算法基于多维度特征分析，匹配准确率达到 85% 以上。您也可以根据实际需求手动微调结果。",
    },
    {
      id: "faq5",
      question: "数据安全如何保障？",
      answer:
        "我们采用银行级加密技术保护数据传输，所有用户信息均加密存储。严格遵守相关法律法规，未经授权绝不对外泄露。",
    },
  ],
  contactInfo: {
    phone: "400-123-4567",
    email: "support@huodongjia.com",
    workTime: "工作日 9:00 - 18:00",
  },
};

const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [helpData, setHelpData] = useState(defaultHelpData);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null,
  );

  // 尝试从后端获取帮助数据
  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        // TODO: 替换为真实 API
        // const response = await api.get('/api/help');
        // if (response.data) {
        //   setHelpData(response.data);
        // }

        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 使用兜底数据
        setHelpData(defaultHelpData);
      } catch (error) {
        console.error("获取帮助数据失败，使用兜底数据:", error);
        // 失败时使用兜底数据
        setHelpData(defaultHelpData);
      }
    };

    fetchHelpData();
  }, []);

  // 搜索文章
  const filteredCategories = helpData.categories
    .map((category) => ({
      ...category,
      articles: category.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          article.content.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    }))
    .filter((category) => category.articles.length > 0);

  // 搜索FAQ
  const filteredFaqs = helpData.faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchValue.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchValue.toLowerCase()),
  );

  // 渲染文章详情
  if (selectedArticle) {
    return (
      <MerchantLayout
        title={selectedArticle.title}
        showBack
        onBack={() => setSelectedArticle(null)}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {selectedArticle.title}
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {selectedArticle.content}
          </div>
        </div>

        {/* 反馈区域 */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            这篇文章有帮助吗？
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => Toast.show({ content: "感谢您的反馈" })}
              className="flex-1 py-2 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              👍 有帮助
            </button>
            <button
              onClick={() => Toast.show({ content: "我们会继续改进" })}
              className="flex-1 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              👎 没帮助
            </button>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout
      title="帮助中心"
      showBack
      onBack={() => navigate("/dashboard/profile")}
    >
      <div className="space-y-4 pb-6">
        {/* 搜索框 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <SearchBar
            placeholder="搜索问题或关键词"
            value={searchValue}
            onChange={setSearchValue}
            style={{
              "--background": "var(--adm-color-fill-content)",
              "--border-radius": "8px",
            }}
          />
        </div>

        {/* 分类列表 */}
        {(searchValue ? filteredCategories : helpData.categories).map(
          (category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : category.id)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <Icon
                        size={20}
                        className="text-primary-500 dark:text-primary-400"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {category.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.articles.length} 篇文章
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown
                      size={20}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  ) : (
                    <ChevronRight
                      size={20}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    {category.articles.map((article, index) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          index !== category.articles.length - 1
                            ? "border-b border-gray-100 dark:border-gray-700"
                            : ""
                        }`}
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 text-left">
                          {article.title}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-gray-300 dark:text-gray-600 flex-shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          },
        )}

        {/* 常见问题 */}
        {(!searchValue || filteredFaqs.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                常见问题
              </h3>
            </div>
            <Collapse accordion>
              {(searchValue ? filteredFaqs : helpData.faqs).map((faq) => (
                <Collapse.Panel key={faq.id} title={faq.question}>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>
        )}

        {/* 联系我们 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              联系我们
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <a
              href={`tel:${helpData.contactInfo.phone}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <Phone
                  size={18}
                  className="text-primary-500 dark:text-primary-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  客服热线
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {helpData.contactInfo.phone}
                </p>
              </div>
            </a>

            <a
              href={`mailto:${helpData.contactInfo.email}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-50 dark:bg-secondary-900/30 flex items-center justify-center">
                <Mail
                  size={18}
                  className="text-secondary-500 dark:text-secondary-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  邮箱支持
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {helpData.contactInfo.email}
                </p>
              </div>
            </a>

            <button
              onClick={() => Toast.show({ content: "在线客服功能开发中" })}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
                <MessageCircle
                  size={18}
                  className="text-accent-500 dark:text-accent-400"
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  在线客服
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {helpData.contactInfo.workTime}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 搜索无结果 */}
        {searchValue &&
          filteredCategories.length === 0 &&
          filteredFaqs.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
              <HelpCircle
                size={48}
                className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
              />
              <p className="text-gray-500 dark:text-gray-400">未找到相关内容</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                请尝试其他关键词或联系客服
              </p>
            </div>
          )}
      </div>
    </MerchantLayout>
  );
};

export default HelpCenterPage;
