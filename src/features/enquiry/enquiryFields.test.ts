import { describe, expect, it } from "vitest";
import { validateEnquiryField } from "./enquiryFields";
import { enquiryPayload } from "./sendEnquiry";

describe("enquiry fields", () => {
  it("needs a name, a well-formed email and a message; help is optional", () => {
    expect(validateEnquiryField("name", "  ")).toBe("Enter your name");
    expect(validateEnquiryField("name", "Ada")).toBe("");
    expect(validateEnquiryField("email", "")).toBe("Enter your email address");
    expect(validateEnquiryField("email", "ada@studio")).toMatch(/like name@/);
    expect(validateEnquiryField("email", "ada@example.com")).toBe("");
    expect(validateEnquiryField("message", "\n")).toBe(
      "Tell me a little about what you need",
    );
    expect(validateEnquiryField("help", "")).toBe("");
  });

  it("trims what it sends and leaves out an unchosen kind of help", () => {
    expect(
      enquiryPayload({
        name: " Ada ",
        email: "ada@example.com ",
        help: "",
        message: " Hi ",
      }),
    ).toEqual({ name: "Ada", email: "ada@example.com", message: "Hi" });
    expect(
      enquiryPayload({
        name: "Ada",
        email: "ada@example.com",
        help: "ai",
        message: "Hi",
      }),
    ).toMatchObject({ help: "ai" });
  });
});
