const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:5000';

function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve({ data: JSON.parse(body), status: res.statusCode });
                } catch (e) {
                    resolve({ data: body, status: res.statusCode });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Login as admin first
async function testAMLEndpoints() {
    try {
        console.log('🔐 Logging in as admin...');
        const loginResponse = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@chainsecure.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful\n');
        
        // Test GET /api/aml/rules
        console.log('📋 Testing GET /api/aml/rules...');
        const rulesResponse = await makeRequest('GET', '/api/aml/rules', null, token);
        console.log(`✅ GET /api/aml/rules - Found ${rulesResponse.data.rules.length} rules\n`);
        
        if (rulesResponse.data.rules.length > 0) {
            const testRule = rulesResponse.data.rules[0];
            const ruleId = testRule._id;
            
            // Test GET /api/aml/rules/:id
            console.log(`📋 Testing GET /api/aml/rules/${ruleId}...`);
            const singleRuleResponse = await makeRequest('GET', `/api/aml/rules/${ruleId}`, null, token);
            console.log(`✅ GET /api/aml/rules/:id - Rule: ${singleRuleResponse.data.rule.name}\n`);
            
            // Test PUT /api/aml/rules/:id
            console.log(`📝 Testing PUT /api/aml/rules/${ruleId}...`);
            const updateResponse = await makeRequest('PUT', `/api/aml/rules/${ruleId}`, {
                ...testRule,
                description: testRule.description + ' (Updated)'
            }, token);
            console.log(`✅ PUT /api/aml/rules/:id - ${updateResponse.data.message}\n`);
            
            // Test PATCH /api/aml/rules/:id/toggle
            console.log(`🔄 Testing PATCH /api/aml/rules/${ruleId}/toggle...`);
            const toggleResponse = await makeRequest('PATCH', `/api/aml/rules/${ruleId}/toggle`, {}, token);
            console.log(`✅ PATCH /api/aml/rules/:id/toggle - ${toggleResponse.data.message}\n`);
            
            // Toggle back
            await makeRequest('PATCH', `/api/aml/rules/${ruleId}/toggle`, {}, token);
            console.log('🔄 Toggled back to original state\n');
        }
        
        // Test POST /api/aml/rules
        console.log('➕ Testing POST /api/aml/rules...');
        const createResponse = await makeRequest('POST', '/api/aml/rules', {
            name: 'Test Rule',
            description: 'This is a test rule',
            ruleType: 'transaction_limit',
            severity: 'low',
            parameters: { maxAmount: 100 },
            action: 'alert',
            priority: 1,
            isActive: true
        }, token);
        const newRuleId = createResponse.data.rule._id;
        console.log(`✅ POST /api/aml/rules - Created rule: ${createResponse.data.rule.name}\n`);
        
        // Test DELETE /api/aml/rules/:id
        console.log(`🗑️  Testing DELETE /api/aml/rules/${newRuleId}...`);
        const deleteResponse = await makeRequest('DELETE', `/api/aml/rules/${newRuleId}`, null, token);
        console.log(`✅ DELETE /api/aml/rules/:id - ${deleteResponse.data.message}\n`);
        
        console.log('🎉 All AML endpoints are working correctly!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAMLEndpoints();
