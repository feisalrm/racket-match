import {authenticate} from '../../../modules/auth/local';
import {env} from 'cloudflare:workers';
import {identity,isAdmin,sameOrigin} from '../../../modules/auth/access';
import {json,readCatalog,publicEntry,type Row} from '../../../modules/community/server';
import {feedbackAreas, feedbackLimit} from '../../../modules/engagement/site-feedback';
export const dynamic='force-dynamic';
const prefix='engagement:';
const siteFeedbackPattern=prefix+'{"kind":"site-feedback"%';
export async function POST(request:Request){await authenticate(request,env.DB!);
 if(!sameOrigin(request))return json({error:'Asal permintaan ditolak.'},403);
 try{
 const raw=await request.text();if(raw.length>7000)return json({error:'Data terlalu panjang.'},413);
 const data=JSON.parse(raw);const user=identity(request);
 if(!['report','match-feedback','site-feedback','usage'].includes(data.kind))return json({error:'Jenis tidak valid.'},400);
 if(data.kind==='report'&&!user)return json({error:'Masuk untuk melaporkan review.'},401);
 const session=typeof data.session==='string'&&/^[a-f0-9-]{36}$/.test(data.session)?data.session:null;
 const actor=user?.id??session;if(!actor)return json({error:'Sesi tidak tersedia.'},400);
 const count=await env.DB!.prepare('SELECT COUNT(*) AS n FROM audit_log WHERE actor = ? AND action LIKE ? AND created_at > ?').bind(actor,prefix+'%',new Date(Date.now()-3600000).toISOString()).first<{n:number}>();
 if((count?.n??0)>=60)return json({error:'Batas pengiriman tercapai. Coba lagi nanti.'},429);
 let payload:Record<string,unknown>={kind:data.kind};
 if(data.kind==='report'){
 if(!['spam','inaccurate','abuse','other'].includes(data.reason)||typeof data.entryId!=='string')return json({error:'Pilih alasan laporan.'},400);
 const entry=await env.DB!.prepare('SELECT id,racket_id FROM community_entries WHERE id = ? AND status = ?').bind(data.entryId,'approved').first<{id:string;racket_id:string}>();if(!entry)return json({error:'Review tidak tersedia.'},404);
 payload={...payload,entryId:entry.id,racketId:entry.racket_id,reason:data.reason};
 }else if(data.kind==='match-feedback'){
 if(!['helpful','unsure','unhelpful'].includes(data.rating)||!Array.isArray(data.racketIds)||data.racketIds.length>3)return json({error:'Feedback tidak valid.'},400);
 const catalog=await readCatalog(env.DB!);if(data.racketIds.some((id:unknown)=>typeof id!=='string'||!catalog.rackets.some(r=>r.id===id&&r.status==='published')))return json({error:'Raket tidak valid.'},400);
 payload={...payload,rating:data.rating,racketIds:data.racketIds};
 }else if(data.kind==='site-feedback'){
 const comment=typeof data.comment==='string'?data.comment.trim():'';
 if(typeof data.area!=='string'||!Object.hasOwn(feedbackAreas,data.area)||!comment||comment.length>feedbackLimit)return json({error:'Pilih bagian situs dan isi masukan hingga 1.000 karakter.'},400);
 const recent=await env.DB!.prepare('SELECT COUNT(*) AS n FROM audit_log WHERE actor = ? AND action LIKE ? AND created_at > ?').bind(actor,siteFeedbackPattern,new Date(Date.now()-3600000).toISOString()).first<{n:number}>();
 if((recent?.n??0)>=5)return json({error:'Batas pengiriman tercapai. Coba lagi nanti.'},429);
 payload={...payload,area:data.area,comment};
 }else{
 if(!['catalog','compare','match-start','match-result','racket-detail','marketplace-click'].includes(data.event))return json({error:'Event tidak valid.'},400);
 payload={...payload,event:data.event};
 }
 await env.DB!.prepare('INSERT INTO audit_log (id,actor,action,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),actor,prefix+JSON.stringify(payload),new Date().toISOString()).run();
 return json({ok:true});
 }catch{return json({error:'Belum berhasil disimpan.'},400)}
}
export async function GET(request:Request){await authenticate(request,env.DB!);
 if(!isAdmin(request,env as unknown as {ADMIN_EMAIL?:string}))return json({error:'Akses admin diperlukan.'},403);
 try{const rows=(await env.DB!.prepare('SELECT id,action,created_at FROM audit_log WHERE action LIKE ? AND action NOT LIKE ? ORDER BY created_at DESC LIMIT 300').bind(prefix+'%',siteFeedbackPattern).all<{id:string;action:string;created_at:string}>()).results;
 const feedback=(await env.DB!.prepare('SELECT id,action,created_at FROM audit_log WHERE action LIKE ? ORDER BY created_at DESC LIMIT 300').bind(siteFeedbackPattern).all<{id:string;action:string;created_at:string}>()).results;
 const handled=(await env.DB!.prepare('SELECT action FROM audit_log WHERE action LIKE ?').bind('engagement-handled:%').all<{action:string}>()).results.map(r=>r.action.slice('engagement-handled:'.length));
 const events=[...rows,...feedback].map(r=>({id:r.id,createdAt:r.created_at,...JSON.parse(r.action.slice(prefix.length)),handled:handled.includes(r.id)}));
 const ids=[...new Set(events.filter(e=>e.kind==='report'&&typeof e.entryId==='string').map(e=>e.entryId))] as string[];
 const entries=ids.length?(await env.DB!.prepare('SELECT * FROM community_entries WHERE id IN ('+ids.map(()=>'?').join(',')+')').bind(...ids).all<Row>()).results:[];
 const catalog=await readCatalog(env.DB!);
 return json({events:events.map(e=>{const row=entries.find(r=>r.id===e.entryId);const racket=catalog.rackets.find(r=>r.id===e.racketId);return {...e,reportedEntry:row?publicEntry(row):null,racketName:racket?racket.brand+' '+racket.name:undefined}})});
 }catch{return json({error:'Data belum dapat dimuat.'},503)}
}
export async function PATCH(request:Request){await authenticate(request,env.DB!);if(!isAdmin(request,env as unknown as {ADMIN_EMAIL?:string})||!sameOrigin(request))return json({error:'Akses ditolak.'},403);
 try{const data=await request.json() as {id:string};if(typeof data.id!=='string'||data.id.length>100)return json({error:'ID tidak valid.'},400);
 const event=await env.DB!.prepare('SELECT id FROM audit_log WHERE id = ? AND action LIKE ?').bind(data.id,prefix+'%').first();if(!event)return json({error:'Laporan tidak tersedia.'},404);
 await env.DB!.prepare('INSERT INTO audit_log (id,actor,action,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),identity(request)!.id,'engagement-handled:'+data.id,new Date().toISOString()).run();return json({ok:true});}catch{return json({error:'Belum tersimpan.'},400)}}
