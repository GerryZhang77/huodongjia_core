import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getActivityById } from "@/features/activities/services/api";
import {
  getMatchGroups,
  getParticipants,
} from "@/features/matching/services/matchingApi";
import {
  downloadMatchExport,
  getMatchExportFieldGroups,
  previewMatchExport,
} from "@/features/matching/services/matchExportApi";
import MatchResultExportPage from "./MatchResultExport";

vi.mock("@/components/layout/MerchantLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));
vi.mock("@/features/activities/services/api", () => ({
  getActivityById: vi.fn(),
}));
vi.mock("@/features/matching/services/matchingApi", () => ({
  getMatchGroups: vi.fn(),
  getParticipants: vi.fn(),
}));
vi.mock("@/features/matching/services/matchExportApi", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/matching/services/matchExportApi")
  >("@/features/matching/services/matchExportApi");
  return {
    ...actual,
    getMatchExportFieldGroups: vi.fn(),
    previewMatchExport: vi.fn(),
    downloadMatchExport: vi.fn(),
  };
});

const schema = [
  {
    key: "name",
    label: "姓名",
    type: "text" as const,
    required: true,
    preset: true,
  },
  {
    key: "phone",
    label: "手机号",
    type: "text" as const,
    required: true,
    preset: true,
  },
  {
    key: "company",
    label: "公司",
    type: "text" as const,
    required: false,
    preset: false,
  },
];

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={["/dashboard/activity/event-1/matching/export"]}
      >
        <Routes>
          <Route
            path="/dashboard/activity/:id/matching/export"
            element={<MatchResultExportPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("MatchResultExportPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = "";
  });

  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:match-export"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      () => undefined,
    );
    vi.mocked(getActivityById).mockResolvedValue({
      id: "event-1",
      title: "测试活动",
      registrationTypes: [
        {
          id: "regular",
          name: "普通报名",
          formSchema: schema,
          eligibilityMode: "public",
          isDefault: true,
          matchEnabled: true,
          sortOrder: 0,
          members: [],
        },
      ],
    } as never);
    vi.mocked(getParticipants).mockResolvedValue([
      {
        id: "owner",
        name: "张三",
        phone: "13800000000",
        registrationTypeId: "regular",
        registrationTypeName: "普通报名",
      },
      {
        id: "target-1",
        name: "李四",
        phone: "13900000000",
        registrationTypeId: "regular",
        registrationTypeName: "普通报名",
      },
      {
        id: "target-2",
        name: "王五",
        phone: "13700000000",
        registrationTypeId: "regular",
        registrationTypeName: "普通报名",
      },
    ]);
    vi.mocked(getMatchExportFieldGroups).mockResolvedValue([
      {
        id: "regular",
        name: "普通报名",
        fields: schema,
      },
    ]);
    vi.mocked(getMatchGroups).mockResolvedValue({
      results: [
        {
          id: "edge-owner",
          userId: "owner",
          matchId: "run-1",
          bestMatchUserIds: ["target-1", "target-2"],
          scores: null,
          createdAt: "2026-08-07T00:00:00.000Z",
          isLocked: false,
        },
      ],
      stats: null,
      matchStatusId: "run-1",
      version: 2,
      revision: 3,
      participantUserIds: ["owner", "target-1", "target-2"],
    });
    vi.mocked(previewMatchExport).mockImplementation(
      async (_activityId, request) => ({
        generatedAt: "2026-08-07T00:00:00.000Z",
        filename: "测试活动_匹配结果_V2.xlsx",
        totalRows: request.relations.length,
        totalColumns: 4,
        previewLimit: 50,
        truncated: false,
        previewDigest: "digest-1",
        resultVersion: 2,
        resultRevision: 3,
        columns: [
          {
            id: "source:name:text",
            header: "姓名",
            side: "source",
            format: "text",
            emptyCount: 0,
          },
          {
            id: "source:phone:text",
            header: "手机号",
            side: "source",
            format: "text",
            emptyCount: 0,
          },
          {
            id: "target:name:text",
            header: "匹配对象-姓名",
            side: "target",
            format: "text",
            emptyCount: 0,
          },
          {
            id: "target:phone:text",
            header: "匹配对象-手机号",
            side: "target",
            format: "text",
            emptyCount: 0,
          },
        ],
        rows: request.relations.map(() => [
          "张三",
          "13800000000",
          "李四",
          "13900000000",
        ]),
      }),
    );
    vi.mocked(downloadMatchExport).mockResolvedValue(new Blob(["excel"]));
  });

  it("exports from the single page while keeping the exact preview handshake", async () => {
    renderPage();

    await screen.findByRole("heading", { name: "选择参与者" });
    expect(screen.getByRole("heading", { name: "选择导出内容" })).not.toBeNull();
    expect(screen.queryByText(/下一步/)).toBeNull();
    expect(screen.queryByText("添加字段")).toBeNull();
    expect(screen.queryByText("适用范围")).toBeNull();
    expect(
      (
        screen.getByLabelText(
          "参与者报名信息姓名的Excel表头",
        ) as HTMLInputElement
      ).value,
    ).toBe("姓名");
    expect(
      (
        screen.getByLabelText(
          "匹配对象报名信息姓名的Excel表头",
        ) as HTMLInputElement
      ).value,
    ).toBe("匹配对象-姓名");

    fireEvent.change(
      screen.getByLabelText("参与者报名信息姓名的Excel表头"),
      {
      target: { value: "参与者姓名" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "导出 Excel" }));

    await waitFor(() =>
      expect(previewMatchExport).toHaveBeenCalledWith(
        "event-1",
        expect.objectContaining({
          matchStatusId: "run-1",
          expectedRevision: 3,
          relations: [
            { sourceUserId: "owner", targetUserId: "target-1" },
            { sourceUserId: "owner", targetUserId: "target-2" },
          ],
          columns: expect.arrayContaining([
            expect.objectContaining({
              side: "source",
              header: "参与者姓名",
            }),
          ]),
        }),
      ),
    );
    expect(
      vi.mocked(previewMatchExport).mock.calls[0][1].columns.some(
        (column) => column.side === "system",
      ),
    ).toBe(false);
    await waitFor(() =>
      expect(downloadMatchExport).toHaveBeenCalledWith(
        "event-1",
        expect.objectContaining({ previewDigest: "digest-1" }),
      ),
    );
  });

  it("supports a simple per-participant match count and optional preview", async () => {
    renderPage();

    const countSelect = await screen.findByLabelText(
      "每位参与者包含的匹配对象数量",
    );
    fireEvent.change(countSelect, { target: { value: "1" } });
    expect(screen.getByText("已选择 1/1 位参与者")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "预览" }));
    await screen.findByRole("dialog", { name: "Excel 内容预览" });

    expect(previewMatchExport).toHaveBeenCalledWith(
      "event-1",
      expect.objectContaining({
        relations: [{ sourceUserId: "owner", targetUserId: "target-1" }],
      }),
    );
  });

  it("keeps individual matching-object selection next to each participant", async () => {
    renderPage();

    await screen.findByRole("heading", { name: "选择参与者" });
    fireEvent.click(
      screen.getByRole("button", { name: /^选择参与者$/ }),
    );
    await screen.findByRole("dialog", { name: "选择参与者" });

    fireEvent.click(screen.getByRole("button", { name: "调整张三的匹配对象" }));
    fireEvent.click(screen.getByLabelText("选择匹配对象王五"));
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(screen.getByText("已选择 1/1 位参与者")).not.toBeNull();
    expect(
      (
        screen.getByLabelText(
          "每位参与者包含的匹配对象数量",
        ) as HTMLSelectElement
      ).value,
    ).toBe("custom");
  });

  it("shows every registration-form option inline and toggles it directly", async () => {
    renderPage();

    await screen.findByRole("heading", { name: "选择导出内容" });
    const companyOption = screen.getByLabelText("导出参与者报名信息公司");

    expect((companyOption as HTMLInputElement).checked).toBe(false);
    expect(
      screen.queryByLabelText("参与者报名信息公司的Excel表头"),
    ).toBeNull();

    fireEvent.click(companyOption);

    expect(
      (
        screen.getByLabelText(
          "参与者报名信息公司的Excel表头",
        ) as HTMLInputElement
      ).value,
    ).toBe("公司");
  });

  it("restores page scrolling after participant and preview drawers close", async () => {
    renderPage();

    await screen.findByRole("heading", { name: "选择参与者" });
    fireEvent.click(
      screen.getByRole("button", { name: /^选择参与者$/ }),
    );
    const participantDrawer = await screen.findByRole("dialog", {
      name: "选择参与者",
    });
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(
      within(participantDrawer).getByRole("button", { name: "完成" }),
    );
    await waitFor(() => expect(document.body.style.overflow).toBe(""));

    fireEvent.click(screen.getByRole("button", { name: "预览" }));
    const previewDrawer = await screen.findByRole("dialog", {
      name: "Excel 内容预览",
    });
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(
      within(previewDrawer).getByRole("button", { name: "关闭" }),
    );
    await waitFor(() => expect(document.body.style.overflow).toBe(""));
  });
});
