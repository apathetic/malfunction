import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';


// const apps = Object.keys(env.FILES).filter((ass) => ass.match(/index.html/));
const apps = ['ascii/', 'birds/', 'lavaflow/', 'portuguese/', 'ragdolls/', 'rain/', 'ryoiji/', 'starmap/', 'synth/', 'waves/'];
const appsX = [
  'ascii/index.6ff764cdcd.html',
  'birds/index.2badbe018e.html',
  'lavaflow/index.515a6a7156.html',
  'portuguese/index.2a99dc4c89.html',
  'ragdolls/index.9fe2cdd2e6.html',
  'rain/index.59962b8da1.html',
  'ryoji/index.f455f398e1.html',
  'starmap/index.8d5cf2e33d.html',
  'synth/index.a08b7434d5.html',
  'waves/index.7f912c1b00.html'
];

//////////////////// ❯ wrangler kv:key get ascii/index.6ff764cdcd.html  --namespace-id e9644c42f17342f1aec1b49af0245e34 --preview

export async function onRequest({ request, env, params, waitUntil }) {
    const time = new Date().toISOString();
    const url = new URL(request.url);
    const app = apps[~~(Math.random() * apps.length)];
    console.log(`[${time}] CONGRATS YOU'RE GETTING: ${app}`);

    // ----- UNDEFINED IN PROD. WORKS LOCALLY: ------------
    // const assetManifest = JSON.parse(env.__STATIC_CONTENT_MANIFEST);
    // ----------------------------------------------------


    // https://developers.cloudflare.com/pages/platform/functions/api-reference/#envassetsfetch
    // The env.ASSETS.fetch() function allows you to fetch a static asset from
    // your Pages project. Requests passed to the env.ASSETS.fetch() function
    // must be to the pretty path, not directly to the asset. For example, if
    // you had the path /users/index.html, you will request /users/ instead of
    // /users/index.html. This method call will run the header and redirect
    // rules, modifying the response that is returned.

    // ** BAD: ummmm does not work. This example is right from the docs (ie above)
    //    err: ✘ TypeError: Fetch API cannot load: /ragdolls/
    // return env.ASSETS.fetch(app);
    // return env.ASSETS.fetch('/public/' + app);

    // ** BAD: this example comes from the Workers-migragion page
    //    ...: unclear why it fails; no error message
    // return env.ASSETS.fetch(request);

    // ** BAD: `Error: KVError: there is no KV namespace bound to the script`
    // return await getAssetFromKV({ request, waitUntil });

    // ** BAD: also doesn't work
    //    err: env.FILES does not have `fetch`
    // const xxx = await env.FILES.fetch(app);

    // ** WORKS: but, shouldn't need to do this? Just use index.html
    // const xxx = await env.FILES.get('ascii/index.6ff764cdcd.html');


///// visiting
///   https://malfunction.pages.dev/public/ascii/
  /// works!

    // url.pathname = app; // app + 'index.html' // app // 'public' + app // 'public/' + app + 'index.html'
    url.pathname = '/public/' + app;
    const newRequest = new Request(url, request)

    console.log(request.url, newRequest.url, JSON.stringify(request.url), JSON.stringify(newRequest.url));


    // const x = await env.ASSETS.fetch(newRequest);
    return env.ASSETS.fetch(newRequest);





    return await getAssetFromKV({ request: newRequest, waitUntil });



    // guessing env.FILES is a Map. If so...

    // NO
    // IT Is
    // NOT
    // a
    // MAP
    //


    // const app = env.FILES.get([...env.FILES.keys()][~~(Math.random() * env.FILES.size)])
    // let keys = Array.from(env.FILES.keys());


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
