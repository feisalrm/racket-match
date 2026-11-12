export type LocalProfile={id:string;username:string;displayName:string;email:string|null;phone:string|null;role:'reviewer'|'admin';mustChangePassword:boolean};
type UserRow={id:string;username:string;display_name:string;email:string|null;phone:string|null;password_hash:string;password_salt:string;role?:string;must_change_password?:number};
const localProfiles=new WeakMap<Request,LocalProfile>();
export const profile=(request:Request)=>localProfiles.get(request)??null;
const encoder=new TextEncoder();
export const hex=(data:ArrayBuffer)=>Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
export const digest=async(text:string)=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));
export const randomToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export function phoneNumber(value:string){const digits=value.replace(/[\s()+-]/g,'');return digits.startsWith('0')?'62'+digits.slice(1):digits}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-512',salt:encoder.encode(salt),iterations:100000},key,512))}
export function equalHash(a:string,b:string){let result=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)result|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return result===0}
export function publicProfile(row:UserRow):LocalProfile{return {id:'local:'+row.id,username:row.username,displayName:row.display_name,email:row.email,phone:row.phone,role:row.role==='admin'?'admin':'reviewer',mustChangePassword:row.must_change_password===1}}
export const sessionCookie=(token:string,age=604800)=>`rm_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
export const cookieToken=(request:Request)=>request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('rm_session='))?.slice(11)??'';
export async function authenticate(request:Request,db:D1Database){
 const token=cookieToken(request);if(!/^[a-f0-9]{64}$/.test(token))return;
 const row=await db.prepare('SELECT u.* FROM local_sessions s JOIN local_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?').bind(await digest(token),new Date().toISOString()).first<UserRow>();
 if(row)localProfiles.set(request,publicProfile(row));
}
export async function createSession(db:D1Database,id:string){const token=randomToken();await db.prepare('INSERT INTO local_sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(await digest(token),id,new Date(Date.now()+604800000).toISOString()).run();return token}
export async function rateLimit(db:D1Database,actor:string,max:number){const hash=await digest(actor),now=Date.now();const recent=await db.prepare('SELECT COUNT(*) AS n FROM auth_attempts WHERE actor = ? AND created_at > ?').bind(hash,new Date(now-900000).toISOString()).first<{n:number}>();if((recent?.n??0)>=max)return false;await db.prepare('INSERT INTO auth_attempts (id,actor,created_at) VALUES (?,?,?)').bind(crypto.randomUUID(),hash,new Date(now).toISOString()).run();return true}
export type {UserRow};
