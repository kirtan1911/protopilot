import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Mail, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent! Check your inbox.");
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <Mail className="w-6 h-6 text-indigo-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Forgot password?</h1>
        <p className="text-sm text-gray-400 mb-8">
          Enter your registered email and we'll send you a 6-digit OTP.
        </p>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="forgot-email" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Email address
            </label>
            <input
              id="forgot-email"
              data-testid="forgot-email-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <button
            data-testid="send-otp-btn"
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
