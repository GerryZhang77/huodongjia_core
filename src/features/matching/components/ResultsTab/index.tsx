/**
 * 匹配结果 Tab（per-user top5 视图）
 *
 * 后端每个参与者对应一条 best_matches 记录：{ user_id, best_match_users[5] }
 * 这里按参与者维度展示：左侧为本人信息，右侧并排显示其 top5 候选，支持展开查看详细排序
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  Info,
  History,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui";
import { UserHoverCard } from "@/components/business/UserHoverCard";
import type { UserBrief } from "@/components/business/UserHoverCard";
import {
  PublishResultDialog,
  PublishResultFeedback,
  type NotificationConfig,
  type ParticipantPreview,
  type MatchGroupStats,
} from "../PublishResultDialog";
import { MatchingHistoryPanel } from "../MatchingHistoryPanel";
import { RestoreHistoryDialog } from "../RestoreHistoryDialog";
import { HistoryDetailDialog } from "../HistoryDetailDialog";
import type {
  MatchingRule,
  MatchingHistory,
  ParticipantMatchResult,
} from "../../types";

type MatchRule = MatchingRule;

/** 参与者信息（来自 /api/enrollments/:eventId 映射后的结构） */
interface Participant {
  id: string;
  enrollmentId?: string;
  name: string;
  avatar?: string;
  gender?: string;
  age?: number;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  bio?: string;
  interests?: string;
  department?: string;
  skills?: string;
  expertise?: string;
  tags?: string[];
  phone?: string;
  email?: string;
  status?: string;
}

interface ResultsTabProps {
  /** per-user top5 记录 */
  matchResults: ParticipantMatchResult[];
  /** 参与者完整列表（用于渲染本人和 top5 候选的详细信息） */
  participants: Participant[];
  rules: MatchRule[];
  isPublishing: boolean;
  onPublish: (
    sendNotification?: boolean,
    notificationConfig?: NotificationConfig,
  ) => Promise<void | { success: boolean; error?: string }>;
  /** 切回规则 Tab 进行重新匹配 */
  onRematch: () => void | Promise<void>;
  isRematching: boolean;
  matchingStats?: {
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
  history?: MatchingHistory[];
  currentHistoryId?: string | null;
  onViewHistory?: (history: MatchingHistory) => void;
  onRestoreHistory?: (history: MatchingHistory) => void;
}

/** 把 Participant 映射成 UserHoverCard 需要的 UserBrief */
const toUserBrief = (p: Participant | undefined): UserBrief => ({
  id: p?.id || "",
  name: p?.name || "未知用户",
  avatar: p?.avatar,
  role: p?.occupation,
  occupation: p?.occupation,
  city: p?.city,
  tags: p?.tags,
  gender:
    p?.gender === "男" || p?.gender === "male"
      ? "male"
      : p?.gender === "女" || p?.gender === "female"
        ? "female"
        : p?.gender
          ? "other"
          : undefined,
  age: p?.age,
  company: p?.company,
  industry: p?.industry,
  bio: p?.bio,
});

/** 头像色块（无头像时的回退） */
const Avatar: React.FC<{ participant?: Participant; size?: "sm" | "md" | "lg" }> = ({
  participant,
  size = "md",
}) => {
  const sizeCls =
    size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-10 h-10 text-sm";
  const bg =
    participant?.gender === "male" || participant?.gender === "男"
      ? "bg-blue-100 text-blue-600"
      : participant?.gender === "female" || participant?.gender === "女"
        ? "bg-pink-100 text-pink-600"
        : "bg-gray-100 text-gray-600";

  if (participant?.avatar) {
    return (
      <img
        src={participant.avatar}
        alt={participant.name}
        className={`${sizeCls} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeCls} ${bg} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
      title={participant?.name}
    >
      {participant?.name?.charAt(0) || "?"}
    </div>
  );
};

/** 单个参与者行：左侧本人信息 + 右侧 top5 头像 */
interface ResultRowProps {
  record: ParticipantMatchResult;
  owner?: Participant;
  topCandidates: Participant[];
  expanded: boolean;
  onToggle: () => void;
  onViewProfile: (userId: string) => void;
}

const ResultRow: React.FC<ResultRowProps> = ({
  record,
  owner,
  topCandidates,
  expanded,
  onToggle,
  onViewProfile,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-primary-200 transition-colors">
      <div
        className="flex items-center gap-3 p-3 md:p-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* 左：本人 */}
        <UserHoverCard user={toUserBrief(owner)} onViewProfile={onViewProfile}>
          <Avatar participant={owner} size="lg" />
        </UserHoverCard>
        <div className="min-w-0 flex-shrink-0 w-28 md:w-40">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {owner?.name || record.userId.slice(0, 6)}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {owner?.occupation || owner?.industry || "参与者"}
          </p>
        </div>

        {/* 中：top5 头像 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            {record.bestMatchUserIds.slice(0, 5).map((uid, idx) => {
              const candidate = topCandidates[idx];
              return (
                <div
                  key={uid}
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <UserHoverCard
                    user={toUserBrief(candidate)}
                    matchScore={undefined}
                    onViewProfile={onViewProfile}
                  >
                    <div className="relative">
                      <Avatar participant={candidate} size="md" />
                      <span
                        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          idx === 0
                            ? "bg-yellow-400 text-yellow-900"
                            : idx === 1
                              ? "bg-gray-300 text-gray-700"
                              : idx === 2
                                ? "bg-orange-300 text-orange-900"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </div>
                  </UserHoverCard>
                </div>
              );
            })}
            {record.bestMatchUserIds.length === 0 && (
              <span className="text-xs text-gray-400">暂无匹配候选</span>
            )}
          </div>
        </div>

        {/* 右：展开/收起 */}
        <div className="text-gray-400 flex-shrink-0">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* 展开：top5 详细排名 */}
      {expanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-gray-100 pt-3 space-y-2 bg-gray-50/30">
          {record.bestMatchUserIds.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              该参与者暂无匹配候选
            </p>
          ) : (
            record.bestMatchUserIds.map((uid, idx) => {
              const candidate = topCandidates[idx];
              return (
                <div
                  key={uid}
                  className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100"
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                      idx === 0
                        ? "bg-yellow-400 text-yellow-900"
                        : idx === 1
                          ? "bg-gray-300 text-gray-700"
                          : idx === 2
                            ? "bg-orange-300 text-orange-900"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <UserHoverCard
                    user={toUserBrief(candidate)}
                    onViewProfile={onViewProfile}
                  >
                    <Avatar participant={candidate} size="sm" />
                  </UserHoverCard>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {candidate?.name || uid.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {candidate?.occupation || candidate?.industry || candidate?.company || "—"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProfile(uid);
                    }}
                    className="text-xs text-primary-500 hover:text-primary-600 font-medium px-2 py-1 rounded hover:bg-primary-50"
                  >
                    查看详情
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const ResultsTab: React.FC<ResultsTabProps> = ({
  matchResults,
  participants,
  rules,
  isPublishing,
  onPublish,
  onRematch,
  isRematching,
  matchingStats,
  history = [],
  currentHistoryId = null,
  onViewHistory,
  onRestoreHistory,
}) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showHistoryDetailDialog, setShowHistoryDetailDialog] = useState(false);
  const [pendingRestoreHistory, setPendingRestoreHistory] =
    useState<MatchingHistory | null>(null);
  const [viewingHistory, setViewingHistory] = useState<MatchingHistory | null>(null);
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    success: boolean;
    error?: string;
  } | null>(null);

  // 参与者 ID → Participant 查找表
  const participantMap = useMemo(() => {
    const m = new Map<string, Participant>();
    for (const p of participants) m.set(p.id, p);
    return m;
  }, [participants]);

  // 过滤后的结果
  const filteredResults = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return matchResults;
    return matchResults.filter((r) => {
      const p = participantMap.get(r.userId);
      if (!p) return false;
      return (
        p.name.toLowerCase().includes(kw) ||
        (p.occupation || "").toLowerCase().includes(kw) ||
        (p.industry || "").toLowerCase().includes(kw) ||
        (p.company || "").toLowerCase().includes(kw)
      );
    });
  }, [matchResults, participantMap, searchKeyword]);

  // 跳转到用户主页：同标签跳，保证返回按钮可用
  const handleViewProfile = (userId: string) => {
    if (!userId) return;
    const fallbackName = participantMap.get(userId)?.name;
    const qs = new URLSearchParams();
    if (fallbackName) qs.set("fallbackName", fallbackName);
    navigate(`/u/profile/${userId}${qs.toString() ? `?${qs}` : ""}`);
  };

  // 发布
  const handlePublishClick = async (
    sendNotification?: boolean,
    notificationConfig?: NotificationConfig,
  ) => {
    const result = await onPublish(sendNotification, notificationConfig);
    if (result && typeof result === "object" && "success" in result) {
      setShowPublishDialog(false);
      setFeedback({
        visible: true,
        success: result.success,
        error: result.error,
      });
    } else {
      setShowPublishDialog(false);
      setFeedback({ visible: true, success: true });
    }
  };

  const participantPreviews: ParticipantPreview[] = useMemo(
    () =>
      matchResults.map((r) => {
        const p = participantMap.get(r.userId);
        return {
          id: r.userId,
          name: p?.name || r.userId.slice(0, 6),
          groupName: p?.name || "",
          phone: p?.phone,
          email: p?.email,
        } as ParticipantPreview;
      }),
    [matchResults, participantMap],
  );

  // 发布对话框需要 MatchGroupStats 结构，这里按"每个参与者一条记录"的形式合成
  const publishGroupStats: MatchGroupStats[] = useMemo(
    () =>
      matchResults.map((r) => ({
        id: r.id,
        name: participantMap.get(r.userId)?.name,
        members: [r.userId, ...r.bestMatchUserIds],
        score: 0,
        isLocked: false,
      })),
    [matchResults, participantMap],
  );

  // 空状态
  if (matchResults.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gray-50 flex items-center justify-center">
          <Info size={24} className="text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">暂无匹配结果</h3>
        <p className="text-sm text-gray-500 mb-4">
          请先在"规则设置"中配置规则并执行匹配
        </p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* 顶部统计 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 text-center">
          <Users size={18} className="mx-auto mb-1 text-primary-500" />
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {matchResults.length}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
            已匹配参与者
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 text-center">
          <BarChart3 size={18} className="mx-auto mb-1 text-accent-500" />
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {rules.filter((r) => r.enabled).length}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">启用规则</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 text-center">
          <History size={18} className="mx-auto mb-1 text-secondary-500" />
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {history.length}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">历史记录</p>
        </div>
      </div>

      {/* 只读浏览历史记录提示 */}
      {currentHistoryId && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <Info size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 flex-1">
            当前浏览的是历史记录，若需启用请点击"恢复此记录"
          </p>
        </div>
      )}

      {/* 搜索 + 历史按钮 */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索参与者姓名/职业/行业"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
          />
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistoryPanel(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <History size={16} />
            历史
          </button>
        )}
      </div>

      {/* 参与者列表 */}
      <div className="space-y-2">
        {filteredResults.map((r) => {
          const owner = participantMap.get(r.userId);
          const topCandidates = r.bestMatchUserIds.map(
            (uid) => participantMap.get(uid) as Participant | undefined,
          ).filter(Boolean) as Participant[];
          return (
            <ResultRow
              key={r.id}
              record={r}
              owner={owner}
              topCandidates={topCandidates}
              expanded={expandedId === r.id}
              onToggle={() =>
                setExpandedId(expandedId === r.id ? null : r.id)
              }
              onViewProfile={handleViewProfile}
            />
          );
        })}
        {filteredResults.length === 0 && (
          <div className="py-10 text-center text-gray-500 text-sm">
            未找到匹配的参与者
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      {!currentHistoryId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex gap-3">
            <Button
              variant="outline"
              size="large"
              onClick={() => onRematch()}
              disabled={isRematching}
              className="flex-1"
            >
              <span className="flex items-center gap-2">
                {isRematching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                重新匹配
              </span>
            </Button>
            <Button
              size="large"
              onClick={() => setShowPublishDialog(true)}
              disabled={isPublishing || matchResults.length === 0}
              className="flex-1"
            >
              {isPublishing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  发布中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={18} />
                  发布结果
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 历史面板（内嵌，非模态） */}
      {showHistoryPanel && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowHistoryPanel(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold">历史匹配记录</h3>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                关闭
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <MatchingHistoryPanel
                history={history}
                currentHistoryId={currentHistoryId ?? undefined}
                onViewHistory={(h) => {
                  setViewingHistory(h);
                  setShowHistoryDetailDialog(true);
                }}
                onRestoreHistory={(h) => {
                  setPendingRestoreHistory(h);
                  setShowRestoreDialog(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 历史详情 */}
      {showHistoryDetailDialog && viewingHistory && (
        <HistoryDetailDialog
          historyItem={viewingHistory}
          visible={showHistoryDetailDialog}
          participants={participants.map((p) => ({
            id: p.id,
            name: p.name,
            gender:
              p.gender === "男" || p.gender === "male"
                ? "male"
                : p.gender === "女" || p.gender === "female"
                  ? "female"
                  : undefined,
            industry: p.industry,
            occupation: p.occupation,
          }))}
          onClose={() => setShowHistoryDetailDialog(false)}
          onRestore={(h) => {
            setPendingRestoreHistory(h);
            setShowHistoryDetailDialog(false);
            setShowRestoreDialog(true);
          }}
        />
      )}

      {/* 恢复确认 */}
      {showRestoreDialog && pendingRestoreHistory && (
        <RestoreHistoryDialog
          visible={showRestoreDialog}
          historyItem={pendingRestoreHistory}
          onConfirm={() => {
            onRestoreHistory?.(pendingRestoreHistory);
            onViewHistory?.(pendingRestoreHistory);
            setShowRestoreDialog(false);
            setPendingRestoreHistory(null);
          }}
          onCancel={() => {
            setShowRestoreDialog(false);
            setPendingRestoreHistory(null);
          }}
        />
      )}

      {/* 发布对话框 */}
      <PublishResultDialog
        visible={showPublishDialog}
        groups={publishGroupStats}
        participantCount={matchResults.length}
        participants={participantPreviews}
        matchingStats={matchingStats}
        onConfirm={handlePublishClick}
        onCancel={() => setShowPublishDialog(false)}
        isLoading={isPublishing}
      />

      {/* 发布反馈 */}
      {feedback && (
        <PublishResultFeedback
          visible={feedback.visible}
          success={feedback.success}
          errorMessage={feedback.error}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
};

export default ResultsTab;
