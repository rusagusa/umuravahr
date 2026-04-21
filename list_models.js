import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found');
    return;
  }
  const genAI = new GoogleGenAI(apiKey);
  try {
    const models = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).listModels(); // This might not be the right method for @google/genai
    // Actually @google/genai doesn't have a simple listModels on the client usually, it's a REST thing or a specific client.
    // Let me check the documentation or just try a few common ones.
  } catch (e) {
    console.error(e);
  }
}
