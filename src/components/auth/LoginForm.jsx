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

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google login handler moved inside component
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        showToast.error("Google login failed");
        return;
      }
      // Send credential to backend for verification and login
      // const decoded = jwtDecode(credential); // If needed
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
      showToast.success("Google login successful!");
      navigate("/");
    } catch (error) {
      showToast.error(error.message || "Google login failed");
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      showToast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const {
        _id,
        username,
        email: userEmail,
        role,
        profileImage,
        token,
      } = await authAPI.login(email, password);
      login({ _id, username, email: userEmail, role, profileImage }, token);
      showToast.success("Login successful!");
      navigate("/");
    } catch (error) {
      showToast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = useCallback(
    () => setShowPassword((prev) => !prev),
    [],
  );

  return (
    <AuthCard title="Login">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="pt-2">
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Social Login */}
        <div className="flex items-center justify-center">
          <div className="w-full flex items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast.error("Google login failed")}
              width="100%"
              shape="pill"
              text="signin_with"
              logo_alignment="center"
            />
          </div>
        </div>

        {/* Forgot Password */}
        <p className="text-center text-xs text-gray-500">
          <Link
            to="/auth/forgot-password"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Forgot Password?
          </Link>
        </p>

        {/* Switch to Signup */}
        <p className="text-center text-xs text-gray-500 pt-2">
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Signup
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default LoginForm;
