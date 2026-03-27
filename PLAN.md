# Plan: Expense Tracker Web App

## Contexto

Construir una app web de seguimiento de gastos mensuales sobre el proyecto Next.js 16 existente.

- **Interfaz**: Minimalista oscura (negro/blanco puro)
- **Almacenamiento**: Local en el dispositivo (IndexedDB)
- **Iconos**: Deteccion automatica de marcas (Spotify, Netflix, etc.)
- **Grafico**: Donut segmentado grueso con gaps entre segmentos
- **Moneda**: CLP ($) - pesos chilenos, sin decimales
- **Funcionalidad**: Agregar y eliminar gastos por mes

---

## Paquetes a instalar

| Paquete | Proposito | Peso |
|---------|-----------|------|
| `idb` | Wrapper de IndexedDB con Promises | ~2KB gzip |
| `react-icons` | Iconos de marcas (SimpleIcons) y genericos (Lucide) | Tree-shakeable, solo se incluyen los importados |

---

## Modelo de datos

```typescript
interface Expense {
  id: string;          // crypto.randomUUID()
  name: string;        // "Spotify", "Supermercado", etc.
  amount: number;      // monto en CLP (entero, sin decimales)
  icon: string;        // key del icon-map: "spotify", "food", etc.
  month: number;       // 1-12
  year: number;        // 2026
  createdAt: number;   // Date.now()
}
```

---

## Estructura de archivos

```
src/
  app/
    globals.css         → modificar - forzar dark mode, colores B&W
    layout.tsx          → modificar - metadata, clase dark en html
    page.tsx            → reescribir - shell principal del tracker
  lib/
    types.ts            → nuevo - interfaces TypeScript
    db.ts               → nuevo - capa IndexedDB con idb
    icon-map.ts         → nuevo - mapeo de marcas/categorias a iconos
    utils.ts            → nuevo - formateo CLP, helpers de fecha
  components/
    MonthSelector.tsx   → nuevo - navegacion mes anterior/siguiente
    DonutChart.tsx      → nuevo - SVG donut segmentado custom
    ExpenseList.tsx     → nuevo - lista de gastos del mes
    ExpenseItem.tsx     → nuevo - fila: icono + nombre + monto + eliminar
    AddExpenseModal.tsx → nuevo - modal para agregar gasto
    IconPicker.tsx      → nuevo - grilla de iconos seleccionables
    EmptyState.tsx      → nuevo - estado vacio "Sin gastos"
  hooks/
    useExpenses.ts      → nuevo - hook custom: CRUD + estado
```

---

## Implementacion paso a paso

### Fase 1: Configuracion base
1. `npm install idb react-icons`
2. Modificar `globals.css` - forzar tema oscuro, variables CSS negro/blanco puro
3. Modificar `layout.tsx` - metadata "Expense Tracker", clase `dark` en `<html>`
4. Modificar `next.config.ts` - agregar `output: 'export'` para deploy estatico

### Fase 2: Infraestructura
5. Crear `src/lib/types.ts` - interface Expense
6. Crear `src/lib/utils.ts` - `formatCLP()` (separador de miles con punto), helpers de mes/ano
7. Crear `src/lib/db.ts` - IndexedDB con indice compuesto `[year, month]`, funciones:
   - `getExpensesByMonth(year, month)` → Expense[]
   - `addExpense(expense)` → void
   - `deleteExpense(id)` → void
8. Crear `src/hooks/useExpenses.ts` - hook que expone:
   - `{ expenses, total, isLoading, addExpense, deleteExpense }`
   - Recibe `{ month, year }` como parametro

### Fase 3: Sistema de iconos
9. Crear `src/lib/icon-map.ts`:
   - Registro de ~25 iconos de marcas: Spotify, Netflix, Amazon, YouTube, Uber, Steam, Disney+, Apple, Google, Adobe, HBO, Twitch, PlayStation, Xbox, GitHub
   - Registro de ~15 iconos de categorias: comida, cafe, transporte, hogar, salud, gym, ropa, telefono, wifi, educacion, viaje, compras, musica, cine, default
   - Funcion `detectIcon(name)` - busca coincidencia por keywords en el nombre
   - Cada entrada tiene: `icon`, `keywords[]`, `category`, `color?` (color de marca opcional)
10. Crear `src/components/IconPicker.tsx` - grilla de iconos seleccionables con highlight

### Fase 4: Grafico donut
11. Crear `src/components/DonutChart.tsx` - SVG custom:
    - Usa `<circle>` con `stroke-dasharray` / `stroke-dashoffset` para cada segmento
    - `stroke-width` grueso (~14px) para el look "segmentado grueso"
    - Gaps de ~4-6px entre segmentos
    - Colores de marca cuando aplica (ej: Spotify verde), blanco/gris para genericos
    - Total en CLP centrado dentro del donut
    - Animacion de entrada con CSS transition

### Fase 5: Componentes UI
12. Crear `src/components/MonthSelector.tsx` - flechas izq/der + "Marzo 2026"
13. Crear `src/components/ExpenseItem.tsx` - fila con: icono + nombre + $monto + boton X eliminar
14. Crear `src/components/ExpenseList.tsx` - lista scrolleable de ExpenseItems
15. Crear `src/components/EmptyState.tsx` - mensaje minimalista "Sin gastos este mes"
16. Crear `src/components/AddExpenseModal.tsx` - modal overlay con:
    - Input de nombre (detecta icono automaticamente mientras escribes)
    - IconPicker (se auto-selecciona si `detectIcon` encuentra match)
    - Input de monto numerico
    - Boton confirmar

### Fase 6: Pagina principal
17. Reescribir `src/app/page.tsx` con `'use client'`:
    - Usa `useExpenses` hook
    - Compone: MonthSelector → DonutChart → ExpenseList → Boton flotante "+"
    - El boton "+" abre AddExpenseModal

### Fase 7: Polish y responsive
18. Transiciones CSS para modal (fade in/out)
19. Responsive: modal fullscreen en mobile, centered en desktop
20. Touch targets minimo 44px para mobile

---

## Decisiones tecnicas

| Decision | Razon |
|----------|-------|
| **IndexedDB** (no localStorage) | Queries estructuradas por [year, month], no bloquea main thread |
| **SVG custom** (no chart library) | Evita ~50KB de dependencia, control total del estilo donut |
| **Dark mode forzado** | Clase `dark` en `<html>`, sin toggle de tema |
| **Sin routing** | App single-page, navegacion por mes es estado interno |
| **Sin state library** | Un hook `useExpenses` con useState/useEffect es suficiente |
| **Montos enteros CLP** | Sin decimales, formateado con punto como separador de miles |
| **`crypto.randomUUID()`** | IDs unicos sin dependencias, soportado en todos los browsers modernos |

---

## Verificacion

- [ ] `npm run dev` - app carga sin errores
- [ ] Agregar gasto "Spotify" - auto-detecta icono de Spotify
- [ ] Agregar gastos variados - donut se actualiza con segmentos
- [ ] Eliminar un gasto - desaparece de lista y donut
- [ ] Cambiar de mes - gastos se filtran correctamente
- [ ] Recargar pagina - datos persisten (IndexedDB)
- [ ] Viewport mobile - modal y UI son responsivos
- [ ] `npm run build` - build estatico exitoso
