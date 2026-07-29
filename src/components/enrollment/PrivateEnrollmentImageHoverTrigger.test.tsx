import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import PrivateEnrollmentImageHoverTrigger from "./PrivateEnrollmentImageHoverTrigger";

vi.mock("./PrivateEnrollmentImageGallery", () => ({
  default: ({ participantId }: { participantId: string }) => (
    <div>预览 {participantId}</div>
  ),
}));

afterEach(() => {
  vi.useRealTimers();
});

const renderTrigger = (ui: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("PrivateEnrollmentImageHoverTrigger", () => {
  it("shows the protected image preview after hovering", () => {
    vi.useFakeTimers();
    renderTrigger(
      <PrivateEnrollmentImageHoverTrigger
        activityId="event-1"
        participantId="participant-1"
        participantName="报名用户"
        imageCount={3}
        onOpenFullGallery={vi.fn()}
      />,
    );

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: "查看报名用户的 3 张报名图片" }),
    );
    act(() => {
      vi.advanceTimersByTime(240);
    });

    expect(
      screen.getByRole("dialog", { name: "报名用户的报名图片预览" }),
    ).not.toBeNull();
    expect(screen.getByText("预览 participant-1")).not.toBeNull();
  });

  it("opens the full gallery on click", () => {
    const onOpenFullGallery = vi.fn();
    renderTrigger(
      <PrivateEnrollmentImageHoverTrigger
        activityId="event-1"
        participantId="participant-1"
        participantName="报名用户"
        imageCount={3}
        onOpenFullGallery={onOpenFullGallery}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "查看报名用户的 3 张报名图片" }),
    );
    expect(onOpenFullGallery).toHaveBeenCalledTimes(1);
  });
});
