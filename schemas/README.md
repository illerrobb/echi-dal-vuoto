# Schemi

JSON Schema convalidati da AJV. YAML rimane il formato autore e ogni file applicativo deve dichiarare un `schema` conosciuto: un valore assente o sconosciuto è bloccante. `project-state.schema.json` contiene i contratti dello stato e delle approvazioni; `artifact-catalog.schema.json` registra gli artefatti legacy ancora da irrigidire. I controlli trasversali (gate, riferimenti, catena dei beat) sono in `scripts/studio.mjs`.
