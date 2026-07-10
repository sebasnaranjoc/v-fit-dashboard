export interface MetodoPago {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface MetodoPagoCreate {
  nombre: string;
  activo?: boolean;
}

export type MetodoPagoUpdate = Partial<MetodoPagoCreate>;
