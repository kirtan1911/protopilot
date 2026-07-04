import { Link, useNavigate } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <nav className="border-b border-white/10 bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center glow-indigo">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">ProtoPilot</span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                data-testid="logout-btn"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
