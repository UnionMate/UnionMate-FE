const Button = ({
  buttonText,
  onClick,
}: {
  buttonText: string;
  onClick: () => void;
}) => {
  return (
    <button
      className="flex justify-center items-center bg-primary rounded-xl w-[329px] h-[62px] font-bold text-white text-xl tracking-wider cursor-pointer"
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
};

export default Button;
