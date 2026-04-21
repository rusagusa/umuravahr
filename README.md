# Umurava AI Backend — Integration Guide

This document outlines the API endpoints deployed on Google Cloud Run for the Umurava AI HR Backend. It is intended for the frontend team to integrate the backend into their applications.

**Live Base URL:** `https://umuravahr-api-nd7pf4icya-uc.a.run.app`

---

## 1. Jobs API

### 1.1 Create a Job
**POST** `/api/jobs`
Creates a new job listing with required skills and evaluation weights.

**Request Body** (`application/json`):
```json
{
  "title": "Senior Node.js Backend Engineer",
  "description": "Looking for a robust Node.js backend developer...",
  "department": "Engineering",
  "location": "Remote (Kigali)",
  "requiredSkills": ["Node.js", "TypeScript", "Express"],
  "experienceLevel": "Senior",
  "weights": { "skills": 40, "experience": 30, "education": 20, "projects": 10 }
}
```

### 1.2 Get All Jobs
**GET** `/api/jobs`
Returns a list of all jobs.

**Response**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "GQ5POMS5ywN3ZQ5EzCqS",
      "title": "Senior Node.js Backend Engineer",
      "...": "..."
    }
  ]
}
```

### 1.3 Get Single Job
**GET** `/api/jobs/:id`
Fetch a specific job by its Firestore ID.

---

## 2. Profiles (Candidates) API

### 2.1 Ingest Structured Profile
**POST** `/api/profiles/structured`
Saves a candidate profile manually. The JSON must exactly match the Umurava Talent Profile Zod Schema.

**Request Body** (`application/json`):
```json
{
  "firstName": "Alice",
  "lastName": "Mugisha",
  "email": "alice@umurava.rw",
  "headline": "AI Engineer",
  "location": "Kigali",
  "skills": [],
  "experience": [],
  "education": [],
  "projects": [],
  "availability": { "status": "Available", "type": "Full-time" }
}
```

### 2.2 Ingest Unstructured File (AI Resume Parser)
**POST** `/api/profiles/unstructured`
Accepts a raw PDF, TXT, or CSV file. The backend will parse the text and use Gemini AI to automatically convert it into the strict structured JSON schema above, then save it.

**Request Form Data** (`multipart/form-data`):
- Field name: `resume`
- File type: PDF, TXT, CSV.

### 2.3 Get All Profiles
**GET** `/api/profiles`
Returns all ingested candidate profiles.

### 2.4 Get Single Profile
**GET** `/api/profiles/:id`
Returns a single profile by tracking ID.

---

## 3. AI Screening API

### 3.1 Evaluate Candidates
**POST** `/api/screenings/evaluate/:jobId`
Triggers the Gemini Batch Selection Engine. It evaluates all candidates against this `jobId`, processes them in chunks to avoid token limits, and writes the ranked results to the database.

**Response**:
```json
{
  "success": true,
  "message": "Evaluation complete. 2 candidate(s) ranked.",
  "data": [
    {
       "candidateRank": 1,
       "profileId": "xxxx",
       "matchScore": 95,
       "strengths": ["...", "..."],
       "gaps": ["..."],
       "finalRecommendation": "Recommend for interview."
    }
  ]
}
```

### 3.2 Get Ranked Shortlist
**GET** `/api/screenings/:jobId/shortlist?topN=5`
Retrieves the pre-calculated screening recommendations for the given Job ID, sorted by rank.

**Query Parameters:**
- `topN` (optional): Limit the number of returned best candidates (Defaults to 10).
