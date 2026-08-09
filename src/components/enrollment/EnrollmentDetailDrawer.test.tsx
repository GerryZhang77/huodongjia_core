import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Enrollment } from "@/types/enrollment";
import EnrollmentDetailDrawer from "./EnrollmentDetailDrawer";

vi.mock("@/features/activities/hooks/useActivityDetail", () => ({
  useActivityDetail: () => ({ activity: null }),
}));

const pendingEnrollment: Enrollment = {
  id: "enrollment-1",
  activityId: "activity-1",
  name: "测试用户",
  status: "pending",
  enrolledAt: "2026-08-09T00:00:00.000Z",
  formData: { 姓名: "测试用户" },
  imageCount: 0,
};

describe("EnrollmentDetailDrawer", () => {
  it("keeps pending review actions above the mobile tab bar", () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <EnrollmentDetailDrawer
        visible
        activityId="activity-1"
        enrollment={pendingEnrollment}
        onClose={vi.fn()}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "报名详情" });
    expect(dialog.parentElement?.className).toContain("z-[60]");
    expect(dialog.className).toContain("h-[85dvh]");

    const approveButton = screen.getByRole("button", { name: "通过" });
    const rejectButton = screen.getByRole("button", { name: "拒绝" });
    const footer = approveButton.closest("footer");
    expect(footer?.className).toContain("shrink-0");
    expect(footer?.className).toContain("safe-area-pb");
    expect(footer?.className).not.toContain("absolute");

    fireEvent.click(approveButton);
    fireEvent.click(rejectButton);
    expect(onApprove).toHaveBeenCalledWith("enrollment-1");
    expect(onReject).toHaveBeenCalledWith("enrollment-1");
  });
});
