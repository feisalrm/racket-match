import type {Catalog} from '../catalog/types';
import {catalogSchema} from '../catalog/validation';
import {newAssessmentError} from '../ratings/rubric';

export const numeric=['year','weight','weightStrung','head','balance','balanceStrung','length','swingweight','stiffness','tensionMin','tensionMax','ratingContext.sessions'];
const base=['brand','name',...numeric.filter(k=>!k.includes('.')),'pattern','beam','level','color','status','basis','source','notes','product.family','product.generation','product.variant','characterTags','playerLevels','playingUses'];
const sourceFields=['url','title','checkedAt','basis','reason'];
const specs=['weight','weightStrung','head','balance','balanceStrung','pattern','length','beam','swingweight','stiffness','tensionMin','tensionMax'];
const context=['rubricVersion','reviewer','evaluatedAt','reference','sourceUrl','stringSetup','tension','court','modifications','sessions'];
const lists=['characterTags','playerLevels','playingUses'];
const jsonFields=['photos','importInfo.referenceUrls'];
export function bulkColumns(c:Catalog){return ['id',...base,...['characterSource','audienceSource'].flatMap(k=>sourceFields.map(f=>k+'.'+f)),...specs.flatMap(k=>['url','title','checkedAt','condition','note'].map(f=>'evidence.'+k+'.'+f)),...context.map(k=>'ratingContext.'+k),...c.attributes.flatMap(a=>['ratings.'+a.id,'ratingContext.reasons.'+a.id]),...['tokopedia','shopee','tiktok'].map(k=>'affiliateLinks.'+k),'photos','importInfo.referenceUrls','importInfo.weightCondition','importInfo.character','importInfo.generationNote'];}
export function get(r:unknown,path:string):unknown{return path.split('.').reduce((v:any,k)=>v?.[k],r);}
function cell(v:unknown){let s=v==null?'':String(v);if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function exportCatalog(c:Catalog){const columns=bulkColumns(c);return '\uFEFF'+[columns.map(cell).join(';'),...c.rackets.map(r=>columns.map(k=>{const v=get(r,k);return cell(lists.includes(k)?(v as string[]|undefined)?.join('|'):jsonFields.includes(k)?v===undefined?'':JSON.stringify(v):v);}).join(';'))].join('\r\n');}
export function parseCsv(raw:string):string[][]{
 const text=raw.replace(/^\uFEFF/,'');const first=text.split(/\r?\n/,1)[0];const delimiter=(first.match(/;/g)?.length??0)>(first.match(/,/g)?.length??0)?';':',';
 const rows:string[][]=[];let row:string[]=[],value='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=ch;continue;}
 if(ch==='"'){if(value||closed)throw Error('Format tanda kutip CSV tidak valid.');quoted=true;}
 else if(ch===delimiter){row.push(value);value='';closed=false;}
 else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(v=>v.trim()))rows.push(row);row=[];value='';closed=false;}
 else{if(closed)throw Error('Karakter setelah tanda kutip CSV tidak valid.');value+=ch;}}
 if(quoted)throw Error('Tanda kutip CSV belum ditutup.');row.push(value);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
function set(r:any,path:string,value:unknown,clear:boolean){const parts=path.split('.');let target=r;for(const k of parts.slice(0,-1)){if(!target[k]){if(clear)return;target[k]={};}target=target[k];}const key=parts.at(-1)!;if(clear){if(numeric.includes(path)||path.startsWith('ratings.'))target[key]=null;else if(lists.includes(path)||path==='photos')target[key]=[];else if(parts.length===1&&['pattern','source','notes'].includes(path))target[key]='';else delete target[key];}else target[key]=value;}
export type BulkChange={id:string;name:string;field:string;before:unknown;after:unknown};
export type BulkPreview={catalog:Catalog;changes:BulkChange[];errors:string[];warnings:string[];rows:number;updated:number};
function normalizeDate(input:string){
 const text=input.trim().replace(/^'/,'');
 if(/^\d{4}-\d{2}-\d{2}$/.test(text))return text;
 const match=text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2}|\d{4})$/);
 if(!match)throw Error('tanggal harus YYYY-MM-DD atau DD/MM/YYYY (hari/bulan/tahun)');
 const [,day,month,year]=match;const iso=(year.length===2?'20'+year:year)+'-'+month.padStart(2,'0')+'-'+day.padStart(2,'0');
 const parsed=new Date(iso);if(Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==iso)throw Error('tanggal kalender tidak valid');return iso;
}
export function previewImport(c:Catalog,raw:string,format:'csv'|'xlsx'='csv'):BulkPreview{
 const result:BulkPreview={catalog:structuredClone(c),changes:[],errors:[],warnings:[],rows:0,updated:0};let data:string[][];
 try{data=parseCsv(raw);}catch(e){result.errors.push((e as Error).message);return result;}
 if(data.length<2){result.errors.push('File harus berisi header dan minimal satu baris raket.');return result;}
 if(data.length>501){result.errors.push('Maksimal 500 baris raket per file.');return result;}
 const headers=data[0].map(v=>v.trim()),allowed=new Set(bulkColumns(c));
 if(!headers.includes('id'))result.errors.push('Kolom id wajib ada.');
 if(new Set(headers).size!==headers.length)result.errors.push('Nama kolom duplikat.');
 for(const h of headers)if(!allowed.has(h))result.errors.push('Kolom tidak dikenal: '+h);
 if(result.errors.length)return result;
 const seen=new Set<string>();const byId=new Map(result.catalog.rackets.map(r=>[r.id,r]));
 for(const [index,row] of data.slice(1).entries()){
  result.rows++;const label='Baris '+(index+2);if(row.length!==headers.length){result.errors.push(label+': jumlah kolom tidak sesuai header.');continue;}
  const id=row[headers.indexOf('id')].trim(),r=byId.get(id);
  if(seen.has(id)){result.errors.push(label+': ID duplikat '+id);continue;}seen.add(id);
  if(!r){result.errors.push(label+': ID tidak dikenal '+(id||'(kosong)'));continue;}
  for(const [i,path] of headers.entries()){
   if(path==='id')continue;let text=row[i];if(!text.trim())continue;
   if(/^'[\s]*[=+@-]/.test(text))text=text.slice(1);
   const before=get(r,path),clear=text.trim()==='[CLEAR]';let value:unknown=text;
   try{
    if(!clear){if(numeric.includes(path)||path.startsWith('ratings.')){text=text.trim().replace(/^'/,'');
    if(/^\d{1,2}[.:]\d{2}[.:]00$/.test(text))throw Error('nilai berubah menjadi format jam Excel. Ekspor ulang sebagai Excel (.xlsx); jangan gunakan CSV yang sudah berubah.');
    if(!/^-?\d+(?:[.,]\d+)?$/.test(text))throw Error('harus berupa angka');value=Number(text.replace(',','.'));}
    else if(path==='beam'&&format==='csv'&&typeof before==='string'&&/^\d+\.0\d+$/.test(text.trim())&&before!==text.trim()&&Number(text.trim().split('.')[0]+'.'+Number(text.trim().split('.')[1]))===Number(before))throw Error('nilai '+text+' berbeda dari '+before+' dan diduga berubah oleh Excel. Ekspor ulang sebagai .xlsx atau koreksi nilai di file.');
    else if(path.endsWith('.checkedAt')||path==='ratingContext.evaluatedAt')value=normalizeDate(text);
    else if(lists.includes(path))value=[...new Set(text.split('|').map(v=>v.trim()).filter(Boolean))];
    else if(jsonFields.includes(path)){value=JSON.parse(text);if(!Array.isArray(value))throw Error('harus berupa JSON array');}}
    if(path.startsWith('ratingContext.')&&!r.ratingContext&&!clear)r.ratingContext={rubricVersion:'1.0',reviewer:'',evaluatedAt:'',reference:'',sourceUrl:'',stringSetup:'',tension:'',court:'',modifications:'',sessions:null,reasons:{}};
    set(r,path,value,clear);const after=get(r,path);
    if(JSON.stringify(before)!==JSON.stringify(after))result.changes.push({id,name:r.name,field:path,before,after});
   }catch(e){result.errors.push(label+' · '+path+': '+(e as Error).message);}
  }
 }
 // Remove emptied optional containers after explicit clears.
 for(const r of result.catalog.rackets)for(const key of ['product','characterSource','audienceSource','importInfo','evidence','affiliateLinks'] as const){const value=r[key];if(value){const prune=(v:any)=>{for(const k of Object.keys(v)){if(v[k]&&typeof v[k]==='object'&&!Array.isArray(v[k])){prune(v[k]);if(!Object.keys(v[k]).length)delete v[k];}}};prune(value);if(Object.keys(value).length===0)delete r[key];}}
 const validated=catalogSchema.safeParse(result.catalog);
 if(!validated.success)for(const issue of validated.error.issues.slice(0,30)){
  const path=issue.path;const racket=path[0]==='rackets'&&typeof path[1]==='number'?result.catalog.rackets[path[1]]:undefined;
  result.errors.push((racket?racket.name+' ['+racket.id+'] · ':'')+path.slice(racket?2:0).join('.')+': '+issue.message);
 }
 else {const error=newAssessmentError(validated.data,c);if(error)result.errors.push(error);}
 result.updated=new Set(result.changes.map(ch=>ch.id)).size;
 return result;
}
