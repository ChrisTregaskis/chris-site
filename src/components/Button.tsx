interface ButtonProps {
  text: string;
  htmlType?: "submit" | "reset" | "button";
  handleClick?: () => void;
  type?: "primary" | "secondary";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  htmlType,
  handleClick,
  type = "primary",
  loading = false
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
        flex justify-center items-center
      `}
      onClick={handleClick}
      disabled={loading}
    >
{loading ? (
  <div className="
    w-6 
    h-6 
    border-4 
    border-t-4 
    border-transparent 
    rounded-full 
    animate-spin-fast
    border-t-white
  "/>
) : (
  text
)}
    </button>
  )
}

export default Button;