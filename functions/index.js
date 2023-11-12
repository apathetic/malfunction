import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';


import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON || '{}');
// const apps = Object.keys(assetManifest).filter((ass) => ass.match(/index.html/));

const apps = ['ascii', 'birds', 'lavaflow', 'portuguese', 'ragdolls', 'rain', 'ryoiji', 'starmap', 'synth', 'waves'];


export async function onRequest(context) {
    const { request, env, waitUntil } = context;
    const time = new Date().toISOString();

    // const assetManifest = JSON.parse(env.__STATIC_CONTENT_MANIFEST);
    // const apps = Object.keys(assetManifest).filter((ass) => ass.match(/index.html/));
    // const task = await context.env.FILES.get('ascii/ascii.4dabe0506f.html');
    // console.log(context.env);
  //   const task = await context.env.ASSETS.get('ascii/index.html');
  //   console.log(task);
  // return new Response(task);



    const app = apps[~~(Math.random() * apps.length)];
    console.log(`[${time}] CONGRATS YOU'RE GETTING: ${app}`);

    const url = new URL(request.url);
    url.pathname = app + '/index.html';

    const options = {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST, // assetManifest,
      mapRequestToAsset: (req) => mapRequestToAsset(new Request(url, req))
    };

    try {
      return await getAssetFromKV({ request, waitUntil }, options);
    } catch (e) {
      return new Response(`"${url.pathname}" not found`, { status: 404, statusText: 'NoT fOuNd' });
    }

};
