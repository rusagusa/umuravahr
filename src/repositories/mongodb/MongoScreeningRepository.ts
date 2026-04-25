import type { IScreeningRepository } from '../interfaces/IScreeningRepository';
import { ScreeningResultModel } from '../../models/mongodb/ScreeningResult';
import type { IScreeningResult } from '../../types';

export class MongoScreeningRepository implements IScreeningRepository {
  async bulkCreate(results: Omit<IScreeningResult, 'id' | 'evaluatedAt'>[]): Promise<IScreeningResult[]> {
    const docs = await ScreeningResultModel.insertMany(results);
    return docs.map(doc => doc.toJSON() as IScreeningResult);
  }

  async findByJobId(jobId: string): Promise<IScreeningResult[]> {
    const docs = await ScreeningResultModel.find({ jobId })
      .populate('profileId')
      .sort({ candidateRank: 1 });
    return docs.map(doc => doc.toJSON() as IScreeningResult);
  }

  async findShortlist(jobId: string, topN: number = 50): Promise<IScreeningResult[]> {
    const docs = await ScreeningResultModel.find({ jobId })
      .populate('profileId')
      .sort({ candidateRank: 1 })
      .limit(topN);
    return docs.map(doc => doc.toJSON() as IScreeningResult);
  }

  async deleteByJobId(jobId: string): Promise<void> {
    await ScreeningResultModel.deleteMany({ jobId });
  }
}
