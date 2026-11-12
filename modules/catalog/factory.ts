import type {Racket,SpecKey,Evidence} from './types';
const date='2026-11-03';
export function sourced(id:string,brand:string,name:string,color:string,values:Partial<Racket>,url:string,title:string,condition:Evidence['condition']='unstrung',notes=''):Racket{
 const base:Racket={id,brand,name,color,year:null,weight:null,head:null,balance:null,pattern:'',level:'Belum dinilai',status:'published',basis:'unrated',source:'Spesifikasi nominal dari publikasi pabrikan. Skor karakter dan level belum dinilai.',notes:notes||'Bukan pengukuran unit fisik. Variasi produksi dan setup senar dapat mengubah hasil.',ratings:{},evidence:{},...values};
 for(const key of ['weight','weightStrung','head','balance','balanceStrung','pattern','length','beam','swingweight','stiffness','tensionMin','tensionMax'] as SpecKey[]){if(base[key]!==undefined&&base[key]!==null&&base[key]!=='')base.evidence![key]={url,title,checkedAt:date,condition:['weightStrung','balanceStrung'].includes(key)?'strung':['weight','balance'].includes(key)?condition:['swingweight','stiffness'].includes(key)?'unspecified':'not-applicable',note:''};}
 return base;
}
