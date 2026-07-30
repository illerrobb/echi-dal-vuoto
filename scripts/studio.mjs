#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
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
function validateProject({emit=true}={}){
  const errors=[];
  const warnings=[];
  const ajv=new Ajv2020({allErrors:true,strict:false});
  const schemas=loadSchemas(ajv,errors);
  const ids=new Map();
  const ignored=['/vendor/','/node_modules/','/.opencode/skills/'];
  for(const f of files(root,'.yaml')){
    const normalized=`/${relative(f)}`;
    if(ignored.some(part=>normalized.includes(part)))continue;
    let data;
    try{data=yaml.load(fs.readFileSync(f,'utf8'));}catch(error){errors.push(`${relative(f)}: YAML non valido: ${error.message}`);continue;}
    if(!data?.schema){errors.push(`${relative(f)}: campo schema mancante`);continue;}
    if(!schemas.has(data.schema)){errors.push(`${relative(f)}: schema sconosciuto ${data.schema}`);continue;}
    const validator=ajv.getSchema(data.schema);
    if(!validator(data))errors.push(`${relative(f)}: ${ajv.errorsText(validator.errors)}`);
    const id=data?.identity?.id;
    if(id){if(ids.has(id))errors.push(`ID duplicato ${id}: ${ids.get(id)}, ${relative(f)}`);ids.set(id,relative(f));}
  }
  const chaptersDir=path.join(root,'planning/chapters');
  if(fs.existsSync(chaptersDir))for(const chapter of fs.readdirSync(chaptersDir)){
    const base=`planning/chapters/${chapter}`;
    if(!fs.existsSync(path.join(root,base,'skeleton.yaml')))continue;
    const skeleton=readYaml(`${base}/skeleton.yaml`);
    const beats=skeleton['beat-sequence']||[];
    beats.forEach((id,index)=>{
      const p=`${base}/beats/${id}.yaml`;
      if(!fs.existsSync(path.join(root,p))){errors.push(`${base}/skeleton.yaml: riferimento mancante ${id}`);return;}
      const beat=readYaml(p);
      if(beat.identity.chapter!==chapter)errors.push(`${p}: chapter incoerente`);
      if(beat.identity['sequence-index']!==index+1)errors.push(`${p}: sequence-index errato`);
      const previous=index?beats[index-1]:null;
      const next=index<beats.length-1?beats[index+1]:null;
      if(beat.placement['previous-beat']!==previous||beat.placement['next-beat']!==next)errors.push(`${p}: catena previous/next incoerente`);
    });
    const manuscript=path.join(root,`manuscript/chapters/${chapter}/chapter.md`);
    if(fs.existsSync(manuscript)){
      const body=fs.readFileSync(manuscript,'utf8').replace(/^#.*$/m,'').replace(/<!--[^]*?-->/g,'').trim();
      if(body&&(skeleton.status!=='approved'||beats.some(id=>readYaml(`${base}/beats/${id}.yaml`).identity.status!=='approved')))errors.push(`${relative(manuscript)}: prosa presente senza skeleton e contratti approvati`);
    }
  }
  const forbiddenRoots=['planning','manuscript','story','continuity','deliberations','reviews','proposals','decisions','knowledge','.studio','templates'];
  if(forbiddenRoots.some(d=>files(path.join(root,d),'').some(f=>f.split(path.sep).includes('scenes'))))errors.push('Directory scenes/ vietata');
  const report={ok:errors.length===0,errors,warnings,ids:ids.size};
  if(emit)result(report.ok,'validate',{warnings,summary:`${ids.size} ID controllati; schemi, riferimenti, catene e gate verificati.`},errors);
  return report;
}

function workflow(){return readYaml('.studio/workflow-state.yaml');}
function status(){const state=workflow();result(true,'project-status',{state:state.state,chapter:state.chapter,paths:['.studio/workflow-state.yaml'],summary:`${state.chapter}: ${state.state}`});}
function approvalFor(chapter){
  const p=`planning/chapters/${chapter}/approval.yaml`;
  return fs.existsSync(path.join(root,p))?{path:p,data:readYaml(p)}:null;
}
const transitions={PROJECT_ORIENTATION:'BOOK_ARCHITECTURE',BOOK_ARCHITECTURE:'CHAPTER_INTENT',CHAPTER_INTENT:'EXPERT_DELIBERATION',EXPERT_DELIBERATION:'CHAPTER_SKELETON',CHAPTER_SKELETON:'BEAT_DESIGN',BEAT_DESIGN:'AWAITING_APPROVAL',AWAITING_APPROVAL:'DRAFTING',DRAFTING:'CONTRACT_AUDIT',CONTRACT_AUDIT:'EXPERT_REVIEW',EXPERT_REVIEW:'REVISION',REVISION:'CANON_UPDATE',CANON_UPDATE:'CHAPTER_ACCEPTED'};
function option(name){const index=args.indexOf(name);return index>=0?args[index+1]:null;}
function transition(){
  const state=workflow();const target=operands[0];const actor=option('--actor');const reason=option('--reason');const errors=[];
  if(transitions[state.state]!==target)errors.push(`Transizione illegale: ${state.state} → ${target||'(mancante)'}`);
  if(!actor||!reason)errors.push('La transizione richiede --actor e --reason');
  if(target==='DRAFTING'){
    const base=`planning/chapters/${state.chapter}`;const skeleton=readYaml(`${base}/skeleton.yaml`);const approval=approvalFor(state.chapter);
    if(skeleton.status!=='approved'||skeleton['beat-sequence'].some(id=>readYaml(`${base}/beats/${id}.yaml`).identity.status!=='approved'))errors.push('Skeleton e tutti i Beat Contract devono essere approvati');
    if(!approval?.data?.approved?.by)errors.push('Record di approvazione umana mancante');
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
    const approval=approvalFor(state.chapter);
    if(!approval?.data?.approved?.by||!approval.data.approved.at)errors.push(`Approvazione umana versionata mancante per ${state.chapter}`);
    else if(beatId){
      const beat=readYaml(beatPath);
      const approvedBeat=approval.data.artifacts?.beats?.find(item=>item.id===beatId);
      const skeleton=readYaml(skeletonPath);
      if(approval.data.artifacts?.skeleton?.version!==skeleton.version||approvedBeat?.version!==beat.identity.version)errors.push('Le versioni approvate non coincidono con gli artefatti correnti');
    }
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

const deterministic=new Set(['validate','validate-project','project-status','transition','export','export-manuscript','beat-draft','beat-audit','beat-revise','canon-update','help']);
const agentic=new Set(['project-init','book-architecture','chapter-intent','council','chapter-skeleton','beat-design','chapter-review']);
if(!fs.existsSync(path.join(root,'.studio/project.yaml')))result(false,command,{},[`Project root non valida: ${root}`]);
else if(!deterministic.has(command))result(false,command,{requiredHarness:agentic.has(command)?'opencode':null},[agentic.has(command)?`AGENT_COMMAND_REQUIRED: ${command} richiede OpenCode`:`UNKNOWN_COMMAND: ${command}`]);
else switch(command){
  case'validate':case'validate-project':validateProject();break;
  case'project-status':status();break;
  case'transition':transition();break;
  case'export':case'export-manuscript':exportManuscript();break;
  case'beat-draft':case'beat-audit':case'beat-revise':case'canon-update':gate(command);break;
  case'help':result(true,'help',{commands:[...deterministic].filter(c=>c!=='help'),agentCommands:[...agentic],summary:'Usa OpenCode per i comandi agentici.'});break;
}
