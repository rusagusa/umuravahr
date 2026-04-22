import mongoose, { Schema, Document } from 'mongoose';
import type { IScreeningResult } from '../../types';

export interface IScreeningResultDocument extends Omit<IScreeningResult, 'id'>, Document {}

const ScreeningResultSchema: Schema = new Schema({
  jobId: { type: String, required: true, index: true },
  profileId: { type: String, required: true, index: true },
  candidateRank: { type: Number, required: true },
  matchScore: { type: Number, required: true },
  strengths: [{ type: String }],
  gaps: [{ type: String }],
  finalRecommendation: { type: String, required: true },
  evaluatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

ScreeningResultSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export const ScreeningResultModel = mongoose.model<IScreeningResultDocument>('ScreeningResult', ScreeningResultSchema);
