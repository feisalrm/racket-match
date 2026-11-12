'use client';

import {useEffect, useState} from 'react';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Download, Printer, RefreshCw} from 'lucide-react';
import {usePreferences} from '../preferences/Preferences';

const metrics = [
  ['active', 'Pengunjung terukur'],
  ['interactions', 'Interaksi tercatat'],
  ['catalog', 'Pembukaan katalog'],
  ['comparisons', 'Pembukaan perbandingan'],
  ['details', 'Pembukaan detail raket'],
  ['matchStarts', 'Mulai Find Your Match'],
  ['matchResults', 'Hasil Find Your Match'],
  ['shopClicks', 'Klik marketplace'],
  ['feedback', 'Masukan situs'],
] as const;

type Analytics = {
  from: string;
  to: string;
  generatedAt: string;
  totals: Record<typeof metrics[number][0], number>;
  trend: {day: string; active: number; interactions: number}[];
};

export default function AnalyticsAdmin() {
  const {t, locale} = usePreferences();
  const [days, setDays] = useState(30);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const number = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, {day:'numeric', month:'short', timeZone:'UTC'});
  const shortDate = (day: string) => date.format(new Date(day + 'T00:00:00Z'));

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    async function load() {
      try {
        const response = await fetch('/api/analytics?days=' + days, {signal: controller.signal});
        if (!response.ok) {
          const failure = await response.json() as {error?: string};
          throw new Error(failure.error || 'Data belum dapat dimuat.');
        }
        const result = await response.json() as Analytics;
        if (!controller.signal.aborted) setData(result);
      } catch (error) {
        if (!controller.signal.aborted) setError((error as Error).message);
      }
    }
    void load();
    return () => controller.abort();
  }, [days, refresh]);

  function exportCsv() {
    if (!data) return;
    const rows = [
      [t('Periode mulai'), data.from],
      [t('Periode berakhir'), data.to],
      [t('Waktu pengambilan data'), data.generatedAt],
      [],
      [t('Metrik'), t('Jumlah')],
      ...metrics.map(([key, label]) => [t(label), data.totals[key]]),
      [],
      [t('Tanggal (WIB)'), t('Pengunjung terukur'), t('Interaksi tercatat')],
      ...data.trend.map(row => [row.day, row.active, row.interactions]),
    ];
    const csv = rows.map(row => row.map(cell => '"' + String(cell).replaceAll('"', '""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], {type:'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'racketmatch-kpi-' + data.from + '-to-' + data.to + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className="kpi-report" aria-busy={!data&&!error}>
    <header className="kpi-heading">
    <div><h2>{t('KPI RacketMatch')}</h2>{data&&<p className="kpi-period">{data.from} – {data.to} (WIB)</p>}</div>
    <div className="kpi-controls">
      <label>{t('Periode')} <select value={days} onChange={event => {setData(null);setDays(Number(event.target.value));}}>
        {[7,30,90].map(value => <option key={value} value={value}>{number.format(value)} {t('hari terakhir')}</option>)}
      </select></label>
      <button className="button outline" type="button" onClick={() => {setData(null);setRefresh(value => value+1);}}><RefreshCw size={15}/>{t('Muat ulang')}</button>
      <button className="button outline" type="button" disabled={!data} onClick={exportCsv}><Download size={15}/>{t('Ekspor CSV')}</button>
      <button className="button outline" type="button" disabled={!data} onClick={() => window.print()}><Printer size={15}/>{t('Cetak / Simpan PDF')}</button>
    </div>
    </header>
    {error ? <p role="alert">{t(error)}</p> : !data ? <p role="status">{t('Memuat…')}</p> : <>
      <div className="kpi-metrics">{metrics.map(([key,label]) => <div key={key}><span>{t(label)}</span><strong>{number.format(data.totals[key])}</strong></div>)}</div>
      <p className="small muted">{t('Pengunjung terukur dihitung dari sesi browser atau akun yang memicu aktivitas. Satu orang dapat terhitung lebih dari sekali. Klik marketplace dihitung sejak pelacakan diaktifkan.')}</p>
      <section className="kpi-chart" aria-label={t('Tren harian')}>
        <h3>{t('Tren harian')}</h3>
        {data.totals.interactions === 0 ? <p className="muted">{t('Belum ada aktivitas pada periode ini.')}</p> :
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.trend} margin={{top:12,right:12,bottom:4,left:0}} accessibilityLayer>
              <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 4"/>
              <XAxis dataKey="day" tickFormatter={shortDate} tick={{fill:'var(--muted)',fontSize:11}} minTickGap={26} tickLine={false} axisLine={false}/>
              <YAxis allowDecimals={false} domain={[0,'auto']} width={42} tick={{fill:'var(--muted)',fontSize:11}} tickLine={false} axisLine={false}/>
              <Tooltip labelFormatter={day => shortDate(String(day))} formatter={value => number.format(Number(value))} contentStyle={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:10}}/>
              <Legend iconType="plainline"/>
              <Line dataKey="interactions" name={t('Interaksi tercatat')} stroke="var(--kpi-interactions)" strokeWidth={2.5} dot={false} isAnimationActive={false}/>
              <Line dataKey="active" name={t('Pengunjung terukur')} stroke="var(--kpi-visitors)" strokeWidth={2.5} strokeDasharray="5 4" dot={false} isAnimationActive={false}/>
            </LineChart>
          </ResponsiveContainer>}
      </section>
      <details className="kpi-data">
      <summary>{t('Lihat angka harian')}</summary>
      <table className="kpi-table">
        <thead><tr><th scope="col">{t('Tanggal (WIB)')}</th><th scope="col">{t('Pengunjung terukur')}</th><th scope="col">{t('Interaksi tercatat')}</th></tr></thead>
        <tbody>{data.trend.map(row => <tr key={row.day}>
          <th scope="row">{row.day}</th><td>{number.format(row.active)}</td>
          <td>{number.format(row.interactions)}</td>
        </tr>)}</tbody>
      </table>
      </details>
    </>}
  </section>;
}
