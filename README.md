# Monitoría de Cálculo Diferencial e Integral

Aplicativo web con fundamentos teóricos, ejercicios resueltos y simuladores interactivos en 2D y 3D: tangentes y normales, optimización, áreas, y sólidos de revolución.

© Iván Darío Marchena Salgado. Todos los derechos reservados.

## Estructura

```
├── frontend/        Aplicación web estática (PWA instalable, funciona sin conexión)
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icon*.png / icon.svg
├── backend/         Servidor Node.js + Express
│   ├── server.js    API REST en /api y servidor del frontend
│   └── package.json
└── render.yaml      Despliegue del backend en Render
```

## Ejecutar localmente

```bash
cd backend
npm install
npm start
# http://localhost:3000
```

## API

| Método | Ruta            | Descripción                                        |
|--------|-----------------|----------------------------------------------------|
| GET    | `/api/health`   | Estado del servidor                                |
| GET    | `/api/autor`    | Datos del autor y derechos                         |
| GET    | `/api/temas`    | Temas disponibles                                  |
| POST   | `/api/integrar` | Integral de un polinomio (Simpson) `{coef, a, b, n}` |

Ejemplo: `{"coef":[1,0,1],"a":0,"b":2}` calcula ∫₀² (1 + x²) dx = 14/3.

## Despliegue

**Opción A: todo junto en Render** (el backend también sirve el frontend)
1. En https://render.com elige *New → Blueprint* y conecta este repositorio (usa `render.yaml`).
2. Si lo haces a mano: *New → Web Service*, Root Directory `backend`, Build `npm install`, Start `npm start`.

**Opción B: separados en Render**
- **Frontend (Static Site):** Root Directory `frontend`, Build Command `npm run build`, Publish Directory `dist`.
- **Backend (Blueprint):** usa `render.yaml`. Configura `CORS_ORIGIN` con la URL del frontend.
