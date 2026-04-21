import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, LayoutList, Briefcase, Calendar, MapPin, Layers } from 'lucide-react';

export default function JobPanel() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Senior Frontend Engineer',
    description: 'Looking for a React expert to build premium interfaces.',
    department: 'Engineering',
    location: 'Remote',
    requiredSkills: 'React, TypeScript, CSS',
    experienceLevel: 'Senior',
  });

  const fetchJobs = async () => {
    try {
      const data = await api.get('/api/jobs');
      setJobs(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/jobs', {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()),
        weights: { skills: 40, experience: 30, education: 20, projects: 10 },
      });
      fetchJobs();
    } catch (e) {
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2">
      <div className="glass-card">
        <h2 className="mb-6 flex items-center gap-2">
          <Plus size={20} className="text-muted" /> Create Job Profile
        </h2>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Job Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label>Department</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Required Skills (comma separated)</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.requiredSkills}
              onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Deploy Job Profile'}
          </button>
        </form>
      </div>

      <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <h2 className="mb-6 flex items-center gap-2">
          <LayoutList size={20} className="text-muted" /> Active Jobs ({jobs.length})
        </h2>
        <div className="grid">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card" style={{ padding: '1rem' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="gradient-text">{job.title}</h3>
                <span className="text-sm text-muted">ID: {job.id.substring(0,8)}...</span>
              </div>
              <div className="flex gap-4 text-sm text-muted mb-4">
                <span className="flex items-center gap-2"><Briefcase size={14}/> {job.department}</span>
                <span className="flex items-center gap-2"><MapPin size={14}/> {job.location}</span>
                <span className="flex items-center gap-2"><Calendar size={14}/> {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-muted" />
                <div className="flex" style={{ gap: '0.25rem', flexWrap: 'wrap' }}>
                  {job.requiredSkills.map((s: string, i: number) => (
                    <span key={i} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center text-muted mt-4">No jobs created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
