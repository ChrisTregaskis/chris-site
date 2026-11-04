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
const figure = () =>
  screen.getByRole("img", { name: /^Wayfinder's architecture/ });
/** The polite live region that says where the story is. */
const announced = () =>
  screen.getByText(
    (_, element) =>
      element?.getAttribute("aria-live") === "polite" &&
      element.tagName === "P",
  );
const toggle = () =>
  screen.getByRole("button", {
    name: /^(Take it apart|Put it back together)$/,
  });

describe("Wayfinder", () => {
  it("has the intro, a card per part and the live demo, and a picker for all of them", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    expect(
      screen.getByRole("button", { name: "Show the board taken apart" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /^Show part \d+,/ }),
    ).toHaveLength(9);
    expect(
      screen.getByRole("button", { name: "Show the live demo" }),
    ).toBeInTheDocument();

    await user.click(picker());
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(11);
    expect(options[0]).toHaveTextContent("00Taken apart");
    expect(options[10]).toHaveTextContent("10Try it, live demo");
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

  it("takes the board apart at the intro, keeping the picker and the announcement in step", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    // Above the story, the board is whole.
    expect(figure()).not.toHaveAttribute("data-apart");

    const intro = screen.getByRole("button", {
      name: "Show the board taken apart",
    });
    await user.click(intro);
    expect(intro).toHaveAttribute("aria-current", "step");
    expect(picker()).toHaveAccessibleName("Wayfinder part 00 Taken apart");
    expect(announced()).toHaveTextContent("Taken apart, part by part");
    expect(figure()).toHaveAttribute("data-apart");
    expect(figure()).toHaveAccessibleName(/taken apart/);

    // Every part keeps it apart; the demo puts it back together.
    await user.click(
      screen.getByRole("button", { name: "Show part 4, Specialist agents" }),
    );
    expect(figure()).toHaveAttribute("data-apart");
    await user.click(screen.getByRole("button", { name: "Try it" }));
    expect(figure()).not.toHaveAttribute("data-apart");
  });

  it("puts it back together, or takes it apart, with the toggle, until the step changes", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    await user.click(
      screen.getByRole("button", { name: "Show part 2, API server (BFF)" }),
    );
    expect(toggle()).toHaveAccessibleName("Put it back together");

    await user.click(toggle());
    expect(figure()).not.toHaveAttribute("data-apart");
    expect(toggle()).toHaveAccessibleName("Take it apart");
    expect(announced()).toHaveTextContent(/^Back together$/);

    await user.click(toggle());
    expect(figure()).toHaveAttribute("data-apart");
    expect(announced()).toHaveTextContent(/^Taken apart$/);

    await user.click(toggle());
    await user.click(
      screen.getByRole("button", { name: "Show part 3, Supervisor agent" }),
    );
    // A new step takes back over: apart again.
    expect(figure()).toHaveAttribute("data-apart");
  });

  it("works from the keyboard: the toggle, the picker (digits too) and the step numbers", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);

    // The picker: open it, jump to 00 with its digit, pick it.
    picker().focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("0");
    await user.keyboard("{Enter}");
    expect(picker()).toHaveAccessibleName("Wayfinder part 00 Taken apart");
    expect(picker()).toHaveFocus();

    // Then Try it, then the toggle.
    await user.tab();
    expect(screen.getByRole("button", { name: "Try it" })).toHaveFocus();
    await user.tab();
    expect(toggle()).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(figure()).not.toHaveAttribute("data-apart");
    await user.keyboard(" ");
    expect(figure()).toHaveAttribute("data-apart");

    // A step's number is a button: Enter selects it.
    const five = screen.getByRole("button", {
      name: "Show part 5, Provider adapter",
    });
    five.focus();
    await user.keyboard("{Enter}");
    expect(five).toHaveAttribute("aria-current", "step");
    expect(picker()).toHaveAccessibleName("Wayfinder part 05 Provider adapter");
  });

  it("lists what is inside every part, and picks a piece out in the figure", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    const lists = screen.getAllByRole("list", { name: /^Inside part \d$/ });
    expect(lists).toHaveLength(9);
    const bff = screen.getByRole("list", { name: "Inside part 2" });
    expect(
      within(bff)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "2.1Sessions",
      "2.2Rate limits",
      "2.3PII redaction layer",
      "2.4Card shaper",
    ]);

    // Pressing a piece selects its part and picks the piece out.
    const pii = within(bff).getByRole("button", { name: /^2\.3/ });
    expect(pii).toHaveAttribute("aria-pressed", "false");
    await user.click(pii);
    expect(pii).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Show part 2, API server (BFF)" }),
    ).toHaveAttribute("aria-current", "step");
    expect(figure()).toHaveAttribute("data-picked", "2.3");

    // Pressed again, it goes back.
    await user.click(pii);
    expect(pii).toHaveAttribute("aria-pressed", "false");
  });

  it("is one tab stop per list, moved along with the arrow keys, and previews on focus", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    await user.click(
      screen.getByRole("button", { name: "Show part 3, Supervisor agent" }),
    );
    const list = screen.getByRole("list", { name: "Inside part 3" });
    const [first, second, third] = within(list).getAllByRole("button");
    expect(first).toHaveAttribute("tabindex", "0");
    expect(second).toHaveAttribute("tabindex", "-1");

    act(() => first.focus());
    expect(figure()).toHaveAttribute("data-picked", "3.1");
    await user.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();
    expect(figure()).toHaveAttribute("data-picked", "3.2");
    await user.keyboard("{End}");
    expect(third).toHaveFocus();
    expect(third).toHaveAttribute("tabindex", "0");
    await user.keyboard("{Home}");
    expect(first).toHaveFocus();

    // Leaving the list clears the preview.
    await user.tab();
    expect(figure()).not.toHaveAttribute("data-picked");
  });

  it("puts the board back together at once for a message sent while apart, showing the message first", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Wayfinder />);
    await user.click(
      screen.getByRole("button", { name: "Show part 6, AI platforms" }),
    );
    expect(figure()).toHaveAttribute("data-apart");

    await user.click(screen.getByRole("button", { name: "What's a hybrid?" }));
    const chat = screen.getByRole("log", { name: "Wayfinder chat" });
    // The message shows straight away, and the board goes back together.
    expect(within(chat).getByText("What's a hybrid?")).toBeInTheDocument();
    expect(figure()).not.toHaveAttribute("data-apart");
    expect(toggle()).toHaveAccessibleName("Take it apart");
    // Once whole, the message travels and is answered.
    expect(
      await within(chat).findByText(/hybrid pairs a petrol engine/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Trace")).toHaveTextContent("intent: explain");
    act(() => {
      vi.runOnlyPendingTimers();
    });
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

describe("Wayfinder on a phone", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduced-motion") || query.includes("max-width"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }));
  });

  it("opens only the selected part, in place, with no toggle", async () => {
    const user = userEvent.setup();
    render(<Wayfinder />);
    await user.click(
      screen.getByRole("button", { name: "Show part 7, MCP server" }),
    );
    expect(figure()).toHaveAttribute("data-lite");
    expect(figure()).toHaveAttribute("data-apart");
    expect(
      screen.queryByRole("button", {
        name: /^(Take it apart|Put it back together)$/,
      }),
    ).toBeNull();
    // The list is the readable twin of the figure's numbers.
    expect(
      within(screen.getByRole("list", { name: "Inside part 7" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(3);
  });
});
