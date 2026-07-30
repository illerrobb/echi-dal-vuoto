# Piano di implementazione

## Fase 1 — Analisi e dipendenze

- **Stato:** completata (2026-07-30).
- **Obiettivo:** inventariare repository/toolchain, installare e controllare Story Skills e Better Writing, introdurre il solo adapter indispensabile capitoli/beat.
- **File:** `AGENTS.md`, `dependencies.lock.yaml`, `docs/dependency-report.md`, `.opencode/skills/`, `vendor/`, `scripts/verify_dependencies.py`.
- **Dipendenze:** Git e rete solo per clone; Python standard library per verifica. OpenCode non disponibile.
- **Criteri completati:** commit upstream e licenze registrati; tutti gli `SKILL.md` installati e verificabili; copia vendor non modificata; rischi e aggiornamento documentati; nessuna API/SDK LLM; adapter vieta `scenes/`.
- **Test:** verifica dipendenze in output umano e JSON; controllo link simbolici; inventario Git.
- **Decisioni:** installazione manuale ispezionabile invece di `npx`; vendor pin tramite commit; Better Writing copiato dereferenziando i symlink; nessun comando Story Skills incompatibile eseguito.
- **Problemi:** OpenCode assente; Story Skills dipende internamente dal concetto di scena. Entrambi sono documentati e il secondo è confinato dall'adapter.

## Fase 2 — Formato del progetto
**Stato:** completata (2026-07-30). **Obiettivo:** struttura, schemi, template, stato ed esempio minimo. **Dipendenze:** Node 18, js-yaml/AJV. **Completamento/test:** fixture e schema validati. **Decisioni/problemi:** JSON Schema su YAML; directory documentate, nessuna scena.

## Fase 3 — Agenti ed esperti
**Stato:** completata (2026-07-30). **Obiettivo:** agenti, permessi, registry, profili, knowledge e rubriche. **Dipendenze:** formato OpenCode Markdown; OpenCode non disponibile nel container. **Completamento/test:** configurazioni parseabili e minimo privilegio verificato. **Decisioni/problemi:** nessun modello fissato; test runtime OpenCode differito.

## Fase 4 — Deliberazione
**Stato:** completata (2026-07-30). **Obiettivo:** protocollo strutturato completo. **Dipendenze:** profili esperti. **Completamento/test:** demo da briefing a decisione `awaiting-human`. **Decisioni/problemi:** una sola opinione demo per evitare falso consenso narrativo.

## Fase 5 — Capitoli e beat
**Stato:** completata (2026-07-30). **Obiettivo:** Intent, Skeleton, Beat Contract, profondità e validatori. **Dipendenze:** AJV. **Completamento/test:** fixture, riferimenti, ordine, catena e gate. **Decisioni/problemi:** controlli semantici restano agentici e dichiarati.

## Fase 6 — Drafting e review
**Stato:** completata (2026-07-30). **Obiettivo:** manifest, audit, review e canon proposal. **Dipendenze:** gate di stato. **Completamento/test:** template e rifiuto drafting/export prematuro. **Decisioni/problemi:** nessuna prosa demo e nessuna mutazione canonica.

## Fase 7 — Comandi e integrazione CLI
**Stato:** completata (2026-07-30). **Obiettivo:** comandi OpenCode, JSON, exit code, script ed E2E. **Dipendenze:** Node; OpenCode esterno. **Completamento/test:** 15 comandi, CLI deterministica e test subprocess. **Decisioni/problemi:** comandi semantici delegati; runtime OpenCode non verificabile perché assente.

## Fase 8 — Documentazione e demo
**Stato:** completata (2026-07-30). **Obiettivo:** demo, workflow, documentazione e contratto GUI. **Dipendenze:** fasi precedenti. **Completamento/test:** documenti richiesti, demo senza prosa e test completi. **Decisioni/problemi:** esportazione positiva richiede un capitolo realmente accettato.
