/**
 * ActivityCard Component
 * 活动卡片组件
 */

import { FC } from "react";
import { Card, Tag, ProgressBar } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import type { Activity } from "../../types";
import {
  formatDate,
  getParticipationRate,
  getStatusTag,
  getParticipationRateColor,
} from "../../utils";

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard: FC<ActivityCardProps> = ({ activity }) => {
  const navigate = useNavigate();
  const statusTag = getStatusTag(activity.status);
  const participationRate = getParticipationRate(
    activity.enrolledCount,
    activity.capacity
  );
  const rateColor = getParticipationRateColor(participationRate);

  const handleCardClick = () => {
    navigate(`/activity-detail/${activity.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      style={{
        borderRadius: "8px",
        marginBottom: "12px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div style={{ padding: "8px 0" }}>
        {/* 标题和状态 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              flex: 1,
            }}
          >
            {activity.title}
          </h3>
          <Tag
            color={statusTag.color}
            style={{ marginLeft: "8px", flexShrink: 0 }}
          >
            {statusTag.text}
          </Tag>
        </div>

        {/* 描述 */}
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            color: "var(--adm-color-text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {activity.description}
        </p>

        {/* 时间和地点 */}
        <div
          style={{
            fontSize: "12px",
            color: "var(--adm-color-weak)",
            marginBottom: "12px",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            📅 活动时间: {formatDate(activity.activityStart)}
          </div>
          <div>📍 活动地点: {activity.location}</div>
        </div>

        {/* 报名进度 */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "4px",
            }}
          >
            <span style={{ color: "var(--adm-color-text-secondary)" }}>
              报名人数: {activity.enrolledCount}/{activity.capacity}
            </span>
            <span style={{ color: rateColor, fontWeight: 600 }}>
              {participationRate}%
            </span>
          </div>
          <ProgressBar
            percent={participationRate}
            style={{
              "--fill-color": rateColor,
            }}
          />
        </div>
      </div>
    </Card>
  );
};
