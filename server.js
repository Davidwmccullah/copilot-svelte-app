import { https } from 'http';
import { readFileSync } from 'fs';
import app from './app.js';

const options = {
  key: readFileSync('/etc/ssl/world-of-whimsy.key'),
  cert: readFileSync('/etc/ssl/world-of-whimsy.pem')
};

https.createServer(options, app).listen(5000);