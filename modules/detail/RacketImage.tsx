import {useState} from 'react';
import type {Racket} from '../catalog/types';
import {photosFor} from './photos';
import {usePreferences} from '../preferences/Preferences';
import RacketArt from '../../shared/ui/RacketArt';

/** Main gallery photo, with the same illustration fallback on every surface. */
export default function RacketImage({racket,id}:{racket:Racket;id:string}){
  const {t}=usePreferences();
  const [failed,setFailed]=useState('');
  const photo=photosFor(racket)[0];
  return <div className="racket-main-image">{photo&&photo.url!==failed
    ?<img src={photo.url} alt={t(photo.alt)} loading="lazy" decoding="async" onError={()=>setFailed(photo.url)}/>
    :<RacketArt color={racket.color} id={id}/>}</div>;
}
