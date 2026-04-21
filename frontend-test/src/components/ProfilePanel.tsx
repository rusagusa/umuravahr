import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { UploadCloud, FileText, UserCircle } from 'lucide-react';

export default function ProfilePanel() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfiles = async () => {
    try {
      const data = await api.get('/api/profiles');
      setProfiles(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await api.postForm('/api/profiles/unstructured', formData);
      fetchProfiles();
    } catch (e) {
      alert('Failed to upload and parse resume. Check network.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-2">
      <div className="glass-card">
        <h2 className="mb-6 flex items-center gap-2">
          <UploadCloud size={20} className="text-muted" /> AI Resume Ingestion
        </h2>
        
        <p className="text-muted text-sm mb-6">
          Upload unstructured resume PDFs. Our Gemini Gateway will extract text and automatically construct a structured Umurava Talent Profile.
        </p>

        <div 
          className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={48} className="upload-icon mx-auto" />
          <h3 className="mb-2">Click or Drag PDF Resume</h3>
          <p className="text-muted text-sm">Processing handled entirely by server-side AI</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])} 
            style={{ display: 'none' }} 
            accept=".pdf,.txt,.csv" 
          />
          {loading && <div className="mt-4 gradient-text">Parsing with Gemini... Please wait.</div>}
        </div>
      </div>

      <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <h2 className="mb-6 flex items-center gap-2">
          <UserCircle size={20} className="text-muted" /> Registered Profiles ({profiles.length})
        </h2>
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
          {profiles.map((p) => (
            <div key={p.id} className="glass-card flex items-center justify-between" style={{ padding: '1rem' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="status-dot success"></span>
                  <strong className="text-primary">{p.firstName} {p.lastName}</strong>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <FileText size={14} /> {p.headline || 'No Headline'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted mb-1">{p.location || 'Unknown'}</div>
                <div className="flex gap-2">
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    {p.skills?.length || 0} Skills
                  </span>
                </div>
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <div className="text-center text-muted mt-4">Upload a resume to ingest a profile.</div>
          )}
        </div>
      </div>
    </div>
  );
}
