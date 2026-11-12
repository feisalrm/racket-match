
import {usePreferences} from "../preferences/Preferences";
import {Flag,Send,ThumbsUp,HelpCircle,MessageCircle} from 'lucide-react';
import {useState} from 'react';
import {sendEvent} from './client';
export function ReviewReport({id}:{id:string}){
 const {t,locale}=usePreferences();

 const[reason,setReason]=useState('spam'),[sent,setSent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 return <details className="review-report"><summary><Flag size={12}/>{t(" Laporkan review")}</summary>{sent?<p role="status">{t("Laporan terkirim untuk ditinjau admin.")}</p>:<div><label>{t("Alasan laporan")}<select value={reason} onChange={e=>setReason(e.target.value)}><option value="spam">{t("Spam / promosi")}</option><option value="inaccurate">{t("Informasi meragukan")}</option><option value="abuse">{t("Konten tidak pantas")}</option><option value="other">{t("Lainnya")}</option></select></label><button disabled={busy} onClick={async()=>{setBusy(true);try{await sendEvent({kind:'report',entryId:id,reason});setSent(true)}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}}><Send size={12}/>{t(" Kirim laporan")}</button>{message&&<p role="status">{t(message)} <a href="/login" target="_top">{t("Masuk")}</a></p>}</div>}</details>;
}
export function MatchFeedback({ids}:{ids:string[]}){
 const {t,locale}=usePreferences();

 const[sent,setSent]=useState(false),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 return <div className="match-feedback"><b>{t("Apakah shortlist ini membantu?")}</b>{sent?<span role="status">{t("Terima kasih, feedback Anda tersimpan.")}</span>:<div>{[['helpful','Membantu'],['unsure','Belum yakin'],['unhelpful','Kurang sesuai']].map(([rating,label])=><button key={rating} disabled={busy} onClick={async()=>{setBusy(true);try{await sendEvent({kind:'match-feedback',rating,racketIds:ids});setSent(true)}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}}>{rating==='helpful'?<ThumbsUp size={12}/>:rating==='unsure'?<HelpCircle size={12}/>:<MessageCircle size={12}/>} {t(label)}</button>)}</div>}{message&&<small role="status">{t(message)}</small>}</div>;
}
