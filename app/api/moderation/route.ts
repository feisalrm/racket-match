import {authenticate,profile} from '../../../modules/auth/local';
import {env} from 'cloudflare:workers';
import {identity,isAdmin,sameOrigin} from '../../../modules/auth/access';
import {json,publicEntry,readCatalog,type Row} from '../../../modules/community/server';
import {DEMO_PREFIX} from '../../../modules/community/demo';

export const dynamic='force-dynamic';
const config=()=>env as unknown as {ADMIN_EMAIL?:string};

function scope(filters: URLSearchParams) {
  const clauses: string[] = [];
  const values: string[] = [];
  const racket = filters.get('racket');
  if (racket) { clauses.push('racket_id = ?'); values.push(racket); }
  const status = filters.get('status');
  if(status&&!['pending','approved','rejected'].includes(status))throw new Error('Invalid status');
  if (status && ['pending','approved','rejected'].includes(status)) {
    clauses.push('status = ?'); values.push(status);
  }
  const kind = filters.get('kind');
  if(kind&&!['review','comment'].includes(kind))throw new Error('Invalid kind');
  if (kind && ['review','comment'].includes(kind)) {
    clauses.push('kind = ?'); values.push(kind);
  }
  const demo = filters.get('demo');
  if(demo&&!['only','exclude'].includes(demo))throw new Error('Invalid demo filter');
  if (demo === 'only' || demo === 'exclude') {
    clauses.push(demo === 'only' ? 'author_id LIKE ?' : 'author_id NOT LIKE ?');
    values.push(DEMO_PREFIX+'%');
  }
  return {sql: clauses.length ? ' WHERE '+clauses.join(' AND ') : '', values};
}

export async function GET(request: Request) {await authenticate(request,env.DB!);
  if (!isAdmin(request,config())) return json({error:'Hanya administrator.'},403);
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(0, Math.min(100000, Number(params.get('page')) || 0));
    const filter = scope(params);
    const count = await env.DB!.prepare('SELECT COUNT(*) AS n FROM community_entries'+filter.sql)
      .bind(...filter.values).first<{n:number}>();
    const rows = (await env.DB!.prepare('SELECT * FROM community_entries'+filter.sql+
      ' ORDER BY created_at DESC, id ASC LIMIT 50 OFFSET ?')
      .bind(...filter.values,Math.floor(page)*50).all<Row>()).results;
    const catalog = await readCatalog(env.DB!);
    return json({entries:rows.map(publicEntry),total:count?.n??0,page:Math.floor(page),
      rackets:catalog.rackets.map(r=>({id:r.id,name:r.name,brand:r.brand}))});
  } catch { return json({error:'Pengelolaan review belum tersedia.'},503); }
}

export async function PATCH(request:Request) {await authenticate(request,env.DB!);
  if (!isAdmin(request,config())) return json({error:'Hanya administrator.'},403);
  if (!sameOrigin(request)) return json({error:'Asal permintaan ditolak.'},403);
  try {
    const data = await request.json() as {id:string;status:string;revision:number};
    if (data.status!=='rejected'||!Number.isInteger(data.revision)) return json({error:'Aksi tidak valid.'},400);
    const now=new Date().toISOString();
    const result=await env.DB!.prepare('UPDATE community_entries SET status = ?, updated_at = ?, revision = revision + 1 WHERE id = ? AND revision = ? AND status IN (?,?)')
      .bind(data.status,now,data.id,data.revision,'pending','approved').run();
    if (!result.meta.changes) return json({error:'Kontribusi sudah berubah. Muat ulang daftar.'},409);
    await env.DB!.prepare('INSERT INTO audit_log (id,actor,action,created_at) VALUES (?,?,?,?)')
      .bind(crypto.randomUUID(),identity(request)!.id,'community.rejected:'+data.id,now).run();
    return json({ok:true});
  } catch { return json({error:'Gagal menarik kontribusi.'},500); }
}

export async function POST(request: Request) {await authenticate(request,env.DB!);
  if (!isAdmin(request,config())) return json({error:'Hanya administrator.'},403);
  if (!sameOrigin(request)) return json({error:'Asal permintaan ditolak.'},403);
  try {
    const data = await request.json() as {action:string;filters?:Record<string,string>;id?:string;ids?:string[];confirm?:string};
    if (!['withdraw','delete'].includes(data.action) || data.confirm!=='APPLY') {
      return json({error:'Konfirmasi tindakan diperlukan.'},400);
    }
    if (data.ids !== undefined && (
      !Array.isArray(data.ids) || data.ids.length === 0 || data.ids.length > 50 ||
      data.ids.some(id => typeof id !== 'string' || !id || id.length > 200) || data.id
    )) return json({error:'Pilih 1–50 kontribusi yang valid.'},400);
    const filter = scope(new URLSearchParams(data.filters??{}));
    let sql = filter.sql;
    const values = [...filter.values];
    if (data.id) { sql += sql ? ' AND id = ?' : ' WHERE id = ?'; values.push(data.id); }
    if (data.ids) {
      const ids = [...new Set(data.ids)];
      sql += (sql ? ' AND ' : ' WHERE ')+'id IN ('+ids.map(()=>'?').join(',')+')';
      values.push(...ids);
    }
    const now = new Date().toISOString();
    const statement = data.action==='delete'
      ? env.DB!.prepare('DELETE FROM community_entries'+sql).bind(...values)
      : env.DB!.prepare('UPDATE community_entries SET status = ?, updated_at = ?, revision = revision + 1'+sql)
        .bind('rejected',now,...values);
    const results = await env.DB!.batch([statement,
      env.DB!.prepare('INSERT INTO audit_log (id,actor,action,created_at) VALUES (?,?,?,?)')
        .bind(crypto.randomUUID(),identity(request)!.id,
          'community.bulk.'+data.action+':'+JSON.stringify({filters:data.filters,id:data.id,ids:data.ids}),now)]);
    return json({ok:true,affected:results[0].meta.changes??0});
  } catch { return json({error:'Tindakan gagal. Muat ulang daftar dan coba lagi.'},500); }
}
