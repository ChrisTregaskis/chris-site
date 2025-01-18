import React from "react";
import { motion } from "framer-motion";
import Typewriter, { TypewriterProps, Words } from "./Typewriter";
import { cn } from "@/utils";
import CopyCode from "./CopyCode";

interface TerminalLineProps {
  typedWords: Words;
  yourcomputer: string;
  skipAnimation?: boolean;
  holdCursor?: boolean;
  animationSpeed?: TypewriterProps["animationSpeed"];
}

const TerminalLine: React.FC<TerminalLineProps> = ({ 
  typedWords, 
  yourcomputer, 
  skipAnimation, 
  holdCursor,
  animationSpeed
}) => {
  const terminalCopyCode = React.useMemo(() => {
    return typedWords.map(tw => tw.text).join("");
  }, [ typedWords ])

  return (
    <div className="relative group">
      <div className="flex items-center gap-2">
        <p className="text-light text-1xl">
          {yourcomputer}
        </p>
        {skipAnimation ? 
          <>
            <p className="text-1xl">
              {typedWords.map((word, i) => (
                <span 
                  key={i}
                  className={cn("", word.className)}
                >
                  {word.text}
                </span>
              ))}
            </p>
            {holdCursor ? 
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="ml-1 h-6 inline-block w-2 rounded-sm bg-white"
              >&nbsp;</motion.span> :
              null
            }
          </> :
          <Typewriter 
            words={typedWords}
            animationSpeed={animationSpeed}
          />
        }

        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CopyCode text={[ terminalCopyCode ]} />
        </div>
      </div>
    </div>
  )
}

export default TerminalLine;