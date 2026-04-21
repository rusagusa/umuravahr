import { z } from 'zod';

export const ExperienceLevelEnum = z.enum(['Junior', 'Mid', 'Senior', 'Lead', 'Principal']);

export const JobWeightsSchema = z.object({
  skills: z.number().min(0).max(100),
  experience: z.number().min(0).max(100),
  education: z.number().min(0).max(100),
  projects: z.number().min(0).max(100),
}).refine(
  (w) => w.skills + w.experience + w.education + w.projects === 100,
  { message: 'Evaluation weights must sum to exactly 100' }
);

export const CreateJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  department: z.string().optional().default('Engineering'),
  location: z.string().optional().default('Remote'),
  requiredSkills: z.array(z.string().min(1)).min(1, 'At least one required skill'),
  experienceLevel: ExperienceLevelEnum,
  weights: JobWeightsSchema.default({ skills: 40, experience: 30, education: 20, projects: 10 }),
  status: z.enum(['Open', 'Closed', 'Draft']).optional().default('Open'),
});

export type CreateJobInput = z.input<typeof CreateJobSchema>;
export type CreateJobOutput = z.output<typeof CreateJobSchema>;
