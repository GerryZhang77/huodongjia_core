import { FC } from "react";
import { clsx } from "clsx";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Edit3,
  ImagePlus,
  Images,
  LogIn,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Tag } from "@/components/ui";
import { ImageGallery } from "@/components/business/ImageGallery";
import { FollowButton, MessageButton, useSocialStats } from "@/features/social";
import { getUserAvatar } from "@/utils/avatar";
import type { PublicProfileField, UserProfile } from "@/services/userApi";

export interface PublicProfileCardProps {
  profile: UserProfile;
  variant?: "default" | "nfc";
  isSelf?: boolean;
  authenticated?: boolean;
  fallbackName?: string | null;
  contextLabel?: string;
  className?: string;
  showStats?: boolean;
  onLogin?: () => void;
  onEdit?: () => void;
  onAddPhotos?: () => void;
  onRemovePhoto?: (index: number) => void;
  photoActionLabel?: string;
  photoActionLoading?: boolean;
  photoActionDisabled?: boolean;
  avatarOverlap?: boolean;
}

function getFieldLabel(field: PublicProfileField): string {
  return field.field_label || field.field_key;
}

const ProfileMeta: FC<{
  icon: React.ElementType;
  text: string;
}> = ({ icon: Icon, text }) => (
  <span className="inline-flex min-w-0 items-center gap-1">
    <Icon size={13} className="flex-shrink-0" />
    <span className="truncate">{text}</span>
  </span>
);

export const PublicProfileCard: FC<PublicProfileCardProps> = ({
  profile,
  variant = "default",
  isSelf = false,
  authenticated = true,
  fallbackName,
  contextLabel,
  className,
  showStats = true,
  onLogin,
  onEdit,
  onAddPhotos,
  onRemovePhoto,
  photoActionLabel,
  photoActionLoading = false,
  photoActionDisabled = false,
  avatarOverlap = true,
}) => {
  const displayName = profile.name?.trim() || fallbackName || "匿名用户";
  const avatar = getUserAvatar(profile.avatar, profile.id || displayName, 160);
  const statsUserId = showStats && authenticated ? profile.id : undefined;
  const { data: stats } = useSocialStats(statsUserId);
  const maxPhotos = 9;
  const photos = (profile.photos || []).filter(Boolean).slice(0, maxPhotos);
  const canAddPhotos = isSelf && onAddPhotos && photos.length < maxPhotos;
  const showPhotoActionInGallery = canAddPhotos;
  const canRemovePhotos = isSelf && onRemovePhoto && photos.length > 0;
  const publicFields = (profile.publicFields || []).filter((field) =>
    String(field.field_value || "").trim(),
  );
  const contactFields = [
    { key: "phone", label: "手机", value: profile.phone, icon: Phone },
    { key: "email", label: "邮箱", value: profile.email, icon: Mail },
    { key: "wechat", label: "微信", value: profile.wechat, icon: MessageCircle },
  ].filter((field) => String(field.value || "").trim());
  const hasAnyDetail = Boolean(
    profile.occupation ||
      profile.company ||
      profile.industry ||
      profile.city ||
      profile.bio ||
      (profile.tags && profile.tags.length > 0),
  );
  const profileMetaItems = [
    profile.occupation,
    profile.company,
    profile.industry,
    profile.city,
  ].filter((item): item is string => Boolean(String(item || "").trim()));

  const renderDefaultHeader = () => (
    <div className="overflow-visible rounded-2xl bg-white shadow-lg dark:bg-gray-800">
      <div className={clsx("px-4 pb-4", !avatarOverlap && "pt-4")}>
        <div className="flex items-end justify-between gap-3">
          <div
            className={clsx(
              "h-20 w-20 flex-shrink-0 rounded-2xl bg-white p-1.5 shadow-xl dark:bg-gray-800",
              avatarOverlap && "-mt-10",
            )}
          >
            <img
              src={avatar}
              alt={displayName}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {isSelf ? (
            onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="mb-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                <Edit3 size={14} />
                <span>编辑资料</span>
              </button>
            )
          ) : authenticated ? (
            <div className="mb-1 flex min-w-0 items-center gap-2">
              <FollowButton userId={profile.id} />
              <MessageButton userId={profile.id} />
            </div>
          ) : (
            onLogin && (
              <button
                type="button"
                onClick={onLogin}
                className="mb-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                <LogIn size={14} />
                <span>登录互动</span>
              </button>
            )
          )}
        </div>

        <div className="pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {displayName}
            </h2>
            {contextLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/25 dark:text-green-300">
                <BadgeCheck size={12} />
                {contextLabel}
              </span>
            )}
          </div>

          {stats && (
            <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.followingCount}
                </span>{" "}
                关注
              </span>
              <span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.followersCount}
                </span>{" "}
                粉丝
              </span>
              <span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.friendsCount}
                </span>{" "}
                好友
              </span>
            </div>
          )}

          {hasAnyDetail ? (
            <>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                {profile.occupation && (
                  <ProfileMeta icon={Briefcase} text={profile.occupation} />
                )}
                {profile.company && (
                  <ProfileMeta icon={Building2} text={profile.company} />
                )}
                {profile.industry && (
                  <ProfileMeta icon={Sparkles} text={profile.industry} />
                )}
                {profile.city && <ProfileMeta icon={MapPin} text={profile.city} />}
              </div>

              {profile.bio && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {profile.bio}
                </p>
              )}

              {(profile.tags?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.tags!.map((tag) => (
                    <Tag key={tag} color="primary" variant="soft" size="small">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              该用户尚未完善个人资料
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderNfcActions = () => {
    if (isSelf) {
      const actionCount = (onEdit ? 1 : 0) + (canAddPhotos ? 1 : 0);
      if (actionCount === 0) return null;

      return (
        <div
          className={clsx(
            "mt-5 grid gap-2",
            actionCount > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-primary transition-colors hover:bg-primary-600"
            >
              <Edit3 size={16} />
              <span>编辑资料</span>
            </button>
          )}
          {canAddPhotos && (
            <button
              type="button"
              onClick={onAddPhotos}
              disabled={photoActionDisabled || photoActionLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {photoActionLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              <span>{photoActionLoading ? "处理中" : photoActionLabel || "添加照片"}</span>
            </button>
          )}
        </div>
      );
    }

    if (authenticated) {
      return (
        <div className="mt-5 grid grid-cols-2 gap-2">
          <FollowButton userId={profile.id} className="h-11 w-full text-sm shadow-sm" />
          <MessageButton userId={profile.id} className="h-11 w-full text-sm shadow-sm" />
        </div>
      );
    }

    return (
      onLogin && (
        <button
          type="button"
          onClick={onLogin}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-primary transition-colors hover:bg-primary-600"
        >
          <LogIn size={16} />
          <span>登录后关注或私信</span>
        </button>
      )
    );
  };

  const renderNfcHeader = () => (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800">
      <div className="bg-gradient-to-br from-primary-500 via-primary-500 to-accent-500 px-4 pb-14 pt-7 text-center text-white">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Sparkles size={20} />
        </div>
        <p className="mt-2 text-xs font-medium text-white/80">
          {contextLabel || "NFC 名片"}
        </p>
      </div>

      <div className="-mt-12 px-4 pb-5 text-center">
        <div className="mx-auto h-24 w-24 rounded-3xl bg-white p-1.5 shadow-xl dark:bg-gray-800">
          <img
            src={avatar}
            alt={displayName}
            className="h-full w-full rounded-[18px] object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="mt-3 flex flex-col items-center gap-2">
          <h2 className="max-w-full break-words text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            {displayName}
          </h2>
          {contextLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 dark:bg-green-900/25 dark:text-green-300">
              <BadgeCheck size={12} />
              {contextLabel}
            </span>
          )}
        </div>

        {profileMetaItems.length > 0 ? (
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {profileMetaItems.slice(0, 3).join(" / ")}
          </p>
        ) : (
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
            该用户尚未完善个人资料
          </p>
        )}

        {profile.bio && (
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {profile.bio}
          </p>
        )}

        {(profile.tags?.length ?? 0) > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {profile.tags!.slice(0, 6).map((tag) => (
              <Tag key={tag} color="primary" variant="soft" size="small">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {stats && (
          <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-gray-50 py-3 text-center dark:divide-gray-700 dark:bg-gray-700/40">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="block text-base text-gray-900 dark:text-gray-100">
                {stats.followingCount}
              </strong>
              关注
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="block text-base text-gray-900 dark:text-gray-100">
                {stats.followersCount}
              </strong>
              粉丝
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="block text-base text-gray-900 dark:text-gray-100">
                {stats.friendsCount}
              </strong>
              好友
            </span>
          </div>
        )}

        {renderNfcActions()}
      </div>
    </div>
  );

  const renderEditablePhotos = () => (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
        >
          <img
            src={url}
            alt={`照片 ${index + 1}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <button
            type="button"
            onClick={() => onRemovePhoto?.(index)}
            disabled={photoActionDisabled || photoActionLoading}
            className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white shadow-sm transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`删除照片 ${index + 1}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className={clsx("space-y-4", className)}>
      {variant === "nfc" ? renderNfcHeader() : renderDefaultHeader()}

      {(contactFields.length > 0 || publicFields.length > 0) && (
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            公开信息
          </h3>
          <div className="space-y-3">
            {contactFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className="flex items-start gap-2 text-sm">
                  <Icon size={15} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">{field.label}</p>
                    <p className="break-words text-gray-700 dark:text-gray-200">
                      {field.value}
                    </p>
                  </div>
                </div>
              );
            })}
            {publicFields.map((field) => (
              <div key={field.field_key} className="text-sm">
                <p className="text-xs text-gray-400">{getFieldLabel(field)}</p>
                <p className="break-words text-gray-700 dark:text-gray-200">
                  {field.field_value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length > 0 ? (
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Images size={14} />
              照片墙
            </h3>
            {showPhotoActionInGallery && (
              <button
                type="button"
                onClick={onAddPhotos}
                disabled={photoActionDisabled || photoActionLoading}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary-50 px-3 text-xs font-medium text-primary-500 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary-900/25 dark:text-primary-300"
              >
                {photoActionLoading ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <ImagePlus size={13} />
                )}
                <span>{photoActionLoading ? "处理中" : photoActionLabel || "添加"}</span>
              </button>
            )}
          </div>
          {canRemovePhotos ? (
            renderEditablePhotos()
          ) : (
            <ImageGallery images={photos} gap={6} maxDisplay={9} size="large" />
          )}
        </div>
      ) : (
        isSelf &&
        showPhotoActionInGallery && (
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <button
              type="button"
              onClick={onAddPhotos}
              disabled={photoActionDisabled || photoActionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm font-medium text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-400"
            >
              {photoActionLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <ImagePlus size={18} />
              )}
              <span>{photoActionLoading ? "处理中" : photoActionLabel || "添加照片"}</span>
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default PublicProfileCard;
