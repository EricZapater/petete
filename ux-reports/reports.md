# UX — Mòdul Vista Agregada, Informes & Exportació Excel (`reports`)

**Veredicte**: APTE  
**Data**: 2026-09-07

## Fluxos Revisats
- `Barra Superior de Filtres`: Rang de dates (inici de mes fins avui per defecte), selectors de Client, Objectiu i Executor en graella fluida.
- `Dashboard de KPIs`: Targetes d'alt impacte visual amb dades d'hores totals, proporció d'hores pròpies vs equip, i recompte d'accions actives vs tancades amb codis de colors semàntics.
- `Gràfics de Dedicació`: Targetes de desglossament per Client i Objectiu amb barres de progrés lineals en percentatges.
- `Taula Detallada`: Registres cronològics amb chips d'executor, hores ressaltades i comentaris llegibles sense tallar-se.
- `Descàrrega d'Excel`: Botó verd prominent a la capçalera amb icona de descàrrega i spinner d'estat de generació per oferir feedback immediat a l'usuari.

## 1. Usabilitat
- [OK] La càrrega i actualització de dades en canviar qualsevol filtre és ràpida i intuïtiva per a l'Engagement Manager.

## 2. Fidelitat al Mockup Aprovat
- [OK] `ReportsView.tsx` replica fidelment l'estructura i paleta del disseny aprovat a `mockups/reports/reports-web.html`.

## 3. Consistència Visual
- [OK] Disseny integrat amb Material UI, coherent amb la resta de mòduls (Auth, Mestres, Vista Diària).

## 4. Responsive
- [OK] Adaptació correcta a pantalles d'escriptori i portàtils, taula amb scroll horitzontal segur i graella de KPIs responsive.

## 5. Feedback a l'Usuari
- [OK] Indicadors de càrrega (`LinearProgress` i `CircularProgress` al botó d'exportació) i missatges d'estat buit si no hi ha dades.

## 6. Accessibilitat Bàsica
- [OK] Contrast de colors adequat, etiquetes als selectors de filtres i text alternatiu en botons d'acció.

## Incidències
Cap incidència detectada.
