/**
 * 用户侧匹配结果 Hook
 */

import { useQuery } from "@tanstack/react-query";
import {
  getBestMatches,
  type MatchScorePayload,
} from "../services/matchApi";

export interface BestMatchUser {
  user_id: string;
  scores: MatchScorePayload | null;
  participant?: {
    id: string;
    userId: string;
    name?: string;
    avatar?: string | null;
    age?: number | null;
    occupation?: string;
    company?: string;
    industry?: string;
    city?: string;
    tags?: string[];
    formData?: Record<string, unknown>;
    status?: string;
  } | null;
}

export interface Participant {
  id: string;
  user_id: string;
  name: string;
  gender?: string;
  age?: number;
  phone?: string;
  email?: string;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  tags?: string[];
  avatar?: string;
}

export interface EnrichedBestMatchUser extends Participant {
  matchScore: number;
  rank: number;
  scoreDetail?: MatchScorePayload | null;
  isManualRecommendation: boolean;
}

const parseMatchScorePayload = (
  rawScores: unknown,
): MatchScorePayload | null => {
  if (!rawScores) return null;

  if (typeof rawScores === "string") {
    try {
      return parseMatchScorePayload(JSON.parse(rawScores));
    } catch {
      return null;
    }
  }

  if (Array.isArray(rawScores)) {
    const numericValues = rawScores
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    const totalScore =
      numericValues.length > 0
        ? numericValues.reduce((sum, value) => sum + value, 0) /
          numericValues.length
        : 0;

    return {
      total_score: totalScore,
      total_score_percent: Math.round(totalScore * 100),
      fields: [],
    };
  }

  if (typeof rawScores === "object") {
    const payload = rawScores as Partial<MatchScorePayload>;
    const totalScore = Number(payload.total_score);
    const fields = Array.isArray(payload.fields) ? payload.fields : [];
    return {
      total_score: Number.isFinite(totalScore) ? totalScore : 0,
      total_score_percent: Math.round(
        (Number.isFinite(totalScore) ? totalScore : 0) * 100,
      ),
      fields,
    };
  }

  return null;
};

const pickFieldValue = (
  formData: Record<string, unknown> | undefined,
  keys: string[],
): string | undefined => {
  if (!formData) return undefined;
  for (const key of keys) {
    const value = formData[key];
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }
  return undefined;
};

export async function fetchBestMatchesWithParticipants(
  eventId: string,
): Promise<EnrichedBestMatchUser[]> {
  const matchResponse = await getBestMatches(eventId);
  if (!matchResponse.success) {
    throw new Error(matchResponse.message || "获取最佳匹配失败");
  }

  const bestMatchUsers: BestMatchUser[] = matchResponse.data || [];
  if (bestMatchUsers.length === 0) {
    return [];
  }

  return bestMatchUsers
    .map((match) => {
      const enrollment = match.participant;
      if (!enrollment) {
        return null;
      }

      const scoreDetail = parseMatchScorePayload(match.scores);
      const matchScore = Math.max(
        0,
        Math.min(100, scoreDetail?.total_score_percent ?? 0),
      );

      const formData = enrollment.formData || {};
      const interestsRaw =
        pickFieldValue(formData, ["兴趣爱好", "interests"]);
      const tags = enrollment.tags?.length
        ? enrollment.tags
        : interestsRaw
          ? String(interestsRaw).split(/[,，、\s]+/).filter(Boolean)
          : [];

      const ageRaw = pickFieldValue(formData, ["年龄", "age"]);
      const ageNum = ageRaw ? Number(ageRaw) : undefined;

      return {
        id: enrollment.id,
        user_id: enrollment.userId,
        name:
          enrollment.name ||
          pickFieldValue(formData, ["姓名", "name"]) ||
          "未知用户",
        gender: pickFieldValue(formData, ["性别", "gender"]),
        age:
          enrollment.age !== null && enrollment.age !== undefined
            ? enrollment.age
            : ageNum && !Number.isNaN(ageNum)
              ? ageNum
              : undefined,
        phone: pickFieldValue(formData, ["手机号", "手机", "电话", "phone"]),
        email: pickFieldValue(formData, ["邮箱", "email"]),
        occupation:
          enrollment.occupation ||
          pickFieldValue(formData, ["职业", "职位", "occupation"]),
        company:
          enrollment.company ||
          pickFieldValue(formData, ["公司", "所在单位", "学校", "company"]),
        industry:
          enrollment.industry ||
          pickFieldValue(formData, ["行业", "关注/从事的行业方向", "industry"]),
        city:
          enrollment.city ||
          pickFieldValue(formData, ["城市", "所在城市", "city"]),
        tags,
        avatar:
          enrollment.avatar ||
          pickFieldValue(formData, ["头像", "avatar"]),
        matchScore,
        rank: 0,
        scoreDetail,
        isManualRecommendation: !scoreDetail,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

/**
 * 获取用户的最佳匹配列表（包含用户详细信息）
 */
export function useBestMatches(eventId: string | undefined) {
  const query = useQuery<EnrichedBestMatchUser[], Error>({
    queryKey: ["user", "best-matches", eventId],
    queryFn: () => fetchBestMatchesWithParticipants(eventId!),
    enabled: Boolean(eventId),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  return {
    data: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
}
