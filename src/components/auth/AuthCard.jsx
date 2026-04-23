import { motion } from "framer-motion";

const AuthCard = ({ title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      {/* Mobile Logo */}
      <div className="md:hidden flex justify-center mb-8">
        <img src="/logo.png" alt="EZBZCART" className="h-10" />
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-10">
        {title}
      </h2>

      {children}
    </motion.div>
  );
};

export default AuthCard;
