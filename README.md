# Echi dal vuoto — Narrative Studio

Repository in costruzione per un sistema locale, file-first e indipendente da modello/provider, controllato tramite OpenCode CLI. Non contiene chiamate API o SDK LLM.

## Stato

La **Fase 1 — Analisi e dipendenze** è completata. Story Skills e Better Writing sono vendorizzate, pinning e audit sono in `docs/dependency-report.md`; le fasi applicative successive sono tracciate in `IMPLEMENTATION_PLAN.md`.

```bash
python3 scripts/verify_dependencies.py
python3 scripts/verify_dependencies.py --json
```

OpenCode non è installato nell'ambiente corrente. Quando disponibile, caricherà le skill da `.opencode/skills/`; provider e modello resteranno configurati esclusivamente dall'utente in OpenCode. Non usare i comandi upstream che producono `scenes/`: leggere prima la skill locale `beat-adapter`.
