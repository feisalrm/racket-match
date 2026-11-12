
import {usePreferences} from "../preferences/Preferences";
import {Flag,MessageCircle,BarChart3,RefreshCw,Check} from 'lucide-react';
import type {Entry,Review} from '../community/types';
import {useEffect,useState} from 'react';
import {feedbackAreas, type FeedbackArea} from './site-feedback';
type Event={id:string;kind:string;createdAt:string;entryId?:string;racketId?:string;reason?:string;rating?:string;area?:FeedbackArea;comment?:string;event?:string;handled:boolean;reportedEntry?:Entry|null;racketName?:string};
const tabs=[{id:'report',label:'Laporan review',icon:Flag},{id:'match-feedback',label:'Feedback rekomendasi',icon:MessageCircle},{id:'site-feedback',label:'Masukan situs',icon:MessageCircle},{id:'usage',label:'Aktivitas',icon:BarChart3}] as const;
const ratings:Record<string,string>={helpful:'Membantu',unsure:'Belum yakin',unhelpful:'Kurang sesuai'};
const reasons:Record<string,string>={spam:'Spam / promosi',inaccurate:'Informasi meragukan',abuse:'Konten tidak pantas',other:'Lainnya'};
const activityLabels:Record<string,string>={catalog:'Eksplorasi katalog',compare:'Perbandingan', 'match-start':'Mulai Find Your Match','match-result':'Hasil rekomendasi','racket-detail':'Detail raket'};
export default function EngagementAdmin(){
 const {t,locale}=usePreferences();

 const[events,setEvents]=useState<Event[]>([]),[message,setMessage]=useState('');
 const[tab,setTab]=useState<string>('report'),[status,setStatus]=useState('all'),[loading,setLoading]=useState(true),[busy,setBusy]=useState<string|null>(null);
 async function load(){setLoading(true);setMessage('');try{const r=await fetch('/api/engagement');const d=await r.json() as {events:Event[];error?:string};if(!r.ok)throw new Error(d.error);setEvents(d.events)}catch(e){setMessage((e as Error).message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const [area, setArea] = useState('all');
 const category=events.filter(e=>e.kind===tab);
 const shown=category.filter(e=>
   (status==='all'||(status==='handled'?e.handled:!e.handled)) &&
   (tab!=='site-feedback'||area==='all'||e.area===area));
 const siteFeedbackCounts = Object.entries(feedbackAreas)
   .map(([id,label]) => ({id,label,count:category.filter(e=>e.area===id).length}))
   .sort((a,b)=>b.count-a.count);
 async function mark(id:string){setBusy(id);try{const r=await fetch('/api/engagement',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});if(!r.ok)throw new Error('Belum berhasil');await load()}catch(e){setMessage((e as Error).message)}finally{setBusy(null)}}
 return <section className={'engagement-section engagement-'+tab}>
 <div className="engagement-heading"><div><h2>{t("Feedback & laporan")}</h2><p className="small muted">{t("Menampilkan hingga 300 masukan situs dan 300 aktivitas lainnya yang terbaru.")}</p></div><button className="text-button" disabled={loading} onClick={load}><RefreshCw size={13}/> {t(loading?'Memuat…':'Muat ulang')}</button></div>
 <div className="engagement-subtabs" role="tablist" aria-label={t("Jenis data komunitas")}>{tabs.map(({id,label,icon:Icon},i)=><button key={id} id={'engagement-tab-'+id} role="tab" aria-selected={tab===id} aria-controls={'engagement-panel-'+id} tabIndex={tab===id?0:-1} onClick={()=>{setTab(id);setStatus('all')}} onKeyDown={e=>{let n=-1;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n>=0){e.preventDefault();setTab(tabs[n].id);setStatus('all');document.getElementById('engagement-tab-'+tabs[n].id)?.focus()}}}><Icon size={15}/>{t(label)}<span>{t(events.filter(e=>e.kind===id).length)}</span></button>)}</div>
 {message&&<p role="status">{t(message)}</p>}
 <div id={'engagement-panel-'+tab} role="tabpanel" aria-labelledby={'engagement-tab-'+tab} aria-busy={loading}>
 {tab==='usage'?<><p className="small muted">{t("Jumlah pembukaan fitur pada data terbaru; bukan jumlah pengguna unik.")}</p><div className="engagement-activity-grid">{Object.entries(activityLabels).map(([id,label])=><div key={id}><b>{t(category.filter(e=>e.event===id).length)}</b><span>{t(label)}</span></div>)}</div></>:<>
 {tab==='site-feedback'&&<div className="feedback-breakdown">{siteFeedbackCounts.map(({id,label,count})=><button key={id} type="button" aria-pressed={area===id} onClick={()=>setArea(area===id?'all':id)}>
   <span>{t(label)}</span><b>{count}</b><span className="feedback-breakdown-track" aria-hidden="true"><span style={{width:(category.length?count/category.length*100:0)+'%'}}/></span>
 </button>)}</div>}
 {tab==='match-feedback'&&<div className="engagement-feedback-stats">{Object.entries(ratings).map(([id,label])=><span key={id}>{t(label)}<b>{t(category.filter(e=>e.rating===id).length)}</b></span>)}</div>}
 <div className="engagement-list-toolbar"><p>{t(tab==='report'?'Laporan tidak otomatis menarik review. Isi review bisa dibaca langsung di bawah.':tab==='site-feedback'?'Masukan pengunjung untuk perbaikan situs.':'Penilaian pemain terhadap hasil Find Your Match.')}</p>{tab==='site-feedback'&&<label>{t('Bagian situs')} <select value={area} onChange={e=>setArea(e.target.value)}><option value="all">{t('Semua')}</option>{Object.entries(feedbackAreas).map(([id,label])=><option key={id} value={id}>{t(label)}</option>)}</select></label>}<label>{t("Status ")}<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">{t("Semua")}</option><option value="new">{t("Belum ditinjau")}</option><option value="handled">{t("Ditinjau")}</option></select></label></div>
 {!loading&&!shown.length&&<div className="engagement-empty">{t(category.length?'Tidak ada data yang cocok dengan filter.':tab==='report'?'Belum ada laporan review.':tab==='site-feedback'?'Belum ada masukan situs.':'Belum ada feedback rekomendasi.')}</div>}
 {shown.map(e=><article className="engagement-row" key={e.id}><div><div className="engagement-row-label"><b>{t(tab==='report'?(reasons[e.reason??'']??e.reason):e.area ? feedbackAreas[e.area] : (ratings[e.rating??'']??e.rating))}</b><span>{t(e.handled?'Ditinjau':'Belum ditinjau')}</span></div><p>{t(e.createdAt.slice(0,16).replace('T',' '))}{t(" UTC")}{t(e.racketId&&' · '+(e.racketName??e.racketId))}</p>{e.comment&&<p className="site-feedback-comment">{e.comment}</p>}{e.entryId&&<small>{t("ID review: ")}{t(e.entryId)}</small>}{e.kind==='report'&&(e.reportedEntry?<ReportedContent entry={e.reportedEntry}/>:<p className="small muted">{t("Konten sudah dihapus atau tidak tersedia.")}</p>)}{e.racketId&&<a className="text-button" href={'/?racket='+encodeURIComponent(e.racketId)+'&panel=community'} target="_blank" rel="noreferrer">{t("Buka komunitas raket ↗")}</a>}</div>{!e.handled&&<button className="button outline" disabled={busy!==null||loading} onClick={()=>mark(e.id)}><Check size={14}/> {t(busy===e.id?'Menyimpan…':'Tandai ditinjau')}</button>}</article>)}
 </>}
 </div></section>;
}

function ReportedContent({entry:e}:{entry:Entry}){
 const {t,locale}=usePreferences();
const r=e.payload as Review;return <div className="reported-content"><div><b>{e.displayName}</b><span>{t(e.status==='approved'?'Terbit':e.status==='rejected'?'Ditarik':'Pending')} · {t(e.updatedAt.slice(0,16))}</span></div>{r.title&&<h4>{r.title}</h4>}<p>{r.body}</p>{e.kind==='review'&&<><div className="review-score-chips">{Object.entries(r.ratings??{}).filter(([,v])=>v!=null).map(([id,v])=><span key={id}>{t(id)} <b>{t(v)}/10</b></span>)}</div><details><summary>{t("Alasan skor, setup & atribut pribadi")}</summary>{Object.entries(r.reasons??{}).filter(([,v])=>v).map(([id,v])=><p key={id}><b>{t(id)}:</b> {v}</p>)}<p>{[r.stringSetup,r.tension,r.sessions&&r.sessions+' sesi',r.court,r.modifications].filter(Boolean).join(' · ')||'Setup belum dicatat.'}</p>{r.reference&&<p>{t("Referensi: ")}{r.reference}</p>}{r.sourceUrl&&<a href={r.sourceUrl} target="_blank" rel="noreferrer">{t("Sumber editorial ↗")}</a>}{r.personalAttributes?.map(a=><p key={a.name}>{a.name}: {t(a.score)}/10 · {a.reason}</p>)}</details></>}</div>}
