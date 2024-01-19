// import adapter from '@sveltejs/adapter-static';
// import preprocess from 'svelte-preprocess';

// export default {
//     kit: {
//         adapter: adapter({
//             // default options are shown. On some platforms
//             // these options are set automatically — see below
//             pages: 'build',
//             assets: 'build',
//             fallback: undefined,
//             precompress: false,
//             strict: true
//         }),
//     },
//     preprocess: preprocess(),
// };import { https } from 'https';
import { readFileSync } from 'fs';
import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import https from 'https';

const options = {
    key: readFileSync('/etc/ssl/world-of-whimsy.key'),
    cert: readFileSync('/etc/ssl/world-of-whimsy.pem')
  };
  
const createServer = (app) => https.createServer(options, app);

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({ createServer })
    },
    preprocess: preprocess()
};

export default config;
