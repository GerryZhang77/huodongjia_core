import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Enrollment } from "@/types/enrollment";
import ExportEnrollmentModal from "./ExportEnrollmentModal";

describe("ExportEnrollmentModal", () => {
  it("shows actual registration fields without unrelated profile columns", () => {
    const enrollment: Enrollment = {
      id: "enrollment-1",
      activityId: "event-1",
      userId: "user-1",
      name: "报名姓名",
      registrationTypeId: "type-1",
      registrationTypeName: "青年报名",
      formAnswers: {
        name: "报名姓名",
        phone: "13800000000",
        custom_company: "活动家",
        custom_interests: ["徒步", "摄影"],
      },
      formSchemaSnapshot: [
        { key: "name", label: "姓名", type: "text" },
        { key: "phone", label: "手机号", type: "text" },
        { key: "custom_company", label: "工作单位名称", type: "text" },
        { key: "custom_interests", label: "兴趣爱好", type: "multi-select" },
      ],
      status: "approved",
      enrolledAt: "2026-08-13T00:00:00.000Z",
    };

    render(
      <ExportEnrollmentModal
        visible
        activityId="event-1"
        activityTitle="测试活动"
        enrollments={[enrollment]}
        registrationTypes={[
          {
            id: "type-1",
            name: "青年报名",
            formSchema: enrollment.formSchemaSnapshot,
          },
        ]}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByText("报名表字段")).toBeTruthy();
    expect(screen.getByText("系统字段")).toBeTruthy();
    expect(screen.getByRole("button", { name: /工作单位名称/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /兴趣爱好/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /邮箱/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^职业$/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /兴趣标签/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^公司$/ })).toBeNull();
  });
});
