import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';


// const apps = ['ascii', 'birds', 'lavaflow', 'portuguese', 'ragdolls', 'rain', 'ryoiji', 'starmap', 'synth', 'waves'];


export async function onRequest(context) {
    const { request, env, waitUntil } = context;
    const time = new Date().toISOString();

    // ----- UNDEFINED IN PROD. WORKS LOCALLY: ------------
    // const assetManifest = JSON.parse(env.__STATIC_CONTENT_MANIFEST);
    // ----------------------------------------------------

    const task = await context.env.FILES.get('ascii/index.html');
    // console.log(context.env.FILES);
    // console.log(context.env.ASSETS);
    console.log(JSON.stringify(context.env.FILES));
    console.log(task);
    const apps = Object.keys(context.env.FILES).filter((ass) => ass.match(/index.html/));
  // return new Response(task);

    if (!task || !apps) {
      console.log('deerr');
      throw new Error(JSON.stringify(context));
    }

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
