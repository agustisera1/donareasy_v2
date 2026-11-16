---
paths:
  - "components/**"
  - "app/**/*.tsx"
  - "contexts/**"
  - "hooks/**"
  - "app/globals.css"
  - "tailwind.config.ts"
---

# Frontend / UI / UX

## Arquitectura de componentes (UI)

Los componentes se organizan en tres capas. **Antes de escribir markup nuevo, buscar si el patrón ya
existe como primitivo.**

```
components/ui/        Primitivos vendorizados de shadcn (Radix). NO editar a mano
      ↑               (se regeneran con `shadcn add`): Button, Input, Drawer, AlertDialog…
components/common/    Primitivos propios reutilizables, construidos sobre ui/.
      ↑               Agnósticos al dominio: no conocen donaciones, campañas, etc.
components/<feature>/ Componentes de feature: componen common/ + ui/ + actions.
                      campaigns/, donations/, institutions/, onboarding/, sidebar/, guest/
```

Regla de dependencia: `feature → common → ui`. Un primitivo de `common/` **nunca** importa de una
feature ni llama a una action: recibe datos y callbacks por props. Si algo de shadcn no alcanza, se
envuelve en `common/`, no se edita en `ui/`. Una feature no importa de otra feature.

### Tokens de diseño

Todo color, radio y tamaño sale de un token: variables CSS en `app/globals.css` (`:root` / `.dark`)
expuestas como utilidades en `tailwind.config.ts`. **Nunca hardcodear** un color (`text-green-600`,
`bg-[#…]`) ni un tamaño mágico (`text-[10px]`): si el token no existe, se define ahí con su par
light/dark y se usa la utilidad. El mismo valor a mano en dos lugares es la definición de un token
que falta. Un `dark:` legítimo solo ajusta la opacidad de un token existente (`bg-primary/10` →
`dark:bg-primary/20`), nunca introduce un color crudo.

Estados de dominio (pendiente, aceptada, rechazada, entregada) y categorías se mapean a tokens
semánticos en un solo lugar (p. ej. `status-badge.tsx`), no con clases sueltas en cada uso.

### Catálogo de `components/common/`

| Primitivo | Qué resuelve | Server-safe |
|-----------|--------------|-------------|
| `DataTable` | Tabla de datos (TanStack + `ui/table`): toolbar, filtros facetados, estados ("Cargando", error, vacío y vacío por filtros con `Empty` de shadcn), conteo y paginación. La feature pasa `errorMessage` desde el `error` de su query. Uso: `components/donations/donations-data-table.tsx` | Client |
| `DataTableColumnHeader` | Header ordenable alineado con la celda (`-ml-2.5` compensa el padding del `Button`) | Client |
| `DataTableFacetedFilter` | Filtro multi-select de valores enumerables con conteos (`getFacetedUniqueValues`); lo renderiza `DataTable` desde `facetedFilters` | Client |
| `DataTablePagination` | `Pagination` de shadcn con links `?page=N` (`Button asChild` + `Link`) | Client |
| `DataTableRowAction` | Botón de acción solo-ícono con `Tooltip` y `sr-only`; si está deshabilitado, lo envuelve en un `span` (patrón de Radix) | Client |
| `DataTableTabs` | Pestañas de la toolbar (`Tabs` de shadcn) sincronizadas con un search param; `parseTab` lee el valor | Client |

Candidatos a extraer cuando el refactor los toque (patrones que hoy se repiten a mano):

| Primitivo | Qué resuelve | Server-safe |
|-----------|--------------|-------------|
| `FormField`, `FieldError` | Fila de formulario: label + control + error (o texto de ayuda) | ✓ |
| `ConfirmDialog` | Confirmación de acción con efecto real (encapsula open + pending + retry) | Client |
| `EmptyState` | Estado vacío centrado (ícono + título + descripción + acción) | ✓ |
| `PageLayout` | Shell de página del dashboard: heading + slots `actions`/`toolbar` | ✓ |
| `Money` | Monto en ARS con `formatCurrency` y `tabular-nums` | ✓ |

Cada primitivo nuevo se suma a esta tabla con su referencia de uso.

### Reglas de consistencia

| Situación | Solución |
|-----------|----------|
| Encabezado + estructura de una página del dashboard | `PageLayout` — nunca rearmar el header con un `<h1>` y clases a mano en cada página |
| Fila de formulario (label + control + error) | `FormField` — nunca reconstruir el `<div className="grid gap-2">` a mano |
| Tabla de datos | `DataTable` — la feature solo define `columns`, `toolbar`, `actions` y `facetedFilters`. Sin anchos fijos (`size`, `table-fixed`, estilos inline): el ancho lo reparte el navegador. Página, pestaña, orden y filtros viven en la URL (`?page=`, `?view=`, `?sort=`, `?status=`). La carga muestra el texto "Cargando", sin puntos suspensivos |
| Columna de acciones de una tabla | `header: "Acciones"` y un `DataTableRowAction` por acción, con un label que diga qué hace ("Ver detalle", "Editar") |
| Filtro por valores enumerables (estado, categoría) | `facetedFilters` de `DataTable` + `filterFn: "arrIncludesSome"` en la columna; nunca un `filterFn` a mano ni un popover en el header |
| Mensaje de error de un campo suelto | `FieldError` (o el prop `error` de `FormField`) — nunca `<p className="text-sm text-red-500">` |
| Área de texto | `Textarea` de `ui/` — nunca un `<textarea>` con clases crudas |
| Monto en pesos | `formatCurrency` de `lib/utils.ts` (o `Money`) — nunca `toLocaleString` / `Intl` a mano |
| Fecha | `formatDate` de `lib/utils.ts` — nunca `toLocaleDateString` a mano |
| Etiqueta de categoría o método de entrega | `categoryTranslations` / `deliveryMethodTranslations` de `lib/constants.ts` |
| Acción con efecto real fuera de un form | `ConfirmDialog` (ver "Patrón de acciones de confirmación") |
| Prop de un Server Component a un Client Component | Solo datos serializables o un elemento ya renderizado (`icon={<X />}`); nunca la referencia a un componente o función |
| Trigger de un Dialog/Drawer | Se arma **dentro** del Client Component que tiene el Dialog; nunca llega pre-armado desde un Server Component |
| `Button` que navega | `<Button asChild><Link href="…">…</Link></Button>` |

### Diseño de estados

Un componente que muestra datos del server recibe las filas o `null` (la query falló) y cubre
**explícitamente los tres estados**: error, vacío y cargado. Si el dato llega como promesa (para
streamear bajo `<Suspense>`), la desenvuelve con `use()`. La carga se cubre con `loading.tsx` o un
`<Suspense fallback={<Skeleton />}>`, no con un `isLoading` manual.

```tsx
const rows = use(rowsPromise); // Promise<Row[] | null>, o directamente la prop
if (!rows) return <p className="text-sm text-muted-foreground">No se pudieron cargar las donaciones. Recargá la página.</p>;
if (rows.length === 0) return <EmptyState … />;
return <DonationsTable data={rows} />;
```

### Partición de un componente de feature en archivos

Cuando un componente de feature **acumula varios sub-componentes, mezcla lógica pura con rendering,
o junta estado/efectos con presentación**, se parte en una carpeta con un archivo por
responsabilidad. Cada archivo aísla una dependencia distinta (React vs. lógica pura, estado vs.
markup). Candidatos claros hoy: los `*-data-table.tsx` y los `*-drawer.tsx`.

| Archivo | Responsabilidad | `"use client"` |
|---------|-----------------|----------------|
| `<feature>.tsx` | Orquestador: default export, cablea las piezas, sostiene el hook y el layout | Sí (usa el hook) |
| `use-<feature>.ts` | Hook: estado, efectos | Sí |
| `<feature>-model.ts` | **Lógica pura**: transformaciones, derivados (columnas, filtros, totales) y sus tipos. Sin React, sin I/O | No |
| `types.ts` | Tipos compartidos entre las piezas | No (solo tipos) |
| `<pieza>.tsx` | Cada bloque presentacional | Solo si tiene hooks/interactividad |

**Regla de `"use client"`:** solo el orquestador, el hook y las piezas con estado/eventos propios
llevan la directiva. Un componente presentacional sin hooks no la necesita aunque se renderice
dentro del árbol cliente.

**Naming:** archivos en kebab-case; el default export vive en `<feature>.tsx`.

---

## Efectos y estado externo

Basado en la guía oficial de React ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect),
[Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects),
[`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)). Un `useEffect` o
un estado manual que no encaja en una de estas reglas es un parche: se frena y se consulta antes de
escribirlo.

- **Un `useEffect` solo sincroniza con un sistema externo (red, DOM, timer, suscripción de
  Supabase), y si abre algo, lo cierra en su cleanup.** Verificación: cada `useEffect` de
  `components/`, `app/` y `hooks/` toca una API de afuera de React; lint
  (`react-hooks/set-state-in-effect` + el `no-restricted-syntax` de `eslint.config.mjs`) rechaza un
  setter o un `dispatch` síncrono en el cuerpo de un efecto.
- **Un prop que cambia nunca se copia a estado con un Effect.** En orden de preferencia: derivarlo
  en el render, resetear con `key`, o ajustar el estado durante el render guardando el valor anterior.
- **El estado mutable de afuera de React (media queries, conexión, una API del browser) se lee con
  `useSyncExternalStore`; nunca se espeja en un `useState` desde un efecto.** Caso a corregir:
  `hooks/use-mobile.ts`.
- **Pedirle al server otra porción de datos (paginar, filtrar, buscar) es navegar:** el parámetro va
  en la URL, la página lo lee de `searchParams` y el control es un `<Link>` (o `router.replace` desde
  un input de búsqueda). Nunca un fetch del cliente con estado propio.

## Datos del server en el cliente (TanStack Query)

Ref: [TanStack Query — Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).

- **TanStack Query solo para datos que el cliente refetchea por su cuenta.** Lo que alcanza con
  leerse al render llega como prop desde un Server Component (`queries/`) y se refresca con
  `revalidatePath` en la action.
- **La query key incluye todos los inputs del `queryFn`** y sale de una factory por dominio
  (`donationKeys.list(filters)`), nunca de strings sueltos.
- **Una mutación invalida las keys que afecta** (`queryClient.invalidateQueries`) o hace
  `router.refresh()` si el dato vino del server; nunca un `refetch()` manual desde el componente.
- **La data del server no se copia a `useState` ni a un context.** Los contexts guardan solo estado
  de UI (drawer abierto, id seleccionado); el item seleccionado se deriva de la lista por id.
- **Los toasts los dispara el componente que inició la acción**, no el hook genérico.

---

## Patrón de formularios (RHF + Zod)

### Estructura obligatoria

```tsx
// 1. Schema Zod: el mismo que valida la action, en lib/validations/ (el form puede usar .pick/.omit).
import { createCampaignSchema, type CreateCampaignInput } from "@/lib/validations";

// 2. useForm con zodResolver
const {
  control,
  register,
  handleSubmit,
  setError,
  formState: { errors, isSubmitting, isSubmitSuccessful },
} = useForm<CreateCampaignInput>({
  resolver: zodResolver(createCampaignSchema),
  defaultValues: { ... },
});

// 3. onSubmit recibe los datos ya validados y llama a la action
async function onSubmit(data: CreateCampaignInput) {
  const result = await createCampaign(data);
  if (!result.ok) return void toast.error(result.error);
  toast.success("Campaña creada");
}

// 4. Éxito con isSubmitSuccessful (sin useState extra)
if (isSubmitSuccessful) return <SuccessUI />;
```

### Reglas

| Situación | Solución |
|-----------|----------|
| Fila de campo (label + control + error) | `FormField`: `<FormField label htmlFor error={errors.x?.message}>…control…</FormField>` |
| Control de entrada | `Input` / `Textarea` de `ui/` con `{...register("field")}` |
| Componente controlado (Select, Switch, DatePicker, Checkbox) | `<Controller control={control} name="field" render={...} />` |
| Observar un campo reactivamente | `useWatch({ control, name: "field" })` — **no** `watch("field")` (incompatible con React Compiler) |
| Función impura en el render (`Date.now()`, `Math.random()`, `crypto.randomUUID()`) | Capturarla una vez con `useState(() => …)` — nunca llamarla directo en el cuerpo del render |
| Estado de envío | `isSubmitting` de RHF — **no** `useState` |
| Estado de éxito | `isSubmitSuccessful` de RHF — **no** `useState` |
| Error `VALIDATION` de la action sobre un campo | `setError("field", { message })`; el resto, `toast.error(result.error)` |
| Estado local estructurado (varios campos relacionados + múltiples transiciones) | `useReducer` con reducer puro en un `.ts` aparte, no una maraña de `useState` |
| Atributo `required` en inputs | Omitir — Zod ya lo valida |

---

## Patrón de acciones de confirmación (`ConfirmDialog`)

Para acciones destructivas o irreversibles fuera de un formulario RHF (rechazar, finalizar,
eliminar), no usar `confirm()` nativo ni un `onClick` directo a la action. Usar **`ConfirmDialog`**
(`components/common/confirm-dialog.tsx`, a crear sobre `ui/alert-dialog.tsx`), que encapsula
`open` + pending + retry. Candidatos: `accept-donation-dialog`, `deliver-donation-dialog`,
`finish-campaign-dialog`.

```tsx
"use client";

export function FinishCampaignButton({ campaignId }: { campaignId: string }) {
  async function handleConfirm() {
    const result = await finishCampaign({ campaignId });
    if (!result.ok) {
      toast.error(result.error); // ya es friendly, se muestra directo
      return false;              // mantiene el diálogo abierto para reintentar
    }
    toast.success("Campaña finalizada");
  }

  return (
    <ConfirmDialog
      trigger={<Button variant="outline">Finalizar</Button>}
      title="¿Finalizar la campaña?"
      description="La campaña deja de recibir donaciones. No se puede deshacer."
      confirmLabel="Sí, finalizar"
      pendingLabel="Finalizando…"
      onConfirm={handleConfirm}
    />
  );
}
```

| Situación | Solución |
|-----------|----------|
| Error de la action | `toast.error(result.error)` y `return false` — el diálogo queda abierto |
| Éxito | `toast.success(...)` y devolver `undefined`/`true` — cierra el diálogo |
| Texto del botón durante el request | `pendingLabel` en gerundio ("Rechazando…", "Finalizando…") |
| Diálogo con contenido propio (p. ej. motivo de rechazo) | No usar `ConfirmDialog`: form RHF dentro de un `AlertDialog` con el mismo contrato de estados |

---

## Web Interface Guidelines

Subconjunto aplicable de [vercel.com/design/guidelines](https://vercel.com/design/guidelines). Todas
las verificaciones excluyen `components/ui/`.

### Accesibilidad y semántica

- **Todo botón solo-ícono tiene nombre accesible** (`<span className="sr-only">` o `aria-label`).
  Verificación: cada `size="icon"` lleva uno de los dos.
- **Nada de `div`/`span`/`li`/`tr` clickeable: lo interactivo es un `button` o un link.**
  Verificación: grep de `<(div|span|li|tr)[^>]*onClick` → 0.
- **Navegar es un `<Link>`; `router.push` solo después de una acción (submit, delete).**
- **Cada página define su título.** Verificación: cada `page.tsx` exporta `metadata` o
  `generateMetadata`.
- **Todo campo tiene label: `FormField`, o `aria-label` si el diseño no muestra uno.**
- **Las acciones no dependen del hover:** lo que aparece en hover también es visible con foco y en
  pantallas táctiles.

### Animación

- **Nunca `transition-all`: se transiciona solo la propiedad que cambia.** Verificación: grep → 0.
- **Toda animación respeta `prefers-reduced-motion`:** cada `animate-*` propio va con `motion-safe:`.

### Contenido

- **Todo el texto visible está en español (es-AR, voseo):** "Iniciá sesión", "Guardá los cambios".
- **Los textos de carga usan el carácter `…`, nunca `...`.** Verificación: grep de `...` dentro de
  strings y JSX de `.tsx` → 0. Excepción: tablas y fallbacks de página dicen "Cargando", sin `…`.
- **Imágenes con `next/image`, nunca `<img>`.** Verificación: grep de `<img` → 0.
- **Montos y conteos que se comparan llevan `tabular-nums`.**
- **El error de carga dice "No se pudo cargar <cosa>. Recargá la página."**
- **Títulos y botones con mayúscula solo inicial** ("Nueva campaña", "Donaciones recibidas").

### Formularios y estado

- **Los inputs de auth declaran `type` y `autoComplete`:** `email`, `current-password` (login),
  `new-password` (registro y cambio).
- **Los inputs de email llevan `autoCapitalize="none"` y `spellCheck={false}`.**
- **Nunca deshabilitar el submit por validez: se valida al enviar.** Verificación: grep de
  `disabled={` con `isValid` o `isDirty` → 0.
- **Filtros, búsqueda, paginación y tab activa viven en la URL** (`searchParams`), no en `useState`.
- **Los campos de texto se recortan en el schema** (`z.string().trim()`; email:
  `z.string().trim().pipe(z.email())`).
- **Toda zona con scroll dentro de un diálogo o drawer lleva `overscroll-contain`.**

### Tamaños y forma

- **Alto de viewport con `dvh`, nunca `h-screen`/`min-h-screen`.**
- **Inputs, triggers y botones con la altura y el radio de su componente de `ui/`;** sin `h-*` ni
  `rounded-*` encima.
- **Separadores con `Separator`, carga con `Skeleton`.** Verificación: grep de `h-px` y
  `animate-pulse` fuera de `ui/` → 0.
- **Solo lo clickeable tiene hover de elevación.**
