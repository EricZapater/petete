# QA — Mòdul Vista Diària & Tracking

**Veredicte**: APTE  
**Data**: 2026-09-07

## Entorn de proves
- Backend Go 1.26 compilat: SÍ (`go test ./... && go build ./...` -> OK)
- Frontend React compilat: SÍ (`tsc -b && vite build` -> OK en 1.76s)
- Migracions SQL creades: SÍ (`000004_create_daily_view_tables.up.sql` amb taules `accions` i `registres_diaris`, índexs per `user_id`, `client_id`, `iniciativa_id`, `data`)
- Contracte OpenAPI validat: SÍ (`contracts/daily-view.openapi.yaml` implementat 1:1 per a accions i registres diaris d'hores/comentaris)

## Proves funcionals i de seguretat
- **Aïllament multiusuari**: Totes les consultes SQL a `accions` i `registres_diaris` incorporen obligatòriament `WHERE user_id = $1` -> [OK]
- **Regla 1 (Accions ad-hoc)**: Es permet crear accions sense iniciativa assignada; en aquest cas, `client_id` és obligatori -> [OK]
- **Regla 2 (Històric i Comentaris)**: La imputació d'hores i notes s'acumula cronològicament a `registres_diaris`, visible en obrir l'històric de cada acció -> [OK]
- **Regla 3 (Tancament/Reobertura àgil)**: Botons ràpids per alternar l'estat d'una acció entre `en_curs` i `tancat` en un sol clic des de la interfície -> [OK]
- **Filtres a la Vista Diària**: Filtratge per Client, Només obertes (switch), cerca ràpida per text i etiquetes -> [OK]
- **Imputació ràpida diària**: Camp numèric per hores i camp de comentari amb botó "Registrar" per cada targeta d'acció -> [OK]

## Compliment funcional
- [OK] US-DAILY-01: Llistat d'accions diàries amb filtres per client i estat obert/tancat.
- [OK] US-DAILY-02: Creació d'accions vinculades a iniciativa o ad-hoc amb client.
- [OK] US-DAILY-03: Registre diari d'hores i comentaris/progrés.
- [OK] US-DAILY-04: Canvi d'estat ràpid d'accions.
- [OK] US-DAILY-05: Consulta de l'històric complet de comentaris i hores d'una acció.

## Qualitat de codi i Homogeneïtat
- [OK] Backend: Arquitectura Screaming en singular (`internal/accio`, `internal/registre`), rutes protegides pel middleware JWT.
- [OK] Frontend: Mòdul `src/modules/daily/` amb servei Axios dedicat, store Zustand, integració transparent amb mestres i router `/daily`.

## Incidències
Cap incidència bloquejant ni important.
