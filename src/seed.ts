import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { RecruiterModel as Recruiter } from './models/mongodb/Recruiter'; 
import { JobModel as Job } from './models/mongodb/Job';             
import { ProfileModel as Profile } from './models/mongodb/Profile';     
import { ScreeningResultModel as ScreeningResult } from './models/mongodb/ScreeningResult';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected.');

    console.log('💥 Wiping existing database...');
    await Recruiter.deleteMany({});
    await Job.deleteMany({});
    await Profile.deleteMany({});
    await ScreeningResult.deleteMany({});
    console.log('🧹 Database wiped clean.');

    // 1. CREATE RECRUITERS
    const recruiters = await Recruiter.insertMany([
      { email: 'tech@umurava.africa', companyName: 'Umurava', role: 'Admin' },
      { email: 'hr@ampersand.rw', companyName: 'Ampersand Rwanda', role: 'Hiring Manager' },
      { email: 'talent@irembo.gov.rw', companyName: 'Irembo', role: 'Technical Recruiter' }
    ]);
    console.log('✅ Recruiters Seeded.');

    // 2. CREATE JOBS (Explicitly assigning to recruiters)
    const jobsData = [
      { recruiterId: recruiters[0]._id, title: 'Senior Node.js Backend Engineer', description: 'Build ATS APIs.', requiredSkills: ['Node.js', 'Express', 'MongoDB'], experienceLevel: 'Senior' },
      { recruiterId: recruiters[0]._id, title: 'Frontend React Developer', description: 'Build Next.js UIs.', requiredSkills: ['React', 'Next.js', 'Tailwind'], experienceLevel: 'Mid' },
      { recruiterId: recruiters[1]._id, title: 'React Native Mobile Developer', description: 'EV tracking app.', requiredSkills: ['React Native', 'Mobile', 'TypeScript'], experienceLevel: 'Mid' },
      { recruiterId: recruiters[1]._id, title: 'Hardware IoT Engineer', description: 'Battery telemetry.', requiredSkills: ['C++', 'IoT', 'Arduino'], experienceLevel: 'Senior' },
      { recruiterId: recruiters[2]._id, title: 'AI/ML Data Scientist', description: 'Citizen models.', requiredSkills: ['Python', 'Machine Learning', 'TensorFlow'], experienceLevel: 'Senior' },
      { recruiterId: recruiters[2]._id, title: 'Cloud Security DevOps', description: 'Government cloud.', requiredSkills: ['AWS', 'Cybersecurity', 'Docker'], experienceLevel: 'Senior' }
    ];
    
    // Insert and fetch back to guarantee we have the exact DB ObjectIds
    await Job.insertMany(jobsData);
    const dbJobs = await Job.find({});
    console.log(`✅ ${dbJobs.length} Jobs Seeded.`);

    // 3. SEED 2 EXTERNAL APPLICANTS PER JOB (Exactly 12 Total)
    const externalApplicants = [];
    let counter = 1;

    for (const job of dbJobs) {
      // Applicant 1
      externalApplicants.push({
        source: 'external',
        appliedJobs: [job._id], // Guaranteed correct Job ID
        firstName: 'External',
        lastName: `Candidate ${counter}`,
        email: `ext${counter}@gmail.com`,
        headline: `${job.title} Specialist`,
        location: 'Kigali, Rwanda',
        availability: { status: 'Available', type: 'Full-time' },
        skills: [{ name: job.requiredSkills[0], level: 'Advanced', yearsOfExperience: 4 }]
      });
      counter++;

      // Applicant 2
      externalApplicants.push({
        source: 'external',
        appliedJobs: [job._id], // Guaranteed correct Job ID
        firstName: 'External',
        lastName: `Candidate ${counter}`,
        email: `ext${counter}@gmail.com`,
        headline: `Junior ${job.title}`,
        location: 'Remote',
        availability: { status: 'Available', type: 'Full-time' },
        skills: [{ name: job.requiredSkills[1] || job.requiredSkills[0], level: 'Intermediate', yearsOfExperience: 2 }]
      });
      counter++;
    }

    await Profile.insertMany(externalApplicants);
    console.log(`✅ 12 External Applicants Seeded (Exactly 2 per Job).`);

    // 4. SEED INTERNAL TALENT POOL
    // We add people who exactly match the skills of the jobs above, plus some irrelevant ones.
    const internalProfiles = [
      { source: 'umurava', firstName: 'Jean', lastName: 'Claude', email: 'int1@umurava.rw', headline: 'Backend Dev', location: 'Kigali', availability: { status: 'Open to Opportunities', type: 'Full-time' }, skills: [{ name: 'Node.js', level: 'Expert', yearsOfExperience: 5 }] },
      { source: 'umurava', firstName: 'Aline', lastName: 'Mugisha', email: 'int2@umurava.rw', headline: 'Frontend Dev', location: 'Kigali', availability: { status: 'Open to Opportunities', type: 'Full-time' }, skills: [{ name: 'React', level: 'Expert', yearsOfExperience: 4 }] },
      { source: 'umurava', firstName: 'Samuel', lastName: 'Nizi', email: 'int3@umurava.rw', headline: 'Mobile Dev', location: 'Kigali', availability: { status: 'Open to Opportunities', type: 'Full-time' }, skills: [{ name: 'React Native', level: 'Expert', yearsOfExperience: 5 }] },
      { source: 'umurava', firstName: 'Grace', lastName: 'Uwase', email: 'int4@umurava.rw', headline: 'Cloud Engineer', location: 'Kigali', availability: { status: 'Open to Opportunities', type: 'Full-time' }, skills: [{ name: 'AWS', level: 'Expert', yearsOfExperience: 5 }] },
      { source: 'umurava', firstName: 'Peter', lastName: 'Plumber', email: 'int5@umurava.rw', headline: 'Master Plumber', location: 'Kigali', availability: { status: 'Open to Opportunities', type: 'Full-time' }, skills: [{ name: 'Pipe Fitting', level: 'Expert', yearsOfExperience: 10 }] }, // Irrelevant
      { source: 'umurava', firstName: 'Sarah', lastName: 'Nurse', email: 'int6@umurava.rw', headline: 'Registered Nurse', location: 'Kigali', availability: { status: 'Open to Opportunities', type: 'Full-time' }, skills: [{ name: 'Patient Care', level: 'Expert', yearsOfExperience: 5 }] } // Irrelevant
    ];

    await Profile.insertMany(internalProfiles);
    console.log(`✅ Internal Talent Pool Seeded.`);

    console.log('🚀 DB Setup Complete! Run your frontend to verify.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
