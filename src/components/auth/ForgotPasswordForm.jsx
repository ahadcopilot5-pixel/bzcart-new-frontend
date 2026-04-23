import { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMail } from "react-icons/hi";
import { authAPI } from "../../services/api";
import { showToast } from "../../utils/helpers";
import AuthCard from "./AuthCard";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setEmailSent(true);
      showToast.success("Reset link sent to your email!");
    } catch (error) {
      showToast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthCard title="Check Your Email">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <HiOutlineMail size={32} className="text-green-500" />
          </div>
          <p className="text-sm text-gray-500">
            We've sent a password reset link to <strong>{email}</strong>. Please
            check your inbox and follow the instructions.
          </p>
          <p className="text-xs text-gray-400">
            The link will expire in 1 hour.
          </p>
          <Link
            to="/auth/login"
            className="inline-block text-orange-500 hover:text-orange-600 font-medium text-sm"
          >
            Back to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot Password">
      <p className="text-center text-sm text-gray-500 mb-6">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="pt-2">
          <Button type="submit" loading={loading}>
            Send Reset Link
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

export default ForgotPasswordForm;
