import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, KeyRound } from "lucide-react";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const resetToken = state?.reset_token || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        reset_token: resetToken,
        new_password: newPassword,
      });
      toast.success("Password updated! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-8">
          <p className="text-gray-400 mb-4">Invalid or expired reset session.</p>
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
            Start over
          </Link>
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
          <KeyRound className="w-6 h-6 text-indigo-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
        <p className="text-sm text-gray-400 mb-8">
          Choose a strong password for your account.
        </p>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="new-password" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              New password
            </label>
            <input
              id="new-password"
              data-testid="new-password-input"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Confirm password
            </label>
            <input
              id="confirm-password"
              data-testid="confirm-password-input"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-[#0d1117] border rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-500/50"
                  : "border-white/10 focus:border-indigo-500"
              }`}
              placeholder="Repeat your password"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            data-testid="reset-password-btn"
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
