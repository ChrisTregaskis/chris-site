import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Wayfinder } from "./Wayfinder";

// Reduced motion: the demo's messages arrive without waiting on animation.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
});

const picker = () => screen.getByRole("button", { name: /^Wayfinder part/ });

describe("Wayfinder", () => {
  it("has a card per part plus the live demo, and a picker for all of them", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    expect(
      screen.getAllByRole("button", { name: /^Show part \d+,/ }),
    ).toHaveLength(9);
    expect(
      screen.getByRole("button", { name: "Show the live demo" }),
    ).toBeInTheDocument();

    await user.click(picker());
    expect(screen.getAllByRole("option")).toHaveLength(10);
  });

  it("keeps the card, the picker and the announcement in step", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    const three = screen.getByRole("button", {
      name: "Show part 3, Supervisor agent",
    });
    await user.click(three);

    expect(three).toHaveAttribute("aria-current", "step");
    expect(picker()).toHaveAccessibleName("Wayfinder part 03 Supervisor agent");
    expect(screen.getByText("Part 3, Supervisor agent")).toBeInTheDocument();

    await user.click(picker());
    await user.click(screen.getByRole("option", { name: /MCP server/ }));
    expect(
      screen.getByRole("button", { name: "Show part 7, MCP server" }),
    ).toHaveAttribute("aria-current", "step");
    expect(three).not.toHaveAttribute("aria-current");
  });

  it("jumps to the demo with Try it", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    const tryIt = screen.getByRole("button", { name: "Try it" });
    expect(tryIt).toHaveAttribute("aria-pressed", "false");

    await user.click(tryIt);
    expect(tryIt).toHaveAttribute("aria-pressed", "true");
    expect(picker()).toHaveAccessibleName(
      "Wayfinder part 10 Try it, live demo",
    );
  });

  it("swaps the AI platform without touching the agents", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    const platforms = screen.getByRole("group", { name: "AI platform" });
    await user.click(within(platforms).getByRole("button", { name: "C" }));

    expect(
      within(platforms).getByRole("button", { name: "C" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Platform C (live)")).toBeInTheDocument();
    expect(screen.getByLabelText("Trace")).toHaveTextContent(
      "adapter backend switched to platform C. No agent code changed.",
    );
  });

  it("answers a scripted question and traces its route", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Wayfinder />);
    await user.click(screen.getByRole("button", { name: "Book a test drive" }));

    const chat = screen.getByRole("log", { name: "Wayfinder chat" });
    expect(await within(chat).findByText("11:00")).toBeInTheDocument();
    expect(within(chat).getByText("Book a test drive")).toBeInTheDocument();
    const trace = screen.getByLabelText("Trace");
    expect(trace).toHaveTextContent("booking agent calls retailer.slots");
    expect(trace).toHaveTextContent("intent: booking (platform B)");
    expect(trace).toHaveTextContent("bff rendered as a rich card");

    // A typed question works too, and the form clears.
    const input = screen.getByRole("textbox", { name: "Message" });
    await user.type(input, "What would it cost a month?{Enter}");
    expect(
      await within(chat).findByText(/From £XXX a month/),
    ).toBeInTheDocument();
    expect(input).toHaveValue("");
    act(() => {
      vi.runOnlyPendingTimers();
    });
  });
});
