# QA — Mòdul Auth

**Veredicte**: APTE  
**Data**: 2026-09-07

## Entorn de proves
- Backend compilat i tests executats: SÍ (`go test ./...` -> OK)
- Frontend web compilat i verificat: SÍ (`tsc -b && vite build` -> OK en 1.77s)
- Contracte OpenAPI validat: SÍ (`contracts/auth.openapi.yaml` implementat amb fidelitat 1:1)
- Linter i qualitat de codi: Net, sense SQL dinàmic/insegur, paràmetres posicionals `$1, $2...`, contrasenyes amb bcrypt, tokens JWT signats amb HS256.

## Proves funcionals i de seguretat
- `POST /api/v1/auth/register`: Creació d'usuari amb hash de password, generació de tokens i assignació d'idioma per defecte `ca` -> [OK]
- `POST /api/v1/auth/login`: Validació estricta de credencials, retorn d'Access Token i Cookie HttpOnly per a Refresh Token -> [OK]
- `POST /api/v1/auth/refresh`: Validació i rotació de tokens amb revocació i control d'expiració -> [OK]
- `POST /api/v1/auth/logout`: Revocació de token a la BD i neteja de la cookie -> [OK]
- `GET /api/v1/auth/me` & `PATCH /api/v1/auth/me`: Consulta i actualització de perfil/idioma en temps real -> [OK]
- Context d'usuari i aïllament multi-tenant: Middleware Gin injecta el `user_id` extret del JWT a totes les peticions -> [OK]

## Compliment funcional
- [OK] US-AUTH-01: Registre d'un nou usuari amb validació d'email duplicat (409) i contrasenya segura.
- [OK] US-AUTH-02: Inici de sessió amb missatges genèrics segurs (401) i emissió de JWT + Refresh Token.
- [OK] US-AUTH-03: Renovació transparent de tokens mitjançant interceptors d'Axios.
- [OK] US-AUTH-04: Logout amb revocació efectiva i neteja d'estat a client i servidor.
- [OK] US-AUTH-05: Consulta i actualització de perfil amb canvi dinàmic d'idioma (`ca`, `es`, `en`).
- [OK] US-AUTH-06: Protecció d'endpoints i consultes vinculades al `user_id`.

## Qualitat de codi
- [OK] Backend: Arquitectura Screaming (`internal/auth/handler.go`, `service.go`, `repository.go`, `model.go`), sense lògica a handlers, sense queries fora de repositories.
- [OK] Frontend: TypeScript estricte (`noEmit`, `strict: true`), Zustand store per mòdul (`modules/auth/store.ts`), Axios centralitzat (`src/api/client.ts`), React Router 6.

## Homogeneïtat
- [OK] Backend modular en singular (`internal/auth`), Frontend modular en plural (`src/modules/auth`).
- [OK] Nomenclatura consistent, convencions de camelCase/PascalCase en Go i TS, snake_case a PostgreSQL.

## Incidències
Cap incidència bloquejant ni important detectada.
