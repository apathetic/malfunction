const apps = ['ascii/', 'birds/', 'lavaflow/', 'portuguese/', 'ragdolls/', 'rain/', 'ryoji/', 'starmap/', 'synth/', 'waves/'];

/**
 * This is all terrible i don't care really it's cloudflare's fault for
 * such a shit API and DX and even MORE terrible docs I couldn't figure
 * out a better way to _NOT_ rewrite EVERY. SINGLE. ASSET. REQUEST. but
 * oh well it is what it is
 * @param {*} param0
 * @returns
 */
export async function onRequest({ request, env, params }) {
  const url = new URL(request.url);
  const pathSegments = params.catchall;
  console.log('ATCHALl', JSON.stringify(pathSegments));

  if (!pathSegments) {
    const time = new Date().toISOString();
    const app = apps[~~(Math.random() * apps.length)];
    console.log(`[${time}] CONGRATS YOU'RE GETTING: ${app}`);
    url.pathname = '/public/' + app;
  } else {
    url.pathname = '/public/' + pathSegments.join('/'); // request.url.pathname;
  }

  const whoCares = new Request(url, request)
  console.log(request.url, whoCares.url);

  return env.ASSETS.fetch(whoCares);
}

