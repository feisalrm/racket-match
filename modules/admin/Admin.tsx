import BulkCatalog from './BulkCatalog';
import ProductEditor from '../products/ProductEditor';
import {generationKey,newVariantDraft} from '../products/structure';
import {applyGalleryToVariants,galleryVariantsFor} from '../detail/photos';

import {usePreferences} from "../preferences/Preferences";
import AnalyticsAdmin from '../engagement/AnalyticsAdmin';
import EngagementAdmin from '../engagement/EngagementAdmin';
import PhotoEditor from '../detail/PhotoEditor';
import {marketplaces} from '../marketplace/MarketplaceLinks';
import TaxonomyEditor from '../taxonomy/TaxonomyEditor';
import Moderation from '../community/Moderation';
import Roadmap from '../roadmap/Roadmap';
import RatingEditor from '../ratings/RatingEditor';
import MethodGuide from '../ratings/MethodGuide';
import {standardGuides} from '../ratings/rubric';
import TechnicalEditor from '../specifications/TechnicalEditor';
import {evidenceCount,displayBasis} from '../specifications/registry';
import { useState } from 'react';
import type { Catalog,Racket,Attribute } from '../catalog/types';
import {Plus,Save,ArrowLeft,Settings2,Pencil,Archive,Eye} from 'lucide-react';
import ContentAgent from './ContentAgent';

export default function Admin({catalog,onSave,onView,canEdit,busy}:{catalog:Catalog;onSave:(c:Catalog)=>Promise<boolean>;onView:(racket:Racket)=>void;canEdit:boolean;busy:boolean}){
 const {t,locale}=usePreferences();

const[tab,setTab]=useState('rackets');const[edit,setEdit]=useState<Racket|null>(null);const[attr,setAttr]=useState<Attribute|null>(null);const[search,setSearch]=useState('');
const [uploadingPhotos,setUploadingPhotos]=useState(false);
const [selectedGalleryScope,setSelectedGalleryScope]=useState('');
const [affiliateSelection,setAffiliateSelection]=useState<{group:string;mode:'all'|'selected';ids:string[]} | null>(null);
const galleryVariants=edit?galleryVariantsFor(catalog.rackets,edit):[];
const galleryScope=edit?JSON.stringify([edit.id,generationKey(edit)]):'';
const shareGallery=galleryVariants.length>0&&galleryScope===selectedGalleryScope;

const affiliateScope=affiliateSelection?.group===galleryScope?affiliateSelection:null;
const affiliateMode=affiliateScope?.mode??'single';
const affiliateIds=affiliateScope?.ids??[];
const original=catalog.rackets.find(racket=>racket.id===edit?.id);
const affiliateUpdates=Object.fromEntries(marketplaces.flatMap(([id])=>{
  const value=edit?.affiliateLinks?.[id]?.trim();
  return value&&value!==original?.affiliateLinks?.[id]?.trim()?[[id,value]]:[];
}));
const affiliateTargets=galleryVariants.filter(racket=>affiliateMode==='all'||affiliateIds.includes(racket.id));
const missingAffiliateTargets=affiliateMode==='selected'&&affiliateTargets.length===0;

function openRacketEditor(racket:Racket){
  setAffiliateSelection(null);
  setSelectedGalleryScope('');
  setEdit(racket);
}
const newRacket=():Racket=>({id:crypto.randomUUID(),brand:'',name:'',year:new Date().getFullYear(),weight:null,head:null,balance:null,pattern:'16 × 19',level:'Belum dinilai',color:'#53794f',status:'draft',basis:'unrated',source:'',notes:'',ratings:{}});
async function saveRacket(event:React.FormEvent){
  event.preventDefault();
  if(!edit||!canEdit||busy||uploadingPhotos||missingAffiliateTargets)return;

  const exists=catalog.rackets.some(racket=>racket.id===edit.id);
  const rackets=exists?catalog.rackets.map(racket=>racket.id===edit.id?edit:racket):[...catalog.rackets,edit];
  const targets=new Set(affiliateTargets.map(racket=>racket.id));
  const next={...catalog,rackets:Object.keys(affiliateUpdates).length?rackets.map(racket=>
    targets.has(racket.id)?{...racket,affiliateLinks:{...racket.affiliateLinks,...affiliateUpdates}}:racket
  ):rackets};
  const updatedCatalog=shareGallery?applyGalleryToVariants(next,edit):next;
  if(await onSave(updatedCatalog))setEdit(null);
}
async function saveAttr(e:React.FormEvent){e.preventDefault();if(!attr)return;const exists=catalog.attributes.some(a=>a.id===attr.id);if(await onSave({...catalog,attributes:exists?catalog.attributes.map(a=>a.id===attr.id?attr:a):[...catalog.attributes,attr]}))setAttr(null)}
return <section className="admin-section"><div className="section-heading"><div><div className="eyebrow">{t("CONTENT STUDIO")}</div><h1>{t("Kelola katalog.")}</h1><p>{t("Spesifikasi, karakter, dan publikasi dalam satu tempat.")}</p></div><span className="private-label">{t("● Akses pemilik · Privat")}</span></div>{!canEdit&&<div className="notice">{t("Mode baca. Untuk menyimpan perubahan, ")}<a href="/signin-with-chatgpt?return_to=/" target="_top">{t("masuk dengan akun pemilik")}</a>.</div>}<div className="admin-stats"><div><b>{t(catalog.rackets.length)}</b><span>{t("Total raket")}</span></div><div><b>{t(catalog.rackets.filter(r=>r.status==='published').length)}</b><span>{t("Dipublikasikan")}</span></div><div><b>{t(catalog.rackets.filter(r=>r.status==='draft').length)}</b><span>{t("Draft")}</span></div><div><b>{t(catalog.attributes.filter(a=>a.active).length)}</b><span>{t("Atribut aktif")}</span></div></div><div className="admin-tabs"><button className={tab==='rackets'?'active':''} onClick={()=>{setTab('rackets');setAttr(null)}}>{t("Katalog raket")}</button><button className={tab==='attributes'?'active':''} onClick={()=>{setTab('attributes');setEdit(null)}}><Settings2 size={15}/>{t(" Atribut karakter")}</button><button className={tab==='method'?'active':''} onClick={()=>{setTab('method');setEdit(null);setAttr(null)}}>{t("Rubrik & metode")}</button><button className={tab==='moderation'?'active':''} onClick={()=>{setTab('moderation');setEdit(null);setAttr(null)}}>{t("Kelola review")}</button><button className={tab==='engagement'?'active':''} onClick={()=>{setTab('engagement');setEdit(null);setAttr(null)}}>{t("Feedback & laporan")}</button>{canEdit&&<button className={tab==='analytics'?'active':''} onClick={()=>{setTab('analytics');setEdit(null);setAttr(null)}}>{t('KPI situs')}</button>}<button className={tab==='roadmap'?'active':''} onClick={()=>{setTab('roadmap');setEdit(null);setAttr(null)}}>{t("Roadmap V1")}</button>{canEdit&&<button className={tab==='content'?'active':''} onClick={()=>{setTab('content');setEdit(null);setAttr(null)}}>Racket Match HQ</button>}</div>{tab==='content'&&canEdit?<ContentAgent/>:tab==='analytics'&&canEdit?<AnalyticsAdmin/>:tab==='engagement'?<EngagementAdmin/>:tab==='moderation'?<Moderation attributes={catalog.attributes}/>:tab==='roadmap'?<Roadmap/>:tab==='method'?<MethodGuide attributes={catalog.attributes}/>:edit?<form onSubmit={saveRacket} className="editor racket-editor"><button type="button" className="text-button" onClick={()=>setEdit(null)}><ArrowLeft size={15}/>{t(" Kembali")}</button><h2>{t(catalog.rackets.some(r=>r.id===edit.id)?'Edit raket':'Raket baru')}</h2><div className="form-grid">{(['brand','name','year'] as const).map(k=><label key={k}>{t(({brand:'Merek',name:'Nama model / varian',year:'Tahun model',weight:'Berat unstrung (g)',head:'Ukuran kepala (in²)',balance:'Balance unstrung (mm)',pattern:'Pola senar'})[k])}<input required={['brand','name'].includes(k)} type={['year','weight','head','balance'].includes(k)?'number':'text'} step="any" value={edit[k]??''} onChange={e=>setEdit({...edit,[k]:['year','weight','head','balance'].includes(k)?(e.target.value===''?null:Number(e.target.value)):e.target.value})}/></label>)}<label>{t("Warna ilustrasi")}<input type="color" value={edit.color} onChange={e=>setEdit({...edit,color:e.target.value})}/></label><label>{t("Status")}<select value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value as Racket['status']})}><option value="draft">{t("Draft")}</option><option value="published">{t("Published")}</option><option value="archived">{t("Archived")}</option></select></label></div><ProductEditor racket={edit} rackets={catalog.rackets} onChange={setEdit}/><TaxonomyEditor racket={edit} onChange={setEdit}/><PhotoEditor
 key={edit.id}
 racket={edit}
 onPhotosChange={photos=>setEdit(current=>current?.id===edit.id?{...current,photos}:current)}
 uploading={uploadingPhotos}
 onUploadingChange={setUploadingPhotos}
 disabled={!canEdit||busy}
 variantSharing={edit.product&&galleryVariants.length>0?{
   groupLabel:[edit.brand,edit.product.family,edit.product.generation].map(part=>part.trim()).join(' '),
   variants:[edit,...galleryVariants],
   checked:shareGallery,
   onChange:checked=>setSelectedGalleryScope(checked?galleryScope:''),
 }:undefined}
/><fieldset className="affiliate-editor"><legend>{t("Link affiliate marketplace")}</legend><p className="small muted">{t("Opsional. Isi link HTTPS untuk model ini. Kosongkan untuk menampilkan “Segera hadir”.")}</p><div className="form-grid">{marketplaces.map(([id,label])=><label key={id}>{t(label)}<input type="url" maxLength={2000} placeholder={t("https://…")} value={edit.affiliateLinks?.[id]??''} onChange={e=>setEdit({...edit,affiliateLinks:{...edit.affiliateLinks,[id]:e.target.value}})}/></label>)}</div>{galleryVariants.length>0&&<div className="affiliate-scope">
  <label>{t('Terapkan link ke')}
    <select value={affiliateMode} onChange={e=>{
      const mode=e.target.value;
      setAffiliateSelection(mode==='all'||mode==='selected'?{group:galleryScope,mode,ids:affiliateIds}:null);
    }}>
      <option value="single">{t('Varian ini saja')}</option>
      <option value="all">{t('Semua varian satu generasi')} ({galleryVariants.length+1})</option>
      <option value="selected">{t('Varian terpilih')}</option>
    </select>
  </label>
  {affiliateMode==='selected'&&<div className="affiliate-variants" role="group" aria-label={t('Varian terpilih')}>
    {galleryVariants.map(racket=><label className="checkbox-label" key={racket.id}>
      <input type="checkbox" checked={affiliateIds.includes(racket.id)} onChange={e=>setAffiliateSelection({
        group:galleryScope,mode:'selected',ids:e.target.checked?[...affiliateIds,racket.id]:affiliateIds.filter(id=>id!==racket.id),
      })}/>{racket.name}
    </label>)}
    {missingAffiliateTargets&&<p className="small muted">{t('Pilih minimal satu varian tambahan.')}</p>}
  </div>}
  {affiliateMode!=='single'&&<p className="small muted">{t('Link yang ditambahkan atau diubah akan menggantikan link marketplace yang sama pada varian tujuan.')}</p>}
</div>}</fieldset><TechnicalEditor racket={edit} onChange={setEdit}/><RatingEditor racket={edit} attributes={catalog.attributes} onChange={setEdit}/><label>{t("Catatan sumber spesifikasi / catatan umum")}<textarea maxLength={3000} value={edit.source} onChange={e=>setEdit({...edit,source:e.target.value})}/></label><label>{t("Catatan dan alasan kecocokan level")}<textarea maxLength={3000} value={edit.notes} onChange={e=>setEdit({...edit,notes:e.target.value})}/></label><button className="button dark" disabled={!canEdit||busy||uploadingPhotos||missingAffiliateTargets}><Save size={16}/>{t(busy?'Menyimpan…':'Simpan raket')}</button></form>:attr?<form onSubmit={saveAttr} className="editor"><button type="button" className="text-button" onClick={()=>setAttr(null)}><ArrowLeft size={15}/>{t(" Kembali")}</button><h2>{t("Definisi atribut")}</h2><label>{t("Nama atribut")}<input required maxLength={200} value={attr.name} onChange={e=>setAttr({...attr,name:e.target.value})}/></label><label>{t("Definisi / panduan penilaian")}<textarea required maxLength={1500} value={attr.description} onChange={e=>setAttr({...attr,description:e.target.value})}/></label>{!standardGuides[attr.id]?<div className="custom-scoring-guide"><h3>{t("Panduan penilaian khusus")}</h3><p className="small muted">{t("Isi semua bagian sebelum memublikasikan skor atribut baru. Skor yang sudah tersimpan mempertahankan salinan panduan saat dinilai.")}</p>{(['procedure','low','mid','high','top'] as const).map(k=><label key={k}>{t(({procedure:'Yang diamati / cara menilai',low:'Skor 1–3 · Rendah',mid:'Skor 4–6 · Sedang',high:'Skor 7–8 · Tinggi',top:'Skor 9–10 · Sangat tinggi'})[k])}<textarea maxLength={1500} value={attr.scoringGuide?.[k]??''} onChange={e=>setAttr({...attr,scoringGuide:{procedure:'',low:'',mid:'',high:'',top:'',...attr.scoringGuide,[k]:e.target.value}})}/></label>)}<button type="button" className="text-button" onClick={()=>{const{scoringGuide,...rest}=attr;setAttr(rest)}}>{t("Hapus panduan khusus")}</button></div>:<p className="small muted">{t("Atribut ini memakai panduan standar rubrik 1.0. Buka tab Rubrik & metode untuk definisi rentang skor.")}</p>}
<label className="checkbox-label"><input type="checkbox" checked={attr.active} onChange={e=>setAttr({...attr,active:e.target.checked})}/>{t(" Tampilkan di katalog dan comparison")}</label><p className="small muted">{t("Skala konsisten 1–10. Pengarsipan mempertahankan nilai yang sudah ada.")}</p><button className="button dark" disabled={!canEdit||busy}><Save size={16}/>{t(busy?'Menyimpan…':'Simpan atribut')}</button></form>:tab==='rackets'?<><BulkCatalog catalog={catalog} onSave={onSave} canEdit={canEdit} busy={busy}/><div className="admin-toolbar"><input placeholder={t("Cari nama atau merek…")} value={search} onChange={e=>setSearch(e.target.value)}/><button className="button dark" disabled={!canEdit} onClick={()=>openRacketEditor(newRacket())}><Plus size={16}/>{t(" Tambah raket")}</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("MODEL RAKET")}</th><th>{t("SPESIFIKASI")}</th><th>{t("STATUS")}</th><th>{t("BASIS DATA")}</th><th>{t("AKSI")}</th></tr></thead><tbody>{catalog.rackets.filter(r=>(r.name+' '+r.brand).toLowerCase().includes(search.toLowerCase())).map(r=><tr key={r.id}><td><b>{r.name}</b><small>{t(r.brand)} · {t(r.year??'Tahun belum dicatat')}</small></td><td>{t(r.weight??'—')}{t(" g · ")}{t(r.head??'—')}{t(" in²")}</td><td><span className={'status '+r.status}>{t(r.status)}</span></td><td>{t(displayBasis(r))}<small>{t(evidenceCount(r))}{t(" atribut bersumber")}</small></td><td><div className="catalog-row-actions">{r.status==='published'?<a className="text-button" href={'/?racket='+encodeURIComponent(r.id)} target="_blank" rel="noopener" aria-label={t('Lihat raket')+' · '+r.name}><Eye size={15}/>{t('Lihat')}</a>:<button type="button" className="text-button" onClick={()=>onView(r)} aria-label={t('Pratinjau raket')+' · '+r.name}><Eye size={15}/>{t('Pratinjau')}</button>}<button type="button" className="text-button new-variant-button" disabled={!canEdit} onClick={()=>openRacketEditor(newVariantDraft(r,crypto.randomUUID()))}><Plus size={13}/>{t('Tambah varian')}</button><button aria-label={t('Edit '+r.name)} className="icon-button" onClick={()=>openRacketEditor({...r,ratings:{...r.ratings}})}><Pencil size={16}/></button></div></td></tr>)}</tbody></table></div></>:<><div className="admin-toolbar"><p className="muted">{t("Atribut baru otomatis tersedia pada formulir penilaian.")}</p><button className="button dark" disabled={!canEdit} onClick={()=>setAttr({id:crypto.randomUUID(),name:'',description:'',active:true})}><Plus size={16}/>{t(" Tambah atribut")}</button></div><div className="attribute-list">{catalog.attributes.map(a=><button key={a.id} onClick={()=>setAttr({...a})}><div><strong>{t(a.name)}</strong><p>{t(a.description)}</p></div><span className="small">{t(a.active?'Aktif':'Diarsipkan')} <Pencil size={15}/></span></button>)}</div></>}</section>}
