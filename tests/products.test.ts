import assert from 'node:assert/strict';
import {seed} from '../modules/catalog/seed';
import {upgradeCatalog} from '../modules/catalog/upgrade';
import {catalogSchema} from '../modules/catalog/validation';
import {familyKey,generationKey,sameGeneration,variantsFor,familiesFor,structureExisting,newVariantDraft} from '../modules/products/structure';
import {applyGalleryToVariants,galleryVariantsFor} from '../modules/detail/photos';
import type {Racket} from '../modules/catalog/types';
const ez=seed.rackets.find(r=>r.id==='yonex-ezone')!;
const variants=variantsFor(seed.rackets,ez);
assert.deepEqual(variants.map(r=>r.product!.variant),['98','100','100L']);
assert.deepEqual(variants.map(r=>r.weight),[305,300,285]);
assert.equal(variantsFor(seed.rackets,seed.rackets.find(r=>r.id==='diadem-nova')!).length,2);
assert.equal(variantsFor(seed.rackets,seed.rackets.find(r=>r.id==='tecnifibre-tfight300')!).length,1,'Unknown generations never merge');
const differentGeneration={...ez,id:'old-ezone',product:{...ez.product!,generation:'7th Gen'}};
const differentBrand={...ez,id:'other-brand',brand:'Wilson'};
const privateDraft={...ez,id:'private-draft',status:'draft' as const,product:{...ez.product!,variant:'Private'}};
assert.equal(variantsFor([...seed.rackets,differentGeneration,differentBrand,privateDraft],ez).length,3);
assert.equal(sameGeneration(ez,{...ez,brand:' YONEX ',product:{...ez.product!,family:' ezone ',generation:'8TH   GEN'}}),true);
assert.notEqual(familyKey(ez),familyKey(differentBrand));
assert.notEqual(generationKey(ez),generationKey(differentGeneration));
const differentFamily={...ez,id:'other-family',product:{...ez.product!,family:'PERCEPT'}};
const archivedVariant={...privateDraft,id:'archived-variant',status:'archived' as const,product:{...ez.product!,variant:'Archived'}};
const gallerySource={...ez,photos:[
 {url:'/api/photos?key=12345678-1234-1234-1234-123456789012.webp',alt:'Tampak depan',sourceUrl:''},
 {url:'https://example.com/ezone-detail.webp',alt:'Detail kepala',sourceUrl:'https://example.com/ezone'},
]};
const galleryCatalog={...seed,rackets:[
 ...seed.rackets.map(racket=>racket.id===ez.id?gallerySource:racket),
 differentGeneration,differentBrand,differentFamily,privateDraft,archivedVariant,
]};
const targetIds=new Set([...variants,privateDraft,archivedVariant].map(racket=>racket.id));
assert.deepEqual(new Set(galleryVariantsFor(galleryCatalog.rackets,gallerySource).map(racket=>racket.id)),new Set([...targetIds].filter(id=>id!==ez.id)));
const sharedGallery=applyGalleryToVariants(galleryCatalog,gallerySource);
for(const [index,racket] of sharedGallery.rackets.entries()){
 const original=galleryCatalog.rackets[index];
 if(targetIds.has(racket.id)){
  assert.deepEqual(racket,{...original,photos:gallerySource.photos});
  assert.notEqual(racket.photos,gallerySource.photos);
 }else{
  assert.equal(racket,original);
 }
}
assert.equal(catalogSchema.safeParse(sharedGallery).success,true);
assert.deepEqual(applyGalleryToVariants(sharedGallery,gallerySource),sharedGallery);
assert.equal(applyGalleryToVariants(galleryCatalog,{...gallerySource,photos:[]}),galleryCatalog);
assert.equal(applyGalleryToVariants(galleryCatalog,{...gallerySource,product:{...ez.product!,generation:''}}),galleryCatalog);
console.log('PASS: a gallery is reused within the same brand, family and generation, preserving variant data and photo order');
assert.equal(familiesFor(seed.rackets,'Yonex').filter(f=>f.label.includes('EZONE')).length,1);
const legacy=structuredClone(seed);for(const r of legacy.rackets)delete r.product;
const upgraded=upgradeCatalog(legacy);
assert.deepEqual(upgraded.rackets.slice(0,legacy.rackets.length).map(r=>r.id),legacy.rackets.map(r=>r.id),'Existing review/favourite/share IDs retained');
assert.deepEqual(upgraded.rackets.slice(0,legacy.rackets.length).map(({product,characterTags,characterSource,...rest})=>rest),legacy.rackets.map(({characterTags,characterSource,...rest})=>rest));
assert.deepEqual(structureExisting(upgraded),upgraded);
const unlinked=structuredClone(seed);unlinked.rackets[0].product=null;assert.equal(upgradeCatalog(unlinked).rackets[0].product,null,'Explicitly unlinked entries stay unlinked');
const custom=structuredClone(seed);custom.rackets[0].product={family:'Custom',generation:'Edition A',variant:'Unique'};
assert.deepEqual(upgradeCatalog(custom).rackets[0].product,custom.rackets[0].product,'Owner identity overrides survive');
const draft=newVariantDraft(ez,'new-variant');
assert.equal(draft.status,'draft');assert.equal(draft.product!.family,'EZONE');assert.equal(draft.product!.generation,'8th Gen');
assert.equal(draft.product!.variant,'');assert.equal(draft.weight,null);assert.equal(draft.head,null);assert.equal(draft.year,null);
assert.equal(draft.source,'');assert.equal(draft.photos,undefined);assert.equal(draft.evidence,undefined);assert.equal(draft.ratingContext,undefined);assert.equal(draft.affiliateLinks,undefined);assert.deepEqual(draft.ratings,{});
const duplicate=structuredClone(seed);duplicate.rackets.push({...ez,id:'duplicate',product:{...ez.product!,variant:' 100 '}});
assert.equal(catalogSchema.safeParse(duplicate).success,false);
duplicate.rackets.at(-1)!.product!.generation='7th Gen';assert.equal(catalogSchema.safeParse(duplicate).success,true);
const partial=structuredClone(seed);partial.rackets[0].product={family:'',generation:'v1',variant:'100'};assert.equal(catalogSchema.safeParse(partial).success,false);
console.log('PASS: variant specs, brand/generation isolation, unknown generations, public-only selectors, stable IDs, safe metadata upgrade, empty variant drafts and duplicate validation');
