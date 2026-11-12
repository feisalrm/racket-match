
import {usePreferences} from "../preferences/Preferences";
import type { Racket } from '../catalog/types';
import {specs,specText,hasEvidence,evidenceCondition,evidenceCount} from './registry';
export default function SpecDetails({racket:r}:{racket:Racket}){
 const {t,locale}=usePreferences();
return <section className="technical-details"><div className="technical-heading"><h3>{t("Spesifikasi & sumber")}</h3><span>{t(evidenceCount(r))}/{t(specs.length)}{t(" atribut bersumber")}</span></div><p className="small muted">{t("Bersumber = dicocokkan dengan publikasi yang ditautkan, bukan pengukuran unit fisik. — berarti belum tersedia.")}</p><div className="technical-grid">{specs.map(s=>{const e=r.evidence?.[s.key];return <div key={s.key} className="technical-cell"><small>{t(s.label)}</small><b>{t(specText(r,s.key))}</b><span className="condition-label">{t(evidenceCondition(r,s.key))}</span>{hasEvidence(r,s.key)&&e?<details><summary>{t("Sumber & tanggal ↗")}</summary><a href={e.url} target="_blank" rel="noreferrer">{e.title}</a><p>{t("Diperiksa: ")}{t(e.checkedAt)}</p>{e.note&&<p>{t(e.note)}</p>}</details>:<span className="unverified-field">{t("Belum diverifikasi")}</span>}</div>})}</div></section>}
