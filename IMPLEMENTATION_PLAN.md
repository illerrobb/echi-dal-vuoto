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
**Stato:** non iniziata. **Obiettivo:** struttura, schemi, template, stato ed esempio minimo. **Dipendenze:** Fase 1. **Completamento/test:** schema e fixture validati. **Decisioni/problemi:** da registrare.

## Fase 3 — Agenti ed esperti
**Stato:** non iniziata. **Obiettivo:** agenti, permessi, registry, profili, knowledge e rubriche. **Dipendenze:** Fase 2 e versione OpenCode disponibile. **Completamento/test:** configurazioni parseabili e minimo privilegio verificato. **Decisioni/problemi:** da registrare.

## Fase 4 — Deliberazione
**Stato:** non iniziata. **Obiettivo:** briefing, round indipendente, disagreement map, cross-review, alternative, valutazione e decisione. **Dipendenze:** Fase 3. **Completamento/test:** protocollo dimostrativo completo. **Decisioni/problemi:** da registrare.

## Fase 5 — Capitoli e beat
**Stato:** non iniziata. **Obiettivo:** Intent, Skeleton, Beat Contract, profondità e validatori. **Dipendenze:** Fasi 2–4. **Completamento/test:** fixture valide e casi negativi. **Decisioni/problemi:** da registrare.

## Fase 6 — Drafting e review
**Stato:** non iniziata. **Obiettivo:** drafter, manifest, audit, review e canon update proposto. **Dipendenze:** Fase 5. **Completamento/test:** gate d'approvazione e audit dimostrati. **Decisioni/problemi:** da registrare.

## Fase 7 — Comandi e integrazione CLI
**Stato:** non iniziata. **Obiettivo:** comandi OpenCode, JSON, exit code, script ed E2E. **Dipendenze:** Fasi 3–6 e OpenCode. **Completamento/test:** workflow CLI E2E. **Decisioni/problemi:** da registrare.

## Fase 8 — Documentazione e demo
**Stato:** non iniziata. **Obiettivo:** demo, workflow completo, documentazione e contratto GUI. **Dipendenze:** Fasi 1–7. **Completamento/test:** criteri di accettazione documentati e verificati. **Decisioni/problemi:** da registrare.
