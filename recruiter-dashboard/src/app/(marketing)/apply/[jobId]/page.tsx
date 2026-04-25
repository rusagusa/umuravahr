'use client';
import React, { useState, useEffect, use } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  MapPin, 
  Briefcase, 
  Plus, 
  Trash2, 
  Globe, 
  Calendar,
  X
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/services/api';

type Proficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
type LangProficiency = 'Basic' | 'Conversational' | 'Fluent' | 'Native';

interface TalentProfile {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  availability: {
    status: 'Available' | 'Open' | 'Not Available';
    type: 'Full-time' | 'Part-time' | 'Contract';
    startDate: string;
  };
  socialLinks: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
  skills: { name: string; level: Proficiency; yearsOfExperience: number }[];
  languages: { name: string; proficiency: LangProficiency }[];
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
    isCurrent: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
  }[];
  certifications: { name: string; issuer: string; issueDate: string }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link: string;
    startDate: string;
    endDate: string;
  }[];
}

export default function HybridApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  
  // Job Data State
  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState<string | null>(null);

  // Form State
  const [appState, setAppState] = useState<'idle' | 'parsing' | 'success'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [profile, setProfile] = useState<TalentProfile>({
    firstName: '',
    lastName: '',
    email: '',
    headline: '',
    bio: '',
    location: '',
    availability: {
      status: 'Open',
      type: 'Full-time',
      startDate: ''
    },
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    },
    skills: [],
    languages: [],
    experience: [],
    education: [],
    certifications: [],
    projects: []
  });

  useEffect(() => {
    api.get(`/api/jobs/${jobId}`)
      .then(res => setJob(res.data || res))
      .catch(() => setJobError('Failed to load job details.'))
      .finally(() => setLoadingJob(false));
  }, [jobId]);

  // AI Simulation
  const simulateAIParsing = () => {
    setAppState('parsing');
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        headline: 'Senior Full Stack Engineer | Node.js & React Specialist',
        location: 'Kigali, Rwanda',
        bio: 'Passionate software engineer with 6+ years of experience building scalable web applications and distributed systems.',
        availability: {
          ...prev.availability,
          status: 'Available',
          startDate: '2024-06-01'
        },
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          portfolio: 'https://johndoe.dev'
        },
        skills: [
          { name: 'Node.js', level: 'Expert', yearsOfExperience: 5 },
          { name: 'React', level: 'Expert', yearsOfExperience: 4 },
          { name: 'MongoDB', level: 'Advanced', yearsOfExperience: 3 }
        ],
        experience: [
          {
            company: 'TechFlow Systems',
            role: 'Senior Software Engineer',
            startDate: '2021-01',
            endDate: '',
            description: 'Leading the development of a microservices-based SaaS platform.',
            technologies: ['Node.js', 'Typescript', 'AWS', 'Docker'],
            isCurrent: true
          }
        ],
        education: [
          {
            institution: 'University of Rwanda',
            degree: 'Bachelors',
            fieldOfStudy: 'Computer Science',
            startYear: '2014',
            endYear: '2018'
          }
        ]
      }));
      setAppState('idle');
    }, 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResumeFile(e.target.files[0]);
      simulateAIParsing();
    }
  };

  const updateField = (path: string, value: any) => {
    setProfile(prev => {
      const keys = path.split('.');
      const newProfile = { ...prev };
      let current: any = newProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newProfile;
    });
  };

  const addArrayItem = (key: keyof TalentProfile, item: any) => {
    setProfile(prev => ({ ...prev, [key]: [...(prev[key] as any[]), item] }));
  };

  const removeArrayItem = (key: keyof TalentProfile, index: number) => {
    setProfile(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== index)
    }));
  };

  const isFormValid = profile.firstName && profile.lastName && profile.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('profileData', JSON.stringify(profile));
      formData.append('jobId', jobId);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      
      await api.postForm('/api/profiles/unstructured', formData);
      setAppState('success');
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (appState === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thank you, {profile.firstName}! Your profile has been created and our AI team is reviewing your application for the {job?.title} position.
          </p>
          <Link href="/" className="inline-block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
            Go back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-6 lg:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">U</div>
             <span className="font-bold text-xl text-slate-900">Umurava</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-blue-600">Browse Jobs</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Job Details Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:h-fit">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              {loadingJob ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-8 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-24 bg-slate-100 rounded"></div>
                </div>
              ) : job ? (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                      {job.experienceLevel || 'Open Role'}
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {job.location || 'Remote'}</span>
                      <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1" /> Full-time</span>
                    </div>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="prose prose-slate text-sm text-slate-600 leading-relaxed max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="whitespace-pre-wrap">{job.description}</p>
                  </div>
                </div>
              ) : <p className="text-red-500">{jobError}</p>}
            </div>
          </div>

          {/* Application Form Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* AI Dropzone */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-8 text-center hover:bg-blue-50/30 transition-colors group relative overflow-hidden">
               {appState === 'parsing' && (
                 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in">
                    <div className="relative mb-4">
                       <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
                       <Loader2 className="w-10 h-10 text-blue-300 absolute inset-0 animate-spin opacity-50" />
                    </div>
                    <p className="text-blue-700 font-bold">✨ AI is reading your CV...</p>
                 </div>
               )}
               
               <UploadCloud className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-bold text-slate-900 mb-2">Fast Track: Auto-fill with your CV</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                 Drop your PDF resume here and watch the entire form populate autonomously in seconds.
               </p>
               <label className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition-all shadow-md shadow-blue-200">
                 Choose PDF File
                 <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
               </label>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-10 pb-20">
              
              {/* Basic Info */}
              <section className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                      <input required value={profile.firstName} onChange={e => updateField('firstName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Jane" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                      <input required value={profile.lastName} onChange={e => updateField('lastName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Smith" />
                   </div>
                   <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                      <input required type="email" value={profile.email} onChange={e => updateField('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="jane@example.com" />
                   </div>
                   <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Headline <span className="text-red-500">*</span></label>
                      <input required value={profile.headline} onChange={e => updateField('headline', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Senior Full Stack Engineer | React & Node.js" />
                   </div>
                   <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Location <span className="text-red-500">*</span></label>
                      <input required value={profile.location} onChange={e => updateField('location', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Kigali, Rwanda" />
                   </div>
                   <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Short Bio</label>
                      <textarea rows={4} value={profile.bio} onChange={e => updateField('bio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Tell us about your professional journey..." />
                   </div>
                </div>
              </section>

              {/* Availability & Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Availability */}
                 <section className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> Availability</h3>
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Job Status</label>
                        <select value={profile.availability.status} onChange={e => updateField('availability.status', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none">
                          <option>Available</option>
                          <option>Open</option>
                          <option>Not Available</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                        <select value={profile.availability.type} onChange={e => updateField('availability.type', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none">
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                        <input type="date" value={profile.availability.startDate} onChange={e => updateField('availability.startDate', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
                      </div>
                   </div>
                 </section>

                 {/* Social Links */}
                 <section className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Web & Social</h3>
                   <div className="space-y-4">
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input value={profile.socialLinks.linkedin} onChange={e => updateField('socialLinks.linkedin', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-10 text-sm outline-none" placeholder="LinkedIn URL" />
                      </div>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input value={profile.socialLinks.github} onChange={e => updateField('socialLinks.github', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-10 text-sm outline-none" placeholder="GitHub URL" />
                      </div>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input value={profile.socialLinks.portfolio} onChange={e => updateField('socialLinks.portfolio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pl-10 text-sm outline-none" placeholder="Portfolio/Personal Site" />
                      </div>
                   </div>
                 </section>
              </div>

              {/* Dynamic Arrays (Experience, etc.) */}
              <section className="space-y-8">
                
                {/* Skills */}
                <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold text-slate-900">Skills</h3>
                      <button type="button" onClick={() => addArrayItem('skills', { name: '', level: 'Intermediate', yearsOfExperience: 0 })} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Skill
                      </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.skills.map((skill, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-4">
                           <div className="flex-1 space-y-3">
                              <input value={skill.name} onChange={e => {
                                const newSkills = [...profile.skills];
                                newSkills[idx].name = e.target.value;
                                updateField('skills', newSkills);
                              }} placeholder="Skill name" className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none" />
                              <div className="flex gap-2">
                                 <select value={skill.level} onChange={e => {
                                    const newSkills = [...profile.skills];
                                    newSkills[idx].level = e.target.value as Proficiency;
                                    updateField('skills', newSkills);
                                 }} className="bg-white border border-slate-200 rounded p-1 text-[10px] outline-none">
                                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                                 </select>
                                 <input type="number" value={skill.yearsOfExperience} onChange={e => {
                                    const newSkills = [...profile.skills];
                                    newSkills[idx].yearsOfExperience = parseInt(e.target.value);
                                    updateField('skills', newSkills);
                                 }} className="w-16 bg-white border border-slate-200 rounded p-1 text-[10px] outline-none" placeholder="Yrs" />
                              </div>
                           </div>
                           <button type="button" onClick={() => removeArrayItem('skills', idx)} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Experience */}
                <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold text-slate-900">Experience</h3>
                      <button type="button" onClick={() => addArrayItem('experience', { company: '', role: '', startDate: '', endDate: '', description: '', technologies: [], isCurrent: false })} className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Experience
                      </button>
                   </div>
                   <div className="space-y-4">
                      {profile.experience.map((exp, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
                                 <input value={exp.company} onChange={e => {
                                    const nextMap = [...profile.experience];
                                    nextMap[idx].company = e.target.value;
                                    updateField('experience', nextMap);
                                 }} placeholder="Company" className="bg-white border border-slate-200 rounded p-2 text-xs outline-none" />
                                 <input value={exp.role} onChange={e => {
                                    const nextMap = [...profile.experience];
                                    nextMap[idx].role = e.target.value;
                                    updateField('experience', nextMap);
                                 }} placeholder="Role" className="bg-white border border-slate-200 rounded p-2 text-xs outline-none" />
                              </div>
                              <button type="button" onClick={() => removeArrayItem('experience', idx)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                           </div>
                           <textarea value={exp.description} onChange={e => {
                                 const nextMap = [...profile.experience];
                                 nextMap[idx].description = e.target.value;
                                 updateField('experience', nextMap);
                           }} placeholder="Key results and impact..." className="w-full bg-white border border-slate-200 rounded p-3 text-xs outline-none resize-none h-20" />
                        </div>
                      ))}
                   </div>
                </div>

              </section>

              {/* Submit Action */}
              <div className="pt-8">
                 {submitError && <p className="text-red-500 text-sm mb-4 font-bold">{submitError}</p>}
                 <button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
                 >
                   {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                     <>
                        Submit Application & Create Umurava Profile
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                     </>
                   )}
                 </button>
                 <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
                   By submitting, you agree to our Terms of Service and joining the vetted Umurava Talent Pool. 
                   Our AI will process your data securely.
                 </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
