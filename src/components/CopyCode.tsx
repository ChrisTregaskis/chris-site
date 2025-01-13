import useToast from "@/hooks/useToast";

interface CopyCodeProps {
  text: string[];
}

const CopyCode: React.FC<CopyCodeProps> = ({ text }) => {
  const { showToast } = useToast();
  if (!text.length) {
    return null;
  }

  return (
    <button 
      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
      onClick={() => {
        if (text.length === 1) {
          navigator.clipboard.writeText(text[ 0 ]);
          showToast("Copied to clipboard!", { scheme: "SUCCESS" })
        }
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="0.3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-7 h-7 text-gray-400 hover:text-white transition-colors duration-300"
      >
        <path d="M5.503 4.627L5.5 6.75v10.504c0 1.795 1.455 3.25 3.25 3.25h8.616c-.309.874-1.142 1.5-2.122 1.5H8.75c-2.623 0-4.75-2.127-4.75-4.75V6.75c0-.98.627-1.814 1.503-2.123zM17.75 2c1.243 0 2.25 1.007 2.25 2.25v13c0 1.243-1.007 2.25-2.25 2.25H8.75c-1.243 0-2.25-1.007-2.25-2.25V4.25C6.5 3.007 7.507 2 8.75 2h9zM17.75 3.5H8.75c-.414 0-.75.336-.75.75v13c0 .414.336.75.75.75h9c.414 0 .75-.336.75-.75v-13c0-.414-.336-.75-.75-.75z" />
      </svg>
      <span>{text.length === 1 ? "" : "Copy block of code"}</span>
    </button>
  )
}

export default CopyCode;