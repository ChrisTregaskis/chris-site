import React from "react";
import { ToastContainer } from "react-toastify";

import { useActiveContent } from "./ActiveContentContext";
import { About } from "@/features/about";
import { ActiveKeysEnum, Terminal, useTerminal } from "@/features/terminal";
import {
  CV_VIEW_URL,
  CVRequestForm,
  useCVRequest,
} from "@/features/cv-request";
import { KeyboardButton } from "@/ui/KeyboardButton";
import { useToast } from "@/hooks/useToast";

/** App is root level for rendering chris-tregaskis.uk */
export function App() {
  const { status: cvRequestStatus } = useCVRequest();
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
      window.open(CV_VIEW_URL);
    } else {
      setActiveContent("resume");
    }
  }, [cvRequestStatus]);

  // Handle the light bulb toggle button click - removed ability to toggle theme for now
  // const handleLightSwitchClick = React.useCallback(() => {
  //   setThemeMode((prevThemeMode) =>
  //     prevThemeMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK,
  //   );

  //   // Refocus as to not toggle light by enter key
  //   wrapperDivRef.current?.focus();
  // }, []);

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
        return <CVRequestForm />;
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
          <div className="flex justify-end w-full gap-2 text-white">
            <KeyboardButton
              keyType="terminal"
              handleClick={() => setActiveContent("terminal")}
            />
            <KeyboardButton
              keyType="about"
              handleClick={() => setActiveContent("about")}
            />
            <KeyboardButton keyType="resume" handleClick={handleOpenCV} />
            {/** Removed the ability to switch theme for now */}
            {/* <KeyboardButton
              keyType="lightbulb"
              handleClick={handleLightSwitchClick}
            /> */}

            {activeContent === "terminal" && (
              <KeyboardButton
                keyType="enter-sm"
                handleClick={handleEnterPressClick}
                isActive={activeKeys[ActiveKeysEnum.ENTER]}
              />
            )}
          </div>
        </div>

        {renderContent}
      </div>
      <ToastContainer />
    </>
  );
}
