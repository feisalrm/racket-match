
import {usePreferences} from "../preferences/Preferences";
import type {Racket} from '../catalog/types';
import {characters,levels,uses} from './registry';
import CharacterIcon from './CharacterIcon';
export default function ClassificationView({racket:r}:{racket:Racket}){
 const {t,locale}=usePreferences();
return <section className="classification-view"><div className="eyebrow">{t("GAME IDENTITY")}</div><h3>{t("Karakter & profil pemain")}</h3><div className="taxonomy-chips">{r.characterTags?.map(k=><span key={k}><CharacterIcon id={k}/>{t(characters.find(c=>c[0]===k)?.[1])}</span>)}</div>{!r.characterTags?.length&&<p>{t("Kategori belum ditentukan.")}</p>}<dl className="profile-lines"><div><dt>{t("Level kemampuan")}</dt><dd>{t(r.playerLevels?.map(k=>levels.find(x=>x[0]===k)?.[1]).join(' · ')||r.level)}</dd></div><div><dt>{t("Tujuan bermain")}</dt><dd>{t(r.playingUses?.map(k=>uses.find(x=>x[0]===k)?.[1]).join(' · ')||'Belum dikategorikan')}</dd></div></dl><p className="small muted">{t("Kategori mengikuti positioning produk, bukan skor uji main. Level bersifat indikatif; recreational adalah tujuan bermain yang dapat berlaku pada berbagai level.")}</p>{[r.characterSource].map((s,i)=>s&&<details key={i} className="classification-source"><summary>{t("Sumber kategori karakter · ")}{t(s.basis==='manufacturer'?'Positioning pabrikan':'Klasifikasi editorial')}</summary><p>{s.reason}</p><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><small>{t("Diperiksa ")}{t(s.checkedAt)}</small></details>)}</section>;}
