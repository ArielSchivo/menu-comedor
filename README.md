# 🍽️ Menú del Comedor

Calendario mensual del menú del comedor escolar, publicado gratis con **GitHub Pages**.
Para actualizarlo cada mes solo se edita **un archivo**: [`menu.json`](menu.json).

## Cómo actualizar el menú cada mes

1. Abrí el archivo [`menu.json`](menu.json).
2. Agregá un bloque para el mes nuevo dentro de `"meses"`. La clave es el año y mes en formato `AAAA-MM` (ejemplo: `"2026-09"` para septiembre 2026).
3. Dentro del mes, cada número es un **día** y su valor es la lista de platos:

   ```json
   "2026-09": {
     "1": ["Milanesa con puré", "Ensalada de frutas"],
     "2": ["Fideos con tuco", "Gelatina"],
     "3": ["Pollo al horno", "Fruta de estación"]
   }
   ```

4. Actualizá el campo `"actualizado"` (opcional, es el texto que aparece en el pie de página).
5. Guardá, hacé *commit* y *push*. La web se actualiza sola en un par de minutos.

> **Consejo:** solo hace falta cargar los días de semana (lunes a viernes). Los días
> sin menú simplemente quedan vacíos, así que podés omitir feriados y fines de semana.

## Publicar en GitHub Pages (una sola vez)

1. Creá un repositorio nuevo en GitHub (por ejemplo `menu-comedor`) y subí estos archivos.
2. En el repo, andá a **Settings → Pages**.
3. En **Source**, elegí la rama `main` y la carpeta `/ (root)`. Guardá.
4. Esperá un minuto: GitHub te muestra la URL pública (algo como
   `https://TU-USUARIO.github.io/menu-comedor/`).
5. Compartí esa URL con las familias. 🎉

## Archivos del proyecto

| Archivo                    | Para qué sirve                                        |
| -------------------------- | ----------------------------------------------------- |
| [`menu.json`](menu.json)   | **Los datos del menú.** Es el único archivo a editar. |
| [`index.html`](index.html) | La página.                                            |
| [`styles.css`](styles.css) | El diseño (colores, calendario, versión celular).     |
| [`app.js`](app.js)         | El código que arma el calendario a partir del JSON.   |

## Probar localmente

Abrir `index.html` directo en el navegador puede fallar al cargar `menu.json`
(por seguridad del navegador). Para probar, levantá un servidor simple:

```bash
python -m http.server 8000
```

Y entrá a <http://localhost:8000>.
