import data from './data/productos.json';

export type Coleccion = 'nueva' | 'antigua' | 'bijuteria';
export interface Producto {
  coleccion: Coleccion;
  numero: number;
  descripcion: string;
  precio: number;
}

export const productos = data as Producto[];

export const secciones: { id: Coleccion; titulo: string; nav: string }[] = [
  { id: 'nueva', titulo: 'Colección Nueva', nav: 'Nueva' },
  { id: 'antigua', titulo: 'Colección Antigua', nav: 'Antigua' },
  { id: 'bijuteria', titulo: 'Bijutería', nav: 'Bijutería' },
];

/** «Bs 2.800»: separador de miles con punto. */
export const bs = (n: number) => `Bs ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

/** Enlaces internos y de recursos: respetan `base` y terminan en «/» cuando son páginas. */
export const withBase = (p: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
