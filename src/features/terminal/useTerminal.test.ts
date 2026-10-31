import type React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActiveKeysEnum, useTerminal } from "./useTerminal";

const enterEvent = { key: "Enter" } as React.KeyboardEvent<HTMLDivElement>;

describe("useTerminal", () => {
  it("advances one command per Enter press", () => {
    const { result } = renderHook(() => useTerminal());
    act(() => result.current.handleEnterPressClick());
    act(() => result.current.handleEnterPressClick());
    expect(result.current.countOfExecution).toBe(2);
  });

  it("wraps back to the first command after the last", () => {
    const { result } = renderHook(() => useTerminal());
    expect(result.current.countOfExecutionLimit).toBe(5);
    for (let i = 0; i < 6; i++) {
      act(() => result.current.handleEnterPressClick());
    }
    expect(result.current.countOfExecution).toBe(6);
    act(() => result.current.handleEnterPressClick());
    expect(result.current.countOfExecution).toBe(0);
  });

  it("marks Enter active while held", () => {
    const { result } = renderHook(() => useTerminal());
    act(() => result.current.handleKeyDown(enterEvent));
    expect(result.current.activeKeys[ActiveKeysEnum.ENTER]).toBe(true);
    act(() => result.current.handleKeyUp(enterEvent));
    expect(result.current.activeKeys[ActiveKeysEnum.ENTER]).toBe(false);
    expect(result.current.countOfExecution).toBe(1);
  });
});
