# Contratto futura GUI

La GUI legge/scrive YAML e Markdown senza database canonico, mostra stato, task, deliberazioni, proposte, diff e review, e invoca OpenCode o `studio.mjs` come subprocess. Con `--json`, ogni comando restituisce `ok`, `operation`, `exitCode`, `paths`, eventuali `errors`, identificatori/stato e riepilogo. Exit 0 indica successo, 1 gate/validazione fallita. Scritture atomiche, lock in `.studio/locks/` e conferma umana restano responsabilità dell'integrazione.

Un comando agentico inviato al CLI deterministico fallisce con `AGENT_COMMAND_REQUIRED`; un nome ignoto fallisce con `UNKNOWN_COMMAND`. La GUI deve mostrare il fallimento e non avanzare lo stato. L'export scrive tramite file temporaneo e rename, nell'ordine dell'architettura del libro, e fallisce se un capitolo non è accettato.
