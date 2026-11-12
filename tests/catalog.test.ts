import {matchesProfile} from '../modules/taxonomy/registry';
import {seed as v2} from '../modules/catalog/v2-seed';
import assert from 'node:assert/strict';
import {catalogSchema} from '../modules/catalog/validation';
import {seed} from '../modules/catalog/seed';
import {seed as legacy} from '../modules/catalog/legacy-seed';
import {upgradeCatalog} from '../modules/catalog/upgrade';
import {specs,hasEvidence} from '../modules/specifications/registry';
assert.equal(catalogSchema.safeParse(seed).success,true);
assert.equal(seed.rackets.filter(r=>r.status==='published').length,20);
assert.equal(new Set(seed.rackets.filter(r=>r.status==='published').map(r=>r.brand)).size,7);
assert.ok(seed.rackets.filter(r=>r.status==='published').every(r=>r.basis==='unrated'&&Object.keys(r.ratings).length===0));
for(const r of seed.rackets.filter(r=>r.status==='published'))for(const s of specs)if(r[s.key]!=null&&r[s.key]!=='')assert.ok(hasEvidence(r,s.key),r.id+' '+s.key);
for(const bad of [0,11,NaN]){const c=structuredClone(seed);c.rackets[0].basis='editorial';c.rackets[0].ratings.power=bad;assert.equal(catalogSchema.safeParse(c).success,false);}
const empty=structuredClone(seed);empty.rackets[0].weight=null;delete empty.rackets[0].evidence!.weight;empty.rackets[0].ratings.power=null;assert.equal(catalogSchema.safeParse(empty).success,true);
const duplicate=structuredClone(seed);duplicate.attributes.push(duplicate.attributes[0]);assert.equal(catalogSchema.safeParse(duplicate).success,false);
const dynamic=structuredClone(seed);dynamic.attributes.push({id:'serve',name:'Serve',description:'Uji servis',active:true});dynamic.rackets[0].basis='editorial';dynamic.rackets[0].ratings.serve=8;assert.equal(catalogSchema.safeParse(dynamic).success,true);
const unsafe=structuredClone(seed);unsafe.rackets[0].evidence!.weight!.url='javascript:alert(1)';assert.equal(catalogSchema.safeParse(unsafe).success,false);
const invalidDate=structuredClone(seed);invalidDate.rackets[0].evidence!.weight!.checkedAt='2026-02-31';assert.equal(catalogSchema.safeParse(invalidDate).success,false);
const tension=structuredClone(seed);tension.rackets[1].tensionMin=70;assert.equal(catalogSchema.safeParse(tension).success,false);
const upgraded=upgradeCatalog(structuredClone(legacy));assert.equal(upgraded.rackets.filter(r=>r.status==='published').length,192);assert.equal(upgraded.datasetVersion,9);
assert.deepEqual(upgradeCatalog(upgraded),upgraded);
const edited=structuredClone(legacy);edited.rackets[0].notes='Catatan pemilik';edited.rackets[0].ratings.power=5;
const kept=upgradeCatalog(edited);assert.equal(kept.rackets[0].notes,'Catatan pemilik');assert.equal(kept.rackets[0].ratings.power,5);
const deleted=structuredClone(legacy);deleted.rackets=deleted.rackets.filter(r=>r.id!=='wilson-blade');assert.ok(!upgradeCatalog(deleted).rackets.some(r=>r.id==='wilson-blade'));
console.log('PASS: 20 sourced models, field evidence, missing values, score bounds, URLs, dates, tensions, safe/idempotent upgrade');

const publicModels=seed.rackets.filter(r=>r.status==='published');
assert.ok(publicModels.every(r=>r.characterTags?.length&&r.characterSource&&r.playerLevels?.length&&r.audienceSource));
for(const key of ['power','spin','control','comfort','feel','forgiveness','maneuver','stability'])assert.ok(publicModels.some(r=>matchesProfile(r,'','',key)),key);
const beginner=publicModels.filter(r=>matchesProfile(r,'beginner','recreational','power'));assert.ok(beginner.some(r=>r.id==='wilson-tourslamlite'));
assert.equal(publicModels.filter(r=>r.brand==='Solinco'&&matchesProfile(r,'advanced','','control')).length,2);
assert.equal(publicModels.filter(r=>r.brand==='Diadem'&&matchesProfile(r,'beginner','','power')).length,1);
const modifiedV2=structuredClone(v2);modifiedV2.rackets[0].notes='Owner edit v2';assert.equal(upgradeCatalog(modifiedV2).rackets[0].notes,'Owner edit v2');
const deletedV2=structuredClone(v2);deletedV2.rackets=deletedV2.rackets.filter(r=>r.id!=='yonex-ezone98');assert.ok(!upgradeCatalog(deletedV2).rackets.some(r=>r.id==='yonex-ezone98'));
assert.deepEqual(upgradeCatalog(structuredClone(v2)),upgradeCatalog(seed));
const missingSource=structuredClone(seed);delete missingSource.rackets[0].characterSource;assert.equal(catalogSchema.safeParse(missingSource).success,false);
const badCategory=structuredClone(seed);(badCategory.rackets[0].characterTags as string[])=['invented'];assert.equal(catalogSchema.safeParse(badCategory).success,false);
console.log('PASS: seven brands, combined profile filters, taxonomy evidence, safe v2 migration');

const profileWithoutSource=structuredClone(seed);
delete profileWithoutSource.rackets[0].audienceSource;
assert.equal(catalogSchema.safeParse(profileWithoutSource).success,true);
const linked=structuredClone(seed);
linked.rackets[0].affiliateLinks={tokopedia:'https://example.com/product',shopee:'',tiktok:'https://example.com/affiliate'};
const savedLinks=catalogSchema.parse(linked).rackets[0].affiliateLinks;
assert.equal(savedLinks?.tokopedia,'https://example.com/product');
for(const invalid of ['javascript:alert(1)','http://example.com','not-a-url']){
 linked.rackets[0].affiliateLinks={tokopedia:invalid};
 assert.equal(catalogSchema.safeParse(linked).success,false);
}
console.log('PASS: affiliate links persist, empty placeholders accepted, unsafe URLs rejected');
const photoCatalog=structuredClone(seed);
photoCatalog.rackets[0].photos=[{url:'https://example.com/front.jpg',alt:'Depan',sourceUrl:'https://example.com/product'}];
assert.equal(catalogSchema.parse(photoCatalog).rackets[0].photos?.[0].alt,'Depan');
photoCatalog.rackets[0].photos[0].url='javascript:alert(1)';
assert.equal(catalogSchema.safeParse(photoCatalog).success,false);
console.log('PASS: photo metadata retained and unsafe photo URLs rejected');
const previousGallery=structuredClone(upgraded);
previousGallery.datasetVersion=6;
const blade104=previousGallery.rackets.find(racket=>racket.id==='csv-20261106-racket-006')!;
const oldPhoto={url:'https://example.com/old-blade.webp',alt:'Foto lama',sourceUrl:''};
blade104.photos=[oldPhoto];
previousGallery.rackets.find(racket=>racket.id==='wilson-blade')!.photos=[oldPhoto];
const updatedGallery=upgradeCatalog(previousGallery);
const bladeV10Variants=updatedGallery.rackets.filter(racket=>racket.brand==='Wilson'&&racket.product?.family==='Blade'&&racket.product.generation==='V10');
assert.equal(bladeV10Variants.length,6);
for(const racket of bladeV10Variants){
  assert.deepEqual(racket.photos?.map(photo=>photo.url.split('/').at(-1)),[
    'front.webp','throat-and-grip.webp','head-side.webp','blade-side.webp','string-bed.webp','wilson-side.webp',
  ]);
}
assert.deepEqual(updatedGallery.rackets.find(racket=>racket.id==='wilson-blade')!.photos,[oldPhoto]);
bladeV10Variants[0].photos=[];
assert.deepEqual(upgradeCatalog(updatedGallery).rackets.find(racket=>racket.id===bladeV10Variants[0].id)!.photos,[]);
console.log('PASS: six Blade V10 galleries replaced in order, saved V9 photos and later gallery edits retained');
const uploadedPhotoCatalog=structuredClone(seed);
uploadedPhotoCatalog.rackets[0].photos=[{url:'/api/photos?key=12345678-1234-1234-1234-123456789012.png',alt:'Photo upload',sourceUrl:''}];
assert.equal(catalogSchema.safeParse(uploadedPhotoCatalog).success,true);
uploadedPhotoCatalog.rackets[0].photos[0].url='/api/photos?key=12345678-1234-1234-1234-123456789012.avif';
assert.equal(catalogSchema.safeParse(uploadedPhotoCatalog).success,true);
uploadedPhotoCatalog.rackets[0].photos[0].url='/api/photos?key=../../bad.png';
assert.equal(catalogSchema.safeParse(uploadedPhotoCatalog).success,false);
