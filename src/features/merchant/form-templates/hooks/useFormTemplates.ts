import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFormTemplate,
  deleteFormTemplate,
  listFormTemplates,
  updateFormTemplate,
} from "../services/formTemplateApi";
import type {
  CreateFormTemplateRequest,
  FormTemplate,
  FormTemplateType,
} from "../types";

const ROOT_KEY = ["merchant", "form-templates"] as const;
export const formTemplatesKey = (type?: FormTemplateType) =>
  type ? ([...ROOT_KEY, type] as const) : ROOT_KEY;

export function useFormTemplates(type?: FormTemplateType) {
  return useQuery<FormTemplate[]>({
    queryKey: formTemplatesKey(type),
    queryFn: async () => {
      const res = await listFormTemplates(type);
      return res.success ? (res.data?.templates ?? []) : [];
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateFormTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFormTemplateRequest) =>
      createFormTemplate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOT_KEY });
    },
  });
}

export function useUpdateFormTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      patch: Partial<Pick<FormTemplate, "name" | "schema">>;
    }) => updateFormTemplate(vars.id, vars.patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOT_KEY });
    },
  });
}

export function useDeleteFormTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFormTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROOT_KEY });
    },
  });
}
