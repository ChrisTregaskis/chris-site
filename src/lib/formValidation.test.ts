import { describe, expect, it } from "vitest";
import {
  emailError,
  firstInvalid,
  requiredError,
  validateFields,
} from "./formValidation";

describe("form validation", () => {
  it("checks an email's shape after trimming", () => {
    expect(emailError(" ")).toBe("Enter your email address");
    expect(emailError("ada@studio")).toBe(
      "Enter an email address like name@example.com",
    );
    expect(emailError(" ada@example.com ")).toBe("");
  });

  it("treats a value of only spaces as missing", () => {
    expect(requiredError(" \n ", "Needed")).toBe("Needed");
    expect(requiredError("x", "Needed")).toBe("");
  });

  it("collects every error and finds the first in form order", () => {
    const fields = ["a", "b", "c"] as const;
    const errors = validateFields(
      fields,
      { a: "ok", b: "", c: "" },
      (field, value) => (field !== "a" && !value ? `${field} missing` : ""),
    );
    expect(errors).toEqual({ b: "b missing", c: "c missing" });
    expect(firstInvalid(fields, errors)).toBe("b");
    expect(firstInvalid(fields, {})).toBeUndefined();
  });
});
