// Astro copia al dist los originales importados aunque la página solo use las variantes
// redimensionadas. Se borra todo archivo de dist/_astro que ni el HTML ni el CSS mencionan.
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const astro = join(dist, '_astro');
const refs = [join(dist, 'index.html'), ...readdirSync(astro).filter((f) => f.endsWith('.css')).map((f) => join(astro, f))]
  .map((f) => readFileSync(f, 'utf8')).join('\n');
let n = 0;
for (const f of readdirSync(astro)) {
  if (!refs.includes(f)) { rmSync(join(astro, f)); n++; }
}
console.log(`prune: ${n} archivos sin referencia borrados de dist/_astro`);
