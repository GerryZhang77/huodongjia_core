import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ManualMatchEditor from "./ManualMatchEditor";

const mocks = vi.hoisted(() => ({
  searchMatchCandidates: vi.fn(),
  toastShow: vi.fn(),
}));

vi.mock("../services/matchingApi", () => ({
  searchMatchCandidates: mocks.searchMatchCandidates,
  setParticipantMatchesLock: vi.fn(),
  updateParticipantMatches: vi.fn(),
}));

vi.mock("@/components/ui/Toast", () => ({
  Toast: { show: mocks.toastShow },
}));

const defaultSearchResult = {
  candidates: [],
  total: 0,
  selectedIds: [],
  isLocked: false,
  config: {
    countMode: "range" as const,
    minMatches: 1,
    maxMatches: 3,
    hardRules: [],
    allowManualOverride: false,
  },
};

const renderEditor = () =>
  render(
    <ManualMatchEditor
      open
      activityId="event-1"
      source={{ id: "owner", name: "参与者甲" }}
      initialCandidateIds={[]}
      participants={[{ id: "owner", name: "参与者甲" }]}
      constraints={defaultSearchResult.config}
      onClose={vi.fn()}
      onSaved={vi.fn()}
    />,
  );

const runDebouncedSearch = async () => {
  await act(async () => {
    vi.advanceTimersByTime(260);
    await Promise.resolve();
    await Promise.resolve();
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  mocks.searchMatchCandidates.mockReset();
  mocks.toastShow.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ManualMatchEditor candidate loading", () => {
  it("treats a successful empty result as a normal empty state", async () => {
    mocks.searchMatchCandidates.mockResolvedValue(defaultSearchResult);
    renderEditor();

    await runDebouncedSearch();

    expect(
      screen.getByText("没有符合筛选条件的报名人员"),
    ).not.toBeNull();
    expect(mocks.toastShow).not.toHaveBeenCalled();
  });

  it("shows an inline retry state for transport failures without a global toast", async () => {
    mocks.searchMatchCandidates.mockRejectedValue(new Error("Failed to fetch"));
    renderEditor();

    await runDebouncedSearch();

    expect(screen.getByRole("alert").textContent).toContain(
      "候选人加载失败",
    );
    expect(screen.getByRole("button", { name: "重新加载" })).not.toBeNull();
    expect(mocks.toastShow).not.toHaveBeenCalled();
  });
});
