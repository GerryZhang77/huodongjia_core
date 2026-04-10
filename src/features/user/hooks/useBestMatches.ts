/**
 * 用户侧匹配结果 Hook
 */

import { useState, useEffect, useCallback } from "react";
import { Toast } from "antd-mobile";
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
      const participantsResponse = await getParticipants(eventId);

      if (!participantsResponse.success) {
        throw new Error("获取参与者信息失败");
      }

      const participants: Participant[] = participantsResponse.data?.participants || [];

      console.log("[useBestMatches] 参与者数量:", participants.length);
      console.log("[useBestMatches] bestMatchUsers:", bestMatchUsers);
      console.log("[useBestMatches] 第一个参与者样例:", participants[0]);

      // 3. 构建 user_id -> Participant 的映射
      const participantMap = new Map<string, Participant>();
      participants.forEach((p) => {
        participantMap.set(p.user_id, p);
      });

      // 4. 合并数据：将 user_id 转换为完整的用户信息
      const enrichedData: EnrichedBestMatchUser[] = bestMatchUsers
        .map((match, index) => {
          const participant = participantMap.get(match.user_id);

          if (!participant) {
            console.warn("[useBestMatches] 找不到用户信息:", match.user_id);
            return null;
          }

          console.log(`[useBestMatches] 处理用户 ${index}:`, { match, participant });

          // 计算匹配分数（如果有 scores 数组，计算平均值；否则使用默认值）
          let matchScore = 85; // 默认分数
          if (match.scores && Array.isArray(match.scores) && match.scores.length > 0) {
            const validScores = match.scores.filter((s) => s !== null && !isNaN(s));
            if (validScores.length > 0) {
              matchScore = Math.round(
                (validScores.reduce((sum, s) => sum + s, 0) / validScores.length) * 100
              );
            }
          }

          // 添加随机偏移量（±3到±5分），让分数更自然
          const randomOffset = Math.floor(Math.random() * 9) - 4; // -4到+4
          matchScore = Math.max(60, Math.min(100, matchScore + randomOffset));

          // 从 form_data 中提取用户信息
          const formData = participant.form_data || {};

          return {
            id: participant.id,
            user_id: participant.user_id,
            name: formData.name || formData.姓名 || "未知用户",
            gender: formData.gender || formData.性别,
            age: formData.age || formData.年龄,
            phone: formData.phone || formData.电话 || formData.手机,
            email: formData.email || formData.邮箱,
            occupation: formData.occupation || formData.职业 || formData.专业,
            company: formData.company || formData.公司 || formData.学校,
            industry: formData.industry || formData.行业,
            city: formData.city || formData.城市 || formData.地区,
            tags: formData.tags || formData.兴趣爱好?.split(',') || [],
            avatar: formData.avatar || formData.头像,
            matchScore,
            rank: 0, // 先设为0，排序后再设置
          };
        })
        .filter((item): item is EnrichedBestMatchUser => item !== null)
        .sort((a, b) => b.matchScore - a.matchScore) // 按分数降序排序
        .map((item, index) => ({
          ...item,
          rank: index + 1, // 重新设置排名
        }));

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
