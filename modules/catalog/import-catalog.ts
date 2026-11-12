import rows from './import-data';
import type {Catalog,Racket} from './types';
import {normalized} from '../products/structure';
export const clean=(s:string)=>normalized(s).replace(/[·×]/g,' ').replace(/[^a-z0-9+]/g,'');
const unknown=(s:string)=>/perlu|tidak dicantumkan|sebelumnya/i.test(s);
export const aliases:Record<string,string>={'racket-044':'yonex-ezone98','racket-048':'yonex-ezone','racket-050':'yonex-ezone100l','racket-060':'yonex-percept','racket-098':'tecnifibre-tfight300','racket-099':'tecnifibre-tfight285','racket-171':'solinco-whiteout','racket-172':'solinco-whiteout1820'};
export function importCatalog(catalog:Catalog):Catalog{
 if((catalog.datasetVersion??0)>=4)return catalog;
 const rackets=[...catalog.rackets];
 for(const row of rows){
 const id='csv-20261106-'+row.id;
 if(rackets.some(r=>r.id===id||r.id===aliases[row.id]))continue;
 const generation=unknown(row.generasi)?'':row.generasi;
 if(rackets.some(r=>r.product&&clean(r.brand)===clean(row.merek)&&clean(r.product.family)===clean(row.seri)&&clean(r.product.variant)===clean(row.varian)&&clean(r.product.generation)===clean(generation)))continue;
 const r:Racket={id,brand:row.merek,name:[row.seri,row.varian==='Standard'?'':row.varian,generation].filter(Boolean).join(' '),product:{family:row.seri,generation,variant:row.varian},year:/^20\d{2}$/.test(generation)?Number(generation):null,weight:row.berat_g?Number(row.berat_g):null,head:row.head_size_in2?Number(row.head_size_in2):null,balance:null,pattern:row.varian.match(/\d{2}x\d{2}/)?.[0].replace('x',' × ')??'',level:'Belum dinilai',color:'#607c71',status:'published',basis:'unrated',ratings:{},source:'Data impor CSV; belum diverifikasi terhadap referensi per varian.',notes:row.catatan,importInfo:{referenceUrls:[row.url_referensi,row.url_tambahan].filter(Boolean),weightCondition:'Berat tanpa senar',character:row.karakter,generationNote:unknown(row.generasi)?row.generasi:''}};
 rackets.push(r);
 }
 return {...catalog,rackets,datasetVersion:4};
}
