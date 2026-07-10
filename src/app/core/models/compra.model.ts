export interface DetalleCompra {
  id: number;
  producto_id: number;
  cantidad: number;
  /** Precio de venta de la línea (Decimal como string). */
  precio_unitario: string;
  /** Costo de la línea al momento de la venta (para ganancias). */
  costo_unitario: string;
}

export interface Compra {
  id: number;
  fecha: string;
  total: string;
  /** Existe en el backend (default 'pendiente') pero no se usa en la UI. */
  estado: string;
  cliente_id: number;
  metodo_pago_id: number;
  detalles: DetalleCompra[];
}

export interface DetalleCompraCreate {
  producto_id: number;
  cantidad: number;
}

export interface CompraCreate {
  cliente_id: number;
  metodo_pago_id: number;
  detalles: DetalleCompraCreate[];
}
