import { getDb } from '../../config/firebase';
import type { IJob } from '../../types';
import type { IJobRepository } from '../interfaces/IJobRepository';

const COLLECTION = 'jobs';

export class FirestoreJobRepository implements IJobRepository {
  async create(job: Omit<IJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<IJob> {
    const now = new Date().toISOString();
    const docRef = getDb().collection(COLLECTION).doc();
    const data: IJob = { ...job, id: docRef.id, createdAt: now, updatedAt: now };
    await docRef.set(data);
    return data;
  }

  async findById(id: string): Promise<IJob | null> {
    const snap = await getDb().collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as IJob;
  }

  async findAll(): Promise<IJob[]> {
    const snap = await getDb().collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IJob));
  }

  async update(id: string, data: Partial<IJob>): Promise<IJob | null> {
    const ref = getDb().collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const updated = { ...data, updatedAt: new Date().toISOString() };
    await ref.update(updated);
    return { id, ...snap.data(), ...updated } as IJob;
  }

  async delete(id: string): Promise<void> {
    await getDb().collection(COLLECTION).doc(id).delete();
  }
}
