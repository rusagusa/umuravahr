/**
 * Umurava Talent Profile Schema — TypeScript Interfaces
 * These interfaces strictly follow the official Umurava AI Hackathon
 * Talent Profile Schema Specification.
 * Used by geminiService.ts for type-safe evaluation calls.
 * NOTE: No Mongoose dependency — persistence is via Firestore.
 */

export interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

export interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface IExperience {
  company: string;
  role: string;
  'Start Date': string; // YYYY-MM
  'End Date'?: string;  // YYYY-MM | Present
  description: string;
  technologies: string[];
  'Is Current': boolean;
}

export interface IEducation {
  institution: string;
  degree: string;
  'Field of Study': string;
  'Start Year': number;
  'End Year': number;
}

export interface ICertification {
  name: string;
  issuer: string;
  'Issue Date': string; // YYYY-MM
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  'Start Date'?: string; // YYYY-MM
  'End Date'?: string;   // YYYY-MM
}

export interface IAvailability {
  status: 'Available' | 'Open to Opportunities' | 'Not Available';
  type: 'Full-time' | 'Part-time' | 'Contract';
  'Start Date'?: string; // YYYY-MM-DD
}

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ICandidate {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: ISkill[];
  languages?: ILanguage[];
  experience: IExperience[];
  education: IEducation[];
  certifications?: ICertification[];
  projects: IProject[];
  availability: IAvailability;
  socialLinks?: ISocialLinks;
  evaluations?: {
    jobId: string;
    matchScore: number;
    strengths: string[];
    gaps: string[];
    recommendation: string;
  }[];
}
