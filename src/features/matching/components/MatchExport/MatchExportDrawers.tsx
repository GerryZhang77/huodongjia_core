import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
} from "lucide-react";
import { Button, Drawer } from "@/components/ui";
import type { MatchExportPreview } from "@/features/matching/services/matchExportApi";
import type {
  Participant,
  ParticipantMatchResult,
} from "@/features/matching/types";
import { getMatchExportRelationKey } from "@/features/matching/utils/matchExportModel";

const useDesktopDrawer = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
};

interface RelationSelectionDrawerProps {
  open: boolean;
  matchResults: ParticipantMatchResult[];
  participantMap: Map<string, Participant>;
  selectedRelations: Set<string>;
  defaultMatchLimit: number | null;
  onChange: (
    relations: Set<string>,
    reason: "participants" | "matching-objects",
  ) => void;
  onClose: () => void;
}

export const RelationSelectionDrawer: React.FC<
  RelationSelectionDrawerProps
> = ({
  open,
  matchResults,
  participantMap,
  selectedRelations,
  defaultMatchLimit,
  onChange,
  onClose,
}) => {
  const isDesktop = useDesktopDrawer();
  const [search, setSearch] = useState("");
  const [registrationTypeFilter, setRegistrationTypeFilter] = useState("");
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  const registrationTypes = useMemo(
    () =>
      Array.from(
        new Map(
          Array.from(participantMap.values())
            .filter((participant) => participant.registrationTypeId)
            .map((participant) => [
              String(participant.registrationTypeId),
              participant.registrationTypeName || "未命名报名类型",
            ]),
        ),
      ),
    [participantMap],
  );

  const sourceRows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("zh-CN");
    return matchResults.filter((result) => {
      const participant = participantMap.get(result.userId);
      if (
        registrationTypeFilter &&
        String(participant?.registrationTypeId || "") !==
          registrationTypeFilter
      ) {
        return false;
      }
      if (!keyword) return true;
      return [
        participant?.name,
        participant?.phone,
        participant?.registrationTypeName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("zh-CN")
        .includes(keyword);
    });
  }, [
    matchResults,
    participantMap,
    registrationTypeFilter,
    search,
  ]);

  const selectedSourceCount = matchResults.filter((result) =>
    result.bestMatchUserIds.some((targetId) =>
      selectedRelations.has(getMatchExportRelationKey(result.userId, targetId)),
    ),
  ).length;
  const allFilteredSelected =
    sourceRows.length > 0 &&
    sourceRows.every((result) =>
      result.bestMatchUserIds.some((targetId) =>
        selectedRelations.has(
          getMatchExportRelationKey(result.userId, targetId),
        ),
      ),
    );

  const addDefaultRelations = (
    next: Set<string>,
    result: ParticipantMatchResult,
  ) => {
    result.bestMatchUserIds
      .slice(0, defaultMatchLimit ?? result.bestMatchUserIds.length)
      .forEach((targetId) =>
        next.add(getMatchExportRelationKey(result.userId, targetId)),
      );
  };

  const removeParticipantRelations = (
    next: Set<string>,
    result: ParticipantMatchResult,
  ) => {
    result.bestMatchUserIds.forEach((targetId) =>
      next.delete(getMatchExportRelationKey(result.userId, targetId)),
    );
  };

  const toggleParticipant = (result: ParticipantMatchResult) => {
    const hasSelectedObject = result.bestMatchUserIds.some((targetId) =>
      selectedRelations.has(getMatchExportRelationKey(result.userId, targetId)),
    );
    const next = new Set(selectedRelations);
    removeParticipantRelations(next, result);
    if (!hasSelectedObject) addDefaultRelations(next, result);
    onChange(next, "participants");
  };

  const toggleFilteredParticipants = () => {
    const next = new Set(selectedRelations);
    sourceRows.forEach((result) => {
      removeParticipantRelations(next, result);
      if (!allFilteredSelected) addDefaultRelations(next, result);
    });
    onChange(next, "participants");
  };

  const toggleMatchingObject = (
    sourceUserId: string,
    targetUserId: string,
  ) => {
    const key = getMatchExportRelationKey(sourceUserId, targetUserId);
    const next = new Set(selectedRelations);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next, "matching-objects");
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="选择参与者"
      placement={isDesktop ? "right" : "bottom"}
      size={isDesktop ? "min(640px, 96vw)" : "92vh"}
      footer={
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
          <span className="text-sm text-gray-500">
            已选择 {selectedSourceCount}/{matchResults.length} 位参与者
          </span>
          <Button size="small" onClick={onClose}>
            完成
          </Button>
        </div>
      }
    >
      <div>
        <div className="sticky top-0 z-10 space-y-3 border-b border-gray-100 bg-white p-4 md:px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                aria-label="搜索参与者"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索姓名、手机号"
                className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:border-primary-400 focus:outline-none"
              />
            </label>
            <select
              aria-label="筛选报名类型"
              value={registrationTypeFilter}
              onChange={(event) =>
                setRegistrationTypeFilter(event.target.value)
              }
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-primary-400 focus:outline-none"
            >
              <option value="">全部报名类型</option>
              {registrationTypes.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              已选择 {selectedSourceCount}/{matchResults.length} 位参与者
            </span>
            <button
              type="button"
              disabled={sourceRows.length === 0}
              onClick={toggleFilteredParticipants}
              className="font-medium text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              {allFilteredSelected ? "取消当前筛选" : "全选当前筛选"}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {sourceRows.map((result) => {
            const participant = participantMap.get(result.userId);
            const selectedCount = result.bestMatchUserIds.filter((targetId) =>
              selectedRelations.has(
                getMatchExportRelationKey(result.userId, targetId),
              ),
            ).length;
            const selected = selectedCount > 0;
            const expanded = expandedSourceId === result.userId;
            return (
              <div key={result.userId} className="bg-white">
                <div className="flex items-center gap-3 px-4 py-3 md:px-6">
                  <input
                    aria-label={`选择参与者${participant?.name || result.userId.slice(0, 8)}`}
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleParticipant(result)}
                  />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {participant?.name?.slice(0, 1) || "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {participant?.name || result.userId.slice(0, 8)}
                      </span>
                      {participant?.registrationTypeName ? (
                        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                          {participant.registrationTypeName}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-400">
                      {participant?.phone || "未提供手机号"}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "收起" : "调整"}${participant?.name || "该参与者"}的匹配对象`}
                    onClick={() =>
                      setExpandedSourceId(expanded ? null : result.userId)
                    }
                    className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                  >
                    匹配对象 {selectedCount}/{result.bestMatchUserIds.length}
                    {expanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                </div>

                {expanded ? (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 md:px-6">
                    {result.bestMatchUserIds.map((targetId, index) => {
                      const target = participantMap.get(targetId);
                      const checked = selectedRelations.has(
                        getMatchExportRelationKey(result.userId, targetId),
                      );
                      return (
                        <label
                          key={targetId}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white"
                        >
                          <input
                            aria-label={`选择匹配对象${target?.name || targetId.slice(0, 8)}`}
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleMatchingObject(result.userId, targetId)
                            }
                          />
                          <span className="w-12 text-xs text-primary-600">
                            第 {index + 1} 位
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                            {target?.name || targetId.slice(0, 8)}
                          </span>
                          <span className="shrink-0 text-xs text-gray-400">
                            {target?.phone || ""}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
          {sourceRows.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              没有符合筛选条件的参与者
            </div>
          ) : null}
        </div>
      </div>
    </Drawer>
  );
};

interface ExportPreviewDrawerProps {
  open: boolean;
  preview: MatchExportPreview | null;
  exporting: boolean;
  onClose: () => void;
  onExport: () => void;
}

export const ExportPreviewDrawer: React.FC<ExportPreviewDrawerProps> = ({
  open,
  preview,
  exporting,
  onClose,
  onExport,
}) => {
  const isDesktop = useDesktopDrawer();
  const emptyColumns =
    preview?.columns.filter((column) => column.emptyCount > 0) || [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Excel 内容预览"
      placement={isDesktop ? "right" : "bottom"}
      size={isDesktop ? "min(1080px, 97vw)" : "94vh"}
      footer={
        preview ? (
          <div className="flex justify-end px-4 py-3 md:px-6">
            <Button
              size="small"
              icon={<Download size={16} />}
              loading={exporting}
              onClick={onExport}
            >
              导出 Excel
            </Button>
          </div>
        ) : null
      }
    >
      {preview ? (
        <div className="space-y-4 p-4 md:p-6">
          <p className="text-sm font-medium text-gray-800">
            {preview.filename}
          </p>

          {emptyColumns.length > 0 ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    部分信息存在空值
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {emptyColumns.map((column) => (
                      <span
                        key={column.id}
                        className="rounded-full bg-white px-2.5 py-1 text-xs text-amber-700"
                      >
                        {column.header}：{column.emptyCount} 行为空
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
              匹配关系
            </div>
            <div className="max-h-[calc(100vh-260px)] overflow-auto">
              <table className="min-w-max border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    {preview.columns.map((column, index) => (
                      <th
                        key={column.id}
                        className={`sticky top-0 z-10 min-w-[160px] border-b border-r border-indigo-400 bg-indigo-600 px-3 py-2.5 text-left text-xs font-semibold text-white ${
                          index === 0 ? "left-0 z-20" : ""
                        }`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }
                    >
                      {row.map((value, columnIndex) => (
                        <td
                          key={`${rowIndex}-${columnIndex}`}
                          className={`max-w-[260px] border-b border-r border-gray-100 px-3 py-2 text-xs text-gray-700 ${
                            columnIndex === 0
                              ? `sticky left-0 ${
                                  rowIndex % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50"
                                }`
                              : ""
                          }`}
                          title={String(value)}
                        >
                          {value === "" ? (
                            <span className="text-gray-300">—</span>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
};
