# Product Functional Specification — Petete

## 1. Visió General del Producte
Petete és una **aplicació web multiusuari** pensada per al seguiment diari de la feina d'un Engagement Manager (EM). L'objectiu és traçar les activitats diàries i vincular-les explícitament als objectius i iniciatives dels clients, facilitant la generació d'informes d'estat i l'exportació a Excel (.xlsx).

> **Decisió d'Abast**: Aquest projecte és exclusivament **Web** (React + MUI). L'aplicació mòbil està **fora d'abast** per a aquesta aplicació.

Cada usuari compta amb un aïllament absolut de dades: no hi ha dades compartides entre usuaris en aquesta versió.

---

## 2. Model de Dades i Entitats

Totes les taules de negoci contenen una clau forana `user_id` obligatòria amb índex i polítiques de Row Level Security (RLS) a PostgreSQL.

### 2.1 Usuari (`users`)
- `id` (UUID, PK)
- `email` (string, únic, normalitzat en minúscules)
- `password_hash` (string, bcrypt/argon2)
- `nom` (string)
- `idioma` (string: `ca` [defecte], `es`, `en`)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2.2 Client (`clients`)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `nom` (string, no buit)
- `actiu` (boolean, per defecte true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2.3 Equip (`equips`)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `client_id` (UUID, FK -> `clients.id`, relació 1:1 en aquesta versió)
- `nom` (string, no buit)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2.4 Objectiu (`objectius`)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `client_id` (UUID, FK -> `clients.id`)
- `nom` (string)
- `descripcio` (text, opcional)
- `estat` (enum: `pendent`, `en_curs`, `bloquejat`, `tancat`)
- `data_prevista_tancament` (date, opcional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2.5 Iniciativa (`iniciatives`)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `objectiu_id` (UUID, FK -> `objectius.id`)
- `nom` (string)
- `estat` (enum: `pendent`, `en_curs`, `bloquejat`, `tancat`)
- `data_prevista_tancament` (date, opcional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2.6 Mètrica (`metriques`)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `iniciativa_id` (UUID, FK -> `iniciatives.id`)
- `nom` (string)
- `unitat` (string, ex: '%', 'dies', 'h', 'pts')
- `valor_objectiu` (numeric)
- `valor_actual` (numeric)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2.7 Acció (`accions`)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `iniciativa_id` (UUID, FK -> `iniciatives.id`, nullable)
- `client_id` (UUID, FK -> `clients.id`, obligatori si `iniciativa_id` és null)
- `equip_id` (UUID, FK -> `equips.id`, nullable)
- `executor` (enum: `jo`, `equip`)
- `nom` (string)
- `etiquetes` (array de text / strings lliures)
- `estat` (enum: `pendent`, `en_curs`, `bloquejat`, `tancat`)
- `data_prevista_tancament` (date, opcional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2.8 RegistreDiari (`registres_diaris`)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> `users.id`)
- `accio_id` (UUID, FK -> `accions.id`)
- `data` (date)
- `hores` (numeric(4,2), decimal ex: 1.5)
- `comentari` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 3. Regles de Negoci Validades

1. **Accions ad-hoc (sense iniciativa)**: Poden no tenir `iniciativa_id`, però requereixen obligatòriament `client_id`.
2. **Històric de Comentaris**: Els comentaris pertanyen al `RegistreDiari`. Una acció acumula el fil històric dels seus registres diaris cronològicament.
3. **Canvi d'estat d'acció ràpid**: Des de la vista diària es pot tancar (`tancat`) o reobrir (`en_curs`) qualsevol acció directament amb un sol clic.
4. **Tancament d'objectius amb iniciatives obertes**: Es permet tancar un objectiu que tingui iniciatives no tancades; es mostra un avís/modal informatiu sense bloquejar l'acció.
5. **Etiquetes lliures**: L'usuari afegeix etiquetes lliurement en crear o editar accions (sense catàleg rígid previ).
6. **Multiidioma (i18n)**: Tot el text de la interfície web està internacionalitzat amb suport per `ca`, `es` i `en` (per defecte `ca`), configurable al perfil de l'usuari.
7. **Autenticació i Seguretat**:
   - Autenticació JWT amb access token (curta durada) i refresh token (llarga durada en cookie `HttpOnly`/`Secure`/`SameSite=Lax`).
   - Filtre per `user_id` en totes les consultes a nivell de repositori SQL i protecció RLS a PostgreSQL.

---

## 4. Pantalles i Mòduls Web

- **Mòdul 0: Autenticació i Perfil (`auth`)**: Registre, Login, Refresh, Logout, Perfil d'usuari i preferències d'idioma.
- **Mòdul 1: Gestió de Mestres (`masters`)**: CRUD ràpid i directe de Clients, Equips, Objectius, Iniciatives i Mètriques.
- **Mòdul 2: Vista Diària (`daily-view`)**: Llistat d'accions obertes, registre ràpid d'hores i comentari diari, canvi d'estat d'accions i creació d'accions noves.
- **Mòdul 3: Vista Agregada / Informes (`reports`)**: Filtres per client, objectiu i rang de dates, amb càlcul d'hores totals agrupades.
- **Mòdul 4: Exportació Excel (`export-excel`)**: Descàrrega de fitxer `.xlsx` desnormalitzat amb columnes textuals resoltes segons filtres actius.
