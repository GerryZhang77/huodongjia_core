import { FC } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Lock,
  LogIn,
  Link as LinkIcon,
  Radio,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { Toast } from "@/components/ui/Toast";
import { api } from "@/services/api";
import { bindNfcTag, resolveNfcTag, type NfcResolveData } from "@/services/nfcApi";
import type { UserProfile } from "@/services/userApi";
import { PublicProfileCard } from "@/features/user/profile";

interface LegacyNfcData {
  otherUserInfo: UserProfile;
  otherEnrollmentInfo: Record<string, unknown>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  const maybeAxios = error as { response?: { data?: { message?: string } }; message?: string };
  return maybeAxios?.response?.data?.message || maybeAxios?.message || fallback;
}

function buildRedirect(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}`;
}

const PageShell: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="mx-auto min-h-screen max-w-lg bg-white dark:bg-gray-800 shadow-sm">
      {children}
    </div>
  </div>
);

const Header: FC<{ title: string; subtitle?: string; onBack: () => void }> = ({
  title,
  subtitle,
  onBack,
}) => (
  <div className="relative bg-gradient-to-br from-primary-500 to-accent-500 px-4 pb-16 pt-12 text-white">
    <button
      type="button"
      onClick={onBack}
      className="absolute left-4 top-4 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
      aria-label="返回"
    >
      <ArrowLeft size={20} />
    </button>
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        <Radio size={24} />
      </div>
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-white/75">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const StatusPanel: FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ElementType;
  actionLoading?: boolean;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  actionLoading,
  onAction,
  secondaryLabel,
  onSecondary,
}) => (
  <div className="mx-4 -mt-10 rounded-2xl bg-white p-5 shadow-lg dark:bg-gray-800">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-900/30">
        <Icon size={28} />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionLoading}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLoading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : ActionIcon ? (
            <ActionIcon size={16} />
          ) : null}
          <span>{actionLabel}</span>
        </button>
      )}
      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          className="mt-3 text-sm font-medium text-primary-500"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  </div>
);

const TokenNfcPage: FC<{ token: string }> = ({ token }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const query = useQuery({
    queryKey: ["nfc", "tag", token],
    queryFn: () => resolveNfcTag(token),
    retry: 1,
  });

  const bindMutation = useMutation({
    mutationFn: () => bindNfcTag(token),
    onSuccess: (data) => {
      queryClient.setQueryData<NfcResolveData>(["nfc", "tag", token], data);
      Toast.show({ icon: "success", content: "手环绑定成功" });
    },
    onError: (error) => {
      Toast.show({
        icon: "fail",
        content: getErrorMessage(error, "绑定失败，请稍后重试"),
      });
      queryClient.invalidateQueries({ queryKey: ["nfc", "tag", token] });
    },
  });

  const redirect = buildRedirect(location);
  const goLogin = () => navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  const goRegister = () => navigate(`/register?redirect=${encodeURIComponent(redirect)}`);
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/u/home"));

  const handleBind = () => {
    if (!currentUser) {
      goLogin();
      return;
    }
    bindMutation.mutate();
  };

  if (query.isLoading) {
    return (
      <PageShell>
        <Header title="NFC 手环" subtitle="正在读取手环信息" onBack={goBack} />
        <StatusPanel
          icon={Radio}
          title="正在读取"
          description="正在识别这只 NFC 手环，请稍候。"
        />
      </PageShell>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageShell>
        <Header title="NFC 手环" subtitle="读取失败" onBack={goBack} />
        <StatusPanel
          icon={ShieldAlert}
          title="无法识别手环"
          description={getErrorMessage(query.error, "这只手环不存在、未激活或链接已失效。")}
          actionLabel="重新读取"
          actionIcon={RefreshCw}
          onAction={() => query.refetch()}
        />
      </PageShell>
    );
  }

  const data = query.data;
  const status = data.status;
  const profile = data.profile;
  const isSelf = data.viewer.isSelf;
  const authenticated = data.viewer.isAuthenticated || !!currentUser;

  if (status === "unbound") {
    return (
      <PageShell>
        <Header title="NFC 手环" subtitle="首次绑定" onBack={goBack} />
        <StatusPanel
          icon={LinkIcon}
          title="这是一只未绑定的手环"
          description={
            authenticated
              ? `将手环绑定到当前账号 ${currentUser?.name || currentUser?.account || ""}。绑定后，别人碰你的手环会看到你的个人卡片。`
              : "登录或注册后即可把这只手环绑定到你的账号。绑定后，别人碰你的手环会看到你的个人卡片。"
          }
          actionLabel={authenticated ? "绑定到我的账号" : "登录后绑定"}
          actionIcon={authenticated ? LinkIcon : LogIn}
          actionLoading={bindMutation.isPending}
          onAction={handleBind}
          secondaryLabel={authenticated ? undefined : "还没有账号，去注册"}
          onSecondary={authenticated ? undefined : goRegister}
        />
      </PageShell>
    );
  }

  if (status === "disabled" || status === "lost") {
    return (
      <PageShell>
        <Header title="NFC 手环" subtitle="不可用" onBack={goBack} />
        <StatusPanel
          icon={Lock}
          title={status === "lost" ? "手环已挂失" : "手环已停用"}
          description="这只 NFC 手环当前不可使用。如需恢复，请联系活动方或平台管理员。"
        />
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <Header title="NFC 手环" subtitle="资料不可用" onBack={goBack} />
        <StatusPanel
          icon={AlertCircle}
          title="暂时无法展示卡片"
          description="手环已绑定，但对应用户资料暂时不可用。"
          actionLabel="重新读取"
          actionIcon={RefreshCw}
          onAction={() => query.refetch()}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header
        title={isSelf ? "我的 NFC 手环" : "NFC 名片"}
        subtitle={isSelf ? "你可以编辑自己的卡片内容" : "查看对方卡片并发起互动"}
        onBack={goBack}
      />
      <PublicProfileCard
        profile={profile}
        isSelf={isSelf}
        authenticated={authenticated}
        contextLabel={isSelf ? "我的手环" : undefined}
        className="mx-4 -mt-10"
        onLogin={goLogin}
        onEdit={() =>
          navigate(`/u/profile/edit?redirect=${encodeURIComponent(redirect)}`)
        }
        onAddPhotos={() =>
          navigate(`/u/profile/edit?redirect=${encodeURIComponent(redirect)}`)
        }
      />
    </PageShell>
  );
};

const LegacyNfcPage: FC<{ eventId: string; userId: string }> = ({ eventId, userId }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nfc", "legacy", eventId, userId],
    queryFn: () =>
      api.get<{ success: boolean; data: LegacyNfcData }>(`/api/nfc/${eventId}/${userId}`),
    enabled: !!eventId && !!userId,
  });

  const profile = data?.data?.otherUserInfo;
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/u/home"));
  const redirect = `/nfc/${eventId}/${userId}`;
  const isSelf = !!currentUser && currentUser.id === profile?.id;

  if (isLoading) {
    return (
      <PageShell>
        <Header title="NFC 碰一碰" subtitle="正在获取信息" onBack={goBack} />
        <StatusPanel icon={Zap} title="正在读取" description="正在获取对方的活动名片。" />
      </PageShell>
    );
  }

  if (isError || !profile) {
    return (
      <PageShell>
        <Header title="NFC 碰一碰" subtitle="读取失败" onBack={goBack} />
        <StatusPanel
          icon={AlertCircle}
          title="获取信息失败"
          description={getErrorMessage(error, "请确认活动和用户信息是否正确。")}
          actionLabel="返回"
          onAction={goBack}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header title="NFC 碰一碰" subtitle="旧版活动名片链接" onBack={goBack} />
      <PublicProfileCard
        profile={profile}
        isSelf={isSelf}
        authenticated={!!currentUser}
        contextLabel={isSelf ? "我的手环" : undefined}
        className="mx-4 -mt-10"
        onLogin={() => navigate(`/login?redirect=${encodeURIComponent(redirect)}`)}
        onEdit={() =>
          navigate(`/u/profile/edit?redirect=${encodeURIComponent(redirect)}`)
        }
        onAddPhotos={() =>
          navigate(`/u/profile/edit?redirect=${encodeURIComponent(redirect)}`)
        }
      />
      <div className="px-4 pb-8 pt-4 text-center text-xs text-gray-400">
        活动 ID: {eventId}
      </div>
    </PageShell>
  );
};

const NFCResultPage: FC = () => {
  const { token, eventId, userId } = useParams<{
    token?: string;
    eventId?: string;
    userId?: string;
  }>();

  if (token) return <TokenNfcPage token={token} />;
  if (eventId && userId) return <LegacyNfcPage eventId={eventId} userId={userId} />;

  return (
    <PageShell>
      <Header title="NFC 手环" subtitle="参数错误" onBack={() => window.history.back()} />
      <StatusPanel icon={AlertCircle} title="链接无效" description="请确认 NFC 手环链接是否完整。" />
    </PageShell>
  );
};

export default NFCResultPage;
