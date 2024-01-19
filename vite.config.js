import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';

export default defineConfig({
  server: {
    https: {
      key: readFileSync('/etc/ssl/world-of-whimsy.key'),
      cert: readFileSync('/etc/ssl/world-of-whimsy.pem')
    },
	port: 443
  },
  plugins: [sveltekit()],
});
