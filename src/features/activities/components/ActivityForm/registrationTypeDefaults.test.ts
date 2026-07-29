import { describe, expect, it } from "vitest";
import {
  createDefaultFormSchema,
  ensureRequiredPhoneField,
} from "./registrationTypeDefaults";

describe("registration form phone identity field", () => {
  it("keeps phone required and non-deletable in new forms", () => {
    const phone = createDefaultFormSchema().find(
      (field) => field.key === "phone",
    );

    expect(phone).toMatchObject({
      key: "phone",
      label: "手机号",
      type: "text",
      required: true,
      preset: true,
      deletable: false,
    });
  });

  it("repairs legacy optional or renamed phone fields without duplicates", () => {
    const schema = ensureRequiredPhoneField([
      {
        key: "mobile",
        label: "手机号码",
        type: "textarea",
        required: false,
        preset: false,
        deletable: true,
      },
    ]);

    expect(schema).toHaveLength(1);
    expect(schema[0]).toMatchObject({
      key: "phone",
      label: "手机号",
      type: "text",
      required: true,
      preset: true,
      deletable: false,
    });
  });
});
