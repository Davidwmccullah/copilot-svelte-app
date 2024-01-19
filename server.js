import { handler } from './build/handler.js';
import { readFileSync } from 'fs';
import express from 'express';
import https from 'https';

const PORT = 443;

const app = express();
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
