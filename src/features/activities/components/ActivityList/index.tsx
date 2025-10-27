/**
 * ActivityList Component
 * 活动列表组件
 */

import { FC, useState } from "react";
import {
  List,
  PullToRefresh,
  InfiniteScroll,
  Empty,
  ErrorBlock,
} from "antd-mobile";
import { ActivityCard } from "../ActivityCard";
import { useActivities } from "../../hooks";
import type { Activity, ActivityStatus } from "../../types";

interface ActivityListProps {
  searchText?: string;
  activeTab?: ActivityStatus | "all";
}

export const ActivityList: FC<ActivityListProps> = ({
  searchText = "",
  activeTab = "all",
}) => {
  const { data, isLoading, error, refetch } = useActivities();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 下拉刷新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // 加载更多 (暂时不支持分页)
  const loadMore = async () => {
    // TODO: 实现分页加载
  };

  // 过滤活动
  const getFilteredActivities = (): Activity[] => {
    if (!data?.activities) return [];

    return data.activities.filter((activity) => {
      // 搜索过滤
      const matchesSearch = activity.title
        .toLowerCase()
        .includes(searchText.toLowerCase());

      // 标签页过滤
      if (activeTab === "all") {
        return matchesSearch;
      }
      return matchesSearch && activity.status === activeTab;
    });
  };

  const filteredActivities = getFilteredActivities();

  // 错误状态
  if (error) {
    return (
      <div style={{ padding: "20px 0" }}>
        <ErrorBlock
          status="default"
          title="加载失败"
          description={error.message}
        />
      </div>
    );
  }

  // 空状态
  if (!isLoading && filteredActivities.length === 0) {
    return (
      <div style={{ padding: "20px 0" }}>
        <Empty description={searchText ? "未找到相关活动" : "还没有活动"} />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={isRefreshing}>
      <List>
        {filteredActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </List>
      <InfiniteScroll loadMore={loadMore} hasMore={data?.hasMore || false} />
    </PullToRefresh>
  );
};
