const Button = ({
  buttonText,
  onClick,
  disabled,
}: {
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      className="flex justify-center items-center bg-primary rounded-xl w-[329px] h-[62px] font-bold text-white text-xl tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
    >
      {buttonText}
    </button>
  );
};

export default Button;
