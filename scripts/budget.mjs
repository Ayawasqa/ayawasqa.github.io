// Presupuesto de peso (wifi pobre). Falla el build si se pasa.
//   HTML + CSS + JS + logo (comprimidos, gzip -9) < 60 KB
//   Primera vista (esos + las fotos eager, en WebP) < 300 KB
//   Todas las fotos que baja un navegador (WebP, ancho mayor) < 3 MB; además se avisa del total en disco
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, extname } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const files = walk(dist);
const gz = (f) => gzipSync(readFileSync(f), { level: 9 }).length;
const code = files.filter((f) => ['.html', '.css', '.js', '.svg'].includes(extname(f)));
const codeBytes = code.reduce((n, f) => n + gz(f), 0);

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const rel = (u) => join(dist, u.replace(/^\/[^/]+\//, '')); // quita la base
const webpOf = (srcset) => {
  const best = srcset.split(',').map((s) => s.trim().split(/\s+/)).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0][0];
  return rel(best);
};
const pictures = [...html.matchAll(/<picture>(.*?)<\/picture>/g)].map((m) => m[1]);
const eager = pictures.filter((p) => /loading="?eager/.test(p));
const largestWebp = (p) => {
  const m = /<source[^>]*srcset="?([^">]+)"?[^>]*type="?image\/webp/.exec(p) ?? /<source[^>]*type="?image\/webp"?[^>]*srcset="?([^">]+)/.exec(p);
  return statSync(webpOf(m[1].replace(/&#38;/g, '&'))).size;
};
const firstView = codeBytes + eager.reduce((n, p) => n + largestWebp(p), 0);
const allWebp = pictures.reduce((n, p) => n + largestWebp(p), 0);
const onDisk = files.filter((f) => ['.webp', '.jpg', '.jpeg', '.png'].includes(extname(f))).reduce((n, f) => n + statSync(f).size, 0);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`presupuesto: html+css+js+svg ${kb(codeBytes)} (<60) · primera vista ${kb(firstView)} (<300, ${eager.length} fotos eager) · fotos WebP descargables ${kb(allWebp)} (<3072) · imágenes en dist ${kb(onDisk)}`);
let fail = false;
if (codeBytes > 60 * 1024) { console.error('FALLA: html+css+js+logo >= 60 KB'); fail = true; }
if (firstView > 300 * 1024) { console.error('FALLA: primera vista >= 300 KB'); fail = true; }
if (allWebp > 3 * 1024 * 1024) { console.error('FALLA: fotos >= 3 MB'); fail = true; }
if (onDisk > 3 * 1024 * 1024) console.warn('AVISO: todas las imágenes en dist (WebP + JPG de respaldo, 2 anchos) pasan de 3 MB; un navegador solo baja una variante');
process.exit(fail ? 1 : 0);
