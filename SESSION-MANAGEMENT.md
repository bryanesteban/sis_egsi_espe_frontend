# Session Management - SIEGSI

## Descripción General

El sistema SIEGSI implementa un sistema robusto de gestión de sesiones que monitorea la expiración de tokens JWT y permite al usuario renovar su sesión o cerrarla de forma segura.

## Características Implementadas

### 1. Backend - Duración del Token
- **Duración**: 2 minutos (120,000 ms)
- **Archivo**: `JwtUtil.java`
- **Configuración**: El token JWT expira automáticamente después de 2 minutos desde su emisión

### 2. Frontend - Monitoreo de Sesión

#### Componentes Principales

##### `useSessionManager` Hook
Ubicación: `app/hooks/useSessionManager.ts`

**Funcionalidad:**
- Decodifica el token JWT para obtener la fecha de expiración
- Verifica cada 5 segundos si el token está próximo a expirar
- Activa el modal cuando quedan menos de 30 segundos antes de la expiración
- Gestiona el contador regresivo de 30 segundos
- Auto-cierre de sesión si no hay acción del usuario

**Detalles Técnicos:**
```typescript
// Verifica expiración cada 5 segundos
checkIntervalRef.current = setInterval(checkTokenExpiration, 5000);

// Muestra modal cuando quedan ≤ 30 segundos
if (timeUntilExpiry <= 30 && !showModal) {
  startCountdown();
}
```

##### `SessionTimeoutModal` Component
Ubicación: `app/components/SessionTimeoutModal.tsx`

**Características:**
- Modal con diseño atractivo (gradientes naranja-rojo)
- Contador circular animado
- Dos botones de acción:
  - **Renovar Sesión**: Llama al endpoint `/refresh-token`
  - **Cerrar Sesión**: Cierra sesión inmediatamente
- Bloqueo de pantalla completa con backdrop blur

**Diseño:**
- Responsive y dark mode compatible
- Animación smooth del contador circular
- Iconos Lucide React
- Tailwind CSS para estilos

##### `SessionManager` Component
Ubicación: `app/components/SessionManager.tsx`

**Funcionalidad:**
- Integra el hook `useSessionManager` con el componente modal
- Se incluye globalmente en `layout.tsx`
- Activo en todas las páginas cuando el usuario está autenticado

### 3. Redux Integration

#### AuthSlice - Nueva Acción
Ubicación: `app/store/slices/authSlice.ts`

```typescript
refreshToken: (state, action: PayloadAction<string>) => {
  state.token = action.payload;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', action.payload);
  }
}
```

**Propósito:**
- Actualiza el token en el estado Redux
- Sincroniza con localStorage
- Mantiene la sesión activa sin recargar la página

## Flujo de Funcionamiento

### Caso 1: Token por Expirar (Usuario Activo)

1. **T=0min**: Usuario inicia sesión → Token válido por 2 minutos
2. **T=1min 30s**: Hook detecta que quedan ≤30 segundos
3. **Modal Aparece**: 
   - Muestra contador de 30 segundos
   - Usuario tiene dos opciones
4. **Opción A - Renovar**:
   - Click en "Renovar Sesión"
   - `authAPI.refreshToken(token)` → Nuevo token
   - Redux actualiza estado
   - Modal se cierra
   - Contador se reinicia
5. **Opción B - Cerrar**:
   - Click en "Cerrar Sesión"
   - Redux limpia estado
   - localStorage se limpia
   - Redirección a `/login`

### Caso 2: Sin Acción del Usuario

1. Modal aparece con 30 segundos
2. Contador regresivo: 30, 29, 28... 1, 0
3. **Al llegar a 0**:
   - Auto-logout ejecutado
   - Estado limpiado
   - Redirección automática a login

### Caso 3: Token Ya Expirado

1. Hook detecta `timeUntilExpiry <= 0`
2. Logout inmediato sin modal
3. Redirección a login

## Endpoints Backend Relacionados

### Login
```
POST /login
Body: { username, password }
Response: { token, username, rolename }
```

### Refresh Token
```
POST /refresh-token
Headers: Authorization: Bearer <token>
Response: <new_token>
```

## Configuración

### Backend
Para cambiar la duración del token, modificar `JwtUtil.java`:

```java
// Actual: 2 minutos
.setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 2))

// Ejemplo: 1 hora
.setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
```

### Frontend
Para ajustar cuándo aparece el modal, modificar `useSessionManager.ts`:

```typescript
// Actual: Modal aparece con 30 segundos restantes
if (timeUntilExpiry <= 30 && !showModal) {

// Ejemplo: Modal aparece con 1 minuto restante
if (timeUntilExpiry <= 60 && !showModal) {
```

Para cambiar el tiempo de decisión del modal:

```typescript
// Actual: 30 segundos para decidir
const [countdown, setCountdown] = useState(30);

// Ejemplo: 1 minuto para decidir
const [countdown, setCountdown] = useState(60);
```

## Pruebas

### Test Manual
1. Iniciar sesión en http://localhost:3000/login
2. Ir a home page
3. **Esperar 1 minuto y 30 segundos**
4. Verificar que aparece el modal con contador
5. **Opción 1**: Click "Renovar Sesión" → Verificar que modal se cierra
6. **Opción 2**: No hacer nada → Verificar auto-logout después de 30s

### Inspección de Token
Abrir DevTools Console:
```javascript
// Ver token actual
localStorage.getItem('token')

// Decodificar manualmente
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expira:', new Date(payload.exp * 1000));
```

## Seguridad

### Medidas Implementadas
✅ Token de corta duración (2 minutos)
✅ Renovación explícita del usuario
✅ Auto-logout preventivo
✅ Verificación constante de expiración
✅ Token en memoria (Redux) y localStorage
✅ Interceptor Axios para manejo de 401

### Consideraciones
- Los tokens no se renuevan automáticamente sin interacción del usuario
- El usuario debe tomar acción consciente para extender su sesión
- Logout automático previene sesiones abandonadas
- Todos los timers se limpian al desmontar componentes

## Archivos Modificados

### Backend
- `src/main/java/com/espe/ListoEgsi/auth/JwtUtil.java`

### Frontend
- `app/hooks/useSessionManager.ts` (nuevo)
- `app/components/SessionTimeoutModal.tsx` (nuevo)
- `app/components/SessionManager.tsx` (nuevo)
- `app/store/slices/authSlice.ts` (actualizado)
- `app/layout.tsx` (actualizado)

## Próximas Mejoras

- [ ] Agregar sonido de alerta cuando aparece el modal
- [ ] Mostrar tiempo de expiración en el header
- [ ] Opción de "Mantener sesión activa" con renovación automática
- [ ] Registro de historial de renovaciones de sesión
- [ ] Notificación toast antes del modal (alerta temprana)

## Troubleshooting

### El modal no aparece
1. Verificar que el usuario está autenticado
2. Revisar Redux DevTools → state.auth.isAuthenticated = true
3. Verificar que el token existe: `localStorage.getItem('token')`
4. Comprobar console para errores de decodificación

### Renovación falla
1. Verificar que endpoint `/refresh-token` está disponible
2. Revisar Network tab en DevTools
3. Verificar que el token no está completamente expirado
4. Comprobar que Axios interceptor está funcionando

### Auto-logout no funciona
1. Verificar que no hay múltiples instancias del hook
2. Comprobar que los timers no se están cancelando prematuramente
3. Revisar console para errores en intervalos
