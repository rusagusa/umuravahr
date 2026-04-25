'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/services/api';

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return alert("Title and Description required");

    try {
      setLoading(true);
      await api.post('/api/jobs', {
        title,
        department,
        description,
        experienceLevel,
        requiredSkills: skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      alert('Job created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      alert(`Error creating job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Post New Job</h1>
        <p className="text-slate-500 mt-1">Define the requirements to calibrate the AI Screening Engine.</p>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Job Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={loading} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Lead Product Designer" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department/Section</label>
              <input type="text" value={department} onChange={e => setDepartment(e.target.value)} disabled={loading} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Design" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Experience Level</label>
              <select 
                value={experienceLevel} 
                onChange={e => setExperienceLevel(e.target.value)} 
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Junior">Junior (0-2 years)</option>
                <option value="Mid">Mid Level (3-5 years)</option>
                <option value="Senior">Senior (6+ years)</option>
                <option value="Lead">Lead / Manager</option>
                <option value="Principal">Principal Engineer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Required Skills (comma separated)</label>
              <input type="text" value={skills} onChange={e => setSkills(e.target.value)} disabled={loading} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="React, Figma, User Research" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Detailed Job Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={loading} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-y" placeholder="Describe the responsibilities..." />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Job Spec'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
