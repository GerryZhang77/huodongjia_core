import { describe, expect, it } from "vitest";
import { ChevronRight } from "lucide-react";
import { fireEvent, render, screen, waitFor } from "./utils";
import { Button } from "../src/components/ui/Button";
import { ImageCarousel } from "../src/components/business/ImageCarousel";

describe("UI 单行布局契约", () => {
  it("Button 保持图标与文本单行，并透传原生属性与自定义尺寸", () => {
    render(
      <Button
        name="next-step"
        aria-label="下一步：设置规则"
        iconRight={<ChevronRight />}
        className="h-12 px-3"
      >
        下一步：设置规则
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "下一步：设置规则",
    });
    expect(button).toHaveAttribute("name", "next-step");
    expect(button).toHaveClass("flex-nowrap", "whitespace-nowrap", "h-12");
    expect(button).not.toHaveClass("h-11");
    expect(button.querySelector("span:last-child")).toHaveClass("shrink-0");
  });

  it("Button 加载态保持标签、禁用交互并暴露 busy 状态", () => {
    render(
      <Button loading icon={<ChevronRight />}>
        保存并进入校验
      </Button>,
    );

    const button = screen.getByRole("button", { name: "保存并进入校验" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg")).toHaveClass("shrink-0");
  });
});

describe("活动图片展示契约", () => {
  it("详情预设使用统一响应式比例，并在切换活动时复位到首图", async () => {
    const { container, rerender } = render(
      <ImageCarousel images={["/a.jpg", "/b.jpg"]} variant="detail" />,
    );

    const carousel = screen.getByRole("region", { name: "图片轮播" });
    expect(carousel).toHaveClass("aspect-[3/2]", "lg:aspect-[21/9]");

    fireEvent.click(
      screen.getByRole("button", { name: "切换到第 2 张图片" }),
    );
    expect(container.querySelector(".transition-transform")).toHaveStyle({
      transform: "translateX(-100%)",
    });

    rerender(
      <ImageCarousel images={["/next-a.jpg", "/next-b.jpg"]} variant="detail" />,
    );
    await waitFor(() =>
      expect(container.querySelector(".transition-transform")).toHaveStyle({
        transform: "translateX(-0%)",
      }),
    );
  });

  it("图片加载失败时移除坏图并显示同尺寸占位区", async () => {
    const { container } = render(
      <ImageCarousel images={["/broken.jpg"]} variant="detail-mobile" />,
    );

    fireEvent.error(screen.getByRole("img", { name: "图片 1" }));

    await waitFor(() => expect(screen.queryByRole("img")).not.toBeInTheDocument());
    expect(container.firstElementChild).toHaveClass(
      "aspect-[3/2]",
      "bg-gradient-to-br",
    );
  });
});
