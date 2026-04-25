import mongoose, { Schema, Document } from 'mongoose';
import type { IProfile } from '../../types';

export interface IProfileDocument extends Omit<IProfile, 'id'>, Document {}

const SkillSchema = new Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  yearsOfExperience: { type: Number, required: true },
}, { _id: false });

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  'Start Date': { type: String, required: true },
  'End Date': { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  'Is Current': { type: Boolean, default: false },
}, { _id: false });

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  'Field of Study': { type: String, default: '' },
  'Start Year': { type: Number, required: true },
  'End Year': { type: Number, required: true },
}, { _id: false });

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  'Issue Date': { type: String, default: '' },
}, { _id: false });

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  role: { type: String, default: '' },
  link: { type: String },
  'Start Date': { type: String },
  'End Date': { type: String },
}, { _id: false });

const LanguageSchema = new Schema({
  name: { type: String, required: true },
  proficiency: { type: String, enum: ['Basic', 'Conversational', 'Fluent', 'Native'], required: true },
}, { _id: false });

const ProfileSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  headline: { type: String, required: true },
  bio: { type: String },
  location: { type: String, required: true },
  skills: [SkillSchema],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  certifications: [CertificationSchema],
  projects: [ProjectSchema],
  languages: [LanguageSchema],
  availability: {
    status: { type: String, enum: ['Available', 'Open to Opportunities', 'Not Available'], required: true },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], required: true },
    'Start Date': { type: String },
  },
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
  },
  source: { type: String, enum: ['external', 'umurava'], default: 'external' },
  appliedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  status: { type: String, enum: ['pending', 'shortlisted', 'rejected'], default: 'pending' },
}, { timestamps: true });

ProfileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export const ProfileModel = mongoose.model<IProfileDocument>('Profile', ProfileSchema);
