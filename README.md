# Festival Picnic 2026: API de reseñas

## Módulo

Este repositorio contiene el módulo 05, **Reseñas de shows**. La API permite consultar, crear, editar y eliminar lógicamente reseñas, además de obtener el promedio de un show. El proyecto usa Node.js, Express, TypeScript y Prisma 7, y organiza el código en las capas `domain`, `application`, `infrastructure` e `interface`.

## Integrantes y aportes

- **David Hernandez:** GET de reseñas, consulta por ID y promedio por show.
- **Juan José Cano Giraldo:** POST de reseñas: validación de datos y referencias, reglas de boleta activa y reseña duplicada, y guardado en la base de datos.
- **Tomas granda:** responsable de PATCH. Implementó la edición de puntaje y comentario.
- **Juan pablo tafur:** responsable de DELETE lógico. Estado de implementación: pendiente.

## **Juan Pablo Tafur:**

implementé el borrado lógico de reseñas con DELETE.

La ruta `DELETE /api/resenas/:id` elimina una reseña de forma lógica. No borra la fila de PostgreSQL: cambia su campo `state` a `REMOVED`.

El caso de uso está en `src/application/eliminar-resenas.use-case.ts`. Primero valida que el ID sea un entero positivo. Si es inválido, la API responde `400`. Si la reseña no existe o ya fue eliminada, responde `404`. Si la encuentra activa, el repositorio la marca como `REMOVED` y la API responde `200`

### Cómo se procesa la petición DELETE

- **Ruta — `src/interface/resenas.routes.ts`:** conecta `DELETE /:id` con el controlador.
- **Controlador — `src/interface/resenas.controller.ts`:** delega al caso de uso y devuelve `200`, `400` o `404`.
- **Caso de uso — `src/application/eliminar-resenas.use-case.ts`:** valida el ID y trata como no encontrada una reseña que no se pudo borrar.
- **Contrato de dominio — `src/domain/resenas.repository.ts`:** declara `borrarLogicamente`; el caso de uso depende de esta interfaz.
- **Repositorio — `src/infrastructure/prisma-resenas.repository.ts`:** cambia `state` a `REMOVED` si la reseña todavía no está eliminada.

### Cómo se prueba

La prueba pública **“DELETE hace borrado lógico y luego GET responde 404”** elimina la reseña creada durante la suite y comprueba que un GET posterior responda `404`.

## David Hernandez: los métodos GET

Implementé tres consultas. Todas empiezan por `/api/resenas`:

| Método y ruta | Función |
|---|---|
| `GET /api/resenas` | Devuelve una lista paginada de reseñas y permite filtrar por show o asistente. |
| `GET /api/resenas/:id` | Busca una reseña por su ID. |
| `GET /api/resenas/show/:showId/promedio` | Devuelve cuántas reseñas activas tiene un show y su promedio. |

### 1. Listar y filtrar reseñas

La lista acepta estos parámetros de consulta:

| Parámetro | Para qué sirve | Valor por defecto |
|---|---|---|
| `page` | Elegir la página de resultados. Debe ser un entero positivo. | `1` |
| `limit` | Elegir cuántos resultados traer por página. Debe estar entre 1 y 50. | `10` |
| `show_id` | Dejar solo las reseñas del show indicado. | Sin filtro |
| `asistente_id` | Dejar solo las reseñas del asistente indicado. | Sin filtro |

Ejemplo de petición:

```http
GET /api/resenas?page=1&limit=2&show_id=1
```

La respuesta incluye `pagination`, con el total de resultados, la página actual, el límite y el número total de páginas. La propiedad `data` contiene las reseñas encontradas. Por ejemplo:

```json
{
  "pagination": {
    "total": 3,
    "currentPage": 1,
    "limit": 2,
    "totalPages": 2
  },
  "data": [
    {
      "id": 1,
      "asistente_id": 1,
      "show_id": 1,
      "puntaje": 5,
      "comentario": "El cierre con Fuego fue increíble",
      "state": "ACTIVE",
      "created_at": "2026-09-27T19:26:43.116Z",
      "updated_at": "2026-09-27T19:26:43.116Z"
    },
    {
      "id": 2,
      "asistente_id": 2,
      "show_id": 1,
      "puntaje": 4,
      "comentario": "Muy buen show, el sonido se cortó un momento",
      "state": "ACTIVE",
      "created_at": "2026-09-27T19:26:43.116Z",
      "updated_at": "2026-09-27T19:26:43.116Z"
    }
  ]
}
```

El ejemplo usa las reseñas iniciales del contrato. Los resultados pueden variar si cambian los datos. La consulta se ordena por ID ascendente y omite registros cuyo estado es `REMOVED`. Los valores por defecto permiten hacer `GET /api/resenas` sin parámetros. Si un parámetro numérico no es entero positivo, o si `limit` es mayor que 50, la API devuelve `400`.

### 2. Consultar una reseña por ID

Ejemplo:

```http
GET /api/resenas/1
```

Cuando encuentra una reseña que no está eliminada, responde `200` con la reseña dentro de `data`:

```json
{
  "data": {
    "id": 1,
    "asistente_id": 1,
    "show_id": 1,
    "puntaje": 5,
    "comentario": "El cierre con Fuego fue increíble",
    "state": "ACTIVE",
    "created_at": "2026-09-27T19:26:43.116Z",
    "updated_at": "2026-09-27T19:26:43.116Z"
  }
}
```

El ID se valida antes de consultar la base. Si el formato no es un entero positivo, devuelve `400`. Si el ID no existe o la reseña está en estado `REMOVED`, devuelve `404`.

### 3. Consultar el promedio de un show

Ejemplo:

```http
GET /api/resenas/show/1/promedio
```

La respuesta contiene el ID del show, el total de reseñas activas y el promedio redondeado a dos decimales:

```json
{
  "data": {
    "show_id": 1,
    "total": 3,
    "promedio": 4.67
  }
}
```

El contrato usa como ejemplo el show 1 con tres reseñas y promedio `4.67`. Si el show existe, pero no tiene reseñas activas, el promedio es `0`. Un show inexistente produce `404`, y un `showId` inválido produce `400`.

### Cómo se procesa una petición GET

Para entender el recorrido, uso el promedio como ejemplo: Express recibe la URL y la ruta llama al controlador; el controlador pasa el parámetro al caso de uso; el caso de uso valida el ID y solicita los datos al repositorio; finalmente, el repositorio consulta PostgreSQL y devuelve el resultado para que el controlador responda en JSON.

- **Rutas — `src/interface/resenas.routes.ts`:** enlazan los métodos GET con sus funciones del controlador. La ruta específica del promedio está antes de `/:id`, así la palabra `show` no se interpreta como un ID.
- **Controlador — `src/interface/resenas.controller.ts`:** llama al caso de uso y responde con `200`, `400` o `404`, según el resultado. Los errores no esperados se envían al manejador de Express.
- **Casos de uso — `src/application/`:** `ListarResenas` valida filtros y prepara la paginación; `ObtenerResena` valida el ID y busca la reseña; `ObtenerPromedioResenas` valida el ID del show y solicita su promedio.
- **Contratos de dominio — `src/domain/resenas.repository.ts`:** definen las operaciones que los casos de uso necesitan, sin depender directamente de Prisma.
- **Repositorio — `src/infrastructure/prisma-resenas.repository.ts`:** implementa esas operaciones con consultas a PostgreSQL. En el listado usa condiciones para los filtros, parámetros para los valores y `LIMIT`/`OFFSET` para traer la página. Para el promedio consulta `COUNT` y `AVG`, contando solo las reseñas con estado `ACTIVE` y redondeando el resultado a dos decimales.

## Aporte de Juan: creación de reseñas con POST

La ruta `POST /api/resenas` recibe el ID del asistente, el ID del show, el puntaje y, si se desea, un comentario. El caso de uso está en `src/application/crear-resena.ts`. Antes de guardar, valida las referencias y comprueba las reglas del módulo. El repositorio de Prisma guarda la reseña en la tabla `resenas`.

Una reseña válida debe tener un puntaje entero entre 1 y 5. El comentario puede omitirse y no debe superar los 500 caracteres. Si se crea correctamente, la API responde con código `201` y devuelve la reseña creada.

### Regla de negocio y cómo la probamos

Para reseñar un show, el asistente debe tener una boleta activa para el día en que se presenta. Además, no puede tener dos reseñas activas para el mismo show. Esta regla evita reseñas de personas que no asistieron y duplicados activos.

La comprobación está en `src/application/crear-resena.ts`: primero consulta si existe una boleta activa para el día del show y luego si ya existe una reseña activa de ese asistente para ese show. Si se incumple alguna regla, el caso de uso genera un error de conflicto y la API responde `409`. La búsqueda de asistentes, shows y boletas se organiza en `src/application/validar-referencias-resena.ts` y en el repositorio de infraestructura.

La suite pública del kit incluye los casos **“Regla: una sola reseña por asistente y show (409)”** y **“Regla: solo reseña quien tiene boleta del día del show (409)”** para verificar estas respuestas. También incluye el caso de creación válida. Como la base es compartida y puede haber cambiado por ejecuciones anteriores, el resultado depende de que los datos estén en el estado que espera el kit; no cambiamos datos precargados manualmente.

## Aporte de Tomas: edición de reseñas con PATCH

`PATCH /api/resenas/:id` permite cambiar `puntaje`, `comentario` o ambos. El cuerpo debe incluir al menos uno de esos campos; el puntaje debe ser un entero entre 1 y 5 y el comentario puede ser texto de hasta 500 caracteres o `null` para limpiarlo. Enviar campos como `show_id` o `asistente_id` produce `400`. Una reseña inexistente o con `state = 'REMOVED'` produce `404`; una edición válida responde `200` con la reseña actualizada dentro de `data`.

La validación y el caso de uso están en `src/application/validar-cambios-resena.ts` y `src/application/actualizar-resena.use-case.ts`. El contrato del repositorio está en `src/domain/resenas.repository.ts`; la actualización SQL parametrizada está en `src/infrastructure/prisma-resenas.repository.ts`, y la ruta/controlador en `src/interface/`. Se puede probar enviando un PATCH válido a una reseña activa y luego consultándola con GET, además de probar un campo no editable, un puntaje fuera de rango y un ID inexistente.

## Instalar y ejecutar

Desde la carpeta raíz del proyecto, instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` a partir de `.env.example` y configurar ahí la cadena de conexión entregada para el proyecto. No subir `.env` ni credenciales reales a GitHub. La aplicación también acepta la variable `PORT`; por defecto utiliza el puerto `3000`.

Sincronizar el cliente Prisma con el esquema existente:

```bash
npm run sync
```

Iniciar la API:

```bash
npm run dev
```

Para hacer consultas GET manuales, con la API iniciada, se pueden usar estos comandos:

```bash
curl "http://localhost:3000/api/resenas?page=1&limit=2"
curl "http://localhost:3000/api/resenas/1"
curl "http://localhost:3000/api/resenas/show/1/promedio"
```

La suite pública completa se ejecuta desde la raíz del proyecto con:

```bash
node kit-festival/kit-estudiantes/pruebas/correr.mjs resenas http://localhost:3000
```

Esta suite no es solo de lectura: también ejecuta POST, PATCH y DELETE y puede escribir o cambiar reseñas en la base compartida. El contrato indica no modificar a mano los datos precargados. No ejecutar `prisma migrate` ni `prisma db push`; para sincronizar Prisma, el comando indicado para este proyecto es `npm run sync`.

## Base de datos

La base es compartida con otros equipos. Este módulo escribe únicamente en la tabla `resenas` y consulta `asistentes`, `shows` y `boletas` para validar las reglas de negocio. Por eso, las tablas y los datos precargados de otros módulos se tratan como solo lectura.
