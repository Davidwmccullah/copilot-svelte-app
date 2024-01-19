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
import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';


/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        // csp: {
		// 	directives: {
		// 		'script-src': ['self']
		// 	},
		// 	reportOnly: {
		// 		'script-src': ['self']
		// 	}
		// }
    },
    preprocess: preprocess()
};

export default config;
