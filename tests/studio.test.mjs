import test from 'node:test'; import assert from 'node:assert/strict'; import {spawnSync} from 'node:child_process';
const run=(...a)=>spawnSync(process.execPath,['scripts/studio.mjs',...a],{encoding:'utf8'});
test('project fixture validates',()=>{const r=run('validate','--json');assert.equal(r.status,0,r.stdout+r.stderr);assert.equal(JSON.parse(r.stdout).ok,true)});
test('drafting is blocked before approval',()=>{const r=run('beat-draft','beat-001','--json');assert.equal(r.status,1);assert.match(r.stdout,/Transizione negata/)});
test('export is blocked before acceptance',()=>{const r=run('export','--json');assert.equal(r.status,1);assert.match(r.stdout,/Esportazione bloccata/)});
test('machine status is stable',()=>{const r=run('project-status','--json');const d=JSON.parse(r.stdout);assert.equal(d.state,'AWAITING_APPROVAL');assert.deepEqual(d.paths,['.studio/workflow-state.yaml'])});
