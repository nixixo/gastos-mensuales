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
  userId: string;      // ID del usuario (auth)
  name: string;        // "Spotify", "Supermercado", "LaMom", etc.
  amount: number;      // monto en CLP (entero, sin decimales)
  icon: string;        // key del icon-map: "spotify", "food", etc.
  date: string;        // ISO date string (YYYY-MM-DD)
  isMonthly: boolean;  // true si es gasto recurrente mensual
  month: number;       // 1-12
  year: number;        // 2026
  createdAt: number;   // Date.now()
}

interface NameMapping {
  id: string;          // crypto.randomUUID()
  userId: string;      // ID del usuario
  customName: string;  // "LaMom", "Netflix Fam", etc.
  iconKey: string;     // key del icono (ej: "food")
  createdAt: number;   // Date.now()
}

interface User {
  id: string;          // UUID from Supabase
  username: string;    // nombre de usuario (login)
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

### ✅ FASE 1: Supabase Integration + Modelo de Datos
1. ✅ Crear Supabase project y tablas: `users`, `expenses`, `name_mappings`
2. ✅ Agregar `.env.local` con credenciales Supabase
3. ✅ Crear `src/lib/supabase.ts` - cliente Supabase + `createOrGetUser()`
4. ✅ Actualizar `src/lib/types.ts` - agregar `date`, `isMonthly`, `userId`, nuevas interfaces

### ✅ FASE 2: Autenticacion + Rutas Protegidas
5. ✅ Crear `src/hooks/useAuth.ts` - login/logout con localStorage
6. ✅ Crear `src/components/AuthPage.tsx` - login form (solo username)
7. ✅ Crear `src/app/auth/page.tsx` - ruta de autenticacion
8. ✅ Reescribir `src/lib/db.ts` - Supabase + IndexedDB hybrid con CRUD
9. ✅ Actualizar `src/app/page.tsx` - proteger con auth, logout button
10. ✅ Actualizar `src/hooks/useExpenses.ts` - aceptar userId como param

### ✅ FASE 3: Mapeos Personalizados + Sugerencias
11. ✅ Crear `src/components/NameMappingManager.tsx` - UI para mappings
12. ✅ Crear `src/components/SettingsPage.tsx` - settings container
13. ✅ Crear `src/app/settings/page.tsx` - ruta de settings
14. ✅ Actualizar `src/components/AddExpenseModal.tsx` - autocomplete con suggestions
15. ✅ Agregar `date` picker y `isMonthly` checkbox al modal
16. ✅ Actualizar `src/components/History.tsx` - expandable acordeon por mes
17. ✅ Actualizar `src/components/ExpenseItem.tsx` - mostrar fecha y badge "Mensual"

### ✅ FASE 4: Gastos Recurrentes Mensuales
18. ✅ Crear `src/lib/recurring.ts` - logica para copiar expenses con `isMonthly=true`
19. ✅ Integrar `handleMonthlyRecurring()` en `useExpenses` hook
   - Cuando cambia mes/año, copia automáticamente gastos mensuales del mes anterior
   - Preserva día del mes en la nueva fecha
   - Evita duplicados usando ref con key `${userId}-${year}-${month}`

### Fase 5: Testing + Validacion
20. [ ] Verificar build sin errores: `npm run build`
21. [ ] Test manual: login → add gasto mensual → cambiar mes → verificar copia automatica
22. [ ] Test con settings: crear mapping → usar en gasto nuevo

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
