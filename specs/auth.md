# Especificació Funcional: Mòdul Auth i Gestió d'Usuari (`specs/auth.md`)

## 1. Visió General de l'Èpica
Proporcionar el mecanisme d'accés, registre, gestió de sessió segura i configuració de perfil/idioma per a cada Engagement Manager a l'aplicació Web. Aquest mòdul és la pedra angular de l'aïllament multiusuari (`user_id`) del sistema.

> **Abast de Plataforma**: Exclusivament **Web** (React + MUI).

---

## 2. Històries d'Usuari

### US-AUTH-01: Registre d'un nou usuari
**Com a** Engagement Manager nou,  
**Vull** poder registrar-me a l'aplicació introduint el meu nom, correu electrònic, contrasenya i idioma preferit,  
**Per tal de** disposar del meu propi compte aïllat per gestionar els meus clients i activitats.

#### Criteris d'Acceptació:
1. Els camps obligatoris són: `nom`, `email`, `password` (mínim 8 caràcters) i `idioma` (opcional al formulari, per defecte `ca`; opcions: `ca`, `es`, `en`).
2. L'email es valida amb format estàndard i es guarda en minúscules normalitzades.
3. Si l'email ja existeix a la base de dades, el sistema retorna un error `409 Conflict` amb missatge amigable ("Aquest correu electrònic ja està registrat").
4. La contrasenya s'encripta de forma segura al backend amb `bcrypt` abans de persistir.
5. En completar el registre amb èxit (`201 Created`), el sistema retorna l'usuari creat i estableix les credencials de sessió inicials (access token + cookie HttpOnly de refresh token), iniciant la sessió automàticament.

---

### US-AUTH-02: Inici de sessió (Login)
**Com a** Engagement Manager registrat,  
**Vull** iniciar sessió amb el meu email i contrasenya,  
**Per tal d'** accedir a les meves dades i al meu espai de treball.

#### Criteris d'Acceptació:
1. L'usuari introdueix `email` i `password`.
2. Si les credencials són correctes (`200 OK`):
   - Es genera un `access_token` JWT de curta durada (ex. 15 minuts) que conté el `user_id`, `email` i `idioma`.
   - Es genera un `refresh_token` de llarga durada (ex. 7 dies) emmagatzemat a la base de dades/taula de sessions per permetre revocació.
   - El `refresh_token` s'envia en una cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
   - Es retorna l'objecte de l'usuari autenticat (`id`, `nom`, `email`, `idioma`) i l'`access_token`.
3. Si les credencials són errònies (email no trobat o password incorrecte), el sistema respon `401 Unauthorized` amb un missatge genèric que no revela si l'error és d'email o de contrasenya.

---

### US-AUTH-03: Renovació automàtica de sessió (Token Refresh)
**Com a** usuari amb una sessió activa,  
**Vull** que el sistema renovi l'access token de forma transparent quan caduqui,  
**Per tal de** no haver d'introduir les meves credencials contínuament mentre estic utilitzant l'app.

#### Criteris d'Acceptació:
1. L'endpoint `/api/v1/auth/refresh` accepta el refresh token enviat automàticament a la cookie `HttpOnly`.
2. Si el refresh token és vàlid i no ha estat revocat ni ha expirat, retorna un nou `access_token` (`200 OK`).
3. Si el refresh token és invàlid o ha caducat, retorna `401 Unauthorized`, neteja la sessió i redirigeix l'usuari a la pantalla de Login.

---

### US-AUTH-04: Tancament de sessió (Logout)
**Com a** usuari autenticat,  
**Vull** poder tancar la meva sessió des de qualsevol pantalla o des del menú de perfil,  
**Per tal de** protegir la meva informació en dispositius compartits.

#### Criteris d'Acceptació:
1. L'endpoint `/api/v1/auth/logout` revoca el `refresh_token` a la base de dades i neteja la cookie `HttpOnly` (`200 OK`).
2. S'esborra l'access token de la memòria del client web i es redirigeix immediatament a la pantalla de Login.
3. Qualsevol crida posterior amb el token revocat serà rebutjada amb `401 Unauthorized`.

---

### US-AUTH-05: Consulta i actualització de perfil / Idioma
**Com a** usuari autenticat,  
**Vull** consultar les meves dades i canviar el meu nom o el meu idioma preferit (`ca`, `es`, `en`),  
**Per tal d'** adaptar la interfície al meu idioma de preferència.

#### Criteris d'Acceptació:
1. Endpoint `GET /api/v1/auth/me`: Retorna les dades del perfil de l'usuari autenticat.
2. Endpoint `PATCH /api/v1/auth/me`: Permet actualitzar `nom` i `idioma` (`ca`, `es`, `en`).
3. Quan es canvia l'idioma al perfil, la interfície web canvia instantàniament els textos a l'idioma seleccionat.

---

### US-AUTH-06: Aïllament de context d'usuari (Multi-tenant Security)
**Com a** administrador del sistema i usuari,  
**Vull** que totes les peticions requereixin un token vàlid i injectin el `user_id` en el context de cada consulta a base de dades,  
**Per tal de** garantir que cap usuari pugui mai accedir a dades d'un altre.

#### Criteris d'Acceptació:
1. Middleware d'autenticació a Gin que valida el JWT i extreu el `user_id`.
2. Totes les consultes SQL de negoci filtren explícitament per `user_id = $1`.
3. Activació de Row Level Security (RLS) a PostgreSQL per a protecció en profunditat.

---

## 3. Llista de Pantalles Web Requerides per a l'Agent Mockup

1. **`login`**: [`mockups/auth/login-web.html`](file:///Users/eric.zapater/Developer/petete/mockups/auth/login-web.html) (Happy path + Estat d'error per credencials incorrectes)
2. **`register`**: [`mockups/auth/register-web.html`](file:///Users/eric.zapater/Developer/petete/mockups/auth/register-web.html) (Happy path + Error email duplicat + Validació password curt)
3. **`profile`**: [`mockups/auth/profile-web.html`](file:///Users/eric.zapater/Developer/petete/mockups/auth/profile-web.html) (Visualització de perfil + Selector d'idioma ca/es/en + Botó tancar sessió)

---

## 4. Checkpoint 1 — Estat de Validació
- **Estat**: APROVAT PER L'HUMÀ (Checkpoint 1).
