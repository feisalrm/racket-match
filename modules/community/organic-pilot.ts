import type {Catalog} from '../catalog/types';
export const PILOT_MARKER='organic-pilot-2026-11-04';
// Retire simulated catalogue entries while retaining owner edits and their history.
export function organicCatalog(catalog:Catalog):Catalog{return {...catalog,rackets:catalog.rackets.map(r=>r.basis==='demo'?{...r,status:'archived' as const}:r)}}
// Explicit release transition: withdraw only generated demo authors, never real contributors.
export async function prepareOrganicPilot(db:D1Database){
 if(await db.prepare('SELECT id FROM audit_log WHERE id = ?').bind(PILOT_MARKER).first())return;
 const now=new Date().toISOString();
 await db.batch([
 db.prepare("UPDATE community_entries SET status = 'rejected', revision = revision + 1, updated_at = ? WHERE author_id LIKE ? AND status != 'rejected'").bind(now,'demo:v1:%'),
 db.prepare('INSERT OR IGNORE INTO audit_log (id,actor,action,created_at) VALUES (?,?,?,?)').bind(PILOT_MARKER,'release','Generated demo reviews withdrawn; organic contributions retained.',now)
 ]);
}
