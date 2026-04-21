const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function checkModels() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.list(); // Usually valid for the SDK
    
    // We try to collect all to an array
    const available = [];
    for await (const m of response) {
      if (m.name.includes('gemini')) {
         available.push(m.name);
      }
    }
    console.log(available.join('\n'));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

checkModels();
