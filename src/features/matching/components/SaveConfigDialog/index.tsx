/**
 * SaveConfigDialog - 保存规则配置命名弹窗
 * 用于保存规则配置时输入配置名称
 */

import React, { useState, useEffect } from "react";
import { Save, FileText, Clock, Settings, X, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import type { MatchingRule } from "../../types";

export interface SavedConfig {
  id: string;
  name: string;
  rules: MatchingRule[];
  savedAt: string;
}

export interface SaveConfigDialogProps {
  visible: boolean;
  rules: MatchingRule[];
  savedConfigs?: SavedConfig[];
  onConfirm: (configName: string) => void;
  onCancel: () => void;
  onLoadConfig?: (config: SavedConfig) => void;
  onDeleteConfig?: (configId: string) => void;
  isLoading?: boolean;
}

/**
 * 已保存的配置卡片
 */
interface ConfigCardProps {
  config: SavedConfig;
  onLoad: () => void;
  onDelete?: () => void;
}

const ConfigCard: React.FC<ConfigCardProps> = ({
  config,
  onLoad,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const enabledRulesCount = config.rules.filter((r) => r.enabled).length;

  return (
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
            <FileText size={14} className="text-primary-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 line-clamp-1">
            {config.name}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="删除配置"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <div className="flex items-center gap-1">
          <Settings size={12} />
          <span>{enabledRulesCount} 条规则</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatDate(config.savedAt)}</span>
        </div>
      </div>

      <button
        onClick={onLoad}
        className="w-full py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
      >
        加载此配置
      </button>
    </div>
  );
};

/**
 * 保存配置命名弹窗
 */
export const SaveConfigDialog: React.FC<SaveConfigDialogProps> = ({
  visible,
  rules,
  savedConfigs = [],
  onConfirm,
  onCancel,
  onLoadConfig,
  onDeleteConfig,
  isLoading = false,
}) => {
  const [configName, setConfigName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSavedList, setShowSavedList] = useState(savedConfigs.length > 0);

  // 当弹窗打开时重置状态
  useEffect(() => {
    if (visible) {
      setConfigName("");
      setError(null);
      setShowSavedList(savedConfigs.length > 0);
    }
  }, [visible, savedConfigs.length]);

  // 处理确认保存
  const handleConfirm = () => {
    const trimmedName = configName.trim();

    if (!trimmedName) {
      setError("请输入配置名称");
      return;
    }

    if (trimmedName.length > 50) {
      setError("配置名称不能超过50个字符");
      return;
    }

    // 检查是否与已保存的配置重名
    if (savedConfigs.some((c) => c.name === trimmedName)) {
      setError("已存在同名配置，请使用其他名称");
      return;
    }

    setError(null);
    onConfirm(trimmedName);
  };

  // 计算启用的规则数量
  const enabledRulesCount = rules.filter((r) => r.enabled).length;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Save size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                保存规则配置
              </h3>
              <p className="text-sm text-gray-500">
                为当前配置命名以便日后使用
              </p>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 当前配置预览 */}
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl">
            <p className="text-sm font-medium text-primary-800 mb-1">
              当前配置
            </p>
            <p className="text-xs text-primary-600">
              包含 {enabledRulesCount} 条启用的规则
              {enabledRulesCount > 0 && (
                <span className="ml-2">
                  (
                  {rules
                    .filter((r) => r.enabled)
                    .map((r) => r.name)
                    .slice(0, 3)
                    .join("、")}
                  {enabledRulesCount > 3 && "..."})
                </span>
              )}
            </p>
          </div>

          {/* 配置名称输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              配置名称 <span className="text-red-500">*</span>
            </label>
            <Input
              value={configName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setConfigName(e.target.value);
                setError(null);
              }}
              placeholder="例如：行业交流匹配规则"
              size="large"
              status={error ? "error" : undefined}
              disabled={isLoading}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !isLoading) {
                  handleConfirm();
                }
              }}
            />
            {error && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* 已保存的配置列表 */}
          {savedConfigs.length > 0 && (
            <div>
              <button
                onClick={() => setShowSavedList(!showSavedList)}
                className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700"
              >
                <span>已保存的配置 ({savedConfigs.length})</span>
                <span className="text-xs text-gray-400">
                  {showSavedList ? "收起" : "展开"}
                </span>
              </button>

              {showSavedList && (
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {savedConfigs.map((config) => (
                    <ConfigCard
                      key={config.id}
                      config={config}
                      onLoad={() => onLoadConfig?.(config)}
                      onDelete={
                        onDeleteConfig
                          ? () => onDeleteConfig(config.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="outline"
            size="large"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            size="large"
            onClick={handleConfirm}
            disabled={isLoading || !configName.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Save size={18} className="animate-pulse" />
                保存中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={18} />
                保存配置
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaveConfigDialog;
