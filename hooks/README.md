# Hooks de Usuario

Este directorio contiene hooks reutilizables para manejar el estado y las actualizaciones del usuario.

## `useUser`

Hook para obtener y manejar el estado del usuario desde la API.

### Uso básico:

```tsx
import { useUser } from "@/hooks/use-user";

function MyComponent() {
  const { user, loading, error, refetch } = useUser();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No hay usuario</div>;

  return (
    <div>
      <p>Usuario: {user.name}</p>
      <button onClick={refetch}>Refrescar datos</button>
    </div>
  );
}
```

### Retorno:

- `user`: Datos del usuario (`DonorData | InstitutionData | null`)
- `loading`: Estado de carga durante el fetch inicial
- `error`: Error si ocurre durante el fetch (`Error | null`)
- `refetch`: Función para refrescar los datos del usuario manualmente

### Opciones:

- `enabled`: Controla si se debe hacer fetch automáticamente (por defecto: `true`)

```tsx
const { user, refetch } = useUser({ enabled: false }); // No hace fetch automático
```

## `useUpdateUser`

Hook para actualizar los datos del usuario. Los toasts de éxito/error se manejan automáticamente.

**Nota importante:** Este hook usa `user.user_id` directamente, por lo que no requiere llamadas adicionales a la API de autenticación. El objeto `user` debe ser obtenido previamente con `useUser`.

### Uso básico:

```tsx
import { useUpdateUser } from "@/hooks/use-update-user";
import { useUser } from "@/hooks/use-user";
import type { DonorEditFormSchema, InstitutionEditFormSchema } from "@/lib/validations";

function EditProfileForm() {
  const { user, refetch } = useUser();
  const { updateUser, isLoading } = useUpdateUser();

  const handleSubmit = async (data: DonorEditFormSchema | InstitutionEditFormSchema) => {
    const success = await updateUser(data, user);
    if (success) {
      refetch(); // Refrescar datos después de actualizar exitosamente
      // Cerrar modal/drawer, etc.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos del formulario ... */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Actualizando..." : "Guardar"}
      </button>
    </form>
  );
}
```

### Parámetros de `updateUser`:

- `data`: Datos del formulario validados (`DonorEditFormSchema | InstitutionEditFormSchema`)
- `user`: Objeto de usuario obtenido de `useUser` (`DonorData | InstitutionData | null`)

### Retorno:

- `updateUser`: Función asíncrona que actualiza el usuario. Retorna `Promise<boolean>`:
  - `true` si la actualización fue exitosa
  - `false` si hubo un error
  - Los toasts de éxito/error se muestran automáticamente
- `isLoading`: Estado de carga durante la actualización (`boolean`)

### Comportamiento:

- Detecta automáticamente el tipo de usuario (`donor` o `institution`) basándose en `user.role`
- Usa `user.user_id` directamente (no hace llamadas adicionales a la API)
- Muestra toasts automáticamente para éxito y errores
- Maneja errores de validación, autenticación y actualización

## Ejemplo de uso combinado

```tsx
import { useUser } from "@/hooks/use-user";
import { useUpdateUser } from "@/hooks/use-update-user";
import type { DonorEditFormSchema } from "@/lib/validations";

function ProfilePage() {
  const { user, loading, refetch } = useUser();
  const { updateUser, isLoading } = useUpdateUser();

  const handleUpdate = async (data: DonorEditFormSchema) => {
    const success = await updateUser(data, user);
    if (success) {
      refetch(); // Refrescar datos después de actualizar
    }
  };

  if (loading) return <div>Cargando usuario...</div>;
  if (!user) return <div>No hay usuario</div>;

  return (
    <div>
      {/* ... UI del perfil ... */}
      <button onClick={() => handleUpdate(formData)} disabled={isLoading}>
        {isLoading ? "Actualizando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
```

## Notas importantes

- El hook `useUpdateUser` requiere que el objeto `user` tenga la propiedad `user_id` (proporcionada por `useUser`)
- Los toasts se manejan automáticamente dentro del hook, no es necesario manejarlos manualmente
- El hook detecta automáticamente si el usuario es `donor` o `institution` basándose en `user.role`
- Siempre usa `refetch()` después de una actualización exitosa para mantener los datos sincronizados

