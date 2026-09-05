import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

const OTP_LENGTH = 6;
const EXPIRY_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN = 60; // 60 seconds

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef([]);

  // Expiry countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const updated = [...otp];
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const verify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Enter all 6 digits");
      return;
    }
    if (countdown <= 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }
    setVerifying(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: code });
      toast.success("OTP verified!");
      navigate("/reset-password", { state: { reset_token: res.data.reset_token } });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid or expired OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const resend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("New OTP sent!");
      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not resend OTP");
    } finally {
      setResending(false);
    }
  }, [email, resendCooldown]);

  if (!email) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No email provided.</p>
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300">Go back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] grid-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full glass rounded-2xl p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center glow-indigo">
            <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-white text-xl">ProtoPilot</span>
        </div>

        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Enter OTP</h1>
        <p className="text-sm text-gray-400 mb-2">
          We sent a 6-digit code to <span className="text-indigo-300 font-medium">{email}</span>
        </p>

        {/* Countdown */}
        <div className={`text-sm font-mono mb-6 ${countdown <= 60 ? "text-red-400" : "text-gray-400"}`}>
          {countdown > 0 ? `Expires in ${formatTime(countdown)}` : "OTP expired"}
        </div>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              data-testid={`otp-input-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-lg border bg-[#0d1117] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                digit ? "border-indigo-500 text-indigo-300" : "border-white/10"
              }`}
            />
          ))}
        </div>

        <button
          data-testid="verify-otp-btn"
          onClick={verify}
          disabled={verifying || otp.join("").length < OTP_LENGTH || countdown <= 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {verifying ? "Verifying…" : "Verify OTP"}
        </button>

        {/* Resend */}
        <div className="text-center text-sm text-gray-400">
          Didn't receive it?{" "}
          <button
            data-testid="resend-otp-btn"
            onClick={resend}
            disabled={resendCooldown > 0 || resending}
            className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {resending ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Change email address
          </Link>
        </div>
      </div>
    </div>
  );
}
