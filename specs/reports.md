# Especificació Funcional: Mòdul Informes & Exportació Excel (`reports`)

## 1. Descripció de l'Èpica
Aquest mòdul permet a l'Engagement Manager (EM) consultar una visió agregada i analítica de la seva dedicació temporal i activitats registrades, amb filtres avançats multidimensionals (per Client, Objectiu, Iniciativa, Equip, Executor i Rang de Dates), targetes de resum KPI, desglossament visual d'hores i generació/descàrrega d'informes en format full de càlcul Excel (`.xlsx`).

---

## 2. Històries d'Usuari

### US-REP-01: Filtres multidimensionals i cerca
- **Com a** Engagement Manager,
- **Vull** poder filtrar l'activitat per Client, Objectiu, Iniciativa, Equip, Executor (`jo` / `equip`) i rang de dates (`data_inici` a `data_fi`),
- **Per** analitzar l'esforç i dedicació segons el context requerit en cada moment.
- **Criteris d'Acceptació**:
  - Els filtres es poden combinar lliurement.
  - Per defecte, la data d'inici és el primer dia del mes en curs i la data de fi és avui.
  - El canvi de filtres actualitza instantàniament el resum KPI i el llistat detallat.

### US-REP-02: Targetes de Resum i Indicadors KPI
- **Com a** Engagement Manager,
- **Vull** veure a cop d'ull el total d'hores dedicades en el període, el nombre d'accions actives, el percentatge d'accions tancades i el desglossament per executor,
- **Per** avaluar l'avanç global de la feina i la productivitat.
- **Criteris d'Acceptació**:
  - Targeta 1: Hores Totals imputades en el rang seleccionat.
  - Targeta 2: Nombre total d'accions amb activitat.
  - Targeta 3: Accions tancades vs. en curs.
  - Targeta 4: Repartiment d'hores entre "Jo" i "Equip".

### US-REP-03: Desglossament d'Hores per Client i Objectiu
- **Com a** Engagement Manager,
- **Vull** visualitzar el repartiment percentual i en hores per cada client i objectiu estratègic,
- **Per** identificar quins clients o iniciatives consumeixen més temps i si s'ajusten a la planificació.
- **Criteris d'Acceptació**:
  - Taula resum amb barretes de progrés relatives (%) que mostrin el pes de cada client i objectiu.

### US-REP-04: Taula Detallada de Registres Diaris i Notes
- **Com a** Engagement Manager,
- **Vull** una taula amb tot el detall de les línies de registre (data, client, objectiu, iniciativa, acció, executor, equip, hores i comentaris),
- **Per** poder auditar i revisar qualsevol imputació concreta o comentari introduït.
- **Criteris d'Acceptació**:
  - Columnes clares i llegibles amb informació desnormalitzada resolta (noms de les entitats).
  - Ordenació cronològica descendent (més recent primer).

### US-REP-05: Exportació a Excel (.xlsx)
- **Com a** Engagement Manager,
- **Vull** fer clic a "Exportar a Excel" i descarregar un fitxer `.xlsx` professional amb tots els registres que compleixen els filtres actius,
- **Per** compartir-lo amb direcció, clients o incorporar-lo a la facturació/reportings corporatius.
- **Criteris d'Acceptació**:
  - Descàrrega directa d'un fitxer amb format natiu `.xlsx` (`petete-informe-YYYY-MM-DD.xlsx`).
  - Capçaleres estilitzades en negreta, columnes amb amplada automàtica i format numèric adequat per a les hores.
  - Respecta estrictament els filtres aplicats en el moment de fer clic.
