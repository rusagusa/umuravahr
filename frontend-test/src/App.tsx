import { useState } from 'react';
import { Briefcase, Users, BrainCircuit } from 'lucide-react';
import JobPanel from './components/JobPanel';
import ProfilePanel from './components/ProfilePanel';
import ScreeningPanel from './components/ScreeningPanel';

function App() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'profiles' | 'screening'>('jobs');

  return (
    <div className="app-container">
      <header>
        <h1>
          <BrainCircuit className="gradient-text" size={32} />
          <span>Umurava <span className="gradient-text">AI Simulator</span></span>
        </h1>
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <Briefcase size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Jobs Engine
          </button>
          <button 
            className={`nav-tab ${activeTab === 'profiles' ? 'active' : ''}`}
            onClick={() => setActiveTab('profiles')}
          >
            <Users size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Candidates Tracker
          </button>
          <button 
            className={`nav-tab ${activeTab === 'screening' ? 'active' : ''}`}
            onClick={() => setActiveTab('screening')}
          >
            <BrainCircuit size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            AI Screening
          </button>
        </div>
      </header>

      <main className="animate-fade-in">
        {activeTab === 'jobs' && <JobPanel />}
        {activeTab === 'profiles' && <ProfilePanel />}
        {activeTab === 'screening' && <ScreeningPanel />}
      </main>
    </div>
  );
}

export default App;
