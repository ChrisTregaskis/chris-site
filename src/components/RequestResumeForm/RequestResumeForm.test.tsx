import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RequestResumeForm from "./RequestResumeForm";
import { renderWithProviders } from "@/test/renderWithProviders";

const CV_URL =
  "https://drive.google.com/file/d/1AZSv0lZslUnKFXBZXfNR6NeZ1FUkLonj/view";

function setup(fetchImpl: () => Promise<unknown>) {
  vi.stubEnv("VITE_CHRIS_API", "https://api.test");
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  renderWithProviders(<RequestResumeForm />);
  return { fetchMock, user };
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("First Name"), "Ada");
  await user.type(screen.getByLabelText("Last Name (optional)"), "Lovelace");
  await user.type(screen.getByLabelText("Email Address"), "ada@example.com");
  await user.type(
    screen.getByLabelText("Additional Message (optional)"),
    "Hello",
  );
  await user.click(screen.getByRole("button", { name: "Submit" }));
}

describe("RequestResumeForm", () => {
  it("posts the form to the CV API and unlocks the CV", async () => {
    const { fetchMock, user } = setup(async () => ({ ok: true }));
    await fillAndSubmit(user);

    expect(
      await screen.findByRole("heading", { name: "CV Unlocked!" }),
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
    expect(await screen.findByText("Chris's CV unlocked.")).toBeInTheDocument();
  });

  it("opens the CV on Google Drive from the unlocked view", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { user } = setup(async () => ({ ok: true }));
    await fillAndSubmit(user);

    await user.click(await screen.findByRole("button", { name: "View CV" }));
    expect(openSpy).toHaveBeenCalledWith(CV_URL);
  });

  it("still unlocks the CV when the API responds with an error", async () => {
    const { user } = setup(async () => ({ ok: false }));
    await fillAndSubmit(user);

    expect(
      await screen.findByRole("heading", { name: "CV Unlocked!" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Oh no! Couldn't send the email... don't worry, CV now available.",
      ),
    ).toBeInTheDocument();
  });

  // Known issue (pinned, not fixed in 3a): on a rejected fetch the status stays
  // "loading", so Submit remains a spinner. Only the user-visible parts that
  // must survive a fix are asserted here.
  it("stays on the form when the request fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { user } = setup(async () => {
      throw new Error("network down");
    });
    await fillAndSubmit(user);

    expect(
      await screen.findByText("Oh no! request failed."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Unlock Chris's CV" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "CV Unlocked!" }),
    ).not.toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
  });
});
