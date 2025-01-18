import { ThemeMode } from "@/context/ThemeContext";
import { useTheme } from "@/hooks/useTheme";
import React from "react";

const About: React.FC = () => {
  const { themeMode } = useTheme();

  return (
    <div className="h-full w-full flex items-center justify-center p-2">
      <div className={`
        ${themeMode === ThemeMode.DARK && "bg-gray-950"} 
        text-textColorPrimary rounded-lg shadow-lg h-full w-3/4 max-w-7xl flex flex-col md:flex-row
      `}>
        <div className="md:w-2/3 p-4">
          <h1 className="text-4xl font-serif mb-2">Chris Tregaskis</h1>
          <h2 className="text-2xl font-serif mb-4">Software Developer</h2>
          {/* // todo: If form completed, update the initial line to suggest clicking the pdf button for formal overview */}
          <p className="mb-4">
            For the formal overview, you can fill out the form requesting my resume by clicking the pdf button or see the ol'LinkedIn here... <a href="https://www.linkedin.com/in/christophertregaskis" className="text-blue-500">LinkedIn</a>
          </p>
          <p className="mb-4">
            One of my favourite things to do is converse on utilising current tools to build wild software solutions. Toy with the stack. Build a POC. See the magic happen.
          </p>
          <p className="mb-4">
            Whilst predominantly my time at work is spent deep in the JavaScript ecosystem along side cloud infrastructure, I love to dabble in building cool projects in my own time. I get to mess around with everything from discovering new tools like LangChain and AI integration, to a neat little Arduino project.
          </p>
          <p className="mb-4">
            Tech to one side, what I value most are the simple joys of life, be that; my beautiful wife and kids, particularly family game and movie nights, walks across the great British countryside, dusting off drumming cobwebs and the odd steam sale ha.
          </p>
        </div>
        <div className="md:w-1/3 p-4 flex justify-center items-center">
          <img src="../../public/Screenshot 2024-10-07 at 21.38.26.png" alt="Chris Tregaskis" className="rounded-lg shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default About;