/**
 * 商家表单模板类型
 *
 * 当前覆盖两类：
 * - registration_form: 与 ActivityFormData.registration_form_schema 同结构
 *   （RegistrationFormField[]）
 * - requirements: 与 ActivityFormData.requirements 同结构（字符串/JSON 字符串数组）
 */

import type { RegistrationFormField } from "@/features/activities/types";

export type FormTemplateType = "registration_form" | "requirements";

export interface FormTemplate {
  id: string;
  name: string;
  type: FormTemplateType;
  /**
   * 注意：后端原样存 JSONB；前端按 type 解释
   * - registration_form: RegistrationFormField[]
   * - requirements: string（JSON 字符串数组），与现有字段保持一致
   */
  schema: RegistrationFormField[] | string;
  created_at: string;
  updated_at: string;
}

export interface ListFormTemplatesResponse {
  success: boolean;
  data?: { templates: FormTemplate[] };
  message?: string;
}

export interface CreateFormTemplateRequest {
  name: string;
  type: FormTemplateType;
  schema: RegistrationFormField[] | string;
}

export interface FormTemplateMutationResponse {
  success: boolean;
  data?: { template: FormTemplate };
  message?: string;
}

export const FORM_TEMPLATE_TYPE_LABELS: Record<FormTemplateType, string> = {
  registration_form: "报名信息收集",
  requirements: "参与要求",
};
