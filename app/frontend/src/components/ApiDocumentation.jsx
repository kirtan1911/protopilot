import React, { useState } from 'react';
import { Server, Shield, Code, ChevronDown, ChevronRight, Copy, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const ApiDocumentation = ({ apiSpec }) => {
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Endpoints");

  if (!apiSpec || !apiSpec.endpoints) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
        <Server className="w-12 h-12 mb-4 opacity-50" />
        <p>No API specification generated yet.</p>
      </div>
    );
  }

  const { endpoints, base_url, health_score } = apiSpec;
  
  const filteredEndpoints = endpoints.filter(e => 
    e.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'POST': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PUT': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'PATCH': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const toggleExpand = (id) => {
    setExpandedEndpoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const generateOpenApi = () => {
    const openapi = {
      openapi: "3.0.0",
      info: { title: "Generated API", version: "1.0.0" },
      servers: [{ url: base_url || "/api" }],
      paths: {}
    };

    endpoints.forEach(e => {
      if (!openapi.paths[e.endpoint]) openapi.paths[e.endpoint] = {};
      openapi.paths[e.endpoint][e.method.toLowerCase()] = {
        summary: e.purpose,
        tags: [e.module],
        responses: Object.keys(e.http_status_codes || {}).reduce((acc, code) => {
          acc[code] = { description: e.http_status_codes[code] };
          return acc;
        }, {})
      };
    });
    return JSON.stringify(openapi, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <span className={`text-2xl font-bold ${health_score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{health_score || 0}</span>
          </div>
          <div>
            <h3 className="text-gray-100 font-bold text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              REST API Specification
            </h3>
            <p className="text-gray-400 text-sm font-mono">Base URL: {base_url || "/api"}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => copyToClipboard(generateOpenApi())} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-200 transition">
            <Code className="w-4 h-4" />
            Export OpenAPI JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {['Endpoints', 'Authentication', 'Models'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'Endpoints' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search endpoints..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-3">
            {filteredEndpoints.map(endpoint => (
              <div key={endpoint.api_id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
                <div 
                  className="px-4 py-3 cursor-pointer flex items-center gap-4 select-none"
                  onClick={() => toggleExpand(endpoint.api_id)}
                >
                  <div className={`px-2 py-1 rounded text-xs font-bold border w-16 text-center ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </div>
                  <div className="flex-1 font-mono text-sm text-gray-200">
                    {endpoint.endpoint}
                  </div>
                  <div className="hidden md:block text-xs text-gray-500 truncate max-w-xs">
                    {endpoint.purpose}
                  </div>
                  {expandedEndpoints[endpoint.api_id] ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                </div>

                {expandedEndpoints[endpoint.api_id] && (
                  <div className="p-4 bg-gray-950 border-t border-gray-800 space-y-4 text-sm">
                    <div>
                      <p className="text-gray-300 font-medium">{endpoint.purpose}</p>
                      <p className="text-gray-500 text-xs mt-1">Module: {endpoint.module}</p>
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-2 text-gray-400 bg-gray-900 p-2 rounded border border-gray-800/50 inline-flex">
                      <Shield className="w-4 h-4" />
                      Auth: <span className="text-indigo-400 font-mono text-xs">{endpoint.authentication}</span>
                      <span className="text-gray-600">|</span>
                      Roles: <span className="text-indigo-400 font-mono text-xs">{endpoint.authorization}</span>
                    </div>

                    {/* Request */}
                    {endpoint.request_body && Object.keys(endpoint.request_body).length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Request Body</h5>
                        <pre className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-gray-300 font-mono text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.request_body, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response */}
                    {endpoint.response_body && Object.keys(endpoint.response_body).length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Response Body (200)</h5>
                        <pre className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-green-400/80 font-mono text-xs overflow-x-auto">
                          {JSON.stringify(endpoint.response_body, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Status Codes */}
                    {endpoint.http_status_codes && Object.keys(endpoint.http_status_codes).length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Responses</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(endpoint.http_status_codes).map(([code, desc]) => (
                            <div key={code} className="flex gap-2 items-start text-xs bg-gray-900 p-2 rounded border border-gray-800/50">
                              <span className={`font-mono font-bold ${code.startsWith('2') ? 'text-green-400' : code.startsWith('4') ? 'text-yellow-400' : 'text-red-400'}`}>
                                {code}
                              </span>
                              <span className="text-gray-400">{desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Authentication' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-300">
          <h4 className="font-bold text-white mb-4">Authentication Overview</h4>
          <p className="mb-4">Most endpoints require authentication via JWT tokens passed in the Authorization header.</p>
          <pre className="bg-gray-950 border border-gray-800 p-4 rounded-lg font-mono text-sm text-indigo-300">
            Authorization: Bearer &lt;token&gt;
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiDocumentation;
