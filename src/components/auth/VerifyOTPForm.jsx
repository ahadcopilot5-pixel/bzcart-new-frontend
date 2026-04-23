import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { showToast } from "../../utils/helpers";
import AuthCard from "./AuthCard";
import Button from "../ui/Button";

const OTP_LENGTH = 6;

const VerifyOTPForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback((index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value.slice(-1);
      return newOtp;
    });

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = Array(OTP_LENGTH).fill("");
    pastedData.split("").forEach((char, i) => {
      if (i < OTP_LENGTH) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, OTP_LENGTH - 1)]?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== OTP_LENGTH) {
      showToast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const { _id, username, email, role, token } =
        await authAPI.verifyOTP(otpString);
      login({ _id, username, email, role }, token);
      showToast.success("Email verified successfully!");
      navigate("/");
    } catch (error) {
      showToast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => showToast.success("OTP resent! Check your email.");

  return (
    <AuthCard title="Verify OTP">
      <p className="text-center text-sm text-gray-500 mb-6">
        We've sent a 6-digit verification code to your email. Please enter it
        below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md 
                         focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none
                         transition-colors bg-white"
            />
          ))}
        </div>

        <div className="pt-2">
          <Button type="submit" loading={loading}>
            Verify OTP
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500 pt-4">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Resend OTP
          </button>
        </p>
      </form>
    </AuthCard>
  );
};

export default VerifyOTPForm;
