import React from "react";
import TerminalLine from "./TerminalLine";
import { useTheme } from "@/hooks/useTheme";
import { ThemeMode } from "@/context/ThemeContext";

// const originalWords = [
//   { text: "Vite", className: "text-[#a95eff]" },
//   { text: " + " },
//   { text: "React", className: "text-[#d2691e]" },
//   { text: " + " },
//   { text: "Tailwindcss", className: "text-[#0ea5e9]" },
//   { text: " + " },
//   { text: "Framer Motion", className: "text-[#ff57c8]" },
// ];

/**
 * 
 * Original commands:
 * 
 * cd ~/Downloads/
 * filename="ChrisTregaskisResume.pdf"
 * fileId="1ugcAx_yF1za0aWs3Rw7DZm82Lj"
 * curl -L "https://drive.usercontent.google.com/download?id=${fileId}&export=download" --output "${filename}"
 * 
 * 
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
  { text: "1ugcAx_yF1za0aWs3Rw7DZm82Lj", className: "text-[#d2691e]" }
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

const clearTerminal = [
  { text: "clear", className: "text-[#FE4450]" }
];

const yourcomputer = "yourcomputer ~/ $ ";

interface TerminalProps {
  countOfExecution: number;
}

const Terminal: React.FC<TerminalProps> = ({
  countOfExecution
}) => {
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
                duration: 0.2,
                stagger: 0.075
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

      // Clear terminal
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
              typedWords={clearTerminal}
            />
          </>
        )
      }

      // Hold full commands
      // default: {
      //   return (
      //     <>
      //       <TerminalLine
      //         yourcomputer={yourcomputer}
      //         typedWords={changeDir}
      //         skipAnimation
      //       />
      //       <TerminalLine
      //         yourcomputer={yourcomputer}
      //         typedWords={filename}
      //         skipAnimation
      //       />
      //       <TerminalLine 
      //         yourcomputer={yourcomputer}
      //         typedWords={fileId}
      //         skipAnimation
      //       />
      //       <TerminalLine 
      //         yourcomputer={yourcomputer}
      //         typedWords={url}
      //         skipAnimation
      //       />
      //       <TerminalLine 
      //         yourcomputer={yourcomputer}
      //         typedWords={curlCommand}
      //         skipAnimation
      //       />
      //       <TerminalLine 
      //         yourcomputer={yourcomputer}
      //         typedWords={clearTerminal}
      //         skipAnimation
      //         holdCursor
      //       />
      //     </>
      //   )
      // }
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
            ${themeMode === ThemeMode.DARK ? "bg-gray-900 " : "bg-gray-700"} 
            text-white rounded-lg shadow-lg h-[250px] w-3/4 min-w-2xl
          `}>
          <div className={`
              ${themeMode === ThemeMode.DARK ? "bg-gray-800" : "bg-gray-600"} 
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