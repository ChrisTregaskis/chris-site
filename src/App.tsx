import React from "react";
import { ToastContainer } from "react-toastify";

import Terminal, { googleDocId } from "./components/Terminal";
import KeyboardButton from "./components/KeyboardButton";
import useTerminal, { ActiveKeysEnum } from "./hooks/useTerminal";
import { useTheme } from "./hooks/useTheme";
import { ThemeMode } from "./context/ThemeContext";
import About from "./components/About";
import RequestResumeForm from "./components/RequestResumeForm";


/**
 * todoLIST:
 * 
 * - Handle form submission
 * - Handle getting back to terminal content
 * - Update hasSubmittedEmail state - if true, just show a new text saying "Looks like you've already requested the CV to be emailed..." and leave buttons
 * - Once hasSubmittedEmail true, render the full file id in terminal
 * 
 * - Add link for Medium Article Medium
 * - Terreform practice: Setup deployment on AWS 
 * - Setup CircleCI for automated deployments when updates to master
 * 
 * Create chris-api
 * - To handle the CV to be emailed
 * - Notify me to please!
 * - Setup CircleCI for automated deployments when updates to master
 * 
 * STRETCH
 * - Make responsive? Figure out what that means... minimum set min width on terminal?
 * 
 * @description App is root level for rendering chris-tregaskis.uk
 */
function App() {
  const { setThemeMode } = useTheme();
  const [ hasSubmittedEmail, setHasSubmittedEmail ] = React.useState(false);
  const [ activeContent, setActiveContent ] = React.useState<"terminal" | "about" | "resume">("terminal");

  const {
    countOfExecution,
    activeKeys,
    countOfExecutionLimit,
    handleKeyDown,
    handleKeyUp,
    setCountOfExecution,
    handleEnterPressClick
  } = useTerminal();

  const wrapperDivRef = React.useRef<HTMLDivElement>(null);
  const countOfExecutionRef = React.useRef(countOfExecution);

    // Handler for opening CV in new window
    const handleOpenCV = React.useCallback(() => {
      if (hasSubmittedEmail) {
        window.open(`https://drive.google.com/file/d/${googleDocId}/view`);
      } else {
        setActiveContent("resume");
      }
    }, [ hasSubmittedEmail ]);

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

  const renderContent = React.useMemo(() => {
    switch (activeContent) {
      case "about":
        return (
          <About />
        );
      case "terminal":
        return (
          <Terminal 
            countOfExecution={countOfExecution} 
            hasSubmittedEmail={hasSubmittedEmail}
          />
        );
        case "resume":
          return (
            <RequestResumeForm />
          );
    }
  }, [
    countOfExecution, 
    hasSubmittedEmail,
    activeContent
  ])

  
  return (
    <>
      <div 
        ref={wrapperDivRef}
        className="p-1 min-h-screen bg-bgColor flex flex-col justify-center items-center" 
        onKeyDown={handleKeyDown} 
        onKeyUp={handleKeyUp}
        tabIndex={0}
      >
        <div className="fixed top-0 right-0 p-4">
          <div className="flex justify-end w-full pr-4 gap-2 text-white">
            <KeyboardButton 
              keyType="terminal" 
              handleClick={() => setActiveContent("terminal")}
            />
            <KeyboardButton 
              keyType="about" 
              handleClick={() => setActiveContent("about")}
            />
            <KeyboardButton 
              keyType="resume" 
              handleClick={handleOpenCV} 
            />
            <KeyboardButton 
              keyType="lightbulb" 
              handleClick={handleLightSwitchClick}
            />
          </div>
        </div>

        {renderContent}

        {activeContent === "terminal" && (
          <>
            <div className="flex justify-end w-3/4 pr-4 gap-2 text-white max-w-7xl">
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
              Hot take, light mode can be pretty wild...
            </p>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
