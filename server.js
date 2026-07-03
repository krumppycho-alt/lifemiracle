const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = 8000;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const ifaces of Object.values(interfaces)) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// PC ↔ 모바일 작업 현황 공유 상태 (인메모리)
let sharedState = { games: null, deviceType: null, deviceId: null, timestamp: null };

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

http.createServer(function (request, response) {
  const { url, method } = request;

  // CORS preflight
  if (method === 'OPTIONS') {
    response.writeHead(204, CORS);
    response.end();
    return;
  }

  // GET /api/sync — 현재 공유 상태 조회
  if (url === '/api/sync' && method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
    response.end(JSON.stringify(sharedState));
    return;
  }

  // POST /api/sync — 공유 상태 업데이트
  if (url === '/api/sync' && method === 'POST') {
    let body = '';
    request.on('data', chunk => { body += chunk.toString(); });
    request.on('end', () => {
      try {
        const data = JSON.parse(body);
        sharedState = { ...data, timestamp: Date.now() };
        response.writeHead(200, { 'Content-Type': 'application/json', ...CORS });
        response.end(JSON.stringify({ ok: true }));
      } catch (e) {
        response.writeHead(400, CORS);
        response.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 정적 파일 서빙
  let filePath = '.' + url;
  if (filePath === './') filePath = './index.html';

  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if (error.code === 'ENOENT') {
        response.writeHead(404);
        response.end('404 Not Found');
      } else {
        response.writeHead(500);
        response.end('500 Error');
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });

}).listen(port);

const localIP = getLocalIP();
console.log('🏪 인생잡화점 서버 실행 중');
console.log(`  로컬:     http://localhost:${port}/`);
console.log(`  네트워크:  http://${localIP}:${port}/`);
console.log('');
console.log('📱 모바일에서 위 [네트워크] 주소로 접속하면 PC 작업 현황을 확인할 수 있습니다.');
