# Prompt per agents d'IA — App de tracking d'EM (multiusuari)

## Context i objectiu

Construeix una aplicació web multiusuari per fer tracking diari de la feina d'un Engagement Manager (EM). L'objectiu és traçar tota la feina realitzada i vincular-la explícitament als objectius de cada client, per poder generar informes que es comparteixen amb els clients.

Cada usuari de l'app té les seves pròpies dades completament aïllades: clients, equips, objectius, iniciatives i accions estan sempre vinculats a l'usuari que els va donar d'alta. No hi ha compartició de dades entre usuaris en aquesta primera versió.

## Requisit multiusuari (crític)

- Autenticació d'usuaris (email + contrasenya com a mínim; OAuth opcional si l'stack ho facilita).
- Totes les taules de negoci (Client, Equip, Objectiu, Iniciativa, Mètrica, Acció, RegistreDiari) han de tenir una columna `user_id` (o `owner_id`) que referenciï l'usuari propietari.
- Totes les consultes (lectura, escriptura, actualització, esborrat) han de filtrar SEMPRE per `user_id` de la sessió activa. Cap endpoint ha de permetre accedir a dades d'un altre usuari, ni per error d'implementació ni per manipulació de paràmetres (IDOR).
- Si l'stack ho suporta (p. ex. Postgres/Supabase), implementa Row Level Security (RLS) a nivell de base de dades, no només a nivell d'aplicació, com a doble capa de protecció.
- No cal gestió de rols ni permisos entre usuaris en aquesta versió — cada usuari és propietari absolut i únic de les seves dades.

## Model de dades

### Client
- id
- user_id
- nom
- actiu (booleà)

### Equip
- id
- user_id
- nom
- client_id (relació 1:1 — cada equip pertany a un únic client)

### Objectiu
- id
- user_id
- client_id
- nom
- descripció
- estat: `pendent` | `en_curs` | `bloquejat` | `tancat`
- data_prevista_tancament

### Iniciativa
- id
- user_id
- objectiu_id
- nom
- estat: `pendent` | `en_curs` | `bloquejat` | `tancat`
- data_prevista_tancament

### Mètrica
- id
- user_id
- iniciativa_id
- nom
- unitat
- valor_objectiu
- valor_actual

### Acció
- id
- user_id
- iniciativa_id (nullable — vegeu regla d'accions ad-hoc)
- client_id (obligatori si iniciativa_id és null)
- equip_id
- executor: `jo` | `equip`
- nom
- etiquetes (array de text, lliure)
- estat: `pendent` | `en_curs` | `bloquejat` | `tancat`
- data_prevista_tancament

### RegistreDiari
- id
- user_id
- accio_id
- data
- hores (decimal)
- comentari (text)

## Regles de negoci

1. **Accions sense iniciativa**: una acció pot no tenir `iniciativa_id`, però en aquest cas `client_id` és obligatori. És feina operativa/ad-hoc no planificada.
2. **Comentaris**: el comentari va lligat a cada `RegistreDiari`, no a l'acció en general. L'acció acumula un fil d'històric de comentaris a través dels seus registres diaris.
3. **Tancar/reobrir**: qualsevol acció es pot tancar o reobrir des de la vista diària, sense necessitat d'anar a una pantalla separada.
4. **Objectius amb iniciatives obertes**: [PENDENT DE DECIDIR — de moment, permet tancar l'objectiu igualment encara que tingui iniciatives obertes; no bloquegis el tancament, però mostra un avís visual].
5. **Etiquetes**: lliures, sense un catàleg tancat previ (l'usuari les crea sobre la marxa).
6. **Multiidioma**: tot el text de l'aplicació (labels, botons, títols, missatges) ha d'estar internacionalitzat. Cada usuari ha de definir el seu idioma.
   

## Funcionalitats i pantalles

### Vista diària (pantalla principal)
- Llista d'accions obertes (no tancades) de l'usuari.
- Per cada acció: nom, client, iniciativa (si en té), equip, executor, etiquetes, estat.
- Camp ràpid per registrar hores dedicades avui + comentari, per acció.
- Botó per tancar/reobrir l'acció directament des d'aquí.
- Botó per afegir una nova acció (amb selecció de client/iniciativa/equip/executor/etiquetes).

### Gestió de mestres
- Pantalles CRUD senzilles per: Clients, Equips, Objectius, Iniciatives, Mètriques.
- Formularis mínims, sense floritures — l'objectiu és velocitat d'entrada de dades, no disseny elaborat.

### Vista agregada / informe
- Filtres per client, objectiu, rang de dates.
- Totals d'hores agrupats per client / objectiu / iniciativa.
- Ha de servir de base per a l'exportació a Excel.

### Exportació a Excel
- Genera una taula plana (desnormalitzada), una fila per `RegistreDiari`, amb columnes ja resoltes (noms, no ids):

  `Client | Objectiu | Iniciativa | Acció | Equip | Executor | Etiquetes | Estat | Data | Hores | Comentari`

- L'exportació ha de respectar els filtres aplicats a la vista agregada (client, objectiu, rang de dates).
- Format de sortida: .xlsx.

## Prioritats d'implementació

1. Autenticació + aïllament multiusuari (base de tot — no avançar sense això ben cobert).
2. Model de dades i CRUD de mestres.
3. Vista diària (registre d'hores + comentari + tancar/reobrir).
4. Vista agregada.
5. Exportació a Excel.

## Criteris d'acceptació

- Un usuari mai pot veure, editar ni esborrar dades d'un altre usuari, ni manipulant URLs o IDs directament.
- Es pot crear tota la jerarquia (client → objectiu → iniciativa → acció) i registrar hores diàries sense sortir de dues pantalles (vista diària + mestres).
- L'exportació a Excel reflecteix exactament els filtres aplicats i és llegible directament pel client final (noms, no ids tècnics).