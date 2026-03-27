# Gastos Mensuales

App web minimalista para registrar y visualizar tus gastos mensuales. Interfaz oscura, almacenamiento local en el navegador, sin backend.

## Funcionalidades

- **Agregar gastos** con nombre, monto e icono
- **Deteccion automatica de iconos** - escribe "Spotify" y se selecciona el icono automaticamente
- **Grafico de anillos concentricos** - visualizacion unica con hover interactivo (glow + zoom)
- **Editar montos** - click en el monto para modificarlo
- **Eliminar gastos** desde la lista
- **Historial** - los meses pasados quedan registrados en una pestana aparte
- **Almacenamiento local** - tus datos se guardan en IndexedDB, no se envian a ningun servidor
- **Responsive** - funciona en desktop y mobile

## Tech Stack

- **Next.js 16** (App Router, static export)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **IndexedDB** via `idb`
- **react-icons** (SimpleIcons + Lucide)
- **SVG custom** para el grafico (sin librerias de charts)

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build

```bash
npm run build
```

Genera archivos estaticos en la carpeta `out/` que puedes desplegar en cualquier hosting estatico.
