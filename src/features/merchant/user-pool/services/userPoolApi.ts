import { api } from "@/services/api";

export const getMerchantUserPool = (page = 1, pageSize = 50) =>
  api.get("/api/dashboard/organizer/user-pool", { params: { page, pageSize } });

export const getPlatformUsers = (page = 1, pageSize = 50, keyword?: string) =>
  api.get("/api/dashboard/organizer/platform-users", { params: { page, pageSize, keyword } });

export const getDiscoveryQuota = () =>
  api.get("/api/dashboard/organizer/discovery-quota");
