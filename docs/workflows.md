# Workflow

State machine: `PROJECT_ORIENTATION → BOOK_ARCHITECTURE → CHAPTER_INTENT → EXPERT_DELIBERATION → CHAPTER_SKELETON → BEAT_DESIGN → AWAITING_APPROVAL → DRAFTING → CONTRACT_AUDIT → EXPERT_REVIEW → REVISION → CANON_UPDATE → CHAPTER_ACCEPTED`.

Ogni transizione è persistita in `.studio/workflow-state.yaml`. `AWAITING_APPROVAL` non avanza senza identità umana registrata. Drafting richiede skeleton e tutti i Beat Contract `approved`; produce un Draft Manifest. L'auditor segnala, non corregge. La revisione passa da proposta. Il Canon Curator applica soltanto proposte accettate e registra decisioni/supersessioni. Validare prima e dopo; mostrare diff, rischi, file, proposte e risultati prima dell'accettazione.
