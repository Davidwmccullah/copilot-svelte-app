import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

let conf = defineConfig({
	plugins: [sveltekit()]
});

if (process.env.NODE_ENV === 'production') {
	console.log('Running in production mode');
	conf.server = {
		host: '0.0.0.0',
		https: {
			key: readFileSync('/etc/ssl/world-of-whimsy.key'),
			cert: readFileSync('/etc/ssl/world-of-whimsy.pem')
		},
		port: 443
	};
} else {
	console.log('Running in development mode');
	conf.server = {
		host: 'localhost',
		port: 5000
	};
}

export default conf;