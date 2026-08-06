import { describe, expect, it } from "vitest";
import type { RegistrationFormField } from "../types";
import {
  findInvalidRegistrationFieldIndex,
  getParticipantVisibleRegistrationFields,
  normalizeRegistrationFieldForMerchant,
} from "./registrationFormFields";

const technicalField: RegistrationFormField = {
  key: "custom_d892ad5a-11be-4e2e-9ab3-f046d84a0a18",
  label: "custom_d892ad5a-11be-4e2e-9ab3-f046d84a0a18",
  type: "text",
  required: false,
  preset: false,
};

describe("registration form field visibility", () => {
  it("turns a historical technical fallback into an unnamed merchant field", () => {
    expect(normalizeRegistrationFieldForMerchant(technicalField).label).toBe("");
    expect(
      findInvalidRegistrationFieldIndex([
        { ...technicalField, key: "name", label: "姓名" },
        technicalField,
      ]),
    ).toBe(1);
  });

  it("does not expose technical fallback fields to participants", () => {
    expect(
      getParticipantVisibleRegistrationFields([
        { ...technicalField, key: "name", label: "姓名" },
        technicalField,
      ]).map((field) => field.key),
    ).toEqual(["name"]);
  });
});

