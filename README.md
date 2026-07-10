# V-Fit · Panel de Administración

Dashboard de administración para la tienda de suplementos **V-Fit**, construido con
**Angular 17** (standalone components + signals) y **Angular Material**, consumiendo
la API **FastAPI + PostgreSQL** (`V-Fit Backend`).

## Requisitos

- Node.js 20+
- El backend FastAPI corriendo en `http://127.0.0.1:8000`

## Ejecutar

```bash
npm install
npm start          # ng serve -> http://localhost:4200
npm run build      # build de producción en dist/
```

La URL del backend se configura en `src/environments/environment*.ts`
(`apiUrl`). Si el backend cambia de host/puerto, edítalo ahí.

> **CORS:** el backend debe permitir el origen `http://localhost:4200`.
> En FastAPI: `CORSMiddleware` con `allow_origins=["http://localhost:4200"]`.

## Arquitectura

Organización por **features**, con una capa `core` transversal y `shared` para
componentes reutilizables. Todos los componentes son *standalone* y las rutas
usan *lazy loading*.

```
src/
├── environments/            # apiUrl por entorno (dev / prod)
└── app/
    ├── core/                # Lógica sin UI, singleton
    │   ├── models/          # Interfaces alineadas 1:1 con los esquemas del backend
    │   ├── services/        # Un servicio HTTP por entidad + notificaciones
    │   └── interceptors/    # error.interceptor: traduce errores 422/500 a snackbars
    ├── layout/
    │   └── main-layout/     # Shell: toolbar + sidenav con navegación
    ├── shared/
    │   └── confirm-dialog/  # Diálogo de confirmación reutilizable
    ├── features/
    │   ├── dashboard/       # KPIs, pedidos por estado, stock bajo, últimos pedidos
    │   ├── categorias/      # CRUD (lista + form dialog)
    │   ├── clientes/        # CRUD (lista + form dialog)
    │   ├── productos/       # CRUD (lista + form con categoría/stock/activo)
    │   └── pedidos/         # Lista, alta con líneas, detalle y cambio de estado
    ├── app.config.ts        # Providers: HttpClient + interceptor, Router, locale es
    └── app.routes.ts        # Rutas con lazy loading
```

### Convenciones

- **Modelos** (`core/models`): por cada entidad hay `Entidad`, `EntidadCreate` y
  `EntidadUpdate`, replicando los esquemas Pydantic del backend. Los campos
  `Decimal` (precio, total) llegan como `string` y se convierten con `Number()`
  solo para cálculos/visualización.
- **Servicios** (`core/services`): usan `inject(HttpClient)` y `environment.apiUrl`.
  Métodos: `listar`, `obtener`, `crear`, `actualizar`, `eliminar`
  (pedidos además: `cambiarEstado`).
- **Estado en componentes**: se usa `signal()` / `computed()` en lugar de
  propiedades mutables; las plantillas usan la sintaxis `@if` / `@for`.
- **Errores**: centralizados en `error.interceptor.ts`. No hace falta manejar el
  error en cada `subscribe`; el interceptor muestra un snackbar legible
  (incluye el desglose de los errores de validación 422 de FastAPI).

## Entidades y endpoints

| Entidad    | Endpoints                                              |
|------------|-------------------------------------------------------|
| Categorías | `GET/POST /categorias`, `GET/PUT/DELETE /categorias/{id}` |
| Clientes   | `GET/POST /clientes`, `GET/PUT/DELETE /clientes/{id}`     |
| Productos  | `GET/POST /productos` (skip/limit), `GET/PUT/DELETE /productos/{id}` |
| Pedidos    | `GET/POST /pedidos`, `GET /pedidos/{id}`, `PATCH /pedidos/{id}/estado` |

Estados de pedido: `pendiente · pagado · enviado · entregado · cancelado`.

## Cómo agregar una nueva entidad

1. Crea el modelo en `core/models/` y expórtalo en `index.ts`.
2. Crea el servicio en `core/services/` siguiendo el patrón existente.
3. Crea la carpeta en `features/<entidad>/` con `*-list` (+ `*-form` dialog).
4. Registra la ruta *lazy* en `app.routes.ts` y el ítem en `main-layout.component.ts`.
