import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompatibilityInsightPopover } from "./CompatibilityInsightPopover";

const insight = {
  kind: "mbti" as const,
  title: "ENFP × INTJ",
  source_type: "ENFP",
  target_type: "INTJ",
  reason: "一方打开可能，一方形成路径，适合把灵感转成共同尝试。",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CompatibilityInsightPopover", () => {
  it("loads silently until the explanation is available", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false }),
    );
    const onOpenIntent = vi.fn();

    render(
      <CompatibilityInsightPopover
        fieldLabel="生日"
        canLoad
        onOpenIntent={onOpenIntent}
      >
        生日
      </CompatibilityInsightPopover>,
    );

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "查看生日匹配说明" }),
    );
    expect(onOpenIntent).toHaveBeenCalledOnce();
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(screen.queryByText(/正在读取|正在准备/)).toBeNull();
  });

  it("opens when hovering anywhere on a card trigger", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false }),
    );

    render(
      <CompatibilityInsightPopover
        fieldLabel="生日"
        insight={{
          ...insight,
          kind: "zodiac",
          title: "处女座 × 摩羯座",
        }}
        triggerVariant="card"
      >
        <div>生日匹配项完整内容</div>
      </CompatibilityInsightPopover>,
    );

    const card = screen.getByRole("button", {
      name: "查看生日匹配说明",
    });
    fireEvent.mouseEnter(card);
    expect(screen.getByText(insight.reason)).not.toBeNull();
  });

  it("toggles the explanation by tap on touch devices", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true }),
    );

    render(
      <CompatibilityInsightPopover
        fieldLabel="MBTI"
        insight={insight}
      >
        MBTI
      </CompatibilityInsightPopover>,
    );

    const trigger = screen.getByRole("button", { name: "查看MBTI匹配说明" });
    fireEvent.click(trigger);
    expect(screen.getByText(insight.reason)).not.toBeNull();
    fireEvent.click(trigger);
    expect(screen.queryByText(insight.reason)).toBeNull();
  });
});
