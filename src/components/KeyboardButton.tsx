import { ThemeMode } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';

interface KeyboardButtonProps {
  keyType: "enter" | "lightbulb" | "pdf-cv";
  handleClick: () => void;
  isActive?: boolean;
  leftActive?: boolean;
  rightActive?: boolean;
}

const KeyboardButton: React.FC<KeyboardButtonProps> = ({ 
  keyType,
  handleClick,
  isActive,
  leftActive,
  rightActive
}) => {
  const { themeMode } = useTheme();

  const renderKeyContent = () => {
    switch (keyType) {
      case "enter": {
        return (
          <div className="w-[125px] h-[35px] flex justify-center items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 10 4 15 9 20" />
              <path d="M20 4v7a4 4 0 0 1-4 4H4" />
            </svg>
          </div>
        );
      }

      case "lightbulb": {
        return (
          <div className="w-[55px] h-[35px] flex justify-center items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        );
      }
      
      case "pdf-cv": {
        return (
          <div className="w-[125px] flex justify-center items-center space-x-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M12 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6h-4z" />
              <path d="M14 2v6h6" />
            </svg>
            <span>CV</span>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`
        key 
        key--medium
        ${themeMode === ThemeMode.DARK ? "key--darker" : "key--lighter"}
        bg-gray-700 
        border 
        border-gray-600
        rounded-md 
        flex 
        justify-center 
        items-center 
        p-1 
        cursor-pointer 
        transition 
        duration-400 
        ease-out 
        shadow-md 
        ${themeMode === ThemeMode.DARK ? "shadow-gray-900" : "shadow-gray-700"}
        ${isActive ? "brightness-125" : "hover:brightness-125"}
        ${isActive ? "translate-y-1" : "active:translate-y-1"}
        ${isActive ? "shadow-inner" : "active:shadow-inner"}
        ${isActive || (leftActive && rightActive) ? "brightness-125 translate-y-1 shadow-inner" : ""}
        ${!isActive && leftActive ? "hover:brightness-125 hover:translate-y-1 hover:shadow-inner" : ""}
        ${!isActive && rightActive ? "hover:brightness-125 hover:translate-y-1 hover:shadow-inner" : ""}
        ${leftActive && !rightActive ? "transform -skew-y-3 relative before:absolute before:top-0 before:left-0 before:w-3/4 before:h-full before:bg-gradient-to-r before:from-gray-700 before:to-transparent before:brightness-125 before:content-['']" : ""}
        ${rightActive && !leftActive ? "transform skew-y-3 relative after:absolute after:top-0 after:right-0 after:w-3/4 after:h-full after:bg-gradient-to-l after:from-gray-700 after:to-transparent after:brightness-125 after:content-['']" : ""}
      `}
    >
      {renderKeyContent()}
    </button>
  );
};

export default KeyboardButton;



/**
 
${isActive ? "brightness-125" : "hover:brightness-125"}
${isActive ? "translate-y-1" : "active:translate-y-1"}
${isActive ? "shadow-inner" : "active:shadow-inner"}









*/