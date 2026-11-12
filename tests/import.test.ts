import assert from 'node:assert/strict';
import {seed} from '../modules/catalog/seed';
import {upgradeCatalog} from '../modules/catalog/upgrade';
import {catalogSchema} from '../modules/catalog/validation';
const result=upgradeCatalog(seed),added=result.rackets.filter(r=>r.importInfo);
console.log('Imported',added.length,'new entries; public total',result.rackets.filter(r=>r.status==='published').length);
assert.equal(catalogSchema.safeParse(result).success,true);
assert.deepEqual(upgradeCatalog(result),result);
for(const r of seed.rackets){const {characterTags,characterSource,...after}=result.rackets.find(x=>x.id===r.id)!;const {characterTags:beforeTags,characterSource:beforeSource,...before}=r;assert.deepEqual(after,before);}
assert.ok(added.every(r=>r.basis==='unrated'&&!Object.keys(r.ratings).length&&!r.evidence));
assert.ok(added.filter(r=>r.importInfo!.generationNote).every(r=>r.product?.generation===''));
assert.equal(result.rackets.filter(r=>r.product?.family==='EZONE'&&r.product.variant==='100').length,1);
assert.ok(added.find(r=>r.product?.family==='Project Bublik'&&r.product.variant==='100')?.weight===null);
const saved=structuredClone(result);saved.rackets=saved.rackets.filter(r=>r.id!==added[0].id);assert.deepEqual(upgradeCatalog(saved),saved);
console.log('PASS: import validation, existing IDs/data preserved, unverified data without scores, unknown generations isolated, null missing weight, idempotent import and deletions retained');
