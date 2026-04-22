'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, UserCheck, UserX, Award } from 'lucide-react';
import { cn } from '@/components/Sidebar';
import { api } from '@/services/api';

export default function ShortlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = () => {
    api.get('/api/profiles')
      .then(res => {
        const pool = res.data || res;
        setCandidates(pool);
        if (pool.length > 0 && !selectedProfileId) {
          setSelectedProfileId(pool[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCandidates();
  }, [id]);

  const handleStatusUpdate = async (status: 'shortlisted' | 'rejected') => {
    if (!selectedProfileId) return;
    try {
      await api.patch(`/api/profiles/${selectedProfileId}/status`, { status });
      alert(`Candidate manually ${status}!`);
      fetchCandidates();
    } catch (e: any) {
      alert(`Status mutation failed: ${e.message}`);
    }
  };

  const selectedProfile = candidates.find(p => p.id === selectedProfileId);

  return (
    <div className="h-screen flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <header className="shrink-0 px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm">
        <div>
          <Link href={`/jobs/${id}`} className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium mb-1">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Job Details
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Shortlist Evaluation</h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <div className="px-4 py-1.5 text-sm font-medium text-slate-800 bg-white shadow-sm rounded-md">Ranked List</div>
          <div className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer rounded-md">Raw Matrix</div>
        </div>
      </header>

      {/* Master Detail Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Master Panel (Left 30%) */}
        <div className="w-full max-w-md border-r border-slate-200 bg-slate-50 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-slate-200 sticky top-0 bg-slate-50/90 backdrop-blur">
            <h2 className="font-semibold text-slate-800">Candidates ({candidates.length})</h2>
          </div>
          
          <div className="p-3 flex flex-col gap-2">
            {loading ? (
               <div className="text-center text-sm text-slate-400 py-10">Loading pool...</div>
            ) : candidates.length === 0 ? (
               <div className="text-center text-sm text-slate-400 py-10">No candidates available.</div>
            ) : candidates.map((candidate: any, idx: number) => {
              const isSelected = selectedProfileId === candidate.id;
              const hasStatus = candidate.status === 'shortlisted' || candidate.status === 'rejected';
              return (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedProfileId(candidate.id)}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between',
                    isSelected 
                      ? 'bg-white border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/50',
                    hasStatus && 'opacity-60' // Dim down candidates already processed
                  )}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1">
                      {hasStatus ? candidate.status.toUpperCase() : `CANDIDATE ${idx + 1}`}
                    </div>
                    <div className={cn("font-bold", isSelected ? "text-slate-900" : "text-slate-700")}>{candidate.firstName} {candidate.lastName}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{candidate.headline || 'No Headline'}</div>
                  </div>
                  
                  {/* AI Badge fallback icon */}
                  <div className="shrink-0 ml-4 flex flex-col items-center justify-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-50 text-indigo-500 border border-indigo-100",
                    )}>
                      AI
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel (Right 70%) */}
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedProfile ? (
            <div className="p-8 max-w-4xl mx-auto">
              
              {/* Profile Header & Actions */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">{selectedProfile.firstName} {selectedProfile.lastName}</h2>
                  <p className="text-lg text-slate-500 mt-1">{selectedProfile.headline || 'No specific role'}</p>
                  <p className="text-xs font-medium text-slate-400 mt-2 font-mono">ID: {selectedProfile.id}</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleStatusUpdate('rejected')}
                    className={cn("flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors bg-white",
                      selectedProfile.status === 'rejected' ? "border-rose-500 text-rose-700 bg-rose-50 shadow-sm" : "border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50"
                    )}
                  >
                    <UserX className="w-4 h-4" /> {selectedProfile.status === 'rejected' ? 'Current: Rejected' : 'Reject'}
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('shortlisted')}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm",
                       selectedProfile.status === 'shortlisted' ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-slate-900 hover:bg-slate-800 text-white"
                    )}
                  >
                    <UserCheck className="w-4 h-4" /> {selectedProfile.status === 'shortlisted' ? 'Current: Shortlisted' : 'Shortlist for Interview'}
                  </button>
                </div>
              </div>

              {/* AI Reasoning Card */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-lg font-bold text-indigo-900 tracking-tight">AI Diagnostic Summary</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Strengths */}
                  <div>
                    <h4 className="font-semibold text-emerald-800 flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Extracted Skills
                    </h4>
                    <ul className="space-y-3">
                      {selectedProfile.skills?.map((str: any, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-slate-700 leading-relaxed font-semibold">
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 mr-3" />
                          {str.name || JSON.stringify(str)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div>
                    <h4 className="font-semibold text-indigo-800 flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-indigo-500" /> Experience Data
                    </h4>
                    <ul className="space-y-3">
                      {selectedProfile.experience?.slice(0, 3).map((exp: any, idx: number) => (
                        <li key={idx} className="flex-col items-start text-sm text-slate-700 leading-relaxed">
                          <div className="flex"><span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 mr-3" /> <span className="font-bold">{exp.role}</span></div>
                          <div className="ml-5 text-slate-500">{exp.company}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Final Recommendation */}
                <div className="bg-white/60 p-6 rounded-xl border border-indigo-100/50">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-2">Automated Note</h4>
                  <blockquote className="text-indigo-950 font-medium text-lg leading-relaxed border-l-4 border-indigo-500 pl-4">
                    "AI processing identified native compatibility in extracted structure. Action is required from human recruiter."
                  </blockquote>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a candidate from the left panel to view AI details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
