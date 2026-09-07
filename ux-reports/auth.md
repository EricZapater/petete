# UX — Mòdul Auth

**Veredicte**: APTE  
**Data**: 2026-09-07

## Fluxos Revisats
- `Login — Web`: Entrada directa, autoenviament, alertes d'error visuals clares i enllaç a registre.
- `Registre — Web`: Formularis compactes, selector d'idioma immediat, feedback d'errors inline.
- `Perfil i Canvi d'Idioma — Web`: Modificació de nom i canvi d'idioma en temps real mitjançant i18next, snackbar d'èxit verd i botó clar de logout.

## 1. Usabilitat
- [OK] Fluxos directes i intuïtius sense passos innecessaris. Entrada d'informació ràpida per a l'Engagement Manager.

## 2. Fidelitat al Mockup Aprovat
- [OK] La implementació a `LoginView.tsx`, `RegisterView.tsx` i `ProfileView.tsx` reprodueix exactament l'estructura, proporcions i estats d'error dels mockups aprovats a `mockups/auth/`.

## 3. Consistència Visual
- [OK] Ús consistent del tema Material UI (MUI v5): tipografia Roboto, colors primaris `#1976d2`, elevacions i targetes amb cantonades arrodonides (12px).

## 4. Responsive
- [OK] Disseny centrat i adaptatiu per a qualsevol resolució d'escriptori i tauleta, utilitzant contenidors `maxWidth` i flexbox.

## 5. Feedback a l'Usuari
- [OK] Spinners de càrrega (`CircularProgress`) integrats als botons primaris durant peticions de xarxa.
- [OK] Alertes d'error de credencials i d'email duplicat ben visibles.
- [OK] Snackbar toast de confirmació en desar canvis al perfil.

## 6. Accessibilitat Bàsica
- [OK] Ràtios de contrast WCAG AA respectats en textos i botons.
- [OK] Labels d'accessibilitat (`htmlFor`, `id`, `aria`) i mides d'objectius interactius superiors a 44px d'alçada.

## Incidències
Cap incidència detectada.
