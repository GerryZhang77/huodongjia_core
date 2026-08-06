import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PublishResultDialog } from "./index";

describe("PublishResultDialog", () => {
  it("only exposes the implemented in-app notification channel", () => {
    const onConfirm = vi.fn();
    render(
      <PublishResultDialog
        visible
        groups={[
          {
            id: "result-1",
            members: ["owner", "candidate"],
            isLocked: false,
          },
        ]}
        participantCount={1}
        participants={[
          {
            id: "owner",
            enrollmentId: "owner-enrollment",
            name: "参与者甲",
          },
        ]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("站内通知")).not.toBeNull();
    expect(screen.queryByText("短信通知")).toBeNull();
    expect(screen.queryByText("邮件通知")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "发布并通知 1 人" }),
    );

    expect(onConfirm).toHaveBeenCalledWith(true, {
      channels: ["inApp"],
      content:
        "您好！活动匹配结果已出炉，快来查看您的分组信息吧。期待与您的小伙伴们相遇！",
      recipientEnrollmentIds: ["owner-enrollment"],
    });
  });

  it("defaults to all recipients and allows clearing the selection", () => {
    const onConfirm = vi.fn();
    const participants = [
      { id: "a", enrollmentId: "enrollment-a", name: "参与者甲" },
      { id: "b", enrollmentId: "enrollment-b", name: "参与者乙" },
    ];
    const { rerender } = render(
      <PublishResultDialog
        visible
        groups={[]}
        participantCount={2}
        participants={participants}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("已选 2/2")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "取消全选" }));
    expect(screen.getByText("已选 0/2")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "仅发布结果" }));
    expect(onConfirm).toHaveBeenCalledWith(false);

    rerender(
      <PublishResultDialog
        visible={false}
        groups={[]}
        participantCount={2}
        participants={participants}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    rerender(
      <PublishResultDialog
        visible
        groups={[]}
        participantCount={2}
        participants={participants}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("已选 2/2")).not.toBeNull();
  });

  it("allows selecting notification recipients one by one", () => {
    const onConfirm = vi.fn();
    render(
      <PublishResultDialog
        visible
        groups={[]}
        participantCount={2}
        participants={[
          { id: "a", enrollmentId: "enrollment-a", name: "参与者甲" },
          { id: "b", enrollmentId: "enrollment-b", name: "参与者乙" },
        ]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "查看并选择人员" }),
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: "取消选择参与者甲" }),
    );

    expect(screen.getByText("已选 1/2")).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "发布并通知 1 人" }),
    );

    expect(onConfirm).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        recipientEnrollmentIds: ["enrollment-b"],
      }),
    );
  });
});
