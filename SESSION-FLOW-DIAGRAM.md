# Diagrama de Flujo - Gestión de Sesiones SIEGSI

## Timeline Visual del Token JWT

```
Inicio de Sesión
    |
    v
+-------------------+
| Token Generado    |  ← JWT con expiración de 2 minutos
| Válido por 2 min  |
+-------------------+
    |
    | Hook verifica cada 5 segundos
    |
    v
+-------------------+
| 0:00 - 1:30       |  ← Token válido, no hay alertas
| Estado: Normal    |
+-------------------+
    |
    | Quedan 30 segundos...
    |
    v
+-------------------+
| 1:30 - 2:00       |  ← MODAL APARECE
| Estado: Alerta    |  ← Contador: 30, 29, 28...
+-------------------+
    |
    +------+------+
    |             |
    v             v
[Renovar]    [No acción]
    |             |
    |             v
    |        +---------------+
    |        | Countdown: 0  |
    |        | AUTO-LOGOUT   |
    |        +---------------+
    |
    v
+-------------------+
| Nuevo Token       |
| Válido por 2 min  |  ← Ciclo se reinicia
+-------------------+
```

## Flujo de Decisión del Usuario

```
┌─────────────────────────────────────────┐
│  Usuario inicia sesión                  │
│  Token JWT creado (120 segundos)        │
└─────────────────┬───────────────────────┘
                  │
                  │ useSessionManager activo
                  │ Verifica cada 5s
                  │
                  v
         ┌────────────────┐
         │ Quedan >30s?   │───Yes──> Continuar monitoreando
         └────────┬───────┘
                  │ No
                  │ (≤30 segundos restantes)
                  v
         ┌────────────────────┐
         │  MOSTRAR MODAL     │
         │  Countdown: 30s    │
         └────────┬───────────┘
                  │
         ┌────────┴────────┐
         │                 │
         v                 v
    ┌─────────┐      ┌──────────┐
    │ Renovar │      │  Esperar │
    └────┬────┘      └─────┬────┘
         │                 │
         │                 v
         │          ┌──────────────┐
         │          │ Countdown=0? │──No──> Continuar countdown
         │          └──────┬───────┘
         │                 │ Yes
         │                 v
         │          ┌─────────────┐
         │          │ AUTO-LOGOUT │
         │          │ Redirect    │
         │          └─────────────┘
         │
         v
    ┌─────────────────┐
    │ POST /refresh   │
    │ Obtener nuevo   │
    │ token           │
    └────────┬────────┘
             │
             v
    ┌──────────────────┐
    │ Redux: update    │
    │ localStorage     │
    │ Cerrar modal     │
    └────────┬─────────┘
             │
             v
    ┌──────────────────┐
    │ Reiniciar        │
    │ monitoreo        │
    │ (nuevo ciclo)    │
    └──────────────────┘
```

## Componentes y Responsabilidades

```
┌──────────────────────────────────────────────────────────┐
│                     layout.tsx                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              <Providers>                           │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │        <SessionManager />                     │  │  │
│  │  │  ┌────────────────────────────────────────┐   │  │  │
│  │  │  │  useSessionManager()                   │   │  │  │
│  │  │  │  - Decodifica JWT                      │   │  │  │
│  │  │  │  - Timer cada 5s                       │   │  │  │
│  │  │  │  - Calcula tiempo restante             │   │  │  │
│  │  │  │  - Activa modal si ≤30s                │   │  │  │
│  │  │  │  - Gestiona countdown 30s              │   │  │  │
│  │  │  └────────────┬─────────────────────────┘   │  │  │
│  │  │               │                              │  │  │
│  │  │               v                              │  │  │
│  │  │  ┌────────────────────────────────────────┐ │  │  │
│  │  │  │  <SessionTimeoutModal />               │ │  │  │
│  │  │  │  - Muestra contador circular           │ │  │  │
│  │  │  │  - Botón "Renovar Sesión"              │ │  │  │
│  │  │  │  - Botón "Cerrar Sesión"               │ │  │  │
│  │  │  │  - Auto-cierre en countdown=0          │ │  │  │
│  │  │  └────────────────────────────────────────┘ │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  {children} ← Rutas de la app                            │
└──────────────────────────────────────────────────────────┘
```

## Estados del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   ESTADOS DE SESIÓN                      │
└─────────────────────────────────────────────────────────┘

1. NO AUTENTICADO
   ┌──────────────────┐
   │ isAuthenticated: │
   │ false            │  → SessionManager inactivo
   │ token: null      │  → Sin monitoreo
   └──────────────────┘

2. SESIÓN ACTIVA (Normal)
   ┌──────────────────┐
   │ isAuthenticated: │
   │ true             │  → Hook verificando cada 5s
   │ token: "eyJ..."  │  → Tiempo restante >30s
   │ showModal: false │  → Usuario trabajando normalmente
   └──────────────────┘

3. SESIÓN EN ALERTA
   ┌──────────────────┐
   │ isAuthenticated: │
   │ true             │  → Modal visible
   │ token: "eyJ..."  │  → Tiempo restante ≤30s
   │ showModal: true  │  → Countdown activo
   │ countdown: 30..0 │  → Usuario debe decidir
   └──────────────────┘

4. RENOVANDO SESIÓN
   ┌──────────────────┐
   │ isAuthenticated: │
   │ true             │  → API call en progreso
   │ token: "eyJ..."  │  → Esperando nuevo token
   │ isRenewing: true │  → Botón deshabilitado
   └──────────────────┘

5. POST-RENOVACIÓN
   ┌──────────────────┐
   │ isAuthenticated: │
   │ true             │  → Token actualizado
   │ token: "new..."  │  → Ciclo reinicia
   │ showModal: false │  → Modal cerrado
   │ countdown: 30    │  → Countdown reseteado
   └──────────────────┘
```

## Integración con Redux

```
┌─────────────────────────────────────────┐
│         Redux Store (authSlice)         │
├─────────────────────────────────────────┤
│                                         │
│  State:                                 │
│  ├─ isAuthenticated: boolean            │
│  ├─ token: string | null                │
│  ├─ user: { username, rolename }        │
│  └─ loading, error                      │
│                                         │
│  Actions:                               │
│  ├─ loginSuccess()     → Set token      │
│  ├─ logout()           → Clear token    │
│  ├─ refreshToken()     → Update token   │ ← NUEVA
│  └─ restoreAuth()      → From storage   │
│                                         │
└─────────────┬───────────────────────────┘
              │
              │ Sincroniza con
              │
              v
┌─────────────────────────────────────────┐
│         localStorage                    │
├─────────────────────────────────────────┤
│  - token: "eyJhbGc..."                  │
│  - user: '{"username":"cDaroma",...}'   │
└─────────────────────────────────────────┘
```

## API Endpoints Involucrados

```
Backend (http://localhost:9090)

POST /login
├─ Request: { username, password }
├─ Response: { token, username, rolename }
└─ Token expira en: 120 segundos (2 minutos)

POST /refresh-token
├─ Headers: Authorization: Bearer <old_token>
├─ Response: <new_token>
└─ Nuevo token expira en: 120 segundos
    (reinicia el ciclo)

GET /protected-routes/*
├─ Headers: Authorization: Bearer <token>
├─ Validación: Token no expirado
└─ Si expirado: 401 Unauthorized
    → Axios interceptor → Redirect /login
```

## Configuración de Timers

```
┌──────────────────────────────────────────────────┐
│          Timers en useSessionManager             │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. checkIntervalRef                             │
│     Tipo: setInterval                            │
│     Frecuencia: 5000ms (5 segundos)              │
│     Propósito: Verificar expiración del token    │
│     Limpieza: Al desmontar o logout              │
│                                                  │
│  2. countdownIntervalRef                         │
│     Tipo: setInterval                            │
│     Frecuencia: 1000ms (1 segundo)               │
│     Propósito: Actualizar countdown del modal    │
│     Limpieza: Al renovar, logout o countdown=0   │
│                                                  │
│  3. autoLogoutTimeoutRef                         │
│     Tipo: setTimeout                             │
│     Duración: 30000ms (30 segundos)              │
│     Propósito: Forzar logout si no hay acción    │
│     Limpieza: Al renovar o logout manual         │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Casos de Uso

### Caso 1: Usuario Activo Renueva
```
[00:00] Login exitoso
[01:30] Modal aparece (quedan 30s)
[01:35] Usuario click "Renovar Sesión"
[01:35] POST /refresh-token → Nuevo token
[01:35] Modal se cierra
[03:05] Modal aparece nuevamente (quedan 30s del nuevo token)
```

### Caso 2: Usuario Inactivo (Auto-logout)
```
[00:00] Login exitoso
[01:30] Modal aparece (quedan 30s)
[01:31] Countdown: 29, 28, 27...
[02:00] Countdown llega a 0
[02:00] Auto-logout → Redirect /login
```

### Caso 3: Usuario Cierra Sesión Manualmente
```
[00:00] Login exitoso
[01:30] Modal aparece (quedan 30s)
[01:32] Usuario click "Cerrar Sesión"
[01:32] Logout inmediato → Redirect /login
```

### Caso 4: Token ya Expirado (Navegador inactivo)
```
[00:00] Login exitoso
[00:05] Usuario cambia de pestaña/app
[02:05] Usuario regresa a la app
[02:05] Hook detecta token expirado
[02:05] Logout inmediato sin modal
```
