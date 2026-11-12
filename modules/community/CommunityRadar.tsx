
import {usePreferences} from "../preferences/Preferences";
import {useId, useState} from 'react';
import type {Attribute} from '../catalog/types';
import type {Aggregate} from './types';

type RadarProps = {attributes: Attribute[]} & (
  {aggregate: Aggregate; editorialScores?: never} |
  {aggregate?: never; editorialScores: Record<string, number | null>}
);

export default function CommunityRadar({attributes, aggregate, editorialScores}: RadarProps) {
  const {t}=usePreferences();
  const editorial = editorialScores !== undefined;
  const scores: Record<string,{mean:number;count?:number}> = aggregate?.aspects ??
    Object.fromEntries(Object.entries(editorialScores ?? {}).flatMap(([id, score]) =>
      score == null ? [] : [[id,{mean:score}]]));
  const labelScore = (score?:{mean:number;count?:number}) =>
    score ? editorial ? t(score.mean) : t(score.mean.toFixed(1) + ' · n=' + score.count) : t('—');

  const [visible, setVisible] = useState(false);
  const chartId = useId();
  const center = 220;
  const radius = 133;
  const point = (index: number, value: number) => {
    const angle = index * 2 * Math.PI / attributes.length - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius * value / 10,
      y: center + Math.sin(angle) * radius * value / 10
    };
  };
  const polygon = (value: number) => attributes.map((_, index) => {
    const {x, y} = point(index, value);
    return x + ',' + y;
  }).join(' ');
  const rated=attributes.flatMap(a=>scores[a.id]?[scores[a.id].mean]:[]);
  const peak=rated.length?Math.max(...rated):-1;
  const prominent=(mean:number)=>mean===peak;
  const allRated = attributes.every(attribute => scores[attribute.id]);
  return <section className="community-radar">
    {editorial ? <h3>{t("Radar karakter · Editorial")}</h3> : <button type="button" className="button outline" aria-expanded={visible}
      aria-controls={chartId} onClick={() => setVisible(!visible)}>
      {t(visible ? 'Tutup diagram radar' : 'Lihat diagram radar')}
    </button>}
    {(editorial || visible) && <div id={chartId}>
      {(aggregate?.demoReviewerCount??0)>0&&<p className="demo-notice">{t("Termasuk ")}{t(aggregate?.demoReviewerCount)}{t(" review simulasi. Skor demo dibuat acak.")}</p>}{!editorial&&<p className="small muted">{t("Rata-rata per aspek · Skala 1–10 · n = jumlah penilai aspek. Titik muncul saat aspek memiliki penilaian. Area penuh muncul setelah semua aspek dinilai.")}</p>}
      {attributes.length >= 3 && (editorial ? rated.length > 0 : (aggregate?.reviewerCount ?? 0) > 0) ?
        <svg className="radar-svg" viewBox="0 0 440 440" role="img"
          aria-label={t(editorial ? "Radar karakter · Editorial" : "Diagram radar rata-rata karakter raket berdasarkan review uji main yang terbit")}>
          {[2,4,6,8,10].map(value => <g key={value}>
            <polygon points={polygon(value)} fill="none" stroke="#dce4d5"/>
            <text x={center + 5} y={center - radius * value / 10 + 13}
              fontSize="9" fill="#718069">{t(value)}</text>
          </g>)}
          {attributes.map((attribute, index) => {
            const edge = point(index, 10);
            const label = point(index, 12.3);
            const score = scores[attribute.id];
            const nextScore = scores[attributes[(index + 1) % attributes.length].id];
            const dot = point(index, score?.mean ?? 0);
            const next = point((index + 1) % attributes.length, nextScore?.mean ?? 0);
            return <g key={attribute.id}>
              <line x1={center} y1={center} x2={edge.x} y2={edge.y} stroke="#dce4d5"/>
              {score && nextScore && <line x1={dot.x} y1={dot.y} x2={next.x} y2={next.y}
                stroke="#356744" strokeWidth="2"/>}
              <text x={label.x} y={label.y - 3} textAnchor="middle" fontSize="11" fontWeight={score&&prominent(score.mean)?700:400} fill={score&&prominent(score.mean)?'#9a662f':'#20362c'}>
                <tspan x={label.x}>{t(attribute.name)}</tspan>
                <tspan x={label.x} dy="15" fontSize="10" fill={score&&prominent(score.mean)?'#9a662f':'#617457'}>
                  {labelScore(score)}
                </tspan>
              </text>
            </g>;
          })}
          {allRated && <polygon points={attributes.map((attribute, index) => {
            const dot = point(index, scores[attribute.id].mean);
            return dot.x + ',' + dot.y;
          }).join(' ')} fill="#a5c967" fillOpacity=".22" stroke="#356744" strokeWidth="2"/>}
          {attributes.map((attribute, index) => {
            const score = scores[attribute.id];
            if (!score) return null;
            const dot = point(index, score.mean);
            return <circle key={attribute.id} cx={dot.x} cy={dot.y} r={prominent(score.mean)?6:4}
              fill={prominent(score.mean)?'#cf9451':'#244b35'} stroke="#fff" strokeWidth="1">
              <title>{(prominent(score.mean)?'Aspek tertinggi: ':'') + attribute.name + ' ' + score.mean + '/10' + (editorial ? '' : ', ' + score.count + ' penilai')}</title>
            </circle>;
          })}
        </svg> : <p className="notice">{t("Diagram akan tampil setelah ada review uji main yang terbit.")}</p>}
      {!editorial&&rated.length>0&&<p className="radar-peak"><span aria-hidden="true">◆</span>{t(" Aspek tertinggi: ")}{t(attributes.filter(a=>scores[a.id]?.mean===peak).map(a=>a.name).join(', '))} · {t(peak.toFixed(1))}/10</p>}
      {!editorial&&<table className="radar-values"><caption>{t("Nilai diagram radar")}</caption>
        <thead><tr><th>{t("Aspek")}</th><th>{t("Rata-rata /10")}</th><th>{t("Penilai")}</th></tr></thead>
        <tbody>{attributes.map(attribute => {
          const score = scores[attribute.id];
          return <tr key={attribute.id}><th scope="row">{t(attribute.name)}</th>
            <td>{t(score?.mean.toFixed(1) ?? '—')}</td><td>{t(score?.count ?? 0)}</td></tr>;
        })}</tbody>
      </table>}
    </div>}
  </section>;
}
