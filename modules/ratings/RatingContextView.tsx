
import {usePreferences} from "../preferences/Preferences";
import type {Racket} from '../catalog/types';
import {displayBasis} from '../specifications/registry';
import {hasScores} from './rubric';
export default function RatingContextView({racket:r,compact=false}:{racket:Racket;compact?:boolean}){
 const {t,locale}=usePreferences();

 if(!hasScores(r))return null;const c=r.ratingContext;
 if(r.basis==='demo')return <p className="rating-context-warning">{t("Skor simulasi — bukan hasil penilaian raket.")}</p>;
 if(!c)return <p className="rating-context-warning">{t("Penilaian lama: reviewer, setup, dan versi rubrik belum dicatat.")}</p>;
 return <div className={'rating-context-view '+(compact?'compact':'')}><div><b>{t(displayBasis(r))}{t(" · Rubrik ")}{t(c.rubricVersion)}</b><span>{t(c.reviewer)} · {t(c.evaluatedAt)}</span></div><p><b>{t("Referensi:")}</b> {c.reference}</p>{r.basis==='playtest'?<><p>{c.stringSetup} · {c.tension} · {t(c.sessions??'—')}{t(" sesi")}</p>{!compact&&<><p>{c.court}</p><p>{t("Modifikasi: ")}{c.modifications}</p></>}</>:c.sourceUrl&&<a href={c.sourceUrl} target="_blank" rel="noreferrer">{t("Buka sumber editorial ↗")}</a>}</div>
}
