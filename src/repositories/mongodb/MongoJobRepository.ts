import type { IJobRepository } from '../interfaces/IJobRepository';
import { JobModel } from '../../models/mongodb/Job';
import type { IJob } from '../../types';

export class MongoJobRepository implements IJobRepository {
  async create(job: Omit<IJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<IJob> {
    const doc = await JobModel.create(job);
    return doc.toJSON() as IJob;
  }

  async findById(id: string): Promise<IJob | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const doc = await JobModel.findById(id);
    return doc ? (doc.toJSON() as IJob) : null;
  }

  async findAll(): Promise<IJob[]> {
    const docs = await JobModel.find().sort({ createdAt: -1 });
    return docs.map(doc => doc.toJSON() as IJob);
  }

  async update(id: string, data: Partial<IJob>): Promise<IJob | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const doc = await JobModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? (doc.toJSON() as IJob) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return;
    await JobModel.findByIdAndDelete(id);
  }
}
