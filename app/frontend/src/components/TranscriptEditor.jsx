import React, { useState } from 'react';
import { Save, Edit2, CheckCircle2, RotateCcw, Copy, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

const TranscriptEditor = ({ initialTranscript, onSave, onAnalyze, isAnalyzing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(transcript);
      setIsEditing(false);
      toast.success("Transcript saved successfully");
    } catch (err) {
      toast.error("Failed to save transcript");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    toast.success("Transcript copied to clipboard");
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-gray-100 font-semibold flex items-center gap-2">
          Transcript Workspace
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            title="Copy"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          {isEditing ? (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit Transcript
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-64 bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none leading-relaxed"
            placeholder="Edit your transcript here before analysis..."
          />
        ) : (
          <div className="w-full h-64 bg-gray-900/50 border border-transparent rounded-lg p-4 text-gray-300 font-mono text-sm overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar">
            {transcript || "No transcript available. Record or upload audio first."}
          </div>
        )}
      </div>

      <div className="bg-gray-800/30 px-4 py-4 border-t border-gray-800 flex justify-end">
        <button
          onClick={() => onAnalyze(transcript)}
          disabled={isAnalyzing || !transcript.trim() || isEditing}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            isEditing 
              ? 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-400' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg glow-indigo'
          }`}
        >
          {isAnalyzing ? (
            <RotateCcw className="w-5 h-5 animate-spin" />
          ) : (
            <BrainCircuit className="w-5 h-5" />
          )}
          {isAnalyzing ? "Analyzing Context..." : "Analyze Requirements"}
        </button>
      </div>
    </div>
  );
};

export default TranscriptEditor;
