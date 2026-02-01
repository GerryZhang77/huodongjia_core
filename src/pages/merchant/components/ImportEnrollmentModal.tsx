/**
 * 导入报名数据弹窗组件
 */
import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { Toast } from "antd-mobile";
import * as XLSX from "xlsx";

// ========================================
// 类型定义
// ========================================
interface ImportEnrollmentModalProps {
  visible: boolean;
  activityId: string;
  token: string;
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

// 目标字段定义
const TARGET_FIELDS = [
  { key: "name", label: "姓名", required: true },
  { key: "phone", label: "手机号", required: false },
  { key: "email", label: "邮箱", required: false },
  { key: "gender", label: "性别", required: false },
  { key: "age", label: "年龄", required: false },
  { key: "occupation", label: "职业", required: false },
  { key: "company", label: "公司", required: false },
  { key: "city", label: "城市", required: false },
  { key: "bio", label: "个人简介", required: false },
  { key: "interests", label: "兴趣爱好", required: false },
  { key: "skills", label: "技能特长", required: false },
  { key: "matchingNeeds", label: "匹配需求", required: false },
];

// 字段自动匹配关键词
const FIELD_KEYWORDS: Record<string, string[]> = {
  name: ["姓名", "名字", "name", "用户名"],
  phone: ["手机", "电话", "phone", "联系方式", "手机号"],
  email: ["邮箱", "email", "电子邮件", "邮件"],
  gender: ["性别", "gender", "男/女"],
  age: ["年龄", "age", "岁数"],
  occupation: ["职业", "职位", "工作", "occupation", "job"],
  company: ["公司", "企业", "单位", "company", "工作单位"],
  city: ["城市", "所在地", "地区", "city", "location"],
  bio: ["简介", "介绍", "bio", "自我介绍", "个人介绍"],
  interests: ["兴趣", "爱好", "interest", "hobby"],
  skills: ["技能", "特长", "skill", "专业"],
  matchingNeeds: ["需求", "匹配", "期望", "wants", "期待"],
};

// ========================================
// 主组件
// ========================================
const ImportEnrollmentModal: React.FC<ImportEnrollmentModalProps> = ({
  visible,
  activityId,
  token,
  onClose,
  onSuccess,
}) => {
  // 步骤状态: 1=上传文件, 2=字段映射, 3=预览确认
  const [step, setStep] = useState(1);

  // 文件和数据
  const [file, setFile] = useState<File | null>(null);
  const [sourceHeaders, setSourceHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

  // 加载状态
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== 文件处理 ====================

  /**
   * 解析 Excel 文件
   */
  const parseExcelFile = useCallback(async (selectedFile: File) => {
    setIsParsing(true);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(firstSheet, {
        defval: "",
      });

      if (jsonData.length === 0) {
        Toast.show({ content: "Excel 文件为空或格式不正确", icon: "fail" });
        return;
      }

      // 提取表头
      const headers = Object.keys(jsonData[0]);
      setSourceHeaders(headers);
      setParsedData(jsonData);

      // 自动匹配字段
      const autoMappings: FieldMapping[] = [];
      TARGET_FIELDS.forEach((target) => {
        const keywords = FIELD_KEYWORDS[target.key] || [target.key];
        const matchedHeader = headers.find((h) =>
          keywords.some((kw) => h.toLowerCase().includes(kw.toLowerCase())),
        );
        if (matchedHeader) {
          autoMappings.push({
            sourceField: matchedHeader,
            targetField: target.key,
          });
        }
      });
      setFieldMappings(autoMappings);

      setFile(selectedFile);
      setStep(2);
      Toast.show({
        content: `已解析 ${jsonData.length} 条数据`,
        icon: "success",
      });
    } catch (error) {
      console.error("解析 Excel 失败:", error);
      Toast.show({ content: "文件解析失败，请检查格式", icon: "fail" });
    } finally {
      setIsParsing(false);
    }
  }, []);

  /**
   * 处理文件选择
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        Toast.show({ content: "请上传 Excel 文件 (.xlsx 或 .xls)" });
        return;
      }
      parseExcelFile(selectedFile);
    }
  };

  /**
   * 处理拖拽上传
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls")
      ) {
        parseExcelFile(droppedFile);
      } else {
        Toast.show({ content: "请上传 Excel 文件 (.xlsx 或 .xls)" });
      }
    }
  };

  // ==================== 字段映射 ====================

  /**
   * 更新字段映射
   */
  const updateMapping = (targetField: string, sourceField: string) => {
    setFieldMappings((prev) => {
      const existing = prev.find((m) => m.targetField === targetField);
      if (existing) {
        return prev.map((m) =>
          m.targetField === targetField ? { ...m, sourceField } : m,
        );
      }
      return [...prev, { targetField, sourceField }];
    });
  };

  /**
   * 获取字段映射的源字段
   */
  const getMappedSource = (targetField: string): string => {
    return (
      fieldMappings.find((m) => m.targetField === targetField)?.sourceField ||
      ""
    );
  };

  // ==================== 数据转换和提交 ====================

  /**
   * 转换数据格式
   */
  const transformData = useCallback(() => {
    return parsedData.map((row) => {
      const transformed: Record<string, unknown> = {};
      fieldMappings.forEach((mapping) => {
        let value = row[mapping.sourceField];
        // 特殊处理性别字段
        if (mapping.targetField === "gender" && typeof value === "string") {
          if (["男", "male", "m", "M"].includes(value.trim())) {
            value = "male";
          } else if (["女", "female", "f", "F"].includes(value.trim())) {
            value = "female";
          } else {
            value = "other";
          }
        }
        // 特殊处理数组字段 (兴趣、技能)
        if (
          ["interests", "skills"].includes(mapping.targetField) &&
          typeof value === "string"
        ) {
          value = value
            .split(/[,，、;；]/)
            .map((s) => s.trim())
            .filter(Boolean);
        }
        transformed[mapping.targetField] = value;
      });
      return transformed;
    });
  }, [parsedData, fieldMappings]);

  /**
   * 提交导入
   */
  const handleSubmit = async () => {
    // 验证必填字段映射
    const nameMapping = fieldMappings.find((m) => m.targetField === "name");
    if (!nameMapping || !nameMapping.sourceField) {
      Toast.show({ content: "请映射「姓名」字段", icon: "fail" });
      return;
    }

    setIsImporting(true);
    try {
      const enrollments = transformData();

      const response = await fetch(
        `/api/events/${activityId}/enrollments/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enrollments }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Toast.show({
          content: `成功导入 ${result.data?.imported_count || enrollments.length} 条数据`,
          icon: "success",
        });
        onSuccess(result.data?.imported_count || enrollments.length);
        handleClose();
      } else {
        Toast.show({ content: result.message || "导入失败", icon: "fail" });
      }
    } catch (error) {
      console.error("导入失败:", error);
      Toast.show({ content: "导入失败，请重试", icon: "fail" });
    } finally {
      setIsImporting(false);
    }
  };

  // ==================== 关闭和重置 ====================

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setSourceHeaders([]);
    setParsedData([]);
    setFieldMappings([]);
    onClose();
  };

  if (!visible) return null;

  // ==================== 渲染 ====================

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">导入报名数据</h3>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={handleClose}
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-gray-50">
          {[
            { num: 1, label: "上传文件" },
            { num: 2, label: "字段映射" },
            { num: 3, label: "预览确认" },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s.num
                      ? "bg-primary-400 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span
                  className={`text-sm ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <ChevronRight size={16} className="text-gray-300 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 步骤内容 */}
        <div className="flex-1 overflow-auto p-4">
          {/* 步骤1: 上传文件 */}
          {step === 1 && (
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {isParsing ? (
                <div className="flex flex-col items-center">
                  <RefreshCw
                    size={48}
                    className="text-primary-400 animate-spin mb-4"
                  />
                  <p className="text-gray-600">正在解析文件...</p>
                </div>
              ) : (
                <>
                  <FileSpreadsheet
                    size={48}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <p className="text-gray-600 mb-2">
                    点击或拖拽 Excel 文件到这里
                  </p>
                  <p className="text-sm text-gray-400">
                    支持 .xlsx 和 .xls 格式
                  </p>
                  <button className="mt-4 px-4 py-2 bg-primary-400 text-white rounded-full text-sm font-medium hover:bg-primary-500 transition-colors">
                    <Upload size={16} className="inline mr-1" />
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

          {/* 步骤2: 字段映射 */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={16} className="text-yellow-500" />
                <p className="text-sm text-gray-600">
                  已自动匹配部分字段，请检查或手动调整映射关系
                </p>
              </div>

              {TARGET_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                  <select
                    className="flex-1 h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                    value={getMappedSource(field.key)}
                    onChange={(e) => updateMapping(field.key, e.target.value)}
                  >
                    <option value="">-- 选择字段 --</option>
                    {sourceHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* 步骤3: 预览确认 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">
                  即将导入 {parsedData.length} 条报名数据
                </span>
                <Check size={16} className="text-green-600" />
              </div>

              {/* 预览表格 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          #
                        </th>
                        {TARGET_FIELDS.slice(0, 5).map((field) => (
                          <th
                            key={field.key}
                            className="px-3 py-2 text-left font-medium text-gray-600"
                          >
                            {field.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transformData()
                        .slice(0, 5)
                        .map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="px-3 py-2 text-gray-500">
                              {idx + 1}
                            </td>
                            {TARGET_FIELDS.slice(0, 5).map((field) => (
                              <td
                                key={field.key}
                                className="px-3 py-2 text-gray-900 truncate max-w-[100px]"
                              >
                                {String(row[field.key] || "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 5 && (
                  <div className="px-3 py-2 bg-gray-50 text-center text-sm text-gray-500 border-t border-gray-100">
                    还有 {parsedData.length - 5} 条数据...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
          {step > 1 && (
            <button
              className="flex-1 h-10 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              onClick={() => setStep((s) => s - 1)}
            >
              <ChevronLeft size={16} />
              上一步
            </button>
          )}
          {step < 3 ? (
            <button
              className="flex-1 h-10 rounded-full bg-primary-400 text-white font-medium hover:bg-primary-500 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !file}
            >
              下一步
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="flex-1 h-10 rounded-full bg-primary-400 text-white font-medium hover:bg-primary-500 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Check size={16} />
                  确认导入
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportEnrollmentModal;
