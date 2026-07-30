---
description: Esegue chapter-review con gate e output strutturato
agent: quality-auditor
---
Leggi `AGENTS.md` e `.studio/workflow-state.yaml`. Verifica i prerequisiti prima di operare. Esegui `node scripts/studio.mjs chapter-review $ARGUMENTS --json` quando il sottocomando è disponibile; altrimenti prepara una proposta strutturata. Non saltare `AWAITING_APPROVAL`, non trasformare risultati in canone, e aggiorna lo stato solo dopo successo. Restituisci riepilogo, percorsi, task/proposal id, rischi ed errori machine-readable.
