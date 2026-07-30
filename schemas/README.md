# Schemi

JSON Schema convalidati da AJV. YAML rimane il formato autore e ogni file applicativo deve dichiarare un `schema` conosciuto: un valore assente o sconosciuto è bloccante. `project-state.schema.json` contiene i contratti dello stato e delle approvazioni; `artifact-catalog.schema.json` registra gli artefatti legacy ancora da irrigidire. I controlli trasversali (gate, riferimenti, catena dei beat) sono in `scripts/studio.mjs`.

Gli ID raccolti in `artifact-catalog.schema.json` non sono segnaposto permissivi: ogni artefatto richiede un oggetto, il proprio discriminatore `schema` e i campi minimi usati dal workflow. I controlli che coinvolgono più file (per esempio la copertura esatta dei beat in un'approvazione) restano nel validatore deterministico.
