import { useMemo } from "react";
import {
  useQueries,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores";
import {
  getEnrollmentImageBlob,
  getEnrollmentImages,
  type EnrollmentImageAsset,
} from "@/services/enrollmentApi";
import {
  clearProtectedImageObjectUrlCache,
  getProtectedImageObjectUrl,
} from "@/services/protectedImageCache";

const IMAGE_STALE_TIME = 10 * 60 * 1000;
const IMAGE_GC_TIME = 20 * 60 * 1000;
export const clearEnrollmentImageObjectUrlCache =
  clearProtectedImageObjectUrlCache;

export const enrollmentImageKeys = {
  all: (sessionScope: string) =>
    ["merchant", "protected-enrollment-images", sessionScope] as const,
  list: (sessionScope: string, activityId: string, participantId: string) =>
    [
      ...enrollmentImageKeys.all(sessionScope),
      activityId,
      participantId,
      "metadata",
    ] as const,
  content: (
    sessionScope: string,
    activityId: string,
    participantId: string,
    assetId: string,
  ) =>
    [
      ...enrollmentImageKeys.all(sessionScope),
      activityId,
      participantId,
      "content",
      assetId,
    ] as const,
};

export type LoadedEnrollmentImage = EnrollmentImageAsset & {
  objectUrl?: string;
  isLoading: boolean;
  isError: boolean;
};

export function useEnrollmentImages(
  activityId: string,
  participantId: string,
  options: { contentLimit?: number } = {},
) {
  const sessionScope = useAuthStore((state) => state.user?.id || "anonymous");
  const contentLimit = options.contentLimit;
  const metadataQuery = useQuery({
    queryKey: enrollmentImageKeys.list(sessionScope, activityId, participantId),
    queryFn: () => getEnrollmentImages(activityId, participantId),
    enabled: Boolean(activityId && participantId && sessionScope !== "anonymous"),
    staleTime: IMAGE_STALE_TIME,
    gcTime: IMAGE_GC_TIME,
  });

  const metadata = useMemo(
    () => metadataQuery.data ?? [],
    [metadataQuery.data],
  );
  const contentMetadata = useMemo(
    () =>
      typeof contentLimit === "number"
        ? metadata.slice(0, Math.max(0, contentLimit))
        : metadata,
    [contentLimit, metadata],
  );
  const imageQueries = useQueries({
    queries: contentMetadata.map((asset) => ({
      queryKey: enrollmentImageKeys.content(
        sessionScope,
        activityId,
        participantId,
        asset.id,
      ),
      queryFn: () => getEnrollmentImageBlob(activityId, participantId, asset.id),
      staleTime: IMAGE_STALE_TIME,
      gcTime: IMAGE_GC_TIME,
      retry: 1,
    })),
  });

  const images = useMemo<LoadedEnrollmentImage[]>(
    () =>
      contentMetadata.map((asset, index) => {
        const query = imageQueries[index];
        const cacheKey = `${sessionScope}:${activityId}:${participantId}:${asset.id}`;
        return {
          ...asset,
          objectUrl: query?.data
            ? getProtectedImageObjectUrl(cacheKey, query.data)
            : undefined,
          isLoading: query?.isPending ?? true,
          isError: query?.isError ?? false,
        };
      }),
    [activityId, contentMetadata, imageQueries, participantId, sessionScope],
  );

  return {
    images,
    total: metadata.length,
    isLoading:
      metadataQuery.isPending || imageQueries.some((query) => query.isPending),
    isFetching:
      metadataQuery.isFetching || imageQueries.some((query) => query.isFetching),
    error:
      metadataQuery.error || imageQueries.find((query) => query.error)?.error || null,
  };
}

export async function prefetchEnrollmentImages(
  queryClient: QueryClient,
  sessionScope: string,
  activityId: string,
  participantId: string,
) {
  if (!sessionScope || sessionScope === "anonymous") return;
  const metadata = await queryClient.ensureQueryData({
    queryKey: enrollmentImageKeys.list(sessionScope, activityId, participantId),
    queryFn: () => getEnrollmentImages(activityId, participantId),
    staleTime: IMAGE_STALE_TIME,
    gcTime: IMAGE_GC_TIME,
  });
  await Promise.all(
    metadata.map((asset) =>
      queryClient.prefetchQuery({
        queryKey: enrollmentImageKeys.content(
          sessionScope,
          activityId,
          participantId,
          asset.id,
        ),
        queryFn: () => getEnrollmentImageBlob(activityId, participantId, asset.id),
        staleTime: IMAGE_STALE_TIME,
        gcTime: IMAGE_GC_TIME,
      }),
    ),
  );
}
