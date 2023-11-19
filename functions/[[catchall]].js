const apps = ['ascii/', 'birds/', 'lavaflow/', 'portuguese/', 'ragdolls/', 'rain/', 'ryoiji/', 'starmap/', 'synth/', 'waves/'];

export async function onRequest({ request, env, params, waitUntil }) {

  const time = new Date().toISOString();
  const url = new URL(request.url);
  const app = apps[~~(Math.random() * apps.length)];
  // console.log(`[${time}] CONGRATS YOU'RE GETTING: ${app}`);

  console.log('ATCHALl', JSON.stringify(params.catchall));

  url.pathname = '/public/' + app;
  const newRequest = new Request(url, request)

  console.log(request.url, newRequest.url);


  // const x = await env.ASSETS.fetch(newRequest);
  return env.ASSETS.fetch(newRequest);

}

