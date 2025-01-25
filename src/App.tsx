import React from "react";
import { ToastContainer } from "react-toastify";

import Terminal, { googleDocId } from "./components/Terminal";
import KeyboardButton from "./components/KeyboardButton";
import useTerminal, { ActiveKeysEnum } from "./hooks/useTerminal";
import { useTheme } from "./hooks/useTheme";
import { ThemeMode } from "./context/ThemeContext";
import About from "./components/About";
import RequestResumeForm from "./components/RequestResumeForm/RequestResumeForm";
import { useRequestCV } from "./hooks/useRequestCV";
import { useActiveContent } from "./hooks/useActiveContent";
import useToast from "./hooks/useToast";

/**
 * todoLIST:
 *
 * - Add link for Medium Article Medium
 * - Make responsive? Make terminal scrollable on mobile and smaller screens
 * - Setup husky
 *
 * @description App is root level for rendering chris-tregaskis.uk
 */
function App() {
  const { setThemeMode } = useTheme();
  const { status: cvRequestStatus } = useRequestCV();
  const { activeContent, setActiveContent } = useActiveContent();
  const { showToast } = useToast();

  const {
    countOfExecution,
    activeKeys,
    countOfExecutionLimit,
    handleKeyDown,
    handleKeyUp,
    setCountOfExecution,
    handleEnterPressClick,
  } = useTerminal();

  const wrapperDivRef = React.useRef<HTMLDivElement>(null);
  const countOfExecutionRef = React.useRef(countOfExecution);

  // Handler for opening CV in new window
  const handleOpenCV = React.useCallback(() => {
    if (cvRequestStatus === "success") {
      window.open(`https://drive.google.com/file/d/${googleDocId}/view`);
    } else {
      setActiveContent("resume");
    }
  }, [cvRequestStatus]);

  // Handle the light bulb toggle button click
  const handleLightSwitchClick = React.useCallback(() => {
    setThemeMode((prevThemeMode) =>
      prevThemeMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK,
    );

    // Refocus as to not toggle light by enter key
    wrapperDivRef.current?.focus();
  }, []);

  // Focus on wrapper to listen for key events
  React.useEffect(() => {
    if (wrapperDivRef.current) {
      wrapperDivRef.current.focus();
    }
  }, [wrapperDivRef.current]);

  React.useEffect(() => {
    countOfExecutionRef.current = countOfExecution;

    // If the user hasn't clicked or pressed Enter yet - load the next line..
    const interval = setInterval(() => {
      if (
        countOfExecutionRef.current === countOfExecution &&
        countOfExecution < countOfExecutionLimit
      ) {
        setCountOfExecution((prevCount) => prevCount + 1);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [countOfExecution]);

  const renderContent = React.useMemo(() => {
    switch (activeContent) {
      case "about":
        return <About />;
      case "terminal":
        return <Terminal countOfExecution={countOfExecution} />;
      case "resume":
        return <RequestResumeForm />;
      default:
        showToast("Unhandled content renderer", { scheme: "ERROR" });
    }
  }, [countOfExecution, activeContent]);

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
            <KeyboardButton keyType="resume" handleClick={handleOpenCV} />
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
                isActive={activeKeys[ActiveKeysEnum.ENTER]}
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
