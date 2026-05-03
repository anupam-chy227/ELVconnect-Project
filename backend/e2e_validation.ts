
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api/v1';
const MONGO_URI = process.env.MONGODB_URI || '';

async function runTests() {
  console.log('🚀 Starting E2E Logic Validation...');

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
      const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
      const user = await User.findOne({ email: 'john@example.com' });
      
      if (user && user.refreshTokens.length > 0) {
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
        console.log('✅ Job Created via API');
        const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
        const job = await Job.findOne({ title: 'E2E Automated Audit Job' });
        
        if (job) {
          console.log(`✅ DB Verification: Job found with status: ${job.status}`);
          
          // 4. Test Update/Discard Scenario
          console.log('\n--- Test 3: Discard/Delete Logic ---');
          await axios.delete(`${BASE_URL}/jobs/${job._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const deletedJob = await Job.findById(job._id);
          if (deletedJob.isDeleted || !deletedJob) {
             console.log('✅ DB Verification: Job successfully soft-deleted/removed.');
          } else {
             console.log('❌ DB Verification Failed: Job still exists and is not marked deleted.');
          }
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🏁 E2E Validation Completed.');
  }
}

runTests();
