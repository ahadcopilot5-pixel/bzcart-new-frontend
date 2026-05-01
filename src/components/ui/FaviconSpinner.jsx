const FaviconSpinner = ({ size = 40, className = "", showGlow = false }) => {
  const resolvedSize = Number(size) || 40;
  const iconSize = Math.max(14, Math.round(resolvedSize * 0.45));

  return (
    <div
      className={`relative flex items-center justify-center ${className}`.trim()}
      style={{ width: `${resolvedSize}px`, height: `${resolvedSize}px` }}
      aria-hidden="true"
    >
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-orange-300/30 blur-md" />
      )}

      <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-orange-500 border-r-orange-400 animate-spin" />

      <img
        src="/logo_Favicon_-01.png"
        alt="Loading"
        className="relative z-10 object-contain"
        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
      />
    </div>
  );
};

export default FaviconSpinner;