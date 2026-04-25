// ─── Shared ───────────────────────────────────────────────────────────────────

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type AvailabilityStatus = 'Available' | 'Open to Opportunities' | 'Not Available';
export type AvailabilityType = 'Full-time' | 'Part-time' | 'Contract';
export type LanguageProficiency = 'Basic' | 'Conversational' | 'Fluent' | 'Native';
export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';

// ─── Skill ────────────────────────────────────────────────────────────────────

export interface ISkill {
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
}

// ─── Experience ───────────────────────────────────────────────────────────────

export interface IExperience {
  company: string;
  role: string;
  /** Format: YYYY-MM */
  'Start Date': string;
  /** Format: YYYY-MM or "Present" */
  'End Date': string;
  description: string;
  technologies: string[];
  'Is Current': boolean;
}

// ─── Education ────────────────────────────────────────────────────────────────

export interface IEducation {
  institution: string;
  degree: string;
  'Field of Study': string;
  'Start Year': number;
  'End Year': number;
}

// ─── Certification ────────────────────────────────────────────────────────────

export interface ICertification {
  name: string;
  issuer: string;
  /** Format: YYYY-MM */
  'Issue Date': string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  'Start Date'?: string;
  'End Date'?: string;
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

// ─── Language ─────────────────────────────────────────────────────────────────

export interface ILanguage {
  name: string;
  proficiency: LanguageProficiency;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface IAvailability {
  status: AvailabilityStatus;
  type: AvailabilityType;
  'Start Date'?: string;
}

// ─── Profile (Umurava Talent Schema) ──────────────────────────────────────────

export interface IProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: ISkill[];
  experience: IExperience[];
  education: IEducation[];
  certifications?: ICertification[];
  projects: IProject[];
  languages?: ILanguage[];
  availability: IAvailability;
  socialLinks?: ISocialLinks;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export interface IJob {
  id?: string;
  recruiterId?: string;
  title: string;
  description: string;
  department?: string;
  location?: string;
  requiredSkills: string[];
  experienceLevel: ExperienceLevel;
  /** Evaluation weights — must sum to 100 */
  weights: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
  };
  status?: 'Open' | 'Closed' | 'Draft';
  createdAt?: string;
  updatedAt?: string;
}

// ─── Screening Result ─────────────────────────────────────────────────────────

export interface IScreeningResult {
  id?: string;
  jobId: string;
  profileId: string;
  /** Rank 1 = best match */
  candidateRank: number;
  /** 0 – 100 */
  matchScore: number;
  strengths: string[];
  gaps: string[];
  finalRecommendation: string;
  evaluatedAt?: string;
}
