import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, FolderOpen, Clock, Trash2, Sparkles, X } from "lucide-react";
import Layout from "@/components/Layout";
import api from "@/lib/api";

const statusLabel = {
  draft: "Draft",
  transcribed: "Transcribed",
  extracted: "Requirements ready",
};

const statusColor = {
  draft: "bg-gray-500/10 text-gray-300 border-gray-500/20",
  transcribed: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  extracted: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

/* Simple modal dialog to replace missing @/components/ui/dialog */
function Dialog({ open, onClose, title, children }) {
  const overlayRef = useRef(null);
  if (!open) return null;
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/projects");
      setProjects(r.data);
    } catch (e) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load();
  
   }, []);

  const createProject = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const r = await api.post("/projects", { name: name.trim(), description: description.trim() });
      toast.success("Project created");
      setOpen(false);
      setName(""); setDescription("");
      navigate(`/project/${r.data.id}`);
    } catch (e) {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-indigo-400 mb-2">Projects</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Your prototypes</h1>
            <p className="text-gray-400 mt-2">Upload a meeting and let AI draft the rest.</p>
          </div>
          <button
            data-testid="new-project-btn"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium glow-indigo transition-all"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-44 rounded-xl shimmer" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center" data-testid="empty-state">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to start turning meetings into specs.</p>
            <button
              data-testid="empty-new-project-btn"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium glow-indigo"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <div
                key={p.id}
                data-testid={`project-card-${p.id}`}
                onClick={() => navigate(`/project/${p.id}`)}
                className="glass rounded-xl p-6 cursor-pointer hover:-translate-y-1 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full border ${statusColor[p.status] || statusColor.draft}`}>
                    {statusLabel[p.status] || p.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{p.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">{p.description || "No description"}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(p.updated_at).toLocaleDateString()}
                  </div>
                  <button
                    data-testid={`delete-project-${p.id}`}
                    onClick={(e) => deleteProject(p.id, e)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create a new project">
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Project name</label>
            <input
              data-testid="new-project-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="e.g., Acme Inventory App"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Description (optional)</label>
            <textarea
              data-testid="new-project-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Short context about the meeting/client"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="create-project-submit-btn"
              onClick={createProject}
              disabled={creating || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 text-sm"
            >
              {creating ? "Creating…" : "Create project"}
            </button>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
}