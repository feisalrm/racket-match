
import {usePreferences} from "../preferences/Preferences";
import {useEffect,useState} from 'react';
import {Heart,Share2} from 'lucide-react';
export default function RacketActions({id,name}:{id:string;name:string}) {
 const {t,locale}=usePreferences();

 const [favorite,setFavorite]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{try{setFavorite(JSON.parse(localStorage.getItem('rm-favorites')??'[]').includes(id))}catch{}},[id]);
 function toggle(){try{const old=JSON.parse(localStorage.getItem('rm-favorites')??'[]') as string[];const next=old.includes(id)?old.filter(x=>x!==id):[...old,id];localStorage.setItem('rm-favorites',JSON.stringify(next));setFavorite(next.includes(id));window.dispatchEvent(new Event('rm-favorites-change'))}catch{setMessage('Penyimpanan perangkat tidak tersedia.')}}
 async function share(){const url=new URL(location.origin+location.pathname);url.searchParams.set('racket',id);try{if(navigator.share)await navigator.share({title:name,url:url.toString()});else{await navigator.clipboard.writeText(url.toString());setMessage('Tautan raket tersalin.')}}catch(e){if((e as Error).name!=='AbortError')setMessage('Tautan: '+url.toString())}}
 return <div className="racket-extra-actions"><button onClick={toggle} aria-pressed={favorite}><Heart size={15} fill={favorite?'currentColor':'none'}/>{t(favorite?'Disimpan':'Favorit')}</button><button onClick={share}><Share2 size={15}/>{t(" Bagikan raket")}</button>{message&&<small role="status">{t(message)}</small>}</div>;
}
