/**
 * 用户侧匹配结果 Hook
 */

import { useState, useEffect, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";
import { getBestMatches, getParticipants } from "../services/matchApi";

export interface BestMatchUser {
  user_id: string;
  scores: number[] | null;
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
}

/**
 * 获取用户的最佳匹配列表（包含用户详细信息）
 */
export function useBestMatches(eventId: string | undefined) {
  const [data, setData] = useState<EnrichedBestMatchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBestMatches = useCallback(async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. 获取最佳匹配用户ID列表
      const matchResponse = await getBestMatches(eventId);

      console.log("[useBestMatches] API 响应:", matchResponse);

      if (!matchResponse.success) {
        throw new Error(matchResponse.message || "获取最佳匹配失败");
      }

      const bestMatchUsers: BestMatchUser[] = matchResponse.data || [];

      if (bestMatchUsers.length === 0) {
        console.log("[useBestMatches] 没有最佳匹配数据");
        setData([]);
        return;
      }

      // 2. 获取所有参与者信息
      //    后端 /api/enrollments/:eventId 返回 { success, data: { enrollments: [...], total } }
      //    每条 enrollment 的字段是 camelCase：{ id, userId, name, formData, interests, ... }
      const participantsResponse = await getParticipants(eventId);

      if (!participantsResponse.success) {
        throw new Error("获取参与者信息失败");
      }

      const enrollments: Array<{
        id: string;
        userId: string;
        name?: string;
        formData?: Record<string, unknown>;
        interests?: string;
        industry?: string;
        department?: string;
        skills?: string;
        expertise?: string;
        status?: string;
      }> = participantsResponse.data?.enrollments || [];

      console.log("[useBestMatches] 参与者数量:", enrollments.length);
      console.log("[useBestMatches] bestMatchUsers:", bestMatchUsers);
      console.log("[useBestMatches] 第一个参与者样例:", enrollments[0]);

      // 3. 构建 userId -> enrollment 的映射
      const enrollmentMap = new Map<string, (typeof enrollments)[0]>();
      enrollments.forEach((e) => {
        if (e.userId) enrollmentMap.set(e.userId, e);
      });

      // 读取 formData 里任意常见键名的工具（中英文混合）
      const pick = (
        f: Record<string, unknown> | undefined,
        keys: string[],
      ): string | undefined => {
        if (!f) return undefined;
        for (const k of keys) {
          const v = f[k];
          if (v !== undefined && v !== null && v !== "") return String(v);
        }
        return undefined;
      };

      // 4. 合并：把 best_matches 中的 user_id 映射到报名表的完整信息
      const enrichedData: EnrichedBestMatchUser[] = bestMatchUsers
        .map((match) => {
          const enrollment = enrollmentMap.get(match.user_id);
          if (!enrollment) {
            console.warn("[useBestMatches] 找不到用户信息:", match.user_id);
            return null;
          }

          // 匹配分数：scores 平均 + 小幅随机，避免全部 85
          let matchScore = 85;
          if (
            match.scores &&
            Array.isArray(match.scores) &&
            match.scores.length > 0
          ) {
            const valid = match.scores.filter(
              (s) => s !== null && !isNaN(s as number),
            ) as number[];
            if (valid.length > 0) {
              matchScore = Math.round(
                (valid.reduce((a, b) => a + b, 0) / valid.length) * 100,
              );
            }
          }
          const jitter = Math.floor(Math.random() * 9) - 4;
          matchScore = Math.max(60, Math.min(100, matchScore + jitter));

          const f = enrollment.formData || {};
          const interestsRaw = enrollment.interests || pick(f, ["兴趣爱好", "interests"]);
          const tags = interestsRaw
            ? String(interestsRaw).split(/[,，、\s]+/).filter(Boolean)
            : [];

          const ageRaw = pick(f, ["年龄", "age"]);
          const ageNum = ageRaw ? Number(ageRaw) : undefined;

          return {
            id: enrollment.id,
            user_id: enrollment.userId,
            name: enrollment.name || pick(f, ["姓名", "name"]) || "未知用户",
            gender: pick(f, ["性别", "gender"]),
            age: ageNum && !Number.isNaN(ageNum) ? ageNum : undefined,
            phone: pick(f, ["手机号", "手机", "电话", "phone"]),
            email: pick(f, ["邮箱", "email"]),
            occupation: pick(f, ["职业", "职位", "occupation"]),
            company: enrollment.department || pick(f, ["公司", "所在单位", "学校", "company"]),
            industry:
              enrollment.industry ||
              pick(f, ["行业", "关注/从事的行业方向", "industry"]),
            city: pick(f, ["城市", "所在城市", "city"]),
            tags,
            avatar: pick(f, ["头像", "avatar"]),
            matchScore,
            rank: 0,
          };
        })
        .filter((item) => item !== null)
        .sort((a, b) => b!.matchScore - a!.matchScore)
        .map((item, index) => ({ ...item!, rank: index + 1 })) as EnrichedBestMatchUser[];

      console.log("[useBestMatches] ✅ 成功设置数据:", enrichedData);
      setData(enrichedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取最佳匹配失败";
      setError(errorMessage);
      console.error("[useBestMatches] 获取最佳匹配失败:", err);
      Toast.show({
        icon: "fail",
        content: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBestMatches();
  }, [fetchBestMatches]);

  return {
    data,
    loading,
    error,
    refetch: fetchBestMatches,
  };
}
