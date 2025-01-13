import React from "react";
import { ToastContainer } from "react-toastify";

import Terminal from "./components/Terminal";
import KeyboardButton from "./components/KeyboardButton";
import useTerminal, { ActiveKeysEnum } from "./hooks/useTerminal";
import { useTheme } from "./hooks/useTheme";
import { ThemeMode } from "./context/ThemeContext";


/**
 * todoLIST:
 * 
 * - Get onto github
 * - REFACTOR: Instead of a hint, count down and trigger enter every 3 seconds until its complete
 *    - This makes it cleaner and don't have to worry
 * - Add link for Medium Article Medium
 * - Setup deployment on AWS and deploy
 * 
 * STRETCH
 * - Move state and relevant terminal actions into a useTerminal hook to clean up App.tsx?
 * - Animate the autofill terminal. If enter clicked, just populate whole thing
 * - Make responsive! Figure out what that means... minimum set min width on terminal?
 * 
 * @description App is root level for rendering chris-tregaskis.uk
 */
function App() {
  const { setThemeMode } = useTheme();
  
  // Handler for opening CV in new window
  const handleOpenCV = React.useCallback(() => {
    window.open("https://drive.google.com/file/d/1dwaBdQymxkluBzD_F5aj1kqcqO6sg-A-/view");
  }, []);

  const {
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
  } = useTerminal({ openCVCallback: handleOpenCV });

  const wrapperDivRef = React.useRef<HTMLDivElement>(null);
  const countOfExecutionRef = React.useRef(countOfExecution);
  const hintCountRef = React.useRef(hintCount);

  // Handle the light bulb toggle button click
  const handleLightSwitchClick = React.useCallback(() => {
    setThemeMode(prevThemeMode => 
      prevThemeMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK
    );

    // Refocus as to not toggle light by enter key
    wrapperDivRef.current?.focus();
  }, [])
  
  // Hacky work around due to triggerHint useCallback not taking current hintCount value...
  React.useEffect(() => {
    hintCountRef.current = hintCount;
  }, [ hintCount ]);

  // Focus on wrapper to listen for key events
  React.useEffect(() => {
    if (wrapperDivRef.current) {
      wrapperDivRef.current.focus();
    }
  }, [ wrapperDivRef.current ]);

  // Timeouts to assist visitor by indicating to press the button!
  React.useEffect(() => {
    if (completedSetOnce) {
      return;
    }

    countOfExecutionRef.current = countOfExecution;

    const interval = setInterval(() => {
      if (completedSetOnce || hintCountRef.current > 5) {
        // todoCT: Lock the enter trigger and automate the text in the terminal!
        // todoCT: Unlock when done
        setCountOfExecution(countOfExecutionLimit);
        clearInterval(interval);
      } else if (countOfExecutionRef.current === countOfExecution) {
        triggerHint();
      }
    }, 10000);
  
    return () => {
      interval && clearInterval(interval);
    };
  }, [ countOfExecution ]);

  
  return (
    <>
      <div 
        ref={wrapperDivRef}
        className="p-1 min-h-screen bg-bgColor flex flex-col justify-center items-center" 
        onKeyDown={handleKeyDown} 
        onKeyUp={handleKeyUp}
        tabIndex={0}
      >
        <div className="flex justify-end w-3/4 pr-4 gap-2 text-white">
          <KeyboardButton 
            keyType="pdf-cv" 
            handleClick={handleOpenCV} 
            leftActive={activeKeys[ ActiveKeysEnum.C ]}
            rightActive={activeKeys[ ActiveKeysEnum.V ]}
          />
          <KeyboardButton 
            keyType="lightbulb" 
            handleClick={handleLightSwitchClick}
          />
        </div>

        <Terminal countOfExecution={countOfExecution} />

        <div className="flex justify-end w-3/4 pr-4 gap-2 text-white">
          <KeyboardButton 
            keyType="enter" 
            handleClick={handleEnterPressClick}
            isActive={activeKeys[ ActiveKeysEnum.ENTER ]}
          />
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
