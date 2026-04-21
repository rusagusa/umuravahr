/**
 * Umurava Job Schema — TypeScript Interface
 * No Mongoose dependency — persistence is via Firestore.
 */
export interface IJob {
  _id?: string;
  title: string;
  description: string;
  department: string;
  location: string;
  requirements: string[];
  status: 'Open' | 'Closed';
  weights: {
    skills: number;
    experience: number;
    education: number;
    projects: number;
  };
}
