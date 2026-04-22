const axios = require('axios');

async function testEndpoints() {
    try {
        console.log('Testing backend endpoints...\n');
        
        // Test if backend is responding
        console.log('1. Testing backend health...');
        try {
            const health = await axios.get('http://localhost:5000/api/user/dashboard', {
                headers: {
                    'Authorization': 'Bearer invalid_token'
                }
            });
            console.log('   Response:', health.status);
        } catch (err) {
            console.log('   Expected error (401):', err.response?.status, err.response?.data?.message);
        }
        
        // Test aml-monitor endpoint
        console.log('\n2. Testing /api/aml-monitor/check-account-status...');
        try {
            const aml = await axios.get('http://localhost:5000/api/aml-monitor/check-account-status', {
                headers: {
                    'Authorization': 'Bearer invalid_token'
                }
            });
            console.log('   Response:', aml.status);
        } catch (err) {
            console.log('   Status:', err.response?.status);
            console.log('   Message:', err.response?.data?.message);
            if (err.response?.status === 404) {
                console.log('   ❌ ROUTE NOT FOUND! This is the problem.');
            } else if (err.response?.status === 401) {
                console.log('   ✅ Route exists (401 = auth required, which is expected)');
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEndpoints();
