/**
 * 匹配结果管理 Hook
 *
 * 提供获取、发布、操作匹配结果的功能
 */

import { useState, useCallback } from "react";
import { Toast } from "antd-mobile";
import { getMatchResult, publishMatchResult } from "../services/matchResultApi";
import type {
  MatchResultData,
  UngroupedMember,
  GroupMember,
} from "../types/matchResult";

/**
 * Hook 返回值类型
 */
export interface UseMatchResultReturn {
  /** 匹配结果数据 */
  matchResult: MatchResultData | null;

  /** 是否正在加载 */
  loading: boolean;

  /** 是否正在发布 */
  publishing: boolean;

  /** 获取匹配结果 */
  fetchMatchResult: () => Promise<void>;

  /** 发布匹配结果 */
  publish: (sendNotification: boolean) => Promise<boolean>;

  /** 锁定/解锁分组 */
  toggleGroupLock: (groupId: string) => void;

  /** 更新分组成员 */
  updateGroupMembers: (groupId: string, members: GroupMember[]) => void;

  /** 将未分组成员添加到分组 */
  addMemberToGroup: (groupId: string, member: UngroupedMember) => void;

  /** 将分组成员移除到未分组 */
  removeMemberFromGroup: (groupId: string, enrollmentId: string) => void;

  /** 交换两个成员的位置（可跨组） */
  swapMembers: (
    fromGroupId: string,
    fromEnrollmentId: string,
    toGroupId: string,
    toEnrollmentId: string
  ) => void;

  /** 重置匹配结果 */
  reset: () => void;
}

/**
 * 匹配结果管理 Hook
 *
 * @param activityId - 活动 ID
 * @returns Hook 返回值
 *
 * @example
 * ```typescript
 * const {
 *   matchResult,
 *   loading,
 *   fetchMatchResult,
 *   publish,
 *   toggleGroupLock
 * } = useMatchResult('evt_123');
 *
 * useEffect(() => {
 *   fetchMatchResult();
 * }, []);
 * ```
 */
export function useMatchResult(
  activityId: string | undefined
): UseMatchResultReturn {
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  /**
   * 获取匹配结果
   */
  const fetchMatchResult = useCallback(async () => {
    if (!activityId) {
      Toast.show({
        icon: "fail",
        content: "活动 ID 不能为空",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await getMatchResult(activityId);
      setMatchResult(response.data);
    } catch (error) {
      console.error("获取匹配结果失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "获取匹配结果失败",
      });
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  /**
   * 发布匹配结果
   */
  const publish = useCallback(
    async (sendNotification: boolean): Promise<boolean> => {
      if (!activityId || !matchResult) {
        Toast.show({
          icon: "fail",
          content: "没有可发布的匹配结果",
        });
        return false;
      }

      setPublishing(true);

      try {
        const response = await publishMatchResult(activityId, {
          groups: matchResult.groups,
          ungroupedMembers: matchResult.ungroupedMembers,
          sendNotification,
        });

        Toast.show({
          icon: "success",
          content: response.message,
        });

        // 更新本地状态为已发布
        setMatchResult((prev) =>
          prev ? { ...prev, isPublished: true } : null
        );

        return true;
      } catch (error) {
        console.error("发布匹配结果失败:", error);
        Toast.show({
          icon: "fail",
          content: error instanceof Error ? error.message : "发布匹配结果失败",
        });
        return false;
      } finally {
        setPublishing(false);
      }
    },
    [activityId, matchResult]
  );

  /**
   * 锁定/解锁分组
   */
  const toggleGroupLock = useCallback((groupId: string) => {
    setMatchResult((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        groups: prev.groups.map((group) =>
          group.groupId === groupId
            ? { ...group, isLocked: !group.isLocked }
            : group
        ),
      };
    });
  }, []);

  /**
   * 更新分组成员
   */
  const updateGroupMembers = useCallback(
    (groupId: string, members: GroupMember[]) => {
      setMatchResult((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          groups: prev.groups.map((group) =>
            group.groupId === groupId ? { ...group, members } : group
          ),
        };
      });
    },
    []
  );

  /**
   * 将未分组成员添加到分组
   */
  const addMemberToGroup = useCallback(
    (groupId: string, member: UngroupedMember) => {
      setMatchResult((prev) => {
        if (!prev) return null;

        // 转换 UngroupedMember 为 GroupMember
        const newMember: GroupMember = {
          enrollmentId: member.enrollmentId,
          name: member.name,
          avatar: member.avatar,
          tags: member.tags,
        };

        return {
          ...prev,
          groups: prev.groups.map((group) =>
            group.groupId === groupId
              ? { ...group, members: [...group.members, newMember] }
              : group
          ),
          ungroupedMembers: prev.ungroupedMembers.filter(
            (m) => m.enrollmentId !== member.enrollmentId
          ),
        };
      });
    },
    []
  );

  /**
   * 将分组成员移除到未分组
   */
  const removeMemberFromGroup = useCallback(
    (groupId: string, enrollmentId: string) => {
      setMatchResult((prev) => {
        if (!prev) return null;

        let removedMember: GroupMember | null = null;

        const updatedGroups = prev.groups.map((group) => {
          if (group.groupId === groupId) {
            const member = group.members.find(
              (m) => m.enrollmentId === enrollmentId
            );
            if (member) {
              removedMember = member;
            }
            return {
              ...group,
              members: group.members.filter(
                (m) => m.enrollmentId !== enrollmentId
              ),
            };
          }
          return group;
        });

        if (!removedMember) return prev;

        // 转换 GroupMember 为 UngroupedMember
        const ungroupedMember: UngroupedMember = {
          enrollmentId: removedMember.enrollmentId,
          name: removedMember.name,
          avatar: removedMember.avatar,
          tags: removedMember.tags,
        };

        return {
          ...prev,
          groups: updatedGroups,
          ungroupedMembers: [...prev.ungroupedMembers, ungroupedMember],
        };
      });
    },
    []
  );

  /**
   * 交换两个成员的位置（可跨组）
   */
  const swapMembers = useCallback(
    (
      fromGroupId: string,
      fromEnrollmentId: string,
      toGroupId: string,
      toEnrollmentId: string
    ) => {
      setMatchResult((prev) => {
        if (!prev) return null;

        // 如果在同一组内
        if (fromGroupId === toGroupId) {
          return {
            ...prev,
            groups: prev.groups.map((group) => {
              if (group.groupId === fromGroupId) {
                const fromIndex = group.members.findIndex(
                  (m) => m.enrollmentId === fromEnrollmentId
                );
                const toIndex = group.members.findIndex(
                  (m) => m.enrollmentId === toEnrollmentId
                );

                if (fromIndex === -1 || toIndex === -1) return group;

                const newMembers = [...group.members];
                [newMembers[fromIndex], newMembers[toIndex]] = [
                  newMembers[toIndex],
                  newMembers[fromIndex],
                ];

                return { ...group, members: newMembers };
              }
              return group;
            }),
          };
        }

        // 跨组交换
        let fromMember: GroupMember | null = null;
        let toMember: GroupMember | null = null;

        const updatedGroups = prev.groups.map((group) => {
          if (group.groupId === fromGroupId) {
            const member = group.members.find(
              (m) => m.enrollmentId === fromEnrollmentId
            );
            if (member) {
              fromMember = member;
              return {
                ...group,
                members: group.members.filter(
                  (m) => m.enrollmentId !== fromEnrollmentId
                ),
              };
            }
          }

          if (group.groupId === toGroupId) {
            const member = group.members.find(
              (m) => m.enrollmentId === toEnrollmentId
            );
            if (member) {
              toMember = member;
              return {
                ...group,
                members: group.members.filter(
                  (m) => m.enrollmentId !== toEnrollmentId
                ),
              };
            }
          }

          return group;
        });

        if (!fromMember || !toMember) return prev;

        // 交换后添加到对方组
        const finalGroups = updatedGroups.map((group) => {
          if (group.groupId === fromGroupId) {
            return { ...group, members: [...group.members, toMember!] };
          }
          if (group.groupId === toGroupId) {
            return { ...group, members: [...group.members, fromMember!] };
          }
          return group;
        });

        return {
          ...prev,
          groups: finalGroups,
        };
      });
    },
    []
  );

  /**
   * 重置匹配结果
   */
  const reset = useCallback(() => {
    setMatchResult(null);
  }, []);

  return {
    matchResult,
    loading,
    publishing,
    fetchMatchResult,
    publish,
    toggleGroupLock,
    updateGroupMembers,
    addMemberToGroup,
    removeMemberFromGroup,
    swapMembers,
    reset,
  };
}
