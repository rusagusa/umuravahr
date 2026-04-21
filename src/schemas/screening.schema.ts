import { z } from 'zod';

export const ScreeningResultSchema = z.object({
  profileId: z.string().min(1),
  candidateRank: z.number().int().min(1),
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(1),
  gaps: z.array(z.string()),
  finalRecommendation: z.string().min(1),
});

/** Array schema used to validate the full batch response from Gemini */
export const ScreeningResultArraySchema = z.array(ScreeningResultSchema);

export type ScreeningResultInput = z.input<typeof ScreeningResultSchema>;
export type ScreeningResultOutput = z.output<typeof ScreeningResultSchema>;
