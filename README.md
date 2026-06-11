# Tablero Gerencial de Google Sheets

Interfaz web estatica para acceder rapido a libros de Google Sheets y carpetas de Google Drive por proyecto, area, responsable, estado y prioridad.

## Como usarlo

1. Abre `index.html` en el navegador.
2. Edita `sheets.js` para reemplazar los datos de ejemplo por tus libros reales. Cada registro aparece automaticamente en las tarjetas y en el menu lateral.
3. En cada registro, pega el enlace completo del Google Sheet en `url`.
4. Si tambien quieres abrir la carpeta del proyecto en Google Drive, pega ese enlace en `driveUrl`.

Ejemplo:

```js
{
  name: "Nombre del proyecto",
  area: "Area",
  owner: "Responsable",
  status: "Activo",
  priority: "Alta",
  description: "Descripcion breve del libro.",
  url: "https://docs.google.com/spreadsheets/d/...",
  driveUrl: "https://drive.google.com/drive/folders/..."
}
```

## Como copiar las rutas

Para un libro de Google Sheets:

1. Abre el libro en Google Sheets.
2. Presiona `Compartir`.
3. Define el acceso correcto, por ejemplo restringido a tu cuenta institucional o a usuarios autorizados.
4. Presiona `Copiar enlace`.
5. Pega ese enlace en `url`.

Para una carpeta de Drive:

1. En Google Drive, abre la carpeta del proyecto.
2. Presiona clic derecho sobre la carpeta y elige `Compartir`.
3. Copia el enlace.
4. Pega ese enlace en `driveUrl`.

Si no necesitas boton de carpeta, puedes dejar `driveUrl` vacio o quitar esa linea del registro.

Importante: no uses enlaces incompletos como `https://drive.google.com/drive/folders/` o `https://docs.google.com/spreadsheets/`, porque no apuntan a un archivo o carpeta real. El tablero ahora evita abrir esos enlaces y muestra `pendiente` hasta que pegues el vinculo completo.

## Recomendacion

Usa estados consistentes como `Activo`, `En seguimiento`, `Finalizado` o `Pausado`; asi los filtros se mantienen claros para uso gerencial.
