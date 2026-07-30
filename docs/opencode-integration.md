# Integrazione OpenCode

OpenCode carica `opencode.json`, `.opencode/agents/*.md`, `.opencode/commands/*.md` e `.opencode/skills/*/SKILL.md`. Modello/provider non sono nel repository.

```bash
opencode run --dir "$PWD" --agent orchestrator --format json "Esegui /project-status"
```

La futura GUI deve usare subprocess senza shell interpolation, cwd esplicita, timeout e parsing JSON line-oriented. In assenza di OpenCode i validatori e i gate restano operativi via `node scripts/studio.mjs ... --json`; l'esecuzione semantica agentica non è simulata.

Il CLI distingue i comandi deterministici dai comandi agentici: i secondi restituiscono `AGENT_COMMAND_REQUIRED` con exit code 1, mentre nomi o refusi non riconosciuti restituiscono `UNKNOWN_COMMAND`. Non interpretare mai questi risultati come operazioni completate. `--project-root <path>` consente un'invocazione esplicita indipendente dal working directory.
