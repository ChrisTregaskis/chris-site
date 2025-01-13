import React from "react";

// Would be good to extract this out of terminal commands.
// Essential total command lines - 2. As starts on 0 and last command is clear.
const countOfExecutionLimit = 5;

export enum ActiveKeysEnum {
  ENTER = "enter",
  C = "c",
  V = "v"
}

export interface ActiveKeys {
  [ ActiveKeysEnum.ENTER ]: boolean;
  [ ActiveKeysEnum.C ]: boolean;
  [ ActiveKeysEnum.V ]: boolean;
}

const useTerminal = ({
  openCVCallback
}: { 
  openCVCallback: () => void; 
}) => {
  const [ countOfExecution, setCountOfExecution ] = React.useState<number>(0);
  
  const [ activeKeys, setActiveKeys ] = React.useState<ActiveKeys>(() => ({
    [ ActiveKeysEnum.ENTER ]: false,
    [ ActiveKeysEnum.C ]: false,
    [ ActiveKeysEnum.V ]: false
  }));

  // Could be put into a reducer... update relevant key active state
  const updateActiveKeys = React.useCallback((key: ActiveKeysEnum, value: boolean) => {
    setActiveKeys(prevState => ({
      ...prevState,
      [ key ]: value
    }));
  }, []);

  // Increment execution on Enter
  const handleEnterPressClick = React.useCallback(() => {
    if (countOfExecution <= countOfExecutionLimit) {
      setCountOfExecution(prev => prev + 1);
    } else {
      setCountOfExecution(0);
    }
  }, [ countOfExecution ]);


  // Activate relevant keys
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") updateActiveKeys(ActiveKeysEnum.ENTER, true);
    if (event.key === "c") updateActiveKeys(ActiveKeysEnum.C, true);
    if (event.key === "v") updateActiveKeys(ActiveKeysEnum.V, true);
  }, [ countOfExecution, updateActiveKeys ]);

  // Resent relevant keys active state and perform either Enter or CV actions
  const handleKeyUp = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      updateActiveKeys(ActiveKeysEnum.ENTER, false);
      handleEnterPressClick();
    }
    
    // if the keys C is being held down and the key up is V, trigger handleOpenCV func
    if (activeKeys[ ActiveKeysEnum.C ] && activeKeys[ ActiveKeysEnum.V ]) {
      updateActiveKeys(ActiveKeysEnum.C, false);
      updateActiveKeys(ActiveKeysEnum.V, false);
      openCVCallback();
    } else {
      // Update states of other keys
      if (event.key === "c") updateActiveKeys(ActiveKeysEnum.C, false);
      if (event.key === "v") updateActiveKeys(ActiveKeysEnum.V, false);
    }
  }, [ countOfExecution, activeKeys ]);

  return {
    countOfExecution,
    activeKeys,
    countOfExecutionLimit,
    handleKeyDown,
    handleKeyUp,
    setCountOfExecution,
    handleEnterPressClick
  }
}

export default useTerminal;