import mongoose from 'mongoose';
import type { IProfileRepository } from '../interfaces/IProfileRepository';
import { ProfileModel } from '../../models/mongodb/Profile';
import type { IProfile } from '../../types';

export class MongoProfileRepository implements IProfileRepository {
  async create(profile: Omit<IProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProfile> {
    const doc = await ProfileModel.create(profile);
    return doc.toJSON() as IProfile;
  }

  async findById(id: string): Promise<IProfile | null> {
    try {
      const doc = await ProfileModel.findById(id);
      return doc ? (doc.toJSON() as IProfile) : null;
    } catch (err) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<IProfile | null> {
    const doc = await ProfileModel.findOne({ email });
    return doc ? (doc.toJSON() as IProfile) : null;
  }

  async findAll(): Promise<IProfile[]> {
    const docs = await ProfileModel.find().sort({ createdAt: -1 });
    return docs.map(doc => doc.toJSON() as IProfile);
  }

  async update(id: string, data: Partial<IProfile>): Promise<IProfile | null> {
    try {
      const doc = await ProfileModel.findByIdAndUpdate(id, data, { new: true });
      return doc ? (doc.toJSON() as IProfile) : null;
    } catch (err) {
      return null;
    }
  }

  async updateStatus(id: string, status: 'pending' | 'shortlisted' | 'rejected'): Promise<IProfile | null> {
    try {
      const doc = await ProfileModel.findByIdAndUpdate(id, { status }, { new: true });
      return doc ? (doc.toJSON() as IProfile) : null;
    } catch (err) {
      return null;
    }
  }

  async countExternalByJob(jobId: string): Promise<number> {
    try {
      return await ProfileModel.countDocuments({
        source: 'external',
        appliedJobs: new mongoose.Types.ObjectId(jobId)
      });
    } catch {
      return 0;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await ProfileModel.findByIdAndDelete(id);
    } catch (err) {
      // Ignore
    }
  }
}
