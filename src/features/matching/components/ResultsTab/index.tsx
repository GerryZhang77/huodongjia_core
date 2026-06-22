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
  Loader2,
  BarChart3,
  Info,
  History,
  Search,
  AlertCircle,
  Sparkles,
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
  registrationTypeId?: string | null;
  registrationTypeName?: string;
  avatar?: string;
  gender?: string;
  age?: number;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  bio?: string;
  interests?: string | string[];
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

const getParticipantTags = (participant?: Participant): string[] => {
  if (!participant?.tags) return [];
  return participant.tags
    .map((tag) => String(tag).trim())
    .filter(Boolean);
};

const getParticipantMeta = (participant?: Participant): string => {
  if (!participant) return "";

  const tagText = getParticipantTags(participant).slice(0, 3).join("、");
  if (tagText) return tagText;

  return [
    participant.occupation,
    participant.industry,
    participant.company,
    participant.city,
    participant.registrationTypeName,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
};

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

const HIGH_MATCH_THRESHOLD = 60;
const LOW_MATCH_THRESHOLD = 40;
const PAGE_SIZE = 10;

type MatchPairRow = {
  id: string;
  ownerId: string;
  owner?: Participant;
  candidateId?: string;
  candidate?: Participant;
  scorePercent: number | null;
};

const toScorePercent = (
  score?: {
    total_score?: number;
    total_score_percent?: number;
  } | null,
): number | null => {
  if (!score) return null;

  const percent = Number(score.total_score_percent);
  if (Number.isFinite(percent)) {
    return Math.max(0, Math.min(100, percent));
  }

  const totalScore = Number(score.total_score);
  if (!Number.isFinite(totalScore)) {
    return null;
  }

  const normalized = totalScore <= 1 ? totalScore * 100 : totalScore;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

const ResultsTab: React.FC<ResultsTabProps> = ({
  matchResults,
  participants,
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  const allPairRows = useMemo<MatchPairRow[]>(
    () =>
      filteredResults.flatMap((record) => {
        const owner = participantMap.get(record.userId);
        if (record.bestMatchUserIds.length === 0) {
          return [
            {
              id: `${record.id}-empty`,
              ownerId: record.userId,
              owner,
              candidateId: undefined,
              candidate: undefined,
              scorePercent: null,
            },
          ];
        }

        return record.bestMatchUserIds.map((candidateId, index) => {
          const candidate = candidateId
            ? participantMap.get(candidateId)
            : undefined;
          const scorePercent = toScorePercent(record.scores?.[index] || null);

          return {
            id: `${record.id}-${candidateId || index}`,
            ownerId: record.userId,
            owner,
            candidateId,
            candidate,
            scorePercent,
          };
        });
      }),
    [filteredResults, participantMap],
  );

  const sortedPairRows = useMemo(
    () =>
      [...allPairRows].sort((a, b) => {
        const aScore = a.scorePercent ?? -1;
        const bScore = b.scorePercent ?? -1;
        if (bScore !== aScore) {
          return bScore - aScore;
        }
        return (a.owner?.name || a.ownerId).localeCompare(
          b.owner?.name || b.ownerId,
          "zh-CN",
        );
      }),
    [allPairRows],
  );

  const totalPages = Math.max(1, Math.ceil(sortedPairRows.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pagedPairRows = useMemo(
    () =>
      sortedPairRows.slice(
        (currentPageSafe - 1) * PAGE_SIZE,
        currentPageSafe * PAGE_SIZE,
      ),
    [currentPageSafe, sortedPairRows],
  );

  const overallAverageScore = useMemo(() => {
    const validScores = allPairRows
      .map((row) => row.scorePercent)
      .filter((score): score is number => typeof score === "number");
    if (validScores.length > 0) {
      return Math.round(
        validScores.reduce((sum, score) => sum + score, 0) / validScores.length,
      );
    }

    if (matchingStats?.avgScore && matchingStats.avgScore > 0) {
      return Math.round(
        matchingStats.avgScore <= 1
          ? matchingStats.avgScore * 100
          : matchingStats.avgScore,
      );
    }

    return 0;
  }, [allPairRows, matchingStats?.avgScore]);

  const highMatchCount = useMemo(
    () =>
      allPairRows.filter(
        (row) =>
          typeof row.scorePercent === "number" &&
          row.scorePercent >= HIGH_MATCH_THRESHOLD,
      ).length,
    [allPairRows],
  );

  const lowMatchRows = useMemo(
    () => {
      const grouped = new Map<
        string,
        {
          ownerId: string;
          owner?: Participant;
          bestScore: number | null;
        }
      >();

      for (const row of allPairRows) {
        const current = grouped.get(row.ownerId);
        const nextBestScore =
          current?.bestScore == null
            ? row.scorePercent
            : row.scorePercent == null
              ? current.bestScore
              : Math.max(current.bestScore, row.scorePercent);

        grouped.set(row.ownerId, {
          ownerId: row.ownerId,
          owner: row.owner,
          bestScore: nextBestScore ?? null,
        });
      }

      return Array.from(grouped.values())
        .filter(
          (row) =>
            row.bestScore == null || row.bestScore < LOW_MATCH_THRESHOLD,
        )
        .sort((a, b) => (a.bestScore ?? -1) - (b.bestScore ?? -1));
    },
    [allPairRows],
  );

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 text-center">
          <Users size={18} className="mx-auto mb-1 text-primary-500" />
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {participants.length}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
            参与人数
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 text-center">
          <BarChart3 size={18} className="mx-auto mb-1 text-accent-500" />
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {matchResults.length}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">匹配人数</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 text-center">
          <Sparkles size={18} className="mx-auto mb-1 text-secondary-500" />
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {highMatchCount}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">高匹配对数</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 text-center">
          <History size={18} className="mx-auto mb-1 text-secondary-500" />
          <p className="text-lg md:text-xl font-bold text-gray-900">
            {overallAverageScore}%
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">平均匹配度</p>
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
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_320px]">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-semibold text-gray-900">匹配结果明细</h3>
              <p className="text-xs text-gray-500 mt-1">
                展示所有匹配结果，并按总匹配分数从高到低排序
              </p>
            </div>
          </div>

          {sortedPairRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500">
                    <th className="px-4 py-3 font-medium">用户 A</th>
                    <th className="px-4 py-3 font-medium">用户 B</th>
                    <th className="px-4 py-3 font-medium">全局匹配度</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPairRows.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserHoverCard user={toUserBrief(row.owner)} onViewProfile={handleViewProfile}>
                            <Avatar participant={row.owner} size="sm" />
                          </UserHoverCard>
                          <div className="min-w-0">
                            <button
                              onClick={() => handleViewProfile(row.ownerId)}
                              className="text-sm font-medium text-gray-900 hover:text-primary-600"
                            >
                              {row.owner?.name || row.ownerId.slice(0, 6)}
                            </button>
                            {getParticipantMeta(row.owner) && (
                              <p className="text-xs text-gray-500 truncate">
                                {getParticipantMeta(row.owner)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.candidateId ? (
                          <div className="flex items-center gap-3">
                            <UserHoverCard user={toUserBrief(row.candidate)} onViewProfile={handleViewProfile}>
                              <Avatar participant={row.candidate} size="sm" />
                            </UserHoverCard>
                            <div className="min-w-0">
                              <button
                                onClick={() => handleViewProfile(row.candidateId!)}
                                className="text-sm font-medium text-gray-900 hover:text-primary-600"
                              >
                                {row.candidate?.name || row.candidateId.slice(0, 6)}
                              </button>
                              {getParticipantMeta(row.candidate) && (
                                <p className="text-xs text-gray-500 truncate">
                                  {getParticipantMeta(row.candidate)}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">暂无匹配对象</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            row.scorePercent != null && row.scorePercent >= HIGH_MATCH_THRESHOLD
                              ? "bg-emerald-50 text-emerald-600"
                              : row.scorePercent != null && row.scorePercent < LOW_MATCH_THRESHOLD
                                ? "bg-orange-50 text-orange-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {row.scorePercent != null ? `${row.scorePercent}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">
                  共 {sortedPairRows.length} 条匹配结果
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPageSafe <= 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  <span className="text-gray-500">
                    第 {currentPageSafe} / {totalPages} 页
                  </span>
                  <label className="flex items-center gap-2 text-gray-500">
                    <span>跳转</span>
                    <select
                      value={currentPageSafe}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
                    >
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                        (page) => (
                          <option key={page} value={page}>
                            第 {page} 页
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPageSafe >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500 text-sm">
              未找到匹配的参与者
            </div>
          )}
        </section>

        <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm h-fit overflow-hidden lg:sticky lg:top-4">
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                <h3 className="text-base font-semibold text-gray-900">低匹配成员</h3>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                按最高匹配度从低到高排序，点击姓名查看主页。
              </p>
            </div>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
              {lowMatchRows.length} 人
            </span>
          </div>
          <div>
            {lowMatchRows.length > 0 ? (
              <div className="max-h-[360px] overflow-y-auto">
                <table className="min-w-full text-left">
                  <thead className="sticky top-0 z-10 bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">成员</th>
                      <th className="px-4 py-2.5 text-right font-medium">最高匹配度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lowMatchRows.map((row) => (
                      <tr
                        key={`${row.ownerId}-low`}
                        className="hover:bg-orange-50/40"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Avatar participant={row.owner} size="sm" />
                            <div className="min-w-0">
                              <button
                                onClick={() => handleViewProfile(row.ownerId)}
                                className="block max-w-[150px] truncate text-sm font-medium text-gray-900 hover:text-primary-600"
                                title={row.owner?.name || row.ownerId}
                              >
                                {row.owner?.name || row.ownerId.slice(0, 6)}
                              </button>
                              {getParticipantMeta(row.owner) && (
                                <p className="max-w-[150px] truncate text-xs text-gray-500">
                                  {getParticipantMeta(row.owner)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              row.bestScore != null
                                ? "bg-orange-50 text-orange-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {row.bestScore != null ? `${row.bestScore}%` : "暂无"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-5 text-sm text-gray-500">
                当前没有低匹配成员，整体结果较稳定。
              </div>
            )}
          </div>
          {lowMatchRows.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">
              低匹配成员不代表不可交流，只表示当前规则下缺少强相关对象。
            </div>
          )}
        </aside>
      </div>

      <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          匹配是怎么来的？
        </h3>
        <div className="grid gap-3 md:grid-cols-3 text-sm text-gray-600">
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            系统会基于报名表里的字段规则计算每位参与者与候选对象的综合匹配度。
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            商家侧看到的全局匹配度，是当前第一优先匹配对象的综合得分，用于快速判断结果质量。
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            低匹配成员并不代表不可交流，只是当前规则下缺少强相关对象，建议人工查看后再判断。
          </div>
        </div>
      </section>

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
