import {
  FC,
  useState } from "react";
import { Dialog,
  Steps,
} from "antd-mobile";
import { Toast } from "@/components/ui/Toast";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { useFileUpload, useCreateParticipants } from "../../hooks";
import {
  findUnsafeSpreadsheetIntegerCells,
  getUnsafeSpreadsheetIntegerMessage,
} from "../../utils/spreadsheetImport";
import "./index.css";

interface ImportEnrollmentDialogProps {
  visible: boolean;
  activityId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewData {
  headers: string[];
  rows: Record<string, string | number>[];
  total: number;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
}

interface ImportError {
  row: number;
  field: string;
  value: string | number;
  reason: string;
}

const { Step } = Steps;

const ACCEPTED_FORMATS = [".xlsx", ".xls", ".csv"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 字段自动识别规则
const AUTO_DETECT_RULES: Record<string, string> = {
  "姓名|名字|name": "name",
  "性别|gender": "gender",
  "年龄|age": "age",
  "职业|occupation": "occupation",
  "手机|电话|phone|联系方式": "phone",
  "邮箱|email|e-mail": "email",
  "城市|city": "city",
  "行业|industry": "industry",
  "个人简介|bio|简介": "bio",
  "匹配需求|需求|matching": "matchingNeeds",
};

// 系统字段定义
const SYSTEM_FIELDS = [
  { value: "name", label: "姓名", required: true },
  { value: "gender", label: "性别", required: false },
  { value: "age", label: "年龄", required: false },
  { value: "occupation", label: "职业", required: false },
  { value: "phone", label: "手机", required: false },
  { value: "email", label: "邮箱", required: false },
  { value: "city", label: "城市", required: false },
  { value: "industry", label: "行业", required: false },
  { value: "bio", label: "个人简介", required: false },
  { value: "matchingNeeds", label: "匹配需求", required: false },
  { value: "_custom", label: "保留为自定义字段", required: false }, // 特殊选项
];

export const ImportEnrollmentDialog: FC<ImportEnrollmentDialogProps> = ({
  visible,
  activityId,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [filepath, setFilepath] = useState<string>(""); // 服务端文件路径
  const [filename, setFilename] = useState<string>(""); // 原始文件名
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping[]>([]);
  const [importResult, setImportResult] = useState<{
    total: number;
    imported: number;
    failed: number;
    errors: ImportError[];
  } | null>(null);

  // 使用新的 Hooks
  const { mutateAsync: uploadFile, isPending: isUploading } = useFileUpload();
  const { mutateAsync: createParticipants, isPending: isImporting } =
    useCreateParticipants(activityId);

  // 重置状态
  const handleReset = () => {
    setStep(0);
    setFile(null);
    setFilepath("");
    setFilename("");
    setPreviewData(null);
    setFieldMapping([]);
    setImportResult(null);
  };

  // 关闭对话框
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // 文件选择 → 立即上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 验证文件格式
    const fileExt = selectedFile.name.substring(
      selectedFile.name.lastIndexOf(".")
    );
    if (!ACCEPTED_FORMATS.includes(fileExt.toLowerCase())) {
      Toast.show({
        icon: "fail",
        content: `不支持的文件格式，请上传 ${ACCEPTED_FORMATS.join(", ")} 文件`,
      });
      return;
    }

    // 验证文件大小
    if (selectedFile.size > MAX_FILE_SIZE) {
      Toast.show({
        icon: "fail",
        content: "文件大小不能超过 5MB",
      });
      return;
    }

    setFile(selectedFile);

    try {
      // 【新流程】立即上传到服务器
      const uploadResponse = await uploadFile(selectedFile);

      console.log("上传响应完整数据:", uploadResponse);

      // 验证响应数据（扁平结构）
      if (!uploadResponse?.path) {
        throw new Error("上传响应数据格式错误：缺少 path 字段");
      }

      // 保存服务端文件路径
      setFilepath(uploadResponse.path); // 使用 path 字段
      setFilename(uploadResponse.originalname || selectedFile.name);

      Toast.show({
        icon: "success",
        content: "文件上传成功",
        duration: 1500,
      });

      // 本地解析预览（前端读取）
      await parseFileForPreview(selectedFile);
    } catch (error) {
      console.error("文件上传失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "文件上传失败",
      });
      setFile(null);
    }
  };

  // 解析文件（仅用于预览）
  const parseFileForPreview = async (file: File) => {
    try {
      const fileExt = file.name.substring(file.name.lastIndexOf("."));
      let data: PreviewData;

      if (fileExt === ".csv") {
        data = await parseCSVFile(file);
      } else {
        data = await parseExcelFile(file);
      }

      setPreviewData(data);

      // 自动生成字段映射
      const mapping = autoDetectFields(data.headers);
      setFieldMapping(mapping);

      // 自动进入下一步
      setStep(1);

      Toast.show({
        icon: "success",
        content: `成功解析文件，共 ${data.total} 条数据`,
      });
    } catch (error) {
      console.error("文件解析失败:", error);
      Toast.show({
        icon: "fail",
        content:
          error instanceof Error
            ? error.message
            : "文件解析失败，请检查文件格式",
      });
    }
  };

  // 解析 Excel 文件
  const parseExcelFile = (file: File): Promise<PreviewData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });

          // 读取第一个 sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // 转换为 JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as (string | number)[][];

          if (jsonData.length === 0) {
            reject(new Error("文件为空"));
            return;
          }

          // 提取表头和数据
          const headers = jsonData[0] as string[];
          const dataRows = jsonData.slice(1);

          const rows = dataRows.map((row: (string | number)[]) => {
            const obj: Record<string, string | number> = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || "";
            });
            return obj;
          });

          const unsafeIntegerCells = findUnsafeSpreadsheetIntegerCells(rows);
          if (unsafeIntegerCells.length > 0) {
            reject(
              new Error(getUnsafeSpreadsheetIntegerMessage(unsafeIntegerCells)),
            );
            return;
          }

          resolve({
            headers,
            rows: rows.slice(0, 20), // 仅预览前 20 行
            total: rows.length,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  // 解析 CSV 文件
  const parseCSVFile = (file: File): Promise<PreviewData> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          try {
            const data = results.data as (string | number)[][];

            if (data.length === 0) {
              reject(new Error("文件为空"));
              return;
            }

            const headers = data[0] as string[];
            const dataRows = data.slice(1);

            const rows = dataRows.map((row: (string | number)[]) => {
              const obj: Record<string, string | number> = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || "";
              });
              return obj;
            });

            resolve({
              headers,
              rows: rows.slice(0, 20),
              total: rows.length,
            });
          } catch (error) {
            reject(error);
          }
        },
        error: reject,
      });
    });
  };

  // 自动检测字段映射
  const autoDetectFields = (headers: string[]): FieldMapping[] => {
    return headers.map((header) => {
      const headerLower = header.toLowerCase();
      let targetField = "";

      // 尝试自动匹配
      for (const [pattern, field] of Object.entries(AUTO_DETECT_RULES)) {
        const patterns = pattern.split("|");
        if (patterns.some((p) => headerLower.includes(p))) {
          targetField = field;
          break;
        }
      }

      // 如果未识别，默认保留为自定义字段
      if (!targetField) {
        targetField = "_custom";
      }

      const systemField = SYSTEM_FIELDS.find((f) => f.value === targetField);

      return {
        sourceField: header,
        targetField,
        required: systemField?.required || false,
      };
    });
  };

  // 更新字段映射
  const handleFieldMappingChange = (index: number, targetField: string) => {
    const newMapping = [...fieldMapping];
    const systemField = SYSTEM_FIELDS.find((f) => f.value === targetField);
    newMapping[index] = {
      ...newMapping[index],
      targetField,
      required: systemField?.required || false,
    };
    setFieldMapping(newMapping);
  };

  // 验证字段映射
  const validateFieldMapping = (): boolean => {
    // 检查必填字段是否都有映射
    const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);
    const mappedRequiredFields = fieldMapping
      .filter((m) => m.targetField && m.required)
      .map((m) => m.targetField);

    const missingFields = requiredFields.filter(
      (f) => !mappedRequiredFields.includes(f.value)
    );

    if (missingFields.length > 0) {
      Toast.show({
        icon: "fail",
        content: `请映射必填字段: ${missingFields
          .map((f) => f.label)
          .join("、")}`,
      });
      return false;
    }

    return true;
  };

  // 进入下一步
  const handleNext = () => {
    if (step === 1) {
      if (!validateFieldMapping()) {
        return;
      }
    }
    setStep(step + 1);
  };

  // 返回上一步
  const handlePrev = () => {
    setStep(step - 1);
  };

  // 执行导入（新流程：提交字段映射和服务端文件路径）
  const handleImport = async () => {
    if (!previewData || !fieldMapping || !filepath) return;

    setStep(3); // 进入导入中状态

    try {
      // 【新流程】构建字段映射对象：{ "Excel列名": "字段名" }
      const mappingObject: Record<string, string> = {};
      fieldMapping.forEach((mapping) => {
        if (mapping.targetField && mapping.targetField !== "") {
          mappingObject[mapping.sourceField] = mapping.targetField;
        }
      });

      // 提交字段映射和文件路径
      const response = await createParticipants({
        filepath,
        fieldMapping: mappingObject,
      });

      // 设置导入结果
      const result = {
        total: response.data.total,
        imported: response.data.imported,
        failed: response.data.failed,
        errors:
          response.data.errors?.map((error) => ({
            row: error.row,
            field: error.field || "unknown",
            value: error.name || "N/A",
            reason: error.reason,
          })) || [],
      };

      setImportResult(result);

      Toast.show({
        icon: "success",
        content: `成功导入 ${response.data.imported} 条数据${
          response.data.failed > 0 ? `，${response.data.failed} 条失败` : ""
        }`,
        duration: 2000,
      });

      // 通知父组件刷新（Hook 会自动刷新缓存）
      onSuccess();

      // 延迟关闭弹窗
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("导入失败:", error);
      Toast.show({
        icon: "fail",
        content:
          error instanceof Error ? error.message : "导入失败，请稍后重试",
      });

      // 设置错误结果
      setImportResult({
        total: previewData.total,
        imported: 0,
        failed: previewData.total,
        errors: [
          {
            row: 0,
            field: "system",
            value: "N/A",
            reason: error instanceof Error ? error.message : "未知错误",
          },
        ],
      });

      // 返回映射步骤，允许重新导入
      setTimeout(() => {
        setStep(2);
      }, 2000);
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="import-step import-step-upload">
            {isUploading ? (
              <div className="uploading">
                <div className="loading-spinner"></div>
                <div className="uploading-text">
                  正在上传文件{filename && `: ${filename}`}...
                </div>
              </div>
            ) : (
              <div className="upload-area">
                <input
                  type="file"
                  accept={ACCEPTED_FORMATS.join(",")}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <label htmlFor="file-input" className="upload-label">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    {file ? file.name : "点击选择文件或拖拽文件到此处"}
                  </div>
                  <div className="upload-hint">
                    支持格式: {ACCEPTED_FORMATS.join(", ")} (最大 5MB)
                  </div>
                </label>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="import-step import-step-mapping">
            <div className="mapping-list">
              {fieldMapping.map((mapping, index) => (
                <div key={index} className="mapping-item">
                  <div className="mapping-source">
                    <span className="field-label">Excel 列:</span>
                    <span className="field-value">{mapping.sourceField}</span>
                  </div>
                  <div className="mapping-arrow">→</div>
                  <div className="mapping-target">
                    <span className="field-label">系统字段:</span>
                    <select
                      value={mapping.targetField}
                      onChange={(e) =>
                        handleFieldMappingChange(index, e.target.value)
                      }
                      className="field-select"
                    >
                      <option value="">不导入</option>
                      {SYSTEM_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                          {field.required && " *"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="mapping-hint">* 标记为必填字段</div>
          </div>
        );

      case 2:
        return (
          <div className="import-step import-step-preview">
            <div className="preview-stats">
              <div className="stat-item">
                <span className="stat-label">总行数:</span>
                <span className="stat-value">{previewData?.total || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">预览行数:</span>
                <span className="stat-value">
                  {previewData?.rows.length || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">自定义字段:</span>
                <span className="stat-value stat-custom">
                  {
                    fieldMapping.filter((m) => m.targetField === "_custom")
                      .length
                  }
                </span>
              </div>
            </div>
            {fieldMapping.some((m) => m.targetField === "_custom") && (
              <div className="custom-fields-hint">
                💡 未识别的字段将保存为自定义字段，主办方可在详情中查看
              </div>
            )}
            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>行号</th>
                    {fieldMapping
                      .filter((m) => m.targetField && m.targetField !== "")
                      .map((mapping, index) => (
                        <th key={index}>
                          {mapping.targetField === "_custom"
                            ? `${mapping.sourceField} (自定义)`
                            : SYSTEM_FIELDS.find(
                                (f) => f.value === mapping.targetField
                              )?.label}
                          {mapping.required && (
                            <span className="required-mark"> *</span>
                          )}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData?.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{rowIndex + 1}</td>
                      {fieldMapping
                        .filter((m) => m.targetField)
                        .map((mapping, colIndex) => (
                          <td key={colIndex}>
                            {row[mapping.sourceField] || "-"}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="import-step import-step-result">
            {isImporting ? (
              <div className="importing">
                <div className="loading-spinner"></div>
                <div className="importing-text">正在导入数据，请稍候...</div>
              </div>
            ) : (
              <div className="import-result">
                <div className="result-icon">✅</div>
                <div className="result-title">导入完成</div>
                <div className="result-stats">
                  <div className="result-stat">
                    <span className="stat-label">总计:</span>
                    <span className="stat-value">
                      {importResult?.total || 0} 条
                    </span>
                  </div>
                  <div className="result-stat success">
                    <span className="stat-label">成功:</span>
                    <span className="stat-value">
                      {importResult?.imported || 0} 条
                    </span>
                  </div>
                  <div className="result-stat error">
                    <span className="stat-label">失败:</span>
                    <span className="stat-value">
                      {importResult?.failed || 0} 条
                    </span>
                  </div>
                </div>
                {importResult && importResult.errors.length > 0 && (
                  <div className="error-list">
                    <div className="error-list-title">错误详情:</div>
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="error-item">
                        第 {error.row} 行 - {error.field}: {error.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={handleClose}
      title="导入报名信息"
      content={
        <div className="import-enrollment-dialog">
          <Steps current={step}>
            <Step title="上传" />
            <Step title="字段选择" />
            <Step title="预览" />
            <Step title="完成" />
          </Steps>
          <div className="step-content">{renderStepContent()}</div>
        </div>
      }
      actions={[
        [
          {
            key: "cancel",
            text: step === 3 && !isImporting ? "关闭" : "取消",
            onClick: handleClose,
            disabled: isUploading || isImporting,
          },
          ...(step > 0 && step < 3
            ? [
                {
                  key: "prev",
                  text: "上一步",
                  onClick: handlePrev,
                  disabled: isUploading || isImporting,
                },
              ]
            : []),
          ...(step < 2
            ? [
                {
                  key: "next",
                  text: "下一步",
                  onClick: handleNext,
                  disabled: step === 0 && !file,
                },
              ]
            : []),
          ...(step === 2
            ? [
                {
                  key: "import",
                  text: "确认导入",
                  onClick: handleImport,
                  disabled: isImporting,
                },
              ]
            : []),
        ],
      ]}
    />
  );
};
