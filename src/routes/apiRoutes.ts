import { Router, Request, Response } from 'express';
import { FieldPath } from 'firebase-admin/firestore';
import { parseResumeToProfile, evaluateCandidate, evaluateCandidatesBatch } from '../services/geminiService';
import { DataStore } from '../dataStore';
import { getFirebase } from '../config/firebase';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Umurava AI API is active. Use endpoints like /api/jobs or /api/candidates.' });
});

// ─────────────────────────────────────────────
// RESUME INGESTION: POST /api/ingest
// Accepts a base64-encoded PDF, parses it with Gemini,
// returns a structured Umurava Talent Profile.
// ─────────────────────────────────────────────
router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const base64Data = req.body.resumeBase64;
    if (!base64Data) {
      return res.status(400).json({ error: 'No resumeBase64 data provided' });
    }

    const fileBuffer = Buffer.from(base64Data, 'base64');

    // pdf-parse loaded lazily to keep serverless cold start fast
    const pdfParse = require('pdf-parse');
    let textObj: any = '';
    
    try {
      const pdfData = await pdfParse(fileBuffer);
      textObj = pdfData.text;
    } catch {
      // Fallback: If it's not a valid PDF (e.g., a .txt file), just read the raw utf8
      textObj = fileBuffer.toString('utf8');
    }

    const structuredProfile = await parseResumeToProfile(textObj);

    return res.json({ message: 'Parsed successfully', profile: structuredProfile });
  } catch (error) {
    console.error('Ingest Error:', error);
    return res.status(500).json({ error: 'Failed to process resume. Check Gemini API key.' });
  }
});

// ─────────────────────────────────────────────
// EVALUATE SINGLE: POST /api/evaluate/:candidateId/:jobId
// Runs Gemini evaluation for one candidate vs. one job.
// ─────────────────────────────────────────────
router.post('/evaluate/:candidateId/:jobId', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  const { candidateId, jobId } = req.params;

  try {
    let candidate: any = null;
    let job: any = null;
    let candidateRef: FirebaseFirestore.DocumentReference | null = null;

    if (isFirebaseActive && db) {
      const [jobDoc, candDoc] = await Promise.all([
        db.collection('jobs').doc(jobId).get(),
        db.collection('candidates').doc(candidateId).get(),
      ]);
      if (!jobDoc.exists || !candDoc.exists) {
        return res.status(404).json({ error: 'Candidate or Job not found in Firestore' });
      }
      job = { _id: jobDoc.id, ...jobDoc.data() };
      candidate = { _id: candDoc.id, ...candDoc.data() };
      candidateRef = db.collection('candidates').doc(candidateId);
    } else {
      candidate = DataStore.candidates.find((c) => c._id === candidateId);
      job = DataStore.jobs.find((j) => j._id === jobId);
    }

    if (!candidate || !job) {
      return res.status(404).json({ error: 'Candidate or Job not found' });
    }

    const evaluationResult = await evaluateCandidate(candidate, job);

    // Merge new evaluation, replacing any previous result for this jobId
    const prevEvals: any[] = candidate.evaluations || [];
    const newEvals = [
      ...prevEvals.filter((ev: any) => ev.jobId !== jobId),
      { jobId, ...evaluationResult },
    ];

    if (isFirebaseActive && db && candidateRef) {
      await candidateRef.update({ evaluations: newEvals });
    } else {
      candidate.evaluations = newEvals;
    }

    return res.json({ message: 'Evaluation complete', evaluation: evaluationResult });
  } catch (error) {
    console.error('Evaluate Error:', error);
    return res.status(500).json({ error: 'Failed to evaluate candidate', details: String(error) });
  }
});

// ─────────────────────────────────────────────
// BATCH EVALUATE: POST /api/evaluate/batch/:jobId
// Evaluates multiple candidates against one job sequentially.
// ─────────────────────────────────────────────
router.post('/evaluate/batch/:jobId', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  const { jobId } = req.params;
  const { candidateIds } = req.body;

  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return res.status(400).json({ error: 'candidateIds must be a non-empty array' });
  }

  try {
    let job: any = null;

    if (isFirebaseActive && db) {
      const jobDoc = await db.collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) return res.status(404).json({ error: 'Job not found' });
      job = { _id: jobDoc.id, ...jobDoc.data() };
    } else {
      job = DataStore.jobs.find((j) => j._id === jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });
    }

    // Fetch all candidates at once
    const candidates: any[] = [];
    if (isFirebaseActive && db) {
      const snap = await db.collection('candidates').where(FieldPath.documentId(), 'in', candidateIds).get();
      snap.forEach(doc => candidates.push({ _id: doc.id, ...doc.data() }));
    } else {
      candidateIds.forEach(id => {
        const c = DataStore.candidates.find(cand => cand._id === id);
        if (c) candidates.push(c);
      });
    }

    if (candidates.length === 0) {
      return res.status(404).json({ error: 'No valid candidates found from the provided IDs' });
    }

    // Single AI call for all candidates
    const evaluations = await evaluateCandidatesBatch(candidates, job);
    
    // Update results in DB
    const results = [];
    for (const evalResult of evaluations) {
      const { candidateId, ...rest } = evalResult;
      const candidate = candidates.find(c => c._id === candidateId);
      
      if (candidate) {
        const prevEvals = candidate.evaluations || [];
        const newEvals = [
          ...prevEvals.filter((ev: any) => ev.jobId !== jobId),
          { jobId, ...rest },
        ];

        if (isFirebaseActive && db) {
          await db.collection('candidates').doc(candidateId).update({ evaluations: newEvals });
        } else {
          candidate.evaluations = newEvals;
        }
        results.push({ candidateId, status: 'success', evaluation: rest });
      }
    }

    return res.json({ message: 'Batch evaluation complete', results });
  } catch (error) {
    console.error('Batch Evaluate Error:', error);
    return res.status(500).json({ error: 'Batch evaluation failed', details: String(error) });
  }
});

// ─────────────────────────────────────────────
// JOBS CRUD
// ─────────────────────────────────────────────
router.get('/jobs', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  if (isFirebaseActive && db) {
    try {
      const snap = await db.collection('jobs').get();
      return res.json(snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Firestore Error (GET /jobs):', err);
    }
  }
  return res.json(DataStore.jobs);
});

router.post('/jobs', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  if (isFirebaseActive && db) {
    try {
      const docRef = await db.collection('jobs').add(req.body);
      return res.json({ _id: docRef.id, ...req.body });
    } catch (err) {
      console.error('Firestore Error (POST /jobs):', err);
    }
  }
  const newJob = { _id: Date.now().toString(), ...req.body };
  DataStore.jobs.push(newJob as any);
  return res.json(newJob);
});

router.delete('/jobs/:jobId', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  const { jobId } = req.params;
  if (isFirebaseActive && db) {
    try {
      await db.collection('jobs').doc(jobId).delete();
      return res.json({ message: 'Job deleted' });
    } catch (err) {
      console.error('Firestore Error (DELETE /jobs):', err);
    }
  }
  DataStore.jobs = (DataStore.jobs as any[]).filter((j: any) => j._id !== jobId);
  return res.json({ message: 'Job deleted' });
});

// ─────────────────────────────────────────────
// CANDIDATES CRUD
// ─────────────────────────────────────────────
router.get('/candidates', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  if (isFirebaseActive && db) {
    try {
      const snap = await db.collection('candidates').get();
      return res.json(snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Firestore Error (GET /candidates):', err);
    }
  }
  return res.json(DataStore.candidates);
});

router.post('/candidates', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  if (isFirebaseActive && db) {
    try {
      const docRef = await db.collection('candidates').add(req.body);
      return res.json({ _id: docRef.id, ...req.body });
    } catch (err) {
      console.error('Firestore Error (POST /candidates):', err);
    }
  }
  const newCand = { _id: Date.now().toString(), ...req.body };
  DataStore.candidates.push(newCand as any);
  return res.json(newCand);
});

router.delete('/candidates/:candidateId', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();
  const { candidateId } = req.params;
  if (isFirebaseActive && db) {
    try {
      await db.collection('candidates').doc(candidateId).delete();
      return res.json({ message: 'Candidate deleted' });
    } catch (err) {
      console.error('Firestore Error (DELETE /candidates):', err);
    }
  }
  DataStore.candidates = (DataStore.candidates as any[]).filter((c: any) => c._id !== candidateId);
  return res.json({ message: 'Candidate deleted' });
});

// ─────────────────────────────────────────────
// SEED: POST /api/seed
// Seeds Firestore with demo jobs and candidates for hackathon demo.
// ─────────────────────────────────────────────
router.post('/seed', async (req: Request, res: Response) => {
  const { db, isFirebaseActive } = getFirebase();

  const demoJobs = [
    {
      title: 'Senior Node.js Backend Engineer',
      description: 'Looking for a robust Node.js backend developer to handle AI API integrations and microservices at scale.',
      department: 'Engineering',
      location: 'Remote (Kigali)',
      requirements: ['Node.js', 'Express', 'TypeScript', 'REST APIs', 'System Architecture', 'Docker'],
      status: 'Open',
      weights: { skills: 40, experience: 40, education: 10, projects: 10 },
    },
    {
      title: 'AI Prompt Engineer',
      description: 'Specialist in crafting high-yield prompts for Gemini models and evaluating LLM outputs for production use.',
      department: 'Data & AI',
      location: 'Kigali, Rwanda',
      requirements: ['LLMs', 'Gemini API', 'Prompt Engineering', 'Python', 'Data Analytics', 'RAG'],
      status: 'Open',
      weights: { skills: 50, experience: 20, education: 10, projects: 20 },
    },
    {
      title: 'Frontend Next.js Developer',
      description: 'Seeking a Next.js / React developer with a strong eye for UI/UX and Redux state management for internal tools.',
      department: 'Engineering',
      location: 'Remote',
      requirements: ['React', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'TypeScript', 'Figma'],
      status: 'Open',
      weights: { skills: 45, experience: 25, education: 15, projects: 15 },
    },
  ];

  const demoCandidates = [
    {
      firstName: 'Jean',
      lastName: 'Claude',
      email: 'jean.claude@example.com',
      headline: 'Senior Backend Developer — Node.js & AI Systems',
      bio: 'Experienced backend engineer with a focus on scalable microservices and AI integrations.',
      location: 'Kigali, Rwanda',
      skills: [
        { name: 'Node.js', level: 'Advanced', yearsOfExperience: 5 },
        { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 4 },
        { name: 'MongoDB', level: 'Intermediate', yearsOfExperience: 3 },
        { name: 'Docker', level: 'Intermediate', yearsOfExperience: 2 },
      ],
      languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'French', proficiency: 'Native' }],
      experience: [
        {
          company: 'TechAfrica Ltd',
          role: 'Backend Engineer',
          'Start Date': '2021-03',
          'End Date': 'Present',
          description: 'Led development of RESTful microservices serving 50k+ daily users. Integrated third-party payment APIs.',
          technologies: ['Node.js', 'Express', 'MongoDB', 'Docker'],
          'Is Current': true,
        },
      ],
      education: [
        {
          institution: 'University of Rwanda',
          degree: "Bachelor's",
          'Field of Study': 'Computer Science',
          'Start Year': 2016,
          'End Year': 2020,
        },
      ],
      certifications: [],
      projects: [
        {
          name: 'Umurava AI Screener',
          description: 'AI-powered candidate screening platform built with Next.js and Gemini API.',
          technologies: ['Next.js', 'Node.js', 'Gemini API', 'Firestore'],
          role: 'Lead Backend Engineer',
          link: 'https://github.com/example/umurava-screener',
          'Start Date': '2026-01',
          'End Date': '2026-04',
        },
      ],
      availability: { status: 'Available', type: 'Full-time' },
      socialLinks: { linkedin: 'https://linkedin.com/in/jclaude', github: 'https://github.com/jclaude' },
      evaluations: [],
    },
    {
      firstName: 'Alice',
      lastName: 'Mugisha',
      email: 'alice.m@example.com',
      headline: 'AI Prompt Engineer — Gemini & LLM Specialist',
      bio: 'AI-first engineer specialized in designing and evaluating production LLM systems.',
      location: 'Nairobi, Kenya',
      skills: [
        { name: 'Python', level: 'Advanced', yearsOfExperience: 5 },
        { name: 'Gemini API', level: 'Expert', yearsOfExperience: 2 },
        { name: 'Prompt Engineering', level: 'Expert', yearsOfExperience: 3 },
        { name: 'Data Analytics', level: 'Intermediate', yearsOfExperience: 4 },
      ],
      languages: [{ name: 'English', proficiency: 'Native' }, { name: 'Swahili', proficiency: 'Fluent' }],
      experience: [
        {
          company: 'AI Solutions Africa',
          role: 'AI Engineer',
          'Start Date': '2022-06',
          'End Date': 'Present',
          description: 'Designed and deployed LLM pipelines for document summarization and HR screening systems.',
          technologies: ['Python', 'Gemini API', 'LangChain', 'Google Cloud'],
          'Is Current': true,
        },
      ],
      education: [
        {
          institution: 'University of Nairobi',
          degree: "Master's",
          'Field of Study': 'Artificial Intelligence',
          'Start Year': 2020,
          'End Year': 2022,
        },
      ],
      certifications: [
        { name: 'Google Cloud Professional ML Engineer', issuer: 'Google', 'Issue Date': '2023-11' },
      ],
      projects: [
        {
          name: 'Smart CV Parser',
          description: 'Gemini-powered CV parsing into structured JSON for ATS systems.',
          technologies: ['Python', 'Gemini API', 'FastAPI'],
          role: 'Lead AI Engineer',
          link: 'https://github.com/example/smart-cv',
          'Start Date': '2025-08',
          'End Date': '2025-12',
        },
      ],
      availability: { status: 'Open to Opportunities', type: 'Contract' },
      socialLinks: { linkedin: 'https://linkedin.com/in/alicemugisha', github: 'https://github.com/amugisha' },
      evaluations: [],
    },
    {
      firstName: 'Patrick',
      lastName: 'Nzeyimana',
      email: 'patrick.n@example.com',
      headline: 'Frontend Engineer — React, Next.js & UI Systems',
      bio: 'Creative frontend engineer passionate about building pixel-perfect, accessible UI systems.',
      location: 'Kigali, Rwanda',
      skills: [
        { name: 'React', level: 'Expert', yearsOfExperience: 4 },
        { name: 'Next.js', level: 'Advanced', yearsOfExperience: 3 },
        { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 3 },
        { name: 'Tailwind CSS', level: 'Expert', yearsOfExperience: 3 },
        { name: 'Redux Toolkit', level: 'Intermediate', yearsOfExperience: 2 },
      ],
      languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'Kinyarwanda', proficiency: 'Native' }],
      experience: [
        {
          company: 'Andela Rwanda',
          role: 'Frontend Engineer',
          'Start Date': '2022-01',
          'End Date': 'Present',
          description: 'Built and maintained React component libraries and Next.js applications for enterprise clients.',
          technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
          'Is Current': true,
        },
      ],
      education: [
        {
          institution: 'Carnegie Mellon University Africa',
          degree: "Master's",
          'Field of Study': 'Information Technology',
          'Start Year': 2019,
          'End Year': 2021,
        },
      ],
      certifications: [],
      projects: [
        {
          name: 'Umurava Dashboard',
          description: 'Designed the HR dashboard UI for the Umurava AI Hackathon platform.',
          technologies: ['Next.js', 'Tailwind CSS', 'Redux Toolkit', 'Framer Motion'],
          role: 'Lead Frontend Engineer',
          'Start Date': '2026-04',
          'End Date': '2026-04',
        },
      ],
      availability: { status: 'Available', type: 'Full-time' },
      socialLinks: { linkedin: 'https://linkedin.com/in/patricknz', github: 'https://github.com/patricknz' },
      evaluations: [],
    },
  ];

  try {
    if (isFirebaseActive && db) {
      const batch = db.batch();

      // Check if already seeded
      const existing = await db.collection('jobs').limit(1).get();
      if (!existing.empty) {
        return res.json({ message: 'Already seeded. Firestore already has data.' });
      }

      demoJobs.forEach((job) => {
        const ref = db!.collection('jobs').doc();
        batch.set(ref, job);
      });
      demoCandidates.forEach((candidate) => {
        const ref = db!.collection('candidates').doc();
        batch.set(ref, candidate);
      });

      await batch.commit();
      return res.json({ message: `✅ Seeded ${demoJobs.length} jobs and ${demoCandidates.length} candidates to Firestore.` });
    } else {
      // In-memory seed (for local dev without Firebase)
      if (DataStore.jobs.length === 0) {
        demoJobs.forEach((j, i) => DataStore.jobs.push({ _id: String(i + 1), ...j } as any));
      }
      if (DataStore.candidates.length === 0) {
        demoCandidates.forEach((c, i) => DataStore.candidates.push({ _id: `c${i + 1}`, ...c } as any));
      }
      return res.json({ message: `✅ Seeded to in-memory store. (${demoJobs.length} jobs, ${demoCandidates.length} candidates)` });
    }
  } catch (error) {
    console.error('Seed Error:', error);
    return res.status(500).json({ error: 'Seed failed', details: String(error) });
  }
});

export default router;
