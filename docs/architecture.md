# Architettura

I file versionati sono canone e stato; le sessioni sono solo log. OpenCode è un harness esterno e legge agenti/comandi/skill locali. Il livello deterministico (`scripts/studio.mjs`) valida YAML, JSON Schema, identità, riferimenti, catene e gate; non genera prosa. Gli strati sono: progetto narrativo, planning, deliberazioni/proposte, manoscritto/review, canone/continuità, stato `.studio` e integrazione `.opencode`.

Gli eventi canonici formano un registro versionato e ordinato. Un reducer puro applica i loro effetti tipizzati allo stato iniziale; gli snapshot sono cache verificabili mediante hash, non un secondo canone. Il CLI giudica coerenza meccanica e provenienza, mentre gli esperti esistenti giudicano significato, causalità narrativa e plausibilità.

Le skill upstream restano immutate. `beat-adapter` converte soltanto mentalmente i concetti upstream in gruppi di beat e impedisce artefatti `scenes/`. Nessun componente contiene API key, SDK LLM o modello obbligatorio.
