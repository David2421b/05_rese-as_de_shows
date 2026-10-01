# Festival Picnic 2026: API de resenas 

## Integrantes y aportes

- [David hernandez]: GET de reseñas, consulta por ID y promedio por show.
- [Juan jose cano giralod]: POST de reseñas, validaciones y reglas de negocio.
- [Tomas grande]: responsable de PATCH. Estado de implementación: pendiente.
- [Juan pablo tafur]: responsable de DELETE lógico. Estado de implementación: pendiente.

## Módulo

Módulo 05: Reseñas de shows.

La API permite consultar reseñas, consultar el promedio de un show y crear nuevas reseñas. Está desarrollada con Node.js, Express, TypeScript y Prisma, organizada en las capas `domain`, `application`, `infrastructure` e `interface`

## Instalar y ejecutar

Desde la carpeta del proyecto, instalar las dependencias:

```bash
npm install

Crear .env a partir de .env.example y agregar allí la cadena de conexión que entregó el docente. No subir .env a GitHub.

DATABASE_URL="cadena-de-conexion-del-docente"
PORT=3000

Sincronizar Prisma:

npm run sync

Iniciar la API:

npm run dev

Para correr las pruebas públicas, abrir otra terminal en la carpeta del proyecto y ejecutar:

node kit-festival/kit-estudiantes/pruebas/correr.mjs resenas http://localhost:3000

Como funciona el POST
La ruta POST /api/resenas recibe el ID del asistente, el ID del show, el puntaje y, si se desea, un comentario. El caso de uso está en src/application/crear-resena.ts. Antes de guardar, valida las referencias y comprueba las reglas del módulo. El repositorio de Prisma guarda la reseña en la tabla resenas.
una  resena válida debe tener un puntaje entero entre 1 y 5. El comentario puede omitirse y no debe superar los 500 caracteres. Si se crea correctamente, la API responde con código 201 y devuelve la reseña creada.

Regla de negocio que verificamos
Para reseñar un show, el asistente debe tener una boleta activa para el día en que se presenta. Además, no puede tener dos reseñas activas para el mismo show. Si intenta hacerlo, la API responde 409. Si la reseña anterior está retirada, puede crear otra.
Probamos estas reglas con el ejecutor público del kit. Este incluye casos para una boleta inexistente y para una reseña duplicada. El caso de creación válida usa un asistente y un show determinados; en la base compartida hay reseñas activas para esa combinación, así que puede responder 409. No cambiamos esos datos para forzar un 201; consultaremos al docente sobre ese caso.

La base es compartida. Este proyecto escribe en resenas y consulta asistentes, shows y boletas. No ejecutar prisma migrate ni prisma db push.