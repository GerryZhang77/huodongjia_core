/**
 * 导入报名模态框组件 (优化版)
 * 支持 Excel 文件解析、智能字段映射、映射记忆、数据预览
 */

import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Loader2,
  Search,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import * as XLSX from "xlsx";
import { useAuthStore } from "@/features/auth/stores";
import type {
  ActivityRegistrationType,
  RegistrationFormField,
} from "@/features/activities/types";
import {
  findUnsafeSpreadsheetIntegerCells,
  getUnsafeSpreadsheetIntegerMessage,
} from "@/features/enrollment/utils/spreadsheetImport";

// ========================================
// 类型定义
// ========================================

interface ImportEnrollmentModalProps {
  visible: boolean;
  activityId: string;
  registrationTypes?: ActivityRegistrationType[];
  registrationFormSchema?: RegistrationFormField[] | null;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedRow {
  [key: string]: string | number | undefined;
}

interface FieldImportAction {
  sourceField: string;
  action: "map" | "keep" | "ignore";
  targetField?: string;
}

interface TargetField {
  key: string;
  label: string;
  required: boolean;
}

type ImportPreviewAction =
  | "create"
  | "update"
  | "unchanged"
  | "missing"
  | "invalid"
  | "conflict";

interface ImportPreviewDiffField {
  field: string;
  type: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
}

interface ImportPreviewItem {
  rowNumber?: number;
  action: ImportPreviewAction;
  identityKey?: string;
  identitySource?: string;
  identityLabel?: string;
  identityValue?: string;
  displayIdentityLabel?: string;
  displayIdentityValue?: string;
  name: string;
  diffFields: ImportPreviewDiffField[];
  reason?: string;
  duplicateRowNumbers?: number[];
}

interface ImportPreviewResult {
  registrationTypeId: string | null;
  registrationTypeName: string | null;
  summary: {
    totalRows: number;
    create: number;
    update: number;
    unchanged: number;
    missing: number;
    invalid: number;
    conflict: number;
  };
  canImport: boolean;
  items: ImportPreviewItem[];
}

type PreviewFilter =
  | "actionable"
  | "update"
  | "create"
  | "issues"
  | "unchanged"
  | "missing"
  | "all";

// localStorage 存储的映射模板
interface MappingTemplate {
  // key: sourceField, value: targetField
  mappings: Record<string, string>;
  lastUsed: number;
}

const KEEP_FIELD_VALUE = "__keep__";
const IGNORE_FIELD_VALUE = "__ignore__";
const PREVIEW_PAGE_SIZE = 20;

const getDefaultPreviewFilter = (
  preview: ImportPreviewResult,
): PreviewFilter => {
  if (preview.summary.invalid + preview.summary.conflict > 0) return "issues";
  if (preview.summary.update > 0) return "update";
  if (preview.summary.create > 0) return "create";
  if (preview.summary.missing > 0) return "missing";
  if (preview.summary.unchanged > 0) return "unchanged";
  return "all";
};

// 目标字段定义
const TARGET_FIELDS = [
  { key: "name", label: "姓名", required: false },
  { key: "account", label: "账号", required: false },
  { key: "gender", label: "性别", required: false },
  { key: "age", label: "年龄", required: false },
  { key: "phone", label: "手机号", required: true },
  { key: "email", label: "邮箱", required: false },
  { key: "occupation", label: "职业", required: false },
  { key: "company", label: "公司", required: false },
  { key: "industry", label: "行业", required: false },
  { key: "position", label: "职位", required: false },
  { key: "city", label: "城市", required: false },
  { key: "interests", label: "兴趣爱好", required: false },
  { key: "skills", label: "技能", required: false },
  { key: "bio", label: "个人简介", required: false },
  { key: "matchingNeeds", label: "匹配需求", required: false },
  // 后端匹配所需的额外字段
  { key: "department", label: "所在职能部门", required: false },
  { key: "industryDirection", label: "关注/从事的行业方向", required: false },
  { key: "softwareSkills", label: "软件技能", required: false },
  { key: "expertise", label: "擅长领域", required: false },
];

// 扩展的字段名别名库（支持更多常见写法）
const FIELD_NAME_ALIASES: Record<string, string[]> = {
  name: [
    "姓名",
    "名字",
    "name",
    "用户名",
    "昵称",
    "姓 名",
    "真实姓名",
    "fullname",
    "full name",
    "full_name",
    "username",
    "参与者",
    "人员",
    "成员",
    "报名人",
    "报名者",
  ],
  account: [
    "账号",
    "account",
    "用户账号",
    "登录账号",
    "账户",
    "学号",
    "工号",
    "student_id",
    "studentid",
  ],
  gender: ["性别", "gender", "sex", "男女", "性 别"],
  age: ["年龄", "age", "岁数", "年 龄", "出生年份"],
  phone: [
    "手机",
    "电话",
    "手机号",
    "phone",
    "mobile",
    "联系方式",
    "联系电话",
    "手机号码",
    "电话号码",
    "tel",
    "telephone",
    "手 机",
    "联系人电话",
    "移动电话",
    "cell",
    "cellphone",
  ],
  email: [
    "邮箱",
    "email",
    "电子邮件",
    "e-mail",
    "邮件",
    "电子邮箱",
    "邮 箱",
    "mail",
    "电邮",
  ],
  occupation: [
    "职业",
    "岗位",
    "occupation",
    "job",
    "工作",
    "职 业",
    "从事行业",
  ],
  company: [
    "公司",
    "单位",
    "company",
    "organization",
    "企业",
    "工作单位",
    "所在公司",
    "公司名称",
    "企业名称",
    "org",
    "corp",
    "corporation",
    "公 司",
    "所在单位",
  ],
  industry: [
    "行业",
    "industry",
    "领域",
    "所属行业",
    "行 业",
    "从事领域",
    "sector",
  ],
  position: [
    "职位",
    "position",
    "岗位",
    "title",
    "职务",
    "头衔",
    "job title",
    "职 位",
    "担任职务",
  ],
  city: [
    "城市",
    "所在城市",
    "city",
    "地区",
    "地址",
    "所在地",
    "location",
    "区域",
    "城 市",
    "所在地区",
    "工作城市",
    "居住城市",
  ],
  interests: [
    "兴趣",
    "爱好",
    "兴趣爱好",
    "interests",
    "hobby",
    "hobbies",
    "兴 趣",
    "个人爱好",
    "喜好",
  ],
  skills: [
    "技能",
    "专长",
    "skills",
    "能力",
    "特长",
    "擅长",
    "技 能",
    "专业技能",
    "skill",
  ],
  bio: [
    "简介",
    "个人简介",
    "自我介绍",
    "bio",
    "introduction",
    "介绍",
    "个人介绍",
    "about",
    "about me",
    "简 介",
    "描述",
    "个人描述",
  ],
  matchingNeeds: [
    "匹配需求",
    "期望",
    "需求",
    "matchingNeeds",
    "expectation",
    "匹配期望",
    "交友需求",
    "想认识",
    "希望认识",
    "期望交流",
    "matching",
    "needs",
  ],
  // 后端匹配所需的额外字段别名
  department: [
    "所在职能部门",
    "职能部门",
    "部门",
    "department",
    "所在部门",
    "工作部门",
    "部门/职位",
    "部门职位",
  ],
  industryDirection: [
    "关注/从事的行业方向",
    "关注从事的行业方向",
    "行业方向",
    "从事行业",
    "关注行业",
    "行业领域",
    "industryDirection",
    "industry_direction",
  ],
  softwareSkills: [
    "软件技能",
    "软件",
    "工具",
    "软件工具",
    "softwareSkills",
    "software_skills",
    "tools",
  ],
  expertise: [
    "擅长领域",
    "擅长",
    "专长领域",
    "expertise",
    "专业领域",
    "核心能力",
  ],
};

// localStorage key
const MAPPING_TEMPLATE_KEY = "hdj_import_mapping_template";

// ========================================
// 工具函数
// ========================================

/**
 * 从 localStorage 加载映射模板
 */
const loadMappingTemplate = (): MappingTemplate | null => {
  try {
    const stored = localStorage.getItem(MAPPING_TEMPLATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.warn("加载映射模板失败");
  }
  return null;
};

/**
 * 保存映射模板到 localStorage
 */
const saveMappingTemplate = (mappings: FieldImportAction[]) => {
  try {
    const template: MappingTemplate = {
      mappings: {},
      lastUsed: Date.now(),
    };
    mappings.forEach((m) => {
      if (m.action === "map" && m.targetField) {
        template.mappings[m.sourceField] = m.targetField;
      }
    });
    localStorage.setItem(MAPPING_TEMPLATE_KEY, JSON.stringify(template));
  } catch {
    console.warn("保存映射模板失败");
  }
};

/**
 * 规范化字段名（去除空格、特殊字符、转小写）
 */
const normalizeFieldName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[\s_\-:：]/g, "")
    .trim();
};

const normalizeSourceFieldName = (name: string): string => {
  return name.trim() || name;
};

const normalizeParsedRows = (
  rows: ParsedRow[],
): { rows: ParsedRow[]; headers: string[] } => {
  const rawHeaders = Object.keys(rows[0] || {});
  const usedHeaders = new Set<string>();
  const headerMap = new Map<string, string>();

  rawHeaders.forEach((rawHeader) => {
    const baseHeader = normalizeSourceFieldName(rawHeader);
    let normalizedHeader = baseHeader;
    let suffix = 2;

    while (usedHeaders.has(normalizedHeader)) {
      normalizedHeader = `${baseHeader}_${suffix}`;
      suffix += 1;
    }

    usedHeaders.add(normalizedHeader);
    headerMap.set(rawHeader, normalizedHeader);
  });

  return {
    headers: rawHeaders.map((header) => headerMap.get(header) || header),
    rows: rows.map((row) => {
      const normalizedRow: ParsedRow = {};
      Object.entries(row).forEach(([rawHeader, value]) => {
        const normalizedHeader = headerMap.get(rawHeader) || rawHeader;
        normalizedRow[normalizedHeader] = value;
      });
      return normalizedRow;
    }),
  };
};

const shouldKeepCellValue = (value: unknown): boolean => {
  return value !== undefined && value !== null && String(value).trim() !== "";
};

const getDefaultRegistrationTypeId = (
  registrationTypes?: ActivityRegistrationType[],
): string => {
  if (!registrationTypes?.length) return "";
  return (
    registrationTypes.find((type) => type.isDefault)?.id ||
    registrationTypes[0]?.id ||
    ""
  );
};

const buildTargetFields = (
  formSchema: RegistrationFormField[],
): TargetField[] => {
  const fieldsByKey = new Map<string, TargetField>();
  const labels = new Set<string>();

  formSchema.forEach((field) => {
    if (!field.key || !field.label) return;
    fieldsByKey.set(field.key, {
      key: field.key,
      label: field.label,
      required: field.required,
    });
    labels.add(field.label);
  });

  TARGET_FIELDS.forEach((field) => {
    if (fieldsByKey.has(field.key) || labels.has(field.label)) return;
    fieldsByKey.set(field.key, field);
  });

  return Array.from(fieldsByKey.values());
};

// ========================================
// 组件实现
// ========================================

const ImportEnrollmentModal: React.FC<ImportEnrollmentModalProps> = ({
  visible,
  activityId,
  registrationTypes,
  registrationFormSchema,
  onClose,
  onSuccess,
}) => {
  // 从 store 获取 token
  const { token } = useAuthStore();

  // 步骤: 1-上传文件, 3-预览确认
  const [step, setStep] = useState(1);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldImportAction[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(
    null,
  );
  const [previewFilter, setPreviewFilter] =
    useState<PreviewFilter>("actionable");
  const [previewVisibleCount, setPreviewVisibleCount] =
    useState(PREVIEW_PAGE_SIZE);
  const [expandedPreviewItems, setExpandedPreviewItems] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedIdentityField, setSelectedIdentityField] = useState("");
  const [selectedRegistrationTypeId, setSelectedRegistrationTypeId] =
    useState(() => getDefaultRegistrationTypeId(registrationTypes));

  // 映射分组展开状态
  const [showMatchedFields, setShowMatchedFields] = useState(false);
  const [showUnmatchedFields, setShowUnmatchedFields] = useState(true);

  // 是否使用了记忆的模板
  const [usedTemplate, setUsedTemplate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedRegistrationType = useMemo(() => {
    if (!registrationTypes?.length) return undefined;
    return (
      registrationTypes.find((type) => type.id === selectedRegistrationTypeId) ||
      registrationTypes.find((type) => type.isDefault) ||
      registrationTypes[0]
    );
  }, [registrationTypes, selectedRegistrationTypeId]);

  const targetFieldOptions = useMemo(() => {
    const schema =
      selectedRegistrationType?.formSchema ||
      registrationFormSchema ||
      [];
    return buildTargetFields(schema);
  }, [registrationFormSchema, selectedRegistrationType]);

  React.useEffect(() => {
    const defaultTypeId = getDefaultRegistrationTypeId(registrationTypes);
    if (!registrationTypes?.length) {
      setSelectedRegistrationTypeId("");
      return;
    }
    if (
      !selectedRegistrationTypeId ||
      !registrationTypes.some((type) => type.id === selectedRegistrationTypeId)
    ) {
      setSelectedRegistrationTypeId(defaultTypeId);
    }
  }, [registrationTypes, selectedRegistrationTypeId]);

  // 重置状态
  const resetState = useCallback(() => {
    setStep(1);
    setParsedData([]);
    setSourceFields([]);
    setFieldMappings([]);
    setIsUploading(false);
    setIsImporting(false);
    setIsPreviewing(false);
    setImportSuccess(false);
    setImportedCount(0);
    setErrors([]);
    setPreviewResult(null);
    setPreviewFilter("actionable");
    setPreviewVisibleCount(PREVIEW_PAGE_SIZE);
    setExpandedPreviewItems(new Set());
    setSelectedIdentityField("");
    setShowMatchedFields(false);
    setShowUnmatchedFields(true);
    setUsedTemplate(false);
  }, []);

  // 关闭模态框
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  /**
   * 智能自动匹配字段
   * 优先使用记忆的模板，其次使用别名匹配
   */
  const autoMatchFields = useCallback(
    (
      headers: string[],
    ): { mappings: FieldImportAction[]; fromTemplate: boolean } => {
      const mappings: FieldImportAction[] = [];
      const template = loadMappingTemplate();
      let fromTemplate = false;

      headers.forEach((header) => {
        const headerNormalized = normalizeFieldName(header);
        let matchedTargetField = "";

        // 1. 优先使用记忆的模板
        if (template?.mappings[header]) {
          const targetField = template.mappings[header];
          // 验证目标字段是否有效且未被使用
          if (
            targetFieldOptions.some((f) => f.key === targetField) &&
            !mappings.some((m) => m.action === "map" && m.targetField === targetField)
          ) {
            matchedTargetField = targetField;
            fromTemplate = true;
          }
        }

        // 2. 使用活动报名表字段和系统别名库匹配
        if (!matchedTargetField) {
          for (const targetField of targetFieldOptions) {
            const aliases = [
              targetField.key,
              targetField.label,
              ...(FIELD_NAME_ALIASES[targetField.key] || []),
            ];
            const matched = aliases.some((alias) => {
              const aliasNormalized = normalizeFieldName(alias);
              return (
                aliasNormalized === headerNormalized ||
                headerNormalized.includes(aliasNormalized) ||
                aliasNormalized.includes(headerNormalized)
              );
            });

            if (
              matched &&
              !mappings.some((m) => m.action === "map" && m.targetField === targetField.key)
            ) {
              matchedTargetField = targetField.key;
              break;
            }
          }
        }

        mappings.push(
          matchedTargetField
            ? { sourceField: header, action: "map", targetField: matchedTargetField }
            : { sourceField: header, action: "keep" },
        );
      });

      return { mappings, fromTemplate };
    },
    [targetFieldOptions],
  );

  React.useEffect(() => {
    if (sourceFields.length === 0) return;
    const { mappings, fromTemplate } = autoMatchFields(sourceFields);
    setFieldMappings(mappings);
    setUsedTemplate(fromTemplate);
  }, [autoMatchFields, sourceFields]);

  // 解析 Excel 文件
  const parseExcelFile = useCallback(
    async (selectedFile: File) => {
      setIsUploading(true);
      setErrors([]);

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // 获取第一个工作表
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 转换为 JSON
        const rawJsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, {
          defval: "",
        });

        if (rawJsonData.length === 0) {
          setErrors(["Excel 文件为空，请检查文件内容"]);
          return;
        }

        const unsafeIntegerCells = findUnsafeSpreadsheetIntegerCells(rawJsonData);
        if (unsafeIntegerCells.length > 0) {
          setErrors([getUnsafeSpreadsheetIntegerMessage(unsafeIntegerCells)]);
          return;
        }

        const { rows: jsonData, headers } = normalizeParsedRows(rawJsonData);

        // 获取表头（字段名）
        setSourceFields(headers);
        setParsedData(jsonData);
        setPreviewResult(null);
        setSelectedIdentityField("");

        // 自动匹配字段
        const { mappings, fromTemplate } = autoMatchFields(headers);
        setFieldMappings(mappings);
        setUsedTemplate(fromTemplate);

        // 直接跳到预览步骤（映射和预览合并展示）
        setStep(3);

        // 提示用户匹配情况
        const hasName = mappings.some(
          (m) => m.action === "map" && m.targetField === "name",
        );
        if (hasName) {
          Toast.show({
            content: `已智能匹配 ${mappings.length} 个字段`,
            icon: "success",
          });
        } else {
          Toast.show({
            content: "请在表格中配置「姓名」字段",
          });
        }
      } catch (error) {
        console.error("解析 Excel 失败:", error);
        setErrors(["Excel 文件解析失败，请检查文件格式"]);
      } finally {
        setIsUploading(false);
      }
    },
    [autoMatchFields],
  );

  // 处理文件选择
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        parseExcelFile(selectedFile);
      }
      // 重置 input，允许重复选择同一文件
      event.target.value = "";
    },
    [parseExcelFile],
  );

  // 处理拖拽上传
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        const isExcel =
          droppedFile.name.endsWith(".xlsx") ||
          droppedFile.name.endsWith(".xls");
        if (isExcel) {
          parseExcelFile(droppedFile);
        } else {
          Toast.show({ content: "请上传 Excel 文件 (.xlsx 或 .xls)" });
        }
      }
    },
    [parseExcelFile],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  // 更新字段映射
  const updateMapping = useCallback(
    (sourceField: string, targetField: string) => {
      setPreviewResult(null);
      setFieldMappings((prev) => {
        const filtered = prev.filter((m) => m.sourceField !== sourceField);

        if (targetField === IGNORE_FIELD_VALUE) {
          return [...filtered, { sourceField, action: "ignore" }];
        }

        if (!targetField || targetField === KEEP_FIELD_VALUE) {
          return [...filtered, { sourceField, action: "keep" }];
        }

        return [...filtered, { sourceField, action: "map", targetField }];
      });
    },
    [],
  );

  // 重置所有映射
  const resetMappings = useCallback(() => {
    const { mappings } = autoMatchFields(sourceFields);
    setFieldMappings(mappings);
    setPreviewResult(null);
    Toast.show({ content: "已重新自动匹配" });
  }, [autoMatchFields, sourceFields]);

  React.useEffect(() => {
    setPreviewResult(null);
  }, [selectedRegistrationType?.id, selectedIdentityField]);

  const getStoredFieldName = useCallback(
    (sourceField: string): string | null => {
      const action =
        fieldMappings.find((mapping) => mapping.sourceField === sourceField) ||
        ({ sourceField, action: "keep" } as FieldImportAction);
      if (action.action === "ignore") return null;
      return action.action === "map" && action.targetField
        ? action.targetField
        : sourceField;
    },
    [fieldMappings],
  );

  const identityFieldOptions = useMemo(() => {
    const fields = new Map<string, string>();
    sourceFields.forEach((sourceField) => {
      const storedField = getStoredFieldName(sourceField);
      if (!storedField) return;
      const targetLabel = targetFieldOptions.find((field) => field.key === storedField)?.label;
      fields.set(storedField, targetLabel ? `${sourceField} → ${targetLabel}` : sourceField);
    });
    return Array.from(fields.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [getStoredFieldName, sourceFields, targetFieldOptions]);

  const buildImportPayload = useCallback(() => {
    // 转换数据：未映射列默认按 Excel 原始表头保留，避免丢失活动自定义报名字段。
    const importData = parsedData.map((row) => {
      const item: Record<string, unknown> = {};

      sourceFields.forEach((sourceField) => {
        const action =
          fieldMappings.find((mapping) => mapping.sourceField === sourceField) ||
          ({ sourceField, action: "keep" } as FieldImportAction);
        const value = row[sourceField];
        if (!shouldKeepCellValue(value) || action.action === "ignore") {
          return;
        }

        if (action.action === "keep") {
          item[sourceField] = String(value).trim();
          return;
        }

        const targetKey = action.targetField;
        if (!targetKey) {
          return;
        }

        if (targetKey === "age") {
          const numValue = parseInt(String(value), 10);
          if (!isNaN(numValue)) {
            item[targetKey] = numValue;
          }
        } else if (targetKey === "interests" || targetKey === "skills") {
          const strValue = String(value).trim();
          item[targetKey] = strValue
            ? strValue
                .split(/[,，、;；]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        } else {
          item[targetKey] = String(value).trim();
        }
      });

      return item;
    });

    const fieldActionsPayload = sourceFields.map((sourceField) =>
      fieldMappings.find((mapping) => mapping.sourceField === sourceField) || {
        sourceField,
        action: "keep" as const,
      },
    );
    const mappedActions = fieldActionsPayload.filter(
      (mapping) => mapping.action === "map" && mapping.targetField,
    );
    const fieldMappingPayload = mappedActions.reduce<Record<string, string>>(
      (acc, mapping) => {
        if (mapping.targetField) {
          acc[mapping.sourceField] = mapping.targetField;
        }
        return acc;
      },
      {},
    );

    return {
      registrationTypeId: selectedRegistrationType?.id,
      fieldActions: fieldActionsPayload,
      fieldMapping: fieldMappingPayload,
      rows: parsedData,
      keepUnmappedFields: false,
      enrollments: importData,
      identityFields: selectedIdentityField ? [selectedIdentityField] : [],
    };
  }, [
    parsedData,
    fieldMappings,
    sourceFields,
    selectedRegistrationType?.id,
    selectedIdentityField,
  ]);

  const handlePreview = useCallback(async () => {
    setIsPreviewing(true);
    setErrors([]);

    try {
      saveMappingTemplate(fieldMappings);
      const response = await fetch(
        `/api/enrollments/${activityId}/import/preview`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildImportPayload()),
        },
      );

      const result = await response.json();
      if (result.success) {
        const preview = result.data as ImportPreviewResult;
        setPreviewResult(preview);
        setPreviewFilter(getDefaultPreviewFilter(preview));
        setPreviewVisibleCount(PREVIEW_PAGE_SIZE);
        setExpandedPreviewItems(new Set());
      } else {
        setErrors([result.message || "导入预览失败，请重试"]);
      }
    } catch (error) {
      console.error("导入预览失败:", error);
      setErrors(["网络错误，请检查网络连接后重试"]);
    } finally {
      setIsPreviewing(false);
    }
  }, [activityId, buildImportPayload, fieldMappings, token]);

  // 提交导入
  const handleImport = useCallback(async () => {
    if (!previewResult?.canImport) {
      return;
    }

    setIsImporting(true);
    setErrors([]);

    try {
      const response = await fetch(
        `/api/enrollments/${activityId}/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildImportPayload()),
        },
      );

      const result = await response.json();

      if (result.success) {
        const count =
          result.data?.imported_count ??
          (result.data?.created_count || 0) + (result.data?.updated_count || 0);
        setImportedCount(count);
        setImportSuccess(true);
        onSuccess(count);
      } else {
        setErrors([result.message || "导入失败，请重试"]);
      }
    } catch (error) {
      console.error("导入失败:", error);
      setErrors(["网络错误，请检查网络连接后重试"]);
    } finally {
      setIsImporting(false);
    }
  }, [
    activityId,
    buildImportPayload,
    previewResult?.canImport,
    token,
    onSuccess,
  ]);

  // 计算已匹配和未匹配的字段
  const { matchedFields, unmatchedFields } = React.useMemo(() => {
    const matched: string[] = [];
    const unmatched: string[] = [];

    sourceFields.forEach((field) => {
      const action = fieldMappings.find((m) => m.sourceField === field);
      if (action?.action === "map") {
        matched.push(field);
      } else {
        unmatched.push(field);
      }
    });

    return { matchedFields: matched, unmatchedFields: unmatched };
  }, [sourceFields, fieldMappings]);

  // 获取目标字段标签
  const getTargetFieldLabel = (key: string): string => {
    return targetFieldOptions.find((f) => f.key === key)?.label || key;
  };

  const getFieldAction = (sourceField: string): FieldImportAction => {
    return (
      fieldMappings.find((mapping) => mapping.sourceField === sourceField) || {
        sourceField,
        action: "keep",
      }
    );
  };

  const getActionSelectValue = (sourceField: string): string => {
    const action = getFieldAction(sourceField);
    if (action.action === "ignore") return IGNORE_FIELD_VALUE;
    if (action.action === "keep") return KEEP_FIELD_VALUE;
    return action.targetField || KEEP_FIELD_VALUE;
  };

  const mappedCount = fieldMappings.filter(
    (mapping) => mapping.action === "map" && mapping.targetField,
  ).length;
  const keptCount = fieldMappings.filter(
    (mapping) => mapping.action === "keep",
  ).length;
  const ignoredCount = fieldMappings.filter(
    (mapping) => mapping.action === "ignore",
  ).length;
  const previewBlockingCount =
    (previewResult?.summary.invalid || 0) + (previewResult?.summary.conflict || 0);
  const previewChangeCount =
    (previewResult?.summary.create || 0) + (previewResult?.summary.update || 0);
  const previewActionMeta: Record<
    ImportPreviewAction,
    { label: string; className: string }
  > = {
    create: { label: "新增", className: "bg-green-50 text-green-700 border-green-200" },
    update: { label: "修改", className: "bg-blue-50 text-blue-700 border-blue-200" },
    unchanged: { label: "未变化", className: "bg-gray-50 text-gray-600 border-gray-200" },
    missing: { label: "本次缺失", className: "bg-orange-50 text-orange-700 border-orange-200" },
    invalid: { label: "无法识别", className: "bg-red-50 text-red-700 border-red-200" },
    conflict: { label: "冲突", className: "bg-red-50 text-red-700 border-red-200" },
  };
  const formatPreviewValue = (value: unknown): string => {
    if (value === undefined || value === null || value === "") return "空";
    if (Array.isArray(value)) return value.join("、") || "空";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };
  const getPreviewItemKey = (
    item: ImportPreviewItem,
    index: number,
  ): string =>
    `${item.action}-${item.identityKey || "no-key"}-${item.rowNumber || "existing"}-${index}`;
  const previewFilteredItems = useMemo(() => {
    if (!previewResult) return [];
    return previewResult.items.filter((item) => {
      if (previewFilter === "all") return true;
      if (previewFilter === "actionable") {
        return item.action === "create" || item.action === "update";
      }
      if (previewFilter === "issues") {
        return item.action === "invalid" || item.action === "conflict";
      }
      return item.action === previewFilter;
    });
  }, [previewFilter, previewResult]);
  const visiblePreviewItems = previewFilteredItems.slice(
    0,
    previewVisibleCount,
  );
  const remainingPreviewCount = Math.max(
    previewFilteredItems.length - visiblePreviewItems.length,
    0,
  );
  const previewTabs = useMemo(() => {
    const summary = previewResult?.summary;
    return [
      {
        key: "actionable" as const,
        label: "待导入",
        count: (summary?.create || 0) + (summary?.update || 0),
      },
      { key: "update" as const, label: "修改", count: summary?.update || 0 },
      { key: "create" as const, label: "新增", count: summary?.create || 0 },
      {
        key: "issues" as const,
        label: "问题",
        count: (summary?.invalid || 0) + (summary?.conflict || 0),
      },
      {
        key: "unchanged" as const,
        label: "未变化",
        count: summary?.unchanged || 0,
      },
      {
        key: "missing" as const,
        label: "本次未包含",
        count: summary?.missing || 0,
      },
      { key: "all" as const, label: "全部", count: previewResult?.items.length || 0 },
    ];
  }, [previewResult]);
  const handlePreviewFilterChange = (filter: PreviewFilter) => {
    setPreviewFilter(filter);
    setPreviewVisibleCount(PREVIEW_PAGE_SIZE);
    setExpandedPreviewItems(new Set());
  };
  const togglePreviewItemExpanded = (key: string) => {
    setExpandedPreviewItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  const getPreviewIdentityText = (item: ImportPreviewItem): string => {
    if (!item.displayIdentityValue) return "";
    return `${item.displayIdentityLabel || "识别值"}：${item.displayIdentityValue}`;
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">导入报名数据</h2>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={handleClose}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 步骤指示器 */}
        {!importSuccess && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-center gap-4">
              {[
                { num: 1, label: "上传文件" },
                { num: 2, label: "确认映射" },
              ].map((s, index) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step >= s.num + (step > 2 ? 1 : 0)
                          ? "bg-primary-400 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {(step === 3 && s.num === 2) || step > s.num ? (
                        <CheckCircle size={14} />
                      ) : (
                        s.num
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        step >= s.num || (step === 3 && s.num === 2)
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < 1 && (
                    <div
                      className={`w-8 h-0.5 ${
                        step > 1 ? "bg-primary-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 错误提示 */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
              {errors.map((error, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* 导入成功状态 */}
          {importSuccess && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                导入成功
              </h3>
              <p className="text-gray-500 text-center">
                已成功导入{" "}
                <span className="text-green-600 font-medium">
                  {importedCount}
                </span>{" "}
                条报名数据
              </p>
            </div>
          )}

          {/* 步骤 1: 上传文件 */}
          {!importSuccess && step === 1 && (
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
                  <p className="text-gray-600">正在解析文件...</p>
                </div>
              ) : (
                <>
                  <FileSpreadsheet
                    size={48}
                    className="mx-auto mb-4 text-gray-400"
                  />
                  <p className="text-gray-600 mb-2">点击或拖拽文件到此处上传</p>
                  <p className="text-sm text-gray-400 mb-4">
                    支持 .xlsx、.xls 格式
                  </p>
                  <button className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-full bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500 [&>svg]:shrink-0">
                    <Upload size={16} />
                    选择文件
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* 步骤 2: 字段映射 (优化版) */}
          {!importSuccess && step === 2 && (
            <div className="space-y-4">
              {/* 智能提示 */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Sparkles size={16} className="text-blue-500" />
                <p className="text-sm text-blue-700">
                  已智能匹配{" "}
                  <span className="font-medium">{mappedCount}</span>{" "}
                  个字段，默认保留{" "}
                  <span className="font-medium">{keptCount}</span>{" "}
                  个字段
                  {ignoredCount > 0 && (
                    <>
                      ，不导入{" "}
                      <span className="font-medium">{ignoredCount}</span>{" "}
                      个字段
                    </>
                  )}
                  {usedTemplate && "（基于上次配置）"}
                </p>
                <button
                  className="ml-auto flex flex-nowrap items-center gap-1 whitespace-nowrap text-xs text-blue-600 hover:text-blue-800 [&>svg]:shrink-0"
                  onClick={resetMappings}
                >
                  <RotateCcw size={12} />
                  重新匹配
                </button>
              </div>

              {/* 保留/不导入字段（优先显示） */}
              {unmatchedFields.length > 0 && (
                <div>
                  <button
                    className="flex w-full flex-nowrap items-center gap-2 whitespace-nowrap py-2 text-left [&>svg]:shrink-0"
                    onClick={() => setShowUnmatchedFields(!showUnmatchedFields)}
                  >
                    {showUnmatchedFields ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronUp size={16} className="text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-orange-600">
                      保留/不导入字段 ({unmatchedFields.length})
                    </span>
                  </button>
                  {showUnmatchedFields && (
                    <div className="space-y-2 mt-2">
                      {unmatchedFields.map((sourceField) => (
                        <div
                          key={sourceField}
                          className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {sourceField}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              示例:{" "}
                              {String(parsedData[0]?.[sourceField] || "-")}
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                          <select
                            className="w-28 h-9 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                            value={getActionSelectValue(sourceField)}
                            onChange={(e) =>
                              updateMapping(sourceField, e.target.value)
                            }
                          >
                            <option value={KEEP_FIELD_VALUE}>保留为额外字段</option>
                            <option value={IGNORE_FIELD_VALUE}>不导入</option>
                            {targetFieldOptions.map((field) => (
                              <option
                                key={field.key}
                                value={field.key}
                                disabled={fieldMappings.some(
                                  (m) => m.action === "map" && m.targetField === field.key,
                                )}
                              >
                                {field.label}
                                {field.required ? " *" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 已匹配字段（可折叠） */}
              {matchedFields.length > 0 && (
                <div>
                  <button
                    className="flex w-full flex-nowrap items-center gap-2 whitespace-nowrap py-2 text-left [&>svg]:shrink-0"
                    onClick={() => setShowMatchedFields(!showMatchedFields)}
                  >
                    {showMatchedFields ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronUp size={16} className="text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-green-600">
                      已匹配字段 ({matchedFields.length})
                    </span>
                    <CheckCircle size={14} className="text-green-500" />
                  </button>
                  {showMatchedFields && (
                    <div className="space-y-2 mt-2">
                      {matchedFields.map((sourceField) => {
                        const mapping = fieldMappings.find(
                          (m) => m.sourceField === sourceField,
                        );
                        return (
                          <div
                            key={sourceField}
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {sourceField}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                示例:{" "}
                                {String(parsedData[0]?.[sourceField] || "-")}
                              </p>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-gray-400 flex-shrink-0"
                            />
                            <select
                              className="w-28 h-9 px-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 bg-white"
                              value={getActionSelectValue(sourceField)}
                              onChange={(e) =>
                                updateMapping(sourceField, e.target.value)
                              }
                            >
                              <option value={KEEP_FIELD_VALUE}>保留为额外字段</option>
                              <option value={IGNORE_FIELD_VALUE}>不导入</option>
                              {targetFieldOptions.map((field) => (
                                <option
                                  key={field.key}
                                  value={field.key}
                                  disabled={fieldMappings.some(
                                    (m) =>
                                      m.action === "map" &&
                                      m.targetField === field.key &&
                                      m.sourceField !== sourceField,
                                  )}
                                >
                                  {field.label}
                                  {field.required ? " *" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 步骤 3: 预览确认 - Excel 表格风格 */}
          {!importSuccess && step === 3 && (
            <div className="space-y-4">
              {registrationTypes && registrationTypes.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    导入到报名类型
                  </label>
                  <select
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary-400"
                    value={selectedRegistrationType?.id || ""}
                    onChange={(event) =>
                      setSelectedRegistrationTypeId(event.target.value)
                    }
                  >
                    {registrationTypes.map((type, index) => (
                      <option key={type.id || index} value={type.id || ""}>
                        {type.name || `报名类型 ${index + 1}`}
                        {type.isDefault ? "（默认）" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">
                    字段会优先按该报名类型的报名表保存，未匹配列将作为自定义信息保留。
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  唯一识别字段
                </label>
                <select
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary-400"
                  value={selectedIdentityField}
                  onChange={(event) => setSelectedIdentityField(event.target.value)}
                >
                  <option value="">
                    自动识别（平台用户ID / 手机号 / 账号 / 邮箱 / 学号）
                  </option>
                  {identityFieldOptions.map((field) => (
                    <option key={field.value} value={field.value}>
                      使用「{field.label}」
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  自动识别失败时，请选择一个能在本活动中唯一代表用户的字段。系统会拦截重复值。
                </p>
              </div>

              {/* 统计信息 */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-700">
                  已识别{" "}
                  <span className="font-semibold">{parsedData.length}</span>{" "}
                  条数据， 匹配{" "}
                  <span className="font-semibold">{mappedCount}</span>{" "}
                  个字段，保留{" "}
                  <span className="font-semibold">{keptCount}</span>{" "}
                  个，不导入{" "}
                  <span className="font-semibold">{ignoredCount}</span>{" "}
                  个
                </span>
              </div>

              {previewResult ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          导入差异预览
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          本次文件 {previewResult.summary.totalRows} 条，待导入{" "}
                          {previewResult.summary.create + previewResult.summary.update}{" "}
                          条，未变化 {previewResult.summary.unchanged} 条，本次未包含{" "}
                          {previewResult.summary.missing} 条
                          {previewBlockingCount > 0 &&
                            `，需处理 ${previewBlockingCount} 个问题`}
                        </p>
                      </div>
                      <button
                        className="text-xs text-primary-500 hover:text-primary-600"
                        onClick={handlePreview}
                        disabled={isPreviewing || isImporting}
                      >
                        重新预览
                      </button>
                    </div>
                  </div>

                  <div className="px-3 py-2 border-b border-gray-100 overflow-x-auto">
                    <div className="flex min-w-max gap-2">
                      {previewTabs.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          className={`h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                            previewFilter === tab.key
                              ? "bg-primary-50 text-primary-700 border-primary-200"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handlePreviewFilterChange(tab.key)}
                        >
                          {tab.label} {tab.count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {previewFilteredItems.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      当前筛选暂无数据
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {visiblePreviewItems.map((item, index) => {
                        const meta = previewActionMeta[item.action];
                        const itemKey = getPreviewItemKey(item, index);
                        const isExpanded = expandedPreviewItems.has(itemKey);
                        const visibleDiffFields = isExpanded
                          ? item.diffFields
                          : item.diffFields.slice(0, 4);
                        const identityText = getPreviewIdentityText(item);
                        return (
                          <div key={itemKey} className="p-3">
                            <div className="flex items-start gap-2">
                              <span
                          className={`flex-shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${meta.className}`}
                              >
                                {meta.label}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.name || "未命名用户"}
                                  </p>
                                  {item.rowNumber && (
                                    <span className="text-xs text-gray-400">
                                      第 {item.rowNumber} 行
                                    </span>
                                  )}
                                </div>
                                {identityText && (
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {identityText}
                                  </p>
                                )}
                                {item.reason && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {item.reason}
                                    {item.duplicateRowNumbers?.length
                                      ? `（行 ${item.duplicateRowNumbers.join(", ")}）`
                                      : ""}
                                  </p>
                                )}
                                {item.diffFields.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {visibleDiffFields.map((diff) => (
                                      <div
                                        key={`${item.identityKey}-${diff.field}`}
                                        className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1"
                                      >
                                        <span className="font-medium text-gray-700">
                                          {diff.field}
                                        </span>
                                        {diff.type === "added" && (
                                          <span>
                                            ：新增「{formatPreviewValue(diff.newValue)}」
                                          </span>
                                        )}
                                        {diff.type === "removed" && (
                                          <span>
                                            ：删除「{formatPreviewValue(diff.oldValue)}」
                                          </span>
                                        )}
                                        {diff.type === "changed" && (
                                          <span>
                                            ：「{formatPreviewValue(diff.oldValue)}」 → 「
                                            {formatPreviewValue(diff.newValue)}」
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                    {item.diffFields.length > 4 && (
                                      <button
                                        type="button"
                                        className="text-xs text-primary-500 hover:text-primary-600"
                                        onClick={() =>
                                          togglePreviewItemExpanded(itemKey)
                                        }
                                      >
                                        {isExpanded
                                          ? "收起字段变化"
                                          : `展开全部 ${item.diffFields.length} 个字段变化`}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {remainingPreviewCount > 0 && (
                        <div className="px-3 py-2 bg-gray-50 text-center">
                          <button
                            type="button"
                            className="text-xs text-primary-500 hover:text-primary-600"
                            onClick={() =>
                              setPreviewVisibleCount((count) =>
                                count + PREVIEW_PAGE_SIZE,
                              )
                            }
                          >
                            加载更多 {Math.min(PREVIEW_PAGE_SIZE, remainingPreviewCount)} 条
                            （剩余 {remainingPreviewCount} 条）
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                  点击底部「预览差异」后，系统会先比较已导入数据和本次文件，再允许确认导入。
                </div>
              )}

              {/* 字段映射表头 - 可直接编辑 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* 表格容器 - 横向滚动 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    {/* 映射目标行 - 可编辑 */}
                    <thead>
                      <tr className="bg-primary-50 border-b border-primary-100">
                        <th className="px-2 py-2 text-left text-xs font-medium text-primary-600 sticky left-0 bg-primary-50 z-10 w-10">
                          #
                        </th>
                        {sourceFields.map((field) => {
                          const mapping = fieldMappings.find(
                            (m) => m.sourceField === field,
                          );
                          const isMapped = mapping?.action === "map" && mapping.targetField;
                          return (
                            <th key={field} className="px-2 py-2 min-w-[120px]">
                              <select
                                className={`w-full h-7 px-2 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                                  isMapped
                                    ? "bg-green-50 border-green-300 text-green-700"
                                    : mapping?.action === "ignore"
                                      ? "bg-red-50 border-red-200 text-red-600"
                                      : "bg-white border-gray-300 text-gray-500"
                                }`}
                                value={getActionSelectValue(field)}
                                onChange={(e) =>
                                  updateMapping(field, e.target.value)
                                }
                              >
                                <option value={KEEP_FIELD_VALUE}>保留为额外字段</option>
                                <option value={IGNORE_FIELD_VALUE}>不导入</option>
                                {targetFieldOptions.map((f) => (
                                  <option
                                    key={f.key}
                                    value={f.key}
                                    disabled={fieldMappings.some(
                                      (m) =>
                                        m.action === "map" &&
                                        m.targetField === f.key &&
                                        m.sourceField !== field,
                                    )}
                                  >
                                    {f.label}
                                    {f.required ? " *" : ""}
                                  </option>
                                ))}
                              </select>
                            </th>
                          );
                        })}
                      </tr>
                      {/* 原始表头行 */}
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-100 z-10"></th>
                        {sourceFields.map((field) => (
                          <th
                            key={field}
                            className="px-2 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap"
                          >
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {/* 数据行 */}
                    <tbody>
                      {parsedData.slice(0, 8).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={`border-b border-gray-100 ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                        >
                          <td className="px-2 py-2 text-xs text-gray-400 sticky left-0 bg-inherit z-10">
                            {rowIndex + 1}
                          </td>
                          {sourceFields.map((field) => {
                            const mapping = fieldMappings.find(
                              (m) => m.sourceField === field,
                            );
                            const value = row[field];
                            const isMapped = mapping?.action === "map" && mapping.targetField;
                            return (
                              <td
                                key={field}
                                className={`px-2 py-2 text-xs max-w-[150px] truncate ${
                                  isMapped
                                    ? "text-gray-900"
                                    : mapping?.action === "ignore"
                                      ? "text-red-300"
                                      : "text-gray-500"
                                }`}
                                title={String(value || "")}
                              >
                                {value !== undefined && value !== ""
                                  ? String(value)
                                  : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 更多数据提示 */}
                {parsedData.length > 8 && (
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-center">
                    <span className="text-xs text-gray-500">
                      ... 还有 {parsedData.length - 8} 条数据未显示
                    </span>
                  </div>
                )}
              </div>

              {/* 映射摘要 */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500">字段处理:</span>
                {fieldMappings.length > 0 ? (
                  fieldMappings.map((m) => (
                    <span
                      key={m.sourceField}
                          className={`max-w-full truncate whitespace-nowrap rounded-full border px-2 py-1 ${
                        m.action === "map"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : m.action === "ignore"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {m.action === "map" && m.targetField
                        ? `${m.sourceField} → ${getTargetFieldLabel(m.targetField)}`
                        : m.action === "ignore"
                          ? `${m.sourceField} 不导入`
                          : `${m.sourceField} 保留`}
                    </span>
                  ))
                ) : (
                  <span className="text-orange-500">未配置字段处理方式</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          {importSuccess ? (
            <button
              className="inline-flex w-full flex-nowrap items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-green-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 [&>svg]:shrink-0"
              onClick={handleClose}
            >
              <CheckCircle2 size={16} />
              完成
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={step === 1 ? handleClose : () => setStep(1)}
                disabled={isImporting}
              >
                {step === 1 ? "取消" : "重新选择"}
              </button>

              {step === 3 && !previewResult && (
                <button
                  className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-lg bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 [&>svg]:shrink-0"
                  onClick={handlePreview}
                  disabled={isPreviewing || parsedData.length === 0}
                >
                  {isPreviewing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      预览中...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      预览差异 ({parsedData.length} 条)
                    </>
                  )}
                </button>
              )}

              {step === 3 && previewResult && previewResult.canImport && (
                <button
                  className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap rounded-lg bg-primary-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 [&>svg]:shrink-0"
                  onClick={handleImport}
                  disabled={isImporting || parsedData.length === 0}
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      确认导入 ({previewChangeCount} 条变化)
                    </>
                  )}
                </button>
              )}

              {step === 3 && previewResult && !previewResult.canImport && (
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg inline-flex items-center gap-2 cursor-not-allowed"
                  disabled
                >
                  {previewBlockingCount > 0 ? "请先处理冲突" : "无需导入"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportEnrollmentModal;
