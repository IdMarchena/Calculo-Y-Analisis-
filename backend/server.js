/*
 * Monitoría de Cálculo: backend
 * © Iván Darío Marchena Salgado. Todos los derechos reservados.
 *
 * - API REST en /api
 * - Sirve el frontend estático desde ../frontend (o desde FRONTEND_DIR)
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = process.env.FRONTEND_DIR || path.join(__dirname, '..', 'frontend');
const ORIGINS = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({ origin: ORIGINS.includes('*') ? '*' : ORIGINS }));
app.use(express.json({ limit: '50kb' }));

/* ---------------- API ---------------- */
const api = express.Router();

api.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() }));

api.get('/autor', (req, res) => res.json({
  nombre: 'Iván Darío Marchena Salgado',
  documento: '1082861728',
  telefono: '3006101547',
  barrio: 'María Eugenia',
  direccion: 'Calle 40 # 17-63',
  derechos: `© ${new Date().getFullYear()} Iván Darío Marchena Salgado. Todos los derechos reservados.`
}));

api.get('/temas', (req, res) => res.json([
  { id: 'dif-tan', area: 'Cálculo Diferencial', titulo: 'Derivada: recta tangente y recta normal' },
  { id: 'dif-opt', area: 'Cálculo Diferencial', titulo: 'Optimización de volúmenes' },
  { id: 'int-area', area: 'Cálculo Integral', titulo: 'Área bajo la curva' },
  { id: 'int-entre', area: 'Cálculo Integral', titulo: 'Área entre curvas' },
  { id: 'int-solido', area: 'Cálculo Integral', titulo: 'Sólido de revolución 3D' },
  { id: 'int-solidos', area: 'Cálculo Integral', titulo: 'Teoría y Ejercicio 26 (20 problemas)' }
]));

// Integración numérica: regla de Simpson compuesta para polinomios dados por coeficientes
// POST /api/integrar { "coef": [c0, c1, c2, ...], "a": 0, "b": 2, "n": 1000 }
api.post('/integrar', (req, res) => {
  const { coef, a, b } = req.body || {};
  let n = Math.min(Math.max(parseInt(req.body?.n, 10) || 1000, 2), 1e6);
  if (!Array.isArray(coef) || !coef.every(Number.isFinite) || !Number.isFinite(a) || !Number.isFinite(b))
    return res.status(400).json({ error: 'Parámetros inválidos. Se esperan coef (arreglo numérico), a y b (números).' });
  if (n % 2) n++;
  const f = x => coef.reduce((s, c, k) => s + c * x ** k, 0);
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  const exacto = coef.reduce((acc, c, k) => acc + c * (b ** (k + 1) - a ** (k + 1)) / (k + 1), 0);
  res.json({ metodo: 'Simpson compuesto', n, aproximado: (s * h) / 3, exacto });
});

app.use('/api', api);
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

/* ---------------- Frontend (opcional) ---------------- */
// Si la carpeta del frontend existe (ejecución local), se sirve también; en Render el frontend va como Static Site.
const fs = require('fs');
if (fs.existsSync(path.join(FRONTEND_DIR, 'index.html'))) {
  app.use(express.static(FRONTEND_DIR, {
    extensions: ['html'],
    setHeaders: (res, file) => { if (file.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache'); }
  }));
  app.get('*', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));
} else {
  app.get('/', (req, res) => res.json({ servicio: 'API Monitoría de Cálculo', rutas: ['/api/health', '/api/autor', '/api/temas', 'POST /api/integrar'] }));
}

app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));
