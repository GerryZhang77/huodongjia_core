import { FC, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "antd-mobile";
import {
  AlertCircle,
  ArrowLeft,
  Sparkles,
  UserRound,
} from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui";
import { useActivityDetail } from "@/features/user";
import {
  getBestMatchDetail,
  getExistingMatchMessage,
  getMatchMessage,
  type MatchRuleDetail,
  type MatchScoreFieldDetail,
} from "@/features/user/services/matchApi";

const operatorTone: Record<string, string> = {
  similarity: "bg-emerald-50 text-emerald-600",
  complement: "bg-amber-50 text-amber-700",
  exact: "bg-sky-50 text-sky-700",
  distance_decay: "bg-violet-50 text-violet-700",
};

const formatFieldValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join("、");
  }
  if (value === null || value === undefined || value === "") {
    return "未填写";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

const MatchInfoCard: FC<{
  title: string;
  data: Record<string, unknown>;
  orderedFields: Array<{ key: string; label: string }>;
}> = ({ title, data, orderedFields }) => {
  const entries = useMemo(() => {
    const seenKeys = new Set<string>();
    const orderedEntries = orderedFields
      .filter((field) => Object.prototype.hasOwnProperty.call(data, field.key))
      .map((field) => {
        seenKeys.add(field.key);
        return [field.label, data[field.key]] as const;
      });

    const extraEntries = Object.entries(data)
      .filter(([key]) => !seenKeys.has(key))
      .map(([key, value]) => [key, value] as const);

    return [...orderedEntries, ...extraEntries].filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    );
  }, [data, orderedFields]);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <UserRound size={16} className="text-gray-400" />
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {entries.length > 0 ? (
          entries.map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0"
            >
              <span className="text-sm text-gray-500 flex-shrink-0">
                {label}
              </span>
              <span className="text-sm text-gray-900 text-right break-words">
                {formatFieldValue(value)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">暂无报名信息</p>
        )}
      </div>
    </section>
  );
};

const RuleScoreCard: FC<{
  rule: MatchRuleDetail;
  scoreField?: MatchScoreFieldDetail;
}> = ({ rule, scoreField }) => {
  const percent = scoreField?.score_percent ?? Math.round((scoreField?.score ?? 0) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            {rule.source_label || rule.source_field}
            {" · "}
            {rule.operator_label || rule.operator}
            {" · "}
            {rule.target_label || rule.target_field}
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            权重 {rule.weight}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${operatorTone[rule.operator] || "bg-gray-100 text-gray-600"}`}
        >
          {percent}分
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-400"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-500">我的信息</span>
          <span className="text-gray-900 text-right break-words">
            {scoreField?.current_user_value || "未填写"}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-500">对方信息</span>
          <span className="text-gray-900 text-right break-words">
            {scoreField?.target_user_value || "未填写"}
          </span>
        </div>
      </div>
    </div>
  );
};

const UserMatchDetail: FC = () => {
  const { id: activityId, userId } = useParams<{
    id: string;
    userId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: activityData } = useActivityDetail(activityId);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", "match-detail", activityId, userId],
    queryFn: () => getBestMatchDetail(activityId!, userId!),
    enabled: Boolean(activityId && userId),
  });
  const matchMessageQuery = useQuery({
    queryKey: ["user", "match-message", activityId, userId],
    queryFn: () => getExistingMatchMessage(activityId!, userId!),
    enabled: Boolean(activityId && userId),
  });

  const detail = data?.data;
  const message =
    typeof matchMessageQuery.data?.data === "string" &&
    matchMessageQuery.data.success
      ? matchMessageQuery.data.data
      : "";
  const orderedFields = useMemo(
    () =>
      (detail?.schema || []).map((field) => ({
        key: field.key,
        label: field.label || field.key,
      })),
    [detail?.schema],
  );
  const ruleScoreMap = useMemo(() => {
    const map = new Map<string, MatchScoreFieldDetail>();
    for (const field of detail?.score.fields || []) {
      map.set(
        `${field.source_field}::${field.target_field}::${field.operator}`,
        field,
      );
    }
    return map;
  }, [detail?.score.fields]);

  const generateMessageMutation = useMutation({
    mutationFn: async () => {
      if (!activityId || !userId) {
        throw new Error("缺少活动或用户信息");
      }
      return getMatchMessage(activityId, userId);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["user", "match-message", activityId, userId],
        response,
      );
      queryClient.invalidateQueries({
        queryKey: ["user", "match-detail", activityId, userId],
      });
      Toast.show({
        icon: "success",
        content:
          typeof response.data === "string" && response.data
            ? "匹配寄语已生成"
            : "匹配寄语已刷新",
      });
    },
    onError: (err) => {
      const errorMessage =
        err instanceof Error ? err.message : "生成匹配寄语失败";
      Toast.show({ icon: "fail", content: errorMessage });
    },
  });

  const handleGenerateMessage = async () => {
    await generateMessageMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          加载中...
        </div>
      </UserLayout>
    );
  }

  if (error || !detail) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <AlertCircle size={40} className="text-orange-400 mb-3" />
          <p className="text-sm text-gray-600 mb-4">
            {error instanceof Error ? error.message : "匹配详情加载失败"}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              返回
            </Button>
            <Button variant="primary" onClick={() => refetch()}>
              重试
            </Button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      showTabBar={false}
      showTopBar={false}
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "首页", path: "/u/home" },
        { label: activityData?.data?.title || "活动", path: `/u/activities/${activityId}` },
        { label: "匹配结果", path: `/u/activities/${activityId}/match-result` },
        { label: detail.targetUserEnrollment.name || "匹配详情" },
      ]}
      bgColor="bg-gray-50"
    >
      <div className="min-h-screen pb-36">
        <div className="bg-gradient-to-br from-primary-400 to-accent-500 px-4 pt-12 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-1 text-sm text-white/90"
          >
            <ArrowLeft size={16} />
            返回匹配列表
          </button>
          <div className="bg-white/12 rounded-3xl p-5 text-white backdrop-blur-sm">
            <p className="text-sm text-white/80 mb-2">当前匹配对象</p>
            <h1 className="text-2xl font-bold mb-2">
              {detail.targetUserEnrollment.name || "未命名用户"}
            </h1>
            <p className="text-sm text-white/85">
              总匹配度 {detail.score.total_score_percent ?? Math.round(detail.score.total_score * 100)} 分
            </p>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          <MatchInfoCard
            title="对方的报名信息"
            data={detail.targetUserEnrollment.form_data}
            orderedFields={orderedFields}
          />

          <MatchInfoCard
            title="我的报名信息"
            data={detail.currentUserEnrollment.form_data}
            orderedFields={orderedFields}
          />

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent-500" />
              <h3 className="text-base font-semibold text-gray-900">
                当前活动匹配规则与分数
              </h3>
            </div>

            {detail.rules.length > 0 ? (
              detail.rules.map((rule) => {
                const scoreField = ruleScoreMap.get(
                  `${rule.source_field}::${rule.target_field}::${rule.operator}`,
                );
                return (
                  <RuleScoreCard
                    key={`${rule.source_field}-${rule.target_field}-${rule.operator}`}
                    rule={rule}
                    scoreField={scoreField}
                  />
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-sm text-gray-400">
                当前还没有可展示的匹配规则
              </div>
            )}
          </section>

          {message ? (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                匹配寄语
              </h3>
              <p className="text-sm text-gray-700 leading-7">{message}</p>
            </section>
          ) : null}
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 py-3">
          <div className="max-w-lg mx-auto">
            <Button
              variant="primary"
              className="w-full"
              loading={generateMessageMutation.isPending}
              onClick={handleGenerateMessage}
            >
              {message ? "重新生成匹配寄语" : "生成匹配寄语"}
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserMatchDetail;
