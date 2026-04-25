'use client';

import { useState } from 'react';
import { use } from 'react';
import { api } from '@/services/api';
import { UploadCloud, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobId', jobId);

    try {
      await api.postForm('/api/profiles/apply/pdf', formData);
      setSuccess(true);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Received!</h1>
        <p className="text-slate-500 max-w-md text-center">Your resume has been successfully parsed by Gemini and entered into the Umurava Talent Pool.</p>
        <Link href={`/jobs/${jobId}/shortlist`} className="mt-8 text-blue-600 hover:underline">
          Return to Dashboard to view Candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Apply as External Candidate</h1>
        <p className="text-slate-500 mt-1">Upload a PDF resume. Gemini will extract it and map it to the exact structural profile.</p>
      </header>

      <form onSubmit={handleApply} className="bg-white border rounded-xl p-8 shadow-sm text-center">
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              required
            />
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 font-medium">{file ? file.name : "Drag & drop PDF here or click to browse"}</p>
            <p className="text-xs text-slate-400 mt-2">Max 5MB PDF limitation</p>
        </div>

        <button 
          disabled={!file || uploading} 
          type="submit"
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 transition-colors hover:bg-blue-700 shadow-sm"
        >
          {uploading ? 'Interrogating PDF with Gemini...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
