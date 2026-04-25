'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, Briefcase, FileText, ArrowRight, MoreHorizontal, Clock } from 'lucide-react';
import { api } from '@/services/api';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let recruiterId = '69ec549e89a2bdf77557a1e0'; // Fallback: Umurava Admin (tech@umurava.africa)
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user && user._id) recruiterId = user._id;
    } catch {}

    Promise.all([
      api.get(`/api/jobs?recruiterId=${recruiterId}`),
      api.get('/api/profiles')
    ]).then(([jobsRes, profilesRes]) => {
      setJobs(jobsRes.data || jobsRes);
      const profilesData = profilesRes.data || profilesRes || [];
      setProfiles(profilesData);
      setCandidateCount(profilesData.length);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* Header & High-level Metrics */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Jobs Overview</h1>
          <p className="text-slate-500">Manage your active requisitions and candidate pipeline.</p>
        </div>
        <Link href="/jobs/new" className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors ring-offset-2 ring-blue-600 focus:outline-none focus:ring-2 shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5" />
          <span>Create New Job</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[100px]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-400 mb-1">Total Active Jobs</p>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </div>
            <div className="w-8 h-8 bg-slate-800 text-slate-300 rounded-md flex items-center justify-center border border-slate-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 absolute bottom-4 right-4" />
        </div>

        {/* Metric Card 2 */}
        <div className="bg-emerald-500 text-white p-4 rounded-lg border border-emerald-400 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[100px]">
           <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-emerald-100 mb-1">Talent Pool</p>
              <p className="text-2xl font-bold">{candidateCount}</p>
            </div>
            <div className="w-8 h-8 bg-emerald-400/80 text-white rounded-md flex items-center justify-center border border-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-300 absolute bottom-4 right-4" />
        </div>

        {/* Metric Card 3 */}
        <div className="bg-blue-600 text-white p-4 rounded-lg border border-blue-500 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[100px]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-100 mb-1">AI Evaluations</p>
              <p className="text-2xl font-bold">Live</p>
            </div>
            <div className="w-8 h-8 bg-blue-500/80 text-white rounded-md flex items-center justify-center border border-blue-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-300 absolute bottom-4 right-4" />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Active Job Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Active Requisitions</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-xl" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium font-mono text-sm underline underline-offset-4 decoration-amber-300">No active jobs found in Atlas Cluster.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => {
              const jobApplicants = profiles.filter(p => p.appliedJobs?.includes(job.id));
              const displayAvatars = jobApplicants.slice(0, 3);
              
              return (
              <div key={job.id || index} className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow flex flex-col">
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                      {job.experienceLevel || 'Senior'}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-y-2 text-xs text-slate-500 mb-4">
                    <span className="flex items-center mr-4 bg-slate-100 px-2 py-0.5 rounded">
                      <Briefcase className="w-3 h-3 mr-1.5 opacity-60" />
                      Full-time
                    </span>
                    <span className="flex items-center bg-slate-100 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 mr-1.5 opacity-60" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.requiredSkills?.slice(0, 4).map((skill: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {(job.requiredSkills?.length || 0) > 4 && (
                      <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                        +{(job.requiredSkills?.length || 0) - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                       {displayAvatars.map((profile, i) => (
                         <div key={profile.id || i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 z-10">
                           {profile.firstName?.[0] || ''}{profile.lastName?.[0] || ''}
                         </div>
                       ))}
                       {jobApplicants.length === 0 && (
                         <div className="w-8 h-8 rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 z-10" />
                       )}
                       {jobApplicants.length > 3 && (
                         <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center z-0">
                           +{jobApplicants.length - 3}
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{job.applicantCount || 0} Candidates</p>
                      <button 
                        onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(window.location.origin + '/apply/' + job.id); }}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-bold tracking-wide uppercase flex items-center hover:bg-blue-50 px-2 py-0.5 rounded transition"
                      >
                        <span className="mr-1">🔗</span> Copy Apply Link
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-md">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 px-3 py-1.5 rounded-md font-bold text-[13px] transition-all shadow-sm active:scale-95"
                  >
                    <span>Analyze Pipeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
