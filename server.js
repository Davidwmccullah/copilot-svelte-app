import { handler } from './build/handler.js';
// import { https } from 'http';
import { readFileSync } from 'fs';
import express from 'express';

// const options = {
//   key: readFileSync('/etc/ssl/world-of-whimsy.key'),
//   cert: readFileSync('/etc/ssl/world-of-whimsy.pem')
// };

const app = express();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
	res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3000, () => {
	console.log('listening on port 3000');
});
