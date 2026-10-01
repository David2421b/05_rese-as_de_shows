# Festival Picnic 2026: API de reseñas

## Módulo

Este repositorio contiene el módulo 05, **Reseñas de shows**. La API permite consultar reseñas, obtener el promedio de un show y crear reseñas. El proyecto usa Node.js, Express, TypeScript y Prisma 7, y organiza el código en las capas `domain`, `application`, `infrastructure` e `interface`.

## Integrantes y aportes

- **David Hernandez:** GET de reseñas, consulta por ID y promedio por show.
- **Juan José Cano Giraldo:** POST de reseñas: validación de datos y referencias, reglas de boleta activa y reseña duplicada, y guardado en la base de datos.
- **Tomas Granda:** implementación de PATCH para actualizar el puntaje o el comentario de una reseña.
- **Juan Pablo Tafur:** implementación de DELETE lógico para marcar una reseña como `REMOVED`.

## Aporte de Juan Pablo Tafur: DELETE lógico

Implementé el borrado lógico de reseñas con DELETE.

La ruta `DELETE /api/resenas/:id` elimina una reseña de forma lógica. No borra la fila de PostgreSQL: cambia su campo `state` a `REMOVED`.

El caso de uso está en `src/application/eliminar-resenas.use-case.ts`. Primero valida que el ID sea un entero positivo. Si es inválido, la API responde `400`. Si la reseña no existe o ya fue eliminada, responde `404`. Si la encuentra activa, el repositorio la marca como `REMOVED` y la API responde `200`

### Cómo se procesa la petición DELETE

- **Ruta — `src/interface/resenas.routes.ts`:** conecta `DELETE /:id` con el controlador.
- **Controlador — `src/interface/resenas.controller.ts`:** delega al caso de uso y devuelve `200`, `400` o `404`.
- **Caso de uso — `src/application/eliminar-resenas.use-case.ts`:** valida el ID y trata como no encontrada una reseña que no se pudo borrar.
- **Contrato de dominio — `src/domain/resenas.repository.ts`:** declara `borrarLogicamente`; el caso de uso depende de esta interfaz.
- **Repositorio — `src/infrastructure/prisma-resenas.repository.ts`:** cambia `state` a `REMOVED` si la reseña todavía no está eliminada.

### Cómo se prueba

Cuando el POST válido crea una reseña, la prueba pública **“DELETE hace borrado lógico y luego GET responde 404”** usa el ID devuelto, comprueba que DELETE responda `200` y que un GET posterior responda `404`.

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


### Cómo se procesa una petición GET

Para entender el recorrido, uso el promedio como ejemplo: Express recibe la URL y la ruta llama al controlador; el controlador pasa el parámetro al caso de uso; el caso de uso valida el ID y solicita los datos al repositorio; finalmente, el repositorio consulta PostgreSQL y devuelve el resultado para que el controlador responda en JSON.

- **Rutas — `src/interface/resenas.routes.ts`:** enlazan los métodos GET con sus funciones del controlador. La ruta específica del promedio está antes de `/:id`, así la palabra `show` no se interpreta como un ID.
- **Controlador — `src/interface/resenas.controller.ts`:** llama al caso de uso y responde con `200`, `400` o `404`, según el resultado. Los errores no esperados se envían al manejador de Express.
- **Casos de uso — `src/application/`:** `ListarResenas` valida filtros y prepara la paginación; `ObtenerResena` valida el ID y busca la reseña; `ObtenerPromedioResenas` valida el ID del show y solicita su promedio.
- **Contratos de dominio — `src/domain/resenas.repository.ts`:** definen las operaciones que los casos de uso necesitan, sin depender directamente de Prisma.
- **Repositorio — `src/infrastructure/prisma-resenas.repository.ts`:** implementa esas operaciones con consultas a PostgreSQL. En el listado usa condiciones para los filtros, parámetros para los valores y `LIMIT`/`OFFSET` para traer la página. Para el promedio consulta `COUNT` y `AVG`, contando solo las reseñas con estado `ACTIVE` y redondeando el resultado a dos decimales.

## Aporte de Tomas Granda: actualización con PATCH

La ruta `PATCH /api/resenas/:id` permite cambiar únicamente el puntaje o el comentario. La validación de los campos está en `src/application/validar-actualizacion-resena.ts`; el caso de uso está en `src/application/actualizar-resena.use-case.ts` y el repositorio actualiza la fila en `src/infrastructure/prisma-resenas.repository.ts`. Si encuentra una reseña activa y los datos son válidos, la API responde `200` con la reseña actualizada dentro de `data`.

## Aporte de Juan José Cano Giraldo: creación de reseñas con POST

La ruta `POST /api/resenas` recibe el ID del asistente, el ID del show, el puntaje y, si se desea, un comentario. El caso de uso está en `src/application/crear-resena.ts`. Antes de guardar, valida las referencias y comprueba las reglas del módulo. El repositorio de Prisma guarda la reseña en la tabla `resenas`.

Una reseña válida debe tener un puntaje entero entre 1 y 5. El comentario puede omitirse y no debe superar los 500 caracteres. Si se crea correctamente, la API responde con código `201` y devuelve la reseña creada.

### Regla de negocio y cómo la probamos

Antes de guardar una reseña, comprobamos que el asistente exista y tenga una boleta con estado `ACTIVE` para el mismo día en que se presenta el show. También comprobamos que no tenga otra reseña activa para ese show. Así, solo puede reseñar alguien con entrada válida y no se crean duplicados activos. Si no cumple alguna de estas dos reglas, la API responde `409`.

La decisión está en `src/application/crear-resena.ts`. La existencia del asistente y el día del show se validan en `src/application/validar-referencias-resena.ts`; las consultas de solo lectura a `asistentes`, `shows` y `boletas` están en `src/infrastructure/prisma-resenas.repository.ts`.

Probamos el POST con la suite pública del kit: `node kit-festival/kit-estudiantes/pruebas/correr.mjs resenas http://localhost:3000`. La suite incluye los casos de reseña duplicada y de asistente sin boleta, que deben responder `409`, y un caso de creación válida, que debe responder `201`. En la última ejecución compartida, las dos pruebas de reglas respondieron como se esperaba; el caso válido recibió `409` porque la consulta no encontró una boleta activa para los datos de prueba. No modificamos manualmente los datos precargados.

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

Ejecuta los comandos desde la carpeta del proyecto que contiene `package.json`. Deja la API corriendo y abre una segunda terminal en esa misma carpeta para ejecutar las pruebas.

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
