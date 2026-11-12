import {catalogueOrder} from '../products/structure';

import {usePreferences} from "../preferences/Preferences";
import {useEffect,useRef,useState} from 'react';
import {Check,Plus,Search,X} from 'lucide-react';
import type {Racket} from '../catalog/types';
import RacketImage from '../detail/RacketImage';

export default function RacketPicker({rackets,selected,onToggle,onClose}:{
  rackets:Racket[];selected:string[];onToggle:(id:string)=>void;onClose:()=>void;
}) {
 const {t,locale}=usePreferences();

  const dialog=useRef<HTMLDialogElement>(null);
  const [brand,setBrand]=useState('');
  const [query,setQuery]=useState('');
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const old=document.body.style.overflow;
    dialog.current?.showModal();document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=old;previous?.focus()};
  },[]);
  const brands=Array.from(new Set(rackets.map(r=>r.brand))).sort((a,b)=>a.localeCompare(b,'id'));
  const filtered=rackets.filter(r=>(!brand||r.brand===brand)&&(r.brand+' '+r.name).toLowerCase().includes(query.trim().toLowerCase()))
    .sort(catalogueOrder);
  return <dialog ref={dialog} className="racket-picker" aria-labelledby="picker-title" onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="picker-shell">
      <header className="picker-header"><div><div className="eyebrow">{t("SIDE BY SIDE")}</div><h2 id="picker-title">{t("Pilih raket pembanding")}</h2><p>{t("Pilih hingga 4 raket dari katalog.")}</p></div><button autoFocus className="icon-button" aria-label={t("Tutup pemilih raket")} onClick={onClose}><X size={20}/></button></header>
      <div className="picker-controls">
        <div className="picker-brands" aria-label={t("Pilih merek")}><button aria-pressed={!brand} onClick={()=>setBrand('')}>{t("Seluruh raket")}</button>{brands.map(b=><button key={b} aria-pressed={brand===b} onClick={()=>setBrand(b)}>{t(b)}</button>)}</div>
        <label className="picker-search"><Search size={16}/><input aria-label={t("Cari raket pembanding")} placeholder={t("Cari nama model atau merek…")} value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label={t("Bersihkan pencarian")} onClick={()=>setQuery('')}><X size={14}/></button>}</label>
      </div>
      <div className="picker-selected" aria-label={t("Raket terpilih")}><span>{t("Terpilih")}</span><div>{selected.length?selected.map(id=>rackets.find(r=>r.id===id)).filter((r):r is Racket=>!!r).map(r=><button key={r.id} onClick={()=>onToggle(r.id)} aria-label={t("Lepas "+r.brand+" "+r.name)}>{t(r.brand)} {r.name}<X size={12}/></button>):<small>{t("Belum ada raket dipilih.")}</small>}</div></div>
      <div className="picker-list"><p className="picker-count" role="status">{t(filtered.length)}{t(" raket")}{t(selected.length===4?' · Batas 4 raket tercapai. Lepas satu pilihan untuk mengganti.':'')}</p>
        <div className="picker-grid">{filtered.map(r=>{const checked=selected.includes(r.id);return <button key={r.id} className={'picker-racket '+(checked?'chosen':'')} aria-pressed={checked} disabled={!checked&&selected.length>=4} onClick={()=>onToggle(r.id)}>
          <RacketImage racket={r} id={'picker-'+r.id}/><span><small>{t(r.brand)}</small><b>{r.name}</b><span className="picker-spec">{t(r.weight??'—')}{t(" g · ")}{t(r.head??'—')}{t(" in² · ")}{t(r.pattern||'—')}</span></span><span className="picker-check">{checked?<Check size={16}/>:<Plus size={16}/>}</span>
        </button>})}</div>{!filtered.length&&<p className="picker-empty">{t("Tidak ada raket yang cocok. Coba kata kunci atau merek lain.")}</p>}
      </div>
      <footer className="picker-footer"><span><b>{t(selected.length)}/4</b>{t(" raket dipilih")}</span><button className="button dark" onClick={onClose}>{t("Selesai ")}<Check size={15}/></button></footer>
    </div>
  </dialog>;
}
