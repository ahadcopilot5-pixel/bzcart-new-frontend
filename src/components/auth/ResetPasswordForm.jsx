import { useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { authAPI } from "../../services/api";
import { showToast } from "../../utils/helpers";
import AuthCard from "./AuthCard";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      showToast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      showToast.error("Password must be at least 6 characters");
      return;
    }
    if (!token) {
      showToast.error("Invalid or missing reset token");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setResetSuccess(true);
      showToast.success("Password reset successful!");
    } catch (error) {
      showToast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = useCallback(
    () => setShowPassword((prev) => !prev),
    [],
  );
  const toggleConfirmPassword = useCallback(
    () => setShowConfirmPassword((prev) => !prev),
    [],
  );

  if (resetSuccess) {
    return (
      <AuthCard title="Password Reset Successful">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <HiOutlineCheckCircle size={32} className="text-green-500" />
          </div>
          <p className="text-sm text-gray-500">
            Your password has been successfully reset. You can now log in with
            your new password.
          </p>
          <Link
            to="/auth/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (!token) {
    return (
      <AuthCard title="Invalid Link">
        <div className="text-center space-y-6">
          <p className="text-sm text-gray-500">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-block text-orange-500 hover:text-orange-600 font-medium text-sm"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset Password">
      <p className="text-center text-sm text-gray-500 mb-6">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          suffix={
            <button
              type="button"
              onClick={togglePassword}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <HiOutlineEyeOff size={18} />
              ) : (
                <HiOutlineEye size={18} />
              )}
            </button>
          }
        />

        <InputField
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          suffix={
            <button
              type="button"
              onClick={toggleConfirmPassword}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <HiOutlineEyeOff size={18} />
              ) : (
                <HiOutlineEye size={18} />
              )}
            </button>
          }
        />

        <div className="pt-2">
          <Button type="submit" loading={loading}>
            Reset Password
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500 pt-4">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordForm;
