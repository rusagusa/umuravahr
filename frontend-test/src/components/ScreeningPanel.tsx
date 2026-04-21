import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Target, Play, CheckCircle, XCircle } from 'lucide-react';

export default function ScreeningPanel() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await api.get('/api/jobs');
      setJobs(data.data || []);
      if (data.data?.length > 0) setSelectedJob(data.data[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchShortlist = async (jobId: string) => {
    if (!jobId) return;
    try {
      const data = await api.get(`/api/screenings/${jobId}/shortlist?topN=10`);
      setShortlist(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchShortlist(selectedJob);
  }, [selectedJob]);

  const handleEvaluate = async () => {
    if (!selectedJob) return;
    setEvaluating(true);
    setShortlist([]);
    try {
      await api.post(`/api/screenings/evaluate/${selectedJob}`, {});
      await fetchShortlist(selectedJob);
    } catch (e) {
      alert('Failed to run AI evaluation. Check server logic.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="grid grid-cols-2">
      {/* Control Panel */}
      <div className="glass-card">
        <h2 className="mb-6 flex items-center gap-2">
          <Target size={20} className="text-muted" /> Evaluation Engine
        </h2>
        
        <div className="form-group mb-6">
          <label>Target Job Context</label>
          <select 
            className="form-control" 
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="" disabled>Select a Job...</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        <div className="p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-sm text-muted mb-2">Gemini 2.5-flash Orchestrator</h3>
          <p className="text-sm mb-6 text-muted">
            Clicking evaluate will send all unstructured candidate data to the Gemini logic engine, computing rankings against the Umurava AI schema matrix.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            onClick={handleEvaluate}
            disabled={evaluating || !selectedJob}
          >
            {evaluating ? (
              <span className="animate-pulse">Processing Candidates...</span>
            ) : (
              <> <Play size={16} /> Run Full Evaluation Batch </>
            )}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', overflowY: 'auto', maxHeight: '70vh' }}>
        <h2 className="mb-6 flex items-center justify-between">
          <span>Shortlist Matrix</span>
          <span className="text-sm text-muted font-normal">{shortlist.length} Processed</span>
        </h2>
        
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {shortlist.length === 0 && !evaluating && selectedJob && (
            <div className="text-center text-muted mt-8 p-8" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              No evaluations found for this job. Run the engine.
            </div>
          )}
          
          {shortlist.map((result, idx) => (
            <div key={result.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`score-badge ${result.matchScore > 80 ? 'high' : result.matchScore > 50 ? 'medium' : 'low'}`}>
                    {result.matchScore}
                  </div>
                  <div>
                    <h3 className="gradient-text" style={{ fontSize: '1.1rem' }}>Candidate #{idx + 1}</h3>
                    <div className="text-xs text-muted">ID: {result.profileId}</div>
                  </div>
                </div>
                <div className="text-sm font-medium" style={{ color: result.matchScore > 80 ? '#10b981' : '#eab308' }}>
                  {result.finalRecommendation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="flex items-center gap-1 text-sm text-muted mb-2"><CheckCircle size={14} color="#10b981"/> Key Strengths</h4>
                  <ul className="custom-bullets">
                    {result.strengths.slice(0, 3).map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-1 text-sm text-muted mb-2"><XCircle size={14} color="#eab308"/> Identified Gaps</h4>
                  <ul className="custom-bullets gaps">
                    {result.gaps.slice(0, 3).map((g: string, i: number) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
