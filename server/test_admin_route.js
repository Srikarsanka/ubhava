const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/festivals',
  method: 'GET',
  headers: {
    'Cookie': 'token=mock_token' // In a real scenario we need a valid token, but for now we check if route exists or if we get 401/403 which means route is there but protected. 
                                 // Actually, since I can't easily generate a valid JWT here without login, 
                                 // I will rely on the fact that if I get 401 it means the route IS registered (middleware hit).
                                 // If I get 404, it means route is missing.
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk.substring(0, 100)}...`); // Just peek
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
