import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileSliders,
  ListChecks,
  Loader2,
  PlayCircle,
  Users,
} from "lucide-react";
import MerchantLayout from "@/components/layout/MerchantLayout";
import { Button } from "@/components/ui";
import { RulesTab, ResultsTab } from "@/features/matching/components";
import {
  MatchingProgressBanner,
  MatchingProgressOverlay,
} from "@/features/matching/components/MatchingProgressOverlay";
import { useMatchingLogic } from "@/features/matching/hooks/useMatchingLogic";
import type { MatchResultState } from "@/features/matching/types";

type WizardStep =
  | "participants"
  | "rules"
  | "preview"
  | "execute"
  | "results";

const WIZARD_STEPS: Array<{
  key: WizardStep;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}> = [
  { key: "participants", label: "选择参与人", shortLabel: "参与人", icon: Users },
  { key: "rules", label: "设置规则", shortLabel: "规则", icon: FileSliders },
  { key: "preview", label: "预览与校验", shortLabel: "校验", icon: ClipboardCheck },
  { key: "execute", label: "执行匹配", shortLabel: "执行", icon: PlayCircle },
  { key: "results", label: "查看结果", shortLabel: "结果", icon: ListChecks },
];

const isWizardStep = (value: string | null): value is WizardStep =>
  WIZARD_STEPS.some((step) => step.key === value);

const MatchingConfigPage: React.FC = () => {
  const { id: activityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSavingRules, setIsSavingRules] = useState(false);
  const hasExplicitStep = isWizardStep(searchParams.get("step"));
  const [wizardStep, setWizardStepState] = useState<WizardStep>(() =>
    isWizardStep(searchParams.get("step"))
      ? searchParams.get("step") as WizardStep
      : "participants",
  );

  const locationState = location.state as {
    returnTo?: string;
    enrollmentReturnTo?: string;
  } | null;
  const returnTo =
    locationState?.returnTo ||
    (activityId ? `/dashboard/activity/${activityId}/detail` : "/dashboard");

  const matching = useMatchingLogic({ activityId: activityId || "" });
  const {
    stage,
    isLoading,
    isMatching,
    isPublishing,
    isCreatingAdjustmentDraft,
    isPreflighting,
    isValidating,
    isRulesLocked,
    matchingProgress,
    matchingMessage,
    isBackgroundMatching,
    currentHistoryId,
    rules,
    constraints,
    participants,
    matchResults,
    history,
    matchingStats,
    registrationSchema,
    registrationSchemaGroups,
    fieldCatalog,
    eligibleParticipantCount,
    lastPreflightResult,
    lastValidationResult,
    resultState,
    resultVersion,
    setRules,
    setConstraints,
    handleSaveRules,
    handleRunPreflight,
    handleStartMatching,
    handlePublish,
    handleValidateResults,
    handleCreateAdjustmentDraft,
    handleRefresh,
    handleEnterRematchMode,
    handleMinimizeMatching,
    handleExpandMatching,
  } = matching;

  const setWizardStep = useCallback(
    (step: WizardStep) => {
      setWizardStepState(step);
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("step", step);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (isLoading || hasExplicitStep) return;
    if (stage === "completed" || stage === "published") {
      setWizardStep("results");
    }
  }, [hasExplicitStep, isLoading, setWizardStep, stage]);

  useEffect(() => {
    if (isMatching && wizardStep !== "execute") setWizardStep("execute");
  }, [isMatching, setWizardStep, wizardStep]);

  const participantGroups = useMemo(() => {
    const groups = new Map<string, typeof participants>();
    for (const participant of participants) {
      const label = participant.registrationTypeName || "默认报名类型";
      groups.set(label, [...(groups.get(label) || []), participant]);
    }
    return Array.from(groups.entries());
  }, [participants]);

  const enabledRules = useMemo(
    () =>
      rules.filter(
        (rule) =>
          rule.enabled &&
          rule.source_field &&
          rule.target_field &&
          rule.operator,
      ),
    [rules],
  );
  const currentStepIndex = WIZARD_STEPS.findIndex(
    (step) => step.key === wizardStep,
  );
  const effectiveResultState: MatchResultState | undefined =
    resultState ||
    (stage === "published"
      ? "published"
      : matchResults.length
        ? "draft"
        : undefined);

  const handleBack = () => {
    navigate(
      returnTo,
      locationState?.enrollmentReturnTo
        ? { state: { returnTo: locationState.enrollmentReturnTo } }
        : undefined,
    );
  };

  const saveRulesAndContinue = async () => {
    setIsSavingRules(true);
    try {
      await handleSaveRules("默认配置");
      setWizardStep("preview");
    } finally {
      setIsSavingRules(false);
    }
  };

  const runPreflight = async () => {
    const result = await handleRunPreflight();
    if (result?.preflightResult.canExecute) setWizardStep("execute");
  };

  const publishAdapter = async (
    sendNotification?: boolean,
  ): Promise<void | { success: boolean; error?: string }> => {
    try {
      await handlePublish(sendNotification ?? true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "发布失败",
      };
    }
  };

  if (isLoading) {
    return (
      <MerchantLayout title="智能匹配" showBack onBack={handleBack}>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="mb-4 animate-spin text-primary-400" />
          <p className="text-gray-500">正在加载匹配配置...</p>
        </div>
      </MerchantLayout>
    );
  }

  if (!activityId) {
    return (
      <MerchantLayout title="智能匹配" showBack onBack={() => navigate("/dashboard")}>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle size={40} className="mb-4 text-red-400" />
          <p className="mb-2 font-medium text-gray-900">活动不存在</p>
          <Button onClick={() => navigate("/dashboard")}>返回活动列表</Button>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="智能匹配" showBack onBack={handleBack}>
      <MatchingProgressBanner
        visible={isBackgroundMatching}
        progress={matchingProgress}
        message={matchingMessage}
        onExpand={handleExpandMatching}
      />

      <div className="mx-auto max-w-6xl space-y-5 px-1 py-3 md:px-5 md:py-6">
        <header>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">智能匹配</h1>
          <p className="mt-1 text-sm text-gray-500">
            按顺序完成参与人确认、规则设置、校验、执行和发布。
          </p>
        </header>

        <nav aria-label="匹配配置步骤">
          <ol className="flex min-w-0 items-center rounded-2xl border border-gray-100 bg-white p-2 shadow-sm md:min-w-[650px]">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              const active = step.key === wizardStep;
              const complete = index < currentStepIndex;
              const reachable =
                index <= currentStepIndex ||
                (step.key === "results" && matchResults.length > 0);
              return (
                <React.Fragment key={step.key}>
                  <li className="min-w-0 flex-1">
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => setWizardStep(step.key)}
                      aria-current={active ? "step" : undefined}
                      className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 md:flex-row md:gap-2 md:px-2 md:py-2.5 md:text-sm ${
                        active
                          ? "bg-primary-50 text-primary-700"
                          : complete
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          active
                            ? "bg-primary-500 text-white"
                            : complete
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {complete ? <Check size={14} /> : <Icon size={14} />}
                      </span>
                      <span className="hidden lg:inline">{step.label}</span>
                      <span className="lg:hidden">{step.shortLabel}</span>
                    </button>
                  </li>
                  {index < WIZARD_STEPS.length - 1 && (
                    <ChevronRight
                      size={15}
                      className="hidden shrink-0 text-gray-300 sm:block"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>

        {wizardStep === "participants" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">确认本次参与人</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    仅包含审核通过且所属报名类型已开启“参与匹配”的平台用户。
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/dashboard/activity/${activityId}/enrollment`, {
                      state: { returnTo: `${location.pathname}?step=participants` },
                    })
                  }
                >
                  管理报名人员
                </Button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {participantGroups.map(([name, group]) => (
                  <div key={name} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">{name}</span>
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-xs tabular-nums text-gray-600">
                        {group.length} 人
                      </span>
                    </div>
                    <p className="mt-2 truncate text-xs text-gray-500">
                      {group.slice(0, 5).map((item) => item.name).join("、") || "暂无人员"}
                      {group.length > 5 ? ` 等 ${group.length} 人` : ""}
                    </p>
                  </div>
                ))}
                {participantGroups.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
                    暂无可匹配参与人，请先在报名管理中审核并检查报名类型配置。
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                disabled={eligibleParticipantCount === 0}
                onClick={() => setWizardStep("rules")}
                iconRight={<ChevronRight size={16} />}
              >
                下一步：设置规则
              </Button>
            </div>
          </section>
        )}

        {wizardStep === "rules" && (
          <section className="space-y-4">
            <RulesTab
              rules={rules}
              onRulesChange={setRules}
              constraints={constraints}
              onConstraintsChange={setConstraints}
              onSaveRules={handleSaveRules}
              onStartMatching={handleStartMatching}
              isMatching={isMatching}
              isRulesLocked={isRulesLocked}
              matchingProgress={matchingProgress}
              matchingMessage={matchingMessage}
              participantCount={eligibleParticipantCount}
              schemaFields={registrationSchema}
              schemaGroups={registrationSchemaGroups}
              fieldCatalog={fieldCatalog}
              preflightResult={lastPreflightResult}
              showFooterActions={false}
            />
            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setWizardStep("participants")}
                icon={<ChevronLeft size={16} />}
              >
                返回参与人
              </Button>
              <Button
                loading={isSavingRules}
                disabled={enabledRules.length === 0}
                onClick={() => void saveRulesAndContinue()}
                iconRight={<ChevronRight size={16} />}
              >
                保存并进入校验
              </Button>
            </div>
          </section>
        )}

        {wizardStep === "preview" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">执行前预览与校验</h2>
              <p className="mt-1 text-sm text-gray-500">
                校验字段覆盖率、人数上下限和硬规则，校验通过后才允许执行。
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">参与人数</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{eligibleParticipantCount}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">启用规则</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{enabledRules.length}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">每人匹配</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {constraints.minMatches}–{constraints.maxMatches} 人
                  </p>
                </div>
              </div>
              {lastPreflightResult && (
                <div
                  className={`mt-4 rounded-xl border p-4 ${
                    lastPreflightResult.canExecute
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {lastPreflightResult.canExecute ? "校验通过" : "校验未通过"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{lastPreflightResult.message}</p>
                  {!lastPreflightResult.canExecute && (
                    <ul className="mt-3 space-y-1 text-xs text-red-700">
                      {lastPreflightResult.ruleDiagnostics
                        .filter((item) => !item.canExecute)
                        .slice(0, 5)
                        .map((item) => <li key={item.groupKey}>• {item.message}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setWizardStep("rules")}
                icon={<ChevronLeft size={16} />}
              >
                返回规则
              </Button>
              <Button
                loading={isPreflighting}
                onClick={() => void runPreflight()}
                iconRight={<ClipboardCheck size={16} />}
              >
                {lastPreflightResult?.canExecute ? "重新校验" : "运行校验"}
              </Button>
            </div>
          </section>
        )}

        {wizardStep === "execute" && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <PlayCircle size={44} className="mx-auto text-primary-500" />
              <h2 className="mt-3 text-lg font-semibold text-gray-900">
                {isMatching ? "正在生成匹配草稿" : "执行智能匹配"}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                执行会生成一个新的未发布草稿。首次匹配直接编辑该草稿；只有已发布版本需要修改时，才会创建调整草稿。
              </p>
              {isMatching ? (
                <div className="mx-auto mt-6 max-w-xl">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all"
                      style={{ width: `${matchingProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {matchingMessage || "正在计算..."} · {Math.round(matchingProgress)}%
                  </p>
                </div>
              ) : (
                <Button className="mt-6" onClick={() => void handleStartMatching()}>
                  开始执行匹配
                </Button>
              )}
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                disabled={isMatching}
                onClick={() => setWizardStep("preview")}
                icon={<ChevronLeft size={16} />}
              >
                返回校验
              </Button>
              {matchResults.length > 0 && !isMatching && (
                <Button
                  onClick={() => setWizardStep("results")}
                  iconRight={<ChevronRight size={16} />}
                >
                  查看草稿结果
                </Button>
              )}
            </div>
          </section>
        )}

        {wizardStep === "results" && (
          <ResultsTab
            activityId={activityId}
            matchResults={matchResults}
            participants={participants}
            registrationSchemaGroups={registrationSchemaGroups}
            rules={rules}
            isPublishing={isPublishing}
            onPublish={publishAdapter}
            onRematch={() => {
              handleEnterRematchMode();
              setWizardStep("rules");
            }}
            isRematching={isMatching}
            matchingStats={matchingStats || undefined}
            history={history}
            currentHistoryId={currentHistoryId}
            constraints={constraints}
            onResultsChanged={handleRefresh}
            readOnly={effectiveResultState === "published"}
            resultState={effectiveResultState}
            resultVersion={resultVersion}
            validationResult={lastValidationResult}
            isValidating={isValidating}
            isCreatingAdjustmentDraft={isCreatingAdjustmentDraft}
            onValidate={handleValidateResults}
            onCreateAdjustmentDraft={handleCreateAdjustmentDraft}
          />
        )}
      </div>

      {isMatching && !isBackgroundMatching && (
        <MatchingProgressOverlay
          visible
          progress={matchingProgress}
          message={matchingMessage}
          onMinimize={handleMinimizeMatching}
        />
      )}
    </MerchantLayout>
  );
};

export default MatchingConfigPage;
