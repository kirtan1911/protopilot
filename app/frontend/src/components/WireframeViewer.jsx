import React, { useState } from 'react';
import { Layout as LayoutIcon, FileCode, Search, Smartphone, Monitor, ChevronRight, PlayCircle, Loader2 } from 'lucide-react';

const WireframeViewer = ({ manifest, pagesHtml = {}, onGeneratePage, isGeneratingPage }) => {
  const [activePageId, setActivePageId] = useState(manifest?.pages?.[0]?.id || null);
  const [viewport, setViewport] = useState('desktop');

  if (!manifest) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
        <LayoutIcon className="w-12 h-12 mb-4 opacity-50" />
        <p>No wireframe manifest generated yet.</p>
      </div>
    );
  }

  const { design_system, pages } = manifest;
  const activePageInfo = pages.find(p => p.id === activePageId);
  const activeHtml = pagesHtml[activePageId];

  const handlePageSelect = (pageId) => {
    setActivePageId(pageId);
    if (!pagesHtml[pageId] && onGeneratePage) {
      onGeneratePage(pageId);
    }
  };

  const getSrcDoc = (html) => {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: ${JSON.stringify(design_system?.colors || {})},
        fontFamily: { sans: ['Inter', 'sans-serif'] }
      }
    }
  }
</script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body{margin:0;background:#0d1117;color:#e5e7eb;font-family:'Inter',sans-serif;}
  .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
</style>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('This is a wireframe prototype. Form submissions are disabled.');
    });
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        alert('This is a wireframe prototype. Navigation is disabled.');
      }
    });
  });
</script>
</head><body>${html}</body></html>`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg h-fit">
        <div className="p-4 border-b border-gray-800 bg-gray-950">
          <h3 className="text-white font-bold flex items-center gap-2">
            <LayoutIcon className="w-4 h-4 text-indigo-400" />
            App Structure
          </h3>
          <p className="text-xs text-gray-500 mt-1">Design system: {design_system?.theme || 'Default'}</p>
        </div>
        <ul className="divide-y divide-gray-800">
          {pages.map((page) => (
            <li key={page.id}>
              <button
                onClick={() => handlePageSelect(page.id)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition ${
                  activePageId === page.id 
                    ? 'bg-indigo-600/10 border-l-4 border-indigo-500' 
                    : 'hover:bg-gray-800/50 border-l-4 border-transparent'
                }`}
              >
                <div>
                  <div className={`font-medium ${activePageId === page.id ? 'text-indigo-400' : 'text-gray-300'}`}>
                    {page.name}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
                    {page.module}
                  </div>
                </div>
                {pagesHtml[page.id] ? (
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Viewer Area */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold">{activePageInfo?.name}</h2>
            <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-md border border-gray-700">
              {activePageInfo?.purpose}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-gray-950 p-1 rounded-lg border border-gray-800">
            <button 
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-md transition ${viewport === 'mobile' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-md transition ${viewport === 'desktop' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className={`mx-auto transition-all duration-300 ${viewport === 'mobile' ? 'w-[375px]' : 'w-full'}`}>
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
            {/* Browser chrome */}
            <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <div className="flex-1 ml-4 bg-gray-950 border border-gray-800 rounded text-[10px] text-gray-500 px-2 py-0.5 text-center font-mono">
                {activePageInfo?.route || '/'}
              </div>
            </div>

            {/* Content */}
            <div className="min-h-[600px] bg-[#0d1117] flex items-center justify-center relative">
              {isGeneratingPage ? (
                <div className="flex flex-col items-center gap-3 text-indigo-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm font-medium animate-pulse">Generating UI Components...</span>
                </div>
              ) : activeHtml ? (
                <iframe
                  title={`${activePageInfo?.name} Preview`}
                  srcDoc={getSrcDoc(activeHtml)}
                  className="w-full h-[700px] border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                />
              ) : (
                <div className="text-center p-8">
                  <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">Page wireframe not generated yet.</p>
                  <button
                    onClick={() => onGeneratePage(activePageId)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition"
                  >
                    Generate {activePageInfo?.name} Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WireframeViewer;
