// Genera la carpeta dist/ con los archivos listos para publicar.
const fs = require('fs');
const path = require('path');

const src = __dirname;
const out = path.join(src, 'dist');
const excluir = new Set(['dist', 'node_modules', 'build.js', 'package.json', 'package-lock.json', 'netlify.toml', 'vercel.json']);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(src)) {
  if (excluir.has(f) || f.startsWith('.')) continue;
  fs.cpSync(path.join(src, f), path.join(out, f), { recursive: true });
  console.log('  ✓', f);
}
console.log('Build listo en dist/');
