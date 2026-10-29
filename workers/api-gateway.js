/**
 * REST → MCP bridge for the pages-starter query-api client.
 * Serves https://api.coffeeshop.gifts/query/v1/*
 * Replace with a pass-through to /query/v1 when Waivio nginx publishes it.
 */

const MCP_URL = 'https://waiviodev.com/query/mcp';
const ALLOWED_ORIGINS = new Set([
  'https://dev.coffeeshop.gifts',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const CORS_HEADERS_BASE = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Accept-Language, X-Locale, X-Viewer, X-Governance-Object-Id, Authorization',
  'Access-Control-Max-Age': '86400',
};

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://dev.coffeeshop.gifts';
  return {
    ...CORS_HEADERS_BASE,
    'Access-Control-Allow-Origin': allow,
    Vary: 'Origin',
  };
}

function json(request, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

function contextArgs(request) {
  const args = {};
  const locale = request.headers.get('X-Locale') || request.headers.get('Accept-Language');
  if (locale) args.locale = locale.split(',')[0].trim();
  const viewer = request.headers.get('X-Viewer');
  if (viewer) args.viewer = viewer;
  const gov = request.headers.get('X-Governance-Object-Id');
  if (gov) args.governance_object_id = gov;
  return args;
}

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
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`MCP non-JSON (${response.status}): ${text.slice(0, 200)}`);
  }
  if (payload.error) {
    const err = new Error(payload.error.message || 'MCP error');
    err.status = 502;
    throw err;
  }
  const content = payload.result && payload.result.content;
  const first = Array.isArray(content) ? content[0] : null;
  if (first && typeof first.text === 'string') {
    try {
      return JSON.parse(first.text);
    } catch {
      return first.text;
    }
  }
  return payload.result ?? payload;
}

function decode(part) {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

function route(method, pathname, query, body) {
  const p = pathname.replace(/\/+$/, '') || '/';
  const m = method.toUpperCase();

  const match = (re) => {
    const found = p.match(re);
    return found ? found.slice(1).map(decode) : null;
  };

  if (m === 'POST' && p === '/query/v1/objects/resolve') {
    return {
      tool: 'resolve_object',
      args: {
        object_id: body.object_id,
        update_types: body.update_types,
        include_rejected: body.include_rejected,
        country: body.country,
      },
    };
  }
  if (m === 'POST' && p === '/query/v1/objects/resolve-nested') {
    return {
      tool: 'resolve_nested_objects',
      args: { ids: body.ids, update_types: body.update_types },
    };
  }
  if (m === 'GET' && p === '/query/v1/search') {
    return { tool: 'search', args: { q: query.q, limit: query.limit, type: query.type } };
  }
  if (m === 'GET' && p === '/query/v1/search/counts') {
    return { tool: 'search_counts', args: { q: query.q } };
  }
  if (m === 'GET' && p === '/query/v1/discover/objects') {
    return {
      tool: 'discover_objects',
      args: {
        object_type: query.object_type,
        q: query.q,
        tags: query.tags,
        sort: query.sort,
        cursor: query.cursor,
        limit: query.limit,
      },
    };
  }
  if (m === 'GET' && p === '/query/v1/discover/users') {
    return {
      tool: 'discover_users',
      args: { q: query.q, cursor: query.cursor, limit: query.limit },
    };
  }
  if (m === 'GET' && p === '/query/v1/currency/market') {
    return { tool: 'get_currency_market', args: {} };
  }

  let g;
  g = match(/^\/query\/v1\/users\/([^/]+)\/profile$/);
  if (m === 'GET' && g) return { tool: 'get_user_profile', args: { account: g[0] } };

  g = match(/^\/query\/v1\/users\/([^/]+)\/wallet\/waiv$/);
  if (m === 'GET' && g) return { tool: 'get_user_waiv_wallet', args: { account: g[0] } };

  g = match(/^\/query\/v1\/users\/([^/]+)\/wallet\/hive$/);
  if (m === 'GET' && g) return { tool: 'get_user_hive_wallet', args: { account: g[0] } };

  g = match(/^\/query\/v1\/objects\/([^/]+)\/followers$/);
  if (m === 'GET' && g) {
    return {
      tool: 'get_object_followers',
      args: { object_id: g[0], skip: query.skip, limit: query.limit },
    };
  }

  g = match(/^\/query\/v1\/objects\/([^/]+)\/posts$/);
  if (m === 'POST' && g) {
    return { tool: 'get_object_posts', args: { object_id: g[0], ...body, ...query } };
  }

  g = match(/^\/query\/v1\/posts\/([^/]+)\/([^/]+)$/);
  if (m === 'GET' && g) {
    return {
      tool: 'get_post',
      args: { author: g[0], permlink: g[1], currency: query.currency },
    };
  }

  g = match(/^\/query\/v1\/objects\/([^/]+)\/exists$/);
  if (m === 'GET' && g) return { tool: 'check_object_exists', args: { object_id: g[0] } };

  return null;
}

function compact(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v;
  }
  return out;
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    let body = {};
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const raw = await request.text();
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          return json(request, 400, { error: 'invalid JSON body' });
        }
      }
    }

    const query = Object.fromEntries(url.searchParams.entries());
    const mapped = route(request.method, url.pathname, query, body);
    if (!mapped) {
      return json(request, 404, { error: `no MCP mapping for ${request.method} ${url.pathname}` });
    }

    const args = compact({ ...mapped.args, ...contextArgs(request) });
    try {
      const data = await mcpCall(mapped.tool, args);
      return json(request, 200, data);
    } catch (err) {
      return json(request, err.status || 502, { error: String(err.message || err) });
    }
  },
};
