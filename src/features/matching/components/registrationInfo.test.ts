import { describe, expect, it } from "vitest";
import {
  buildRegistrationInfoItems,
  isPrivateMatchingRegistrationField,
} from "./registrationInfo";

describe("matching registration privacy", () => {
  it("hides direct identity and contact fields from matching configuration", () => {
    expect(isPrivateMatchingRegistrationField("name", "姓名")).toBe(true);
    expect(isPrivateMatchingRegistrationField("phone", "手机号")).toBe(true);
    expect(isPrivateMatchingRegistrationField("credential_no", "身份证号")).toBe(true);
    expect(isPrivateMatchingRegistrationField("gender", "性别")).toBe(false);
    expect(isPrivateMatchingRegistrationField("skills", "技能")).toBe(false);
  });

  it("keeps non-sensitive registration details while omitting raw identity values", () => {
    expect(
      buildRegistrationInfoItems({
        姓名: "测试用户",
        手机号: "13800000000",
        身份证号: "11010519491231002X",
        技能: "产品设计",
      }),
    ).toEqual([{ label: "技能", value: "产品设计", tags: null }]);
  });
});
