import {useState} from 'react';
import {usePreferences} from '../preferences/Preferences';
import {photosFor} from '../detail/photos';
import type {Racket} from './types';
import RacketArt from '../../shared/ui/RacketArt';
export default function CatalogPicture({racket:r,onOpen}:{racket:Racket;onOpen:()=>void}){
 const {t}=usePreferences();const[failed,setFailed]=useState('');
 const photo=photosFor(r)[0];const showPhoto=photo&&photo.url!==failed;
 return <><button className={'art-button '+(showPhoto?'has-catalog-photo':'')} onClick={onOpen} aria-label={t('Lihat detail '+r.name)}>{showPhoto?<img className="catalog-main-photo" src={photo.url} alt={t(photo.alt)} loading="lazy" decoding="async" onError={()=>setFailed(photo.url)}/>:<RacketArt color={r.color} id={r.id}/>}</button><span className="picture-caption">{t(showPhoto&&!photo.alt.toLowerCase().includes('ilustratif')?'FOTO PRODUK':'ILUSTRASI')}</span></>;
}
