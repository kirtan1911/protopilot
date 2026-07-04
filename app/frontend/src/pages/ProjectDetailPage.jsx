import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, FileAudio, Sparkles, Save, Download,
  FileText, Layout as LayoutIcon, Database, Code2, Mic, Loader2,
} from "lucide-react";
import Layout from "@/components/Layout";
import api, { API } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";


export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("transcript");

  const load = async () => {
    try {
      const r = await api.get(`/projects/${id}`);
      setProject(r.data);
    } catch {
      toast.error("Project not found");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !project) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-10 space-y-4">
          <div className="h-10 w-1/3 shimmer rounded-lg" />
          <div className="h-64 shimmer rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <button
          data-testid="back-to-dashboard-btn"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-indigo-400 mb-2">Project</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white" data-testid="project-name-heading">{project.name}</h1>
            {project.description && (
              <p className="text-gray-400 mt-2 max-w-2xl">{project.description}</p>
            )}
          </div>
        </div>

        <div className="w-full">
          <div className="bg-[#161b22] p-1 rounded-lg inline-flex mb-6 border border-white/5 flex-wrap gap-1">
            {[
              { value: "transcript", label: "Transcript", Icon: Mic, testId: "tab-transcript" },
              { value: "requirements", label: "Requirements", Icon: FileText, testId: "tab-requirements" },
              { value: "wireframe", label: "Wireframe", Icon: LayoutIcon, testId: "tab-wireframe" },
              { value: "schema", label: "Schema", Icon: Database, testId: "tab-schema" },
              { value: "api", label: "API Spec", Icon: Code2, testId: "tab-api" },
            ].map(({ value, label, Icon, testId }) => (
              <button
                key={value}
                data-testid={testId}
                data-state={tab === value ? "active" : "inactive"}
                onClick={() => setTab(value)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tab === value
                    ? "bg-[#0d1117] text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <div>
            {tab === "transcript" && <TranscriptTab project={project} setProject={setProject} />}
            {tab === "requirements" && <RequirementsTab project={project} setProject={setProject} getToken={getToken} />}
            {tab === "wireframe" && <WireframeTab project={project} setProject={setProject} getToken={getToken} />}
            {tab === "schema" && <SchemaTab project={project} setProject={setProject} />}
            {tab === "api" && <ApiTab project={project} setProject={setProject} />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ---------------- Transcript Tab ---------------- */
function TranscriptTab({ project, setProject }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState(project.transcript || "");
  const [saving, setSaving] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await api.post(`/projects/${project.id}/transcribe`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });
      setTranscript(r.data.transcript);
      setProject({ ...project, transcript: r.data.transcript, status: "transcribed" });
      toast.success("Audio transcribed");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Transcription failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post(`/projects/${project.id}/transcript`, { transcript });
      setProject({ ...project, transcript });
      toast.success("Transcript saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {!project.transcript && !transcript && (
        <div
          onClick={() => fileRef.current?.click()}
          data-testid="audio-upload-dropzone"
          className="border-2 border-dashed border-white/20 rounded-xl p-12 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <div className="text-white font-medium">Transcribing with Whisper…</div>
              <div className="text-sm text-gray-400 mt-1">This may take up to a minute.</div>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-indigo-400 mb-4" />
              <div className="text-white font-medium mb-1">Upload meeting audio</div>
              <div className="text-sm text-gray-400 mb-4">.mp3 / .wav / .m4a · max 25MB</div>
              <button data-testid="choose-audio-btn" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium glow-indigo">
                Choose file
              </button>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.wav,.m4a,.mp4,.webm,.mpeg,.mpga,audio/*"
            className="hidden"
            data-testid="audio-file-input"
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </div>
      )}

      {(project.transcript || transcript) && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FileAudio className="w-4 h-4 text-indigo-400" />
              <span className="font-medium">Meeting transcript</span>
              <span className="text-xs text-gray-500">· editable</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                data-testid="reupload-audio-btn"
                onClick={() => fileRef.current?.click()}
                className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-gray-300"
              >
                Re-upload
              </button>
              <button
                data-testid="save-transcript-btn"
                onClick={save}
                disabled={saving}
                className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
          <textarea
            data-testid="transcript-textarea"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={20}
            className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-4 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
          />
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.wav,.m4a,audio/*"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          {uploading && <div className="text-sm text-indigo-300 mt-3 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Re-transcribing…</div>}
        </div>
      )}
    </div>
  );
}

/* ---------------- Requirements Tab ---------------- */
function RequirementsTab({ project, setProject, getToken }) {
  const [generating, setGenerating] = useState(false);
  const reqs = project.requirements;

  const extract = async () => {
    if (!project.transcript?.trim()) {
      toast.error("Add a transcript first");
      return;
    }
    setGenerating(true);
    try {
      const r = await api.post(`/projects/${project.id}/extract`);
      setProject({ ...project, requirements: r.data, status: "extracted" });
      toast.success("Requirements extracted");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Extraction failed");
    } finally {
      setGenerating(false);
    }
  };

  const exportSrs = () => {
    const token = getToken();
    const url = `${API}/projects/${project.id}/srs.docx?token=${encodeURIComponent(token)}`;
    window.open(url, "_blank");
  };

  if (!reqs) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Extract requirements with AI</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Once you have a transcript, ProtoPilot will use Gemini to extract structured functional and non-functional requirements.
        </p>
        <button
          data-testid="extract-requirements-btn"
          onClick={extract}
          disabled={generating || !project.transcript?.trim()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium glow-indigo disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Extracting…" : "Extract requirements"}
        </button>
        {!project.transcript?.trim() && (
          <p className="text-xs text-amber-400 mt-4">Upload audio or paste a transcript first.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">{reqs.project_title || project.name}</h2>
          {reqs.summary && <p className="text-gray-400 mt-1 max-w-2xl">{reqs.summary}</p>}
        </div>
        <div className="flex gap-2">
          <button
            data-testid="re-extract-btn"
            onClick={extract}
            disabled={generating}
            className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-gray-300 disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Re-extract
          </button>
          <button
            data-testid="export-srs-btn"
            onClick={exportSrs}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-medium glow-indigo flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export SRS (.docx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard title="User Roles" items={reqs.user_roles} />
        <InfoCard title="Core Features" items={reqs.core_features} />
        <InfoCard title="Constraints" items={reqs.constraints} />
      </div>

      <ReqGroup title="Functional Requirements" items={reqs.functional_requirements} testidPrefix="fr" />
      <ReqGroup title="Non-Functional Requirements" items={reqs.non_functional_requirements} testidPrefix="nfr" />

      {reqs.assumptions?.length > 0 && (
        <InfoCard title="Assumptions" items={reqs.assumptions} />
      )}
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="text-xs uppercase tracking-widest text-indigo-400 mb-3">{title}</div>
      <ul className="space-y-2">
        {(items || []).map((it, i) => (
          <li key={i} className="text-sm text-gray-200 flex gap-2">
            <span className="text-indigo-400">▸</span> {it}
          </li>
        ))}
        {(!items || items.length === 0) && <li className="text-sm text-gray-500">—</li>}
      </ul>
    </div>
  );
}

function ReqGroup({ title, items, testidPrefix }) {
  if (!items?.length) return null;
  const priColor = (p) => ({
    High: "bg-red-500/10 text-red-300 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  }[p] || "bg-gray-500/10 text-gray-300 border-gray-500/20");
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-indigo-400 mb-3">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((r, i) => (
          <div key={r.id || i} data-testid={`${testidPrefix}-${i}`} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="font-mono text-xs text-indigo-300">{r.id || `${testidPrefix.toUpperCase()}${i+1}`}</div>
              <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${priColor(r.priority)}`}>
                {r.priority || "Medium"}
              </span>
            </div>
            <div className="text-white font-semibold mb-1">{r.title}</div>
            <div className="text-sm text-gray-400 leading-relaxed">{r.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Wireframe Tab ---------------- */
function WireframeTab({ project, setProject, getToken }) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!project.requirements) { toast.error("Extract requirements first"); return; }
    setGenerating(true);
    try {
      const r = await api.post(`/projects/${project.id}/wireframe`);
      setProject({ ...project, wireframe_html: r.data.wireframe_html });
      toast.success("Wireframe generated");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const exportHtml = () => {
    const token = getToken();
    const url = `${API}/projects/${project.id}/wireframe.html?token=${encodeURIComponent(token)}`;
    window.open(url, "_blank");
  };

  const srcDoc = project.wireframe_html
    ? `<!doctype html><html><head><meta charset="utf-8"><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;background:#111827;color:#e5e7eb;font-family:system-ui,sans-serif}</style></head><body>${project.wireframe_html}</body></html>`
    : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Low-fidelity wireframe</h2>
          <p className="text-sm text-gray-400">Auto-generated HTML matching extracted core features.</p>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="generate-wireframe-btn"
            onClick={generate}
            disabled={generating || !project.requirements}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 glow-indigo disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {project.wireframe_html ? "Regenerate" : "Generate"}
          </button>
          {project.wireframe_html && (
            <button
              data-testid="export-wireframe-btn"
              onClick={exportHtml}
              className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-gray-300 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export HTML
            </button>
          )}
        </div>
      </div>

      {!project.wireframe_html ? (
        <div className="glass rounded-xl p-12 text-center">
          <LayoutIcon className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-400">
            {project.requirements
              ? "Click Generate to create a low-fidelity HTML wireframe."
              : "Extract requirements first."}
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden border border-white/10">
          <iframe
            data-testid="wireframe-iframe"
            title="wireframe"
            srcDoc={srcDoc}
            className="w-full bg-gray-900"
            style={{ minHeight: 700 }}
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  );
}

/* ---------------- Schema Tab ---------------- */
function SchemaTab({ project, setProject }) {
  const [generating, setGenerating] = useState(false);
  const generate = async () => {
    if (!project.requirements) { toast.error("Extract requirements first"); return; }
    setGenerating(true);
    try {
      const r = await api.post(`/projects/${project.id}/schema`);
      setProject({ ...project, schema_spec: r.data });
      toast.success("Schema generated");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Generation failed");
    } finally { setGenerating(false); }
  };

  const tables = project.schema_spec?.tables || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Database schema</h2>
          <p className="text-sm text-gray-400">Suggested relational tables for the extracted requirements.</p>
        </div>
        <button
          data-testid="generate-schema-btn"
          onClick={generate}
          disabled={generating || !project.requirements}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 glow-indigo disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {tables.length ? "Regenerate" : "Generate"}
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Database className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-400">No schema yet. Click Generate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map((t, i) => (
            <div key={i} data-testid={`table-${i}`} className="glass rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="font-mono text-sm text-indigo-300">{t.table_name}</div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500">Table</span>
              </div>
              {t.description && <div className="px-5 py-2 text-xs text-gray-400">{t.description}</div>}
              <table className="w-full text-sm">
                <tbody>
                  {(t.columns || []).map((c, j) => (
                    <tr key={j} className="border-t border-white/5">
                      <td className="px-5 py-2 font-mono text-gray-200">
                        {c.primary_key && <span className="text-amber-400 mr-1">★</span>}
                        {c.name}
                      </td>
                      <td className="px-5 py-2 font-mono text-xs text-indigo-300">{c.type}</td>
                      <td className="px-5 py-2 text-xs text-gray-500">{c.nullable === false ? "NOT NULL" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {t.relationships?.length > 0 && (
                <div className="px-5 py-3 border-t border-white/10 bg-white/5">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Relationships</div>
                  <ul className="text-xs text-gray-300 space-y-0.5">
                    {t.relationships.map((r, k) => (
                      <li key={k} className="font-mono">
                        → {typeof r === "string" ? r : `${r.references} (${r.type})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- API Tab ---------------- */
function ApiTab({ project, setProject }) {
  const [generating, setGenerating] = useState(false);
  const generate = async () => {
    if (!project.requirements) { toast.error("Extract requirements first"); return; }
    setGenerating(true);
    try {
      const r = await api.post(`/projects/${project.id}/api-spec`);
      setProject({ ...project, api_spec: r.data });
      toast.success("API spec generated");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Generation failed");
    } finally { setGenerating(false); }
  };

  const endpoints = project.api_spec?.endpoints || [];
  const methodColor = (m) => ({
    GET: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    POST: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    PUT: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    PATCH: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    DELETE: "bg-red-500/10 text-red-300 border-red-500/30",
  }[m?.toUpperCase()] || "bg-gray-500/10 text-gray-300 border-gray-500/30");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">REST API specification</h2>
          <p className="text-sm text-gray-400">Suggested endpoints for the extracted requirements.</p>
        </div>
        <button
          data-testid="generate-api-btn"
          onClick={generate}
          disabled={generating || !project.requirements}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 glow-indigo disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {endpoints.length ? "Regenerate" : "Generate"}
        </button>
      </div>

      {endpoints.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Code2 className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-400">No endpoints yet. Click Generate.</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          {project.api_spec?.base_url && (
            <div className="px-5 py-3 border-b border-white/10 bg-white/5">
              <span className="text-xs text-gray-500">Base URL: </span>
              <span className="font-mono text-sm text-indigo-300">{project.api_spec.base_url}</span>
            </div>
          )}
          <ul className="divide-y divide-white/5">
            {endpoints.map((e, i) => (
              <li key={i} data-testid={`endpoint-${i}`} className="px-5 py-4 flex items-start gap-4 hover:bg-white/5">
                <span className={`text-[11px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded border min-w-[64px] text-center ${methodColor(e.method)}`}>
                  {e.method}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-gray-100">{e.path}</div>
                  <div className="text-xs text-gray-400 mt-1">{e.description}</div>
                  {e.auth_required && (
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Auth required
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}