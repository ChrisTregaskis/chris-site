import React from "react";

// Would be good to extract this out of terminal commands.
// Essential total command lines - 2. As starts on 0 and last command is clear.
const countOfExecutionLimit = 5;

// Did have c and v here but striped out as no longer using them.
// Leaving this pattern incase I would like to add key state, eg. "l" for toggling theme
export enum ActiveKeysEnum {
  ENTER = "enter",
}

export interface ActiveKeys {
  [ActiveKeysEnum.ENTER]: boolean;
}

const useTerminal = () => {
  const [countOfExecution, setCountOfExecution] = React.useState<number>(0);

  const [activeKeys, setActiveKeys] = React.useState<ActiveKeys>(() => ({
    [ActiveKeysEnum.ENTER]: false,
  }));

  // Could be put into a reducer... update relevant key active state
  const updateActiveKeys = React.useCallback(
    (key: ActiveKeysEnum, value: boolean) => {
      setActiveKeys((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    },
    [],
  );

  // Increment execution on Enter
  const handleEnterPressClick = React.useCallback(() => {
    if (countOfExecution <= countOfExecutionLimit) {
      setCountOfExecution((prev) => prev + 1);
    } else {
      setCountOfExecution(0);
    }
  }, [countOfExecution]);

  // Activate relevant keys
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") updateActiveKeys(ActiveKeysEnum.ENTER, true);
    },
    [countOfExecution, updateActiveKeys],
  );

  // Resent relevant keys active state and perform either Enter or CV actions
  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        updateActiveKeys(ActiveKeysEnum.ENTER, false);
        handleEnterPressClick();
      }
    },
    [countOfExecution, activeKeys],
  );

  return {
    countOfExecution,
    activeKeys,
    countOfExecutionLimit,
    handleKeyDown,
    handleKeyUp,
    setCountOfExecution,
    handleEnterPressClick,
  };
};

export default useTerminal;
