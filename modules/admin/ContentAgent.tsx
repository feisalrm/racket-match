'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePreferences } from '../preferences/Preferences';

type Job = {
  id: string;
  topic: string;
  status: string;
  revision: number;
  draft: {
    posts: string[];
    editorNotes: string[];
    recommendations?: string[];
    review?: { passed: boolean; findings: string[] };
  } | null;
};

const labels: Record<string, [string, string]> = {
  recommending: ['Memilih topik', 'Recommending topics'],
  writing: ['Menulis draft', 'Writing draft'],
  checking: ['Diperiksa QA', 'In QA'],
  needs_review: ['Menunggu persetujuan', 'Awaiting approval'],
  qa_blocked: ['Perlu revisi QA', 'QA changes needed'],
  approved: ['Disetujui', 'Approved'],
  failed: ['Gagal', 'Failed'],
};

const active = new Set(['recommending', 'writing', 'checking']);

async function api(method = 'GET', data?: object) {
  const response = await fetch('/api/content-agent', {
    method,
    cache: 'no-store',
    ...(data && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  });
  const result = await response.json() as { error?: string; jobs: Job[]; configured: boolean };
  if (!response.ok) throw new Error(result.error);
  return result;
}

export default function ContentAgent() {
  const { locale } = usePreferences();
  const en = locale === 'en';
  const label = (id: string, english: string) => en ? english : id;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const refresh = useCallback(async () => {
    const result = await api();
    setJobs(result.jobs);
    setConfigured(result.configured);
  }, []);
  const polling = working || jobs.some(job => active.has(job.status));
  useEffect(() => {
    const load = () => refresh().catch(() => setError(en ? 'Could not load agent jobs.' : 'Daftar tugas agent gagal dimuat.'));
    void load();
    if (polling) {
      const timer = window.setInterval(load, 2500);
      return () => window.clearInterval(timer);
    }
  }, [en, polling, refresh]);

  async function run(method: string, data: object) {
    setWorking(true);
    setError('');
    try {
      await api(method, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : label('Tugas gagal.', 'Job failed.'));
    } finally {
      await refresh().catch(() => setError(label('Daftar tugas gagal dimuat.', 'Could not load jobs.')));
      setWorking(false);
    }
  }

  async function copy(job: Job) {
    try {
      await navigator.clipboard.writeText(job.draft!.posts.join('\n\n'));
      setCopied(job.id);
    } catch {
      setError(label('Clipboard gagal diakses. Salin teks dari draft.', 'Clipboard unavailable. Select and copy the draft.'));
    }
  }

  return <section className="editor">
    <h2>Racket Match HQ</h2>
    <p>{label('Content Agent memilih topik dan menulis draft. QA Agent memeriksa hasil sebelum kamu meninjaunya.', 'The Content Agent picks a topic and drafts a thread. The QA Agent checks it before your review.')}</p>
    {configured === false && <p className="notice">{label('OpenAI API belum dikonfigurasi di server.', 'The OpenAI API is not configured on the server.')}</p>}
    {error && <p role="alert">{error}</p>}
    <button type="button" className="button dark" disabled={!configured || polling} onClick={() => void run('POST', {})}>
      {polling ? label('Agent sedang bekerja…', 'Agents are working…') : label('Rekomendasikan topik & buat draft', 'Recommend topics & draft')}
    </button>
    {jobs.map(job => <article key={job.id} className="editor" style={{ marginTop: 16 }}>
      <p className="small muted" role="status">{labels[job.status]?.[en ? 1 : 0] ?? job.status}</p>
      {job.topic && <h3>{job.topic}</h3>}
      {job.draft && !active.has(job.status) && <>
        {!!job.draft.recommendations?.length && <details>
          <summary>{label('Rekomendasi topik', 'Topic recommendations')}</summary>
          <ol>{job.draft.recommendations.map(topic => <li key={topic}>{topic}</li>)}</ol>
        </details>}
        <ol>{job.draft.posts.map((post, index) => <li key={index} style={{ whiteSpace: 'pre-wrap', marginBlock: 8 }}>{post}</li>)}</ol>
        {!!job.draft.editorNotes.length && <details>
          <summary>{label('Catatan editor', 'Editorial notes')}</summary>
          <ul>{job.draft.editorNotes.map((note, index) => <li key={index}>{note}</li>)}</ul>
        </details>}
        {job.draft.review && <p><strong>QA · {job.draft.review.passed ? label('Lolos', 'Passed') : label('Perlu revisi', 'Changes needed')}</strong></p>}
        {!!job.draft.review?.findings.length && <ul>{job.draft.review.findings.map((finding, index) => <li key={index}>{finding}</li>)}</ul>}
      </>}
      {job.status === 'approved' && job.draft && <button type="button" className="button dark" onClick={() => void copy(job)}>
        {copied === job.id ? label('Disalin', 'Copied') : label('Salin untuk Threads', 'Copy for Threads')}
      </button>}
      {['needs_review', 'qa_blocked', 'failed'].includes(job.status) && <>
        <label style={{ display: 'block', marginBlock: 12 }}>
          {label('Catatan revisi (opsional)', 'Revision notes (optional)')}
          <textarea rows={2} maxLength={2000} value={notes[job.id] ?? ''} onChange={event => {
            const value = event.target.value;
            setNotes(current => ({ ...current, [job.id]: value }));
          }} />
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {job.status === 'needs_review' && job.draft?.review?.passed && <button type="button" className="button dark" disabled={working}
            onClick={() => void run('PATCH', { id: job.id, revision: job.revision, action: 'approve' })}>{label('Setujui', 'Approve')}</button>}
          <button type="button" className="button" disabled={!configured || polling}
            onClick={() => void run('PATCH', { id: job.id, revision: job.revision, action: 'revise', feedback: notes[job.id] ?? '' })}>
            {job.status === 'failed' ? label('Coba lagi', 'Retry') : label('Minta revisi', 'Request revision')}
          </button>
        </div>
      </>}
    </article>)}
  </section>;
}
