import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type {
  MatchConstraints,
  ParticipantMatchResult,
} from "../../types";
import ResultsTab from "./index";

const constraints: MatchConstraints = {
  countMode: "range",
  minMatches: 1,
  maxMatches: 3,
  hardRules: [],
  allowManualOverride: false,
};

const matchResults: ParticipantMatchResult[] = [
  {
    id: "result-owner",
    userId: "owner",
    matchId: "match-1",
    bestMatchUserIds: ["candidate"],
    scores: [{ total_score: 0.8, total_score_percent: 80 }],
    createdAt: "2026-07-28T00:00:00.000Z",
    isLocked: false,
  },
];

const renderResults = (onRematch = vi.fn()) => {
  const view = render(
    <MemoryRouter>
      <ResultsTab
        activityId="event-1"
        matchResults={matchResults}
        participants={[
          {
            id: "owner",
            name: "参与者甲",
            occupation: "产品经理",
            city: "上海",
          },
          {
            id: "candidate",
            name: "推荐对象乙",
            occupation: "设计师",
            city: "北京",
          },
        ]}
        registrationSchemaGroups={[]}
        eligibleParticipantCount={2}
        rules={[]}
        isPublishing={false}
        onPublish={vi.fn()}
        onRematch={onRematch}
        isRematching={false}
        constraints={constraints}
        onResultsChanged={vi.fn()}
      />
    </MemoryRouter>,
  );
  return { ...view, onRematch };
};

afterEach(() => {
  vi.useRealTimers();
});

describe("ResultsTab interactions", () => {
  it("shows the user card when hovering the participant information area", () => {
    vi.useFakeTimers();
    renderResults();

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "参与者甲" }),
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(
      screen.getByRole("dialog", { name: "参与者甲的用户资料" }),
    ).not.toBeNull();
  });

  it("uses concise sorting labels without the redundant filter toolbar", () => {
    renderResults();

    expect(
      (screen.getByRole("combobox", { name: "排序方式" }) as HTMLSelectElement)
        .value,
    ).toBe("score-desc");
    expect(
      screen.getByRole("option", { name: "低匹配优先" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("option", { name: "高匹配优先" }),
    ).not.toBeNull();
    expect(screen.getByRole("option", { name: "按姓名" })).not.toBeNull();
    expect(
      screen.queryByRole("option", { name: "需处理优先" }),
    ).toBeNull();
    expect(
      screen.queryByRole("group", { name: "筛选匹配结果" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "全部" })).toBeNull();
  });

  it("does not expose exact match scores in the result cards", () => {
    renderResults();

    expect(screen.queryByText("80%")).toBeNull();
    expect(screen.queryByText("暂无得分")).toBeNull();
  });

  it("moves the rematch entry into the result header", () => {
    const { onRematch } = renderResults();

    fireEvent.click(
      screen.getByRole("button", { name: "修改匹配设置" }),
    );

    expect(onRematch).toHaveBeenCalledTimes(1);
  });
});
