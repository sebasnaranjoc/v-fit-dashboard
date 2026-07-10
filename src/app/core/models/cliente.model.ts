export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  creado_en: string;
}

export interface ClienteCreate {
  nombre: string;
  email: string;
  telefono?: string | null;
}

export type ClienteUpdate = Partial<ClienteCreate>;
