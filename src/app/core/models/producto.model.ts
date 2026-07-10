export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  /** El backend serializa Decimal como string. */
  precio_compra: string;
  precio_venta: string;
  stock: number;
  activo: boolean;
  categoria_id: number;
  creado_en: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string | null;
  precio_compra: number | string;
  precio_venta: number | string;
  stock?: number;
  activo?: boolean;
  categoria_id: number;
}

export type ProductoUpdate = Partial<ProductoCreate>;
