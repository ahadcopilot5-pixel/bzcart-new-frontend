const InputField = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  suffix,
}) => {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="w-full px-0 py-2 border-b border-gray-300 bg-transparent 
                   focus:border-gray-400 focus:outline-none transition-colors
                   text-sm text-gray-700 placeholder-gray-400
                   autofill:bg-transparent autofill:shadow-[0_0_0px_1000px_#f5f5f5_inset]"
        style={{ WebkitBoxShadow: "0 0 0px 1000px #f5f5f5 inset" }}
      />
      {suffix && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {suffix}
        </div>
      )}
    </div>
  );
};

export default InputField;
