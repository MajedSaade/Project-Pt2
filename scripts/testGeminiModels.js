// Script to test available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('No API key found. Set REACT_APP_GEMINI_API_KEY in .env file');
  process.exit(1);
}

console.log('API Key found:', API_KEY.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(API_KEY);

// List of models to test
const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'models/gemini-pro',
  'models/gemini-1.5-pro',
];

async function testModel(modelName) {
  try {
    console.log(`\nTesting model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello in Hebrew');
    const response = await result.response;
    console.log(`✅ ${modelName} WORKS!`);
    console.log(`Response: ${response.text().substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} failed: ${error.message}`);
    return false;
  }
}

async function testAllModels() {
  console.log('Testing Gemini models...\n');
  
  for (const modelName of modelsToTest) {
    await testModel(modelName);
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== Testing Complete ===');
}

testAllModels().catch(console.error);
