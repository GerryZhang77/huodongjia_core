import type {
  ActivityRegistrationType,
  RegistrationFormField,
} from "../../types";

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
    key: "phone",
    label: "手机号",
    type: "text",
    required: false,
    preset: true,
    deletable: true,
    placeholder: "请输入手机号",
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

export const createDefaultFormSchema = (): RegistrationFormField[] =>
  DEFAULT_FORM_SCHEMA.map((field) => ({
    ...field,
    options: field.options ? [...field.options] : undefined,
  }));

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
