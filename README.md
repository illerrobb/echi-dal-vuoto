# Echi dal vuoto — Narrative Studio

Sistema locale file-first per progettare libri con **OpenCode CLI**, senza API o SDK LLM nell'applicazione. La gerarchia pubblica è Libro → Parte opzionale → Capitolo → Beat; `scenes/` è vietato.

## Requisiti e installazione

- Git; Node.js 18+ e npm per validatori/CLI; OpenCode opzionale ma necessario per l'esecuzione agentica.
- Provider, modello e credenziali vivono esclusivamente nella configurazione esterna di OpenCode.

```bash
npm ci
python3 scripts/verify_dependencies.py
npm test
npm run validate
```

Story Skills e Better Writing sono pinning locale in `vendor/` e installazione ispezionabile in `.opencode/skills/`. Per aggiornare, seguire `docs/dependency-report.md`, ricontrollare commit/licenza e non modificare `vendor/`.

## Workflow

1. `/project-status`, poi `/book-architecture` e `/chapter-intent chapter-001`.
2. `/council chapter-001` produce briefing, opinioni indipendenti, divergenze, alternative, valutazione cieca e decisione.
3. `/chapter-skeleton chapter-001` e `/beat-design beat-001` producono specifiche, mai prosa.
4. Un umano approva esplicitamente skeleton e tutti i contratti e porta lo stato a `DRAFTING`.
5. `/beat-draft`, `/beat-audit`, `/beat-revise`; manifest, deviazioni e proposte canoniche restano separati.
6. `/canon-update` applica soltanto proposte approvate; `/chapter-review`, `/validate-project`, `/export-manuscript` chiudono il ciclo.

Equivalenti deterministicamente invocabili dalla GUI:

```bash
node scripts/studio.mjs project-status --json
node scripts/studio.mjs validate --json
node scripts/studio.mjs beat-draft beat-001 --json  # fallisce finché non approvato
node scripts/studio.mjs export --json               # richiede CHAPTER_ACCEPTED
```

I comandi OpenCode sono in `.opencode/commands/`, gli agenti in `.opencode/agents/`, gli esperti sono configurabili in `experts/`. Vedere `docs/workflows.md` per drafting/audit/revisione e `docs/opencode-integration.md` per l'invocazione subprocess.
