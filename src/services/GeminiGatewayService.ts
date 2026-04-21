import { GoogleGenAI, type GenerateContentConfig } from '@google/genai';
import type { IJob, IProfile, IScreeningResult } from '../types';
import type { ProfileOutput } from '../schemas/profile.schema';

// ─── Gemini Response Schemas ──────────────────────────────────────────────────
// These are the Gemini API JSON Schema objects that mirror our Zod schemas.
// They guarantee the LLM returns perfectly typed JSON every time.

const PROFILE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    firstName:  { type: 'STRING' },
    lastName:   { type: 'STRING' },
    email:      { type: 'STRING' },
    headline:   { type: 'STRING' },
    bio:        { type: 'STRING' },
    location:   { type: 'STRING' },
    skills: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name:              { type: 'STRING' },
          level:             { type: 'STRING', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
          yearsOfExperience: { type: 'NUMBER' },
        },
        required: ['name', 'level', 'yearsOfExperience'],
      },
    },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          company:      { type: 'STRING' },
          role:         { type: 'STRING' },
          'Start Date': { type: 'STRING', description: 'YYYY-MM' },
          'End Date':   { type: 'STRING', description: 'YYYY-MM or Present' },
          description:  { type: 'STRING' },
          technologies: { type: 'ARRAY', items: { type: 'STRING' } },
          'Is Current': { type: 'BOOLEAN' },
        },
        required: ['company', 'role', 'Start Date', 'End Date', 'description', 'technologies', 'Is Current'],
      },
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          institution:    { type: 'STRING' },
          degree:         { type: 'STRING' },
          'Field of Study': { type: 'STRING' },
          'Start Year':   { type: 'NUMBER' },
          'End Year':     { type: 'NUMBER' },
        },
        required: ['institution', 'degree', 'Field of Study', 'Start Year', 'End Year'],
      },
    },
    certifications: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name:        { type: 'STRING' },
          issuer:      { type: 'STRING' },
          'Issue Date': { type: 'STRING', description: 'YYYY-MM' },
        },
        required: ['name', 'issuer', 'Issue Date'],
      },
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name:         { type: 'STRING' },
          description:  { type: 'STRING' },
          technologies: { type: 'ARRAY', items: { type: 'STRING' } },
          role:         { type: 'STRING' },
          link:         { type: 'STRING' },
          'Start Date': { type: 'STRING' },
          'End Date':   { type: 'STRING' },
        },
        required: ['name', 'description', 'technologies', 'role'],
      },
    },
    languages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name:        { type: 'STRING' },
          proficiency: { type: 'STRING', enum: ['Basic', 'Conversational', 'Fluent', 'Native'] },
        },
        required: ['name', 'proficiency'],
      },
    },
    availability: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', enum: ['Available', 'Open to Opportunities', 'Not Available'] },
        type:   { type: 'STRING', enum: ['Full-time', 'Part-time', 'Contract'] },
        'Start Date': { type: 'STRING' },
      },
      required: ['status', 'type'],
    },
    socialLinks: {
      type: 'OBJECT',
      properties: {
        linkedin:  { type: 'STRING' },
        github:    { type: 'STRING' },
        portfolio: { type: 'STRING' },
      },
    },
  },
  required: ['firstName', 'lastName', 'email', 'headline', 'location', 'skills', 'experience', 'education', 'projects', 'availability'],
};

const SCREENING_RESULT_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    evaluations: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          profileId:           { type: 'STRING' },
          candidateRank:       { type: 'NUMBER', description: 'Rank 1 = best match' },
          matchScore:          { type: 'NUMBER', description: '0 to 100' },
          strengths:           { type: 'ARRAY', items: { type: 'STRING' } },
          gaps:                { type: 'ARRAY', items: { type: 'STRING' } },
          finalRecommendation: { type: 'STRING', description: 'One sentence for the hiring manager' },
        },
        required: ['profileId', 'candidateRank', 'matchScore', 'strengths', 'gaps', 'finalRecommendation'],
      },
    },
  },
  required: ['evaluations'],
};

// ─── Batching Utility ─────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const BATCH_SIZE = 10;
const MODEL = 'gemini-2.5-flash';

// ─── GeminiGatewayService ─────────────────────────────────────────────────────

/**
 * GeminiGatewayService
 * The single integration point with the Google Gemini API.
 * Guarantees structured JSON output via responseSchema on every call.
 */
export class GeminiGatewayService {
  private readonly client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set.');
    this.client = new GoogleGenAI({ apiKey });
  }

  // ─── Task A: Resume / Unstructured Text → Profile Schema ─────────────────

  /**
   * Takes raw, unstructured resume text (from PDF/CSV) and forces it into
   * the Umurava Talent Profile Schema using Gemini's structured output mode.
   */
  async parseUnstructuredToSchema(rawText: string): Promise<ProfileOutput> {
    const systemPrompt = `You are an expert HR Data Extraction AI. Your task is to extract information from the provided unstructured resume text and map it perfectly to the target JSON schema.
Rules:
1. You must extract 'First Name', 'Last Name', 'Email', 'Headline', and 'Location'.
2. Extract a list of 'skills' including 'name', 'level' (Beginner | Intermediate | Advanced | Expert), and 'yearsOfExperience'.
3. Extract 'experience' including 'company', 'role', 'Start Date' (YYYY-MM), 'End Date' (YYYY-MM or 'Present'), 'description', and 'technologies'.
4. If a field is completely missing from the resume, use null or an empty array as appropriate, but do not omit the key. Do not hallucinate data.`;

    const config: GenerateContentConfig = {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: PROFILE_RESPONSE_SCHEMA as any,
    };

    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: `<resume_text>\n${rawText}\n</resume_text>` }] }],
      config,
    });

    const text = response.text ?? '{}';
    return JSON.parse(text) as ProfileOutput;
  }

  // ─── Task B: Batch Candidate Evaluation ───────────────────────────────────

  /**
   * Evaluates an array of candidates against a single job spec.
   * Automatically chunks into batches of 10 to respect token limits.
   * Returns a flat, ranked array of ScreeningResult objects.
   */
  async evaluateCandidates(
    job: IJob,
    profiles: IProfile[]
  ): Promise<Omit<IScreeningResult, 'id' | 'jobId' | 'evaluatedAt'>[]> {
    const systemPrompt = `You are an elite, objective Senior Technical Recruiter AI. You are evaluating a batch of candidate profiles against a specific Job Description.

For each candidate, you must analyze their structured profile data (Skills, Experience, Projects, Education) and compare it against the Job's required skills and experience level.

You must provide a highly objective, explainable evaluation for EACH candidate in the batch.

Output Rules:
- Rank candidates logically based on their match to the role. Rank 1 = best match.
- Calculate a 'matchScore' from 0 to 100 using the provided evaluation weights.
- 'strengths': List 2-3 specific reasons they fit, citing explicit tools or years of experience from their profile.
- 'gaps': List 1-2 missing skills or experience gaps compared to the job description.
- 'finalRecommendation': A one-sentence summary for the human hiring manager on whether to interview or reject.
- Use the candidate's 'id' field as the 'profileId' in your output.`;

    const config: GenerateContentConfig = {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: SCREENING_RESULT_RESPONSE_SCHEMA as any,
    };

    const chunks = chunkArray(profiles, BATCH_SIZE);
    const allResults: Omit<IScreeningResult, 'id' | 'jobId' | 'evaluatedAt'>[] = [];
    let globalRankOffset = 0;

    for (const chunk of chunks) {
      const jobBlock = JSON.stringify(
        {
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills,
          experienceLevel: job.experienceLevel,
          evaluationWeights: job.weights,
        },
        null,
        2
      );

      const candidateBlock = JSON.stringify(
        chunk.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          headline: p.headline,
          location: p.location,
          skills: p.skills,
          experience: p.experience,
          education: p.education,
          projects: p.projects,
        })),
        null,
        2
      );

      const userMessage = `<job_description>\n${jobBlock}\n</job_description>\n\n<candidate_profiles>\n${candidateBlock}\n</candidate_profiles>`;

      const response = await this.client.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config,
      });

      const text = response.text ?? '{"evaluations":[]}';
      const parsed: { evaluations: Omit<IScreeningResult, 'id' | 'jobId' | 'evaluatedAt'>[] } =
        JSON.parse(text);

      // Re-apply rank offsets across chunks so ranking is global
      const chunkResults = parsed.evaluations.map((r) => ({
        ...r,
        candidateRank: r.candidateRank + globalRankOffset,
      }));

      allResults.push(...chunkResults);
      globalRankOffset += chunk.length;
    }

    // Final global re-rank by matchScore descending
    allResults.sort((a, b) => b.matchScore - a.matchScore);
    return allResults.map((r, i) => ({ ...r, candidateRank: i + 1 }));
  }
}
