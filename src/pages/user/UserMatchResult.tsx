/**
 * 用户端匹配结果页面
 * 路由: /u/activities/:id/match-result
 *
 * 展示当前用户的 top5 最佳匹配列表。
 * 说明：后端不再区分"分组"与"最佳匹配"—— 每个用户的"小组"就是其 top5 匹配。
 */

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Toast } from "antd-mobile";
import {
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smartphone,
  Trophy,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui";
import { NFCTouchModal } from "@/components/business/NFCTouchModal";
import { useActivityDetail } from "@/features/user";
import { useBestMatches } from "@/features/user/hooks/useBestMatches";
import {
  getBestMatchDetail,
  getExistingMatchMessage,
  getMatchMessage,
  type MatchScoreFieldDetail,
} from "@/features/user/services/matchApi";
import { generateDefaultAvatar } from "@/utils/avatar";
import { cn } from "@/utils/cn";
import dayjs from "dayjs";

interface TopMatchUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  gender?: "male" | "female" | "other";
  age?: number;
  bio?: string;
  tags?: string[];
  matchScore: number;
  rank: number;
  commonTags: string[];
  scoreHighlights: MatchScoreFieldDetail[];
}

const scoreToneClasses = [
  "bg-amber-100 text-amber-700 border border-amber-200",
  "bg-slate-100 text-slate-700 border border-slate-200",
  "bg-orange-100 text-orange-700 border border-orange-200",
  "bg-gray-100 text-gray-600 border border-gray-200",
];

const formatFieldValue = (value?: string): string => {
  if (!value) return "未填写";
  return value;
};

const normalizeDisplayValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const joined = value.map((item) => String(item ?? "").trim()).filter(Boolean).join("、");
    return joined || undefined;
  }
  if (value === null || value === undefined) {
    return undefined;
  }
  const text = typeof value === "string" ? value.trim() : String(value).trim();
  return text || undefined;
};

const resolveScoreFieldValue = (
  explicitValue: string | undefined,
  fieldKey: string,
  fallbackLabel: string | undefined,
  formData?: Record<string, unknown>,
  schema?: Array<{ key: string; label: string; type?: string }>,
): string | undefined => {
  if (explicitValue && explicitValue.trim()) {
    return explicitValue.trim();
  }

  const schemaLabel =
    schema?.find((field) => field.key === fieldKey)?.label?.trim() || fallbackLabel?.trim();
  const candidates = [fieldKey, schemaLabel].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const value = normalizeDisplayValue(formData?.[candidate]);
    if (value) {
      return value;
    }
  }

  return undefined;
};

const MatchUniverseCard: FC<{
  activityId: string;
  user: TopMatchUser;
  index: number;
  expanded: boolean;
  generatedMessage?: string;
  generatingUserId: string | null;
  onToggle: (userId: string) => void;
  onGenerateMessage: (userId: string) => Promise<void>;
  onViewDetail: (userId: string) => void;
}> = ({
  activityId,
  user,
  index,
  expanded,
  generatedMessage,
  generatingUserId,
  onToggle,
  onGenerateMessage,
  onViewDetail,
}) => {
  const detailQuery = useQuery({
    queryKey: ["user", "match-detail", activityId, user.id],
    queryFn: () => getBestMatchDetail(activityId, user.id),
    enabled: Boolean(activityId && user.id),
    staleTime: 10 * 60 * 1000,
  });

  const detailFields =
    detailQuery.data?.data?.score.fields && detailQuery.data.data.score.fields.length > 0
      ? detailQuery.data.data.score.fields
      : user.scoreHighlights;
  const schema = detailQuery.data?.data?.schema || [];
  const currentUserFormData = detailQuery.data?.data?.currentUserEnrollment.form_data;
  const targetUserFormData = detailQuery.data?.data?.targetUserEnrollment.form_data;
  const scoreHighlights = [...detailFields]
    .sort((a, b) => (b.score_percent ?? 0) - (a.score_percent ?? 0))
    .slice(0, 3);
  const existingMessageQuery = useQuery({
    queryKey: ["user", "match-message", "existing", activityId, user.id],
    queryFn: () => getExistingMatchMessage(activityId, user.id),
    enabled: Boolean(activityId && user.id),
    staleTime: 30 * 60 * 1000,
  });
  const existingMessage =
    typeof existingMessageQuery.data?.data === "string"
      ? existingMessageQuery.data.data.trim()
      : "";
  const matchMessage = generatedMessage || existingMessage;
  const isGeneratingCurrent = generatingUserId === user.id;
  const isGeneratingOther = Boolean(generatingUserId && generatingUserId !== user.id);

  const badgeLabels = [
    "高度匹配",
    ...scoreHighlights
      .map((field) => field.source_label || field.target_label || field.source_field)
      .filter(Boolean)
      .slice(0, 2),
    user.industry || user.role,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "rounded-[24px] border bg-white p-5 shadow-sm transition-all",
        expanded ? "border-accent-200 shadow-md" : "border-gray-100 hover:-translate-y-1 hover:shadow-md",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                scoreToneClasses[index] || scoreToneClasses[3],
              )}
            >
              {user.rank}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[18px] font-semibold text-gray-900">
                {user.name}
              </div>
              <div className="mt-1 truncate text-sm text-gray-500">
                {[user.company, user.industry, user.city].filter(Boolean).join(" · ") || user.role}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700">
          契合度 {user.matchScore}%
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Sparkles size={15} className="text-accent-500" />
            匹配寄语
          </div>
          {!matchMessage ? (
            <Button
              variant="secondary"
              className="h-8 px-3 text-sm"
              loading={isGeneratingCurrent}
              disabled={isGeneratingOther}
              onClick={() => onGenerateMessage(user.id)}
            >
              生成寄语
            </Button>
          ) : null}
        </div>

        <div className="text-sm leading-6 text-gray-600">
          {matchMessage ? (
            matchMessage
          ) : existingMessageQuery.isLoading ? (
            <span className="text-gray-400">正在加载寄语...</span>
          ) : isGeneratingOther ? (
            <span className="text-gray-400">正在生成其他匹配对象的寄语，请稍候再试。</span>
          ) : (
            <span className="text-gray-400">点击右侧按钮生成这位对象的匹配寄语。</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {badgeLabels.slice(0, 4).map((label, badgeIndex) => (
          <span
            key={`${user.id}-${label}-${badgeIndex}`}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs",
              badgeIndex === 0
                ? "bg-gray-100 text-gray-700"
                : "border border-accent-100 bg-accent-50 text-accent-600",
            )}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => onToggle(user.id)}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {expanded ? "收起细节" : "查看匹配细节"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button
          onClick={() => onViewDetail(user.id)}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent-500 hover:text-accent-600"
        >
          进入详情
          <ChevronRight size={16} />
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid gap-3">
            {scoreHighlights.length > 0 ? (
              scoreHighlights.map((field) => (
                <div
                  key={`${field.rule_index}-${field.source_field}-${field.target_field}-detail`}
                  className="rounded-2xl border border-gray-100 bg-white p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">
                      {field.source_label || field.target_label || field.source_field}
                    </p>
                    <span className="rounded-full bg-accent-50 px-2 py-1 text-xs font-medium text-accent-600">
                      {field.score_percent ?? Math.round(field.score * 100)}分
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-gray-500">
                    你的填写：{formatFieldValue(
                      resolveScoreFieldValue(
                        field.current_user_value,
                        field.source_field,
                        field.source_label,
                        currentUserFormData,
                        schema,
                      ),
                    )}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    对方填写：{formatFieldValue(
                      resolveScoreFieldValue(
                        field.target_user_value,
                        field.target_field,
                        field.target_label,
                        targetUserFormData,
                        schema,
                      ),
                    )}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
                暂无可展示的匹配规则字段。
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
};

const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format("M月D日");
};

const normalizeGender = (g?: string): "male" | "female" | "other" | undefined => {
  if (!g) return undefined;
  if (g === "male" || g === "男") return "male";
  if (g === "female" || g === "女") return "female";
  return "other";
};

const UserMatchResult: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showNFCModal, setShowNFCModal] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [generatedMessages, setGeneratedMessages] = useState<Record<string, string>>({});
  const [generatingUserId, setGeneratingUserId] = useState<string | null>(null);

  const { data: activityData, isLoading } = useActivityDetail(id);

  const {
    data: bestMatchesData,
    loading: matchLoading,
    error: matchError,
  } = useBestMatches(id);

  const activity = useMemo(() => activityData?.data, [activityData]);

  const topMatches: TopMatchUser[] = useMemo(() => {
    if (!bestMatchesData || bestMatchesData.length === 0) return [];
    return bestMatchesData.map((user) => {
      const userRecord = user as typeof user & { bio?: string };
      const scoreHighlights = [...(user.scoreDetail?.fields || [])]
        .sort((a, b) => (b.score_percent ?? 0) - (a.score_percent ?? 0))
        .slice(0, 3);

      return {
        id: user.user_id,
        name: user.name,
        avatar: user.avatar || generateDefaultAvatar(user.user_id),
        role: user.occupation || "参与者",
        occupation: user.occupation,
        company: user.company,
        industry: user.industry,
        city: user.city,
        gender: normalizeGender(user.gender),
        age: user.age,
        bio: userRecord.bio,
        tags: user.tags || [],
        matchScore: user.matchScore,
        rank: user.rank,
        commonTags: [],
        scoreHighlights,
      };
    });
  }, [bestMatchesData]);

  useEffect(() => {
    if (!id || topMatches.length === 0) {
      return;
    }

    topMatches.slice(0, 5).forEach((user) => {
      queryClient.prefetchQuery({
        queryKey: ["user", "match-detail", id, user.id],
        queryFn: () => getBestMatchDetail(id, user.id),
        staleTime: 10 * 60 * 1000,
      });
    });
  }, [id, queryClient, topMatches]);

  const supportsNFC = Boolean(
    (activity as { enableNfc?: boolean } | undefined)?.enableNfc,
  );

  const handleNavigateToDetail = (userId: string) => {
    if (!userId) return;
    navigate(`/u/activities/${id}/match-result/${userId}`);
  };

  const toggleExpandedCard = (userId: string) => {
    setExpandedUserId((current) => (current === userId ? null : userId));
  };

  const generateMessageMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!id) {
        throw new Error("缺少活动信息");
      }
      return {
        userId,
        response: await getMatchMessage(id, userId),
      };
    },
    onMutate: async (userId) => {
      setGeneratingUserId(userId);
    },
    onSuccess: ({ userId, response }) => {
      const message =
        typeof response.data === "string" ? response.data.trim() : "";
      if (message) {
        setGeneratedMessages((current) => ({
          ...current,
          [userId]: message,
        }));
      }
      Toast.show({
        icon: "success",
        content: message ? "匹配寄语已生成" : "匹配寄语已刷新",
      });
    },
    onError: (err) => {
      const errorMessage =
        err instanceof Error ? err.message : "生成匹配寄语失败";
      Toast.show({ icon: "fail", content: errorMessage });
    },
    onSettled: () => {
      setGeneratingUserId(null);
    },
  });

  const handleGenerateMessage = async (userId: string) => {
    if (generatingUserId) {
      return;
    }
    await generateMessageMutation.mutateAsync(userId);
  };

  // 加载中
  if (isLoading || matchLoading) {
    return (
      <UserLayout showTabBar={true} showTopBar={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </UserLayout>
    );
  }

  // 活动不存在
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
        { label: "匹配结果" },
      ]}
      bgColor="bg-gray-50"
    >
      <div className="min-h-screen pb-36">
        {/* 头部 */}
        <header className="bg-gradient-to-br from-accent-400 to-accent-500 pt-6 pb-6 px-4 md:px-6">
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">匹配结果</h1>
            <p className="text-sm text-white/80 mt-1">
              {activity.title}
              {activity.eventStartTime && ` · ${formatDate(activity.eventStartTime)}`}
            </p>
          </div>
        </header>

        {/* 主内容 */}
        <div className="px-4 md:px-6 py-4">
          {matchError ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <AlertCircle size={36} className="mx-auto mb-3 text-orange-400" />
              <p className="text-sm text-gray-600 mb-2">{matchError}</p>
              <p className="text-xs text-gray-400">
                若活动方尚未完成匹配，请稍后再试
              </p>
            </div>
          ) : topMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-accent-50 flex items-center justify-center">
                <Trophy size={24} className="text-accent-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                匹配结果暂未出炉
              </h3>
              <p className="text-sm text-gray-500">
                活动方正在为您寻找最合适的伙伴，请稍候
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-[28px] border border-gray-100 bg-white px-6 py-6 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                  你的匹配结果已生成
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  太棒了！系统基于你的报名信息，在本次活动中找到了
                  <span className="mx-1 font-semibold text-accent-500">
                    {Math.min(topMatches.length, 3)}
                  </span>
                  位与你契合度较高的对象，推荐优先认识。
                </p>
              </section>

              <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <Sparkles size={18} className="text-accent-500" />
                我的匹配小宇宙
              </div>

              <section className="rounded-2xl border border-dashed border-accent-200 bg-accent-50 px-5 py-4 text-sm leading-6 text-gray-600">
                <span className="font-medium text-accent-600">系统匹配通告：</span>
                根据报名表关键词分析，你与当前推荐对象在核心规则上呈现出较高契合，
                适合优先组队、聊天或现场破冰。
              </section>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {topMatches.slice(0, 3).map((user, index) => (
                  <MatchUniverseCard
                    key={user.id}
                    activityId={id!}
                    user={user}
                    index={index}
                    expanded={expandedUserId === user.id}
                    generatedMessage={generatedMessages[user.id]}
                    generatingUserId={generatingUserId}
                    onToggle={toggleExpandedCard}
                    onGenerateMessage={handleGenerateMessage}
                    onViewDetail={handleNavigateToDetail}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="fixed bottom-mobile-tabbar left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 z-30">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => navigate(`/u/activities/${id}`)}
              className="flex-1 h-12 rounded-[22px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              查看活动详情
            </button>
            {supportsNFC && (
              <button
                onClick={() => setShowNFCModal(true)}
                className="h-12 px-4 rounded-[22px] bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold text-sm shadow-lg shadow-primary-400/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Smartphone size={18} />
                NFC 碰一碰
              </button>
            )}
          </div>
        </div>

        {/* NFC 弹窗 */}
        <NFCTouchModal
          open={showNFCModal}
          onClose={() => setShowNFCModal(false)}
          activityId={id}
        />
      </div>
    </UserLayout>
  );
};

export default UserMatchResult;
