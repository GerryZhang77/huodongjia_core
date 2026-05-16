/**
 * 用户"个人信息库"类型定义
 *
 * 个人信息库保存用户在报名表单中曾经填写过的字段（key/value），
 * 下次报名时自动预填同名/同义字段，避免重复输入。
 * 用户可选择把某条字段标记为对外公开（出现在他人查看的 profile 上）。
 */

export interface FieldLibraryItem {
  id: string;
  field_key: string;
  field_label: string | null;
  field_value: string;
  field_type: string;
  is_public: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrefillField {
  field_key: string;
  field_label: string | null;
  field_value: string;
  field_type: string;
  is_public: boolean;
  source: "profile" | "library";
}

export interface ProfilePrefillData {
  fields: PrefillField[];
  /** 标准 key -> 别名列表，用于在 schema 字段匹配时做反向查找 */
  aliases: Record<string, string[]>;
}

export interface UpsertFieldLibraryItem {
  field_key: string;
  field_label?: string;
  field_value: string;
  field_type?: string;
  is_public?: boolean;
}
