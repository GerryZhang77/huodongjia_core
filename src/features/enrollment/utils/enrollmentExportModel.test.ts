import { describe, expect, it } from "vitest";
import type { Enrollment } from "@/types/enrollment";
import {
  buildEnrollmentExportFields,
  buildEnrollmentExportRow,
  collectEnrollmentExportFields,
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
    const fields = buildEnrollmentExportFields([enrollment]);
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
    const fields = buildEnrollmentExportFields([enrollment]);
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

  it("only offers system fields and fields that belong to the registration form", () => {
    const enrollment = createEnrollment({
      registrationTypeId: "type-1",
      registrationTypeName: "普通报名",
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
    });

    const fields = buildEnrollmentExportFields([enrollment]);
    const labels = fields.map((field) => field.label);
    const row = buildEnrollmentExportRow(enrollment, 0, fields);

    expect(labels).toEqual([
      "序号",
      "姓名",
      "手机号",
      "工作单位名称",
      "兴趣爱好",
      "报名类型",
      "状态",
      "报名时间",
    ]);
    expect(labels).not.toEqual(expect.arrayContaining([
      "年龄",
      "邮箱",
      "职业",
      "公司",
      "城市",
      "兴趣标签",
      "个人简介",
      "匹配需求",
    ]));
    expect(row.工作单位名称).toBe("活动家");
    expect(row.兴趣爱好).toBe("徒步、摄影");
  });

  it("uses current schemas only for registration types represented in the export", () => {
    const enrollment = createEnrollment({
      registrationTypeId: "guest",
      registrationTypeName: "嘉宾",
      formAnswers: { name: "嘉宾姓名" },
      formSchemaSnapshot: [{ key: "name", label: "姓名", type: "text" }],
    });

    const fields = buildEnrollmentExportFields([enrollment], {
      registrationTypes: [
        {
          id: "guest",
          name: "嘉宾",
          formSchema: [
            { key: "name", label: "姓名", type: "text" },
            { key: "guest_title", label: "嘉宾头衔", type: "text" },
          ],
        },
        {
          id: "media",
          name: "媒体",
          formSchema: [{ key: "media_name", label: "媒体名称", type: "text" }],
        },
      ],
    });

    expect(fields.map((field) => field.label)).toContain("嘉宾头衔");
    expect(fields.map((field) => field.label)).not.toContain("媒体名称");
  });

  it("merges renamed stable keys and same-label fields without duplicate columns", () => {
    const first = createEnrollment({
      id: "enrollment-1",
      formAnswers: { company_key: "旧单位" },
      formSchemaSnapshot: [
        { key: "company_key", label: "原单位名称", type: "text" },
      ],
    });
    const second = createEnrollment({
      id: "enrollment-2",
      formAnswers: { company_key: "新单位" },
      formSchemaSnapshot: [
        { key: "company_key", label: "单位名称", type: "text" },
      ],
    });

    const fields = buildEnrollmentExportFields([first, second], {
      registrationFormSchema: [
        { key: "company_key", label: "当前单位名称", type: "text" },
      ],
    });
    const formFields = fields.filter((field) => field.source === "form");

    expect(formFields).toHaveLength(1);
    expect(formFields[0].label).toBe("当前单位名称");
    expect(buildEnrollmentExportRow(first, 0, fields).当前单位名称).toBe("旧单位");
    expect(buildEnrollmentExportRow(second, 1, fields).当前单位名称).toBe("新单位");
  });

  it("does not expose image or orphaned technical keys as export columns", () => {
    const enrollment = createEnrollment({
      formAnswers: {
        custom_photo: ["private/image.jpg"],
        custom_orphan: "orphan",
      },
      formData: { 生活照: "private/legacy-image.jpg" },
      formSchemaSnapshot: [
        { key: "custom_photo", label: "生活照", type: "image" },
        { key: "custom_blank_label", label: "", type: "text" },
      ],
    });

    expect(collectEnrollmentExportFields([enrollment])).toEqual([]);
  });
});
