# Contratto futura GUI

La GUI legge/scrive YAML e Markdown senza database canonico, mostra stato, task, deliberazioni, proposte, diff e review, e invoca OpenCode o `studio.mjs` come subprocess. Con `--json`, ogni comando restituisce `ok`, `operation`, `exitCode`, `paths`, eventuali `errors`, identificatori/stato e riepilogo. Exit 0 indica successo, 1 gate/validazione fallita. Scritture atomiche, lock in `.studio/locks/` e conferma umana restano responsabilità dell'integrazione.
