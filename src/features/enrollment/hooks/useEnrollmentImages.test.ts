import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEnrollmentImageBlob,
  getEnrollmentImages,
  type EnrollmentImageAsset,
} from "@/services/enrollmentApi";
import { prefetchEnrollmentImages } from "./useEnrollmentImages";

vi.mock("@/services/enrollmentApi", () => ({
  getEnrollmentImages: vi.fn(),
  getEnrollmentImageBlob: vi.fn(),
}));

const assets: EnrollmentImageAsset[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: `asset-${index + 1}`,
    field_key: "portfolio",
    field_label_snapshot: "作品图片",
    original_name: `image-${index + 1}.jpg`,
    mime_type: "image/jpeg",
    size_bytes: 100,
    created_at: "2026-07-29T00:00:00.000Z",
  }),
);

describe("prefetchEnrollmentImages", () => {
  beforeEach(() => {
    vi.mocked(getEnrollmentImages).mockReset();
    vi.mocked(getEnrollmentImageBlob).mockReset();
    vi.mocked(getEnrollmentImages).mockResolvedValue(assets);
    vi.mocked(getEnrollmentImageBlob).mockImplementation(
      async (_activityId, _participantId, assetId) =>
        new Blob([assetId], { type: "image/jpeg" }),
    );
  });

  it("prefetches only the preview limit and deduplicates repeated requests", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await Promise.all([
      prefetchEnrollmentImages(
        queryClient,
        "organizer-1",
        "event-1",
        "enrollment-1",
        { contentLimit: 4 },
      ),
      prefetchEnrollmentImages(
        queryClient,
        "organizer-1",
        "event-1",
        "enrollment-1",
        { contentLimit: 4 },
      ),
    ]);

    expect(getEnrollmentImages).toHaveBeenCalledTimes(1);
    expect(getEnrollmentImageBlob).toHaveBeenCalledTimes(4);
    expect(
      vi
        .mocked(getEnrollmentImageBlob)
        .mock.calls.map((call) => call[2]),
    ).toEqual(["asset-1", "asset-2", "asset-3", "asset-4"]);

    await prefetchEnrollmentImages(
      queryClient,
      "organizer-1",
      "event-1",
      "enrollment-1",
    );

    expect(getEnrollmentImages).toHaveBeenCalledTimes(1);
    expect(getEnrollmentImageBlob).toHaveBeenCalledTimes(6);
  });
});
