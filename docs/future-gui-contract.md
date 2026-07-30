# Contratto futura GUI

La GUI legge/scrive YAML e Markdown senza database canonico, mostra stato, task, deliberazioni, proposte, diff e review, e invoca OpenCode o `studio.mjs` come subprocess. Con `--json`, ogni comando restituisce `ok`, `operation`, `exitCode`, `paths`, eventuali `errors`, identificatori/stato e riepilogo. Exit 0 indica successo, 1 gate/validazione fallita. Scritture atomiche, lock in `.studio/locks/` e conferma umana restano responsabilità dell'integrazione.

Le viste temporali interrogano `state-at <beat>`, `knowledge-of <personaggio> --at <beat>` e `history-of <entità>` senza mantenere un database parallelo. `rebuild-state` rigenera esplicitamente la cache `continuity/current-state/snapshot.yaml`; la GUI deve mostrare provenienza e hash e non presentare lo snapshot come canone autonomo.

Un comando agentico inviato al CLI deterministico fallisce con `AGENT_COMMAND_REQUIRED`; un nome ignoto fallisce con `UNKNOWN_COMMAND`. La GUI deve mostrare il fallimento e non avanzare lo stato. L'export scrive tramite file temporaneo e rename, nell'ordine dell'architettura del libro, e fallisce se un capitolo non è accettato.
