import {authenticate,profile} from '../../../modules/auth/local';
import {standardGuides} from '../../../modules/ratings/rubric';
import {env} from 'cloudflare:workers';
import {identity,isAdmin,sameOrigin} from '../../../modules/auth/access';
import {readCatalog,publicEntry,json,type Row} from '../../../modules/community/server';
import {submissionSchema,reviewSchema,commentSchema} from '../../../modules/community/validation';
import {aggregateReviews} from '../../../modules/community/aggregate';
export const dynamic='force-dynamic';
const config=()=>env as unknown as {ADMIN_EMAIL?:string};
export async function GET(request:Request){await authenticate(request,env.DB!);try{
 const racketId=new URL(request.url).searchParams.get('racket');if(!racketId)return json({error:'Pilih raket.'},400);
 const catalog=await readCatalog(env.DB!);if(!catalog.rackets.some(r=>r.id===racketId&&r.status==='published'))return json({error:'Raket tidak tersedia.'},404);
 const user=identity(request);const rows=(await env.DB!.prepare('SELECT * FROM community_entries WHERE racket_id = ? AND (status = ? OR author_id = ?) ORDER BY created_at DESC').bind(racketId,'approved',user?.id??'').all<Row>()).results;
 const publicRows=rows.filter(r=>r.status==='approved');const entries=publicRows.map(publicEntry);const aspects=catalog.attributes.filter(a=>a.active&&standardGuides[a.id]).map(a=>a.id);
 return json({reviews:entries.filter(e=>e.kind==='review'),comments:entries.filter(e=>e.kind==='comment'),ownEntries:rows.filter(r=>r.author_id===user?.id).map(publicEntry),profile:profile(request)?{username:profile(request)!.username,displayName:profile(request)!.displayName}:null,signedIn:!!user,isAdmin:isAdmin(request,config()),aggregate:aggregateReviews(entries,aspects)});
 }catch{return json({error:'Komunitas belum dapat dimuat.'},503)}}
export async function POST(request:Request){await authenticate(request,env.DB!);const user=identity(request);if(!user)return json({error:'Masuk untuk menulis.'},401);if(!sameOrigin(request))return json({error:'Asal permintaan tidak diizinkan.'},403);
 try{const raw=await request.text();if(raw.length>40000)return json({error:'Konten terlalu panjang.'},413);const parsed=submissionSchema.safeParse(JSON.parse(raw));if(!parsed.success)return json({error:'Lengkapi identitas tampilan dan isi kontribusi.'},400);
 const {racketId,displayName,kind,payload}=parsed.data;const catalog=await readCatalog(env.DB!);if(!catalog.rackets.some(r=>r.id===racketId&&r.status==='published'))return json({error:'Raket tidak tersedia.'},404);
 const checked=kind==='review'?reviewSchema.safeParse(payload):commentSchema.safeParse(payload);if(!checked.success)return json({error:checked.error.issues[0].message},400);
 if(kind==='review'){const review=checked.data as import('../../../modules/community/types').Review;const allowed=new Set(catalog.attributes.filter(a=>a.active&&standardGuides[a.id]).map(a=>a.id));if(Object.keys(review.ratings).some(k=>!allowed.has(k)))return json({error:'Atribut standar tidak dikenal.'},400);}
 const now=new Date().toISOString();const recent=await env.DB!.prepare('SELECT COUNT(*) AS n FROM community_entries WHERE author_id = ? AND created_at > ?').bind(user.id,new Date(Date.now()-3600000).toISOString()).first<{n:number}>();if((recent?.n??0)>=10)return json({error:'Batas 10 kontribusi per jam tercapai. Coba lagi nanti.'},429);
 if(kind==='review'){const existing=await env.DB!.prepare('SELECT id FROM community_entries WHERE author_id = ? AND racket_id = ? AND kind = ? AND status != ?').bind(user.id,racketId,'review','rejected').first();if(existing)return json({error:'Anda sudah memiliki review untuk raket ini. Gunakan tombol Edit review pada kontribusi Anda untuk memperbaruinya.'},409);}
 await env.DB!.prepare('INSERT INTO community_entries (id,kind,racket_id,author_id,display_name,status,payload,revision,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,?,?)').bind(crypto.randomUUID(),kind,racketId,user.id,profile(request)?.displayName??displayName,'approved',JSON.stringify(checked.data),now,now).run();return json({ok:true,message:'Kontribusi berhasil diterbitkan.'},201);
 }catch{return json({error:'Kontribusi belum tersimpan. Periksa data dan coba lagi.'},400)}}
export async function DELETE(request:Request){await authenticate(request,env.DB!);const user=identity(request);if(!user)return json({error:'Masuk untuk mengelola kontribusi.'},401);if(!sameOrigin(request))return json({error:'Asal permintaan ditolak.'},403);
 try{const {id}=await request.json() as {id:string};const row=await env.DB!.prepare('SELECT * FROM community_entries WHERE id = ?').bind(id).first<Row>();if(!row)return json({error:'Kontribusi tidak ditemukan.'},404);if(row.author_id!==user.id&&!isAdmin(request,config()))return json({error:'Anda tidak memiliki akses.'},403);
 // Withdraw from public display without permanently deleting content.
 await env.DB!.prepare('UPDATE community_entries SET status = ?, updated_at = ?, revision = revision + 1 WHERE id = ?').bind('rejected',new Date().toISOString(),id).run();return json({ok:true});
 }catch{return json({error:'Gagal menarik kontribusi.'},400)}}


export async function PATCH(request: Request) {await authenticate(request,env.DB!);
  const user = identity(request);
  if (!user) return json({error: 'Masuk untuk mengedit review.'}, 401);
  if (!sameOrigin(request)) return json({error: 'Asal permintaan ditolak.'}, 403);
  try {
    const raw = await request.text();
    if (raw.length > 40000) return json({error: 'Konten terlalu panjang.'}, 413);
    const data = JSON.parse(raw);
    if (typeof data.id !== 'string' || !Number.isInteger(data.revision)) {
      return json({error: 'Identitas atau versi review tidak valid.'}, 400);
    }
    const row = await env.DB!.prepare('SELECT * FROM community_entries WHERE id = ?')
      .bind(data.id).first<Row>();
    if (!row) return json({error: 'Review tidak ditemukan.'}, 404);
    if (row.author_id !== user.id) return json({error: 'Anda hanya dapat mengedit review sendiri.'}, 403);
    if (row.kind !== 'review' || row.status === 'rejected') {
      return json({error: 'Review yang ditarik tidak dapat diedit.'}, 409);
    }
    const parsed = submissionSchema.safeParse({
      racketId: row.racket_id, displayName: data.displayName, kind: 'review', payload: data.payload
    });
    if (!parsed.success) return json({error: 'Lengkapi nama publik dan isi review.'}, 400);
    const checked = reviewSchema.safeParse(parsed.data.payload);
    if (!checked.success) return json({error: checked.error.issues[0].message}, 400);
    const catalog = await readCatalog(env.DB!);
    if (!catalog.rackets.some(r => r.id === row.racket_id && r.status === 'published')) {
      return json({error: 'Raket tidak tersedia.'}, 404);
    }
    const allowed = new Set(catalog.attributes.filter(a => a.active && standardGuides[a.id]).map(a => a.id));
    if (Object.keys(checked.data.ratings).some(id => !allowed.has(id))) {
      return json({error: 'Atribut standar tidak dikenal.'}, 400);
    }
    const result = await env.DB!.prepare(
      'UPDATE community_entries SET display_name = ?, payload = ?, status = ?, updated_at = ?, revision = revision + 1 WHERE id = ? AND author_id = ? AND revision = ? AND status IN (?,?)'
    ).bind(profile(request)?.displayName??parsed.data.displayName, JSON.stringify(checked.data), 'approved',
      new Date().toISOString(), row.id, user.id, data.revision, 'approved', 'pending').run();
    if (!result.meta.changes) {
      return json({error: 'Review sudah berubah. Muat ulang kontribusi sebelum mengedit.'}, 409);
    }
    return json({ok: true, message: 'Perubahan review berhasil diterbitkan.'});
  } catch {
    return json({error: 'Perubahan belum tersimpan. Periksa data dan coba lagi.'}, 400);
  }
}
