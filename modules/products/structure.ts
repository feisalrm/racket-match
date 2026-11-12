import type {Catalog,Racket} from '../catalog/types';
export type ProductIdentity={family:string;generation:string;variant:string};
export const normalized=(text:string)=>text.trim().replace(/\s+/g,' ').toLocaleLowerCase('en');
export const familyKey=(r:Racket)=>r.product?.family?JSON.stringify([normalized(r.brand),normalized(r.product.family)]):'';
export const generationKey=(r:Racket)=>r.product?.generation&&familyKey(r)?JSON.stringify([familyKey(r),normalized(r.product.generation)]):'';
export const sameGeneration=(a:Racket,b:Racket)=>!!generationKey(a)&&generationKey(a)===generationKey(b);
export function variantsFor(rackets:Racket[],racket:Racket){return rackets.filter(r=>r.status==='published'&&(r.id===racket.id||sameGeneration(r,racket))).sort((a,b)=>(a.product?.variant??a.name).localeCompare(b.product?.variant??b.name,'en',{numeric:true}));}
export function familiesFor(rackets:Racket[],brand?:string){return [...new Map(rackets.filter(r=>r.status==='published'&&r.product?.family&&(!brand||normalized(r.brand)===normalized(brand))).map(r=>[familyKey(r),{key:familyKey(r),label:r.brand+' · '+r.product!.family}])).values()].sort((a,b)=>a.label.localeCompare(b.label,'en',{numeric:true}));}
export const catalogueOrder=(a:Racket,b:Racket)=>a.brand.localeCompare(b.brand,'en')||(a.product?.family??a.name).localeCompare(b.product?.family??b.name,'en',{numeric:true})||(a.product?.generation??'').localeCompare(b.product?.generation??'','en',{numeric:true})||a.name.localeCompare(b.name,'en',{numeric:true});
// Explicit identities from existing model names only. An unknown generation stays empty.
const existing:Record<string,[string,string,string,string]>={
 'wilson-blade':['Blade 100 v9','Blade','v9','100'],
 'wilson-prostaff':['Pro Staff 97 v14','Pro Staff','v14','97'],
 'wilson-ultra':['Ultra 100 v4','Ultra','v4','100'],
 'babolat-drive':['Pure Drive Gen11','Pure Drive','Gen11','Standard'],
 'babolat-boostdrive':['Boost Drive · 121263','Boost Drive','','121263'],
 'head-gravity':['Gravity MP 2025','Gravity','2025','MP'],
 'head-boom':['Boom MP 2024','Boom','2024','MP'],
 'yonex-ezone':['EZONE 100 · 8th Gen','EZONE','8th Gen','100'],
 'yonex-ezone98':['EZONE 98 · 8th Gen','EZONE','8th Gen','98'],
 'yonex-ezone100l':['EZONE 100L · 8th Gen','EZONE','8th Gen','100L'],
 'yonex-percept':['PERCEPT 97 · 01PE97','PERCEPT','','97 · 01PE97'],
 'tecnifibre-tfight300':['T-Fight 300 · 14FI300X51','T-Fight','','300 · 14FI300X51'],
 'tecnifibre-tfight285':['T-Fight 285 · 14FI285X51','T-Fight','','285 · 14FI285X51'],
 'diadem-elevate':['Elevate V3 98','Elevate','V3','98'],
 'diadem-nova':['Nova V3 100','Nova','V3','100'],
 'diadem-novatour':['Nova V3 Tour','Nova','V3','Tour'],
 'solinco-blackout':['Blackout V2 300','Blackout','V2','300'],
 'solinco-whiteout':['Whiteout V2 305 · 16×19','Whiteout','V2','305 · 16×19'],
 'solinco-whiteout1820':['Whiteout V2 305 · 18×20','Whiteout','V2','305 · 18×20'],
 'wilson-tourslamlite':['Tour Slam Lite · Pre-strung','Tour Slam','','Lite · Pre-strung'],
};
export function structureExisting(catalog:Catalog):Catalog{return {...catalog,rackets:catalog.rackets.map(r=>{const known=existing[r.id];return r.product===undefined&&known&&r.name===known[0]?{...r,product:{family:known[1],generation:known[2],variant:known[3]}}:r})};}
export function newVariantDraft(base:Racket,id:string):Racket{return {id,brand:base.brand,name:'',year:null,weight:null,head:null,balance:null,pattern:'',level:'Belum dinilai',color:base.color,status:'draft',basis:'unrated',source:'',notes:'',ratings:{},product:{family:base.product?.family??'',generation:base.product?.generation??'',variant:''}};}
