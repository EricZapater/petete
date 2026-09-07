# UX — Mòdul Vista Diària & Tracking

**Veredicte**: APTE  
**Data**: 2026-09-07

## Fluxos Revisats
- `Barra Superior de Filtres`: Selector de Client, filtre d'estat "Només obertes", cerca per text i etiquetes.
- `Targetes d'Acció (Daily Cards)`:
  - Capçalera clara amb nom de l'acció, client, iniciativa i badges d'estat i executor (Jo / Altre).
  - Targeta d'input ràpid per registrar hores i comentari del dia d'avui en un sol pas.
  - Botó d'acció ràpida per Tancar / Reobrir l'acció amb canvi d'estat immediat (Regla 3).
  - Secció desplegable de l'històric d'entrades i notes ordenat cronològicament (Regla 2).
- `Modal de Creació d'Acció`:
  - Selecció opcional d'Iniciativa o creació ad-hoc indicant el Client (Regla 1).
  - Camps per executor, equip, etiquetes (separades per comes) i data prevista de tancament.

## 1. Usabilitat
- [OK] La vista diària prioritza la immediatesa: l'EM pot registrar les hores i el resum del dia en menys de 10 segons per acció.

## 2. Fidelitat al Mockup Aprovat
- [OK] La interfície a `DailyView.tsx` segueix amb fidelitat el disseny i paleta definits a `mockups/daily-view/daily-view-web.html`.

## 3. Consistència Visual
- [OK] Ús coherent dels components de Material UI, colors semàntics d'estat i tipografia neta.

## 4. Responsive
- [OK] Graella flexible per a resolucions d'escriptori i tauleta, adaptant els camps d'imputació d'hores i botons d'acció.

## 5. Feedback a l'Usuari
- [OK] Notificacions toast (Snackbar) d'èxit en registrar hores i en crear noves accions.

## 6. Accessibilitat Bàsica
- [OK] Labels explícits a tots els camps de text i botons amb text descriptiu o icones contextuals.

## Incidències
Cap incidència detectada.
