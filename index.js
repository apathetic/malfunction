import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);
const apps = Object.keys(assetManifest).filter((ass) => ass.match(/index.html/));


export default {
	async fetch(request, env,	ctx) {
    const url = new URL(request.url);
    const waitUntil = ctx.waitUntil.bind(ctx);
    const options = {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST: assetManifest,
    };

    if (url.pathname === '/') {
      const app = apps[~~(Math.random() * apps.length)];
      console.log('CONGRATS YOU\'RE GETTING:', app);

      url.pathname = app;
      options.mapRequestToAsset = (req) => mapRequestToAsset(new Request(url, req));
    }

    try {
      return await getAssetFromKV({ request, waitUntil }, options);
    } catch (e) {
      return new Response(`"${url.pathname}" not found`, { status: 404, statusText: 'NoT fOuNd' });
    }
	},
};
