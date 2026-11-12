import type {Catalog,Racket,SpecKey,Evidence} from './types';
import type {CharacterKey,PlayerLevel} from '../taxonomy/registry';
import {normalized} from '../products/structure';
const series='https://id.wilson.com/pages/defyer-performance-rackets';
const checkedAt='2026-11-06';
const entries:{variant:string;slug:string;weight:number;head:number;balance:number;pattern:string;tags:CharacterKey[];levels:PlayerLevel[];reason:string;note:string}[]=[
 {variant:'98 Pro',slug:'wilson-defyer-98-pro-v1-tennis-racket',weight:305,head:98,balance:315,pattern:'16 × 20',tags:['spin','control','power'],levels:['advanced'],reason:'Halaman seri menempatkan 98 Pro untuk kompetitor advanced yang menginginkan presisi dan spin terkontrol; halaman produk menyebut power, spin, dan control.',note:'Halaman produk mencantumkan 31,5 cm / -8 poin; halaman seri mencantumkan 9 pts HL. Nilai 315 mm mengikuti cm pada halaman produk, tanpa konversi dari poin HL.'},
 {variant:'100',slug:'wilson-defyer-100-v1-tennis-racket',weight:300,head:100,balance:325,pattern:'16 × 19',tags:['spin','power','forgiveness'],levels:['intermediate','advanced'],reason:'Halaman seri menyebut pemain kompetitif yang menginginkan spin, power, dan respons lebih toleran.',note:'Halaman produk mencantumkan 32,5 cm / -6 poin; halaman seri mencantumkan 9 pts HL. Nilai 325 mm mengikuti cm pada halaman produk.'},
 {variant:'100L',slug:'100l-v1-tennis-racket',weight:285,head:100,balance:330,pattern:'16 × 19',tags:['maneuver','spin','stability'],levels:['intermediate'],reason:'Versi ringan untuk pemain kompetitif dan berkembang; halaman seri menekankan manuver, akselerasi, stabilitas, dan DNA spin Defyer.',note:'Halaman produk menulis 33 cm / -7 pts. Nilai 330 mm mengikuti cm yang dipublikasikan. Keterangan poin HL tidak konsisten dengan cm dan tidak digunakan untuk menghitung nilai.'},
 {variant:'100UL',slug:'wilson-defyer-100ul-v1-tennis-racket-unstrung-',weight:265,head:100,balance:330,pattern:'16 × 19',tags:['maneuver','spin','power'],levels:['beginner','intermediate'],reason:'Halaman seri dan produk menekankan rangka paling ringan, manuver mudah, akselerasi, dan DNA spin; halaman produk juga memuat positioning power.',note:'Halaman produk mencantumkan 33 cm / -4 pts. Nilai 330 mm mengikuti cm pada halaman produk.'}
];
export const defyerRackets:Racket[]=entries.map(e=>{
 const url='https://id.wilson.com/products/'+e.slug;
 const evidence:Partial<Record<SpecKey,Evidence>>={};
 for(const key of ['weight','head','balance','pattern','length'] as SpecKey[])evidence[key]={url,title:'Wilson Indonesia · DEFYER '+e.variant+' V1',checkedAt,condition:key==='weight'||key==='balance'?'unstrung':'not-applicable',note:key==='balance'?e.note:key==='head'?'Luas kepala dalam inci persegi.':key==='length'?'Panjang nominal 27 inci.':''};
 return {id:'wilson-defyer-'+e.variant.toLowerCase().replace(/ /g,'-')+'-v1',brand:'Wilson',name:'DEFYER '+e.variant+' V1',product:{family:'Defyer',generation:'V1',variant:e.variant},year:null,weight:e.weight,head:e.head,balance:e.balance,pattern:e.pattern,length:27,level:'Belum dinilai',color:'#e84538',status:'published',basis:'unrated',ratings:{},evidence,characterTags:e.tags,playerLevels:e.levels,playingUses:['competitive'],characterSource:{url:series,title:'Wilson Indonesia · DEFYER performance rackets',checkedAt,basis:'manufacturer',reason:e.reason},audienceSource:{url:series,title:'Wilson Indonesia · DEFYER performance rackets',checkedAt,basis:'editorial',reason:'Level dan tujuan merupakan pemetaan editorial dari deskripsi sasaran Wilson. '+e.reason},source:'Spesifikasi nominal dari halaman produk resmi Wilson Indonesia; karakter mengikuti positioning pabrikan. Belum ada skor uji main.',notes:'Edisi konsep pertama berukir REDLINE disebut Wilson memiliki rangka, spesifikasi, dan performa yang sama dengan Defyer standar. Tahun model tidak ditebak. '+e.note};
});
export function addDefyer(catalog:Catalog):Catalog{
 if((catalog.datasetVersion??0)>=6)return catalog;
 const rackets=[...catalog.rackets];
 for(const entry of defyerRackets){if(!rackets.some(r=>r.id===entry.id||r.product&&normalized(r.brand)==='wilson'&&normalized(r.product.family)==='defyer'&&normalized(r.product.generation)==='v1'&&normalized(r.product.variant)===normalized(entry.product!.variant)))rackets.push(structuredClone(entry));}
 return {...catalog,rackets,datasetVersion:6};
}
