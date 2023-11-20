const apps = ['ascii/', 'birds/', 'lavaflow/', 'portuguese/', 'ragdolls/', 'rain/', 'ryoiji/', 'starmap/', 'synth/', 'waves/'];

export async function onRequest({ request, env, params }) {
  const pathSegments = params.catchall;
  console.log('ATCHALl', JSON.stringify(pathSegments));

  if (!pathSegments) {
    const time = new Date().toISOString();
    const url = new URL(request.url);
    const app = apps[~~(Math.random() * apps.length)];
    console.log(`[${time}] CONGRATS YOU'RE GETTING: ${app}`);

    url.pathname = '/public/' + app;
    const randomApp = new Request(url, request)

    console.log(request.url, randomApp.url);
    return env.ASSETS.fetch(randomApp);
  }

  return env.ASSETS.fetch(request);
}

