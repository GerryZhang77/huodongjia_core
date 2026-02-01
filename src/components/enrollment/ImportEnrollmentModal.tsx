/**
 * 导入报名模态框组件 (优化版)
 * 支持 Excel 文件解析、智能字段映射、映射记忆、数据预览
 */

import React, { useState, useCallback, useRef } from "react";
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
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Toast } from "antd-mobile";
import * as XLSX from "xlsx";
import { useStore } from "@/store";

// ========================================
// 类型定义
// ========================================

interface ImportEnrollmentModalProps {
  visible: boolean;
  activityId: string;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedRow {
  [key: string]: string | number | undefined;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
}

// localStorage 存储的映射模板
interface MappingTemplate {
  // key: sourceField, value: targetField
  mappings: Record<string, string>;
  lastUsed: number;
}

// 目标字段定义
const TARGET_FIELDS = [
  { key: "name", label: "姓名", required: true },
  { key: "gender", label: "性别", required: false },
  { key: "age", label: "年龄", required: false },
  { key: "phone", label: "手机号", required: false },
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
const saveMappingTemplate = (mappings: FieldMapping[]) => {
  try {
    const template: MappingTemplate = {
      mappings: {},
      lastUsed: Date.now(),
    };
    mappings.forEach((m) => {
      if (m.targetField) {
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

// ========================================
// 组件实现
// ========================================

const ImportEnrollmentModal: React.FC<ImportEnrollmentModalProps> = ({
  visible,
  activityId,
  onClose,
  onSuccess,
}) => {
  // 从 store 获取 token
  const { token } = useStore();

  // 步骤: 1-上传文件, 3-预览确认
  const [step, setStep] = useState(1);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // 映射分组展开状态
  const [showMatchedFields, setShowMatchedFields] = useState(false);
  const [showUnmatchedFields, setShowUnmatchedFields] = useState(true);

  // 是否使用了记忆的模板
  const [usedTemplate, setUsedTemplate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 重置状态
  const resetState = useCallback(() => {
    setStep(1);
    setParsedData([]);
    setSourceFields([]);
    setFieldMappings([]);
    setIsUploading(false);
    setIsImporting(false);
    setImportSuccess(false);
    setImportedCount(0);
    setErrors([]);
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
    ): { mappings: FieldMapping[]; fromTemplate: boolean } => {
      const mappings: FieldMapping[] = [];
      const template = loadMappingTemplate();
      let fromTemplate = false;

      headers.forEach((header) => {
        const headerNormalized = normalizeFieldName(header);

        // 1. 优先使用记忆的模板
        if (template?.mappings[header]) {
          const targetField = template.mappings[header];
          // 验证目标字段是否有效且未被使用
          if (
            TARGET_FIELDS.some((f) => f.key === targetField) &&
            !mappings.some((m) => m.targetField === targetField)
          ) {
            mappings.push({ sourceField: header, targetField });
            fromTemplate = true;
            return;
          }
        }

        // 2. 使用别名库匹配
        for (const [targetKey, aliases] of Object.entries(FIELD_NAME_ALIASES)) {
          const matched = aliases.some((alias) => {
            const aliasNormalized = normalizeFieldName(alias);
            return (
              aliasNormalized === headerNormalized ||
              headerNormalized.includes(aliasNormalized) ||
              aliasNormalized.includes(headerNormalized)
            );
          });

          if (matched && !mappings.some((m) => m.targetField === targetKey)) {
            mappings.push({ sourceField: header, targetField: targetKey });
            break;
          }
        }
      });

      return { mappings, fromTemplate };
    },
    [],
  );

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
        const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, {
          defval: "",
        });

        if (jsonData.length === 0) {
          setErrors(["Excel 文件为空，请检查文件内容"]);
          return;
        }

        // 获取表头（字段名）
        const headers = Object.keys(jsonData[0]);
        setSourceFields(headers);
        setParsedData(jsonData);

        // 自动匹配字段
        const { mappings, fromTemplate } = autoMatchFields(headers);
        setFieldMappings(mappings);
        setUsedTemplate(fromTemplate);

        // 直接跳到预览步骤（映射和预览合并展示）
        setStep(3);

        // 提示用户匹配情况
        const hasName = mappings.some((m) => m.targetField === "name");
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
      setFieldMappings((prev) => {
        // 移除旧的映射
        const filtered = prev.filter((m) => m.sourceField !== sourceField);

        if (targetField) {
          // 添加新映射
          return [...filtered, { sourceField, targetField }];
        }
        return filtered;
      });
    },
    [],
  );

  // 重置所有映射
  const resetMappings = useCallback(() => {
    const { mappings } = autoMatchFields(sourceFields);
    setFieldMappings(mappings);
    Toast.show({ content: "已重新自动匹配" });
  }, [autoMatchFields, sourceFields]);

  // 提交导入
  const handleImport = useCallback(async () => {
    setIsImporting(true);
    setErrors([]);

    try {
      // 保存映射模板
      saveMappingTemplate(fieldMappings);

      // 转换数据
      const importData = parsedData.map((row) => {
        const item: Record<string, unknown> = {};

        fieldMappings.forEach((mapping) => {
          const { sourceField, targetField } = mapping;
          const value = row[sourceField];
          const targetKey = targetField;

          if (targetKey === "age") {
            const numValue = parseInt(String(value), 10);
            if (!isNaN(numValue)) {
              item[targetKey] = numValue;
            }
          } else if (targetKey === "interests" || targetKey === "skills") {
            const strValue = String(value || "");
            item[targetKey] = strValue
              ? strValue
                  .split(/[,，、;；]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
          } else if (value !== undefined && value !== "") {
            item[targetKey] = String(value);
          }
        });

        return item;
      });

      // 调用导入 API
      const response = await fetch(
        `/api/events/${activityId}/enrollments/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enrollments: importData,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        const count = result.data?.imported_count || importData.length;
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
  }, [parsedData, fieldMappings, activityId, token, onSuccess]);

  // 计算已匹配和未匹配的字段
  const { matchedFields, unmatchedFields } = React.useMemo(() => {
    const matched: string[] = [];
    const unmatched: string[] = [];

    sourceFields.forEach((field) => {
      if (fieldMappings.some((m) => m.sourceField === field)) {
        matched.push(field);
      } else {
        unmatched.push(field);
      }
    });

    return { matchedFields: matched, unmatchedFields: unmatched };
  }, [sourceFields, fieldMappings]);

  // 获取目标字段标签
  const getTargetFieldLabel = (key: string): string => {
    return TARGET_FIELDS.find((f) => f.key === key)?.label || key;
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
                  <button className="px-4 py-2 bg-primary-400 text-white rounded-full text-sm font-medium hover:bg-primary-500 transition-colors inline-flex items-center gap-2">
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
                  <span className="font-medium">{matchedFields.length}</span>{" "}
                  个字段
                  {usedTemplate && "（基于上次配置）"}
                </p>
                <button
                  className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  onClick={resetMappings}
                >
                  <RotateCcw size={12} />
                  重新匹配
                </button>
              </div>

              {/* 未匹配字段（优先显示） */}
              {unmatchedFields.length > 0 && (
                <div>
                  <button
                    className="flex items-center gap-2 w-full text-left py-2"
                    onClick={() => setShowUnmatchedFields(!showUnmatchedFields)}
                  >
                    {showUnmatchedFields ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronUp size={16} className="text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-orange-600">
                      未匹配字段 ({unmatchedFields.length})
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
                            value=""
                            onChange={(e) =>
                              updateMapping(sourceField, e.target.value)
                            }
                          >
                            <option value="">不导入</option>
                            {TARGET_FIELDS.map((field) => (
                              <option
                                key={field.key}
                                value={field.key}
                                disabled={fieldMappings.some(
                                  (m) => m.targetField === field.key,
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
                    className="flex items-center gap-2 w-full text-left py-2"
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
                              value={mapping?.targetField || ""}
                              onChange={(e) =>
                                updateMapping(sourceField, e.target.value)
                              }
                            >
                              <option value="">不导入</option>
                              {TARGET_FIELDS.map((field) => (
                                <option
                                  key={field.key}
                                  value={field.key}
                                  disabled={fieldMappings.some(
                                    (m) =>
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
              {/* 统计信息 */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-700">
                  已识别{" "}
                  <span className="font-semibold">{parsedData.length}</span>{" "}
                  条数据， 匹配{" "}
                  <span className="font-semibold">{fieldMappings.length}</span>{" "}
                  个字段
                </span>
              </div>

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
                          return (
                            <th key={field} className="px-2 py-2 min-w-[120px]">
                              <select
                                className={`w-full h-7 px-2 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                                  mapping?.targetField
                                    ? "bg-green-50 border-green-300 text-green-700"
                                    : "bg-white border-gray-300 text-gray-500"
                                }`}
                                value={mapping?.targetField || ""}
                                onChange={(e) =>
                                  updateMapping(field, e.target.value)
                                }
                              >
                                <option value="">不导入</option>
                                {TARGET_FIELDS.map((f) => (
                                  <option
                                    key={f.key}
                                    value={f.key}
                                    disabled={fieldMappings.some(
                                      (m) =>
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
                            return (
                              <td
                                key={field}
                                className={`px-2 py-2 text-xs max-w-[150px] truncate ${
                                  mapping?.targetField
                                    ? "text-gray-900"
                                    : "text-gray-400"
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
                <span className="text-gray-500">映射关系:</span>
                {fieldMappings.length > 0 ? (
                  fieldMappings.map((m) => (
                    <span
                      key={m.sourceField}
                      className="px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200"
                    >
                      {m.sourceField} → {getTargetFieldLabel(m.targetField)}
                    </span>
                  ))
                ) : (
                  <span className="text-orange-500">未映射任何字段</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          {importSuccess ? (
            <button
              className="w-full px-6 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors inline-flex items-center justify-center gap-2"
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

              {step === 3 && (
                <button
                  className="px-4 py-2 bg-primary-400 text-white text-sm font-medium rounded-lg hover:bg-primary-500 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                  onClick={handleImport}
                  disabled={
                    isImporting ||
                    !fieldMappings.some((m) => m.targetField === "name")
                  }
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      确认导入 ({parsedData.length} 条)
                    </>
                  )}
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
