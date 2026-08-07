import { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";
import { Modal } from "./Modal";

interface OverlayStackProps {
  drawerOpen: boolean;
  modalOpen: boolean;
}

const OverlayStack = ({ drawerOpen, modalOpen }: OverlayStackProps) => (
  <>
    <Drawer open={drawerOpen} onClose={vi.fn()} title="测试抽屉">
      抽屉内容
    </Drawer>
    <Modal open={modalOpen} onClose={vi.fn()} title="测试弹窗">
      弹窗内容
    </Modal>
  </>
);

describe("body scroll locking", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("keeps scrolling locked until the final overlay closes", () => {
    const { rerender } = render(
      <OverlayStack drawerOpen modalOpen />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<OverlayStack drawerOpen={false} modalOpen />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<OverlayStack drawerOpen={false} modalOpen={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("restores the existing overflow value after every overlay unmounts", () => {
    document.body.style.overflow = "clip";
    const { unmount } = render(
      <StrictMode>
        <OverlayStack drawerOpen modalOpen />
      </StrictMode>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("clip");
  });
});
