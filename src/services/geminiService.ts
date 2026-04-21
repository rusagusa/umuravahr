import type { ICandidate } from '../models/Candidate';
import type { IJob } from '../models/Job';

// dotenv is handled by Firebase v2
 
let client: any = null;
 
function getGenAI() {
  if (!client) {
    const { GoogleGenAI } = require('@google/genai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Extracts structured JSON candidate data from raw resume text using Gemini.
 * Uses the official Umurava Talent Profile Schema keys.
 */
export async function parseResumeToProfile(resumeText: string) {
  const genAI = getGenAI();
  const prompt = `You are an expert HR data entry assistant.
Extract all relevant information from the following resume text and format it strictly into the JSON schema provided.
If information is missing, use reasonable defaults or empty arrays/strings as per the schema. Do not invent information.
Use the EXACT field names from the schema including spaces (e.g. "Start Date", "End Date", "Is Current", "Field of Study", "Start Year", "End Year", "Issue Date").

<resume_text>
${resumeText}
</resume_text>`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            firstName: { type: 'STRING' },
            lastName: { type: 'STRING' },
            email: { type: 'STRING' },
            headline: { type: 'STRING' },
            bio: { type: 'STRING' },
            location: { type: 'STRING' },
            skills: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  level: { type: 'STRING', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
                  yearsOfExperience: { type: 'NUMBER' }
                }
              }
            },
            languages: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  proficiency: { type: 'STRING', enum: ['Basic', 'Conversational', 'Fluent', 'Native'] }
                }
              }
            },
            experience: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  company: { type: 'STRING' },
                  role: { type: 'STRING' },
                  'Start Date': { type: 'STRING', description: 'YYYY-MM' },
                  'End Date': { type: 'STRING', description: 'YYYY-MM or Present' },
                  description: { type: 'STRING' },
                  technologies: { type: 'ARRAY', items: { type: 'STRING' } },
                  'Is Current': { type: 'BOOLEAN' }
                }
              }
            },
            education: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  institution: { type: 'STRING' },
                  degree: { type: 'STRING' },
                  'Field of Study': { type: 'STRING' },
                  'Start Year': { type: 'NUMBER' },
                  'End Year': { type: 'NUMBER' }
                }
              }
            },
            certifications: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  issuer: { type: 'STRING' },
                  'Issue Date': { type: 'STRING', description: 'YYYY-MM' }
                }
              }
            },
            projects: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  description: { type: 'STRING' },
                  technologies: { type: 'ARRAY', items: { type: 'STRING' } },
                  role: { type: 'STRING' },
                  link: { type: 'STRING' },
                  'Start Date': { type: 'STRING', description: 'YYYY-MM' },
                  'End Date': { type: 'STRING', description: 'YYYY-MM' }
                }
              }
            },
            availability: {
              type: 'OBJECT',
              properties: {
                status: { type: 'STRING', enum: ['Available', 'Open to Opportunities', 'Not Available'] },
                type: { type: 'STRING', enum: ['Full-time', 'Part-time', 'Contract'] },
                'Start Date': { type: 'STRING' }
              }
            },
            socialLinks: {
              type: 'OBJECT',
              properties: {
                linkedin: { type: 'STRING' },
                github: { type: 'STRING' },
                portfolio: { type: 'STRING' }
              }
            }
          },
          required: ['firstName', 'lastName', 'email', 'headline', 'location', 'skills', 'experience', 'education', 'projects', 'availability']
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing resume with Gemini:', error);
    throw error;
  }
}

export async function evaluateCandidate(candidate: Partial<ICandidate>, job: Partial<IJob>) {
  const genAI = getGenAI();
  const prompt = `You are an expert technical recruiter and AI logic engine for the Umurava AI Hackathon platform.
Evaluate this candidate against the provided job specification. Use deterministic logic based on the provided weights.

Job Title: ${job.title}
Job Description: ${job.description}
Requirements: ${job.requirements?.join(', ')}
Evaluation Weights: Skills(${job.weights?.skills ?? 40}%), Experience(${job.weights?.experience ?? 30}%), Education(${job.weights?.education ?? 20}%), Projects(${job.weights?.projects ?? 10}%)

Candidate Profile (Umurava Talent Schema):
${JSON.stringify(candidate, null, 2)}

Provide a precise, honest match score from 0 to 100 based on the Evaluation Weights.
For strengths and gaps, be specific and cite actual skills/technologies/experiences from the profile.
Provide a final natural language recommendation of 1-2 sentences.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            matchScore: { type: 'NUMBER', description: 'Overall score from 0 to 100' },
            strengths: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Specific bullet points on why they fit' },
            gaps: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Identified lack of specific requirements or risks' },
            recommendation: { type: 'STRING', description: 'Natural language summary recommendation (1-2 sentences)' }
          },
          required: ['matchScore', 'strengths', 'gaps', 'recommendation']
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Error evaluating candidate with Gemini:', error);
    throw error;
  }
}

/**
 * Evaluates multiple candidates against a job specification in a SINGLE prompt.
 * This is highly efficient and provides comparative context for the AI.
 */
export async function evaluateCandidatesBatch(candidates: ICandidate[], job: Partial<IJob>) {
  const genAI = getGenAI();
  const prompt = `You are an expert technical recruiter and AI logic engine.
Evaluate the following ${candidates.length} candidates against the provided job specification.

Job Specification:
Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements?.join(', ')}
Weights: Skills(${job.weights?.skills ?? 40}%), Experience(${job.weights?.experience ?? 30}%), Education(${job.weights?.education ?? 20}%), Projects(${job.weights?.projects ?? 10}%)

Candidates Data:
${JSON.stringify(candidates.map(c => ({ id: c._id, firstName: c.firstName, lastName: c.lastName, headline: c.headline, skills: c.skills, experience: c.experience, education: c.education, projects: c.projects })), null, 2)}

For EACH candidate, provide a matchScore (0-100), strengths, gaps, and recommendation.
Return the results as an array of objects, one for each candidate.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            evaluations: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  candidateId: { type: 'STRING' },
                  matchScore: { type: 'NUMBER' },
                  strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                  gaps: { type: 'ARRAY', items: { type: 'STRING' } },
                  recommendation: { type: 'STRING' }
                },
                required: ['candidateId', 'matchScore', 'strengths', 'gaps', 'recommendation']
              }
            }
          },
          required: ['evaluations']
        }
      }
    });

    const text = response.text || '{"evaluations": []}';
    const parsed = JSON.parse(text);
    return parsed.evaluations || [];
  } catch (error) {
    console.error('Error in batch evaluation with Gemini:', error);
    throw error;
  }
}
