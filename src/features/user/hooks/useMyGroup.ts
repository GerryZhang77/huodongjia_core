/**
 * 用户侧分组结果 Hook
 */

import { useState, useEffect, useCallback } from "react";
import { Toast } from "antd-mobile";
import { getMyGroup } from "../services/matchApi";

export interface GroupMember {
  id: string;
  user_id: string;
  name: string;
  gender?: string;
  age?: number;
  phone?: string;
  occupation?: string;
  company?: string;
  industry?: string;
  city?: string;
  tags?: string[];
  avatar?: string;
  bio?: string;
  score?: number;
}

export interface MyGroupData {
  groupId: number;
  groupName: string;
  members: GroupMember[];
}

export interface MyGroupResponse {
  weights?: number[];
  groups: MyGroupData[];
}

/**
 * 获取用户的分组信息
 */
export function useMyGroup(eventId: string | undefined) {
  const [data, setData] = useState<MyGroupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyGroup = useCallback(async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getMyGroup(eventId);

      console.log("[useMyGroup] API 响应:", response);

      if (!response.success) {
        throw new Error(response.message || "获取分组信息失败");
      }

      const groupData: MyGroupResponse = response.data || { groups: [] };

      console.log("[useMyGroup] ✅ 成功设置数据:", groupData);
      setData(groupData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取分组信息失败";
      setError(errorMessage);
      console.error("[useMyGroup] 获取分组信息失败:", err);
      Toast.show({
        icon: "fail",
        content: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchMyGroup();
  }, [fetchMyGroup]);

  return {
    data,
    loading,
    error,
    refetch: fetchMyGroup,
  };
}
