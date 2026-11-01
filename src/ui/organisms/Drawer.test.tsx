import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Drawer
        open={open}
        labelledBy="drawer-title"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <h2 id="drawer-title">Request my CV</h2>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </Drawer>
    </>
  );
}

const dialog = () => screen.getByRole("dialog", { hidden: true });

describe("Drawer", () => {
  it("opens as a modal dialog named by its heading", async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const user = userEvent.setup();
    render(<Harness />);
    expect(dialog()).not.toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: "Request my CV" })).toBeVisible();
  });

  it("closes on Escape and hands focus back to its opener", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByRole("button", { name: "Open" });
    await user.click(opener);

    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toHaveAttribute("open");
    expect(opener).toHaveFocus();
  });

  it("closes when the backdrop is clicked, not when the content is", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.click(screen.getByRole("heading", { name: "Request my CV" }));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(dialog());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("closes when its owner shuts it, without reporting a visitor close", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Harness onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog()).not.toHaveAttribute("open");
    expect(onClose).not.toHaveBeenCalled();
  });
});
