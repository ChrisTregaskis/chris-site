import React from "react";

// Would be good to extract this out of terminal commands.
// Essential total command lines - 2. As starts on 0 and last command is clear.
const countOfExecutionLimit = 4;

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
  const [ hintCount, setHintCount ] = React.useState<number>(0);
  const [ completedSetOnce, setCompletedSetOnce ] = React.useState<boolean>(false);
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
      console.log("Enter key pressed or clicked");
      setCountOfExecution(prev => prev + 1);

      if (countOfExecution === countOfExecutionLimit) {
        setCompletedSetOnce(true);
      }
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


  // If the user hasn't clicked or pressed Enter yet - give'em a hint to do so!
  const triggerHint = React.useCallback(() => {
    // make button flash twice utilising active keys state
    const flashIntervals = [ 250, 250, 450, 450 ];
    let isActive = true;
  
    flashIntervals.forEach((_interval, index) => {
      setTimeout(() => {
        updateActiveKeys(ActiveKeysEnum.ENTER, isActive);
        isActive = !isActive;
      }, flashIntervals.slice(0, index + 1).reduce((a, b) => a + b, 0));
    });

    setHintCount(prev => prev + 1);
  }, [ countOfExecution ]);


  React.useEffect(() => {
    // todoCT: if page loaded and !completedSetOnce for more than 15 seonds, automate count upto curl cmd
  }, [ countOfExecution ]);

  return {
    hintCount,
    completedSetOnce,
    countOfExecution,
    activeKeys,
    countOfExecutionLimit,
    handleKeyDown,
    handleKeyUp,
    triggerHint,
    setCountOfExecution,
    handleEnterPressClick
  }
}

export default useTerminal;