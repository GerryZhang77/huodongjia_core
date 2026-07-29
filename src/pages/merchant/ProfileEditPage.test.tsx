import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { merchantApi, type MerchantProfileResponse } from "@/services";
import { useAuthStore } from "@/features/auth/stores";
import { merchantQueryKeys } from "@/features/merchant/queryKeys";
import ProfileEditPage from "./ProfileEditPage";

vi.mock("@/components/layout", () => ({
  MerchantLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/ui/Toast", () => ({
  Toast: { show: vi.fn() },
}));

const oldProfile: MerchantProfileResponse = {
  success: true,
  profile: {
    id: "organizer-1",
    account: "organizer_lyj",
    name: "旧主办方",
    phone: "13800138000",
    email: null,
    wechat: null,
    avatar: null,
    birth_year: null,
    age: null,
    location: null,
    occupation: "活动策划",
    company: "旧公司",
    industry: null,
    city: null,
    bio: null,
    tags: [],
    photos: [],
    person_info: [],
    privacy_settings: {},
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    stats: {
      totalEvents: 1,
      totalServed: 10,
      ratingAvg: null,
      ratingCount: null,
    },
  },
};

afterEach(() => {
  vi.restoreAllMocks();
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    authStatus: "anonymous",
  });
});

describe("ProfileEditPage", () => {
  it("synchronizes the saved organizer name to profile cache and auth state", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(merchantQueryKeys.profile(), oldProfile);
    useAuthStore.setState({
      user: {
        id: "organizer-1",
        account: "organizer_lyj",
        name: "旧主办方",
        avatar: null,
        phone: "13800138000",
        occupation: "活动策划",
        company: "旧公司",
        user_type: "organizer",
        tags: [],
      },
      token: "token",
      isAuthenticated: true,
      authStatus: "authenticated",
    });

    const updatedProfile: MerchantProfileResponse = {
      ...oldProfile,
      profile: {
        ...oldProfile.profile,
        name: "新主办方",
        updated_at: "2026-07-29T00:00:00.000Z",
      },
    };
    vi.spyOn(merchantApi, "getMerchantProfile").mockResolvedValue(
      updatedProfile,
    );
    const updateProfile = vi
      .spyOn(merchantApi, "updateMerchantProfile")
      .mockResolvedValue({
        success: true,
        message: "主办方资料更新成功",
        data: {
          user: {
            id: "organizer-1",
            name: "新主办方",
            avatar: null,
            phone: "13800138000",
            occupation: "活动策划",
            company: "旧公司",
            tags: [],
          },
        },
      });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfileEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const nameInput = await screen.findByDisplayValue("旧主办方");
    fireEvent.change(nameInput, { target: { value: "新主办方" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(useAuthStore.getState().user?.name).toBe("新主办方"),
    );

    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ name: "新主办方" }),
    );
    expect(
      queryClient.getQueryData<MerchantProfileResponse>(
        merchantQueryKeys.profile(),
      )?.profile.name,
    ).toBe("新主办方");
  });
});
