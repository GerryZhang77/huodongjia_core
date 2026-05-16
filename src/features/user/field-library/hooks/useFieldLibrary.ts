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

const LIBRARY_KEY = ["user", "field-library"] as const;
const PREFILL_KEY = ["user", "profile-prefill"] as const;

export function useFieldLibrary() {
  return useQuery<FieldLibraryItem[]>({
    queryKey: LIBRARY_KEY,
    queryFn: async () => {
      const res = await listFieldLibrary();
      return res.success ? (res.data?.fields ?? []) : [];
    },
    staleTime: 60 * 1000,
  });
}

export function useProfilePrefill(enabled: boolean = true) {
  return useQuery<ProfilePrefillData | null>({
    queryKey: PREFILL_KEY,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIBRARY_KEY });
      qc.invalidateQueries({ queryKey: PREFILL_KEY });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIBRARY_KEY });
      qc.invalidateQueries({ queryKey: PREFILL_KEY });
    },
  });
}

export function useDeleteFieldLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fieldKey: string) => deleteFieldLibraryEntry(fieldKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIBRARY_KEY });
      qc.invalidateQueries({ queryKey: PREFILL_KEY });
    },
  });
}
