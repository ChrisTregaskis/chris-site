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

/** The pipes lit by the last message, in the figure's drawing order. */
const litRoutes = (container: HTMLElement) =>
  [...container.querySelectorAll("[data-route]")]
    .filter((path) => path.classList.contains("opacity-100"))
    .map((path) => path.getAttribute("data-route"));

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

  it("answers a pill along its own route, short of MCP when nothing live is needed", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<Wayfinder />);
    await user.click(screen.getByRole("button", { name: "Book a test drive" }));

    const chat = screen.getByRole("log", { name: "Wayfinder chat" });
    expect(
      await within(chat).findByText(/Which model would you like to drive/),
    ).toBeInTheDocument();
    expect(within(chat).getByText("Book a test drive")).toBeInTheDocument();
    const trace = screen.getByLabelText("Trace");
    expect(trace).toHaveTextContent(
      "booking agent asks for a model and postcode first",
    );
    expect(trace).toHaveTextContent("intent: booking (platform B)");
    expect(trace).not.toHaveTextContent("mcp");
    expect(litRoutes(container)).toEqual([
      "chat-bff",
      "bff-sup",
      "sup-adp",
      "adp-ai1",
      "sup-s1",
    ]);
    act(() => {
      vi.runOnlyPendingTimers();
    });
  });

  it("fetches live data over MCP for a monthly cost", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Wayfinder />);
    await user.click(screen.getByRole("button", { name: "Monthly cost?" }));

    const chat = screen.getByRole("log", { name: "Wayfinder chat" });
    expect(
      await within(chat).findByText(/From £XXX a month/),
    ).toBeInTheDocument();
    const trace = screen.getByLabelText("Trace");
    expect(trace).toHaveTextContent("mcp finance.quote 200, 38 ms");
    expect(trace).toHaveTextContent("bff rendered as a rich card");
    act(() => {
      vi.runOnlyPendingTimers();
    });
  });

  it("answers typed free text with the scripted line, via the supervisor only", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { container } = render(<Wayfinder />);

    // Even a pill's own words count as free text when typed.
    const input = screen.getByRole("textbox", { name: "Message" });
    await user.type(input, "What would it cost a month?{Enter}");

    const chat = screen.getByRole("log", { name: "Wayfinder chat" });
    expect(
      await within(chat).findByText(
        "This is a scripted response. Try clicking the pills below?",
      ),
    ).toBeInTheDocument();
    expect(within(chat).queryByText(/From £XXX a month/)).toBeNull();
    expect(input).toHaveValue("");
    expect(screen.getByLabelText("Trace")).toHaveTextContent(
      "supervisor free text: scripted reply in this demo",
    );
    expect(litRoutes(container)).toEqual(["chat-bff", "bff-sup"]);
    act(() => {
      vi.runOnlyPendingTimers();
    });
  });
});
