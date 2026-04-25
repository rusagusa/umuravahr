'use client';

import React, { useState, use, useEffect } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, AlertTriangle, ExternalLink, Mail, Phone, MapPin, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/services/api';

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningTriggered, setScreeningTriggered] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [preScreenCandidates, setPreScreenCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedPreScreen, setSelectedPreScreen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch pre-screening candidates (external applicants + skill-matched internal)
  const fetchPreScreenCandidates = async () => {
    try {
      const res = await api.get(`/api/jobs/${id}/candidates`);
      const data = res.data || res;
      setPreScreenCandidates(data);
      if (data.length > 0 && !selectedPreScreen) {
        setSelectedPreScreen(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch pre-screen candidates', err);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get(`/api/jobs/${id}`).then(res => setJob(res.data || res)).catch(() => {
        setError('The job you are looking for does not exist or has been removed.');
      }),
      fetchPreScreenCandidates()
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleRunScreening = async () => {
    setIsScreening(true);
    setScreeningTriggered(true);
    try {
      await api.post(`/api/screenings/evaluate/${id}`, {});
      let attempts = 0;
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/screenings/${id}/shortlist`);
          const data = res.data || res;
          if (data.length > 0) {
            setAiResults(data);
            setSelectedCandidate(data[0]);
            setSelectedPreScreen(null);
            clearInterval(interval);
            setIsScreening(false);
            return;
          }
        } catch (e) {}
        
        attempts++;
        if (attempts > 20) {
          clearInterval(interval);
          setIsScreening(false);
        }
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsScreening(false);
    }
  };

  const hasAiResults = screeningTriggered && aiResults.length > 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-[calc(100vh-64px)] overflow-hidden">
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 border border-amber-100">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Not Found</h2>
          <p className="text-slate-500 max-w-sm mb-8">{error}</p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-200">
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between flex-shrink-0 gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 text-sm text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-blue-600 flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Overview
            </Link>
            <span>&bull;</span>
            <span>{job ? job.title : `Job ID: ${id}`}</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Talent Pipeline</h1>
            {job && (
              <button 
                onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(window.location.origin + '/apply/' + job.id); }}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-bold tracking-wide uppercase flex items-center bg-blue-50 px-2 py-1 rounded transition"
              >
                <span className="mr-1">🔗</span> Copy Apply Link
              </button>
            )}
          </div>
          {job && <p className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-2xl">{job.description}</p>}
        </div>

        <button
          onClick={handleRunScreening}
          disabled={isScreening}
          className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ring-offset-2 ring-slate-900 focus:outline-none focus:ring-2"
        >
          {isScreening ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Sparkles className="w-5 h-5 text-indigo-400" />
          )}
          <span>{isScreening ? 'Processing Gemini Engine...' : 'Run AI Screening'}</span>
        </button>
      </header>

      {/* Master-Detail Split View */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel - Master (35%) */}
        <aside className="w-full lg:w-[35%] xl:w-[400px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          
          {/* AI Results Section */}
          {hasAiResults && (
            <>
              <div className="p-4 border-b border-slate-200 bg-indigo-50/50">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-semibold text-indigo-900">AI Ranked ({aiResults.length})</h2>
                </div>
                <p className="text-xs text-indigo-600 mt-0.5">Sorted by Gemini match score</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {aiResults.map(candidateResult => {
                  const profile = candidateResult.profileId || {};
                  const isSelected = selectedCandidate?.id === candidateResult.id;
                  return (
                    <button
                      key={candidateResult.id}
                      onClick={() => { setSelectedCandidate(candidateResult); setSelectedPreScreen(null); }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 border border-slate-200">
                            {profile.firstName?.[0] || 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-900 truncate">{profile.firstName} {profile.lastName}</h3>
                            <p className="text-xs text-slate-500 truncate">{profile.headline || 'Talent Pool'}</p>
                          </div>
                        </div>
                        <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-10 h-10 transform -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-100" />
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none"
                              strokeDasharray="100"
                              strokeDashoffset={100 - (candidateResult.matchScore || 0)}
                              className={candidateResult.matchScore > 80 ? "text-emerald-500" : candidateResult.matchScore > 60 ? "text-amber-500" : "text-slate-400"}
                            />
                          </svg>
                          <span className="absolute text-[10px] font-bold text-slate-700">{candidateResult.matchScore || 0}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          profile.source === 'umurava' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {profile.source || 'EXTERNAL'}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {profile.location || 'Remote'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Pre-Screening Candidates Section */}
          {!hasAiResults && (
            <>
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <h2 className="font-semibold text-slate-800">Candidate Pool ({preScreenCandidates.length})</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">External applicants + skill-matched internal talent</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                  <div className="p-10 text-center text-slate-400">Loading talent...</div>
                ) : preScreenCandidates.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 italic">No candidates found for this job yet.</div>
                ) : preScreenCandidates.map((cand, i) => {
                  const isSelected = selectedPreScreen?.id === cand.id;
                  return (
                    <button
                      key={cand.id || i}
                      onClick={() => { setSelectedPreScreen(cand); setSelectedCandidate(null); }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center flex-shrink-0 border ${
                          cand.source === 'umurava' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {cand.firstName?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <h3 className="font-bold text-slate-900 truncate">{cand.firstName} {cand.lastName}</h3>
                          <p className="text-xs text-slate-500 truncate">{cand.headline || 'Candidate'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          cand.source === 'umurava' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {cand.source === 'umurava' ? 'UMURAVA' : 'EXTERNAL'}
                        </span>
                        <span className="text-[10px] text-slate-400 italic truncate max-w-[140px]">{cand.matchReason}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {/* Right Panel - Detail (65%) */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-4 md:p-8 lg:p-10">

          {isScreening ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto animate-in zoom-in duration-300">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow-lg border border-indigo-200">
                  <Sparkles className="w-10 h-10" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Gemini Brain Processing</h3>
              <p className="text-slate-500 text-sm">Our AI is currently benchmarking the candidates against your specific requirements and ranking them based on fit.</p>
              <div className="w-full space-y-3 mt-8">
                <div className="h-3 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded-full animate-pulse w-5/6 mx-auto"></div>
                <div className="h-3 bg-slate-200 rounded-full animate-pulse w-4/6 mx-auto"></div>
              </div>
            </div>

          ) : selectedCandidate ? (
            /* AI Result Detail View */
            <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 text-2xl font-bold flex items-center justify-center border-2 border-indigo-100 shadow-sm flex-shrink-0">
                    {selectedCandidate.profileId?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.profileId?.firstName} {selectedCandidate.profileId?.lastName}</h2>
                    <p className="text-lg text-slate-600 mb-2">{selectedCandidate.profileId?.headline || 'Candidate'}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5 text-slate-300" /> {selectedCandidate.profileId?.email}</span>
                      <span className="flex items-center"><Phone className="w-4 h-4 mr-1.5 text-slate-300" /> +250 782 XXX XXX</span>
                      <span className="flex items-center text-blue-500 hover:underline cursor-pointer"><ExternalLink className="w-4 h-4 mr-1.5" /> LinkedIn</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm mb-4 text-sm flex items-center">
                    Schedule interview &rarr;
                  </button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-500 uppercase">Status:</span>
                    <span className="text-sm font-bold text-emerald-500 flex items-center">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" /> 
                      {selectedCandidate.matchScore > 80 ? 'Recommended' : 'In Review'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-8">EVALUATION TIMELINE</h3>
                <div className="border-l-2 border-dashed border-blue-200 ml-3 pl-8 relative space-y-10">
                  {/* Strengths */}
                  <div className="relative">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[39px] top-1"></div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 shadow-sm">
                      <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                        <h4 className="text-sm font-bold uppercase tracking-tight">Key Strengths</h4>
                      </div>
                      <ul className="space-y-4">
                        {selectedCandidate.strengths?.map((str: string, index: number) => (
                          <li key={index} className="flex items-start text-sm text-indigo-900">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-3 flex-shrink-0" />
                            <span className="font-medium leading-relaxed">{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Gaps */}
                  <div className="relative">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[39px] top-1"></div>
                    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-4 flex items-center">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" /> Identified Gaps
                      </h4>
                      <ul className="space-y-4">
                        {selectedCandidate.gaps?.length === 0 && <li className="text-sm text-slate-400 italic">No significant gaps found.</li>}
                        {selectedCandidate.gaps?.map((gap: string, index: number) => (
                          <li key={index} className="flex items-start text-sm text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 mr-3 flex-shrink-0" />
                            <span className="font-medium leading-relaxed">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Recommendation */}
                  <div className="relative">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[39px] top-1"></div>
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg shadow-sm">
                      <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">AI Final Assessment</h4>
                      <p className="text-base font-semibold text-slate-800 leading-relaxed border-l-4 border-blue-500 pl-4 py-1">
                        &ldquo;{selectedCandidate.finalRecommendation}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200 mt-8">
                <button className="px-5 py-2 text-slate-600 font-bold text-[13px] hover:bg-slate-100 rounded-md transition-colors">Discard Candidate</button>
                <button className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-md font-bold text-[13px] shadow-sm transition-all active:scale-95">Engage Candidate</button>
              </div>
            </div>

          ) : selectedPreScreen ? (
            /* Pre-Screening Profile Detail View */
            <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-full text-2xl font-bold flex items-center justify-center border-2 shadow-sm flex-shrink-0 ${
                      selectedPreScreen.source === 'umurava' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {selectedPreScreen.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedPreScreen.firstName} {selectedPreScreen.lastName}</h2>
                      <p className="text-lg text-slate-600 mb-2">{selectedPreScreen.headline || 'Candidate'}</p>
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5 text-slate-300" /> {selectedPreScreen.email}</span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-slate-300" /> {selectedPreScreen.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase ${
                    selectedPreScreen.source === 'umurava' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedPreScreen.source === 'umurava' ? '🟣 Umurava Pool' : '🔵 External'}
                  </span>
                </div>
              </div>

              {/* Match Reason */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  {selectedPreScreen.matchReason}
                </p>
              </div>

              {/* Skills */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPreScreen.skills?.map((skill: any, i: number) => (
                    <span key={i} className="inline-flex items-center bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      {skill.name} <span className="ml-1.5 text-slate-400">• {skill.level}</span> <span className="ml-1.5 text-slate-400">• {skill.yearsOfExperience}y</span>
                    </span>
                  ))}
                  {(!selectedPreScreen.skills || selectedPreScreen.skills.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-4">Availability</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium border border-emerald-100">{selectedPreScreen.availability?.status || 'Unknown'}</span>
                  <span className="text-slate-500">{selectedPreScreen.availability?.type || 'Full-time'}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 text-center">
                <p className="text-sm text-amber-800 font-medium mb-3">Run AI Screening to see how this candidate ranks against the job requirements</p>
                <button onClick={handleRunScreening} disabled={isScreening} className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-md font-bold text-sm shadow-sm transition-all active:scale-95">
                  <Sparkles className="w-4 h-4 inline mr-2" /> Run AI Screening
                </button>
              </div>
            </div>

          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <AlertTriangle className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Pipeline Empty</h3>
              <p className="text-slate-500 text-sm mb-6">No candidates have applied or been sourced for this job yet.</p>
              <button onClick={handleRunScreening} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm">Process Talent Pool</button>
            </div>
          )}
        </main>
      </div>
    </>
  )}
</div>
  );
}
