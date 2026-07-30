# Regole obbligatorie del repository

## Architettura

- Non effettuare chiamate dirette ad API LLM, non installare SDK LLM e non conservare chiavi. OpenCode CLI è l'unico harness agentico previsto; provider e modello restano configurazione esterna dell'utente.
- I file versionati sono la fonte di verità. Le conversazioni e le sessioni sono log, non canone.
- La gerarchia narrativa applicativa è Libro > Parte opzionale > Capitolo > Beat. Non creare directory `scenes/`, artefatti scena o nuove interfacce che espongano scene.
- Usare prima le skill upstream installate. Non duplicare capacità adeguatamente coperte; adattarle tramite componenti locali senza modificare `vendor/`.

## Workflow e sicurezza

- Separare analisi, deliberazione, progettazione, approvazione umana, drafting, audit, revisione, aggiornamento del canone e commit.
- Non scrivere prosa prima dell'approvazione esplicita del Chapter Skeleton e dei Beat Contract.
- Produrre una proposta strutturata prima di modificare manoscritto o canone. Non introdurre mutazioni canoniche silenziose.
- Etichettare distintamente fatti canonici, interpretazioni, ipotesi, preferenze e decisioni approvate; corredare le ipotesi di confidenza, prove e controprove.
- Rispettare le decisioni immutabili; una sostituzione deve essere esplicita, approvata e tracciata.
- Applicare il minimo privilegio: lettura per default; nessuna cancellazione, modifica del canone/manoscritto o comando distruttivo senza workflow autorizzato.
- Eseguire validazioni prima e dopo modifiche importanti. Mostrare diff, file coinvolti, rischi, proposte canoniche e risultati dei controlli prima dell'accettazione.
- Isolare il lavoro importante su branch/worktree/snapshot; non effettuare commit agentici automatici su `main`.
- Aggiornare documentazione e `IMPLEMENTATION_PLAN.md` insieme all'implementazione.
