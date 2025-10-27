/**
 * EnrollmentManageTab Component - 报名管理 Tab
 * 包含导入报名信息、筛选、发送通知、导出等功能
 */

import { FC, useState, useEffect } from "react";
import { Button, Card, Empty, List, Tag, Dialog, Toast } from "antd-mobile";
import {
  AddCircleOutline,
  FileOutline,
  SearchOutline,
  SendOutline,
} from "antd-mobile-icons";
import { ImportEnrollmentDialog } from "../ImportEnrollmentDialog";
import { getEnrollmentsDetailed } from "../../services/enrollmentApi";
import type { Enrollment } from "../../types";

/**
 * 组件 Props
 */
export interface EnrollmentManageTabProps {
  activityId: string;
}

/**
 * 报名管理 Tab 组件
 */
export const EnrollmentManageTab: FC<EnrollmentManageTabProps> = ({
  activityId,
}) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);

  // 加载报名列表
  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const response = await getEnrollmentsDetailed(activityId);
      if (response.success) {
        setEnrollments(response.enrollments || []);
      } else {
        Toast.show({
          icon: "fail",
          content: "加载报名列表失败",
        });
      }
    } catch (error) {
      console.error("加载报名列表失败:", error);
      Toast.show({
        icon: "fail",
        content: error instanceof Error ? error.message : "加载失败",
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  // 导入报名信息
  const handleImport = () => {
    setImportDialogVisible(true);
  };

  // 导入成功回调
  const handleImportSuccess = () => {
    setImportDialogVisible(false);
    // 刷新报名列表
    loadEnrollments();
    Toast.show({
      icon: "success",
      content: "导入成功，列表已刷新",
    });
  };

  // 筛选报名信息
  const handleFilter = () => {
    Dialog.alert({
      content: "筛选功能开发中...",
      confirmText: "知道了",
    });
  };

  // 发送通知
  const handleNotify = () => {
    Dialog.alert({
      content: "通知功能开发中...",
      confirmText: "知道了",
    });
  };

  // 导出名单
  const handleExport = () => {
    Toast.show({
      icon: "loading",
      content: "导出中...",
      duration: 2000,
    });
  };

  return (
    <div className="pb-20">
      {/* 功能按钮区 */}
      <div className="bg-white p-5 md:px-8 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <Button
            color="primary"
            fill="outline"
            size="large"
            onClick={handleImport}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <AddCircleOutline />
              <span>导入报名</span>
            </div>
          </Button>

          <Button
            color="primary"
            fill="outline"
            size="large"
            onClick={handleFilter}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <SearchOutline />
              <span>筛选</span>
            </div>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Button
            color="success"
            fill="outline"
            size="large"
            onClick={handleNotify}
            disabled={enrollments.length === 0}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <SendOutline />
              <span>发送通知</span>
            </div>
          </Button>

          <Button
            color="default"
            fill="outline"
            size="large"
            onClick={handleExport}
            disabled={enrollments.length === 0}
            className="rounded-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <FileOutline />
              <span>导出名单</span>
            </div>
          </Button>
        </div>
      </div>

      {/* 报名列表 */}
      <div className="px-5 md:px-8 py-4">
        {/* 加载中 */}
        {loading && enrollments.length === 0 ? (
          <Card className="rounded-xl">
            <div className="py-12 text-center text-gray-500">加载中...</div>
          </Card>
        ) : /* 空态 */ enrollments.length === 0 ? (
          <Card className="rounded-xl">
            <div className="py-12">
              <Empty
                description="暂无报名信息"
                imageStyle={{ width: 100 }}
                className="mb-4"
              />
              <div className="text-center">
                <Button
                  color="primary"
                  onClick={handleImport}
                  className="rounded-lg"
                >
                  导入报名信息
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* 统计信息 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                报名名单 ({enrollments.length})
              </h3>
              <div className="flex items-center gap-2">
                <Tag color="success">
                  通过{" "}
                  {enrollments.filter((e) => e.status === "approved").length}
                </Tag>
                <Tag color="warning">
                  待审核{" "}
                  {enrollments.filter((e) => e.status === "pending").length}
                </Tag>
                <Tag color="danger">
                  拒绝{" "}
                  {enrollments.filter((e) => e.status === "rejected").length}
                </Tag>
              </div>
            </div>

            {/* 报名列表 */}
            <Card className="rounded-xl overflow-hidden">
              <List>
                {enrollments.map((enrollment) => (
                  <List.Item
                    key={enrollment.id}
                    description={
                      <div className="space-y-1">
                        {/* 基础信息 */}
                        <div className="text-sm text-gray-600">
                          {[
                            enrollment.gender === "male"
                              ? "男"
                              : enrollment.gender === "female"
                              ? "女"
                              : enrollment.gender,
                            enrollment.age && `${enrollment.age}岁`,
                            enrollment.occupation,
                            enrollment.company,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>

                        {/* 联系方式 */}
                        {(enrollment.phone || enrollment.email) && (
                          <div className="text-xs text-gray-500">
                            {[enrollment.phone, enrollment.email]
                              .filter(Boolean)
                              .join(" | ")}
                          </div>
                        )}

                        {/* 自定义字段 */}
                        {enrollment.customFields &&
                          Object.keys(enrollment.customFields).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(enrollment.customFields).map(
                                ([key, value]) => (
                                  <Tag
                                    key={key}
                                    color="default"
                                    fill="outline"
                                    className="text-xs"
                                  >
                                    {key}: {String(value)}
                                  </Tag>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    }
                    extra={
                      <Tag
                        color={
                          enrollment.status === "approved"
                            ? "success"
                            : enrollment.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {enrollment.status === "approved"
                          ? "已通过"
                          : enrollment.status === "rejected"
                          ? "已拒绝"
                          : "待审核"}
                      </Tag>
                    }
                  >
                    <div className="font-medium text-gray-900">
                      {enrollment.name}
                    </div>
                  </List.Item>
                ))}
              </List>
            </Card>
          </>
        )}
      </div>

      {/* 导入报名信息对话框 */}
      <ImportEnrollmentDialog
        visible={importDialogVisible}
        activityId={activityId}
        onClose={() => setImportDialogVisible(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
