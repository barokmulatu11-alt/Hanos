const http = require('http');
const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(__dirname, 'Hanos', 'landing-page', 'dist'),
  path.resolve(__dirname, 'landing-page', 'dist'),
  path.resolve(__dirname, 'dist'),
  path.resolve(process.cwd(), 'Hanos', 'landing-page', 'dist'),
  path.resolve(process.cwd(), 'landing-page', 'dist'),
  path.resolve(process.cwd(), 'dist')
];

let DIST_DIR = candidates.find(dir => fs.existsSync(dir));
if (!DIST_DIR) {
  DIST_DIR = path.resolve(__dirname, 'Hanos', 'landing-page', 'dist');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(DIST_DIR, reqPath);
    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('File Not Found');
        return;
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + e.message);
  }
});

let port = parseInt(process.env.PORT, 10) || 8080;

function startServer(p) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[dev] Port ${p} is in use, trying ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error('[dev] Server error:', err);
    }
  });

  server.listen(p, () => {
    console.log('\n  VOYAGER / HANOS DEV SERVER');
    console.log(`  > Local:   http://localhost:${p}/`);
    console.log(`  > Network: http://127.0.0.1:${p}/`);
    console.log(`  > Serving: ${DIST_DIR}\n`);
  });
}

startServer(port);
