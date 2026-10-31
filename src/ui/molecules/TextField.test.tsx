import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("TextField", () => {
  it("associates the label with the field", () => {
    renderWithProviders(<TextField label="First name" name="firstName" />);
    expect(screen.getByLabelText("First name")).toHaveAttribute(
      "name",
      "firstName",
    );
  });

  it("marks the optional field in its label", () => {
    renderWithProviders(
      <TextField label="Last name" name="lastName" optional />,
    );
    expect(
      screen.getByLabelText(/Last name.*\(optional\)/),
    ).toBeInTheDocument();
  });

  it("describes the field by its error and marks it invalid", () => {
    renderWithProviders(
      <TextField
        label="Email"
        name="email"
        type="email"
        error="Enter your email address"
      />,
    );
    const field = screen.getByLabelText("Email");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Enter your email address");
  });

  it("has no error wiring when valid", () => {
    renderWithProviders(<TextField label="Email" name="email" />);
    const field = screen.getByLabelText("Email");
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(field).not.toHaveAttribute("aria-describedby");
  });

  it("keeps error ids unique across fields", () => {
    renderWithProviders(
      <>
        <TextField label="First name" name="firstName" error="Enter a name" />
        <TextField label="Email" name="email" error="Enter an email" />
      </>,
    );
    const first = screen.getByLabelText("First name");
    const email = screen.getByLabelText("Email");
    expect(first.getAttribute("aria-describedby")).not.toBe(
      email.getAttribute("aria-describedby"),
    );
    expect(first).toHaveAccessibleDescription("Enter a name");
    expect(email).toHaveAccessibleDescription("Enter an email");
  });

  it("renders a textarea when multiline", () => {
    renderWithProviders(
      <TextField label="Message" name="message" multiline optional />,
    );
    expect(screen.getByRole("textbox", { name: /Message/ }).tagName).toBe(
      "TEXTAREA",
    );
  });

  it("passes typing through", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <TextField
          label="Email"
          name="email"
          type="email"
          value={value}
          onChange={(event) => {
            onChange(event);
            setValue(event.target.value);
          }}
        />
      );
    }
    renderWithProviders(<Controlled />);
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
  });
});
