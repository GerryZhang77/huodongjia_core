import { describe, expect, it } from "vitest";
import { buildRegistrationInfoItems } from "../src/features/matching/components/registrationInfo";

describe("buildRegistrationInfoItems", () => {
  it("keeps useful registration answers and removes sensitive, duplicate, and empty fields", () => {
    const items = buildRegistrationInfoItems({
      姓名: "张三",
      手机号: "13800000000",
      email: "zhangsan@example.com",
      微信号: "secret-wechat",
      身份证号: "110101199001011234",
      学号: "20260001",
      参会目的: "寻找产品合作伙伴",
      兴趣爱好: ["徒步", "摄影"],
      个人简介: "",
      是否愿意分享: false,
    });

    expect(items).toEqual([
      { label: "参会目的", value: "寻找产品合作伙伴", tags: null },
      { label: "兴趣爱好", value: "徒步、摄影", tags: ["徒步", "摄影"] },
      { label: "是否愿意分享", value: "否", tags: null },
    ]);
  });

  it("formats objects and removes null-like answers", () => {
    expect(buildRegistrationInfoItems({
      可参与时段: { 周六: true, 周日: false },
      备注: null,
      附件: [],
    })).toEqual([
      { label: "可参与时段", value: "周六：是；周日：否", tags: null },
    ]);
  });

  it("uses schema labels and filters sensitive custom fields by label", () => {
    expect(buildRegistrationInfoItems(
      {
        custom_1770000000001: "12345678",
        custom_1770000000002: "寻找投资人",
      },
      {
        custom_1770000000001: "QQ号",
        custom_1770000000002: "本次参会目标",
      },
    )).toEqual([
      { label: "本次参会目标", value: "寻找投资人", tags: null },
    ]);
  });
});
