import type {Catalog} from '../catalog/types';
import {standardGuides} from '../ratings/rubric';

export const DEMO_PREFIX = 'demo:v1:';
export const DEMO_MARKER = 'community-demo-v2-seeded';

export async function ensureDemoReviews(db: D1Database, catalog: Catalog) {
  if(await db.prepare('SELECT id FROM audit_log WHERE id = ?').bind('organic-pilot-2026-11-04').first())return;
  const marker = await db.prepare('SELECT id FROM audit_log WHERE id = ?').bind(DEMO_MARKER).first();
  if (marker) return;
  const legacyMarker = await db.prepare('SELECT id FROM audit_log WHERE id = ?')
    .bind('community-demo-v1-seeded').first();
  const statements: D1PreparedStatement[] = [];
  const now = new Date().toISOString();
  const aspects = catalog.attributes.filter(attribute => attribute.active && standardGuides[attribute.id]);
  for (const racket of catalog.rackets.filter(item => item.status === 'published')) {
    let state = 2166136261;
    for (const character of racket.id) state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
    const random = (max: number) => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return Math.floor(state / 4294967296 * max);
    };
    const count = legacyMarker ? 9 : 5 + random(5);
    for (let index = 0; index < count; index++) {
      const ratings = Object.fromEntries(aspects.map(attribute => [attribute.id, 3 + random(8)]));
      const payload = {
        basis: 'playtest', rubricVersion: '1.0', title: 'Simulasi '+racket.name,
        body: 'DATA DEMO. Ulasan dan skor acak untuk mencoba katalog, diagram, dan pengelolaan review.',
        ratings, reasons: {}, reference: '', sourceUrl: '', stringSetup: '',
        tension: '', court: '', modifications: '', sessions: null, personalAttributes: []
      };
      if (legacyMarker) {
        statements.push(db.prepare(
          'UPDATE community_entries SET payload = ?, revision = revision + 1 WHERE id = ? AND author_id LIKE ?'
        ).bind(JSON.stringify(payload),DEMO_PREFIX+racket.id+':'+index,DEMO_PREFIX+'%'));
        continue;
      }
      statements.push(db.prepare(
        'INSERT OR IGNORE INTO community_entries (id,kind,racket_id,author_id,display_name,status,payload,revision,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,?,?)'
      ).bind(DEMO_PREFIX+racket.id+':'+index, 'review', racket.id,
        DEMO_PREFIX+'reviewer:'+index, 'Demo Pemain '+(index+1), 'approved',
        JSON.stringify(payload), now, now));
    }
  }
  statements.push(db.prepare('INSERT OR IGNORE INTO audit_log (id,actor,action,created_at) VALUES (?,?,?,?)')
    .bind(DEMO_MARKER, 'system:demo-setup', 'community.demo.seed:'+statements.length, now));
  // One atomic, idempotent seed. The marker survives withdrawing/deleting demo rows.
  await db.batch(statements);
}
