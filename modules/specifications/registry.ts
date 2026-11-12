import type {Racket,SpecKey,Evidence} from '../catalog/types';
export const conditions:Record<Evidence['condition'],string>={unstrung:'Tanpa senar',strung:'Bersenar',unspecified:'Kondisi tidak disebutkan','not-applicable':'Tidak bergantung senar'};
export const specs:{key:SpecKey;label:string;unit:string;type:'number'|'text';min?:number;max?:number}[]=[
{key:'weight',label:'Berat utama',unit:'g',type:'number',min:100,max:450},
{key:'weightStrung',label:'Berat bersenar',unit:'g',type:'number',min:100,max:500},
{key:'head',label:'Ukuran kepala',unit:'in²',type:'number',min:60,max:150},
{key:'balance',label:'Balance utama',unit:'mm',type:'number',min:200,max:450},
{key:'balanceStrung',label:'Balance bersenar',unit:'mm',type:'number',min:200,max:450},
{key:'pattern',label:'Pola senar',unit:'',type:'text'},
{key:'length',label:'Panjang',unit:'in',type:'number',min:19,max:30},
{key:'beam',label:'Beam width',unit:'mm',type:'text'},
{key:'swingweight',label:'Swingweight',unit:'kg·cm²',type:'number',min:100,max:450},
{key:'stiffness',label:'Stiffness',unit:'RA',type:'number',min:20,max:100},
{key:'tensionMin',label:'Tegangan minimum',unit:'lbs',type:'number',min:10,max:100},
{key:'tensionMax',label:'Tegangan maksimum',unit:'lbs',type:'number',min:10,max:100},
];
export const hasValue=(r:Racket,key:SpecKey)=>r[key]!==null&&r[key]!==undefined&&r[key]!=='';
export const hasEvidence=(r:Racket,key:SpecKey)=>hasValue(r,key)&&!!r.evidence?.[key]?.url&&!!r.evidence?.[key]?.checkedAt;
export const evidenceCount=(r:Racket)=>specs.filter(s=>hasEvidence(r,s.key)).length;
export const specText=(r:Racket,key:SpecKey)=>{const s=specs.find(s=>s.key===key)!;return hasValue(r,key)?`${r[key]}${s.unit?' '+s.unit:''}`:'—'};
export function evidenceCondition(r:Racket,key:SpecKey){return r.evidence?.[key]?conditions[r.evidence[key]!.condition]:['weight','balance','swingweight','stiffness'].includes(key)?'Kondisi belum dicatat':''}
export const displayBasis=(r:Racket)=>r.basis==='demo'?'Simulasi':r.basis==='unrated'?'Belum dinilai':r.basis==='playtest'?'Uji main':'Editorial';
