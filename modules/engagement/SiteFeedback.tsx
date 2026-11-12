'use client';

import {useRef, useState, type FormEvent} from 'react';
import {MessageCircle, Send, X} from 'lucide-react';
import {usePreferences} from '../preferences/Preferences';
import {sendEvent} from './client';
import {feedbackAreas, feedbackLimit} from './site-feedback';

export default function SiteFeedback({hidden}: {hidden: boolean}) {
  const {t} = usePreferences();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [length, setLength] = useState(0);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await sendEvent({kind: 'site-feedback', area: fields.get('area'), comment: fields.get('comment')});
      setSent(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button className="back-to-top feedback-fab" type="button" hidden={hidden} aria-label={t('Beri masukan')} title={t('Beri masukan')} onClick={() => dialog.current?.showModal()}><MessageCircle size={20}/></button>
    <dialog className="site-feedback" ref={dialog} aria-labelledby="site-feedback-title">
      <div className="site-feedback-heading">
        <h2 id="site-feedback-title"><MessageCircle size={20}/>{t('Beri masukan')}</h2>
        <button className="icon-button" type="button" aria-label={t('Tutup')} onClick={() => dialog.current?.close()}><X size={20}/></button>
      </div>
    {sent ? <p role="status">{t('Terima kasih, masukan Anda sudah terkirim.')}</p> :
      <form onSubmit={submit}>
        <p className="muted">{t('Ceritakan apa yang perlu diperbaiki. Tanpa login.')}</p>
        <label>{t('Bagian situs')}
          <select name="area" defaultValue="" required>
            <option value="" disabled>{t('Pilih bagian situs')}</option>
            {Object.entries(feedbackAreas).map(([id, label]) => <option key={id} value={id}>{t(label)}</option>)}
          </select>
        </label>
        <label>{t('Apa yang perlu diperbaiki?')}
          <textarea name="comment" rows={4} onChange={event=>setLength(event.target.value.length)} required maxLength={feedbackLimit} placeholder={t('Contoh: Saya ingin membandingkan berat raket setelah dipasang senar.')}/>
          <small className="feedback-length muted">{length} / {feedbackLimit}</small>
        </label>
        {error && <p role="alert">{t(error)}</p>}
        <button className="button dark" disabled={busy} type="submit"><Send size={15}/>{t(busy ? 'Mengirim…' : 'Kirim masukan')}</button>
      </form>}
    </dialog>
  </>;
}
