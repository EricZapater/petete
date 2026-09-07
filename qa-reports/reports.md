# QA — Mòdul Vista Agregada, Informes & Exportació Excel (`reports`)

**Veredicte**: APTE  
**Data**: 2026-09-07

## Entorn de proves
- Backend Go 1.26 compilat i testejat: SÍ (`go test -v ./internal/informe/... && go test ./...` -> OK)
- Frontend React compilat: SÍ (`tsc -b && vite build` -> OK en 1.57s)
- Contracte OpenAPI validat: SÍ (`contracts/reports.openapi.yaml` implementat 1:1 per a summary, logs i exportació xlsx)

## Proves funcionals i de seguretat
- **Aïllament multiusuari**: Totes les consultes de càlcul d'informes i exportació filtren obligatòriament per `user_id = $1` amb JOINs protegits -> [OK]
- **Filtres multidimensionals**: Càlculs correctes en filtrar per `data_inici`, `data_fi`, `client_id`, `objectiu_id`, `iniciativa_id` i `executor` (`jo` / `equip`) -> [OK]
- **Targetes KPI**: Sumatori precís d'hores totals, hores de l'EM vs. Equip, recompte d'accions totals, en curs i tancades -> [OK]
- **Desglossament per Client i Objectiu**: Percentatges relatius calculats correctament amb barres de progrés visuals -> [OK]
- **Taula Detallada**: Resolució desnormalitzada dels noms de clients, objectius, iniciatives i equips associats a cada entrada de registre diari -> [OK]
- **Exportació a Excel (.xlsx)**: Generació de fitxer natiu `.xlsx` amb capçaleres en negreta i fons corporatiu blau (`#1976D2`), columnes autoajustades, format monetari/numèric per hores i fila de TOTAL al peu -> [OK]

## Compliment funcional
- [OK] US-REP-01: Filtres multidimensionals i cerca per dates i entitats.
- [OK] US-REP-02: Targetes de Resum i Indicadors KPI.
- [OK] US-REP-03: Desglossament d'Hores per Client i Objectiu.
- [OK] US-REP-04: Taula Detallada de Registres Diaris i Notes.
- [OK] US-REP-05: Exportació a fitxer Excel (.xlsx).

## Qualitat de codi i Homogeneïtat
- [OK] Backend: Paquet singular `internal/informe` (screaming architecture), llibreria estàndard `excelize/v2` i tests unitaris purs.
- [OK] Frontend: Mòdul `src/modules/reports/` amb client Axios, store Zustand, integració transparent amb el router i descàrrega de Blob directa al navegador.

## Incidències
Cap incidència bloquejant ni important.
