import { api } from "@/services/api";
import type {
  FieldLibraryItem,
  ProfilePrefillData,
  UpsertFieldLibraryItem,
} from "../types";

const BASE = "/api/user/field-library";

export async function listFieldLibrary(): Promise<{
  success: boolean;
  data?: { fields: FieldLibraryItem[] };
  message?: string;
}> {
  return api.get(BASE);
}

export async function upsertFieldLibrary(
  fields: UpsertFieldLibraryItem[],
): Promise<{
  success: boolean;
  data?: { fields: FieldLibraryItem[] };
  message?: string;
}> {
  return api.post(BASE, { fields });
}

export async function patchFieldLibrary(
  fieldKey: string,
  patch: {
    field_value?: string;
    is_public?: boolean;
    field_label?: string | null;
  },
): Promise<{
  success: boolean;
  data?: { field: FieldLibraryItem };
  message?: string;
}> {
  return api.patch(`${BASE}/${encodeURIComponent(fieldKey)}`, patch);
}

export async function deleteFieldLibraryEntry(
  fieldKey: string,
): Promise<{ success: boolean; message?: string }> {
  return api.delete(`${BASE}/${encodeURIComponent(fieldKey)}`);
}

export async function getProfilePrefill(): Promise<{
  success: boolean;
  data?: ProfilePrefillData;
  message?: string;
}> {
  return api.get("/api/user/profile-prefill");
}
