/**
 * In-memory fallback DataStore used when Firestore is not available.
 * This is the local development / offline fallback only.
 * In production (Firebase Functions), Firestore is always used.
 */

interface Skill {
  name: string;
  level: string;
  yearsOfExperience: number;
}

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  location: string;
  skills: Skill[];
  experience: any[];
  education: any[];
  projects: any[];
  availability: { status: string; type: string };
  evaluations?: any[];
  [key: string]: any;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  requirements: string[];
  status: string;
  weights: { skills: number; experience: number; education: number; projects: number };
  [key: string]: any;
}

export const DataStore: { jobs: Job[]; candidates: Candidate[] } = {
  jobs: [
    {
      _id: '1',
      title: 'Senior Node.js Backend Engineer',
      description: 'Looking for a robust Node.js backend developer to handle AI API integrations and microservices.',
      department: 'Engineering',
      location: 'Remote (Kigali)',
      requirements: ['Node.js', 'Express', 'TypeScript', 'REST APIs', 'System Architecture'],
      status: 'Open',
      weights: { skills: 40, experience: 40, education: 10, projects: 10 },
    },
    {
      _id: '2',
      title: 'AI Prompt Engineer',
      description: 'Specialist in crafting high-yield prompts for Gemini models and evaluating LLM outputs.',
      department: 'Data & AI',
      location: 'Kigali, Rwanda',
      requirements: ['LLMs', 'Gemini API', 'Prompt Engineering', 'Python', 'Data Analytics'],
      status: 'Open',
      weights: { skills: 50, experience: 20, education: 10, projects: 20 },
    },
    {
      _id: '3',
      title: 'Frontend Next.js Developer',
      description: 'Seeking a Next.js / React developer with a strong eye for UI/UX and Redux state management.',
      department: 'Engineering',
      location: 'Remote',
      requirements: ['React', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'TypeScript'],
      status: 'Open',
      weights: { skills: 45, experience: 25, education: 15, projects: 15 },
    },
  ],
  candidates: [
    {
      _id: 'c1',
      firstName: 'Jean',
      lastName: 'Claude',
      email: 'jean.claude@example.com',
      headline: 'Senior Backend Developer — Node.js & AI Systems',
      location: 'Kigali, Rwanda',
      skills: [
        { name: 'Node.js', level: 'Advanced', yearsOfExperience: 5 },
        { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 4 },
        { name: 'MongoDB', level: 'Intermediate', yearsOfExperience: 3 },
      ],
      experience: [],
      education: [],
      projects: [],
      availability: { status: 'Available', type: 'Full-time' },
      evaluations: [],
    },
    {
      _id: 'c2',
      firstName: 'Alice',
      lastName: 'Mugisha',
      email: 'alice.m@example.com',
      headline: 'AI Prompt Engineer — Gemini & LLM Specialist',
      location: 'Nairobi, Kenya',
      skills: [
        { name: 'Python', level: 'Advanced', yearsOfExperience: 5 },
        { name: 'Gemini API', level: 'Expert', yearsOfExperience: 2 },
      ],
      experience: [],
      education: [],
      projects: [],
      availability: { status: 'Available', type: 'Full-time' },
      evaluations: [],
    },
  ],
};
