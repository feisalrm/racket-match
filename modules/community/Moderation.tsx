
import {usePreferences} from "../preferences/Preferences";
import {useEffect,useState,useRef} from 'react';
import type {Attribute} from '../catalog/types';
import type {Entry,Review} from './types';

type RacketOption = {id:string;name:string;brand:string};
export default function Moderation({attributes}:{attributes:Attribute[]}) {
 const {t,locale}=usePreferences();

  const [selected,setSelected]=useState<string[]>([]);
  const [entries,setEntries]=useState<Entry[]>([]);
  const [rackets,setRackets]=useState<RacketOption[]>([]);
  const [filters,setFilters]=useState({racket:'',kind:'review',status:'',demo:''});
  const [page,setPage]=useState(0);
  const [total,setTotal]=useState(0);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(false);
  const requestVersion=useRef(0);

  async function load() {
    const version=++requestVersion.current;
    setLoading(true);
    try {
      const params=new URLSearchParams({...filters,page:String(page)});
      const response=await fetch('/api/moderation?'+params);
      const data=await response.json() as {entries:Entry[];rackets:RacketOption[];total:number;error?:string};
      if (!response.ok) throw new Error(data.error);
      if(version!==requestVersion.current)return;
      setEntries(data.entries);setRackets(data.rackets);setTotal(data.total);setError('');
    } catch(error) { if(version===requestVersion.current)setError(error instanceof Error?error.message:'Gagal memuat'); }
    finally { if(version===requestVersion.current)setLoading(false); }
  }
  useEffect(()=>{setSelected([]);load()},[filters,page]);

  function filter(key:keyof typeof filters,value:string) {
    setFilters(previous=>({...previous,[key]:value}));setPage(0);setMessage('');
  }

  async function act(action:'withdraw'|'delete',entry?:Entry,selectedOnly=false) {
    const count=selectedOnly?selected.length:entry?1:total;
    const label=action==='delete'?'Hapus permanen':'Tarik dari publikasi';
    if (!count||!window.confirm(label+' '+count+' kontribusi '+(selectedOnly?'yang dipilih':entry?'ini':'sesuai filter pada seluruh halaman')+'?')) return;
    setBusy(true);setError('');setMessage('');
    try {
      const response=await fetch('/api/moderation',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action,filters,id:entry?.id,...(selectedOnly?{ids:selected}:{}),confirm:'APPLY'})});
      const data=await response.json() as {affected:number;error?:string};
      if (!response.ok) throw new Error(data.error);
      setSelected([]);
      setMessage(data.affected+' kontribusi '+(action==='delete'?'dihapus.':'ditarik.'));
      if(page===0)await load();else setPage(0);
    } catch(error) { setError(error instanceof Error?error.message:'Tindakan gagal'); }
    finally { setBusy(false); }
  }

  return <section className="moderation">
    <div className="section-heading"><div><h2>{t("Kelola review.")}</h2>
      <p>{t("Semua kontribusi, termasuk riwayat yang ditarik. Aksi massal mengikuti filter pada seluruh halaman.")}</p>
    </div><button className="button outline" disabled={busy} onClick={load}>{t("Muat ulang")}</button></div>
    <div className="review-admin-filters">
      <label>{t("Raket")}<select disabled={busy} value={filters.racket} onChange={event=>filter('racket',event.target.value)}>
        <option value="">{t("Semua raket")}</option>
        {[...rackets].sort((a,b)=>(a.brand+a.name).localeCompare(b.brand+b.name)).map(racket=>
          <option key={racket.id} value={racket.id}>{racket.brand+' · '+racket.name}</option>)}
      </select></label>
      <label>{t("Jenis")}<select disabled={busy} value={filters.kind} onChange={event=>filter('kind',event.target.value)}>
        <option value="">{t("Semua kontribusi")}</option><option value="review">{t("Review")}</option><option value="comment">{t("Komentar")}</option>
      </select></label>
      <label>{t("Status")}<select disabled={busy} value={filters.status} onChange={event=>filter('status',event.target.value)}>
        <option value="">{t("Semua status")}</option><option value="approved">{t("Terbit")}</option>
        <option value="rejected">{t("Ditarik")}</option><option value="pending">{t("Pending lama")}</option>
      </select></label>
      <label>{t("Data")}<select disabled={busy} value={filters.demo} onChange={event=>filter('demo',event.target.value)}>
        <option value="">{t("Semua data")}</option><option value="only">{t("Demo saja")}</option><option value="exclude">{t("Pengguna saja")}</option>
      </select></label>
    </div>
    <div className="review-bulk-actions"><b>{t(total)}{t(" kontribusi")}</b>
      <button className="button outline" disabled={busy||loading||!total} onClick={()=>act('withdraw')}>{t("Tarik semua hasil filter")}</button>
      <button className="button outline caution-action" disabled={busy||loading||!total} onClick={()=>act('delete')}>{t("Hapus semua hasil filter")}</button>
    </div>
    <div className="review-selection-bar">
      <label><input type="checkbox" disabled={busy||loading||!entries.length}
        checked={entries.length>0&&entries.every(entry=>selected.includes(entry.id))}
        onChange={event=>setSelected(event.target.checked?entries.map(entry=>entry.id):[])}/>{t(" Pilih semua di halaman ini")}</label>
      <span>{t(selected.length)}{t(" dipilih")}</span>
      <button className="text-button" disabled={busy||loading||!selected.length}
        onClick={()=>act('withdraw',undefined,true)}>{t("Tarik pilihan")}</button>
      <button className="text-button caution-action" disabled={busy||loading||!selected.length}
        onClick={()=>act('delete',undefined,true)}>{t("Hapus pilihan")}</button>
    </div>
    <p className="small muted">{t("Untuk membersihkan simulasi, pilih “Demo saja”, lalu hapus semua hasil filter.")}</p>
    {error&&<p className="notice" role="alert">{t(error)}</p>}
    {message&&<p role="status">{t(message)}</p>}
    {!entries.length&&<p className="muted">{t("Tidak ada kontribusi pada halaman ini.")}</p>}
    {entries.map(entry=>{
      const review=entry.payload as Review;
      const racket=rackets.find(racket=>racket.id===entry.racketId);
      return <article className="moderation-entry" key={entry.id}>
        <div className="moderation-meta"><label className="review-select-entry">
          <input type="checkbox" disabled={busy||loading} checked={selected.includes(entry.id)}
            aria-label={t('Pilih '+entry.displayName+' · '+(racket?.name??entry.racketId))}
            onChange={event=>setSelected(previous=>event.target.checked?[...previous,entry.id]:previous.filter(id=>id!==entry.id))}/>
          <b>{entry.displayName}{entry.isDemo&&<small className="demo-label">{t("DEMO")}</small>}</b></label>
          <span>{racket? racket.brand+' · '+racket.name:entry.racketId} · {t(entry.status==='approved'?'Terbit':entry.status==='rejected'?'Ditarik':'Pending lama')}</span></div>
        <p>{entry.payload.body}</p>
        {entry.kind==='review'&&<details><summary>{t("Skor & konteks")}</summary>
          <p>{t(review.basis==='playtest'?'Uji main':'Editorial')} · {t(entry.createdAt.slice(0,10))}</p>
          <div className="review-score-chips">{Object.entries(review.ratings).filter(([,value])=>value!=null).map(([id,value])=>
            <span key={id}>{attributes.find(attribute=>attribute.id===id)?.name??id}<b>{t(value)}/10</b></span>)}</div>
          {Object.entries(review.reasons).filter(([,reason])=>reason).map(([id,reason])=><p key={id}>{t(id)} · {t(reason)}</p>)}
          {review.sourceUrl&&<a href={review.sourceUrl} target="_blank" rel="noreferrer">{t("Sumber editorial ↗")}</a>}<p>{t(review.sessions?review.sessions+' sesi · ':'')}{[review.reference,review.stringSetup,review.tension,review.court,review.modifications].filter(Boolean).join(' · ')}</p>
          {review.personalAttributes.map(attribute=><p key={attribute.name}>{attribute.name} · {t(attribute.score)}/10 · {attribute.reason}</p>)}
        </details>}
        <div className="moderation-actions">
          {entry.status!=='rejected'&&<button disabled={busy||loading} className="text-button" onClick={()=>act('withdraw',entry)}>{t("Tarik")}</button>}
          <button disabled={busy||loading} className="text-button caution-action" onClick={()=>act('delete',entry)}>{t("Hapus")}</button>
        </div>
      </article>;
    })}
    <div className="review-bulk-actions">
      <button disabled={busy||page===0} onClick={()=>setPage(page-1)}>{t("← Sebelumnya")}</button>
      <span>{t("Halaman ")}{t(page+1)}{t(" · 50 per halaman")}</span>
      <button disabled={busy||(page+1)*50>=total} onClick={()=>setPage(page+1)}>{t("Berikutnya →")}</button>
    </div>
  </section>;
}
