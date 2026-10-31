import React from "react";
import { TerminalLine } from "./TerminalLine";
import {
  changeDir,
  clearTerminal,
  curlCommand,
  filename,
  openResume,
  url,
} from "./terminalCommands";
import { ThemeMode, useTheme } from "@/features/theme";
import { GOOGLE_DOC_ID, useCVRequest } from "@/features/cv-request";
import { useToast } from "@/hooks/useToast";
import { ScreenSizeBreakPoint } from "@/lib/breakpoints";

interface TerminalProps {
  countOfExecution: number;
}

export const Terminal: React.FC<TerminalProps> = ({ countOfExecution }) => {
  const { status: requestCVStatus } = useCVRequest();
  const { themeMode } = useTheme();
  const { showToast } = useToast();

  const yourcomputer = React.useMemo(() => {
    return window.innerWidth < ScreenSizeBreakPoint.Smaller
      ? "~/ $ "
      : "yourcomputer ~/ $ ";
  }, [window.innerWidth]);

  const fileId = React.useMemo(
    () => [
      { text: "fileId", className: "text-[#ff57c8]" },
      { text: "=", className: "text-[#fff]" },
      {
        text:
          requestCVStatus === "success"
            ? GOOGLE_DOC_ID
            : " [ To access file id, please first click PDF icon and complete form request. ]",
        className:
          requestCVStatus === "success" ? "text-[#d2691e]" : "text-[#fff]",
      },
    ],
    [],
  );

  const renderTerminal = React.useMemo(() => {
    switch (countOfExecution) {
      // Directory change
      case 0: {
        return (
          <TerminalLine yourcomputer={yourcomputer} typedWords={changeDir} />
        );
      }

      // Create variable - filename
      case 1: {
        return (
          <>
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={changeDir}
              skipAnimation
            />

            <TerminalLine yourcomputer={yourcomputer} typedWords={filename} />
          </>
        );
      }

      // Create variable - fileId
      case 2: {
        return (
          <>
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={changeDir}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={filename}
              skipAnimation
            />

            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={fileId}
              skipAnimation={requestCVStatus !== "success"}
              holdCursor={requestCVStatus !== "success"}
            />
          </>
        );
      }

      // Create variable - url
      case 3: {
        return (
          <>
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={changeDir}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={filename}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={fileId}
              skipAnimation
            />

            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={url}
              animationSpeed={{
                duration: 0.1,
                stagger: 0.05,
              }}
            />
          </>
        );
      }

      // Curl command
      case 4: {
        return (
          <>
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={changeDir}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={filename}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={fileId}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={url}
              skipAnimation
            />

            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={curlCommand}
              animationSpeed={{
                duration: 0.2,
                stagger: 0.075,
              }}
            />
          </>
        );
      }

      // Open resume
      case 5: {
        return (
          <>
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={changeDir}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={filename}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={fileId}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={url}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={curlCommand}
              skipAnimation
            />
            <TerminalLine yourcomputer={yourcomputer} typedWords={openResume} />
          </>
        );
      }

      // Clear terminal
      case 6: {
        return (
          <>
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={changeDir}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={filename}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={fileId}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={url}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={curlCommand}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={openResume}
              skipAnimation
            />
            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={clearTerminal}
            />
          </>
        );
      }

      default: {
        showToast("Unhandled terminal sequence", { scheme: "ERROR" });
      }
    }
  }, [yourcomputer, filename, fileId, curlCommand, countOfExecution]);

  return (
    <div className="h-full w-full flex p-2 overflow-x-auto scrollbar-hide scrollbar-custom">
      <div
        className={`
          ${themeMode === ThemeMode.DARK ? "bg-gray-950" : "bg-gray-900"} 
          text-light rounded-lg shadow-lg h-[250px] min-w-max
        `}
      >
        <div
          className={`pb-[15px] ${window.innerWidth < ScreenSizeBreakPoint.Smaller ? "" : "pl-[15px]"} h-full w-full flex flex-col`}
        >
          {renderTerminal}
        </div>
      </div>
    </div>
  );
};
