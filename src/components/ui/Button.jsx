import FaviconSpinner from "./FaviconSpinner";

const Button = ({
  children,
  type = "button",
  loading = false,
  onClick,
  variant = "primary",
}) => {
  const baseStyles =
    "w-auto px-10 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto";

  const variants = {
    primary:
      "bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-300",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading ? (
        <>
          <FaviconSpinner size={16} />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
