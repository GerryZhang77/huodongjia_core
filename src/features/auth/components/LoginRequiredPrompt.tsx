import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface LoginRequiredPromptProps {
  open: boolean;
  targetPath: string;
  onContinueAsGuest: () => void;
  onLogin: () => void;
}

interface LoginPromptCopy {
  title: string;
  description: string;
}

function getLoginPromptCopy(targetPath: string): LoginPromptCopy {
  const pathname = targetPath.split("?")[0];

  if (pathname.includes("/activities/")) {
    return {
      title: "登录后查看活动",
      description: "登录后即可查看活动详情并继续操作。",
    };
  }

  if (
    pathname.includes("/notifications") ||
    pathname.includes("/messages")
  ) {
    return {
      title: "登录后查看消息",
      description: "登录后即可查看通知和互动记录。",
    };
  }

  if (pathname.includes("/profile") || pathname.includes("/settings")) {
    return {
      title: "登录后查看个人内容",
      description: "登录后即可查看和管理个人信息。",
    };
  }

  if (pathname.includes("/discover")) {
    return {
      title: "登录后继续探索",
      description: "登录后即可使用收藏和互动功能。",
    };
  }

  return {
    title: "登录后继续",
    description: "登录后即可使用完整功能。",
  };
}

export function LoginRequiredPrompt({
  open,
  targetPath,
  onContinueAsGuest,
  onLogin,
}: LoginRequiredPromptProps) {
  const copy = getLoginPromptCopy(targetPath);

  return (
    <Modal
      open={open}
      onClose={onContinueAsGuest}
      title={copy.title}
      width="small"
      closable
      maskClosable
      footer={
        <div className="grid w-full grid-cols-2 gap-3">
          <Button variant="light" block onClick={onContinueAsGuest}>
            保持游客模式
          </Button>
          <Button block onClick={onLogin}>
            去登录
          </Button>
        </div>
      }
    >
      <p className="text-center text-sm leading-6 text-gray-600 dark:text-gray-300">
        {copy.description}
      </p>
    </Modal>
  );
}
