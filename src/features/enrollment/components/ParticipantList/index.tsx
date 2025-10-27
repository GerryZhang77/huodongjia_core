/**
 * ParticipantList Component
 * 参与者列表组件
 */

import { FC } from "react";
import { List, Empty, Avatar, Tag, Card } from "antd-mobile";
import type { Enrollment, EnrollmentStatus } from "../../types";

interface ParticipantListProps {
  participants: Enrollment[];
  loading?: boolean;
  onParticipantClick?: (participant: Enrollment) => void;
}

const statusConfig: Record<EnrollmentStatus, { text: string; color: string }> =
  {
    pending: { text: "待审核", color: "warning" },
    approved: { text: "已通过", color: "success" },
    rejected: { text: "已拒绝", color: "danger" },
    cancelled: { text: "已取消", color: "default" },
  };

export const ParticipantList: FC<ParticipantListProps> = ({
  participants,
  loading,
  onParticipantClick,
}) => {
  if (!loading && participants.length === 0) {
    return (
      <div style={{ padding: "40px 0" }}>
        <Empty description="暂无参与者" />
      </div>
    );
  }

  return (
    <List>
      {participants.map((participant) => {
        const status = statusConfig[participant.status];

        return (
          <Card
            key={participant.id}
            onClick={() => onParticipantClick?.(participant)}
            style={{ marginBottom: "12px", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {participant.userAvatar ? (
                <Avatar
                  src={participant.userAvatar}
                  style={{ "--size": "48px" }}
                />
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "var(--adm-color-primary)",
                    color: "var(--adm-color-white)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 600,
                  }}
                >
                  {participant.userName?.charAt(0)}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "16px", fontWeight: 600 }}>
                    {participant.userName}
                  </span>
                  <Tag color={status.color}>{status.text}</Tag>
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--adm-color-text-secondary)",
                  }}
                >
                  {participant.userEmail && (
                    <div>📧 {participant.userEmail}</div>
                  )}
                  {participant.userPhone && (
                    <div>📱 {participant.userPhone}</div>
                  )}
                  <div>
                    📅 报名时间:{" "}
                    {new Date(participant.registrationTime).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </List>
  );
};
