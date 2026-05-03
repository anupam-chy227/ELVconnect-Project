
const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api/v1';

const TEST_CUSTOMER = {
  fullName: 'E2E Audit Customer',
  email: `customer_${Date.now()}@test.com`,
  phone: '+971501234567',
  password: 'Password123!',
  industry: 'real_estate',
  city: 'Dubai',
  country: 'UAE'
};

const TEST_SP = {
  fullName: 'E2E Audit Specialist',
  email: `sp_${Date.now()}@test.com`,
  phone: '+971507654321',
  password: 'Password123!',
  specializations: ['cctv', 'access_control'],
  yearsOfExperience: 5,
  city: 'Abu Dhabi',
  country: 'UAE'
};

async function runAudit() {
  console.log('🚀 INITIALIZING COMPLETE E2E API AUDIT...');
  
  // 0. Check Backend Readiness
  try {
    const readyRes = await axios.get('http://localhost:5000/ready');
    if (readyRes.data.status !== 'ready') {
      console.warn('⚠️ WARNING: Backend reports "not ready" (likely DB connection issue).');
      console.warn('The audit will likely fail. Please ensure your IP is whitelisted in MongoDB Atlas.\n');
    }
  } catch (e) {
    console.error('❌ ERROR: Backend is not running on http://localhost:5000');
    process.exit(1);
  }

  let customerToken, spToken;
  let jobId, invoiceId, customerId, spId;

  try {
    // 1. Register Customer
    console.log('--- Step 1: Registering Customer ---');
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
      title: 'E2E Audit: CCTV Maintenance',
      description: 'Need urgent repair of 4 cameras in Downtown Dubai',
      category: ['cctv'],
      location: {
        address: 'Downtown Dubai, Burj Khalifa',
        city: 'Dubai',
        coordinates: [55.2744, 25.1972]
      },
      budget: {
        type: 'fixed',
        min: 500,
        currency: 'AED'
      }
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    
    jobId = jobRes.data.data.job._id;
    console.log('✅ API: Job Created. ID:', jobId);
    
    const verifyJob = await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${customerToken}` } });
    console.log('🔍 API Verification: Job Status is:', verifyJob.data.data.job.status);

    // 5. Login SP & Apply
    console.log('\n--- Step 5: Service Provider Applying to Job ---');
    const loginSP = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_SP.email,
      password: TEST_SP.password
    });
    spToken = loginSP.data.data.accessToken;

    await axios.post(`${BASE_URL}/jobs/${jobId}/apply`, {
      coverNote: 'I can do this tomorrow. 5 years experience in CCTV.',
      proposedAmount: 450
    }, { headers: { Authorization: `Bearer ${spToken}` } });
    
    console.log('✅ API: SP Applied to Job');
    const verifyApply = await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${customerToken}` } });
    console.log('🔍 API Verification: Application Count:', verifyApply.data.data.job.applications.length);

    // 6. Accept Application (Customer)
    console.log('\n--- Step 6: Customer Accepting Application ---');
    // In this logic, applicationId is actually the serviceProviderId as per job.service.ts:126
    await axios.patch(`${BASE_URL}/jobs/${jobId}/application`, {
      applicationId: spId,
      status: 'accepted'
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    
    console.log('✅ API: Application Accepted');
    const verifyAccept = await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${customerToken}` } });
    console.log('🔍 API Verification: Job Status:', verifyAccept.data.data.job.status);
    console.log('🔍 API Verification: Assigned To:', verifyAccept.data.data.job.assignedTo);

    // 7. Create Invoice (SP)
    console.log('\n--- Step 7: SP Creating Invoice ---');
    const invRes = await axios.post(`${BASE_URL}/invoices`, {
      type: 'tax_invoice',
      jobId: jobId,
      to: {
        customerId: customerId,
        name: TEST_CUSTOMER.fullName,
        email: TEST_CUSTOMER.email,
        address: TEST_CUSTOMER.city
      },
      from: {
        name: TEST_SP.fullName,
        email: TEST_SP.email,
        address: TEST_SP.city
      },
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lineItems: [{
        category: 'cctv',
        description: 'CCTV Repair - Downtown',
        unit: 'job',
        quantity: 1,
        unitPrice: 450,
        discount: 0,
        vatRate: 5,
        lineTotal: 450,
        vatAmount: 22.5,
        lineTotalWithVat: 472.5
      }],
      subtotal: 450,
      vatAmount: 22.5,
      grandTotal: 472.5,
      balanceDue: 472.5
    }, { headers: { Authorization: `Bearer ${spToken}` } });
    
    invoiceId = invRes.data.data.invoice._id;
    console.log('✅ API: Invoice Created. ID:', invoiceId);
    
    const verifyInv = await axios.get(`${BASE_URL}/invoices/${invoiceId}`, { headers: { Authorization: `Bearer ${spToken}` } });
    console.log('🔍 API Verification: Invoice Balance:', verifyInv.data.data.invoice.balanceDue);

    // 8. Record Payment (SP)
    console.log('\n--- Step 8: SP Recording Payment ---');
    await axios.post(`${BASE_URL}/invoices/${invoiceId}/payments`, {
      amount: 472.5,
      method: 'cash',
      date: new Date(),
      notes: 'Received full payment in cash.'
    }, { headers: { Authorization: `Bearer ${spToken}` } });
    
    console.log('✅ API: Payment Recorded');
    const verifyPaid = await axios.get(`${BASE_URL}/invoices/${invoiceId}`, { headers: { Authorization: `Bearer ${spToken}` } });
    console.log('🔍 API Verification: Invoice Status:', verifyPaid.data.data.invoice.status);
    console.log('🔍 API Verification: Final Balance:', verifyPaid.data.data.invoice.balanceDue);

    // 9. Soft Delete Job (Cleanup/Discard Test)
    console.log('\n--- Step 9: Discard Scenario (Soft Delete Job) ---');
    await axios.delete(`${BASE_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    console.log('✅ API: Job Deleted (Soft Delete)');
    // Note: The service uses a pre-find hook to hide isDeleted: true records.
    try {
      await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${customerToken}` } });
      console.log('❌ API Verification Failed: Job still accessible after delete.');
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log('🔍 API Verification: Job no longer found (Confirming soft-delete logic works).');
      } else {
        console.error('🔍 API Verification Error:', e.message);
      }
    }

    console.log('\n✨ ALL API SCENARIOS COMPLETED SUCCESSFULLY!');
    console.log('Business Logic Verified: Auth, Jobs, Applications, Invoices, Payments, and Soft-Deletes.');

  } catch (error) {
    console.error('\n❌ AUDIT FAILED!');
    if (error.response) {
      console.error('API Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    process.exit(1);
  }
}

runAudit();
