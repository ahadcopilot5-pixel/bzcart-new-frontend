import FaviconSpinner from "./FaviconSpinner";

const GlobalLoader = ({
  fullScreen = true,
  size = 64,
  showText = true,
  text = "Loading...",
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-gradient-to-br from-white via-orange-50/30 to-white z-[9999]"
    : "w-full h-full";

  return (
    <div
      className={`${containerClasses} flex flex-col items-center justify-center`.trim()}
    >
      <FaviconSpinner size={size} showGlow={fullScreen} />

      {showText && (
        <p className="mt-4 text-sm text-gray-500 tracking-widest font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default GlobalLoader;