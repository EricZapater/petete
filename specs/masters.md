# Especificació Funcional: Mòdul Gestió de Mestres (`specs/masters.md`)

## 1. Visió General de l'Èpica
Permetre a l'Engagement Manager crear, consultar, editar i activar/desactivar la seva jerarquia completa de dades de gestió (Clients, Equips, Objectius, Iniciatives i Mètriques) d'una manera àgil, ràpida i sense complexitat innecessària.

> **Regla d'Aïllament**: Totes les entitats estan estrictament lligades al `user_id` de la sessió activa. Cap usuari pot veure ni modificar dades d'altres usuaris.

---

## 2. Històries d'Usuari

### US-MASTERS-01: Gestió de Clients
**Com a** Engagement Manager,  
**Vull** crear, consultar, editar i activar/desactivar els meus clients,  
**Per tal de** poder organitzar la feina i els projectes que gestiono per a cadascun d'ells.

#### Criteris d'Acceptació:
1. Camps de Client: `nom` (obligatori, no buit), `actiu` (booleà, per defecte `true`).
2. Llistat de clients de l'usuari amb filtre ràpid per estat (Tots / Actius / Inactius).
3. Creació i edició modal o en línia sense recarregar la pàgina.
4. Si es desactiva un client (`actiu = false`), els seus objectius i accions associats es mantenen però no es mostraran per defecte a la vista diària.

---

### US-MASTERS-02: Gestió d'Equips per Client
**Com a** Engagement Manager,  
**Vull** assignar equips als meus clients,  
**Per tal de** vincular les accions i tasques a l'equip corresponent (relació 1:1 en aquesta versió).

#### Criteris d'Acceptació:
1. Camps d'Equip: `nom` (obligatori), `client_id` (obligatori, ha de pertànyer a l'usuari autenticat).
2. Llistat d'equips filtrable per client seleccionat.
3. Possibilitat de crear/editar ràpidament un equip associat a un client existent.

---

### US-MASTERS-03: Gestió d'Objectius de Client
**Com a** Engagement Manager,  
**Vull** establir objectius estratègics per a cada client amb el seu estat i data prevista de tancament,  
**Per tal de** tenir una referència clara del propòsit de la feina realitzada.

#### Criteris d'Acceptació:
1. Camps d'Objectiu: `client_id` (obligatori), `nom` (obligatori), `descripcio` (opcional), `estat` (`pendent`, `en_curs`, `bloquejat`, `tancat`; per defecte `pendent`), `data_prevista_tancament` (opcional).
2. Llistat d'objectius organitzats o filtrables per client.
3. Canvi d'estat d'un objectiu amb un sol clic o desplegable ràpid.
4. **Regla de Negoci 4**: Si es tanca un objectiu que encara té iniciatives obertes, el sistema mostra un avís visual confirmatori ("Aquest objectiu conté iniciatives no tancades. Vols tancar-lo igualment?"), permetent confirmar sense bloquejar.

---

### US-MASTERS-04: Gestió d'Iniciatives
**Com a** Engagement Manager,  
**Vull** desglossar els objectius en iniciatives concretes,  
**Per tal de** poder estructurar les accions i mesurar el progrés.

#### Criteris d'Acceptació:
1. Camps d'Iniciativa: `objectiu_id` (obligatori), `nom` (obligatori), `estat` (`pendent`, `en_curs`, `bloquejat`, `tancat`), `data_prevista_tancament` (opcional).
2. Llistat d'iniciatives filtrables per objectiu.
3. Creació i edició immediata d'iniciatives.

---

### US-MASTERS-05: Gestió de Mètriques per Iniciativa
**Com a** Engagement Manager,  
**Vull** definir mètriques quantitatives amb valor objectiu i valor actual per a cada iniciativa,  
**Per tal d'** avaluar numèricament el grau d'assoliment.

#### Criteris d'Acceptació:
1. Camps de Mètrica: `iniciativa_id` (obligatori), `nom` (obligatori), `unitat` (string, ex: `%`, `h`, `dies`, `pts`), `valor_objectiu` (numèric), `valor_actual` (numèric).
2. Actualització ràpida del `valor_actual` des de la vista de gestió.
3. Indicador visual del percentatge de progrés aconseguit (`(valor_actual / valor_objectiu) * 100`).

---

## 3. Llista de Pantalles Requerides per a l'Agent Mockup

1. **`masters` (Web)**:
   - `mockups/masters/masters-web.html`: Pantalla amb pestanyes/tabs (Clients, Equips, Objectius & Iniciatives, Mètriques), formularis modals ràpids d'afegir/editar, avís visual al tancament d'objectius amb iniciatives obertes, i badges d'estat acolorits.

---

## 4. Checkpoint 1 — Estat de Validació
- **Estat**: PENDENT DE VALIDACIÓ HUMANA (Checkpoint 1 per a Mòdul 1).
