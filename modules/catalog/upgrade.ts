import {applyEditorialLevels} from '../taxonomy/editorial-levels';
import {addDefyer} from './defyer';
import {applyCsvCharacters} from '../taxonomy/csv-characters';
import {importCatalog} from './import-catalog';
import {structureExisting} from '../products/structure';
import {updateBladeV10Gallery} from '../detail/photos';
import {updateWilsonFrontPhotos} from './wilson-front-photos';
import {seed} from './seed';
import {seed as v2} from './v2-seed';
import {seed as legacy} from './legacy-seed';
import type {Catalog} from './types';
const canonical=(v:unknown):string=>v&&typeof v==='object'?Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical((v as Record<string,unknown>)[k])).join(',')+'}':JSON.stringify(v);
function advance(input:Catalog,old:Catalog,next:Catalog):Catalog{
 const rackets=input.rackets.map(r=>{const before=old.rackets.find(x=>x.id===r.id),after=next.rackets.find(x=>x.id===r.id);return before&&after&&canonical(r)===canonical(before)?structuredClone(after):r;});
 const known=new Set(old.rackets.map(r=>r.id));for(const r of next.rackets)if(!known.has(r.id)&&!rackets.some(x=>x.id===r.id))rackets.push(structuredClone(r));
 return {...input,rackets,datasetVersion:next.datasetVersion};
}
export function upgradeCatalog(input:Catalog):Catalog{
 let result=input;if((result.datasetVersion??0)<2)result=advance(result,legacy,v2);
 if((result.datasetVersion??0)<3)result=advance(result,v2,seed);
 const imported=importCatalog(structureExisting(result));
 const withDefyer=addDefyer(applyCsvCharacters(imported));
 return applyEditorialLevels(updateWilsonFrontPhotos(updateBladeV10Gallery(withDefyer)));
}
