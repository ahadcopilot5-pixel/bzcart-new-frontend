const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white via-orange-50/30 to-white z-[9999] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-orange-400/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
        <img
          src="/logo.png"
          alt="EZBZCART"
          className="h-14 md:h-18 relative z-10"
        />
      </div>

      <div className="mt-10 relative">
        <div className="w-16 h-16 rounded-full border-[3px] border-gray-200"></div>
        <div className="w-16 h-16 rounded-full border-[3px] border-transparent border-t-orange-500 border-r-orange-400 absolute top-0 left-0 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
      </div>

      <div className="mt-6 flex items-center gap-1.5">
        <span
          className="h-2 w-2 bg-orange-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></span>
        <span
          className="h-2 w-2 bg-orange-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></span>
        <span
          className="h-2 w-2 bg-orange-300 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></span>
      </div>

      <p className="mt-4 text-sm text-gray-500 tracking-widest font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default GlobalLoader;