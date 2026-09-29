# Reparto del módulo Reseñas

Estructura preparada para que cuatro integrantes implementen en paralelo. Cada persona trabaja en su caso de uso, adaptador de infraestructura y controlador dentro de su carpeta. La integración de rutas y las interfaces compartidas se acuerdan entre todos antes de conectar los módulos.

| Responsable | Métodos y rutas | Carpetas propias | Cobertura que debe considerar |
|---|---|---|---|
| 1 | GET `/api/resenas`, GET `/api/resenas/:id`, GET `/api/resenas/show/:showId/promedio` | `application/resenas/get`, `infrastructure/resenas/get`, `interface/resenas/get` | Lista paginada; filtros `show_id` y `asistente_id`; orden por ID; excluir `REMOVED`; paginación inválida; ID inválido o inexistente; promedio inicial 4.67 con total 3; promedio 0 sin reseñas; show inexistente. |
| 2 | POST `/api/resenas` | `application/resenas/post`, `infrastructure/resenas/post`, `interface/resenas/post` | Cuerpo inválido; campos obligatorios y tipos; puntaje entero 1–5; comentario máximo 500; IDs inexistentes; creación 201 con `data.id`. |
| 3 | PATCH `/api/resenas/:id` | `application/resenas/patch`, `infrastructure/resenas/patch`, `interface/resenas/patch` | Cambiar puntaje/comentario; rechazar campos no editables; validar valores; registro inexistente o removido. |
| 4 | DELETE `/api/resenas/:id` | `application/resenas/delete`, `infrastructure/resenas/delete`, `interface/resenas/delete` | Borrado lógico; respuesta 200; GET posterior 404; ID inválido; registro inexistente/removido; segundo borrado 404. |

## Coordinación compartida

- `domain/resenas/` contiene los tipos y contratos comunes; acuerden sus firmas antes de que cada responsable dependa de ellos.
- `interface/routes/` queda para integrar las rutas. Eviten que cada integrante edite el mismo archivo agregador; quien integre monta los módulos al final.
- Solo se escribe en `resenas`. `asistentes`, `shows` y `boletas` se consultan en modo lectura.
- El POST debe hacer cumplir las dos reglas de negocio del contrato: boleta activa del día del show y una sola reseña activa por asistente/show. Coordinen su interfaz de consulta con el responsable de GET o con quien defina el contrato compartido.
- No cambien los datos precargados: el ejecutor público depende de ellos y corre los casos en orden, usando el ID de reseña creado por POST para probar PATCH y DELETE.
- Cada responsable haga commits reales en su rama y abra un PR para integrar su módulo.
