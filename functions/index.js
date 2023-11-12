import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);
const apps = Object.keys(assetManifest).filter((ass) => ass.match(/index.html/));


export async function onRequest(context) {
    const { request, env, waitUntil } = context;
    const url = new URL(request.url);
    const options = {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST: assetManifest,
    };

    const app = apps[~~(Math.random() * apps.length)];
    console.log('CONGRATS YOU\'RE GETTING:', app);

    url.pathname = app;
    options.mapRequestToAsset = (req) => mapRequestToAsset(new Request(url, req));

    try {
      return await getAssetFromKV({ request, waitUntil }, options);
    } catch (e) {
      return new Response(`"${url.pathname}" not found`, { status: 404, statusText: 'NoT fOuNd' });
    }

};
