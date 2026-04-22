'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { api } from '@/services/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/jobs')
      .then(res => setJobs(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>
      
      <header className="flex justify-between items-end pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Jobs Hub</h1>
          <p className="text-slate-500 mt-1">Manage, filter, and track all active job postings.</p>
        </div>
        <Link href="/jobs/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Job
        </Link>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Job Title</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Candidates Pipeline</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No jobs configured.</td></tr>
            ) : jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800">{job.title}</td>
                <td className="px-6 py-4 text-slate-500">{job.department || 'General'}</td>
                <td className="px-6 py-4 text-slate-500">View Pipeline</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
