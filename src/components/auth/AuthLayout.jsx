import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const AuthLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine page type for dynamic content
  const getPageContent = () => {
    if (path.includes("verify-otp")) {
      return {
        title: "Verify Your Email",
        description:
          "Enter the OTP sent to your email to complete your registration and start shopping.",
      };
    }
    if (path.includes("forgot-password")) {
      return {
        title: "Forgot Password?",
        description:
          "Don't worry! Enter your email and we'll send you a link to reset your password.",
      };
    }
    if (path.includes("reset-password")) {
      return {
        title: "Reset Password",
        description:
          "Create a new secure password for your account to continue shopping with us.",
      };
    }
    if (path.includes("signup")) {
      return {
        title: "Join Us Today!",
        description:
          "Create an account to explore products, track your orders, and enjoy a smooth shopping experience.",
      };
    }
    // Default to login
    return {
      title: "Welcome Back !",
      description:
        "Log in to your account to explore products, track your orders, and enjoy a smooth shopping experience.",
    };
  };

  const pageContent = getPageContent();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative bg-[#f5f5f5]">
      {/* Left Panel - Branding with diagonal cut */}
      <div
        className="hidden md:flex absolute top-0 left-0 h-full bg-[#0d0d0d] text-white flex-col justify-start items-start pt-16 pl-8 lg:pl-12 xl:pl-16 overflow-hidden"
        style={{
          width: "60%",
          clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
        }}
      >
        <img
          src="/logo.png"
          alt="EZBZCART"
          className="h-10 lg:h-14 mb-12 lg:mb-16"
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">
              {pageContent.title}
            </h1>
            <p className="text-gray-400 text-xs lg:text-sm leading-relaxed max-w-[220px] lg:max-w-[280px]">
              {pageContent.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Panel - Form */}
      <div className="min-h-screen w-full md:w-1/2 md:ml-auto flex items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
