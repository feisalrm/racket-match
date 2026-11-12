
import {usePreferences} from "../preferences/Preferences";
import {useRef,useState} from 'react';
import {Expand,X,ChevronLeft,ChevronRight} from 'lucide-react';
import type {Racket} from '../catalog/types';
import RacketArt from '../../shared/ui/RacketArt';
import {photosFor} from './photos';
export default function PhotoGallery({racket:r}:{racket:Racket}) {
 const {t,locale}=usePreferences();

 const photos=photosFor(r);
 const [index,setIndex]=useState(0),[failed,setFailed]=useState<string[]>([]);
 const available=photos.filter(p=>!failed.includes(p.url));const current=available[Math.min(index,available.length-1)];
 const dialog=useRef<HTMLDialogElement>(null);
 function move(n:number){setIndex((index+n+available.length)%available.length)}
 return <div className="photo-gallery">
 {current?<><button className="gallery-main" onClick={()=>dialog.current?.showModal()} aria-label={t("Perbesar foto raket")}><img src={current.url} alt={current.alt} onError={()=>{setFailed(x=>[...x,current.url]);setIndex(0)}}/><span><Expand size={13}/>{t(" Perbesar foto")}</span></button>
 <div className="gallery-thumbnails">{available.map((p,i)=><button key={p.url} aria-label={t(p.alt)} aria-pressed={index===i} onClick={()=>setIndex(i)}><img src={p.url} alt=""/></button>)}</div>
 <small>{t(current.alt)} · {current.sourceUrl?<a href={current.sourceUrl} target="_blank" rel="noreferrer">{t("Sumber foto ↗")}</a>:<span>{t("Foto diunggah pengelola")}</span>}</small>
 <dialog className="photo-lightbox" ref={dialog} aria-label={t('Foto '+r.name)} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}><button autoFocus className="lightbox-close" aria-label={t("Tutup foto")} onClick={()=>dialog.current?.close()}><X/></button><img src={current.url} alt={current.alt}/><div><button aria-label={t("Foto sebelumnya")} onClick={()=>move(-1)} disabled={available.length<2}><ChevronLeft/></button><span>{t(current.alt)} · {t(index+1)}/{t(available.length)}</span><button aria-label={t("Foto selanjutnya")} onClick={()=>move(1)} disabled={available.length<2}><ChevronRight/></button></div></dialog></>:
 <div className="gallery-placeholder"><RacketArt id={'photo-'+r.id} color={r.color}/><small>{t("Ilustrasi · Foto produk belum tersedia")}</small></div>}
 </div>;
}
