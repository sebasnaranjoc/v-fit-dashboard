export interface Categoria {
  id: number;
  nombre: string;
}

export interface CategoriaCreate {
  nombre: string;
}

export type CategoriaUpdate = Partial<CategoriaCreate>;
