import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";

import { cn } from "@/utils";

export interface TypewriterProps {
  words: Words;
  animationSpeed?: {
    duration: number;
    stagger: number;
  };
}

export type Words = {
  text: string;
  className?: string;
}[];

const Typewriter: React.FC<TypewriterProps> = ({ words, animationSpeed }) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    void animate(
      "span",
      { display: "inline-block", opacity: 1 },
      {
        duration: animationSpeed?.duration ?? 0.3,
        delay: stagger(animationSpeed?.stagger ?? 0.1),
        ease: "easeInOut",
      },
    );
  }, []);

  const wordsArray = words.map((word) => {
    return { ...word, text: word.text.split("") };
  });

  return (
    <div className="text-center text-1xl">
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, i) => {
          return (
            <span key={`${i}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  key={`char-${index}`}
                  className={cn("text-whiteopacity-0 hidden", word.className)}
                >
                  {char === " " ? <>&nbsp;</> : char}
                </motion.span>
              ))}
            </span>
          );
        })}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="ml-1 h-6 inline-block w-2 rounded-sm bg-white"
      >
        &nbsp;
      </motion.span>
    </div>
  );
};

export default Typewriter;
