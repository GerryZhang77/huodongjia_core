/**
 * 编辑兴趣标签弹窗
 * 用于用户编辑个人兴趣标签
 */

import { FC, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui";
import type { InterestTag } from "@/mocks/data/user-profile";

// 兴趣标签选项
const interestOptions = [
  "户外运动",
  "摄影",
  "读书",
  "美食",
  "旅行",
  "音乐",
  "电影",
  "健身",
  "游戏",
  "科技",
  "艺术",
  "社交",
  "创业",
  "投资",
  "设计",
  "编程",
  "写作",
  "绘画",
];

interface EditInterestsModalProps {
  open: boolean;
  onClose: () => void;
  currentTags: InterestTag[];
  onSave: (tags: string[]) => void;
}

export const EditInterestsModal: FC<EditInterestsModalProps> = ({
  open,
  onClose,
  currentTags,
  onSave,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // 初始化选中的标签
  useEffect(() => {
    if (open) {
      setSelectedTags(currentTags.map((tag) => tag.name));
    }
  }, [open, currentTags]);

  // 添加标签
  const handleAddTag = (tag: string) => {
    if (selectedTags.length >= 6) {
      return;
    }
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // 保存
  const handleSave = async () => {
    setSaving(true);

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSave(selectedTags);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="编辑兴趣标签"
      width="medium"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={selectedTags.length === 0}
            className="flex-1"
          >
            保存
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 提示 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">最多选择 6 个标签</span>
          <span className="text-primary-500 font-medium">
            {selectedTags.length}/6
          </span>
        </div>

        {/* 已选择的标签 */}
        {selectedTags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">已选择</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full hover:bg-primary-200 transition-colors"
                >
                  {tag}
                  <X size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 可选标签 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">可选标签</h4>
          <div className="flex flex-wrap gap-2">
            {interestOptions
              .filter((tag) => !selectedTags.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  disabled={selectedTags.length >= 6}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={14} />
                  {tag}
                </button>
              ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditInterestsModal;
