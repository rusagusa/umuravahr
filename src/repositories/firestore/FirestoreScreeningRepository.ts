import { getDb } from '../../config/firebase';
import type { IScreeningResult } from '../../types';
import type { IScreeningRepository } from '../interfaces/IScreeningRepository';

const COLLECTION = 'screeningResults';

export class FirestoreScreeningRepository implements IScreeningRepository {
  async bulkCreate(
    results: Omit<IScreeningResult, 'id' | 'evaluatedAt'>[]
  ): Promise<IScreeningResult[]> {
    const now = new Date().toISOString();
    const batch = getDb().batch();
    const saved: IScreeningResult[] = [];

    for (const result of results) {
      const ref = getDb().collection(COLLECTION).doc();
      const data: IScreeningResult = { ...result, id: ref.id, evaluatedAt: now };
      batch.set(ref, data);
      saved.push(data);
    }

    await batch.commit();
    return saved;
  }

  async findByJobId(jobId: string): Promise<IScreeningResult[]> {
    // Sort in-memory to avoid requiring a Firestore composite index on (jobId, candidateRank)
    const snap = await getDb()
      .collection(COLLECTION)
      .where('jobId', '==', jobId)
      .get();
    const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IScreeningResult));
    return docs.sort((a, b) => a.candidateRank - b.candidateRank);
  }

  async findShortlist(jobId: string, topN = 10): Promise<IScreeningResult[]> {
    // Sort in-memory and slice to avoid requiring a Firestore composite index
    const snap = await getDb()
      .collection(COLLECTION)
      .where('jobId', '==', jobId)
      .get();
    const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IScreeningResult));
    return docs.sort((a, b) => a.candidateRank - b.candidateRank).slice(0, topN);
  }

  async deleteByJobId(jobId: string): Promise<void> {
    const snap = await getDb().collection(COLLECTION).where('jobId', '==', jobId).get();
    const batch = getDb().batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}
