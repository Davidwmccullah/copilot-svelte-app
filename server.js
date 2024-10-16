import { handler } from './build/handler.js';
import { readFileSync } from 'fs';
import express from 'express';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 443;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'static')));

app.use((req, res, next) => {
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 0) {
    console.log('Denied request with Content-Length:', req.headers['content-length']);
    return res.status(400).send('Requests with a body are not allowed');
  }
  next();
});

app.use((req, res, next) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);

    next();
  } catch (error) {
    console.error('Invalid URL detected:', req.url);
    return res.status(400).send('Invalid URL');
  }
});

app.use(handler);

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