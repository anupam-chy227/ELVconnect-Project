
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api/v1';
const MONGO_URI = process.env.MONGODB_URI;

async function runTests() {
  console.log('🚀 Starting E2E Logic Validation (JS Version)...');

  try {
    // 1. Test Login
    console.log('\n--- Test 1: Authentication ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'SecurePass123!'
    });
    
    if (loginRes.data.success) {
      console.log('✅ Login Successful');
      const token = loginRes.data.data.accessToken;
      
      // 2. Test DB Update (Login Token)
      await mongoose.connect(MONGO_URI);
      const db = mongoose.connection.db;
      const user = await db.collection('users').findOne({ email: 'john@example.com' });
      
      if (user && user.refreshTokens && user.refreshTokens.length > 0) {
        console.log('✅ DB Verification: Refresh Token generated and stored.');
      } else {
        console.log('❌ DB Verification Failed: Token not found in DB.');
      }

      // 3. Test Job Creation
      console.log('\n--- Test 2: Job Creation Logic ---');
      const jobRes = await axios.post(`${BASE_URL}/jobs`, {
        title: 'E2E Automated Audit Job',
        description: 'Testing logic flow',
        category: ['cctv'],
        location: { address: 'Dubai', city: 'Dubai', coordinates: [55.27, 25.20] },
        budget: { type: 'fixed', min: 100 }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (jobRes.data.success) {
        const jobId = jobRes.data.data._id;
        console.log('✅ Job Created via API. ID:', jobId);
        
        const job = await db.collection('jobs').findOne({ _id: new mongoose.Types.ObjectId(jobId) });
        
        if (job) {
          console.log(`✅ DB Verification: Job found with status: ${job.status}`);
          
          // 4. Test Update Scenario (Change)
          console.log('\n--- Test 3: Change Logic (Update Job) ---');
          await axios.patch(`${BASE_URL}/jobs/${jobId}`, {
            title: 'E2E Automated Audit Job - Updated'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const updatedJob = await db.collection('jobs').findOne({ _id: new mongoose.Types.ObjectId(jobId) });
          if (updatedJob.title.includes('Updated')) {
            console.log('✅ DB Verification: Job title updated correctly.');
          }

          // 5. Test Discard Scenario (Delete)
          console.log('\n--- Test 4: Discard Logic (Soft Delete) ---');
          await axios.delete(`${BASE_URL}/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const deletedJob = await db.collection('jobs').findOne({ _id: new mongoose.Types.ObjectId(jobId) });
          if (deletedJob.isDeleted) {
             console.log('✅ DB Verification: Job successfully marked as isDeleted: true.');
          } else {
             console.log('❌ DB Verification Failed: Job still exists or isDeleted is false.');
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🏁 E2E Validation Completed.');
  }
}

runTests();
