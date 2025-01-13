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
 * - Add link for Medium Article Medium
 * - Setup deployment on AWS and deploy
 * 
 * STRETCH
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
    countOfExecution,
    activeKeys,
    countOfExecutionLimit,
    handleKeyDown,
    handleKeyUp,
    setCountOfExecution,
    handleEnterPressClick
  } = useTerminal({ openCVCallback: handleOpenCV });

  const wrapperDivRef = React.useRef<HTMLDivElement>(null);
  const countOfExecutionRef = React.useRef(countOfExecution);

  // Handle the light bulb toggle button click
  const handleLightSwitchClick = React.useCallback(() => {
    setThemeMode(prevThemeMode => 
      prevThemeMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK
    );

    // Refocus as to not toggle light by enter key
    wrapperDivRef.current?.focus();
  }, [])
  
  // Focus on wrapper to listen for key events
  React.useEffect(() => {
    if (wrapperDivRef.current) {
      wrapperDivRef.current.focus();
    }
  }, [ wrapperDivRef.current ]);

  React.useEffect(() => {
    countOfExecutionRef.current = countOfExecution;
    
    // If the user hasn't clicked or pressed Enter yet - load the next line..
    const interval = setInterval(() => {
      if (
        countOfExecutionRef.current === countOfExecution && 
        countOfExecution < countOfExecutionLimit
      ) {
        setCountOfExecution(prevCount => prevCount + 1);
      }
    }, 5000);
  
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

      <p 
        className={`
        text-dark fixed bottom-0 left-0 p-2 
          after:absolute after:top-0 after:right-0 after:w-3/4 after:h-full after:bg-gradient-to-l after:from-bgColor after:to-transparent after:content-['']
        `}
      >
        Lets be honest, light mode can be pretty wild...
      </p>
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
