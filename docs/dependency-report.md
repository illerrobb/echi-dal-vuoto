# Rapporto dipendenze — Fase 1

Verifica eseguita il 30 luglio 2026. I commit esatti sono registrati anche in `dependencies.lock.yaml`. Nessuno script remoto è stato eseguito e nessuna dipendenza applicativa o SDK LLM è stato installato.

## Ambiente rilevato

| Strumento | Esito |
|---|---|
| Git | 2.43.0 |
| Node.js | 20.20.2 |
| npm / npx | 11.4.2 |
| Python | 3.12.13 |
| OpenCode | non presente nel `PATH` |

L'assenza di OpenCode impedisce in questa fase una prova end-to-end del caricamento delle skill, ma non la loro installazione nel layout documentato `.opencode/skills/<name>/SKILL.md`. La futura Fase 3 dovrà verificare il formato agenti contro la versione OpenCode effettivamente installata, senza fissare un modello.

## Story Skills

- **Origine:** `https://github.com/danjdewhurst/story-skills.git`
- **Commit installato:** `c482d48f4eb9b488f033a77a51f9fae55cc0d75f`
- **Versione dichiarata:** 0.3.1
- **Licenza:** MIT, presente in `vendor/story-skills/LICENSE`.
- **Installazione verificata:** sette directory con `SKILL.md` copiate da `vendor/story-skills/skills/` a `.opencode/skills/`.
- **Eseguibili:** `bin/story.js` e il fallback Node in `skills/story-maintenance/scripts/story.js`. Non sono stati eseguiti durante l'audit.
- **Runtime/comandi:** CLI locale Node/Bun; può inizializzare, leggere e scrivere file, ricostruire indici, aggiornare frontmatter, esportare e migrare. Il package non dichiara dipendenze runtime e il codice ispezionato non richiede accesso di rete per tali operazioni.
- **Rischi/incompatibilità:** il formato upstream crea e usa `scenes/`; `story init`, `story migrate`, `story reindex` e i comandi di aggiunta relativi non vanno eseguiti direttamente sul formato applicativo. La copia vendorizzata rimane intatta. `.opencode/skills/beat-adapter/SKILL.md` traduce quel concetto solo internamente in gruppi di beat e vieta artefatti scena.
- **Riutilizzo previsto:** inizializzazione concettuale, personaggi, worldbuilding, trama, continuità, capitoli, manutenzione, validazione, export, word count e link, scegliendo soltanto operazioni compatibili col formato locale.

## Better Writing

- **Origine:** `https://github.com/forjd/better-writing.git`
- **Commit installato:** `4023076319e5a7838dd7587ebf3d5e3588f9544f`
- **Versione dichiarata:** nessuna versione macchina rilevata; commit pinning usato come versione effettiva.
- **Licenza:** MIT, presente in `vendor/better-writing/LICENSE`.
- **Compatibilità:** `SKILL.md` valido e tap compatibile disponibile in `skills/better-writing/`. I link simbolici del tap sono stati dereferenziati durante la copia, così l'installazione `.opencode/skills/better-writing/` è autosufficiente e multipiattaforma.
- **Script:** `scripts/validate.py` e `evals/run_evals.py` leggono file locali per validazione; non sono richiesti per usare la skill e non sono stati eseguiti prima dell'ispezione. Non sono emersi comandi distruttivi o accesso di rete nell'uso della skill.
- **Rischi/incompatibilità:** la skill può riscrivere testo; dovrà essere autorizzata soltanto nelle fasi di drafting/revisione e non può alterare eventi, motivazioni o canone. Il file opzionale `agents/openai.yaml` è metadata upstream, non una chiamata API e non configura provider nel progetto.

## Metodo d'installazione e sicurezza

È stato usato `git clone --depth 1`, non `npx skills add`: il clone consente di ispezionare licenza, skill e script prima di qualunque esecuzione. L'installer `npx` non era necessario dopo l'installazione manuale riuscita e avrebbe eseguito codice/package remoto non ancora verificato. Le directory `.git` annidate sono state rimosse dopo aver registrato i commit, affinché Git del progetto versioni file normali. Il contenuto sorgente in `vendor/` non è stato modificato.

## Aggiornamento riproducibile

1. Creare un branch `agent/update-dependencies`.
2. Clonare ogni upstream in una directory temporanea e annotare il nuovo commit.
3. Rieseguire l'audit di licenza, file eseguibili, shell, rete e operazioni di scrittura/cancellazione; non eseguire gli script prima della revisione.
4. Sostituire la rispettiva directory `vendor/` senza editarne i file.
5. Ricopiare `story-skills/skills/*` e dereferenziare il tap Better Writing (`cp -RL`) in `.opencode/skills/`; preservare la skill locale `beat-adapter`.
6. Aggiornare `dependencies.lock.yaml` e questo rapporto.
7. Eseguire `python3 scripts/verify_dependencies.py` e la futura suite completa, quindi esaminare `git diff` prima del commit.
