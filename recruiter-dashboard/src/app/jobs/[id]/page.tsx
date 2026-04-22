'use client';

import { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, UploadCloud, Code, ArrowLeft, Briefcase, FileText, UserCircle } from 'lucide-react';
import { api } from '@/services/api';

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCandidates = () => {
    api.get('/api/profiles')
      .then(res => setCandidates(res.data || res))
      .catch(console.error);
  };

  useEffect(() => {
    api.get(`/api/jobs/${id}`)
      .then(res => setJob(res.data || res))
      .catch(console.error);
    fetchCandidates();
  }, [id]);

  const handleJsonImport = async () => {
    try {
      setLoading(true);
      const parsed = JSON.parse(jsonInput);
      await api.post('/api/profiles/structured', parsed);
      alert('Structured profiles ingested successfully!');
      setJsonInput('');
      fetchCandidates();
    } catch (e: any) {
      alert(`Import Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('resume', file);
      await api.postForm('/api/profiles/unstructured', formData);
      alert('Unstructured resume securely parsed and mapped via Gemini!');
      fetchCandidates();
    } catch (e: any) {
       try {
         const serverError = JSON.parse(e.message);
         alert(`Validation Error: ${serverError.message}\n${JSON.stringify(serverError.errors || {})}`);
       } catch {
         alert('Failed to upload/parse resume. Check console.');
       }
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  if (!job) {
     return <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse text-slate-500">Loading Job Specification...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            {job.department || 'General'}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{job.title}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">{job.description}</p>
          <div className="mt-4 flex gap-2 flex-wrap">
            {job.requiredSkills?.map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <Link 
          href={`/jobs/${id}/shortlist`} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0 group"
        >
          <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Run AI Screening
        </Link>
      </header>

      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">Candidate Ingestion Hub</h2>
          <p className="text-slate-500 text-sm mt-1">Upload unstructured PDFs for Gemini parsing, or directly paste structured schema output.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Scenario 1: Structured JSON */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                Raw JSON Injection
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Instantly map pre-structured candidate arrays into the Pipeline matching the `ProfileOutput` schema.
              </p>
              <textarea 
                className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-slate-400"
                placeholder={'[\n  {\n    "firstName": "John",\n    "lastName": "Doe",\n    "skills": [...]\n  }\n]'}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                onClick={handleJsonImport}
                disabled={loading || !jsonInput}
              >
                {loading ? 'Processing...' : 'Import JSON Array'}
              </button>
            </div>
          </div>

          {/* Scenario 2: Unstructured PDF */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                AI Document Parsing
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Drag and drop PDF resumes. The Gemini Gateway will automatically extract variables into the rigid schema standard.
              </p>
              
              <div 
                className={`flex-1 cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600 shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">Click to browse or drag PDF here</h4>
                <p className="text-xs text-slate-500 text-center max-w-[250px]">
                  Supports PDF format up to 10MB. Content will be sent to Vertex AI for extraction.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.txt,.csv" 
                />
                {loading && <div className="mt-4 text-sm font-bold text-indigo-600 animate-pulse">Running AI extraction... Please wait.</div>}
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="pt-6 border-t border-slate-200">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-6">Imported Applicant Profiles</h2>
        {candidates.length === 0 ? (
          <div className="text-center bg-slate-50 border border-slate-200 rounded-xl py-12 text-slate-500 text-sm">
            No applicants processed yet. Inject JSON or upload PDFs above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates.map((cand) => (
              <div key={cand.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {cand.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{cand.firstName} {cand.lastName}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{cand.headline || 'No Headline'}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100">
                  <span className="font-semibold block mb-1">Skills:</span>
                  {cand.skills?.slice(0, 4).join(', ')} {cand.skills?.length > 4 && '...'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
