import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, FileText, Settings, Users, Briefcase, Puzzle, FileQuestion, ChevronRight, Check } from 'lucide-react';
import api from '../lib/api';
import Layout from '../components/Layout';
import { toast } from 'sonner';

const RequirementAnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answeringQuestions, setAnsweringQuestions] = useState(false);
  const [clarificationAnswers, setClarificationAnswers] = useState({});
  const [updatingRequirements, setUpdatingRequirements] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (err) {
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleClarify = async () => {
    setAnsweringQuestions(true);
    try {
      await api.post(`/projects/${id}/clarify`);
      fetchProject();
    } catch (err) {
      toast.error("Failed to generate questions");
      setAnsweringQuestions(false);
    }
  };

  const submitAnswers = async () => {
    setUpdatingRequirements(true);
    try {
      // In a real app, send answers to a new backend route to enrich requirements.
      // For now, we simulate a success message.
      toast.success("Requirements updated with clarification context!");
      setAnsweringQuestions(false);
    } catch (err) {
      toast.error("Failed to update requirements");
    } finally {
      setUpdatingRequirements(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const reqs = project?.requirements || {};
  const score = reqs.requirement_completeness_score || 0;
  const missingInfo = reqs.missing_information || [];
  const questions = project?.clarification_questions?.questions || [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-indigo-500" />
              AI Requirement Analysis
            </h1>
            <p className="text-gray-400 mt-2">Deep context extraction and validation for "{project?.name}"</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl flex flex-col items-center border ${score > 85 ? 'bg-green-500/10 border-green-500/30' : score > 60 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <span className="text-xs text-gray-400 font-semibold uppercase">Completeness</span>
              <span className={`text-2xl font-bold ${score > 85 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}%
              </span>
            </div>
          </div>
        </header>

        {/* Quality Check Section */}
        {missingInfo.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <h3 className="text-amber-400 font-bold flex items-center gap-2 text-lg mb-4">
              <AlertTriangle className="w-5 h-5" />
              Missing Context Detected
            </h3>
            <ul className="space-y-2 mb-6">
              {missingInfo.map((info, i) => (
                <li key={i} className="text-amber-200/80 flex items-start gap-2 text-sm">
                  <span className="mt-1">•</span>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
            
            {!answeringQuestions && questions.length === 0 && (
              <button 
                onClick={handleClarify}
                className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-4 py-2 rounded-lg transition shadow-lg flex items-center gap-2"
              >
                <FileQuestion className="w-4 h-4" />
                Generate Clarification Questions
              </button>
            )}
          </div>
        )}

        {/* Clarification Wizard */}
        {questions.length > 0 && answeringQuestions && (
          <div className="bg-gray-800 border border-indigo-500/50 rounded-xl p-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-6">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
              AI Clarification Required
            </h3>
            
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Context: {q.context}</p>
                  <p className="text-gray-100 font-medium mb-3">{q.question}</p>
                  <textarea 
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="Provide details..."
                    value={clarificationAnswers[q.id] || ""}
                    onChange={(e) => setClarificationAnswers({...clarificationAnswers, [q.id]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={submitAnswers}
                disabled={updatingRequirements}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-lg transition shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {updatingRequirements ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check className="w-5 h-5" />}
                Update Requirements
              </button>
            </div>
          </div>
        )}

        {/* Requirement Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Functional Requirements" icon={<Settings className="text-blue-400"/>} count={reqs.functional_requirements?.length} items={reqs.functional_requirements} />
          <SectionCard title="Non-Functional Requirements" icon={<CheckCircle2 className="text-green-400"/>} count={reqs.non_functional_requirements?.length} items={reqs.non_functional_requirements} />
          <SectionCard title="User Personas" icon={<Users className="text-purple-400"/>} count={reqs.user_personas?.length} items={reqs.user_personas?.map(p => ({title: p.name, description: p.role}))} />
          <SectionCard title="User Stories" icon={<FileText className="text-yellow-400"/>} count={reqs.user_stories?.length} items={reqs.user_stories?.map(s => ({title: `As a ${s.role}...`, description: `I want to ${s.action} so that ${s.benefit}`}))} />
          <SectionCard title="Use Cases" icon={<Briefcase className="text-orange-400"/>} count={reqs.use_cases?.length} items={reqs.use_cases?.map(u => ({title: u.name, description: `Actor: ${u.actor}`}))} />
          <SectionCard title="Modules & Architecture" icon={<Puzzle className="text-teal-400"/>} count={reqs.modules?.length} items={reqs.modules} />
        </div>

      </div>
    </Layout>
  );
};

const BrainCircuit = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5Z"/><path d="M16 8V5c0-1.1.9-2 2-2"/><path d="M12 13h4"/><path d="M12 18h6a2 2 0 0 1 2 2v1"/><path d="M12 8h8"/></svg>;

const SectionCard = ({ title, icon, count = 0, items = [] }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition group cursor-pointer">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <span className="bg-gray-800 text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full">
        {count}
      </span>
    </div>
    <div className="space-y-3">
      {items.slice(0, 3).map((item, i) => (
        <div key={i} className="bg-gray-950 p-3 rounded-lg border border-gray-800/50">
          <p className="text-gray-200 text-sm font-semibold truncate">{item.title || item.name}</p>
          <p className="text-gray-500 text-xs truncate mt-1">{item.description}</p>
        </div>
      ))}
      {count > 3 && (
        <p className="text-center text-xs text-indigo-400 font-medium pt-2 group-hover:text-indigo-300 transition">
          + {count - 3} more items
        </p>
      )}
      {count === 0 && (
        <p className="text-center text-sm text-gray-500 py-4 italic">No items generated.</p>
      )}
    </div>
  </div>
);

export default RequirementAnalysisPage;
