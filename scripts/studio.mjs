#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import yaml from 'js-yaml';
import Ajv2020 from 'ajv/dist/2020.js';

const scriptRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rawArgs=process.argv.slice(2);
const rootFlag=rawArgs.indexOf('--project-root');
const root=rootFlag>=0?path.resolve(rawArgs[rootFlag+1]||''):scriptRoot;
const args=rootFlag>=0?rawArgs.filter((_,i)=>i!==rootFlag&&i!==rootFlag+1):rawArgs;
const command=args[0]||'help';
const operands=args.slice(1).filter(a=>a!=='--json');
const json=args.includes('--json');
const readYaml=p=>yaml.load(fs.readFileSync(path.join(root,p),'utf8'));
const relative=p=>path.relative(root,p).split(path.sep).join('/');
const stateTypes=['character-location','character-status','knowledge','belief','emotion','relationship','inventory','injury','environment','promise','mystery','world-state'];
const clone=value=>structuredClone(value);
const canonicalJson=value=>JSON.stringify(value,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);

function result(ok,operation,data={},errors=[]){
  const out={ok,operation,exitCode:ok?0:1,paths:data.paths||[],...data,errors};
  console.log(json?JSON.stringify(out,null,2):`${ok?'OK':'ERROR'} ${operation}\n${errors.map(e=>`- ${e.message||e}`).join('\n')}${data.summary?`\n${data.summary}`:''}`);
  process.exitCode=ok?0:1;
}
function files(dir,ext){
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name),ext):(e.name.endsWith(ext)?[path.join(dir,e.name)]:[]));
}
function loadSchemas(ajv,errors){
  const schemas=new Map();
  for(const f of files(path.join(root,'schemas'),'.json')){
    try{const document=JSON.parse(fs.readFileSync(f));for(const schema of document.schemas||[document])if(schema.$id){ajv.addSchema(schema,schema.$id);schemas.set(schema.$id,schema);}}
    catch(error){errors.push(`${relative(f)}: schema non valido: ${error.message}`);}
  }
  return schemas;
}
function initialState(){
  const p='continuity/current-state/initial.yaml';
  if(!fs.existsSync(path.join(root,p)))throw new Error(`${p}: stato iniziale mancante`);
  const state=clone(readYaml(p).state);for(const type of stateTypes)state[type]??={};return state;
}
function canonicalEvents(documents=null){
  const entries=[];
  for(const f of files(path.join(root,'story/timeline'),'.yaml')){
    const p=relative(f);let event=documents?.get(p);
    if(!event){try{event=yaml.load(fs.readFileSync(f,'utf8'));}catch{continue;}}
    if(event?.schema==='story-event/v1'&&event.identity.status==='canonical')entries.push({path:p,event});
  }
  return entries.sort((a,b)=>a.event.placement.sequence-b.event.placement.sequence||a.event.identity.id.localeCompare(b.event.identity.id));
}
function stateSlot(state,effect){
  state[effect.type]??={};const subject=state[effect.type][effect.subject]??={};
  if(typeof subject!=='object'||Array.isArray(subject))state[effect.type][effect.subject]={value:subject};
  const container=state[effect.type][effect.subject];return{container,key:effect.property||'value'};
}
function applyEvents(entries,{untilBeat=null}={}){
  const state=initialState();const errors=[];const applied=[];const history=[];
  for(const {event} of entries){
    if(untilBeat&&event.placement.beat===untilBeat)break;
    for(const effect of event.effects){
      const {container,key}=stateSlot(state,effect);const current=container[key]?.value??container[key];
      if(Object.hasOwn(effect,'expected-before')&&!effect['approved-conflict']&&canonicalJson(current??null)!==canonicalJson(effect['expected-before']))errors.push(`${event.identity.id}: expected-before non corrisponde per ${effect.type}/${effect.subject}/${key}`);
      let value=effect.value;
      if(effect.operation==='add'){const list=Array.isArray(current)?[...current]:[];if(!list.some(item=>JSON.stringify(item)===JSON.stringify(value)))list.push(value);value=list;}
      if(effect.operation==='remove'){const list=Array.isArray(current)?current:[];value=list.filter(item=>JSON.stringify(item)!==JSON.stringify(effect.value));}
      if(effect.operation==='open')value={status:'open',value:effect.value};
      if(effect.operation==='resolve')value={status:'resolved',value:effect.value};
      container[key]={value,'source-event':event.identity.id,metadata:Object.fromEntries(Object.entries(effect).filter(([name])=>!['type','subject','property','operation','value','expected-before'].includes(name)))};
      history.push({event:event.identity.id,beat:event.placement.beat,type:effect.type,subject:effect.subject,property:key,operation:effect.operation,value});
    }
    applied.push(event.identity.id);
  }
  return{state,errors,applied,history};
}
function eventHash(entries){return crypto.createHash('sha256').update(canonicalJson(entries.map(({event})=>event))).digest('hex');}
function validateProject({emit=true}={}){
  const errors=[];
  const warnings=[];
  const ajv=new Ajv2020({allErrors:true,strict:false});
  const schemas=loadSchemas(ajv,errors);
  const ids=new Map();
  const documents=new Map();
  const ignored=['/vendor/','/node_modules/','/.opencode/skills/'];
  for(const f of files(root,'.yaml')){
    const normalized=`/${relative(f)}`;
    if(ignored.some(part=>normalized.includes(part)))continue;
    let data;
    try{data=yaml.load(fs.readFileSync(f,'utf8'));}catch(error){errors.push(`${relative(f)}: YAML non valido: ${error.message}`);continue;}
    if(!data?.schema){errors.push(`${relative(f)}: campo schema mancante`);continue;}
    if(!schemas.has(data.schema)){errors.push(`${relative(f)}: schema sconosciuto ${data.schema}`);continue;}
    const validator=ajv.getSchema(data.schema);
    if(!validator(data)){errors.push(`${relative(f)}: ${ajv.errorsText(validator.errors)}`);continue;}
    documents.set(relative(f),data);
    const id=data?.identity?.id;
    if(id){if(ids.has(id))errors.push(`ID duplicato ${id}: ${ids.get(id)}, ${relative(f)}`);ids.set(id,relative(f));}
  }
  const chaptersDir=path.join(root,'planning/chapters');
  if(fs.existsSync(chaptersDir))for(const chapter of fs.readdirSync(chaptersDir)){
    const base=`planning/chapters/${chapter}`;
    if(!fs.existsSync(path.join(root,base,'skeleton.yaml')))continue;
    const skeleton=documents.get(`${base}/skeleton.yaml`);
    if(!skeleton)continue;
    const beats=skeleton['beat-sequence']||[];
    beats.forEach((id,index)=>{
      const p=`${base}/beats/${id}.yaml`;
      if(!fs.existsSync(path.join(root,p))){errors.push(`${base}/skeleton.yaml: riferimento mancante ${id}`);return;}
      const beat=documents.get(p);
      if(!beat)return;
      if(beat.identity.chapter!==chapter)errors.push(`${p}: chapter incoerente`);
      if(beat.identity['sequence-index']!==index+1)errors.push(`${p}: sequence-index errato`);
      const previous=index?beats[index-1]:null;
      const next=index<beats.length-1?beats[index+1]:null;
      if(beat.placement['previous-beat']!==previous||beat.placement['next-beat']!==next)errors.push(`${p}: catena previous/next incoerente`);
    });
    const manuscript=path.join(root,`manuscript/chapters/${chapter}/chapter.md`);
    if(fs.existsSync(manuscript)){
      const body=fs.readFileSync(manuscript,'utf8').replace(/^#.*$/m,'').replace(/<!--[^]*?-->/g,'').trim();
      if(body&&(skeleton.status!=='approved'||beats.some(id=>documents.get(`${base}/beats/${id}.yaml`)?.identity?.status!=='approved')))errors.push(`${relative(manuscript)}: prosa presente senza skeleton e contratti approvati`);
    }
  }
  const eventEntries=canonicalEvents(documents);const eventIds=new Map();const sequences=new Map();
  for(const {path:p,event} of eventEntries){
    const id=event.identity.id;const sequence=event.placement.sequence;
    if(eventIds.has(id))errors.push(`ID evento duplicato ${id}: ${eventIds.get(id)}, ${p}`);eventIds.set(id,p);
    if(sequences.has(sequence))errors.push(`Sequenza evento duplicata ${sequence}: ${sequences.get(sequence)}, ${p}`);sequences.set(sequence,p);
    const beatPath=`planning/chapters/${event.placement.chapter}/beats/${event.placement.beat}.yaml`;
    if(!documents.has(beatPath))errors.push(`${p}: beat inesistente o non valido ${event.placement.beat}`);
  }
  for(const {path:p,event} of eventEntries)for(const cause of event.causality['cause-events']){
    const source=eventEntries.find(entry=>entry.event.identity.id===cause)?.event;
    if(!source)errors.push(`${p}: causa canonica inesistente ${cause}`);
    else if(source.placement.sequence>=event.placement.sequence)errors.push(`${p}: causa futura o ciclica ${cause}`);
  }
  for(const {path:p,event} of eventEntries)for(const enabled of event.causality['enables-events'])if(!eventIds.has(enabled))errors.push(`${p}: evento abilitato canonico inesistente ${enabled}`);
  try{
    const derived=applyEvents(eventEntries);errors.push(...derived.errors);
    const snapshotPath='continuity/current-state/snapshot.yaml';const snapshot=documents.get(snapshotPath);
    if(snapshot){
      const hash=eventHash(eventEntries);
      if(snapshot['input-hash']!==hash)errors.push(`${snapshotPath}: snapshot obsoleto`);
      if(canonicalJson(snapshot.state)!==canonicalJson(derived.state))errors.push(`${snapshotPath}: stato non corrisponde agli eventi canonici`);
    }
  }catch(error){errors.push(error.message);}
  const forbiddenRoots=['planning','manuscript','story','continuity','deliberations','reviews','proposals','decisions','knowledge','.studio','templates'];
  if(forbiddenRoots.some(d=>files(path.join(root,d),'').some(f=>f.split(path.sep).includes('scenes'))))errors.push('Directory scenes/ vietata');
  const report={ok:errors.length===0,errors,warnings,ids:ids.size};
  if(emit)result(report.ok,'validate',{warnings,summary:`${ids.size} ID controllati; schemi, riferimenti, catene e gate verificati.`},errors);
  return report;
}

function stateAt(){
  const beat=operands[0]||null;const errors=[];
  if(beat&&!/^beat-[0-9]{3,}$/.test(beat))errors.push('state-at accetta un beat id valido');
  const entries=canonicalEvents();if(beat&&!entries.some(({event})=>event.placement.beat===beat)&&!files(path.join(root,'planning/chapters'),'.yaml').some(f=>path.basename(f)===`${beat}.yaml`))errors.push(`Beat sconosciuto: ${beat}`);
  let derived;try{derived=applyEvents(entries,{untilBeat:beat});}catch(error){errors.push(error.message);}
  if(derived)errors.push(...derived.errors);if(errors.length)return result(false,'state-at',{beat},errors);
  result(true,'state-at',{asOf:beat||'latest',state:derived.state,sourceEvents:derived.applied,summary:`Stato ricostruito da ${derived.applied.length} eventi.`});
}
function knowledgeOf(){
  const subject=operands[0];const beat=option('--at');if(!subject)return result(false,'knowledge-of',{},['knowledge-of richiede un soggetto']);
  let derived;try{derived=applyEvents(canonicalEvents(),{untilBeat:beat});}catch(error){return result(false,'knowledge-of',{subject},[error.message]);}
  if(derived.errors.length)return result(false,'knowledge-of',{subject},derived.errors);
  result(true,'knowledge-of',{subject,asOf:beat||'latest',knowledge:derived.state.knowledge[subject]||{},beliefs:derived.state.belief[subject]||{},summary:`Conoscenze ricostruite per ${subject}.`});
}
function historyOf(){
  const subject=operands[0];if(!subject)return result(false,'history-of',{},['history-of richiede un soggetto']);
  let derived;try{derived=applyEvents(canonicalEvents());}catch(error){return result(false,'history-of',{subject},[error.message]);}
  result(derived.errors.length===0,'history-of',{subject,history:derived.history.filter(item=>item.subject===subject),summary:`Storia delle transizioni per ${subject}.`},derived.errors);
}
function rebuildState(){
  const entries=canonicalEvents();let derived;try{derived=applyEvents(entries);}catch(error){return result(false,'rebuild-state',{},[error.message]);}
  if(derived.errors.length)return result(false,'rebuild-state',{},derived.errors);
  const document={schema:'continuity-state/v1',kind:'snapshot','as-of':entries.at(-1)?.event.identity.id||null,generated:true,'input-hash':eventHash(entries),'source-events':derived.applied,state:derived.state};
  const target=path.join(root,'continuity/current-state/snapshot.yaml');const tmp=`${target}.tmp`;fs.writeFileSync(tmp,yaml.dump(document,{lineWidth:120,noRefs:true}));fs.renameSync(tmp,target);
  result(true,'rebuild-state',{paths:['continuity/current-state/snapshot.yaml'],sourceEvents:derived.applied,summary:'Snapshot derivato rigenerato atomicamente.'});
}

function workflow(){return readYaml('.studio/workflow-state.yaml');}
function status(){const state=workflow();result(true,'project-status',{state:state.state,chapter:state.chapter,paths:['.studio/workflow-state.yaml'],summary:`${state.chapter}: ${state.state}`});}
function approvalFor(chapter){
  const p=`planning/chapters/${chapter}/approval.yaml`;
  return fs.existsSync(path.join(root,p))?{path:p,data:readYaml(p)}:null;
}
function approvalErrors(chapter,{beatId=null}={}){
  const base=`planning/chapters/${chapter}`;const approval=approvalFor(chapter);const errors=[];
  const skeletonPath=`${base}/skeleton.yaml`;
  if(!fs.existsSync(path.join(root,skeletonPath)))return [`Skeleton mancante per ${chapter}`];
  const skeleton=readYaml(skeletonPath);const beatIds=skeleton['beat-sequence']||[];
  if(!approval?.data?.approved?.by||!approval.data.approved.at)return [`Approvazione umana versionata mancante per ${chapter}`];
  if(approval.data.chapter!==chapter)errors.push(`L’approvazione appartiene a ${approval.data.chapter}, non a ${chapter}`);
  if(approval.data.artifacts?.skeleton?.version!==skeleton.version)errors.push('La versione approvata dello skeleton non coincide con l’artefatto corrente');
  const approvedBeats=approval.data.artifacts?.beats||[];const approvedIds=approvedBeats.map(item=>item.id);
  if(new Set(approvedIds).size!==approvedIds.length)errors.push('L’approvazione contiene Beat Contract duplicati');
  if(approvedIds.length!==beatIds.length||beatIds.some(id=>!approvedIds.includes(id))||approvedIds.some(id=>!beatIds.includes(id)))errors.push('L’approvazione non copre esattamente la sequenza corrente dei beat');
  for(const id of beatIds){
    const beatPath=`${base}/beats/${id}.yaml`;if(!fs.existsSync(path.join(root,beatPath)))continue;
    const approved=approvedBeats.find(item=>item.id===id);const beat=readYaml(beatPath);
    if(approved?.version!==beat.identity.version)errors.push(`Versione approvata non corrente per ${id}`);
  }
  if(beatId&&!beatIds.includes(beatId))errors.push(`${beatId} non appartiene alla sequenza corrente`);
  return errors;
}
const transitions={PROJECT_ORIENTATION:'BOOK_ARCHITECTURE',BOOK_ARCHITECTURE:'CHAPTER_INTENT',CHAPTER_INTENT:'EXPERT_DELIBERATION',EXPERT_DELIBERATION:'CHAPTER_SKELETON',CHAPTER_SKELETON:'BEAT_DESIGN',BEAT_DESIGN:'AWAITING_APPROVAL',AWAITING_APPROVAL:'DRAFTING',DRAFTING:'CONTRACT_AUDIT',CONTRACT_AUDIT:'EXPERT_REVIEW',EXPERT_REVIEW:'REVISION',REVISION:'CANON_UPDATE',CANON_UPDATE:'CHAPTER_ACCEPTED'};
function option(name){const index=args.indexOf(name);return index>=0?args[index+1]:null;}
function transition(){
  const state=workflow();const target=operands[0];const actor=option('--actor');const reason=option('--reason');const errors=[];
  if(transitions[state.state]!==target)errors.push(`Transizione illegale: ${state.state} → ${target||'(mancante)'}`);
  if(!actor||!reason)errors.push('La transizione richiede --actor e --reason');
  if(target==='DRAFTING'){
    const base=`planning/chapters/${state.chapter}`;const skeleton=readYaml(`${base}/skeleton.yaml`);
    if(skeleton.status!=='approved'||skeleton['beat-sequence'].some(id=>readYaml(`${base}/beats/${id}.yaml`).identity.status!=='approved'))errors.push('Skeleton e tutti i Beat Contract devono essere approvati');
    errors.push(...approvalErrors(state.chapter));
  }
  const validation=validateProject({emit:false});if(!validation.ok)errors.push(...validation.errors);
  if(errors.length)return result(false,'transition',{state:state.state,target},errors);
  state.history.push({from:state.state,to:target,reason,'approved-by':actor});state.state=target;
  const statePath=path.join(root,'.studio/workflow-state.yaml');const tmp=`${statePath}.tmp`;
  fs.writeFileSync(tmp,yaml.dump(state,{lineWidth:120}));fs.renameSync(tmp,statePath);
  result(true,'transition',{state:target,paths:['.studio/workflow-state.yaml'],summary:`Transizione applicata: ${target}`});
}
function gate(name){
  const state=workflow();
  const allowed={"beat-draft":['DRAFTING'],"beat-audit":['CONTRACT_AUDIT'],"beat-revise":['REVISION'],"canon-update":['CANON_UPDATE']}[name];
  const errors=[];
  if(!allowed.includes(state.state))errors.push(`Transizione negata: ${name} richiede ${allowed.join(' o ')}`);
  if(name==='beat-draft'){
    const beatId=operands[0];
    if(!/^beat-[0-9]{3,}$/.test(beatId||''))errors.push('beat-draft richiede un beat id valido');
    const base=`planning/chapters/${state.chapter}`;
    const skeletonPath=`${base}/skeleton.yaml`;
    const beatPath=`${base}/beats/${beatId}.yaml`;
    if(!fs.existsSync(path.join(root,skeletonPath)))errors.push(`Skeleton mancante per ${state.chapter}`);
    else if(readYaml(skeletonPath).status!=='approved')errors.push('Chapter Skeleton non approvato');
    if(beatId&&!fs.existsSync(path.join(root,beatPath)))errors.push(`Beat Contract mancante: ${beatId}`);
    else if(beatId&&readYaml(beatPath).identity.status!=='approved')errors.push(`Beat Contract non approvato: ${beatId}`);
    errors.push(...approvalErrors(state.chapter,{beatId}));
  }
  if(errors.length)return result(false,name,{state:state.state},errors);
  const validation=validateProject({emit:false});
  if(!validation.ok)return result(false,name,{state:state.state},['Progetto non valido prima dell’operazione',...validation.errors]);
  result(true,name,{state:state.state,summary:'Prerequisiti di stato e artefatti soddisfatti; l’agente può produrre la proposta prevista.'});
}
function exportManuscript(){
  const validation=validateProject({emit:false});
  if(!validation.ok)return result(false,'export',{},['Progetto non valido prima dell’esportazione',...validation.errors]);
  const architecture=readYaml('planning/book/architecture.yaml');
  const chapters=architecture.chapters||[];
  const errors=[];const sources=[];
  for(const chapter of chapters){
    const metadataPath=`manuscript/chapters/${chapter}/metadata.yaml`;
    const manuscriptPath=`manuscript/chapters/${chapter}/chapter.md`;
    if(!fs.existsSync(path.join(root,metadataPath))||!fs.existsSync(path.join(root,manuscriptPath))){errors.push(`${chapter}: manoscritto o metadata mancante`);continue;}
    const metadata=readYaml(metadataPath);
    if(metadata.status!=='accepted')errors.push(`Esportazione bloccata: ${chapter} ha stato manoscritto ${metadata.status}, richiesto accepted`);
    else sources.push(manuscriptPath);
  }
  if(errors.length)return result(false,'export',{excluded:chapters.filter(c=>!sources.some(p=>p.includes(`/${c}/`)))},errors);
  fs.mkdirSync(path.join(root,'dist'),{recursive:true});
  const out='dist/manuscript.md';const tmp=`${out}.tmp`;
  fs.writeFileSync(path.join(root,tmp),sources.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n\n'));
  fs.renameSync(path.join(root,tmp),path.join(root,out));
  result(true,'export',{paths:[out],chapters,summary:`Esportati ${chapters.length} capitoli accettati.`});
}

const deterministic=new Set(['validate','validate-project','project-status','transition','export','export-manuscript','beat-draft','beat-audit','beat-revise','canon-update','state-at','knowledge-of','history-of','rebuild-state','help']);
const agentic=new Set(['project-init','creative-direction','book-architecture','chapter-intent','council','chapter-skeleton','beat-design','chapter-review']);
if(!fs.existsSync(path.join(root,'.studio/project.yaml')))result(false,command,{},[`Project root non valida: ${root}`]);
else if(!deterministic.has(command))result(false,command,{requiredHarness:agentic.has(command)?'opencode':null},[agentic.has(command)?`AGENT_COMMAND_REQUIRED: ${command} richiede OpenCode`:`UNKNOWN_COMMAND: ${command}`]);
else switch(command){
  case'validate':case'validate-project':validateProject();break;
  case'project-status':status();break;
  case'transition':transition();break;
  case'export':case'export-manuscript':exportManuscript();break;
  case'beat-draft':case'beat-audit':case'beat-revise':case'canon-update':gate(command);break;
  case'state-at':stateAt();break;
  case'knowledge-of':knowledgeOf();break;
  case'history-of':historyOf();break;
  case'rebuild-state':rebuildState();break;
  case'help':result(true,'help',{commands:[...deterministic].filter(c=>c!=='help'),agentCommands:[...agentic],summary:'Usa OpenCode per i comandi agentici.'});break;
}
