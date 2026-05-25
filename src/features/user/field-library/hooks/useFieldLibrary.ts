import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteFieldLibraryEntry,
  getProfilePrefill,
  listFieldLibrary,
  patchFieldLibrary,
  upsertFieldLibrary,
} from "../services/fieldLibraryApi";
import type {
  FieldLibraryItem,
  ProfilePrefillData,
  UpsertFieldLibraryItem,
} from "../types";

export const FIELD_LIBRARY_QUERY_KEY = ["user", "field-library"] as const;
export const PROFILE_PREFILL_QUERY_KEY = ["user", "profile-prefill"] as const;

function sortFieldsByUpdatedAt(fields: FieldLibraryItem[]): FieldLibraryItem[] {
  return [...fields].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

function mergeFields(
  current: FieldLibraryItem[] | undefined,
  incoming: FieldLibraryItem[],
): FieldLibraryItem[] {
  const byKey = new Map<string, FieldLibraryItem>();
  for (const field of current ?? []) {
    byKey.set(field.field_key, field);
  }
  for (const field of incoming) {
    byKey.set(field.field_key, field);
  }
  return sortFieldsByUpdatedAt(Array.from(byKey.values()));
}

export function useFieldLibrary() {
  return useQuery<FieldLibraryItem[]>({
    queryKey: FIELD_LIBRARY_QUERY_KEY,
    queryFn: async () => {
      const res = await listFieldLibrary();
      if (!res.success) {
        throw new Error(res.message || "获取信息库失败");
      }
      return res.data?.fields ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useProfilePrefill(enabled: boolean = true) {
  return useQuery<ProfilePrefillData | null>({
    queryKey: PROFILE_PREFILL_QUERY_KEY,
    queryFn: async () => {
      const res = await getProfilePrefill();
      return res.success && res.data ? res.data : null;
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useUpsertFieldLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fields: UpsertFieldLibraryItem[]) =>
      upsertFieldLibrary(fields),
    onSuccess: (res) => {
      if (!res.success) return;
      if (res.data?.fields) {
        qc.setQueryData<FieldLibraryItem[]>(
          FIELD_LIBRARY_QUERY_KEY,
          (current) => mergeFields(current, res.data?.fields ?? []),
        );
      }
      qc.invalidateQueries({ queryKey: FIELD_LIBRARY_QUERY_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_PREFILL_QUERY_KEY });
    },
  });
}

export function usePatchFieldLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      fieldKey: string;
      patch: {
        field_value?: string;
        is_public?: boolean;
        field_label?: string | null;
      };
    }) => patchFieldLibrary(vars.fieldKey, vars.patch),
    onSuccess: (res) => {
      if (!res.success) return;
      if (res.data?.field) {
        qc.setQueryData<FieldLibraryItem[]>(
          FIELD_LIBRARY_QUERY_KEY,
          (current) => mergeFields(current, [res.data!.field]),
        );
      }
      qc.invalidateQueries({ queryKey: FIELD_LIBRARY_QUERY_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_PREFILL_QUERY_KEY });
    },
  });
}

export function useDeleteFieldLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fieldKey: string) => deleteFieldLibraryEntry(fieldKey),
    onSuccess: (res, fieldKey) => {
      if (!res.success) return;
      qc.setQueryData<FieldLibraryItem[]>(
        FIELD_LIBRARY_QUERY_KEY,
        (current) => (current ?? []).filter((field) => field.field_key !== fieldKey),
      );
      qc.invalidateQueries({ queryKey: FIELD_LIBRARY_QUERY_KEY });
      qc.invalidateQueries({ queryKey: PROFILE_PREFILL_QUERY_KEY });
    },
  });
}
