# Changelog

Tots els canvis notables d'aquest projecte seran documentats en aquest fitxer.
El format està basat en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
i aquest projecte adhereix a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-09-08

### Added
- **Mòdul 5 & Observabilitat (Consola d'Administració, Mètriques d'Ús & Audit Logs)**:
  - Control d'accés exclusiu per a `hola@ericzapater.cat` via middleware Go (`RequireAdminEmail`) i ruta protegida a React (`/admin`).
  - Backend Go: Registre d'auditoria asíncron (`audit_logs`) amb cues no bloquejants a Gin, mètriques del runtime Go (RAM, Uptime, Goroutines), mètriques del pool de PostgreSQL i exportació d'auditoria a fitxer CSV.
  - Frontend React: `AdminDashboardView.tsx` amb 3 pestanyes interactives (Mètriques d'Ús i KPIs de la plataforma, Salut del Sistema & Rendiment d'API amb percentils p95/p99, i Registre d'Auditoria en temps real amb cerca, filtres i descàrrega CSV).
  - Suport multiidioma i18n (`ca`, `es`, `en`) integrat per a tot el panell d'administració.

## [1.0.0] - 2026-09-07

### Added
- **Mòdul 3 & 4 (Vista Agregada, Informes & Exportació Excel)**:
  - Backend Go: Paquet `internal/informe` amb càlculs analítics d'hores totals, desglossament per client i objectiu, llistat cronològic desnormalitzat i generació nativa d'Excel `.xlsx` via `excelize/v2`.
  - Frontend React: `ReportsView.tsx` amb filtres multidimensionals per dates, client, objectiu i executor; targetes KPI; desglossament visual en barres de progrés i descàrrega directa de fulls de càlcul `.xlsx`.
  - Contracte OpenAPI a `contracts/reports.openapi.yaml`.
  - Informes de QA i UX amb veredicte APTE.
  - Conjunt de tests unitaris per al servei d'informes i generació d'Excel.

## [0.3.0] - 2026-09-07

### Added
- **Mòdul 2 (Vista Diària & Tracking)**:
  - Backend Go: Taules `accions` i `registres_diaris` amb migració `000004_create_daily_view_tables.up.sql`.
  - Dominis Go `internal/accio` i `internal/registre` amb suport per accions ad-hoc (Regla 1), històric cronològic d'hores i notes (Regla 2), canvi d'estat ràpid (Regla 3) i aïllament multiusuari per `user_id`.
  - Frontend React: `DailyView.tsx` amb filtres ràpids per client i només obertes, targetes de seguiment diari amb inputs d'hores/comentari, acordió d'històric i modal de nova acció.
  - Contracte OpenAPI a `contracts/daily-view.openapi.yaml`.
  - Informes de QA i UX amb veredicte APTE.

## [0.2.0] - 2026-09-07

### Added
- **Mòdul 1 (Gestió de Mestres)**:
  - Backend Go: Taules `clients`, `equips`, `objectius`, `iniciatives`, `metriques` amb migració `000003_create_masters_tables.up.sql`.
  - 5 dominis amb arquitectura Screaming (`internal/client`, `internal/equip`, `internal/objectiu`, `internal/iniciativa`, `internal/metrica`).
  - Frontend React: Vista completa `MastersView.tsx` amb 5 pestanyes independents, formularis modals de creació/edició i diàleg informatiu de la Regla 4 (avís de tancament d'objectiu amb iniciatives en curs).
  - Contracte OpenAPI a `contracts/masters.openapi.yaml`.

## [0.1.0] - 2026-09-07

### Added
- **Mòdul 0 (Auth & Multi-user isolation)**:
  - Backend Go amb Gin, PostgreSQL, JWT amb HttpOnly cookies per al refresh token.
  - Frontend React amb MUI, Zustand i suport multiidioma i18n (`ca`, `es`, `en`).
  - Infraestructura Docker (Go 1.26 + Node 22), Traefik i workflows GitHub Actions.
