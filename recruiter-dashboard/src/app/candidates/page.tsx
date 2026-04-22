'use client';
import { useState, useEffect } from 'react';
import { Users, FileText } from 'lucide-react';
import { api } from '@/services/api';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/profiles')
      .then(res => setCandidates(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Applicant Pool</h1>
          <p className="text-slate-500 mt-1">Cross-pipeline view of all ingested professional profiles.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium">
          <FileText className="w-5 h-5" /> Export CSV
        </button>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Applicant ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Headline / Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Skills Extracted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading candidate pool...</td></tr>
            ) : candidates.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No applicants found.</td></tr>
            ) : candidates.map(cand => (
              <tr key={cand.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500 text-xs">{cand.id?.substring(0, 8)}...</td>
                <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">{cand.firstName?.charAt(0)}</div>
                  {cand.firstName} {cand.lastName}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm max-w-[200px] truncate">{cand.headline || 'Not specified'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    cand.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                    cand.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {cand.status?.toUpperCase() || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[300px]">
                   {cand.skills?.join(', ') || 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
