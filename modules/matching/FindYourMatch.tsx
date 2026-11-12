
import {usePreferences} from "../preferences/Preferences";
import {MatchFeedback} from '../engagement/Feedback';
import {sendEvent} from '../engagement/client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,Plus,RotateCcw,Sparkles} from 'lucide-react';
import type {Racket} from '../catalog/types';
import MarketplaceLinks from '../marketplace/MarketplaceLinks';
import RacketImage from '../detail/RacketImage';
import CharacterIcon from '../taxonomy/CharacterIcon';
import {isComplete,rankMatches,type MatchAnswers} from './engine';
import {proRacketAssociations} from './pro-racket-associations';
import {steps} from './questions';

export default function FindYourMatch({rackets,selected,onToggle,onDetail,onCompare}:{
  rackets:Racket[];selected:string[];onToggle:(id:string)=>void;
  onDetail:(racket:Racket)=>void;onCompare:()=>void;
}) {
 const {t,locale}=usePreferences();

  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Partial<MatchAnswers>>({priorities:[]});
  const [finished,setFinished]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{heading.current?.focus()},[step,finished]);
  useEffect(()=>{sendEvent({kind:'usage',event:finished?'match-result':'match-start'}).catch(()=>{})},[finished]);
  const question=steps[step];
  const canContinue=question.fields.every(field=>field.key==='priorities'?
    !!answers.priorities?.length:!!answers[field.key]);
  const results=finished&&isComplete(answers)?rankMatches(rackets,answers):[];

  function choose(key:keyof MatchAnswers,value:string) {
    setAnswers(previous=>{
      if(key!=='priorities')return {...previous,[key]:value};
      const priorities=previous.priorities??[];
      const next=priorities.includes(value as MatchAnswers['priorities'][number])?
        priorities.filter(id=>id!==value):priorities.length<2?[...priorities,value]:priorities;
      return {...previous,priorities:next as MatchAnswers['priorities']};
    });
  }
  function next() {
    if(!canContinue)return;
    if(step===steps.length-1)setFinished(true);
    else setStep(step+1);
  }

  return <section className={"match-section "+(finished?"is-results":"is-quiz")}>
    <div className="match-intro">
      <div className="eyebrow"><Sparkles size={14}/>{t(" FIND YOUR MATCH / V1.1")}</div>
      <h1>{t("Temukan ")}<em>{t("raket Anda.")}</em></h1>
      <p>{t("6 langkah singkat · Pilihan sesuai permainan Anda")}</p>
    </div>
    {!finished?<div className="match-quiz">
      <div className="match-step-meta"><span>{t("Langkah ")}{t(step+1)} / {t(steps.length)}</span><span>{t("Tanpa login")}</span></div>
      <progress aria-label={t("Progres Find Your Match")} max={steps.length} value={step+1}/>
      <h2 ref={heading} tabIndex={-1}>{t(question.title)}</h2>
      <p className="muted">{t(question.description)}</p>
      {question.fields.map(field=><fieldset className="match-field" key={field.key}>
        <legend>{t(field.label)}{field.key==='priorities'&&<span> · {t(answers.priorities?.length??0)}{t("/2 dipilih")}</span>}</legend>
        <div className={'match-options '+(field.options.length>4?'match-options-grid':'')}>
          {field.options.map(([id,label,description])=>{
            const checked=field.key==='priorities'?answers.priorities?.includes(id as MatchAnswers['priorities'][number]):answers[field.key]===id;
            const disabled=field.key==='priorities'&&!checked&&(answers.priorities?.length??0)>=2;
            return <label className={'match-option '+(checked?'chosen':'')} key={id}>
              <input type={field.key==='priorities'?'checkbox':'radio'} name={field.key}
                value={id} checked={!!checked} disabled={disabled} onChange={()=>choose(field.key,id)}/>
              {field.key==='priorities'&&<CharacterIcon id={id}/>}
              <span><b>{t(label)}</b><small>{t(description)}</small></span>
              {checked&&<Check className="match-option-check" size={16}/>}
            </label>;
          })}
        </div>
      </fieldset>)}
      <div className="match-navigation">
        <button className="text-button" disabled={step===0} onClick={()=>setStep(step-1)}><ArrowLeft size={16}/>{t(" Sebelumnya")}</button>
        <button className="button dark" disabled={!canContinue} onClick={next}>
          {t(step===steps.length-1?'Lihat hasil':'Lanjut')}<ArrowRight size={16}/>
        </button>
      </div>
    </div>:<div className="match-results">
      <div className="section-heading"><div>
        <div className="eyebrow">{t("YOUR SHORTLIST")}</div>
        <h2 ref={heading} tabIndex={-1}>{t("Tiga pilihan untuk dicoba.")}</h2>
        <p>{t("Diurutkan dari indeks kecocokan tertinggi dengan jawaban Anda.")}</p>
      </div><button className="text-button" onClick={()=>{setFinished(false);setStep(0)}}><ArrowLeft size={14}/>{t(" Ubah jawaban")}</button></div>
      {!results.length?<div className="empty"><h3>{t("Belum ada kandidat dari katalog.")}</h3><p>{t("Coba lagi setelah model yang sesuai dipublikasikan.")}</p></div>:
        <div className="match-results-grid">{results.map((result,index)=>{
          const pro=proRacketAssociations[result.racket.id];
          return <article className={"match-result "+(index===0?"match-result-best":"")} key={result.racket.id}>
          <div className="match-result-top"><span className="match-rank">{index===0?<><Sparkles size={14}/>{t(" Pilihan utama")}</>:<>0{index+1}{t(" · Alternatif")}</>}</span>
            <span className="match-index"><b>{t(result.index)}</b><small>{t("/100 kecocokan")}</small></span></div>
          <div className="match-result-identity">
            <RacketImage racket={result.racket} id={'match-'+result.racket.id}/>
            <div><span className="eyebrow">{t(result.racket.brand)}</span><h3>{result.racket.name}</h3>
              <p>{t(result.racket.weight??'—')}{t(" g · ")}{t(result.racket.head??'—')}{t(" in² · ")}{t(result.racket.pattern||'—')}</p></div>
          </div>
          <p className="match-variant-note">{t('Rekomendasi ini untuk varian yang tertera.')}</p><h4>{t(index===0?"Mengapa ini paling cocok?":"Cocok untuk Anda karena")}</h4>
          <ul>{result.reasons.slice(0,3).map(reason=><li key={reason}>{t(reason)}</li>)}</ul>
          {pro&&<div className="match-pro">
            <span className="match-pro-label">{t('Pilihan pemain pro')}</span>
            <div><a href={pro.equipmentUrl} target="_blank" rel="noreferrer">{pro.name}</a><span>{t('Peringkat terbaik ATP')} #{pro.peak}</span></div>
            <small>{t('Spesifikasi raket pro dapat dikustomisasi.')}</small>
          </div>}
          <MarketplaceLinks racket={result.racket} compact/>
          <div className="match-result-actions">
            <button className="text-button" onClick={()=>onDetail(result.racket)}>{t("Lihat detail ")}<ArrowRight size={14}/></button>
            <button className={'button '+(selected.includes(result.racket.id)?'outline':'dark')} onClick={()=>onToggle(result.racket.id)}>
              {selected.includes(result.racket.id)?<Check size={14}/>:<Plus size={14}/>}
              {t(selected.includes(result.racket.id)?'Dipilih':'Bandingkan')}
            </button>
          </div>
        </article>})}</div>}
      <MatchFeedback ids={results.map(r=>r.racket.id)}/>
      <details className="match-method-note"><summary>{t("Tentang indeks kecocokan /100")}</summary>

        <p>{t("Perhitungan memakai level, tujuan bermain, kategori karakter, dan berat utama katalog. Prioritas karakter mendapat bobot terbesar. Angka ini adalah indeks aturan pencocokan. Hasil akhir tetap perlu dicoba dengan setup senar pilihan Anda.")}</p>
        <details><summary>{t("Lihat dasar perhitungan")}</summary>
          <p>{t("Bobot awal: prioritas 35, level 20, tantangan 15, gaya 12, berat 12, tujuan 8, dan respons 8. Jawaban tanpa preferensi melewati kriterianya. Hasil dinormalisasi ke 100. Data yang belum tersedia diberi nilai parsial 35%. Hasil memakai spesifikasi dan positioning produk. Skor review komunitas dan skor demo tidak masuk perhitungan.")}</p>
        </details>
      </details>
      <div className="match-result-footer">
        <button className="button dark" disabled={!selected.length} onClick={onCompare}>{t("Buka perbandingan (")}{t(selected.length)}) <ArrowRight size={16}/></button>
        <button className="text-button" onClick={()=>{setAnswers({priorities:[]});setFinished(false);setStep(0)}}><RotateCcw size={14}/>{t(" Mulai ulang")}</button>
      </div>
    </div>}
  </section>;
}
