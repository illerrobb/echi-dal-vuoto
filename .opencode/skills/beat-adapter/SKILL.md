---
name: beat-adapter
description: Adatta i workflow upstream di Story Skills alla gerarchia Libro > Parte opzionale > Capitolo > Beat senza esporre o creare unità narrative intermedie.
---

# Adapter capitoli e beat

Usa questa skill insieme alle skill Story Skills installate quando operi in questo progetto.

## Contratto obbligatorio

- Esporre nei nuovi artefatti soltanto libro, parte opzionale, capitolo e beat.
- Interpretare un riferimento upstream a una `scene` come un gruppo interno e temporaneo di beat appartenenti a un capitolo; non conservarlo nel formato locale.
- Non creare mai una directory `scenes/`, file con tipo `scene`, registri di scene o identificativi contenenti `-scene-`.
- Conservare ogni beat applicativo in `planning/chapters/<chapter-id>/beats/<beat-id>.yaml`.
- Non eseguire `story init`, `story migrate`, `story add scene`, `story reindex` o altri comandi upstream che creino o richiedano `scenes/` sul progetto applicativo.
- Riutilizzare invece in modo selettivo le capacità upstream compatibili: personaggi, mondo, trama, continuità, capitoli, conteggio parole, collegamenti, validazione ed esportazione.
- Se una capacità upstream richiede materialmente una directory `scenes/`, fermarsi e produrre una proposta di adapter locale; non modificare `vendor/` e non aggirare il vincolo.
- Durante pianificazione o deliberazione non produrre prosa narrativa.
