import type {
  ActivityRegistrationType,
  RegistrationFormField,
} from "../../types";

const REQUIRED_PHONE_FIELD: RegistrationFormField = {
  key: "phone",
  label: "手机号",
  type: "text",
  required: true,
  preset: true,
  deletable: false,
  placeholder: "请输入手机号",
};

const DEFAULT_FORM_SCHEMA: RegistrationFormField[] = [
  {
    key: "name",
    label: "姓名",
    type: "text",
    required: false,
    preset: true,
    deletable: true,
    placeholder: "请输入姓名",
  },
  {
    ...REQUIRED_PHONE_FIELD,
  },
  {
    key: "gender",
    label: "性别",
    type: "radio",
    required: false,
    preset: true,
    deletable: true,
    options: ["男", "女"],
  },
];

export const ensureRequiredPhoneField = (
  schema?: RegistrationFormField[] | null,
): RegistrationFormField[] => {
  const fields: RegistrationFormField[] = (schema || []).map((field) => ({
    ...field,
    options: field.options ? [...field.options] : undefined,
  }));
  const phoneIndex = fields.findIndex(
    (field) =>
      field.key.trim().toLowerCase() === "phone" ||
      ["手机号", "手机号码", "联系电话"].includes(field.label.trim()),
  );
  const phoneField: RegistrationFormField =
    phoneIndex >= 0
      ? { ...fields[phoneIndex], ...REQUIRED_PHONE_FIELD }
      : { ...REQUIRED_PHONE_FIELD };

  if (phoneIndex >= 0) {
    fields[phoneIndex] = phoneField;
    return fields;
  }

  const nameIndex = fields.findIndex(
    (field) => field.key.trim().toLowerCase() === "name",
  );
  fields.splice(nameIndex >= 0 ? nameIndex + 1 : 0, 0, phoneField);
  return fields;
};

export const createDefaultFormSchema = (): RegistrationFormField[] =>
  ensureRequiredPhoneField(DEFAULT_FORM_SCHEMA);

export const createDefaultRegistrationTypes = (): ActivityRegistrationType[] => [
  {
    name: "",
    formSchema: createDefaultFormSchema(),
    eligibilityMode: "public",
    isDefault: true,
    matchEnabled: true,
    sortOrder: 0,
    members: [],
  },
];
