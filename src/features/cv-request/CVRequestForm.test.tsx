import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CVRequestForm } from "./CVRequestForm";
import { renderWithProviders } from "@/test/renderWithProviders";

const CV_URL =
  "https://drive.google.com/file/d/1AZSv0lZslUnKFXBZXfNR6NeZ1FUkLonj/view";

function setup(fetchImpl: () => Promise<unknown>) {
  vi.stubEnv("VITE_CHRIS_API", "https://api.test");
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const onDone = vi.fn();
  const user = userEvent.setup();
  renderWithProviders(<CVRequestForm onDone={onDone} />);
  return { fetchMock, onDone, user };
}

const submitButton = (name: RegExp | string = "Unlock the CV") =>
  screen.getByRole("button", { name });

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("First name"), "Ada");
  await user.type(screen.getByLabelText("Last name (optional)"), "Lovelace");
  await user.type(screen.getByLabelText("Email address"), "ada@example.com");
  await user.type(screen.getByLabelText("Message (optional)"), "Hello");
}

describe("CVRequestForm", () => {
  it("posts the form to the CV API and unlocks the CV", async () => {
    const { fetchMock, user } = setup(async () => ({ ok: true }));
    await fill(user);
    await user.click(submitButton());

    expect(
      await screen.findByRole("heading", { name: "CV unlocked" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.test/resume");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(JSON.parse(init.body as string)).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      message: "Hello",
    });
    expect(screen.getByText(/I'll be in touch/)).toBeInTheDocument();
  });

  it("links to the CV on Google Drive from the unlocked view, and closes", async () => {
    const { onDone, user } = setup(async () => ({ ok: true }));
    await fill(user);
    await user.click(submitButton());

    const view = await screen.findByRole("link", { name: "View CV" });
    expect(view).toHaveAttribute("href", CV_URL);
    expect(view).toHaveAttribute("target", "_blank");
    await user.click(screen.getByRole("button", { name: "Back to the site" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("still unlocks the CV when the API responds with an error", async () => {
    const { user } = setup(async () => ({ ok: false }));
    await fill(user);
    await user.click(submitButton());

    expect(
      await screen.findByRole("heading", { name: "CV unlocked" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/didn't reach me/)).toBeInTheDocument();
  });

  it("shows what to fix instead of sending an incomplete form", async () => {
    const { fetchMock, user } = setup(async () => ({ ok: true }));
    await user.type(screen.getByLabelText("Email address"), "ada@studio");
    await user.click(submitButton());

    expect(fetchMock).not.toHaveBeenCalled();
    const firstName = screen.getByLabelText("First name");
    expect(firstName).toHaveFocus();
    expect(firstName).toHaveAccessibleDescription("Enter your first name");
    expect(screen.getByLabelText("Email address")).toHaveAccessibleDescription(
      "Enter an email address like name@example.com",
    );

    // Fixing a field clears its error as you type.
    await user.type(firstName, "Ada");
    expect(firstName).not.toHaveAttribute("aria-invalid");
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
    await user.click(submitButton());

    const busy = submitButton();
    expect(busy).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Sending your request",
    );
    expect(screen.getByLabelText("Email address")).toHaveAttribute("readonly");

    await user.type(screen.getByLabelText("Email address"), "{Enter}");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    respond({ ok: true });
    expect(
      await screen.findByRole("heading", { name: "CV unlocked" }),
    ).toBeInTheDocument();
  });

  // The 3a known issue: a failed request used to leave Submit spinning.
  it("hands control back when the request fails, so it can be retried", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let fail = true;
    const { fetchMock, user } = setup(async () => {
      if (fail) throw new Error("network down");
      return { ok: true };
    });
    await fill(user);
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That didn't go through",
    );
    const retry = submitButton("Try again");
    expect(retry).not.toHaveAttribute("aria-busy");
    expect(retry).toHaveFocus();
    expect(screen.getByLabelText("First name")).toHaveValue("Ada");
    expect(
      screen.queryByRole("heading", { name: "CV unlocked" }),
    ).not.toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();

    fail = false;
    await user.click(retry);
    expect(
      await screen.findByRole("heading", { name: "CV unlocked" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
