interface ToolTipProps {
  tip: string;
}

const ToolTip: React.FC<ToolTipProps> = ({ tip }) => {
  return (
    <span
      className="
      absolute 
      w-[85px] 
      brightness-75 
      top-full 
      mt-3 
      group-hover:block 
      bg-gray-700 
      text-white 
      text-xs 
      rounded 
      py-2 
      px-2 
      transition-opacity 
      duration-300 
      opacity-0 
      group-hover:opacity-100
    "
    >
      {tip}
    </span>
  );
};

export default ToolTip;
