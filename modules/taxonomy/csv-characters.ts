import rows from '../catalog/import-data';
import {aliases,clean} from '../catalog/import-catalog';
import type {Catalog,Racket} from '../catalog/types';
import type {CharacterKey} from './registry';
// Editorial aliases for descriptors in the supplied CSV, never numerical ratings.
export const descriptorMap:Record<string,CharacterKey[]>={};
const register=(tag:CharacterKey,phrases:string[])=>phrases.forEach(p=>descriptorMap[p]=[...(descriptorMap[p]??[]),tag]);
register('power',['power','power mudah','bantuan power','power terkontrol','power seimbang','leverage','leverage tambahan']);
register('spin',['spin','spin mudah','pengembangan spin']);
register('control',['control','presisi','control seimbang','power terkontrol','lintasan terkontrol','pengembangan control','kepala kecil','pola senar rapat']);
register('comfort',['comfort','peredaman getaran','fleksibilitas']);
register('feel',['feel','feel klasik','touch']);
register('forgiveness',['sweet spot besar','sweet spot lebih besar','sweet spot luas','toleransi','toleransi salah titik pukul','toleransi tinggi','jangkauan','kepala besar','kepala sangat besar','panjang 28 inci']);
register('maneuver',['manuver','manuver cepat','manuver mudah','manuver ringan','ringan','sangat ringan','akselerasi ayunan','akselerasi mudah','mudah diayun','balance sangat head-light']);
register('stability',['stabilitas','stabilitas tinggi']);
for(const phrase of ['belum ditetapkan','rekreasional','serbaguna','all-court','ayunan pendek','baseline','menyerang','mudah digunakan','pemain berkembang','pengembangan teknik','servis','transisi junior','transisi net'])descriptorMap[phrase]=[];
export function mapCsvCharacters(description:string):CharacterKey[]{return [...new Set(description.split(';').flatMap(p=>descriptorMap[p.trim().toLowerCase()]??[]))];}
export function applyCsvCharacters(catalog:Catalog):Catalog{
 if((catalog.datasetVersion??0)>=5)return catalog;
 const rackets=catalog.rackets.map(r=>{
 const row=rows.find(row=>r.id==='csv-20261106-'+row.id||r.id===aliases[row.id]||r.product&&clean(r.brand)===clean(row.merek)&&clean(r.product.family)===clean(row.seri)&&clean(r.product.variant)===clean(row.varian)&&clean(r.product.generation)===clean(row.generasi));
 if(!row)return r;
 const mapped=mapCsvCharacters(row.karakter);
 const tags=[...new Set([...(r.characterTags??[]),...mapped])];
 if(!mapped.length||tags.length===(r.characterTags?.length??0))return r;
 const reason='Pemetaan editorial deskripsi CSV: '+row.karakter+'. Bukan skor uji main. Jangkauan dipetakan ke Forgiveness sesuai klasifikasi katalog.';
 return {...r,characterTags:tags,characterSource:{url:row.url_referensi,title:'Referensi produk · pemetaan karakter CSV',checkedAt:row.tanggal_penelusuran,basis:'editorial' as const,reason:(r.characterSource?.reason?r.characterSource.reason+' ':'')+reason}};
 });
 return {...catalog,rackets,datasetVersion:5};
}
