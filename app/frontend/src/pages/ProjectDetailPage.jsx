import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, FileAudio, Sparkles, Save, Download,
  FileText, Layout as LayoutIcon, Database, Code2, Mic, Loader2,
  Type, FileImage,
} from "lucide-react";
import Layout from "@/components/Layout";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptEditor from "@/components/TranscriptEditor";
import SchemaDesigner from "@/components/SchemaDesigner";
import ApiDocumentation from "@/components/ApiDocumentation";
import WireframeViewer from "@/components/WireframeViewer";
import ProjectCopilot from "@/components/ProjectCopilot";
import api, { API, parseApiError } from "@/lib/api";

import { useAuth } from "@/context/AuthContext";

/* ────────────────────────────────────────────────────────────────────────── */
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  if (loading || !project) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-10 space-y-4" aria-label="Loading project">
          <div className="h-10 w-1/3 shimmer rounded-lg" />
          <div className="h-64 shimmer rounded-xl" />
        </div>
      </Layout>
    );
  }

  const TABS = [
    { value: "transcript",    label: "Transcript",    Icon: Mic,        testId: "tab-transcript" },
    { value: "requirements",  label: "Requirements",  Icon: FileText,   testId: "tab-requirements" },
    { value: "wireframe",     label: "Wireframe",     Icon: LayoutIcon, testId: "tab-wireframe" },
    { value: "schema",        label: "Schema",        Icon: Database,   testId: "tab-schema" },
    { value: "api",           label: "API Spec",      Icon: Code2,      testId: "tab-api" },
    { value: "export",        label: "Export Hub",    Icon: Download,   testId: "tab-export" },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          data-testid="back-to-dashboard-btn"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to dashboard
        </button>

        {/* Project header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-indigo-400 mb-2">Project</div>
            <h1
              className="text-3xl sm:text-4xl font-bold text-white"
              data-testid="project-name-heading"
            >
              {project.name}
            </h1>
            {project.description && (
              <p className="text-gray-400 mt-2 max-w-2xl">{project.description}</p>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="w-full">
          <div
            role="tablist"
            aria-label="Project sections"
            className="bg-[#161b22] p-1 rounded-lg inline-flex mb-6 border border-white/5 flex-wrap gap-1"
          >
            {TABS.map(({ value, label, Icon, testId }) => (
              <button
                key={value}
                role="tab"
                data-testid={testId}
                data-state={tab === value ? "active" : "inactive"}
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tab === value
                    ? "bg-[#0d1117] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div role="tabpanel">
            {tab === "transcript"    && <TranscriptTab project={project} setProject={setProject} />}
            {tab === "requirements"  && <RequirementsTab project={project} setProject={setProject} getToken={getToken} />}
            {tab === "wireframe"     && <WireframeTab project={project} setProject={setProject} getToken={getToken} />}
            {tab === "schema"        && <SchemaTab project={project} setProject={setProject} />}
            {tab === "api"           && <ApiTab project={project} setProject={setProject} />}
            {tab === "export"        && <ExportTab project={project} getToken={getToken} />}
          </div>
        </div>
      </div>
      
      {/* Floating Copilot */}
      <ProjectCopilot projectId={project.id} />
    </Layout>
  );
}

/* ── Transcript Tab ──────────────────────────────────────────────────────── */
function TranscriptTab({ project, setProject }) {
  const fileRef = useRef(null);
  const handwrittenRef = useRef(null);
  const [inputMode, setInputMode] = useState("type"); // "type" | "voice" | "handwritten"
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState(project.transcript || "");
  const [saving, setSaving] = useState(false);

  const getErrorMessage = (e, fallback) => {
    const detail = e.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ");
    }
    if (detail && typeof detail === "object") {
      return detail.msg || JSON.stringify(detail);
    }
    return fallback;
  };

  /** Upload audio blob or file to backend Whisper endpoint */
  const uploadAudio = async (fileOrBlob, filename = "recording.webm") => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", fileOrBlob, filename);
    try {
      const r = await api.post(`/projects/${project.id}/transcribe`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180_000, // 3 min — Whisper can be slow
      });
      setTranscript(r.data.transcript);
      setProject((prev) => ({ ...prev, transcript: r.data.transcript, status: "transcribed" }));
      toast.success("Audio transcribed successfully!");
    } catch (e) {
      toast.error(getErrorMessage(e, "Transcription failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const uploadHandwritten = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await api.post(`/projects/${project.id}/handwritten-transcript`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180_000,
      });
      setTranscript(r.data.transcript);
      setProject((prev) => ({ ...prev, transcript: r.data.transcript, status: "transcribed" }));
      toast.success("Handwritten text extracted successfully!");
    } catch (e) {
      toast.error(getErrorMessage(e, "Extraction failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };


  const handleFileChange = (e) => uploadAudio(e.target.files?.[0]);

  const handleVoiceComplete = ({ blob, mimeType }) => {
    const ext = mimeType.includes("ogg") ? "ogg" : "webm";
    uploadAudio(blob, `recording.${ext}`);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post(`/projects/${project.id}/transcript`, { transcript });
      setProject((prev) => ({ ...prev, transcript }));
      toast.success("Transcript saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode switcher */}
      <div className="glass rounded-xl p-1 inline-flex gap-1 border border-white/5">
        <button
          data-testid="input-mode-type"
          onClick={() => setInputMode("type")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === "type"
              ? "bg-indigo-600 text-white glow-indigo"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Type className="w-4 h-4" aria-hidden="true" /> Type Text
        </button>
        <button
          data-testid="input-mode-voice"
          onClick={() => setInputMode("voice")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === "voice"
              ? "bg-indigo-600 text-white glow-indigo"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Mic className="w-4 h-4" aria-hidden="true" /> Voice Assistant
        </button>
        <button
          data-testid="input-mode-handwritten"
          onClick={() => setInputMode("handwritten")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === "handwritten"
              ? "bg-indigo-600 text-white glow-indigo"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <FileImage className="w-4 h-4" aria-hidden="true" /> Handwritten
        </button>
      </div>

      {/* ── Type Text mode ── */}
      {inputMode === "type" && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Type className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <span className="font-medium">Paste or type meeting text</span>
            </div>
            <button
              data-testid="save-transcript-btn"
              onClick={save}
              disabled={saving || !transcript.trim()}
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              {saving ? "Saving…" : "Save Transcript"}
            </button>
          </div>
          <textarea
            data-testid="transcript-textarea"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={20}
            placeholder="Paste your meeting notes or discussion here…"
            className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-4 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y placeholder-gray-600"
            aria-label="Transcript text area"
          />
        </div>
      )}

      {/* ── Voice Assistant mode ── */}
      {inputMode === "voice" && (
        <div className="glass rounded-xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Live Voice Recording</h3>
            <p className="text-sm text-gray-400">
              Record your meeting discussion and AI will transcribe it automatically.
            </p>
          </div>

          <VoiceRecorder
            onRecordingComplete={handleVoiceComplete}
            processing={uploading}
          />

          {/* Fallback file upload link */}
          <div className="text-center mt-2">
            <button
              data-testid="fallback-upload-link"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-gray-500 hover:text-indigo-400 underline underline-offset-2 transition-colors"
            >
              or upload an audio file instead
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".mp3,.wav,.m4a,.mp4,.webm,.mpeg,.mpga,audio/*"
              className="hidden"
              data-testid="audio-file-input"
              onChange={handleFileChange}
            />
          </div>

          {/* Show transcript after voice transcription */}
          {transcript && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FileAudio className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                  <span className="font-medium">Transcribed result</span>
                  <span className="text-xs text-gray-500">· editable</span>
                </div>
                <button
                  data-testid="save-transcript-btn-voice"
                  onClick={save}
                  disabled={saving}
                  className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              <textarea
                data-testid="voice-transcript-textarea"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-4 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
                aria-label="Voice transcript result"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Handwritten mode ── */}
      {inputMode === "handwritten" && (
        <div className="glass rounded-xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Upload Handwritten Notes</h3>
            <p className="text-sm text-gray-400">
              Upload an image of your handwritten notes and AI will extract the text.
            </p>
          </div>

          <div className="text-center mt-6 mb-6">
            <button
              data-testid="upload-handwritten-btn"
              onClick={() => handwrittenRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium glow-indigo disabled:opacity-50 transition-all"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <FileImage className="w-4 h-4" aria-hidden="true" />}
              {uploading ? "Extracting..." : "Upload Image"}
            </button>
            <input
              ref={handwrittenRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/*"
              className="hidden"
              onChange={(e) => uploadHandwritten(e.target.files?.[0])}
            />
          </div>

          {/* Show transcript after extraction */}
          {transcript && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FileText className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                  <span className="font-medium">Extracted Text</span>
                  <span className="text-xs text-gray-500">· editable</span>
                </div>
                <button
                  onClick={save}
                  disabled={saving}
                  className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-4 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
                aria-label="Handwritten transcript result"
              />
            </div>
          )}
        </div>
      )}

      {/* Show existing transcript editing when already has content */}
      {inputMode === "type" && project.transcript && (
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
          <FileAudio className="w-3 h-3" aria-hidden="true" />
          Last saved transcript loaded above — edit and save again to update.
        </div>
      )}
    </div>
  );
}

/* ── Requirements Tab ────────────────────────────────────────────────────── */
function RequirementsTab({ project, setProject, getToken }) {
  const [generating, setGenerating] = useState(false);
  const reqs = project.requirements;

  const extract = async () => {
    if (!project.transcript?.trim()) {
      toast.error("Add a transcript first before extracting requirements.");
      return;
    }
    setGenerating(true);
    try {
      const r = await api.post(`/projects/${project.id}/extract`);
      setProject((prev) => ({ ...prev, requirements: r.data, status: "extracted" }));
      toast.success("Requirements extracted!");
    } catch (e) {
      toast.error(parseApiError(e, "Extraction failed. Please try again."));
    } finally {
      setGenerating(false);
    }
  };

  const exportSrs = () => {
    const token = getToken();
    const url = `${API}/projects/${project.id}/srs.docx?token=${encodeURIComponent(token)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!reqs) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-white mb-2">Extract requirements with AI</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Once you have a transcript, Gemini AI will extract structured functional and non-functional requirements.
        </p>
        <button
          data-testid="extract-requirements-btn"
          onClick={extract}
          disabled={generating || !project.transcript?.trim()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium glow-indigo disabled:opacity-50 transition-all"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
          {generating ? "Extracting…" : "Extract requirements"}
        </button>
        {!project.transcript?.trim() && (
          <p className="text-xs text-amber-400 mt-4">Go to the Transcript tab and add text first.</p>
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
        <div className="flex gap-2 flex-wrap">
          <button
            data-testid="re-extract-btn"
            onClick={extract}
            disabled={generating}
            className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-gray-300 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
            Re-extract
          </button>
          <button
            data-testid="export-srs-btn"
            onClick={exportSrs}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-medium glow-indigo flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" aria-hidden="true" /> Export SRS (.docx)
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
            <span className="text-indigo-400" aria-hidden="true">▸</span> {it}
          </li>
        ))}
        {(!items || items.length === 0) && (
          <li className="text-sm text-gray-500">—</li>
        )}
      </ul>
    </div>
  );
}

function ReqGroup({ title, items, testidPrefix }) {
  if (!items?.length) return null;
  const priColor = (p) =>
    ({
      High:   "bg-red-500/10 text-red-300 border-red-500/20",
      Medium: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      Low:    "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    }[p] || "bg-gray-500/10 text-gray-300 border-gray-500/20");

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-indigo-400 mb-3">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((r, i) => (
          <div key={r.id || i} data-testid={`${testidPrefix}-${i}`} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="font-mono text-xs text-indigo-300">
                {r.id || `${testidPrefix.toUpperCase()}${i + 1}`}
              </div>
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

/* ── Wireframe Tab ───────────────────────────────────────────────────────── */
function WireframeTab({ project, setProject, getToken }) {
  const [generatingManifest, setGeneratingManifest] = useState(false);
  const [generatingPageId, setGeneratingPageId] = useState(null);

  const generateManifest = async () => {
    if (!project.requirements) {
      toast.error("Extract requirements first.");
      return;
    }
    setGeneratingManifest(true);
    try {
      const r = await api.post(`/projects/${project.id}/wireframe-manifest`);
      setProject((prev) => ({ ...prev, wireframe_manifest: r.data }));
      toast.success("Design manifest generated!");
    } catch (e) {
      toast.error(parseApiError(e, "Generation failed. Please try again."));
    } finally {
      setGeneratingManifest(false);
    }
  };

  const generatePage = async (pageId) => {
    setGeneratingPageId(pageId);
    try {
      const r = await api.post(`/projects/${project.id}/wireframe-page?page_id=${pageId}`);
      setProject((prev) => ({ 
        ...prev, 
        wireframe_pages: {
          ...(prev.wireframe_pages || {}),
          [pageId]: r.data.html
        }
      }));
      toast.success("Page generated!");
    } catch (e) {
      toast.error(parseApiError(e, "Page generation failed. Please try again."));
    } finally {
      setGeneratingPageId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Multi-Page Wireframes</h2>
          <p className="text-sm text-gray-400">AI-generated complete application prototype.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateManifest}
            disabled={generatingManifest || !project.requirements}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 glow-indigo disabled:opacity-50 transition-all"
          >
            {generatingManifest ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
            {project.wireframe_manifest ? "Regenerate App Structure" : "Generate Prototype"}
          </button>
        </div>
      </div>

      {!project.wireframe_manifest ? (
        <div className="glass rounded-xl p-12 text-center">
          <LayoutIcon className="w-10 h-10 text-indigo-400 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-400">
            {project.requirements
              ? "Click Generate to create a complete UI layout and routing structure."
              : "Extract requirements first, then generate a wireframe prototype."}
          </p>
        </div>
      ) : (
        <WireframeViewer 
          manifest={project.wireframe_manifest}
          pagesHtml={project.wireframe_pages || {}}
          onGeneratePage={generatePage}
          isGeneratingPage={!!generatingPageId}
        />
      )}
    </div>
  );
}

/* ── Schema Tab ──────────────────────────────────────────────────────────── */
function SchemaTab({ project, setProject }) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!project.requirements) {
      toast.error("Extract requirements first.");
      return;
    }
    setGenerating(true);
    try {
      const r = await api.post(`/projects/${project.id}/schema`);
      setProject((prev) => ({ ...prev, schema_spec: r.data }));
      toast.success("Schema generated!");
    } catch (e) {
      toast.error(parseApiError(e, "Generation failed. Please try again."));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Database schema</h2>
          <p className="text-sm text-gray-400">Suggested relational tables for the extracted requirements.</p>
        </div>
        <button
          data-testid="generate-schema-btn"
          onClick={generate}
          disabled={generating || !project.requirements}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 glow-indigo disabled:opacity-50 transition-all"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
          {project.schema_spec ? "Regenerate" : "Generate"}
        </button>
      </div>

      <SchemaDesigner schemaSpec={project.schema_spec} />
    </div>
  );
}

/* ── API Tab ─────────────────────────────────────────────────────────────── */
function ApiTab({ project, setProject }) {
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!project.requirements) {
      toast.error("Extract requirements first.");
      return;
    }
    setGenerating(true);
    try {
      const r = await api.post(`/projects/${project.id}/api-spec`);
      setProject((prev) => ({ ...prev, api_spec: r.data }));
      toast.success("API spec generated!");
    } catch (e) {
      toast.error(parseApiError(e, "Generation failed. Please try again."));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">REST API specification</h2>
          <p className="text-sm text-gray-400">Suggested endpoints for the extracted requirements.</p>
        </div>
        <button
          data-testid="generate-api-btn"
          onClick={generate}
          disabled={generating || !project.requirements}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 glow-indigo disabled:opacity-50 transition-all"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
          {project.api_spec ? "Regenerate" : "Generate"}
        </button>
      </div>

      <ApiDocumentation apiSpec={project.api_spec} />
    </div>
  );
}

/* ── Export Tab ──────────────────────────────────────────────────────────── */
function ExportTab({ project, getToken }) {
  const exportFile = (endpoint, filename) => {
    const token = getToken();
    const url = `${API}/projects/${project.id}/${endpoint}?token=${encodeURIComponent(token)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Export Hub</h2>
        <p className="text-sm text-gray-400">Download your generated assets for use in your workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SRS */}
        <div className="glass rounded-xl p-6 border border-white/5 hover:border-indigo-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Software Requirements (SRS)</h3>
              <p className="text-sm text-gray-400">Word Document (.docx)</p>
            </div>
          </div>
          <button
            onClick={() => exportFile("srs.docx")}
            disabled={!project.requirements}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-indigo-600 text-white flex items-center justify-center transition disabled:opacity-50"
            title="Export SRS"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* API Spec */}
        <div className="glass rounded-xl p-6 border border-white/5 hover:border-indigo-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">OpenAPI Specification</h3>
              <p className="text-sm text-gray-400">JSON Format (.json)</p>
            </div>
          </div>
          <button
            onClick={() => exportFile("api_spec.json")}
            disabled={!project.api_spec}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-indigo-600 text-white flex items-center justify-center transition disabled:opacity-50"
            title="Export OpenAPI Spec"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Database Schema */}
        <div className="glass rounded-xl p-6 border border-white/5 hover:border-indigo-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Database Schema</h3>
              <p className="text-sm text-gray-400">SQL Script (.sql)</p>
            </div>
          </div>
          <button
            onClick={() => exportFile("schema.sql")}
            disabled={!project.schema_spec}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-indigo-600 text-white flex items-center justify-center transition disabled:opacity-50"
            title="Export SQL"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Wireframes */}
        <div className="glass rounded-xl p-6 border border-white/5 hover:border-indigo-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <LayoutIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">UI Wireframes</h3>
              <p className="text-sm text-gray-400">HTML Package (.zip)</p>
            </div>
          </div>
          <button
            onClick={() => exportFile("wireframes.zip")}
            disabled={!project.wireframe_manifest}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-indigo-600 text-white flex items-center justify-center transition disabled:opacity-50"
            title="Export Wireframes"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}