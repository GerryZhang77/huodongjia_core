import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMatchFieldCatalog } from "./matchingApi";

describe("getMatchFieldCatalog", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      json: async () => ({
        success: true,
        data: { fields: [], totalEligibleParticipants: 0 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({ state: { token: "test-token" } }),
    );
  });

  it("posts the selected participant scope for coverage calculation", async () => {
    await getMatchFieldCatalog("event-1", ["user-c", "user-a"]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/match/event-1/field-catalog",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ participantUserIds: ["user-c", "user-a"] }),
      }),
    );
  });

  it("keeps the legacy unscoped read available for prefetch callers", async () => {
    await getMatchFieldCatalog("event-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/match/event-1/field-catalog",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
