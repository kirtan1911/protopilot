import React, { useState } from 'react';
import { Database, Key, Link as LinkIcon, AlertCircle, FileJson, FileCode2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const SchemaDesigner = ({ schemaSpec }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  if (!schemaSpec || !schemaSpec.tables) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
        <Database className="w-12 h-12 mb-4 opacity-50" />
        <p>No database schema generated yet.</p>
      </div>
    );
  }

  const { tables, health_score, missing_primary_keys = [], missing_foreign_keys = [], normalization_problems = [] } = schemaSpec;
  
  const filteredTables = tables.filter(t => 
    t.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const generateSql = () => {
    let sql = "";
    tables.forEach(t => {
      sql += `CREATE TABLE ${t.table_name} (\n`;
      t.columns.forEach((c, idx) => {
        let line = `  ${c.name} ${c.type}`;
        if (c.primary_key) line += " PRIMARY KEY";
        if (!c.nullable && !c.primary_key) line += " NOT NULL";
        if (c.unique) line += " UNIQUE";
        sql += line + (idx < t.columns.length - 1 ? ",\n" : "\n");
      });
      sql += ");\n\n";
    });
    return sql;
  };

  return (
    <div className="space-y-6">
      {/* Header & Intelligence */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <span className={`text-2xl font-bold ${getHealthColor(health_score || 0)}`}>{health_score || 0}</span>
          </div>
          <div>
            <h3 className="text-gray-100 font-bold text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Schema Design Health
            </h3>
            <p className="text-gray-400 text-sm">AI-validated relational structure</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => copyToClipboard(generateSql())} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-200 transition">
            <FileCode2 className="w-4 h-4" />
            Copy SQL
          </button>
          <button onClick={() => copyToClipboard(JSON.stringify(schemaSpec, null, 2))} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-200 transition">
            <FileJson className="w-4 h-4" />
            Copy JSON
          </button>
        </div>
      </div>

      {(missing_primary_keys.length > 0 || missing_foreign_keys.length > 0 || normalization_problems.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 space-y-3">
          <h4 className="text-amber-400 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            AI Design Warnings
          </h4>
          <ul className="text-sm text-amber-200/80 space-y-1 ml-6 list-disc">
            {missing_primary_keys.map((p, i) => <li key={`pk-${i}`}>Missing PK: {p}</li>)}
            {missing_foreign_keys.map((p, i) => <li key={`fk-${i}`}>Missing FK: {p}</li>)}
            {normalization_problems.map((p, i) => <li key={`norm-${i}`}>{p}</li>)}
          </ul>
        </div>
      )}

      {/* Search */}
      <div>
        <input 
          type="text"
          placeholder="Search tables..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTables.map(table => (
          <div key={table.table_name} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition shadow-lg">
            <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h4 className="text-indigo-400 font-bold font-mono">{table.table_name}</h4>
                <p className="text-xs text-gray-500 truncate max-w-[200px]" title={table.description}>{table.description}</p>
              </div>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700">
                {table.columns?.length || 0} cols
              </span>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-950/50 text-gray-500 text-xs">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Attributes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {table.columns?.map(col => (
                    <tr key={col.name} className="hover:bg-gray-800/30">
                      <td className="px-4 py-2 font-mono text-gray-300 flex items-center gap-2">
                        {col.primary_key ? <Key className="w-3 h-3 text-amber-500" /> : col.name.includes('_id') ? <LinkIcon className="w-3 h-3 text-indigo-500" /> : <div className="w-3 h-3" />}
                        {col.name}
                      </td>
                      <td className="px-4 py-2 text-blue-400 font-mono text-xs">{col.type}</td>
                      <td className="px-4 py-2 text-xs flex gap-1 flex-wrap">
                        {col.primary_key && <span className="text-amber-500 bg-amber-500/10 px-1 rounded">PK</span>}
                        {col.unique && <span className="text-purple-400 bg-purple-400/10 px-1 rounded">UQ</span>}
                        {!col.nullable && !col.primary_key && <span className="text-red-400 bg-red-400/10 px-1 rounded">NN</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {table.foreign_keys && table.foreign_keys.length > 0 && (
              <div className="bg-gray-950/50 px-4 py-3 border-t border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Relationships</p>
                <div className="space-y-1">
                  {table.foreign_keys.map((fk, i) => (
                    <div key={i} className="text-xs text-gray-400 flex items-center gap-2 font-mono">
                      <LinkIcon className="w-3 h-3 text-indigo-500" />
                      <span>{fk.column} <span className="text-gray-600">→</span> <span className="text-indigo-400">{fk.references_table}</span>({fk.references_column})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaDesigner;
