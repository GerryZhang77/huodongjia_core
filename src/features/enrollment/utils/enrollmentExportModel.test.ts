import { describe, expect, it } from "vitest";
import type { Enrollment } from "@/types/enrollment";
import {
  buildEnrollmentExportRow,
  collectEnrollmentExportFields,
  DEFAULT_ENROLLMENT_EXPORT_FIELDS,
  getEnrollmentExportGender,
  getEnrollmentExportName,
} from "./enrollmentExportModel";

function createEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: "enrollment-1",
    activityId: "event-1",
    name: "用户资料姓名",
    profileName: "用户资料姓名",
    status: "approved",
    enrolledAt: "2026-08-13T00:00:00.000Z",
    ...overrides,
  };
}

describe("enrollment export model", () => {
  it("exports the submitted form name before the profile name", () => {
    const enrollment = createEnrollment({
      formName: "后端表单姓名",
      formAnswers: { name: "本次报名姓名", gender: "女" },
      formData: { 姓名: "历史姓名", 性别: "男" },
      formSchemaSnapshot: [
        { key: "name", label: "姓名", type: "text" },
        { key: "gender", label: "性别", type: "radio" },
      ],
    });

    expect(getEnrollmentExportName(enrollment)).toBe("本次报名姓名");
    expect(getEnrollmentExportGender(enrollment)).toBe("女");
  });

  it("resolves custom stable keys by their schema labels", () => {
    const enrollment = createEnrollment({
      formAnswers: {
        custom_name_key: "稳定键姓名",
        custom_gender_key: "男性",
        custom_company_key: "活动家",
        custom_orphan_key: "不能显示技术键",
      },
      formSchemaSnapshot: [
        { key: "custom_name_key", label: "姓名", type: "text" },
        { key: "custom_gender_key", label: "性别", type: "radio" },
        { key: "custom_company_key", label: "工作单位", type: "text" },
      ],
    });
    const fields = [
      ...DEFAULT_ENROLLMENT_EXPORT_FIELDS.filter((field) =>
        ["name", "gender"].includes(field.key),
      ),
      ...collectEnrollmentExportFields([enrollment]),
    ];
    const row = buildEnrollmentExportRow(enrollment, 0, fields);

    expect(row.姓名).toBe("稳定键姓名");
    expect(row.性别).toBe("男");
    expect(row.工作单位).toBe("活动家");
    expect(fields.filter((field) => field.label === "姓名")).toHaveLength(1);
    expect(fields.filter((field) => field.label === "性别")).toHaveLength(1);
    expect(fields.some((field) => field.label === "custom_orphan_key")).toBe(false);
  });

  it("falls back to legacy Chinese labels without duplicating reserved columns", () => {
    const enrollment = createEnrollment({
      formAnswers: {},
      formData: { 姓名: "历史报名姓名", 性别: "男", 兴趣爱好: ["徒步", "摄影"] },
    });
    const fields = [
      ...DEFAULT_ENROLLMENT_EXPORT_FIELDS.filter((field) =>
        ["name", "gender"].includes(field.key),
      ),
      ...collectEnrollmentExportFields([enrollment]),
    ];
    const row = buildEnrollmentExportRow(enrollment, 0, fields);

    expect(row.姓名).toBe("历史报名姓名");
    expect(row.性别).toBe("男");
    expect(row.兴趣爱好).toBe("徒步、摄影");
    expect(fields.filter((field) => field.label === "姓名")).toHaveLength(1);
    expect(fields.filter((field) => field.label === "性别")).toHaveLength(1);
  });

  it("keeps stable-key values after a custom field label is renamed", () => {
    const enrollment = createEnrollment({
      formAnswers: { custom_company_key: "活动家" },
      formData: { 原单位名称: "旧值" },
      formSchemaSnapshot: [
        { key: "custom_company_key", label: "新单位名称", type: "text" },
      ],
    });
    const fields = collectEnrollmentExportFields([enrollment]);
    const row = buildEnrollmentExportRow(enrollment, 0, fields);

    expect(row.新单位名称).toBe("活动家");
  });
});
