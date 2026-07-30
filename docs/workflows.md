# Workflow

State machine: `PROJECT_ORIENTATION → BOOK_ARCHITECTURE → CHAPTER_INTENT → EXPERT_DELIBERATION → CHAPTER_SKELETON → BEAT_DESIGN → AWAITING_APPROVAL → DRAFTING → CONTRACT_AUDIT → EXPERT_REVIEW → REVISION → CANON_UPDATE → CHAPTER_ACCEPTED`.

Durante `PROJECT_ORIENTATION`, `/creative-direction` è un passaggio consultivo raccomandato ma non una transizione aggiuntiva: produce una proposta di brief, alternative e domande per l'umano. Solo la versione esplicitamente approvata viene registrata in `knowledge/project/creative-direction.md` e diventa input di `BOOK_ARCHITECTURE`. Il consiglio può essere richiamato più avanti per svolte importanti, ma non riapre decisioni approvate senza una sostituzione esplicita.

Ogni transizione è persistita in `.studio/workflow-state.yaml`. `AWAITING_APPROVAL` non avanza senza identità umana registrata. Drafting richiede skeleton e tutti i Beat Contract `approved`; produce un Draft Manifest. L'auditor segnala, non corregge. La revisione passa da proposta. Il Canon Curator applica soltanto proposte accettate e registra decisioni/supersessioni. Validare prima e dopo; mostrare diff, rischi, file, proposte e risultati prima dell'accettazione.

L'approvazione è un artefatto versionato `planning/chapters/<chapter-id>/approval.yaml` conforme a `chapter-approval/v1`: registra identità e data umane e le versioni esatte di skeleton e beat. Lo stato `DRAFTING` da solo non autorizza la prosa: il gate deterministico verifica anche questi riferimenti. `studio.mjs transition <STATO> --actor <identità> --reason <motivazione>` applica esclusivamente la transizione successiva prevista, rivalida il progetto e persiste lo storico con scrittura atomica; l'ingresso in `DRAFTING` richiede inoltre tutte le approvazioni.

L'export legge l'ordine dei capitoli da `planning/book/architecture.yaml` e accetta soltanto metadata con stato `accepted`; se un capitolo previsto è incompleto, l'intera esportazione fallisce.

## Eventi e stato derivato

Durante `BEAT_DESIGN` il Narrative Architect dichiara eventi e conseguenze attesi nel Beat Contract. Il drafting li riporta nel Draft Manifest senza mutare il canone. `CONTRACT_AUDIT` confronta atteso e realizzato; `EXPERT_REVIEW` coinvolge Character Psychologist, Worldbuilding Specialist e Continuity Guardian in base agli effetti e alla profondità. In `CANON_UPDATE` il Canon Curator accetta soltanto eventi provenienti da proposte approvate. `studio.mjs` può quindi ricostruire e validare lo stato.

La state machine non cambia e non vengono introdotti nuovi agenti. `rebuild-state` è una scrittura esplicita limitata a uno snapshot derivato e ricostruibile; non approva eventi e non modifica manoscritto o fonte canonica.

## Integrità dell'approvazione

L'ingresso in `DRAFTING` e il gate `beat-draft` condividono lo stesso controllo deterministico. L'approvazione deve riferirsi al capitolo attivo, allo skeleton corrente e all'insieme esatto dei beat della sua sequenza; ID duplicati, beat mancanti o estranei e qualunque versione obsoleta bloccano entrambi i percorsi. Il timestamp è registrato in formato RFC 3339 con fuso orario esplicito.
