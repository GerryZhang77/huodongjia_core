import { describe, expect, it } from "vitest";
import { getActivityCapacityPresentation } from "./activityDetailPresentation";

describe("getActivityCapacityPresentation", () => {
  it("formats a finite capacity as a compact quota label", () => {
    expect(getActivityCapacityPresentation(45, 60)).toEqual({
      label: "名额 45/60",
      isFull: false,
    });
  });

  it("marks a capacity as full when enrollment reaches the limit", () => {
    expect(getActivityCapacityPresentation(60, 60)).toEqual({
      label: "名额 60/60 · 已满",
      isFull: true,
    });
  });

  it("uses an unlimited label when no maximum is configured", () => {
    expect(getActivityCapacityPresentation(18, 0)).toEqual({
      label: "名额不限",
      isFull: false,
    });
  });
});
