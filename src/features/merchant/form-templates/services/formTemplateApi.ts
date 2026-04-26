import { api } from "@/services/api";
import type {
  CreateFormTemplateRequest,
  FormTemplate,
  FormTemplateMutationResponse,
  FormTemplateType,
  ListFormTemplatesResponse,
} from "../types";

const BASE = "/api/merchant/form-templates";

export async function listFormTemplates(
  type?: FormTemplateType,
): Promise<ListFormTemplatesResponse> {
  return api.get(BASE, { params: type ? { type } : undefined });
}

export async function createFormTemplate(
  payload: CreateFormTemplateRequest,
): Promise<FormTemplateMutationResponse> {
  return api.post(BASE, payload);
}

export async function updateFormTemplate(
  id: string,
  patch: Partial<Pick<FormTemplate, "name" | "schema">>,
): Promise<FormTemplateMutationResponse> {
  return api.put(`${BASE}/${id}`, patch);
}

export async function deleteFormTemplate(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  return api.delete(`${BASE}/${id}`);
}
