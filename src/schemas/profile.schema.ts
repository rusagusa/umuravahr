import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const SkillLevelEnum = z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
export const AvailabilityStatusEnum = z.enum(['Available', 'Open to Opportunities', 'Not Available']);
export const AvailabilityTypeEnum = z.enum(['Full-time', 'Part-time', 'Contract']);
export const LanguageProficiencyEnum = z.enum(['Basic', 'Conversational', 'Fluent', 'Native']);

// ─── Skill ────────────────────────────────────────────────────────────────────

export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: SkillLevelEnum,
  yearsOfExperience: z.number().min(0).max(50),
});

// ─── Experience ───────────────────────────────────────────────────────────────

export const ExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  'Start Date': z.string().default(''),
  'End Date': z.string().default(''),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  'Is Current': z.boolean().default(false),
});

// ─── Education ────────────────────────────────────────────────────────────────

export const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  'Field of Study': z.string().default(''),
  'Start Year': z.number().int().catch(2000),
  'End Year': z.number().int().catch(2024),
});

// ─── Certification ────────────────────────────────────────────────────────────

export const CertificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  'Issue Date': z.string().default(''),
});

// ─── Project ──────────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  role: z.string().default(''),
  link: z.string().catch(''),
  'Start Date': z.string().catch(''),
  'End Date': z.string().catch(''),
});

// ─── Language ─────────────────────────────────────────────────────────────────

export const LanguageSchema = z.object({
  name: z.string().min(1),
  proficiency: LanguageProficiencyEnum,
});

// ─── Availability ─────────────────────────────────────────────────────────────

export const AvailabilitySchema = z.object({
  status: AvailabilityStatusEnum,
  type: AvailabilityTypeEnum,
  'Start Date': z.string().optional(),
});

// ─── Social Links ─────────────────────────────────────────────────────────────

export const SocialLinksSchema = z.object({
  linkedin: z.string().catch(''),
  github: z.string().catch(''),
  portfolio: z.string().catch(''),
}).optional();

// ─── Full Profile Schema ──────────────────────────────────────────────────────

export const ProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Must be a valid email address'),
  headline: z.string().min(1, 'Headline is required'),
  bio: z.string().optional().default(''),
  location: z.string().min(1, 'Location is required'),
  skills: z.array(SkillSchema).min(1, 'At least one skill is required'),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).optional().default([]),
  projects: z.array(ProjectSchema).default([]),
  languages: z.array(LanguageSchema).optional().default([]),
  availability: AvailabilitySchema,
  status: z.enum(['pending', 'shortlisted', 'rejected']).default('pending'),
  socialLinks: SocialLinksSchema,
});

// ─── Inferred TypeScript Type ─────────────────────────────────────────────────

export type ProfileInput = z.input<typeof ProfileSchema>;
export type ProfileOutput = z.output<typeof ProfileSchema>;
