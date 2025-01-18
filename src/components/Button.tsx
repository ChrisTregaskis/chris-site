interface ButtonProps {
  text: string;
  htmlType?: "submit" | "reset" | "button";
  handleClick?: () => void;
  type?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
  text,
  htmlType,
  handleClick,
  type = "primary"
 }) => {
  return (
    <button 
      type={htmlType}
      className={`
        px-6 
        py-2 
        ${type === "primary" ? "bg-buttonPrimary" : "bg-buttonSecondary"} 
        text-white 
        rounded-md 
        w-full 
        mx-4
        hover:brightness-125 hover:shadow-inner
      `}
      onClick={handleClick}
    >
      {text}
    </button>
  )
}

export default Button;