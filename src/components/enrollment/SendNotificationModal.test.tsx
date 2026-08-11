import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Enrollment } from "@/types/enrollment";
import SendNotificationModal from "./SendNotificationModal";

const apiMocks = vi.hoisted(() => ({
  preview: vi.fn(),
  send: vi.fn(),
}));

vi.mock("@/features/enrollment/services/enrollmentNotificationApi", () => ({
  previewEnrollmentNotification: apiMocks.preview,
  sendEnrollmentNotification: apiMocks.send,
}));

const enrollments: Enrollment[] = [
  {
    id: "enrollment-1",
    activityId: "activity-1",
    name: "张三",
    phone: "13800138000",
    status: "approved",
    registrationTypeName: "普通报名",
    enrolledAt: "2026-08-10T00:00:00.000Z",
  },
  {
    id: "enrollment-2",
    activityId: "activity-1",
    name: "李四",
    status: "pending",
    registrationTypeName: "嘉宾",
    enrolledAt: "2026-08-10T00:00:00.000Z",
  },
];

const recipients = [
  {
    enrollment_id: "enrollment-1",
    name: "张三",
    masked_phone: "138****8000",
    status: "approved",
    registration_type: "普通报名",
    eligibility: {
      in_app: { eligible: true },
      sms: { eligible: true },
    },
  },
  {
    enrollment_id: "enrollment-2",
    name: "李四",
    masked_phone: null,
    status: "pending",
    registration_type: "嘉宾",
    eligibility: {
      in_app: { eligible: true },
      sms: { eligible: false, reason: "PHONE_UNVERIFIED_OR_INVALID" },
    },
  },
];

const makePreview = (ids: string[], channels: string[]) => {
  const selected = recipients.filter((recipient) => ids.includes(recipient.enrollment_id));
  const smsEligible = selected.filter((recipient) => recipient.eligibility.sms.eligible).length;
  const smsSkipped = selected.length - smsEligible;
  return {
    selected_count: selected.length,
    recipients: selected,
    channels: {
      in_app: {
        available: true as const,
        eligible_count: channels.includes("in_app") ? selected.length : 0,
        skipped_count: 0,
      },
      sms: {
        available: true,
        eligible_count: channels.includes("sms") ? smsEligible : 0,
        skipped_count: channels.includes("sms") ? smsSkipped : 0,
        invalid_phone_count: channels.includes("sms") ? smsSkipped : 0,
        sms_disabled_count: 0,
      },
    },
    skipped_count: channels.includes("sms") ? smsSkipped : 0,
    skip_reasons: channels.includes("sms") && smsSkipped > 0
      ? [{
          channel: "sms" as const,
          code: "PHONE_UNVERIFIED_OR_INVALID",
          label: "没有已验证的有效手机号",
          count: smsSkipped,
        }]
      : [],
  };
};

describe("SendNotificationModal", () => {
  beforeEach(() => {
    apiMocks.preview.mockReset();
    apiMocks.send.mockReset();
    apiMocks.preview.mockImplementation(({ enrollmentIds, channels }) =>
      Promise.resolve(makePreview(enrollmentIds, channels)));
    apiMocks.send.mockResolvedValue({
      selected_count: 2,
      in_app_success_count: 2,
      sms_queued_count: 1,
      skipped_count: 1,
      channel_stats: {
        in_app: { success_count: 2, skipped_count: 0 },
        sms: { queued_count: 1, skipped_count: 1 },
      },
      skip_reasons: [{
        channel: "sms",
        code: "PHONE_UNVERIFIED_OR_INVALID",
        label: "没有已验证的有效手机号",
        count: 1,
      }],
      idempotent_replay: false,
    });
  });

  it("restores selected rows, supports filtered selection, channel counts and exact send ids", async () => {
    render(
      <SendNotificationModal
        visible
        activityId="activity-1"
        activityTitle="测试活动"
        enrollments={enrollments}
        selectedIds={["enrollment-2"]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getAllByText("已选择 1 人").length).toBeGreaterThan(0);
    await waitFor(() => expect(apiMocks.preview).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /接收对象/ }));
    expect(screen.getByText("李四")).toBeTruthy();
    expect(screen.getByText("无有效手机号")).toBeTruthy();
    expect(screen.getByText("嘉宾")).toBeTruthy();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "张三" } });
    await waitFor(() => expect(screen.getByText("当前筛选 1 人")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "全选当前筛选结果" }));
    expect(screen.getAllByText("已选择 2 人").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "短信通知" }));
    expect(screen.getByText("固定报名状态短信")).toBeTruthy();
    expect(screen.getByText("短信预计接收").parentElement?.textContent).toContain("1 人");
    expect(screen.getByText(/无有效手机号 1 人/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "核对并发送" }));
    await waitFor(() => expect(screen.getByText("确认发送通知")).toBeTruthy());
    expect(screen.getByText((_, element) =>
      element?.tagName === "P"
      && element.textContent?.replace(/\s+/g, " ").trim()
        === "将向 2 人发送站内通知， 向 1 人发送短信，预计跳过 1 人。",
    )).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "确认发送" }));
    await waitFor(() => expect(apiMocks.send).toHaveBeenCalledTimes(1));
    expect(apiMocks.send.mock.calls[0][0]).toMatchObject({
      eventId: "activity-1",
      enrollmentIds: ["enrollment-2", "enrollment-1"],
      channels: ["in_app", "sms"],
      inApp: {
        title: "活动通知 - 测试活动",
        message: "您报名的活动即将开始，请准时参加！",
      },
    });
    await waitFor(() => expect(screen.getByText("通知处理完成")).toBeTruthy());
    expect(screen.getByText("短信入队").parentElement?.textContent).toContain("1");
    expect(screen.getByText("跳过原因").parentElement?.textContent).toContain("没有已验证的有效手机号");
  });

  it("shows the concrete reason when SMS is unavailable", async () => {
    apiMocks.preview.mockResolvedValue({
      ...makePreview(["enrollment-1"], ["in_app", "sms"]),
      channels: {
        ...makePreview(["enrollment-1"], ["in_app", "sms"]).channels,
        sms: {
          available: false,
          reason_code: "SMS_TEMPLATE_NOT_CONFIGURED",
          reason: "修正版报名状态短信模板尚未审核或配置",
          eligible_count: 0,
          skipped_count: 1,
          invalid_phone_count: 0,
          sms_disabled_count: 0,
        },
      },
    });

    render(
      <SendNotificationModal
        visible
        activityId="activity-1"
        enrollments={enrollments.slice(0, 1)}
        selectedIds={["enrollment-1"]}
        onClose={vi.fn()}
      />,
    );

    expect(await screen.findByText(/修正版报名状态短信模板尚未审核或配置/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "短信通知" }).getAttribute("aria-disabled")).toBe("true");
  });
});
