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

// deny all requests with a body
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.body) {
    return res.status(400).send('Body not allowed');
  }
  next();
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
