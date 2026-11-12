import {authenticate,profile} from '../../../modules/auth/local';
import {env} from 'cloudflare:workers';
import {isAdmin,sameOrigin} from '../../../modules/auth/access';
import {json} from '../../../modules/community/server';
export const dynamic='force-dynamic';
const config=()=>env as unknown as {ADMIN_EMAIL?:string;BUCKET?:R2Bucket};
const keyPattern=/^[a-f0-9-]{36}\.(jpg|png|webp|avif)$/;

function hasAvifBrand(bytes:Uint8Array):boolean{
 if(bytes.length<16||String.fromCharCode(...bytes.subarray(4,8))!=='ftyp')return false;

 const header=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const size=header.getUint32(0);
 const majorBrandOffset=size===1?16:8;
 const compatibleBrandsOffset=majorBrandOffset+8;
 if(bytes.length<compatibleBrandsOffset)return false;
 const boxSize=size===1?Number(header.getBigUint64(8)):size;
 if(boxSize<compatibleBrandsOffset||boxSize>bytes.length||boxSize%4!==0)return false;

 // An AVIF still image or sequence declares "avif" or "avis" in its file type box.
 const isAvifBrand=(brand:number)=>brand===0x61766966||brand===0x61766973;
 if(isAvifBrand(header.getUint32(majorBrandOffset)))return true;
 for(let offset=compatibleBrandsOffset;offset<boxSize;offset+=4){
  if(isAvifBrand(header.getUint32(offset)))return true;
 }
 return false;
}

function imageExtension(bytes:Uint8Array){
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpg';
 if(bytes.subarray(0,8).join(',')==='137,80,78,71,13,10,26,10')return 'png';
 if(String.fromCharCode(...bytes.subarray(0,4))==='RIFF'&&String.fromCharCode(...bytes.subarray(8,12))==='WEBP')return 'webp';
 return hasAvifBrand(bytes)?'avif':null;
}

export async function POST(request:Request){await authenticate(request,env.DB!);
 if(!isAdmin(request,config()))return json({error:'Akses admin diperlukan.'},403);
 if(!sameOrigin(request))return json({error:'Asal permintaan ditolak.'},403);
 if(Number(request.headers.get('content-length'))>6*1024*1024)return json({error:'Maksimal 5 MB per foto.'},413);
 try{
 const bucket=config().BUCKET;if(!bucket)return json({error:'Penyimpanan foto belum tersedia.'},503);
 const form=await request.formData();const file=form.get('file');
 if(!file||typeof file==='string'||!('arrayBuffer' in file))return json({error:'Pilih file foto.'},400);
 if(file.size>5*1024*1024||file.size<12)return json({error:'Foto harus berukuran maksimal 5 MB.'},400);
 const data=await file.arrayBuffer();const bytes=new Uint8Array(data);
 const type=imageExtension(bytes);
 if(!type)return json({error:'Gunakan foto JPEG, PNG, WebP, atau AVIF.'},400);
 const key=crypto.randomUUID()+'.'+type;await bucket.put('rackets/'+key,data,{httpMetadata:{contentType:type==='jpg'?'image/jpeg':'image/'+type}});
 return json({url:'/api/photos?key='+key},201);
 }catch{return json({error:'Upload belum berhasil. Coba lagi.'},400)}
}
export async function GET(request:Request){await authenticate(request,env.DB!);
 const key=new URL(request.url).searchParams.get('key');if(!key||!keyPattern.test(key))return json({error:'Foto tidak ditemukan.'},404);
 try{const file=await config().BUCKET?.get('rackets/'+key);if(!file)return json({error:'Foto tidak ditemukan.'},404);
 return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType??'image/jpeg','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','ETag':file.httpEtag}});
 }catch{return json({error:'Foto belum dapat dimuat.'},503)}
}
