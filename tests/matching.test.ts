import assert from 'node:assert/strict';
import {rankMatches,isComplete,type MatchAnswers} from '../modules/matching/engine';
import {seed} from '../modules/catalog/seed';
import type {Racket} from '../modules/catalog/types';

const answers:MatchAnswers={
  level:'beginner',use:'recreational',style:'unsure',priorities:['power'],
  challenge:'none',response:'balanced',weight:'any'
};
const base=structuredClone(seed.rackets[0]);
const power:Racket={...base,id:'power',name:'Power',playerLevels:['beginner'],playingUses:['recreational'],characterTags:['power'],weight:280};
const control:Racket={...power,id:'control',name:'Control',characterTags:['control'],weight:315};
const balanced:Racket={...power,id:'balanced',name:'Balanced',characterTags:['power','control'],weight:300};
assert.equal(isComplete({priorities:[]}),false);
assert.equal(isComplete(answers),true);
assert.equal(isComplete({...answers,priorities:['power','control','spin']}),false);
const powerRanks=rankMatches([control,power],answers);
assert.equal(powerRanks[0].racket.id,'power');
assert.equal(rankMatches([control,power],{...answers,priorities:['control']})[0].racket.id,'control');
const weighted=rankMatches([power,{...power,id:'heavy',weight:315}],{...answers,weight:'heavy'});
assert.equal(weighted[0].racket.id,'heavy');
const excluded:Racket[]=[
 {...power,id:'draft',status:'draft'},
 {...power,id:'archive',status:'archived'},
 {...power,id:'demo',basis:'demo'}
];
assert.equal(rankMatches(excluded,answers).length,0);
const top=rankMatches([power,control,balanced,{...power,id:'fourth'},...excluded],answers);
assert.equal(top.length,3);
assert.ok(top.every(result=>Number.isFinite(result.index)&&result.index>=0&&result.index<=100));
assert.ok(top.every((result,index)=>index===0||top[index-1].index>=result.index));
assert.ok(top.every(result=>result.reasons.length>0));
const unknown:Racket={...power,weight:null,characterTags:undefined,playerLevels:undefined,playingUses:undefined};
const missing=rankMatches([unknown],{...answers,weight:'light'});
assert.equal(missing[0].coverage,0);
assert.ok(missing[0].notes.some(note=>note.includes('belum tersedia')));
assert.deepEqual(rankMatches([power,control],answers),rankMatches([power,control],answers));
assert.deepEqual(rankMatches([{...power,ratings:{power:1}},control],answers).map(result=>result.index),
 rankMatches([{...power,ratings:{power:10}},control],answers).map(result=>result.index));
const allUnknown:MatchAnswers={...answers,level:'unsure',style:'unsure',response:'unsure',weight:'any'};
assert.ok(rankMatches(seed.rackets,allUnknown).length<=3);
console.log('PASS: matching profile/priority/weight changes, top-three order, eligibility, missing data, deterministic indices, review score independence');
