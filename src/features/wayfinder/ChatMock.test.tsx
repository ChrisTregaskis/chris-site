import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMock } from "./ChatMock";

const greeting = [{ id: 0, from: "bot", kind: "greeting" }] as const;

describe("ChatMock", () => {
  it("tells assistive tech when Wayfinder is typing", () => {
    render(
      <ChatMock messages={[...greeting]} typing trace={[]} onSend={() => {}} />,
    );
    // The dots are decorative; the log reads "Typing".
    expect(
      within(screen.getByRole("log", { name: "Wayfinder chat" })).getByText(
        "Typing",
      ),
    ).toBeInTheDocument();
  });

  it("says nothing about typing once the reply has landed", () => {
    render(
      <ChatMock
        messages={[...greeting]}
        typing={false}
        trace={[]}
        onSend={() => {}}
      />,
    );
    expect(screen.queryByText("Typing")).not.toBeInTheDocument();
  });

  it("leads the vehicle card with a responsive, lazy sketch", () => {
    render(
      <ChatMock
        messages={[...greeting, { id: 1, from: "bot", kind: "vehicle" }]}
        typing={false}
        trace={[]}
        onSend={() => {}}
      />,
    );
    const sketch = screen.getByRole("img", {
      name: "Sketch of a lilac family SUV on a city street",
    });
    expect(sketch).toHaveAttribute("loading", "lazy");
    expect(sketch).toHaveAttribute("width", "400");
    expect(sketch).toHaveAttribute("height", "200");
    expect(sketch.getAttribute("srcset")).toMatch(/ 400w, .+ 800w$/);
    expect(sketch).toHaveAttribute("sizes");
  });
});
