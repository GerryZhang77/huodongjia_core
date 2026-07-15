/**
 * 用户端：活动回顾查看页
 * 路由：/u/activities/:id/recap
 *
 * 可见性：
 * - approved 参与者 + 商家本人可见
 * - 其它用户：显示「仅参与者可见」并自动跳回
 */

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle, Images, Loader2, Edit } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { ImageCarousel } from "@/components/business/ImageCarousel";
import { Button } from "@/components/ui";
import { getRecap, getRecapAccess } from "@/features/recap/services/recapApi";

const ActivityRecapPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();

  const { data: accessResp, isLoading: accessLoading } = useQuery({
    queryKey: ["recap-access", eventId],
    queryFn: () => getRecapAccess(eventId!),
    enabled: !!eventId,
  });

  const access = accessResp?.data;
  const canView = !!access?.canView;
  const isOrganizer = !!access?.isOrganizer;

  const { data: recapResp, isLoading: recapLoading } = useQuery({
    queryKey: ["recap", eventId],
    queryFn: () => getRecap(eventId!),
    enabled: !!eventId && canView,
  });
  const recap = recapResp?.data?.recap;

  // 无权限时延时跳回
  useEffect(() => {
    if (!accessLoading && access && !canView) {
      const t = setTimeout(() => navigate(-1), 2200);
      return () => clearTimeout(t);
    }
  }, [accessLoading, access, canView, navigate]);

  if (accessLoading) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="flex items-center justify-center min-h-screen text-gray-400">
          <Loader2 size={20} className="animate-spin mr-2" /> 加载中...
        </div>
      </UserLayout>
    );
  }

  if (!canView) {
    return (
      <UserLayout showTabBar={false} showTopBar={false}>
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <AlertCircle size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-700 dark:text-gray-200 text-base font-medium mb-1">
            仅参与者可见
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            活动回顾仅向通过审核的参与者展示，正在为你跳回...
          </p>
          <Button variant="primary" className="mt-6" onClick={() => navigate(-1)}>
            立即返回
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout showTabBar={false} showTopBar={false} bgColor="bg-gray-50 dark:bg-gray-900">
      <div className="min-h-screen pb-12">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-1">
            活动回顾
          </h1>
          {isOrganizer && eventId && (
            <button
              onClick={() => navigate(`/dashboard/activity/${eventId}/recap/edit`)}
              className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap text-xs text-primary-500 hover:text-primary-600 [&>svg]:shrink-0"
            >
              <Edit size={13} /> 编辑
            </button>
          )}
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          {recapLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : !recap ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl py-16 px-4 text-center border border-gray-100 dark:border-gray-700">
              <Images size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isOrganizer ? "你还没有发布活动回顾" : "商家暂未发布活动回顾"}
              </p>
              {isOrganizer && eventId && (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate(`/dashboard/activity/${eventId}/recap/edit`)}
                >
                  立即编辑
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* 草稿提示（仅商家可见） */}
              {isOrganizer && !recap.publishedAt && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-2 text-xs text-amber-800 dark:text-amber-300">
                  当前为草稿，参与者尚不可见
                </div>
              )}

              {/* 标题 */}
              {recap.title && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight px-1">
                  {recap.title}
                </h2>
              )}

              {/* 图片墙 */}
              {recap.images && recap.images.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <ImageCarousel images={recap.images} variant="recap" />
                  {recap.images.length > 1 && (
                    <div className="px-4 py-2 text-xs text-gray-400 text-right">
                      共 {recap.images.length} 张
                    </div>
                  )}
                </div>
              )}

              {/* 正文 */}
              {recap.content && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                    {recap.content}
                  </p>
                </div>
              )}

              {/* 隐私 disclaimer */}
              <p className="text-xs text-gray-400 text-center pt-4 px-2 leading-relaxed">
                请尊重他人隐私，未经允许不得将本回顾内容外传或商用。
              </p>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default ActivityRecapPage;
