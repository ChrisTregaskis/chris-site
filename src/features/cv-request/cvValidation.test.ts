import { describe, expect, it } from "vitest";
import {
  EMPTY_CV_VALUES,
  firstInvalidField,
  validateCV,
  validateCVField,
} from "./cvValidation";

describe("CV form validation", () => {
  it("asks for a first name", () => {
    expect(validateCVField("firstName", "  ")).toBe("Enter your first name");
    expect(validateCVField("firstName", "Ada")).toBe("");
  });

  it("asks for an email address, then for one that looks real", () => {
    expect(validateCVField("email", "")).toBe("Enter your email address");
    expect(validateCVField("email", "ada@studio")).toBe(
      "Enter an email address like name@example.com",
    );
    expect(validateCVField("email", " ada@example.com ")).toBe("");
  });

  it("leaves the optional fields alone", () => {
    expect(validateCVField("lastName", "")).toBe("");
    expect(validateCVField("message", "")).toBe("");
  });

  it("collects every error and finds the first one in form order", () => {
    const errors = validateCV({ ...EMPTY_CV_VALUES, email: "nope" });
    expect(errors).toEqual({
      firstName: "Enter your first name",
      email: "Enter an email address like name@example.com",
    });
    expect(firstInvalidField(errors)).toBe("firstName");
    expect(firstInvalidField({})).toBeUndefined();
  });
});
