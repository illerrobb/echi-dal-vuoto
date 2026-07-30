---
description: Esegue book-architecture con gate e output strutturato
agent: narrative-architect
---
Leggi `AGENTS.md` e `.studio/workflow-state.yaml`. Verifica i prerequisiti prima di operare. Esegui `node scripts/studio.mjs book-architecture $ARGUMENTS --json` quando il sottocomando è disponibile; altrimenti prepara una proposta strutturata. Non saltare `AWAITING_APPROVAL`, non trasformare risultati in canone, e aggiorna lo stato solo dopo successo. Restituisci riepilogo, percorsi, task/proposal id, rischi ed errori machine-readable.
