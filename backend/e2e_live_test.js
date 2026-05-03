
const axios = require('axios');

const BASE_URL = 'https://elvconnect.onrender.com/api/v1';
const LIVE_URL = 'https://elvconnect.onrender.com';

const TEST_CUSTOMER = {
  fullName: 'Live Test Customer',
  email: `customer_live_${Date.now()}@test.com`,
  phone: '+971501234567',
  password: 'Password123!',
  industry: 'real_estate',
  city: 'Dubai',
  country: 'UAE'
};

const TEST_SP = {
  fullName: 'Live Test Specialist',
  email: `sp_live_${Date.now()}@test.com`,
  phone: '+971507654321',
  password: 'Password123!',
  specializations: ['cctv', 'access_control'],
  yearsOfExperience: 5,
  city: 'Abu Dhabi',
  country: 'UAE'
};

async function runLiveAudit() {
  console.log('🚀 INITIALIZING LIVE E2E API AUDIT...');
  console.log('Target:', LIVE_URL);
  
  try {
    const readyRes = await axios.get(`${LIVE_URL}/ready`);
    console.log('📡 Status:', readyRes.data.status);
  } catch (e) {
    console.error('❌ ERROR: Live server is not responding correctly at', LIVE_URL);
    process.exit(1);
  }

  let customerToken, spToken;
  let jobId, invoiceId, customerId, spId;

  try {
    // 1. Register Customer
    console.log('\n--- Step 1: Registering Customer ---');
    const regCust = await axios.post(`${BASE_URL}/auth/register/customer`, TEST_CUSTOMER);
    customerId = regCust.data.data.user._id;
    console.log('✅ API: Customer Registered. ID:', customerId);

    // 2. Register SP
    console.log('\n--- Step 2: Registering Service Provider ---');
    const regSP = await axios.post(`${BASE_URL}/auth/register/service-provider`, TEST_SP);
    spId = regSP.data.data.user._id;
    console.log('✅ API: SP Registered. ID:', spId);

    // 3. Login Customer
    console.log('\n--- Step 3: Login Customer ---');
    const loginCust = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_CUSTOMER.email,
      password: TEST_CUSTOMER.password
    });
    customerToken = loginCust.data.data.accessToken;
    console.log('✅ API: Customer Logged In');

    // 4. Create Job
    console.log('\n--- Step 4: Creating Job (Customer) ---');
    const jobRes = await axios.post(`${BASE_URL}/jobs`, {
      title: 'Live Audit: CCTV Check',
      description: 'Testing live deployment',
      category: ['cctv'],
      location: {
        address: 'Downtown Dubai',
        city: 'Dubai',
        coordinates: [55.2744, 25.1972]
      },
      budget: {
        type: 'fixed',
        min: 100,
        currency: 'AED'
      }
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    
    jobId = jobRes.data.data.job._id;
    console.log('✅ API: Job Created. ID:', jobId);

    // 5. Login SP & Apply
    console.log('\n--- Step 5: SP Applying to Job ---');
    const loginSP = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_SP.email,
      password: TEST_SP.password
    });
    spToken = loginSP.data.data.accessToken;

    await axios.post(`${BASE_URL}/jobs/${jobId}/apply`, {
      coverNote: 'Live test application',
      proposedAmount: 90
    }, { headers: { Authorization: `Bearer ${spToken}` } });
    
    console.log('✅ API: SP Applied to Job');

    // 6. Accept Application (Customer)
    console.log('\n--- Step 6: Customer Accepting Application ---');
    await axios.patch(`${BASE_URL}/jobs/${jobId}/application`, {
      applicationId: spId,
      status: 'accepted'
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    
    console.log('✅ API: Application Accepted');

    console.log('\n✨ LIVE API AUDIT COMPLETED SUCCESSFULLY!');
    console.log('Backend is working perfectly on Render.');

  } catch (error) {
    console.error('\n❌ LIVE AUDIT FAILED!');
    if (error.response) {
      console.error('API Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    process.exit(1);
  }
}

runLiveAudit();
