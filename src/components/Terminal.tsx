import React from "react";
import TerminalLine from "./TerminalLine";
import { useTheme } from "@/hooks/useTheme";
import { ThemeMode } from "@/context/ThemeContext";
import { useRequestCV } from "@/hooks/useRequestCV";

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
  { text: "~/Downloads/", className: "text-[#BBBBBB]" }
];

const filename = [
  { text: "filename", className: "text-[#ff57c8]" },
  { text: "=", className: "text-[#fff]" },
  { text: "ChrisTregaskisResume.pdf", className: "text-[#d2691e]" }
];

const fileId = [
  { text: "fileId", className: "text-[#ff57c8]" },
  { text: "=", className: "text-[#fff]" },
  { text: " [ To access file id, please first click PDF icon and complete form request. ]", className: "text-[#fff]" }
];

const url = [
  { text: "url", className: "text-[#ff57c8]" },
  { text: "=", className: "text-[#fff]" },
  { text: `"${"https://drive.usercontent.google.com/download?id=${"}`, className: "text-[#d2691e]" },
  { text: "fileId", className: "text-[#ff57c8]" },
  { text: `}&export=download"`, className: "text-[#d2691e]" }
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
  { text: `${"}"}"`, className: "text-[#d2691e]" }
];

const openResume = [
  { text: "open ", className: "text-[#FE4450]" },
  { text: `"${"${"}`, className: "text-[#d2691e]" },
  { text: "filename", className: "text-[#ff57c8]" },
  { text: `${"}"}"`, className: "text-[#d2691e]" }
];

const clearTerminal = [
  { text: "clear", className: "text-[#FE4450]" }
];

const yourcomputer = "yourcomputer ~/ $ ";

interface TerminalProps {
  countOfExecution: number;
}

const Terminal: React.FC<TerminalProps> = ({ countOfExecution }) => {
  const { status: requestCVStatus } = useRequestCV();
  const { themeMode } = useTheme();

  // todoCT: Make work? Stops animating on line 3
  // Example usage <>{generateStaticLine([ "changeDir", "filename" ])}</>
  // const generateStaticLine = React.useCallback((
  //   lines: Array<"changeDir" | "filename" | "fileId" | "url">
  // ) => {
  //   return lines.map(line => {
  //     const relevantWords: Words = 
  //       line === "changeDir" ? changeDir :
  //       line === "filename" ? filename :
  //       line === "fileId" ? fileId : 
  //       line === "url" ? url : [];

  //     return (
  //       <TerminalLine
  //         yourcomputer={yourcomputer}
  //         typedWords={relevantWords}
  //         skipAnimation
  //       />
  //     )
  //   })
  // }, [
  //   yourcomputer,
  //   changeDir,
  //   filename,
  //   fileId,
  //   url
  // ])

  const renderTerminal = React.useMemo(() => {
    switch (countOfExecution) {
      // Directory change
      case 0: {
        return (
          <TerminalLine
            yourcomputer={yourcomputer}
            typedWords={changeDir}
          />
        )
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

            <TerminalLine
              yourcomputer={yourcomputer}
              typedWords={filename}
            />
          </>
        )
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
        )
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
                stagger: 0.050
              }}
            />
          </>
        )
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
                stagger: 0.075
              }}
            />
          </>
        )
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
            <TerminalLine 
              yourcomputer={yourcomputer}
              typedWords={openResume}
            />
          </>
        )
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
        )
      }
    }
  }, [
    yourcomputer, 
    filename,
    fileId,
    curlCommand,
    countOfExecution
  ]);

  return (
    <div className="h-full w-full flex items-center justify-center p-2">
      <div className={`
          ${themeMode === ThemeMode.DARK ? "bg-gray-950 " : "bg-gray-900"} 
          text-light rounded-lg shadow-lg h-[250px] w-3/4 max-w-7xl 
        `}>
        <div className={`
            ${themeMode === ThemeMode.DARK ? "bg-gray-800" : "bg-gray-700"} 
            p-2 rounded-t-lg flex items-center justify-between
          `}>
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <p className="text-center flex-1">Terminal</p>
        </div>

        <div className="pb-[50px] pl-[15px] h-full w-full flex flex-col justify-end">
          {renderTerminal}
        </div>

      </div>
    </div>
  )
}

export default Terminal;