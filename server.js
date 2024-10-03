import { handler } from './build/handler.js';
import { readFileSync } from 'fs';
import express from 'express';
import https from 'https';
import path from 'path';

const PORT = 443;
const app = express();

// Serve static files (e.g., favicon, images) before the SvelteKit handler
app.use(express.static(path.join(__dirname, 'static')));  // Adjust if needed

// Apply SvelteKit's handler at the end of the middleware chain
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    // Make sure the GET/HEAD requests don't have a body
    if (req.body) {
      return res.status(400).send('GET/HEAD requests should not have a body');
    }
  }
  handler(req, res, next);
});

const server = https.createServer({
  key: readFileSync('/etc/ssl/world-of-whimsy.key'),
  cert: readFileSync('/etc/ssl/world-of-whimsy.pem')
}, app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('listening', () => {
  console.log('Server started successfully');
});
