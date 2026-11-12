import {env} from 'cloudflare:workers';
import {authenticate} from '../../../modules/auth/local';
import {isAdmin} from '../../../modules/auth/access';
import {json} from '../../../modules/community/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const db = env.DB!;
  await authenticate(request, db);
  if (!isAdmin(request, env as unknown as {ADMIN_EMAIL?: string})) {
    return json({error: 'Akses admin diperlukan.'}, 403);
  }

  const days = Number(new URL(request.url).searchParams.get('days') ?? 30);
  if (![7, 30, 90].includes(days)) return json({error: 'Periode tidak valid.'}, 400);

  const now = new Date();
  const dayMs = 86_400_000;
  const jakartaOffset = 7 * 3_600_000;
  const today = Math.floor((now.getTime() + jakartaOffset) / dayMs) * dayMs;
  const firstDay = today - (days - 1) * dayMs;
  const start = new Date(firstDay - jakartaOffset).toISOString();
  const end = now.toISOString();
  const dateLabel = (value: number) => new Date(value).toISOString().slice(0, 10);

  try {
    const activity = db.prepare(`
      WITH activity AS (
        SELECT actor, created_at, json_extract(substr(action, 12), '$.event') AS event
        FROM audit_log
        WHERE created_at >= ? AND created_at <= ? AND action LIKE 'engagement:{"kind":"usage"%'
      )
      SELECT COUNT(DISTINCT actor) AS active,
        COUNT(*) AS interactions,
        COUNT(CASE WHEN event = 'catalog' THEN 1 END) AS catalog,
        COUNT(CASE WHEN event = 'compare' THEN 1 END) AS comparisons,
        COUNT(CASE WHEN event = 'racket-detail' THEN 1 END) AS details,
        COUNT(CASE WHEN event = 'match-start' THEN 1 END) AS matchStarts,
        COUNT(CASE WHEN event = 'match-result' THEN 1 END) AS matchResults,
        COUNT(CASE WHEN event = 'marketplace-click' THEN 1 END) AS shopClicks
      FROM activity
    `).bind(start, end);

    const daily = db.prepare(`
      SELECT date(created_at, '+7 hours') AS day,
        COUNT(DISTINCT actor) AS active, COUNT(*) AS interactions
      FROM audit_log
      WHERE created_at >= ? AND created_at <= ? AND action LIKE 'engagement:{"kind":"usage"%'
      GROUP BY day
    `).bind(start, end);

    const feedback = db.prepare(`
      SELECT COUNT(*) AS feedback
      FROM audit_log
      WHERE created_at >= ? AND created_at <= ? AND action LIKE 'engagement:{"kind":"site-feedback"%'
    `).bind(start, end);

    const [totalsResult, dailyResult, feedbackResult] = await db.batch<Record<string, string | number>>([activity, daily, feedback]);
    const recordedDays = new Map(dailyResult.results.map(row => [row.day, row]));
    const trend = Array.from({length: days}, (_, index) => {
      const day = dateLabel(firstDay + index * dayMs);
      const row = recordedDays.get(day);
      return {day, active: row?.active ?? 0, interactions: row?.interactions ?? 0};
    });
    return json({
      from: dateLabel(firstDay), to: dateLabel(today), generatedAt: end,
      totals: {...totalsResult.results[0], ...feedbackResult.results[0]}, trend,
    });
  } catch {
    return json({error: 'Data belum dapat dimuat.'}, 503);
  }
}
