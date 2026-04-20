import { FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Briefcase, Building2, Tag as TagIcon, Images, ArrowLeft, Zap } from "lucide-react";
import { Tag } from "@/components/ui";

interface NfcUser {
  id: string;
  name: string;
  avatar?: string;
  occupation?: string;
  company?: string;
  bio?: string;
  tags?: string[];
  photos?: string[];
}

interface NfcData {
  otherUserInfo: NfcUser;
  otherEnrollmentInfo: Record<string, unknown>;
}

const UserCard: FC<{ user: NfcUser; label: string }> = ({ user, label }) => (
  <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-3">
    <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{label}</p>
    <img
      src={user.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.id}`}
      alt={user.name}
      className="w-20 h-20 rounded-full object-cover border-3 border-white/30 shadow-xl"
    />
    <div className="text-center">
      <p className="text-base font-bold text-white">{user.name}</p>
      {user.occupation && (
        <p className="text-xs text-white/70 flex items-center justify-center gap-1 mt-0.5">
          <Briefcase size={11} />{user.occupation}
        </p>
      )}
      {user.company && (
        <p className="text-xs text-white/60 flex items-center justify-center gap-1">
          <Building2 size={11} />{user.company}
        </p>
      )}
    </div>
    {user.tags && user.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 justify-center">
        {user.tags.slice(0, 3).map((t, i) => (
          <span key={i} className="px-2 py-0.5 bg-white/20 text-white text-[10px] rounded-full">{t}</span>
        ))}
      </div>
    )}
  </div>
);

const NFCResultPage: FC = () => {
  const { eventId, userId } = useParams<{ eventId: string; userId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["nfc", eventId, userId],
    queryFn: () => api.get<{ success: boolean; data: NfcData }>(`/api/nfc/${eventId}/${userId}`),
    enabled: !!eventId && !!userId,
  });

  const nfcData = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-accent-500 to-purple-600 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        <p className="text-white font-medium">正在获取信息...</p>
      </div>
    );
  }

  if (isError || !nfcData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-accent-500 to-purple-600 flex flex-col items-center justify-center gap-4 px-6">
        <Zap size={48} className="text-white/50" />
        <p className="text-white text-lg font-semibold">获取信息失败</p>
        <p className="text-white/60 text-sm text-center">请确认活动和用户信息是否正确</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2.5 bg-white/20 text-white rounded-full text-sm font-medium">
          返回
        </button>
      </div>
    );
  }

  const other = nfcData.otherUserInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-accent-500 to-purple-600 flex flex-col">
      {/* 顶部 */}
      <div className="flex items-center px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/20">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-white font-bold text-lg">NFC 碰一碰</p>
          <p className="text-white/60 text-xs mt-0.5">发现同频伙伴</p>
        </div>
        <div className="w-10" />
      </div>

      {/* 闪电图标 */}
      <div className="flex justify-center py-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
          <Zap size={28} className="text-white fill-white" />
        </div>
      </div>

      {/* 用户卡片 */}
      <div className="px-4 flex gap-3">
        <UserCard user={other} label="对方" />
      </div>

      {/* 简介 */}
      {other.bio && (
        <div className="mx-4 mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-1.5">个人简介</p>
          <p className="text-sm text-white leading-relaxed">{other.bio}</p>
        </div>
      )}

      {/* 照片墙 */}
      {other.photos && other.photos.length > 0 && (
        <div className="mx-4 mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-2 flex items-center gap-1.5">
            <Images size={12} />照片墙
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {other.photos.slice(0, 6).map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* 底部提示 */}
      <div className="px-4 pb-12 pt-4 text-center">
        <p className="text-white/50 text-xs">活动 ID: {eventId}</p>
      </div>
    </div>
  );
};

export default NFCResultPage;
