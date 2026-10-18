# AutoServi

API REST para órdenes de mantenimiento automotriz. El servidor, la base de datos, la autenticación y los módulos del taller están organizados en tres capas: rutas, controladores y servicios.

## Qué hay implementado

- Servidor Express con Helmet, CORS, límite de cuerpo JSON y rate limit global.
- Conexión a PostgreSQL y comprobación de salud de la base de datos.
- Esquema de 9 tablas para el taller.
- Usuarios de prueba.
- Login con JWT, registro de usuarios y control de acceso por rol.
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
    ordenService.js         Incluye la transacción de crear una orden
    inventarioService.js
    auditoriaService.js
  middleware/               Token, roles y auditoría
sql/
  01_crear_tablas.sql       Creación de las 9 tablas
  02_seed_data.sql          Usuarios de prueba
```

Una ruta llama a un controlador. El controlador llama a un servicio y traduce el resultado a un código HTTP. El servicio no conoce `req` ni `res`.

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

Roles permitidos en `usuarios`: `administrador`, `operador`, `consulta` y `auditor`.

## Configuración

Crear un archivo `.env` en la raíz (está ignorado por Git):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_clave
DB_NAME=autoservi
JWT_SECRET=una_clave_larga_y_secreta
JWT_EXPIRES_IN=8h
```

Crear la base, aplicar el esquema y cargar los usuarios de prueba:

```sql
CREATE DATABASE autoservi;
```

```bash
psql -d autoservi -f sql/01_crear_tablas.sql
psql -d autoservi -f sql/02_seed_data.sql
```

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

`npm start` levanta el servidor sin recarga automática. La API queda en `http://localhost:3000`.

## Endpoints disponibles

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/` | Público | Comprueba que la API responde |
| `GET` | `/api/health` | Público | Comprueba la conexión con PostgreSQL |
| `POST` | `/api/auth/login` | Público | Devuelve un JWT si las credenciales son válidas |
| `POST` | `/api/auth/registro` | Token y rol `administrador` | Crea un usuario con contraseña hasheada |
| `GET` | `/api/auth/perfil` | Token | Devuelve los datos del usuario autenticado |
| `GET` | `/api/auth/admin` | Token y rol `administrador` | Ruta de prueba del control por rol |

Las rutas protegidas esperan el encabezado `Authorization: Bearer <token>`.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "admin@autoservi.com",
  "password": "Password123!"
}
```

### Registro

```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Nuevo Usuario",
  "correo": "nuevo@autoservi.com",
  "password": "Password123!",
  "rol": "operador"
}
```

El registro exige token de administrador. El `rol` es obligatorio y solo acepta `administrador`, `operador`, `consulta` o `auditor`. Si falta o es otro valor, responde 400.

## Usuarios de prueba

El script `sql/02_seed_data.sql` documenta la contraseña `Password123!` para estas cuentas:

| Correo | Rol |
|---|---|
| `admin@autoservi.com` | `administrador` |
| `operador@autoservi.com` | `operador` |
| `consulta@autoservi.com` | `consulta` |
| `auditor@autoservi.com` | `auditor` |

## Seguridad ya aplicada

- Contraseñas guardadas con hash bcrypt (10 rondas).
- JWT firmado con `JWT_SECRET` y vencimiento configurable (`JWT_EXPIRES_IN`, por defecto 8 horas).
- Helmet y CORS limitado a `http://localhost:3001`.
- Rate limit global: 200 peticiones por IP cada 15 minutos.
- Cuerpo JSON limitado a 1 MB.
