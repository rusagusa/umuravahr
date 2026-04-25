'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, UserCheck, UserX, Award } from 'lucide-react';
import { cn } from '@/components/Sidebar';
import { api } from '@/services/api';

export default function ShortlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [results, setResults] = useState<any[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchResults = () => {
    api.get(`/api/screenings/results/${id}`)
      .then(res => {
        const data = res.data || res;
        setResults(data);
        if (data.length > 0 && !selectedResultId) {
          setSelectedResultId(data[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
    // Simple polling just in case screening runs in background during hackathon demo
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleStatusUpdate = async (status: 'Shortlisted' | 'Rejected') => {
    if (!selectedResultId) return;
    try {
      await api.patch(`/api/screenings/results/${selectedResultId}/status`, { status });
      alert(`Candidate manually ${status}!`);
      fetchResults();
    } catch (e: any) {
      alert(`Status mutation failed: ${e.message}`);
    }
  };

  const handleRunScreening = async () => {
    setRunning(true);
    try {
      await api.post(`/api/screenings/run/${id}`, {});
      alert("AI Screening Pipeline triggered! The Gemini Gateway is processing candidate profiles. Results will appear shortly.");
      fetchResults();
    } catch (e: any) {
      alert(`Screening failed: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const selectedResult = results.find(r => r._id === selectedResultId);

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
          <Link href={`/jobs/${id}/apply`} className="px-4 py-1.5 text-sm font-bold text-white bg-emerald-600 shadow-sm rounded-md hover:bg-emerald-700 transition">
            + Fake PDF Upload
          </Link>
        </div>
      </header>

      {/* Master Detail Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Master Panel (Left 30%) */}
        <div className="w-full max-w-md border-r border-slate-200 bg-slate-50 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-slate-200 sticky top-0 bg-slate-50/90 backdrop-blur z-20 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Evaluated Candidates</h2>
            {results.length === 0 && (
               <button 
                onClick={handleRunScreening}
                disabled={running}
                className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition shadow-sm disabled:opacity-50">
                {running ? "Processing..." : "✨ Run AI Screening"}
               </button>
            )}
          </div>

          <div className="p-3 flex flex-col gap-2 relative">
            {loading ? (
               <div className="text-center text-sm text-slate-400 py-10">Loading pool...</div>
            ) : results.length === 0 ? (
               <div className="text-center text-sm text-slate-400 py-10 flex flex-col items-center">
                 <p className="mb-4">No screening results yet.</p>
                 <button onClick={handleRunScreening} disabled={running} className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-indigo-500/20 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">✨ Run AI ATS Pipeline</button>
               </div>
            ) : results.map((result: any, idx: number) => {
              const candidate = result.profileId || {};
              const isSelected = selectedResultId === result._id;
              const hasStatus = result.status === 'Shortlisted' || result.status === 'Rejected';
              return (
                <button
                  key={result._id}
                  onClick={() => setSelectedResultId(result._id)}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between',
                    isSelected
                      ? 'bg-white border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/50',
                    hasStatus && 'opacity-60'
                  )}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-1">
                      {hasStatus ? result.status.toUpperCase() : `RANK #${idx + 1}`}
                    </div>
                    <div className={cn("font-bold", isSelected ? "text-slate-900" : "text-slate-700")}>{candidate.firstName} {candidate.lastName}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{candidate.headline || 'No Headline'}</div>
                  </div>

                  <div className="shrink-0 ml-4 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {result.matchScore}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel (Right 70%) */}
        <div className="flex-1 overflow-y-auto bg-white relative">
          {selectedResult ? (
            <div className="p-8 max-w-4xl mx-auto">
              {/* Profile Header & Actions */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">{selectedResult.profileId?.firstName} {selectedResult.profileId?.lastName}</h2>
                  <p className="text-lg text-slate-500 mt-1">{selectedResult.profileId?.headline || 'No specific role'}</p>
                  <p className="text-xs font-medium text-slate-400 mt-2 font-mono">Matched against requirements from internal Umurava DB</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate('Rejected')}
                    className={cn("flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors bg-white",
                      selectedResult.status === 'Rejected' ? "border-rose-500 text-rose-700 bg-rose-50 shadow-sm" : "border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50"
                    )}
                  >
                    <UserX className="w-4 h-4" /> {selectedResult.status === 'Rejected' ? 'Current: Rejected' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('Shortlisted')}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm",
                       selectedResult.status === 'Shortlisted' ? "bg-emerald-600 text-white shadow-emerald-500/20" : "bg-slate-900 hover:bg-slate-800 text-white"
                    )}
                  >
                    <UserCheck className="w-4 h-4" /> {selectedResult.status === 'Shortlisted' ? 'Current: Shortlisted' : 'Shortlist for Interview'}
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
                      {selectedResult.strengths?.map((str: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-emerald-700 leading-relaxed font-medium">
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 mr-3" />
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div>
                    <h4 className="font-semibold text-rose-800 flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-rose-500" /> Missing Requirements / Gaps
                    </h4>
                    <ul className="space-y-3">
                      {selectedResult.gaps?.length === 0 ? <p className="text-sm text-slate-400">No major gaps identified.</p> : null}
                      {selectedResult.gaps?.map((gap: string, idx: number) => (
                        <li key={idx} className="flex-col items-start text-sm text-rose-700 leading-relaxed font-medium">
                          <div className="flex"><span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 mr-3" /> <span>{gap}</span></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Final Recommendation */}
                <div className="bg-white/60 p-6 rounded-xl border border-indigo-100/50">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-2">Automated Gemini Note</h4>
                  <blockquote className="text-indigo-950 font-medium text-lg leading-relaxed border-l-4 border-indigo-500 pl-4">
                    &ldquo;{selectedResult.finalRecommendation}&rdquo;
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
