const http = require('http');

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const token = JSON.parse(data).token;

        // Now request daily profit
        const repReq = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/reports/daily-profit',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }, (repRes) => {
            let repData = '';
            repRes.on('data', (chunk) => repData += chunk);
            repRes.on('end', () => console.log('Report Response:', repRes.statusCode, repData));
        });
        repReq.on('error', (e) => console.error('Report error:', e));
        repReq.end();
    });
});

req.on('error', (e) => console.error('Request error:', e));
req.write(JSON.stringify({ username: 'admin', password: 'admin123' }));
req.end();
