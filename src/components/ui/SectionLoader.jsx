import FaviconSpinner from "./FaviconSpinner";

const SectionLoader = ({
  count = 8,
  columnsClass = "grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6",
  cardClass = "aspect-[3/4]",
  spinnerSize = 36,
}) => {
  return (
    <div className={columnsClass}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${cardClass} rounded-xl border border-orange-100 bg-white/95 shadow-sm flex items-center justify-center`}
        >
          <FaviconSpinner size={spinnerSize} showGlow />
        </div>
      ))}
    </div>
  );
};

export default SectionLoader;