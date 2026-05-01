import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { showToast } from "../../utils/helpers";
import AuthCard from "./AuthCard";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { GoogleLogin } from "@react-oauth/google";

const SignupForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        showToast.error("Google signup failed");
        return;
      }

      const result = await authAPI.googleLogin(credential);
      login(
        {
          _id: result._id,
          username: result.username,
          email: result.email,
          role: result.role,
          profileImage: result.profileImage,
        },
        result.token,
      );
      showToast.success("Google signup successful!");
      navigate("/");
    } catch (error) {
      showToast.error(error.message || "Google signup failed");
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
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

    setLoading(true);
    try {
      const {
        _id,
        username: uname,
        email: uemail,
        token,
      } = await authAPI.register(username, email, password);
      login({ _id, username: uname, email: uemail }, token);
      showToast.success("OTP sent to your email!");
      navigate("/auth/verify-otp");
    } catch (error) {
      showToast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Signup">
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <InputField
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            Signup
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Login */}
        <div className="flex items-center justify-center">
          <div className="w-full flex items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast.error("Google signup failed")}
              width="100%"
              shape="pill"
              text="signup_with"
              logo_alignment="center"
            />
          </div>
        </div>

        {/* Switch to Login */}
        <p className="text-center text-xs text-gray-500 pt-4">
          Already have an account?{" "}
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

export default SignupForm;
