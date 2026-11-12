import {authenticate} from '../../../modules/auth/local';
import {organicCatalog,prepareOrganicPilot} from '../../../modules/community/organic-pilot';
import {aggregateReviews} from '../../../modules/community/aggregate';
import {publicEntry,type Row} from '../../../modules/community/server';
import {standardGuides} from '../../../modules/ratings/rubric';
import {isAdmin,identity} from '../../../modules/auth/access';
import {prepareRatingSnapshots,newAssessmentError} from '../../../modules/ratings/rubric';
import { env } from 'cloudflare:workers';
import { seed } from '../../../modules/catalog/seed';
import { upgradeCatalog } from '../../../modules/catalog/upgrade';
import { catalogSchema } from '../../../modules/catalog/validation';
import { decodeCatalog, encodeCatalog } from '../../../modules/catalog/storage';
export const dynamic='force-dynamic';
const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){await authenticate(request,env.DB!);
 try {const row=await env.DB!.prepare('SELECT payload, revision FROM catalog_state WHERE id = ?').bind('main').first<{payload:string;revision:number}>();
 const admin=isAdmin(request,env as unknown as {ADMIN_EMAIL?:string});const catalog=organicCatalog(row?upgradeCatalog(await decodeCatalog(row.payload)):upgradeCatalog(seed));
 await prepareOrganicPilot(env.DB!);
 const published=catalog.rackets.filter((r: import('../../../modules/catalog/types').Racket)=>r.status==='published');
 const reviewRows=(await env.DB!.prepare('SELECT * FROM community_entries WHERE kind = ? AND status = ?')
   .bind('review','approved').all<Row>()).results;
 const aspectIds=catalog.attributes.filter((a: import('../../../modules/catalog/types').Attribute)=>a.active&&standardGuides[a.id]).map((a: import('../../../modules/catalog/types').Attribute)=>a.id);
 const communityAggregates=Object.fromEntries(published.map((r: import('../../../modules/catalog/types').Racket)=>[
   r.id,aggregateReviews(reviewRows.filter(row=>row.racket_id===r.id).map(publicEntry),aspectIds)
 ]));
 return response({communityAggregates,catalog:admin?catalog:{...catalog,rackets:catalog.rackets.filter(r=>r.status==='published')},revision:row?.revision??0,canEdit:admin,signedIn:!!identity(request)});
 }catch{ return response({error:'Penyimpanan belum tersedia. Coba muat ulang.'},503); }
}
// The HTTP request carries the full editable JSON, including assessment snapshots.
const maxCatalogRequestBytes=8_000_000;
const catalogEncoder=new TextEncoder();
const catalogTooLarge=()=>response({error:'Ukuran katalog melebihi batas penyimpanan.'},413);

export async function PUT(request:Request){await authenticate(request,env.DB!);
 const actor=identity(request)?.id;
 // Catalog mutation remains admin-only even when the audience becomes public.
 if(!actor)return response({error:'Masuk dengan akun pemilik untuk mengelola katalog.'},401);
 if(!isAdmin(request,env as unknown as {ADMIN_EMAIL?:string}))return response({error:'Hanya administrator dapat mengubah katalog.'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin)return response({error:'Asal permintaan tidak diizinkan.'},403);
 try{
 const raw=await request.text();
 if(raw.length>maxCatalogRequestBytes||catalogEncoder.encode(raw).byteLength>maxCatalogRequestBytes)return catalogTooLarge();
 const input=JSON.parse(raw);const parsed=catalogSchema.safeParse(input.catalog);
 if(!parsed.success)return response({error:'Data belum valid: '+parsed.error.issues[0].message},400);
 if(!Number.isInteger(input.revision)||input.revision<0)return response({error:'Versi katalog tidak valid. Muat ulang halaman.'},400);
 const previousRow=await env.DB!.prepare('SELECT payload, revision FROM catalog_state WHERE id = ?').bind('main').first<{payload:string;revision:number}>();
 const previous=previousRow?upgradeCatalog(await decodeCatalog(previousRow.payload)):upgradeCatalog(seed);
 const readiness=newAssessmentError(parsed.data,previous);if(readiness)return response({error:readiness},400);
 const normalized=prepareRatingSnapshots(parsed.data,previous);
 const payload=await encodeCatalog(normalized);
 if(payload===null)return catalogTooLarge();
 const now=new Date().toISOString();
 const result=await env.DB!.prepare('INSERT INTO catalog_state (id,payload,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, revision=catalog_state.revision+1, updated_at=excluded.updated_at WHERE catalog_state.revision=?').bind('main',payload,now,input.revision).run();
 if(!result.meta.changes)return response({error:'Katalog telah berubah di sesi lain. Muat ulang sebelum menyimpan.'},409);
 await env.DB!.prepare('INSERT INTO audit_log (id,actor,action,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),actor,'catalog.save',now).run();
 return response({revision:input.revision+1,catalog:normalized});
 }catch{return response({error:'Gagal menyimpan katalog. Coba lagi.'},500);}
}
