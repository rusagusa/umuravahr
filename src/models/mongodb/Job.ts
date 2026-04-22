import mongoose, { Schema, Document } from 'mongoose';
import type { IJob } from '../../types';

export interface IJobDocument extends Omit<IJob, 'id'>, Document {}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String },
  location: { type: String },
  requiredSkills: [{ type: String }],
  experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Principal'], required: true },
  weights: {
    skills: { type: Number, required: true, default: 25 },
    experience: { type: Number, required: true, default: 25 },
    education: { type: Number, required: true, default: 25 },
    projects: { type: Number, required: true, default: 25 },
  },
  status: { type: String, enum: ['Open', 'Closed', 'Draft'], default: 'Open' },
}, { timestamps: true });

// Ensure id virtualization works to match our frontend's expectations
JobSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export const JobModel = mongoose.model<IJobDocument>('Job', JobSchema);
