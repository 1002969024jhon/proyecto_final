# AutoServi

API REST para órdenes de mantenimiento automotriz. El servidor, la base de datos, la autenticación y los módulos del taller están organizados en tres capas: rutas, controladores y servicios.

## Qué hay implementado

- Servidor Express con Helmet, CORS, límite de cuerpo JSON y rate limit global.
- Conexión a PostgreSQL y comprobación de salud de la base de datos.
- Esquema de 9 tablas para el taller y bloqueo de edición de órdenes finalizadas.
- Datos de prueba: usuarios, clientes, vehículos, técnicos, repuestos y una orden con detalle.
- Login con JWT, registro de usuarios y control de acceso por rol.
- Módulos de clientes, vehículos, técnicos, repuestos, órdenes, inventario y auditoría.
- Capa de servicios: las consultas y la lógica de autenticación viven en `src/services`. Los controladores solo leen la petición y escriben la respuesta.

## Tecnologías

- Node.js con módulos ES
- Express 5
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`)
- Hash de contraseñas (`bcryptjs`)
- Helmet, CORS y `express-rate-limit`

## Estructura

```text
src/
  index.js                  Servidor y middlewares globales
  config/db.js              Pool de PostgreSQL
  routes/                   Rutas y permisos por rol
  controllers/              Petición HTTP y respuesta JSON
  services/                 Consultas a PostgreSQL y lógica de negocio
    authService.js          Login, hash, JWT y registro
    clienteService.js
    vehiculoService.js
    tecnicoService.js
    repuestoService.js
    ordenService.js         Transacción de crear una orden y finalizarla
    inventarioService.js
    auditoriaService.js
  middleware/               Token, roles, auditoría y límite del login
  utils/erroresHttp.js      Traduce errores de PostgreSQL a 400, 409 o 500
sql/
  01_crear_tablas.sql       Creación de las 9 tablas y los bloqueos
  02_seed_data.sql          Datos de prueba
  03_bloquear_orden_finalizada.sql
```

Una ruta llama a un controlador. El controlador llama a un servicio y traduce el resultado a un código HTTP. El servicio no conoce `req` ni `res`.

## Roles

| Rol | Puede |
|---|---|
| `administrador` | Gestionar usuarios y todas las entidades. Desactivar registros. Consultar inventario y auditoría. |
| `operador` | Crear y editar clientes, vehículos, técnicos, repuestos y órdenes. Consultar inventario. No administra usuarios ni auditoría. |
| `consulta` | Solo leer clientes, vehículos, técnicos, repuestos y órdenes. |
| `auditor` | Leer las entidades de negocio, el inventario y toda la auditoría. No modifica nada. |

Nadie puede modificar ni borrar filas de auditoría por la API. Una orden `finalizada` tampoco se puede editar: la base rechaza el cambio.

## Base de datos

`sql/01_crear_tablas.sql` crea estas tablas:

| Tabla | Uso |
|---|---|
| `usuarios` | Cuentas, hash de contraseña y rol |
| `clientes` | Dueños de los vehículos |
| `vehiculos` | Placa, marca, modelo y estado |
| `tecnicos` | Personal del taller |
| `repuestos` | Catálogo y stock |
| `ordenes` | Órdenes de mantenimiento |
| `detalle_orden` | Repuestos usados en cada orden |
| `inventario` | Movimientos de stock |
| `auditoria` | Registro de acciones sobre la API |

## Configuración

Copia `.env.example` a `.env` y cambia los valores. El archivo `.env` está ignorado por Git y no debe subirse.

```bash
copy .env.example .env
```

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=cambia_esta_clave
DB_NAME=autoservi
JWT_SECRET=cambia_este_secreto
JWT_EXPIRES_IN=8h
```

Crear la base, aplicar el esquema y cargar los datos de prueba:

```sql
CREATE DATABASE autoservi;
```

```bash
psql -d autoservi -f sql/01_crear_tablas.sql
psql -d autoservi -f sql/02_seed_data.sql
```

`sql/01_crear_tablas.sql` ya incluye el bloqueo de órdenes finalizadas. `sql/03_bloquear_orden_finalizada.sql` sirve para aplicarlo sobre una base creada antes de ese cambio.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

`npm start` levanta el servidor sin recarga automática. La API queda en `http://localhost:3000`.

Las rutas protegidas esperan el encabezado `Authorization: Bearer <token>`.

## Endpoints

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/` | Público | Comprueba que la API responde |
| `GET` | `/api/health` | Público | Comprueba la conexión con PostgreSQL |
| `POST` | `/api/auth/login` | Público | Devuelve un JWT si las credenciales son válidas |
| `POST` | `/api/auth/registro` | `administrador` | Crea un usuario con contraseña hasheada |
| `GET` | `/api/auth/perfil` | Token | Devuelve los datos del usuario autenticado |
| `GET` | `/api/auth/admin` | `administrador` | Ruta de prueba del control por rol |

El login acepta como máximo 5 intentos por IP cada 15 minutos. El sexto responde **429**.

```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "admin@autoservi.com",
  "password": "Password123!"
}
```

El registro exige token de administrador. El `rol` es obligatorio y solo acepta `administrador`, `operador`, `consulta` o `auditor`.

### Clientes, vehículos, técnicos y repuestos

Cada módulo tiene listado, detalle, alta, edición y desactivación. La desactivación es un borrado lógico (`activo = false`) y solo la hace el administrador.

| Método | Rutas | Lectura | Escritura | Desactivar |
|---|---|---|---|---|
| CRUD | `/api/clientes` | Todos los roles | Administrador y operador | Administrador |
| CRUD | `/api/vehiculos` | Todos los roles | Administrador y operador | Administrador |
| CRUD | `/api/tecnicos` | Todos los roles | Administrador y operador | Administrador |
| CRUD | `/api/repuestos` | Todos los roles | Administrador y operador | Administrador |

No se desactiva un vehículo con una orden `abierta`, ni un cliente que tenga un vehículo en esa situación.

Los listados aceptan filtros por query. Por ejemplo: `GET /api/clientes?nombre=Laura` o `GET /api/vehiculos?placa=ABC123`.

### Órdenes

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/ordenes` | Todos los roles | Lista órdenes. Filtros: `estado`, `tipo`, `vehiculo_id`, `tecnico_id`, `usuario_id`, `numero` |
| `GET` | `/api/ordenes/:id` | Todos los roles | Devuelve la orden y su detalle de repuestos |
| `POST` | `/api/ordenes` | Administrador y operador | Crea la orden, descuenta stock y registra el consumo en una transacción |
| `PUT` | `/api/ordenes/:id/finalizar` | Administrador y operador | Pasa la orden a `finalizada` y guarda `finalizada_en` |

`POST /api/ordenes` exige vehículo, técnico y al menos un repuesto. El total se calcula en el servidor. Si no hay stock, responde **400** y no deja una orden parcial. La auditoría de esa creación queda dentro de la misma transacción.

```json
{
  "vehiculo_id": 1,
  "tecnico_id": 1,
  "descripcion": "Cambio de aceite",
  "tipo": "preventivo",
  "mano_obra": 80000,
  "repuestos": [
    { "repuesto_id": 1, "cantidad": 2 }
  ]
}
```

### Inventario y auditoría

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/movimientos-inventario` | Administrador, operador y auditor | Lista entradas, consumos, ajustes y reversiones |
| `GET` | `/api/auditoria` | Administrador y auditor | Lista las acciones exitosas de escritura |

Los movimientos se filtran por `tipo`, `repuesto_id` y `usuario_id`. La auditoría se filtra por `accion`, `metodo`, `recurso` y `usuario_id`. Las consultas GET no generan auditoría.

## Códigos de respuesta

| Código | Cuándo |
|---|---|
| **400** | Datos incompletos, tipo inválido, stock insuficiente o una orden que no se puede finalizar |
| **401** | Falta el token o las credenciales no coinciden |
| **403** | El rol no tiene permiso |
| **404** | El recurso no existe |
| **409** | Documento, placa, código o correo repetido |
| **429** | Se superó el límite de intentos de login |
| **500** | Fallo interno, sin el mensaje crudo de PostgreSQL |

## Datos de prueba

`sql/02_seed_data.sql` carga la contraseña `Password123!` para estas cuentas:

| Correo | Rol |
|---|---|
| `admin@autoservi.com` | `administrador` |
| `operador@autoservi.com` | `operador` |
| `consulta@autoservi.com` | `consulta` |
| `auditor@autoservi.com` | `auditor` |

También carga dos clientes, dos vehículos (`ABC123` y `XYZ987`), dos técnicos, tres repuestos y la orden `ORD-001` con su detalle y el consumo de inventario.

## Seguridad ya aplicada

- Contraseñas guardadas con hash bcrypt (10 rondas).
- JWT firmado con `JWT_SECRET` y vencimiento configurable (`JWT_EXPIRES_IN`, por defecto 8 horas).
- Helmet y CORS limitado a `http://localhost:3001`.
- Rate limit global: 200 peticiones por IP cada 15 minutos.
- Rate limit del login: 5 intentos por IP cada 15 minutos.
- Cuerpo JSON limitado a 1 MB.
- Consultas SQL parametrizadas.
- Los errores de la base no se devuelven tal cual al cliente.
