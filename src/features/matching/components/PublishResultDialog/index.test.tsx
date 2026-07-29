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

    fireEvent.click(screen.getByRole("button", { name: "确认发布" }));

    expect(onConfirm).toHaveBeenCalledWith(true, {
      channels: ["inApp"],
      content:
        "您好！活动匹配结果已出炉，快来查看您的分组信息吧。期待与您的小伙伴们相遇！",
    });
  });
});
