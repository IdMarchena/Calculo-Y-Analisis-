/*
 * Monitoría de Cálculo: backend para Cloudflare Workers
 * © Iván Darío Marchena Salgado. Todos los derechos reservados.
 *
 * Responde la API en /api/* y deja que Cloudflare sirva el frontend (../frontend) como archivos estáticos.
 */
const AUTOR = {
  nombre: 'Iván Darío Marchena Salgado',
  documento: '1082861728',
  telefono: '3006101547',
  barrio: 'María Eugenia',
  direccion: 'Calle 40 # 17-63'
};
const TEMAS = [
  { id: 'dif-tan', area: 'Cálculo Diferencial', titulo: 'Derivada: recta tangente y recta normal' },
  { id: 'dif-opt', area: 'Cálculo Diferencial', titulo: 'Optimización de volúmenes' },
  { id: 'int-area', area: 'Cálculo Integral', titulo: 'Área bajo la curva' },
  { id: 'int-entre', area: 'Cálculo Integral', titulo: 'Área entre curvas' },
  { id: 'int-solido', area: 'Cálculo Integral', titulo: 'Sólido de revolución 3D' },
  { id: 'int-solidos', area: 'Cálculo Integral', titulo: 'Teoría y Ejercicio 26 (20 problemas)' }
];

const json = (data, status = 200, env) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': (env && env.CORS_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
});

function integrar(body) {
  const { coef, a, b } = body || {};
  let n = Math.min(Math.max(parseInt(body && body.n, 10) || 1000, 2), 1e6);
  if (!Array.isArray(coef) || !coef.every(Number.isFinite) || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (n % 2) n++;
  const f = x => coef.reduce((s, c, k) => s + c * x ** k, 0);
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  const exacto = coef.reduce((acc, c, k) => acc + c * (b ** (k + 1) - a ** (k + 1)) / (k + 1), 0);
  return { metodo: 'Simpson compuesto', n, aproximado: (s * h) / 3, exacto };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/+$/, '');

    if (p.startsWith('/api')) {
      if (request.method === 'OPTIONS') return json(null, 204, env);
      if (p === '/api/health') return json({ status: 'ok', time: new Date().toISOString() }, 200, env);
      if (p === '/api/autor') return json({ ...AUTOR, derechos: `© ${new Date().getFullYear()} ${AUTOR.nombre}. Todos los derechos reservados.` }, 200, env);
      if (p === '/api/temas') return json(TEMAS, 200, env);
      if (p === '/api/integrar' && request.method === 'POST') {
        let body; try { body = await request.json(); } catch { body = null; }
        const r = integrar(body);
        return r ? json(r, 200, env) : json({ error: 'Parámetros inválidos. Se esperan coef (arreglo numérico), a y b (números).' }, 400, env);
      }
      return json({ error: 'Ruta no encontrada' }, 404, env);
    }

    // Todo lo demás: archivos del frontend
    return env.ASSETS.fetch(request);
  }
};
