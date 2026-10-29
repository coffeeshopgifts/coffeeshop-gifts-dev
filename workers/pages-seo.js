/**
 * Cloudflare Pages advanced worker: HTTP 200 for dynamic Waivio URLs
 * plus live title/description/canonical/og tags.
 */

const MCP_URL = 'https://waiviodev.com/query/mcp';
const SITE_ORIGIN = 'https://dev.coffeeshop.gifts';
const HOME_OBJECT_ID = '3v3mde-coffee-recipes';

async function mcpCall(name, args) {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });
  const payload = await response.json();
  const first = payload.result && payload.result.content && payload.result.content[0];
  if (first && typeof first.text === 'string') {
    try {
      return JSON.parse(first.text);
    } catch {
      return null;
    }
  }
  return null;
}

function fieldString(fields, key) {
  const value = fields && fields[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

async function seoFor(pathname) {
  const objectMatch = pathname.match(/^\/object\/([^/]+)(?:\/newsfeed)?\/?$/);
  if (objectMatch || pathname === '/' || pathname === '') {
    const objectId = objectMatch ? decodeURIComponent(objectMatch[1]) : HOME_OBJECT_ID;
    const data = await mcpCall('resolve_object', {
      object_id: objectId,
      update_types: ['name', 'title', 'description', 'image'],
    });
    if (!data) return null;
    const fields = data.fields || {};
    const name = fieldString(fields, 'name') || objectId;
    const title = fieldString(fields, 'title');
    const description = fieldString(fields, 'description');
    const image = fieldString(fields, 'image');
    const pageTitle = title ? `${name} — ${title}` : `${name} | CoffeeShop.Gifts`;
    return {
      title: pageTitle,
      description: description ? description.slice(0, 300) : `CoffeeShop.Gifts — ${name}`,
      image,
      canonical: objectMatch ? `${SITE_ORIGIN}/object/${objectId}` : `${SITE_ORIGIN}/`,
    };
  }

  const profileMatch = pathname.match(/^\/@([^/]+)\/?$/);
  if (profileMatch) {
    const account = decodeURIComponent(profileMatch[1]);
    const data = await mcpCall('get_user_profile', { account });
    const display = (data && (data.displayName || data.name)) || account;
    return {
      title: `${display} (@${account}) | CoffeeShop.Gifts`,
      description: (data && data.bio) || `Hive profile @${account} on CoffeeShop.Gifts`,
      image: data && data.avatarUrl,
      canonical: `${SITE_ORIGIN}/@${account}`,
    };
  }

  return null;
}

function applySeo(response, seo) {
  if (!seo) return response;
  const tags = [
    `<meta name="description" content="${escapeHtml(seo.description)}">`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}">`,
    `<meta property="og:url" content="${escapeHtml(seo.canonical)}">`,
    `<meta property="og:type" content="website">`,
  ];
  if (seo.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(seo.image)}">`);
  }
  return new HTMLRewriter()
    .on('title', {
      text(text) {
        if (!text.lastInTextNode) {
          text.remove();
          return;
        }
        text.replace(seo.title);
      },
    })
    .on('head', {
      element(el) {
        for (const tag of tags) el.append(tag, { html: true });
      },
    })
    .transform(response);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function asset(env, request, path) {
  const url = new URL(request.url);
  url.pathname = path;
  return env.ASSETS.fetch(new Request(url.toString(), request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith('/_next/') || path === '/favicon.ico' || /\.[a-zA-Z0-9]+$/.test(path)) {
      return env.ASSETS.fetch(request);
    }

    let response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const htmlPath = path.endsWith('/') ? `${path}index.html` : `${path}.html`;
      response = await asset(env, request, htmlPath);
    }
    if (response.status === 404) {
      response = await asset(env, request, '/404.html');
    }
    if (response.status === 404) {
      response = await asset(env, request, '/index.html');
    }

    const isHtml = (response.headers.get('content-type') || '').includes('text/html');
    const dynamic = path === '/' || path.startsWith('/object/') || path.startsWith('/@');
    if (!isHtml) return response;

    const headers = new Headers(response.headers);
    if (dynamic) headers.set('Cache-Control', 'public, max-age=60');

    let out = new Response(response.body, {
      status: dynamic ? 200 : response.status,
      headers,
    });

    if (dynamic) {
      try {
        const seo = await seoFor(path);
        out = applySeo(out, seo);
      } catch {
        // keep 200 HTML even if MCP is down
      }
    }
    return out;
  },
};
