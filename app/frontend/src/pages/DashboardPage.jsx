import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, FolderOpen, Clock, Trash2, Sparkles, X, Activity, BarChart3, Database, FileText, Code2, ArrowRight, Layout as LayoutIcon } from "lucide-react";
import Layout from "@/components/Layout";
import api from "@/lib/api";

const statusLabel = {
  draft: "Draft",
  transcribed: "Transcribed",
  extracted: "Requirements Ready",
};

const statusColor = {
  draft: "bg-gray-500/10 text-gray-300 border-gray-500/20",
  transcribed: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  extracted: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

function Dialog({ open, onClose, title, children }) {
  const overlayRef = useRef(null);
  if (!open) return null;
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(79,70,229,0.1)]">
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

  useEffect(() => { load(); }, []);

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
    if (!window.confirm("Delete this project? This action is irreversible.")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const getMetrics = () => {
    const total = projects.length;
    const extracted = projects.filter(p => p.status === 'extracted').length;
    const schemas = projects.filter(p => p.schema_spec).length;
    return { total, extracted, schemas };
  };

  const metrics = getMetrics();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-12">
        {/* Header & Metrics */}
        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Workspace Overview</div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Command Center</h1>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" /> New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:border-gray-700 transition cursor-default">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{metrics.total}</div>
                <div className="text-sm text-gray-500">Total Projects</div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:border-gray-700 transition cursor-default">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{metrics.extracted}</div>
                <div className="text-sm text-gray-500">Analyzed Reqs</div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:border-gray-700 transition cursor-default">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{metrics.schemas}</div>
                <div className="text-sm text-gray-500">Schemas Built</div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:border-gray-700 transition cursor-default">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-gray-500">System Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Recent Projects
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-16 text-center shadow-xl">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Your workspace is empty</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Start a new project, record a meeting, and watch as our AI builds your requirements, schema, APIs, and wireframes automatically.</p>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" /> Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/project/${p.id}`)}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:shadow-[0_10px_40px_rgba(79,70,229,0.1)] transition-all duration-300 group flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:bg-indigo-500/10 transition-colors"></div>
                  
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-sm">
                      <FolderOpen className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${statusColor[p.status] || statusColor.draft}`}>
                      {statusLabel[p.status] || p.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-indigo-100 transition-colors">{p.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] flex-1">{p.description || "No description provided."}</p>
                  
                  <div className="mt-6 flex items-center gap-3">
                    {p.schema_spec && <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20" title="Schema Generated"><Database className="w-4 h-4 text-purple-400" /></div>}
                    {p.api_spec && <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20" title="API Generated"><Code2 className="w-4 h-4 text-blue-400" /></div>}
                    {p.wireframe_manifest && <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20" title="Wireframes Generated"><LayoutIcon className="w-4 h-4 text-pink-400" /></div>}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(p.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => deleteProject(p.id, e)}
                        className="text-gray-600 hover:text-red-500 bg-gray-900 hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors group-hover:translate-x-1 transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Create New Project">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Project Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
              placeholder="e.g., Acme Inventory App"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description <span className="text-gray-600">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow resize-none custom-scrollbar"
              placeholder="Short context about the meeting or client..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createProject}
              disabled={creating || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
}