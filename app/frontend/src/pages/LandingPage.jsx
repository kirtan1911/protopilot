import { Link } from "react-router-dom";
import { Sparkles, Mic, FileText, Layout as LayoutIcon, Database, Code2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] grid-bg text-gray-200">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center glow-indigo">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-xl">ProtoPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" data-testid="nav-login" className="text-sm text-gray-300 hover:text-white px-4 py-2">
            Sign in
          </Link>
          <Link
            to="/signup"
            data-testid="nav-signup"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg glow-indigo transition-all"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs uppercase tracking-widest mb-6">
          <Sparkles className="w-3 h-3" />
          Powered by Gemini + Whisper
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Turn meeting audio into
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            specs, schemas &amp; prototypes
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a requirement-gathering meeting. ProtoPilot transcribes it, extracts structured
          requirements, and generates an SRS, DB schema, REST API spec, and a clickable wireframe — in minutes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/signup"
            data-testid="hero-get-started-btn"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium glow-indigo transition-all"
          >
            Start free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            data-testid="hero-login-btn"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all"
          >
            I have an account
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Mic, title: "Audio → Transcript", desc: "Whisper transcribes mp3/wav meetings with high accuracy." },
            { icon: FileText, title: "Structured SRS", desc: "Functional, non-functional, roles, constraints — all parsed." },
            { icon: LayoutIcon, title: "Live Wireframe", desc: "Low-fidelity HTML prototype matching extracted features." },
            { icon: Database, title: "DB Schema", desc: "Relational tables, columns, relationships — ready to use." },
            { icon: Code2, title: "REST API Spec", desc: "Endpoint list with methods, paths, descriptions." },
            { icon: Sparkles, title: "Edit & Export", desc: "Refine the output. Export SRS as DOCX, wireframe as HTML." },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass rounded-xl p-6 hover:-translate-y-1 hover:border-white/20 transition-all duration-300">
                <Icon className="w-6 h-6 text-indigo-400 mb-4" />
                <div className="text-white font-semibold mb-2">{f.title}</div>
                <div className="text-sm text-gray-400 leading-relaxed">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-500">
        Built with FastAPI · React · MongoDB · Gemini AI · Whisper
        <span className="mx-3 text-gray-700">·</span>
        © {new Date().getFullYear()} ProtoPilot
      </footer>
    </div>
  );
}