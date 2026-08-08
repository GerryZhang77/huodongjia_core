import { describe, expect, it } from "vitest";
import {
  getIdentityCardFieldError,
  inspectIdentityCard,
  isIdentityCardField,
} from "./identityCard";

describe("identity-card validation", () => {
  it("recognizes dynamic identity fields by key or label", () => {
    expect(isIdentityCardField({ key: "id_card", label: "证件" })).toBe(true);
    expect(isIdentityCardField({ key: "credential_no", label: "公民身份号码" })).toBe(true);
    expect(isIdentityCardField({ key: "company", label: "公司" })).toBe(false);
  });

  it("distinguishes valid, missing and invalid-checksum values", () => {
    expect(inspectIdentityCard("")).toEqual({ status: "missing" });
    expect(inspectIdentityCard("11010519491231002X")).toEqual({ status: "valid" });
    expect(inspectIdentityCard("430626199609175810")).toEqual({ status: "valid" });
    expect(inspectIdentityCard("110105194912310021")).toEqual({
      status: "invalid",
      reason: "checksum",
    });
  });

  it("rejects numeric identity values before reporting a misleading checksum error", () => {
    expect(inspectIdentityCard(430626199609175810)).toEqual({
      status: "invalid",
      reason: "precision_loss",
    });
    expect(
      getIdentityCardFieldError(
        { key: "credential_no", label: "公民身份号码" },
        430626199609175810,
      ),
    ).toBe("身份证号码曾被按数字处理，内容可能已失真，请清空后重新输入");
  });

  it("returns a user-facing field error only for identity fields", () => {
    expect(
      getIdentityCardFieldError(
        { key: "credential_no", label: "公民身份号码" },
        "110105194912310021",
      ),
    ).toBe("身份证号码校验位不正确，请检查后重新输入");
    expect(
      getIdentityCardFieldError(
        { key: "bio", label: "个人简介" },
        "110105194912310021",
      ),
    ).toBeNull();
  });
});
