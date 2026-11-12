import {Check,Layers} from 'lucide-react';
import type {Racket} from '../catalog/types';
import {usePreferences} from '../preferences/Preferences';
import {variantsFor} from './structure';
export default function VariantSelector({racket,rackets,onSelect}:{racket:Racket;rackets:Racket[];onSelect:(r:Racket)=>void}){
 const {t}=usePreferences();const variants=variantsFor(rackets,racket);if(!racket.product)return null;
 return <section className="variant-selector" aria-label={t('Pilih varian raket')}><div className="variant-selector-heading"><span><Layers size={14}/>{racket.product.family}{racket.product.generation&&' · '+racket.product.generation}</span><small>{t('Varian')}: <b>{racket.product.variant}</b></small></div>{variants.length>1&&<><div className="variant-options">{variants.map(v=><button type="button" key={v.id} aria-pressed={v.id===racket.id} onClick={()=>onSelect(v)}><span>{v.id===racket.id&&<Check size={12}/>}<b>{v.product?.variant??v.name}</b></span><small>{v.weight??'—'} g · {v.head??'—'} in² · {v.pattern||'—'}</small></button>)}</div><p>{t('Spesifikasi dan review berlaku untuk varian yang dipilih. Skor tidak digabung antarvarian atau generasi.')}</p></>}</section>;
}
