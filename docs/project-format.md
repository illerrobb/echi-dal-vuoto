# Formato progetto

`planning/` contiene Intent, Skeleton e Beat Contract; `manuscript/` soltanto testo autorizzato; `story/` e `continuity/` il canone; `deliberations/`, `reviews/`, `proposals/`, `decisions/` conservano governance; `.studio/` stato e log; `schemas/` contratti machine-readable; `templates/` artefatti iniziali. Directory intenzionalmente vuote hanno un README. ID: `chapter-NNN`, `beat-NNN`, kebab-case per entità.

`story/timeline/*.yaml` contiene eventi `story-event/v1`: l'evento canonico è la fonte primaria per le conseguenze. `continuity/current-state/initial.yaml` è lo stato iniziale approvato; `snapshot.yaml` è una cache derivata, marcata `generated`, con hash degli input e provenienza. Timeline, viste specializzate e snapshot non sono fonti canoniche indipendenti.

## Validazione strutturale e semantica

Il validatore carica ogni YAML una sola volta. I controlli incrociati vengono eseguiti solo sui documenti che hanno superato parsing e JSON Schema: un artefatto incompleto produce quindi un errore strutturato associato al percorso, non interrompe il processo. Gli schemi del catalogo definiscono contratti minimi reali per architettura, metadata, deliberazioni, esperti, policy, dipendenze e proposte; i controlli semantici aggiungono riferimenti, ordine, catene e coerenza delle approvazioni.
