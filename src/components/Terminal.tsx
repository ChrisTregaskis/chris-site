import React from "react";
import TerminalLine from "./TerminalLine";
import { useTheme } from "@/hooks/useTheme";
import { ThemeMode } from "@/context/ThemeContext";
import { useRequestCV } from "@/hooks/useRequestCV";
import useToast from "@/hooks/useToast";

export const googleDocId = "1IorDwgu09TA9pEM94Rdzo2-y1qFiMQaN";

/**
 *
 * Original commands:
 * https://drive.usercontent.google.com/u/0/uc?id=1IorDwgu09TA9pEM94Rdzo2-y1qFiMQaN&export=download
 *
 * cd ~/Downloads/
 * filename="ChrisTregaskisResume.pdf"
 * fileId="1IorDwgu09TA9pEM94Rdzo2-y1qFiMQaN"
 * curl -L "https://drive.usercontent.google.com/download?id=${fileId}&export=download" --output "${filename}"
 * open "${filename}"
 * clear
 */
const changeDir = [
  { text: "cd ", className: "text-[#FE4450]" },
  { text: "~/Downloads/", className: "text-[#BBBBBB]" },
];

const filename = [
  { text: "filename", className: "text-[#ff57c8]" },
  { text: "=", className: "text-[#fff]" },
  { text: "ChrisTregaskisResume.pdf", className: "text-[#d2691e]" },
];

const url = [
  { text: "url", className: "text-[#ff57c8]" },
  { text: "=", className: "text-[#fff]" },
  {
    text: `"${"https://drive.usercontent.google.com/download?id=${"}`,
    className: "text-[#d2691e]",
  },
  { text: "fileId", className: "text-[#ff57c8]" },
  { text: `}&export=download"`, className: "text-[#d2691e]" },
];

const curlCommand = [
  { text: "curl", className: "text-[#FE4450]" },
  { text: " -", className: "text-[#fff]" },
  { text: "L ", className: "text-[#ff57c8]" },
  { text: `"${"${"}`, className: "text-[#d2691e]" },
  { text: "url", className: "text-[#ff57c8]" },
  { text: `${"}"}"`, className: "text-[#d2691e]" },
  { text: " --", className: "text-[#fff]" },
  { text: "output ", className: "text-[#ff57c8]" },
  { text: `"${"${"}`, className: "text-[#d2691e]" },
  { text: "filename", className: "text-[#ff57c8]" },
  { text: `${"}"}"`, className: "text-[#d2691e]" },
];

const openResume = [
  { text: "open ", className: "text-[#FE4450]" },
  { text: `"${"${"}`, className: "text-[#d2691e]" },
  { text: "filename", className: "text-[#ff57c8]" },
  { text: `${"}"}"`, className: "text-[#d2691e]" },
];

const clearTerminal = [{ text: "clear", className: "text-[#FE4450]" }];

const yourcomputer = "yourcomputer ~/ $ ";

interface TerminalProps {
  countOfExecution: number;
}

const Terminal: React.FC<TerminalProps> = ({ countOfExecution }) => {
  const { status: requestCVStatus } = useRequestCV();
  const { themeMode } = useTheme();
  const { showToast } = useToast();

  React.useEffect(() => {
    console.log("TEST_RUN: requestCVStatus", requestCVStatus);
  }, [requestCVStatus]);

  const fileId = React.useMemo(
    () => [
      { text: "fileId", className: "text-[#ff57c8]" },
      { text: "=", className: "text-[#fff]" },
      {
        text:
          requestCVStatus === "success"
            ? googleDocId
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
    <div className="h-full w-full flex p-2">
      <div
        className={`
          ${themeMode === ThemeMode.DARK ? "bg-gray-950" : "bg-gray-900"} 
          text-light rounded-lg shadow-lg h-[250px] w-full
        `}
      >
        <div className="pb-[15px] pl-[15px] h-full w-full min-w-max flex flex-col">
          {renderTerminal}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
