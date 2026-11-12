
import {usePreferences} from "../preferences/Preferences";
import {useState} from 'react';
import {KeyRound,Eye,EyeOff} from 'lucide-react';
export default function PasswordSettings({required=false}:{required?:boolean}){
 const {t,locale}=usePreferences();

 const[values,setValues]=useState({currentPassword:'',newPassword:'',confirm:''}),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 return <section className="password-settings"><h2><KeyRound size={18}/> {t(required?'Ganti password sementara':'Ganti password')}</h2>{required&&<p className="password-required" role="status">{t("Ganti password sementara sebelum membuka Admin studio.")}</p>}<form onSubmit={async e=>{e.preventDefault();setMessage('');if(values.newPassword!==values.confirm){setMessage('Konfirmasi password belum sama.');return}setBusy(true);try{const res=await fetch('/api/account',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'password',currentPassword:values.currentPassword,newPassword:values.newPassword})});const d=await res.json() as {error?:string};if(!res.ok)throw new Error(d.error);location.assign('/account?passwordChanged=1')}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}}>
 <label>{t("Password saat ini")}<input required maxLength={128} type={show?'text':'password'} autoComplete="current-password" value={values.currentPassword} onChange={e=>setValues({...values,currentPassword:e.target.value})}/></label>
 <label>{t("Password baru")}<input required minLength={12} maxLength={128} type={show?'text':'password'} autoComplete="new-password" value={values.newPassword} onChange={e=>setValues({...values,newPassword:e.target.value})}/><small>{t("Minimal 12 karakter, berbeda dari password sebelumnya.")}</small></label>
 <label>{t("Ulangi password baru")}<input required minLength={12} maxLength={128} type={show?'text':'password'} autoComplete="new-password" value={values.confirm} onChange={e=>setValues({...values,confirm:e.target.value})}/></label>
 <button type="button" className="text-button" aria-pressed={show} onClick={()=>setShow(!show)}>{show?<EyeOff size={14}/>:<Eye size={14}/>} {t(show?'Sembunyikan password':'Tampilkan password')}</button><button className="button dark" disabled={busy}>{t(busy?'Menyimpan…':'Simpan password baru')}</button>{message&&<p className="auth-message" role="status">{t(message)}</p>}
 </form><p className="small muted">{t("Setelah perubahan berhasil, sesi di perangkat lain akan berakhir.")}</p></section>;
}
