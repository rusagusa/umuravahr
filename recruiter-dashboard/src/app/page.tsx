'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Eye, MoreHorizontal, Briefcase, ChevronRight } from 'lucide-react';
import { api } from '@/services/api';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/jobs')
      .then(res => setJobs(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of active recruitment pipelines.</p>
        </div>
        <Link href="/jobs/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Post New Job
        </Link>
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">Active Jobs ({jobs.length})</h2>
          <button className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center transition-colors">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-10 text-slate-500">Loading pipelines...</div>
          ) : jobs.length === 0 ? (
            <div className="col-span-3 text-center py-10 text-slate-500">No active jobs found. Create one.</div>
          ) : jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold mb-3">
                  {job.department || 'General'}
                </div>
                <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug mb-1">
                {job.title}
              </h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                ID: {job.id}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold">Track Pipeline</span>
                </div>
                
                <Link 
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
