import {ensureAdminAccount,type AdminConfig} from '../../../modules/auth/admin-bootstrap';
import {env} from 'cloudflare:workers';
import {authenticate,profile,phoneNumber,passwordHash,equalHash,publicProfile,randomToken,sessionCookie,cookieToken,digest,createSession,rateLimit,type UserRow} from '../../../modules/auth/local';
import {identity,isAdmin,sameOrigin} from '../../../modules/auth/access';
import {json} from '../../../modules/community/server';
export const dynamic='force-dynamic';
export async function GET(request:Request){await ensureAdminAccount(env.DB!,env as unknown as AdminConfig);await authenticate(request,env.DB!);return json({profile:profile(request),signedIn:!!identity(request),isAdmin:isAdmin(request,env as unknown as {ADMIN_EMAIL?:string})})}
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Asal permintaan ditolak.'},403);
 try{const raw=await request.text();if(raw.length>8000)return json({error:'Data terlalu panjang.'},413);const d=JSON.parse(raw);
 if(!['signup','login'].includes(d.action)||typeof d.password!=='string'||d.password.length>128)return json({error:'Data tidak valid.'},400);
 const db=env.DB!;await ensureAdminAccount(db,env as unknown as AdminConfig);
 const ip=request.headers.get('cf-connecting-ip')??'unknown';
 if(!await rateLimit(db,'ip:'+ip,40))return json({error:'Terlalu banyak percobaan. Tunggu 15 menit.'},429);
 if(d.action==='signup'){
 const username=typeof d.username==='string'?d.username.trim().toLowerCase():'';const displayName=typeof d.displayName==='string'?d.displayName.trim():'';const email=typeof d.email==='string'&&d.email.trim()?d.email.trim().toLowerCase():null;const phone=typeof d.phone==='string'&&d.phone.trim()?phoneNumber(d.phone):null;
 if(['admin','administrator','racketmatch','support'].includes(username)||!/^[a-z][a-z0-9_]{2,29}$/.test(username)||displayName.length<2||displayName.length>60||(!email&&!phone)||email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>200)||phone&&!/^[1-9][0-9]{7,14}$/.test(phone))return json({error:'Isi username 3–30 karakter, nama tampilan, serta email atau nomor HP yang valid.'},400);
 if(email&&(env as unknown as AdminConfig).ADMIN_EMAIL?.trim().toLowerCase()===email)return json({error:'Email ini khusus akun admin yang sudah disediakan. Silakan masuk.'},409);
 if(d.password.length<12)return json({error:'Gunakan password minimal 12 karakter.'},400);
 if(!await rateLimit(db,'signup:'+ip,5))return json({error:'Batas pendaftaran tercapai. Tunggu 15 menit.'},429);
 const id=crypto.randomUUID(),salt=randomToken(),hash=await passwordHash(d.password,salt);
 try{await db.prepare('INSERT INTO local_users (id,username,display_name,email,phone,password_hash,password_salt,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,username,displayName,email,phone,hash,salt,new Date().toISOString()).run()}catch{return json({error:'Username atau kontak sudah digunakan. Gunakan akun lain atau masuk.'},409)}
 const token=await createSession(db,id);return new Response(JSON.stringify({ok:true,profile:{username,displayName}}),{status:201,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':sessionCookie(token)}});
 }
 const identifier=typeof d.identifier==='string'?d.identifier.trim().toLowerCase():'';
 if(!identifier||identifier.length>200)return json({error:'Isi email, nomor HP, atau username.'},400);
 if(!await rateLimit(db,'login:'+identifier,10))return json({error:'Terlalu banyak percobaan. Tunggu 15 menit.'},429);
 const phone=phoneNumber(identifier);
 const row=await db.prepare('SELECT * FROM local_users WHERE email = ? OR phone = ? OR username = ? LIMIT 1').bind(identifier,phone,identifier).first<UserRow>();
 const hash=await passwordHash(d.password,row?.password_salt??'missing-account-dummy-salt');
 if(!row||!equalHash(hash,row.password_hash))return json({error:'Identitas atau password tidak sesuai.'},401);
 const token=await createSession(db,row.id);return new Response(JSON.stringify({ok:true,mustChangePassword:row.must_change_password===1,profile:publicProfile(row)}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':sessionCookie(token)}});
 }catch{return json({error:'Akun belum dapat diproses. Coba lagi.'},400)}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return json({error:'Asal permintaan ditolak.'},403);const token=cookieToken(request);if(/^[a-f0-9]{64}$/.test(token))await env.DB!.prepare('DELETE FROM local_sessions WHERE token_hash = ?').bind(await digest(token)).run();return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':sessionCookie('',0)}})}
export async function PATCH(request:Request){
 await authenticate(request,env.DB!);if(!sameOrigin(request))return json({error:'Asal permintaan ditolak.'},403);
 const user=profile(request);if(!user)return json({error:'Masuk terlebih dahulu.'},401);
 try{const raw=await request.text();if(raw.length>3000)return json({error:'Data terlalu panjang.'},413);const d=JSON.parse(raw);
 if(d.action==='password'){
 if(typeof d.currentPassword!=='string'||d.currentPassword.length>128||typeof d.newPassword!=='string'||d.newPassword.length<12||d.newPassword.length>128||d.newPassword===d.currentPassword)return json({error:'Gunakan password baru yang berbeda, minimal 12 karakter.'},400);
 if(!await rateLimit(env.DB!,'password:'+user.id,10))return json({error:'Terlalu banyak percobaan. Tunggu 15 menit.'},429);
 const row=await env.DB!.prepare('SELECT * FROM local_users WHERE id = ?').bind(user.id.slice(6)).first<UserRow>();
 if(!row||!equalHash(await passwordHash(d.currentPassword,row.password_salt),row.password_hash))return json({error:'Password saat ini tidak sesuai.'},400);
 const salt=randomToken(),hash=await passwordHash(d.newPassword,salt);
 const update=await env.DB!.prepare('UPDATE local_users SET password_hash = ?, password_salt = ?, must_change_password = 0 WHERE id = ? AND password_hash = ?').bind(hash,salt,row.id,row.password_hash).run();
 if(!update.meta.changes)return json({error:'Password sudah berubah. Silakan masuk kembali.'},409);
 await env.DB!.prepare('DELETE FROM local_sessions WHERE user_id = ?').bind(row.id).run();
 const token=await createSession(env.DB!,row.id);
 return new Response(JSON.stringify({ok:true,message:'Password berhasil diganti. Sesi perangkat lain telah diakhiri.'}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':sessionCookie(token)}});
 }
 if(typeof d.displayName!=='string'||d.displayName.trim().length<2||d.displayName.length>60)return json({error:'Nama tampilan 2–60 karakter.'},400);
 await env.DB!.prepare('UPDATE local_users SET display_name = ? WHERE id = ?').bind(d.displayName.trim(),user.id.slice(6)).run();return json({ok:true})
 }catch{return json({error:'Perubahan belum tersimpan.'},400)}
}
