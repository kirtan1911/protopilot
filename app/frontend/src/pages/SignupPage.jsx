import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email, password);
      toast.success("Account created! Welcome to ProtoPilot.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed. Please try again.");
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

        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-sm text-gray-400 mb-8">Start turning meetings into shipping artifacts.</p>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signup-name" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Full name
            </label>
            <input
              id="signup-name"
              data-testid="signup-name-input"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              id="signup-email"
              data-testid="signup-email-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="signup-password"
              data-testid="signup-password-input"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            data-testid="signup-submit-btn"
            type="submit"
            disabled={loading || !name.trim() || !email || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium glow-indigo transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            data-testid="goto-login-link"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}