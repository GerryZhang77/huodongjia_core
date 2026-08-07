import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  RotateCcw,
  UsersRound,
} from "lucide-react";
import MerchantLayout from "@/components/layout/MerchantLayout";
import { Button } from "@/components/ui";
import { Toast } from "@/components/ui/Toast";
import { getActivityById } from "@/features/activities/services/api";
import { MatchExportContentOptions } from "@/features/matching/components/MatchExport/MatchExportContentOptions";
import {
  ExportPreviewDrawer,
  RelationSelectionDrawer,
} from "@/features/matching/components/MatchExport/MatchExportDrawers";
import {
  downloadMatchExport,
  getMatchExportFieldGroups,
  previewMatchExport,
  type MatchExportColumn,
  type MatchExportPreview,
  type MatchExportRelation,
  type MatchExportSystemField,
} from "@/features/matching/services/matchExportApi";
import {
  getMatchGroups,
  getParticipants,
} from "@/features/matching/services/matchingApi";
import {
  buildMatchExportFieldOptions,
  createDefaultMatchExportColumns,
  createFieldExportColumn,
  getMatchExportRelationKey,
  type MatchExportFieldOption,
} from "@/features/matching/utils/matchExportModel";
import {
  merchantCacheTimes,
  merchantQueryKeys,
} from "@/features/merchant/queryKeys";

type RelationMode = "all" | "custom" | number;

const SYSTEM_OPTIONS = [
  { field: "rank", label: "匹配顺序" },
  { field: "score", label: "匹配分" },
  { field: "reciprocal", label: "双方互荐" },
] satisfies Array<{
  field: MatchExportSystemField;
  label: string;
}>;

const getErrorMessage = async (
  error: unknown,
  fallback: string,
): Promise<{ message: string; code?: string }> => {
  const candidate = error as {
    response?: { data?: unknown };
    message?: string;
  };
  let data = candidate.response?.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      data = null;
    }
  }
  const payload =
    data && typeof data === "object"
      ? (data as { message?: string; code?: string })
      : null;
  return {
    message: payload?.message || candidate.message || fallback,
    code: payload?.code,
  };
};

const MatchResultExportPage: React.FC = () => {
  const { id: activityId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [relationMode, setRelationMode] = useState<RelationMode>("all");
  const [selectedRelations, setSelectedRelations] = useState<Set<string>>(
    new Set(),
  );
  const [columns, setColumns] = useState<MatchExportColumn[]>([]);
  const [preview, setPreview] = useState<MatchExportPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [participantDrawerOpen, setParticipantDrawerOpen] = useState(false);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [initializedRun, setInitializedRun] = useState("");

  const activityQuery = useQuery({
    queryKey: merchantQueryKeys.activity(activityId),
    queryFn: () => getActivityById(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.activityStale,
  });
  const participantsQuery = useQuery({
    queryKey: merchantQueryKeys.matchingParticipants(activityId),
    queryFn: () => getParticipants(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.matchingParticipantsStale,
  });
  const resultsQuery = useQuery({
    queryKey: merchantQueryKeys.matchingResults(activityId),
    queryFn: () => getMatchGroups(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.matchingResultStale,
  });
  const exportFieldsQuery = useQuery({
    queryKey: ["merchant", "match-export-fields", activityId],
    queryFn: () => getMatchExportFieldGroups(activityId),
    enabled: Boolean(activityId),
    staleTime: merchantCacheTimes.activityStale,
  });

  const matchResults = useMemo(
    () => resultsQuery.data?.results || [],
    [resultsQuery.data?.results],
  );
  const participants = useMemo(
    () => participantsQuery.data || [],
    [participantsQuery.data],
  );
  const participantMap = useMemo(
    () =>
      new Map(
        participants.map((participant) => [participant.id, participant]),
      ),
    [participants],
  );
  const fieldOptions = useMemo(
    () => buildMatchExportFieldOptions(exportFieldsQuery.data || []),
    [exportFieldsQuery.data],
  );
  const allRelationKeys = useMemo(
    () =>
      matchResults.flatMap((result) =>
        result.bestMatchUserIds.map((targetId) =>
          getMatchExportRelationKey(result.userId, targetId),
        ),
      ),
    [matchResults],
  );
  const maxMatchCount = useMemo(
    () =>
      matchResults.reduce(
        (maximum, result) =>
          Math.max(maximum, result.bestMatchUserIds.length),
        0,
      ),
    [matchResults],
  );
  const currentRunKey = resultsQuery.data?.matchStatusId
    ? `${resultsQuery.data.matchStatusId}:${resultsQuery.data.revision || 1}`
    : "";

  useEffect(() => {
    if (
      !currentRunKey ||
      exportFieldsQuery.isPending ||
      initializedRun === currentRunKey
    ) {
      return;
    }
    setSelectedRelations(new Set(allRelationKeys));
    setColumns(createDefaultMatchExportColumns(fieldOptions));
    setRelationMode("all");
    setPreview(null);
    setInitializedRun(currentRunKey);
  }, [
    allRelationKeys,
    currentRunKey,
    exportFieldsQuery.isPending,
    fieldOptions,
    initializedRun,
  ]);

  const orderedRelations = useMemo<MatchExportRelation[]>(
    () =>
      matchResults.flatMap((result) =>
        result.bestMatchUserIds.flatMap((targetUserId) =>
          selectedRelations.has(
            getMatchExportRelationKey(result.userId, targetUserId),
          )
            ? [{ sourceUserId: result.userId, targetUserId }]
            : [],
        ),
      ),
    [matchResults, selectedRelations],
  );
  const selectedSourceIds = useMemo(
    () =>
      new Set(
        matchResults.flatMap((result) =>
          result.bestMatchUserIds.some((targetId) =>
            selectedRelations.has(
              getMatchExportRelationKey(result.userId, targetId),
            ),
          )
            ? [result.userId]
            : [],
        ),
      ),
    [matchResults, selectedRelations],
  );
  const selectedParticipantNames = useMemo(
    () =>
      matchResults
        .filter((result) => selectedSourceIds.has(result.userId))
        .map(
          (result) =>
            participantMap.get(result.userId)?.name || result.userId.slice(0, 8),
        ),
    [matchResults, participantMap, selectedSourceIds],
  );

  const orderedColumns = useMemo(() => {
    const fieldOrder = new Map(
      fieldOptions.map((option, index) => [option.id, index]),
    );
    const systemOrder = new Map(
      SYSTEM_OPTIONS.map((option, index) => [option.field, index]),
    );
    const groupOrder = { source: 0, target: 1, system: 2 } as const;
    return [...columns].sort((left, right) => {
      const groupDifference = groupOrder[left.side] - groupOrder[right.side];
      if (groupDifference !== 0) return groupDifference;
      if (left.side === "system" && right.side === "system") {
        return (
          (systemOrder.get(left.systemField || "rank") ??
            Number.MAX_SAFE_INTEGER) -
          (systemOrder.get(right.systemField || "rank") ??
            Number.MAX_SAFE_INTEGER)
        );
      }
      const leftId = left.id.slice(left.side.length + 1);
      const rightId = right.id.slice(right.side.length + 1);
      return (
        (fieldOrder.get(leftId) ?? Number.MAX_SAFE_INTEGER) -
        (fieldOrder.get(rightId) ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }, [columns, fieldOptions]);

  const invalidatePreview = () => {
    setPreview(null);
    setPreviewDrawerOpen(false);
  };

  const applyRelationMode = (value: string) => {
    if (value === "custom") {
      setParticipantDrawerOpen(true);
      return;
    }
    const limit = value === "all" ? null : Number(value);
    const next = new Set(
      matchResults.flatMap((result) =>
        selectedSourceIds.has(result.userId)
          ? result.bestMatchUserIds
              .slice(0, limit ?? result.bestMatchUserIds.length)
              .map((targetId) =>
                getMatchExportRelationKey(result.userId, targetId),
              )
          : [],
      ),
    );
    setSelectedRelations(next);
    setRelationMode(limit ?? "all");
    invalidatePreview();
  };

  const updateRelations = (
    next: Set<string>,
    reason: "participants" | "matching-objects",
  ) => {
    setSelectedRelations(next);
    if (reason === "matching-objects") setRelationMode("custom");
    invalidatePreview();
  };

  const toggleField = (
    side: "source" | "target",
    option: MatchExportFieldOption,
  ) => {
    const id = `${side}:${option.id}`;
    setColumns((current) =>
      current.some((column) => column.id === id)
        ? current.filter((column) => column.id !== id)
        : [...current, createFieldExportColumn(side, option)],
    );
    invalidatePreview();
  };

  const toggleSystemField = (field: MatchExportSystemField) => {
    const id = `system:${field}`;
    const option = SYSTEM_OPTIONS.find((item) => item.field === field)!;
    setColumns((current) =>
      current.some((column) => column.id === id)
        ? current.filter((column) => column.id !== id)
        : [
            ...current,
            { id, header: option.label, side: "system", systemField: field },
          ],
    );
    invalidatePreview();
  };

  const updateHeader = (id: string, header: string) => {
    setColumns((current) =>
      current.map((column) =>
        column.id === id ? { ...column, header } : column,
      ),
    );
    invalidatePreview();
  };

  const restoreDefaultColumns = () => {
    setColumns(createDefaultMatchExportColumns(fieldOptions));
    invalidatePreview();
  };

  const duplicateHeaders = useMemo(() => {
    const counts = new Map<string, number>();
    orderedColumns.forEach((column) => {
      const key = column.header.trim().toLocaleLowerCase("zh-CN");
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [orderedColumns]);
  const columnError =
    orderedColumns.length === 0
      ? "请至少选择一项导出内容"
      : orderedColumns.some((column) => !column.header.trim())
        ? "Excel 表头不能为空"
        : duplicateHeaders.size > 0
          ? "存在重复的 Excel 表头，请修改后继续"
          : "";

  const requestPayload = () => ({
    matchStatusId: resultsQuery.data?.matchStatusId || "",
    expectedRevision: resultsQuery.data?.revision || 1,
    relations: orderedRelations,
    columns: orderedColumns,
  });

  const validateConfiguration = () => {
    if (orderedRelations.length === 0) {
      Toast.show({ icon: "fail", content: "请至少选择一位参与者" });
      return false;
    }
    if (columnError) {
      Toast.show({ icon: "fail", content: columnError });
      return false;
    }
    return true;
  };

  const handlePreview = async () => {
    if (!validateConfiguration()) return;
    setPreviewing(true);
    try {
      const data = await previewMatchExport(activityId, requestPayload());
      setPreview(data);
      setPreviewDrawerOpen(true);
    } catch (error) {
      const parsed = await getErrorMessage(error, "生成导出预览失败");
      Toast.show({ icon: "fail", content: parsed.message });
    } finally {
      setPreviewing(false);
    }
  };

  const handleExport = async () => {
    if (!validateConfiguration()) return;
    setExporting(true);
    try {
      let exactPreview = preview;
      if (!exactPreview) {
        exactPreview = await previewMatchExport(activityId, requestPayload());
        setPreview(exactPreview);
      }
      const blob = await downloadMatchExport(activityId, {
        ...requestPayload(),
        previewDigest: exactPreview.previewDigest,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exactPreview.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      Toast.show({
        icon: "success",
        content: `已导出 ${exactPreview.totalRows} 条匹配关系`,
      });
    } catch (error) {
      const parsed = await getErrorMessage(error, "导出失败");
      if (
        parsed.code === "MATCH_EXPORT_PREVIEW_STALE" ||
        parsed.code === "MATCH_RESULT_CHANGED"
      ) {
        setPreview(null);
        setPreviewDrawerOpen(false);
        if (parsed.code === "MATCH_RESULT_CHANGED") {
          void resultsQuery.refetch();
        }
      }
      Toast.show({ icon: "fail", content: parsed.message });
    } finally {
      setExporting(false);
    }
  };

  const participantSummary =
    selectedParticipantNames.length === 0
      ? "尚未选择参与者"
      : selectedParticipantNames.length === matchResults.length
        ? "全部参与者"
        : `${selectedParticipantNames.slice(0, 4).join("、")}${
            selectedParticipantNames.length > 4 ? "等" : ""
          }`;

  const isLoading =
    activityQuery.isPending ||
    participantsQuery.isPending ||
    resultsQuery.isPending ||
    exportFieldsQuery.isPending;
  const loadError =
    activityQuery.error ||
    participantsQuery.error ||
    resultsQuery.error ||
    exportFieldsQuery.error;
  const goBack = () =>
    navigate(`/dashboard/activity/${activityId}/matching?step=results`);

  if (isLoading) {
    return (
      <MerchantLayout
        title="导出匹配结果"
        showBack
        onBack={goBack}
        fullWidth
      >
        <div className="flex min-h-[55vh] items-center justify-center text-sm text-gray-500">
          <Loader2 size={22} className="mr-2 animate-spin" />
          正在准备匹配结果…
        </div>
      </MerchantLayout>
    );
  }

  if (
    loadError ||
    !resultsQuery.data?.matchStatusId ||
    matchResults.length === 0
  ) {
    return (
      <MerchantLayout
        title="导出匹配结果"
        showBack
        onBack={goBack}
        fullWidth
      >
        <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center">
          <AlertCircle size={34} className="mx-auto text-amber-400" />
          <h2 className="mt-3 font-semibold text-gray-900">
            当前没有可导出的匹配结果
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            请返回匹配结果页刷新或重新执行匹配。
          </p>
          <Button className="mt-4" onClick={goBack}>
            返回匹配结果
          </Button>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout
      title="导出匹配结果"
      showBack
      onBack={goBack}
      fullWidth
      contentClassName="pb-24"
    >
      <div className="mx-auto max-w-[1040px] space-y-5 px-2 py-4 md:px-6 md:py-6">
        <p className="px-1 text-sm font-medium text-gray-600">
          {activityQuery.data?.title || "活动"}
        </p>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <h2 className="font-semibold text-gray-900">选择参与者</h2>

          <button
            type="button"
            aria-label="选择参与者"
            onClick={() => setParticipantDrawerOpen(true)}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/50 p-4 text-left transition-colors hover:border-primary-200 hover:bg-primary-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm">
              <UsersRound size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-900">
                已选择 {selectedSourceIds.size}/{matchResults.length} 位参与者
              </span>
              <span className="mt-1 block truncate text-xs text-gray-500">
                {participantSummary}
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-gray-400" />
          </button>

          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-w-0 items-center gap-3 text-sm text-gray-700">
              <span className="shrink-0">每位参与者包含的匹配对象</span>
              <select
                aria-label="每位参与者包含的匹配对象数量"
                value={String(relationMode)}
                onChange={(event) => applyRelationMode(event.target.value)}
                className="h-9 min-w-36 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-primary-400 focus:outline-none"
              >
                <option value="all">全部</option>
                {Array.from(
                  { length: maxMatchCount },
                  (_, index) => index + 1,
                ).map((count) => (
                  <option key={count} value={count}>
                    前 {count} 位
                  </option>
                ))}
                {relationMode === "custom" ? (
                  <option value="custom">已单独调整</option>
                ) : null}
              </select>
            </label>
            <Button
              size="small"
              variant="text"
              onClick={() => setParticipantDrawerOpen(true)}
            >
              单独调整
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">选择导出内容</h2>
              <p className="mt-1 text-xs text-gray-500">
                从活动报名表中勾选要写入 Excel 的信息。
              </p>
            </div>
            <Button
              size="small"
              variant="text"
              icon={<RotateCcw size={14} />}
              onClick={restoreDefaultColumns}
            >
              恢复默认
            </Button>
          </div>

          <div className="mt-5">
            <MatchExportContentOptions
              columns={orderedColumns}
              fieldOptions={fieldOptions}
              systemOptions={SYSTEM_OPTIONS}
              duplicateHeaders={duplicateHeaders}
              onToggleField={toggleField}
              onToggleSystemField={toggleSystemField}
              onUpdateHeader={updateHeader}
            />
          </div>

          {columnError ? (
            <div className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600">
              {columnError}
            </div>
          ) : null}
        </section>

        <div className="sticky bottom-3 z-20 flex justify-end gap-2 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <Button
            size="small"
            variant="light"
            icon={<Eye size={15} />}
            loading={previewing}
            disabled={exporting}
            onClick={() => void handlePreview()}
          >
            预览
          </Button>
          <Button
            size="small"
            icon={<Download size={16} />}
            loading={exporting}
            disabled={
              previewing ||
              Boolean(columnError) ||
              orderedRelations.length === 0
            }
            onClick={() => void handleExport()}
          >
            导出 Excel
          </Button>
        </div>
      </div>

      {participantDrawerOpen ? (
        <RelationSelectionDrawer
          open
          matchResults={matchResults}
          participantMap={participantMap}
          selectedRelations={selectedRelations}
          defaultMatchLimit={
            typeof relationMode === "number" ? relationMode : null
          }
          onChange={updateRelations}
          onClose={() => setParticipantDrawerOpen(false)}
        />
      ) : null}
      {previewDrawerOpen ? (
        <ExportPreviewDrawer
          open
          preview={preview}
          exporting={exporting}
          onClose={() => setPreviewDrawerOpen(false)}
          onExport={() => void handleExport()}
        />
      ) : null}
    </MerchantLayout>
  );
};

export default MatchResultExportPage;
