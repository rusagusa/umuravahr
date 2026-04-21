import { getDb } from '../../config/firebase';
import type { IProfile } from '../../types';
import type { IProfileRepository } from '../interfaces/IProfileRepository';

const COLLECTION = 'profiles';

export class FirestoreProfileRepository implements IProfileRepository {
  async create(profile: Omit<IProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProfile> {
    const now = new Date().toISOString();
    const docRef = getDb().collection(COLLECTION).doc();
    const data: IProfile = { ...profile, id: docRef.id, createdAt: now, updatedAt: now };
    await docRef.set(data);
    return data;
  }

  async findById(id: string): Promise<IProfile | null> {
    const snap = await getDb().collection(COLLECTION).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as IProfile;
  }

  async findByEmail(email: string): Promise<IProfile | null> {
    const snap = await getDb().collection(COLLECTION).where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as IProfile;
  }

  async findAll(): Promise<IProfile[]> {
    const snap = await getDb().collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IProfile));
  }

  async update(id: string, data: Partial<IProfile>): Promise<IProfile | null> {
    const ref = getDb().collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const updated = { ...data, updatedAt: new Date().toISOString() };
    await ref.update(updated);
    return { id, ...snap.data(), ...updated } as IProfile;
  }

  async delete(id: string): Promise<void> {
    await getDb().collection(COLLECTION).doc(id).delete();
  }
}
