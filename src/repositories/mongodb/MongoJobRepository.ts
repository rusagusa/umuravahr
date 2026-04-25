import mongoose from 'mongoose';
import type { IJobRepository } from '../interfaces/IJobRepository';
import { JobModel } from '../../models/mongodb/Job';
import type { IJob } from '../../types';

export class MongoJobRepository implements IJobRepository {
  async create(job: Omit<IJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<IJob> {
    const doc = await JobModel.create(job);
    return doc.toJSON() as IJob;
  }

  async findById(id: string): Promise<IJob | null> {
    try {
      const doc = await JobModel.findById(id);
      return doc ? (doc.toJSON() as IJob) : null;
    } catch (err) {
      return null;
    }
  }

  async findAll(filter: { recruiterId?: string } = {}): Promise<IJob[]> {
    const query: Record<string, any> = {};
    if (filter.recruiterId) {
      query.recruiterId = new mongoose.Types.ObjectId(filter.recruiterId);
    }
    const docs = await JobModel.find(query).sort({ createdAt: -1 });
    return docs.map(doc => doc.toJSON() as IJob);
  }

  async update(id: string, data: Partial<IJob>): Promise<IJob | null> {
    try {
      const doc = await JobModel.findByIdAndUpdate(id, data, { new: true });
      return doc ? (doc.toJSON() as IJob) : null;
    } catch (err) {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await JobModel.findByIdAndDelete(id);
    } catch (err) {
      // Ignore
    }
  }
}
