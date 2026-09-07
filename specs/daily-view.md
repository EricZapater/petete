# Especificació Funcional: Mòdul Vista Diària i Tracking (`specs/daily-view.md`)

## 1. Visió General de l'Èpica
La **Vista Diària** és el centre d'operacions principal de l'Engagement Manager. Permet consultar totes les accions de feina obertes, registrar ràpidament les hores i comentaris de la jornada, tancar/reobrir accions amb un sol clic i donar d'alta noves tasques (planificades amb iniciativa o ad-hoc per a un client).

---

## 2. Històries d'Usuari

### US-DAILY-01: Llistat d'Accions Obertes
**Com a** Engagement Manager,  
**Vull** veure d'un cop d'ull totes les meves accions no tancades amb la seva informació de context (client, iniciativa, equip, executor, etiquetes, data prevista i estat),  
**Per tal de** saber en què he de treballar i registrar la meva dedicació d'avui.

#### Criteris d'Acceptació:
1. Per defecte, la llista només mostra accions amb estat `pendent`, `en_curs` o `bloquejat` pertanyents a l'usuari autenticat.
2. Hi ha un selector/toggle per poder veure també les accions tancades si es desitja.
3. Cada targeta/fila d'acció mostra:
   - Nom de l'acció
   - Nom del Client i Nom de la Iniciativa (si en té)
   - Equip assignat
   - Executor: badge que indica `Jo` o `Equip`
   - Etiquetes lliures (chips visuals)
   - Estat actual (xip acolorits segons estat)
   - Data prevista de tancament
   - Total d'hores acumulades en aquesta acció

---

### US-DAILY-02: Donar d'alta una nova Acció (Planificada o Ad-hoc)
**Com a** Engagement Manager,  
**Vull** crear una nova acció fàcilment des de la mateixa pantalla diària,  
**Per tal de** registrar noves tasques sense haver de navegar a altres seccions.

#### Criteris d'Acceptació:
1. Formulari modal o panell lateral de creació d'acció.
2. Camps:
   - `nom` (obligatori)
   - `client_id` (obligatori si `iniciativa_id` no està informat; es dedueix automàticament si se selecciona una iniciativa)
   - `iniciativa_id` (opcional: **Regla 1 — Acció ad-hoc**)
   - `equip_id` (opcional)
   - `executor` (`jo` [defecte] o `equip`)
   - `etiquetes` (array de text lliure, creació dinàmica al moment)
   - `estat` (`pendent`, `en_curs` [defecte], `bloquejat`, `tancat`)
   - `data_prevista_tancament` (opcional)

---

### US-DAILY-03: Registre Diari d'Hores i Comentari
**Com a** Engagement Manager,  
**Vull** tenir un camp d'entrada ràpid a cada acció per introduir les hores dedicades avui i un comentari explicatiu,  
**Per tal d'** imputar la meva feina en pocs segons.

#### Criteris d'Acceptació:
1. A cada fila/targeta d'acció hi ha un camp numèric per a `hores` (decimal, ex. `0.5`, `1.5`, `3.0`) i un camp de text per a `comentari`.
2. Botó "Imputar / Registrar" que envia la petició a `/api/v1/registres-diaris` amb la data actual (`YYYY-MM-DD`).
3. El comentari s'associa estrictament al `RegistreDiari` (**Regla 2**).
4. Feedback visual immediat (snackbar d'èxit verd) i actualització instantània de les hores totals acumulades de l'acció.

---

### US-DAILY-04: Tancar / Reobrir Acció amb un sol Clic
**Com a** Engagement Manager,  
**Vull** tancar una acció completada o reobrir-ne una directament des de la pantalla diària (**Regla 3**),  
**Per tal de** mantenir la llista d'accions neta sense passos intermedis.

#### Criteris d'Acceptació:
1. Botó d'acció ràpida "Tancar" (canvia l'estat a `tancat`) que arxiva l'acció de la vista diària oberta.
2. Si es visualitzen accions tancades, botó "Reobrir" (canvia l'estat a `en_curs`).

---

### US-DAILY-05: Històric de Comentaris i Registres de l'Acció
**Com a** Engagement Manager,  
**Vull** expandir una acció per veure tot el fil cronològic de registres diaris i comentaris passats,  
**Per tal de** recordar l'evolució i el context de la feina feta en dies anteriors.

#### Criteris d'Acceptació:
1. Cada acció disposa d'un botó d'expansió (acordió/diàleg) que llista tots els `registres_diaris` vinculats, ordenats per data descendent.
2. Es mostra: data, hores imputades i el comentari associat.

---

## 3. Llista de Pantalles Requerides per a l'Agent Mockup

1. **`daily-view` (Web)**:
   - `mockups/daily-view/daily-view-web.html`: Pantalla principal amb targetes/taula d'accions obertes, camps d'entrada ràpida d'hores + comentari, botó de tancar acció, xips d'executor i etiquetes, diàleg de creació d'acció (amb selector d'acció ad-hoc o amb iniciativa) i panell d'històric de comentaris.

---

## 4. Checkpoint 1 — Estat de Validació
- **Estat**: PENDENT DE VALIDACIÓ HUMANA (Checkpoint 1 per a Mòdul 2).
