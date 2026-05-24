import { http, HttpResponse, delay } from "msw";
import { getUserProfile } from "../data/user-profile";
import type { NfcResolveData, NfcTagStatus } from "@/services/nfcApi";
import type { UserProfile } from "@/services/userApi";

interface MockNfcTag {
  tokenPrefix: string | null;
  status: NfcTagStatus;
  ownerUserId: string | null;
  boundAt: string | null;
  label: string | null;
  metadata: Record<string, unknown>;
}

const otherProfile: UserProfile = {
  id: "user_002",
  name: "赵敏",
  avatar: "https://i.pravatar.cc/200?img=47",
  occupation: "品牌负责人",
  company: "新消费实验室",
  industry: "品牌增长",
  city: "上海",
  bio: "关注品牌增长、线下社群和消费体验，正在寻找跨界合作伙伴。",
  tags: ["品牌", "增长", "社群", "新消费"],
  photos: [
    "https://picsum.photos/seed/nfc-other-1/600/600",
    "https://picsum.photos/seed/nfc-other-2/600/600",
    "https://picsum.photos/seed/nfc-other-3/600/600",
    "https://picsum.photos/seed/nfc-other-4/600/600",
  ],
  publicFields: [
    {
      field_key: "cooperation",
      field_label: "合作方向",
      field_value: "品牌联名、线下沙龙、渠道资源互换",
      field_type: "text",
    },
  ],
};

const mockTags = new Map<string, MockNfcTag>([
  [
    "mock-self-bound-001",
    {
      tokenPrefix: "mock-self",
      status: "bound",
      ownerUserId: "user_001",
      boundAt: "2026-05-16T08:00:00.000Z",
      label: "我的测试手环",
      metadata: {},
    },
  ],
  [
    "mock-other-bound-001",
    {
      tokenPrefix: "mock-other",
      status: "bound",
      ownerUserId: "user_002",
      boundAt: "2026-05-16T09:00:00.000Z",
      label: "他人测试手环",
      metadata: {},
    },
  ],
  [
    "mock-unbound-001",
    {
      tokenPrefix: "mock-unbound",
      status: "unbound",
      ownerUserId: null,
      boundAt: null,
      label: "未绑定测试手环",
      metadata: {},
    },
  ],
  [
    "mock-disabled-001",
    {
      tokenPrefix: "mock-disabled",
      status: "disabled",
      ownerUserId: "user_002",
      boundAt: "2026-05-16T09:00:00.000Z",
      label: "停用测试手环",
      metadata: {},
    },
  ],
]);

function getViewerId(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  if (authHeader.includes("user_001")) return "user_001";
  if (authHeader.includes("user_002")) return "user_002";
  return "user_001";
}

function getProfile(ownerUserId: string | null): UserProfile | null {
  if (!ownerUserId) return null;
  if (ownerUserId === "user_001") {
    const profile = getUserProfile();
    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      occupation: profile.occupation,
      company: profile.company,
      city: profile.city,
      bio: profile.bio,
      tags: profile.tags,
      photos: profile.photos,
    };
  }
  return otherProfile;
}

function buildPayload(tag: MockNfcTag, viewerId: string | null): NfcResolveData {
  const isAuthenticated = !!viewerId;
  const isBound = tag.status === "bound" && !!tag.ownerUserId;
  const isSelf = !!viewerId && !!tag.ownerUserId && viewerId === tag.ownerUserId;

  return {
    tag,
    status: tag.status,
    profile: isBound ? getProfile(tag.ownerUserId) : null,
    viewer: {
      isAuthenticated,
      isSelf,
    },
    actions: {
      canBind: tag.status === "unbound" && !tag.ownerUserId && isAuthenticated,
      requiresLoginToBind: tag.status === "unbound" && !tag.ownerUserId && !isAuthenticated,
      canEdit: isBound && isSelf,
      canFollow: isBound && !isSelf,
      canMessage: isBound && !isSelf,
      requiresLoginForSocial: isBound && !isSelf && !isAuthenticated,
    },
  };
}

export const nfcHandlers = [
  http.get("/api/nfc/t/:token", async ({ params, request }) => {
    await delay(250);
    const token = String(params.token || "");
    const tag = mockTags.get(token);
    const viewerId = getViewerId(request);

    if (!tag) {
      return HttpResponse.json(
        {
          success: false,
          message: "NFC 手环不存在或未激活",
          data: {
            status: "invalid",
            viewer: { isAuthenticated: !!viewerId, isSelf: false },
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: buildPayload(tag, viewerId),
    });
  }),

  http.post("/api/nfc/t/:token/bind", async ({ params, request }) => {
    await delay(350);
    const viewerId = getViewerId(request);
    if (!viewerId) {
      return HttpResponse.json(
        { success: false, message: "未授权访问" },
        { status: 401 },
      );
    }

    const token = String(params.token || "");
    const tag = mockTags.get(token);
    if (!tag) {
      return HttpResponse.json(
        { success: false, message: "NFC 手环不存在或未激活" },
        { status: 404 },
      );
    }
    if (tag.status !== "unbound" || tag.ownerUserId) {
      return HttpResponse.json(
        { success: false, message: "该 NFC 手环已被其他账号绑定" },
        { status: 409 },
      );
    }

    tag.status = "bound";
    tag.ownerUserId = viewerId;
    tag.boundAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      message: "NFC 手环绑定成功",
      data: buildPayload(tag, viewerId),
    });
  }),

  http.get("/api/nfc/:eventId/:userId", async ({ params }) => {
    await delay(250);
    const profile = getProfile(String(params.userId || ""));
    if (!profile) {
      return HttpResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        otherUserInfo: profile,
        otherEnrollmentInfo: {
          event_id: params.eventId,
          user_id: params.userId,
          status: "approved",
        },
      },
    });
  }),
];
