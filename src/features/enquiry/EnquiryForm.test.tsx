import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnquiryForm } from "./EnquiryForm";
import { renderWithProviders } from "@/test/renderWithProviders";

function setup(fetchImpl: () => Promise<unknown>) {
  vi.stubEnv("VITE_CHRIS_API", "https://api.test");
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const onDone = vi.fn();
  const user = userEvent.setup();
  renderWithProviders(<EnquiryForm onDone={onDone} />);
  return { fetchMock, onDone, user };
}

const sendButton = (name: RegExp | string = "Send message") =>
  screen.getByRole("button", { name });

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email address"), "ada@example.com");
  await user.selectOptions(
    screen.getByLabelText(/What kind of help/),
    "A new product or app",
  );
  await user.type(
    screen.getByLabelText("What's it about?"),
    "  A booking system for the studio.  ",
  );
}

describe("EnquiryForm", () => {
  it("sends the enquiry to the enquiry endpoint and says it's sent", async () => {
    const { fetchMock, onDone, user } = setup(async () => ({ ok: true }));
    await fill(user);
    await user.click(sendButton());

    expect(
      await screen.findByRole("heading", { name: "Message sent" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.test/enquiry");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      help: "new-product",
      message: "A booking system for the studio.",
    });

    // Focus lands on the sent view; Back to the site closes.
    expect(
      screen.getByRole("heading", { name: "Message sent" }).parentElement,
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Back to the site" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("leaves out the kind of help when none is chosen", async () => {
    const { fetchMock, user } = setup(async () => ({ ok: true }));
    await user.type(screen.getByLabelText("Name"), "Ada");
    await user.type(screen.getByLabelText("Email address"), "ada@example.com");
    await user.type(screen.getByLabelText("What's it about?"), "Hello");
    await user.click(sendButton());

    await screen.findByRole("heading", { name: "Message sent" });
    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
    });
  });

  it("shows what to fix instead of sending an incomplete enquiry", async () => {
    const { fetchMock, user } = setup(async () => ({ ok: true }));
    await user.type(screen.getByLabelText("Email address"), "ada@studio");
    await user.click(sendButton());

    expect(fetchMock).not.toHaveBeenCalled();
    const name = screen.getByLabelText("Name");
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription("Enter your name");
    expect(screen.getByLabelText("Email address")).toHaveAccessibleDescription(
      "Enter an email address like name@example.com",
    );
    const message = screen.getByLabelText("What's it about?");
    expect(message).toHaveAccessibleDescription(
      "Tell me a little about what you need",
    );
    // The kind of help is optional.
    expect(screen.getByLabelText(/What kind of help/)).not.toHaveAttribute(
      "aria-invalid",
    );

    // Fixing a field clears its error as you type.
    await user.type(message, "A new shop front");
    expect(message).not.toHaveAttribute("aria-invalid");
  });

  it("shows it is sending, and doesn't send twice on Enter", async () => {
    let respond: (value: { ok: boolean }) => void = () => {};
    const { fetchMock, user } = setup(
      () =>
        new Promise((resolve) => {
          respond = resolve;
        }),
    );
    await fill(user);
    await user.click(sendButton());

    expect(sendButton()).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Sending your message",
    );
    expect(screen.getByLabelText("Email address")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("What's it about?")).toHaveAttribute(
      "readonly",
    );
    expect(screen.getByLabelText(/What kind of help/)).toBeDisabled();

    await user.type(screen.getByLabelText("Email address"), "{Enter}");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    respond({ ok: true });
    expect(
      await screen.findByRole("heading", { name: "Message sent" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["the API answers with an error", () => Promise.resolve({ ok: false })],
    ["the request never arrives", () => Promise.reject(new Error("down"))],
  ])(
    "says it didn't send when %s, offers LinkedIn, and retries",
    async (_, failure) => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      let fail = true;
      const { fetchMock, user } = setup(() =>
        fail ? failure() : Promise.resolve({ ok: true }),
      );
      await fill(user);
      await user.click(sendButton());

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("That didn't send");
      expect(alert).toHaveTextContent("Your message didn't reach me");
      const linkedIn = within(alert).getByRole("link", { name: /LinkedIn/ });
      expect(linkedIn).toHaveAttribute(
        "href",
        "https://www.linkedin.com/in/christophertregaskis",
      );
      expect(linkedIn).toHaveAttribute("target", "_blank");
      const retry = sendButton("Try again");
      expect(retry).toHaveFocus();
      expect(retry).not.toHaveAttribute("aria-busy");
      expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
      expect(screen.getByLabelText("What's it about?")).toHaveValue(
        "  A booking system for the studio.  ",
      );
      expect(
        screen.queryByRole("heading", { name: "Message sent" }),
      ).not.toBeInTheDocument();
      expect(errorSpy).toHaveBeenCalled();

      fail = false;
      await user.click(retry);
      expect(
        await screen.findByRole("heading", { name: "Message sent" }),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );
});
