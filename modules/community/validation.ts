import {z} from 'zod';
const optionalUrl=z.string().max(1500).refine(v=>!v||(()=>{try{return ['https:','http:'].includes(new URL(v).protocol)}catch{return false}})(),'URL harus http/https');
const score=z.number().int().min(1).max(10);
export const reviewSchema=z.object({basis:z.enum(['editorial','playtest']),rubricVersion:z.literal('1.0'),title:z.string().trim().max(120),body:z.string().trim().min(20).max(4000),ratings:z.record(z.number().int().min(1).max(10).nullable()),reasons:z.record(z.string().trim().max(1500)),reference:z.string().trim().max(1500),sourceUrl:optionalUrl,stringSetup:z.string().trim().max(1000),tension:z.string().trim().max(100),court:z.string().trim().max(1500),modifications:z.string().trim().max(1000),sessions:z.number().int().min(1).max(1000).nullable(),personalAttributes:z.array(z.object({name:z.string().trim().min(2).max(60),score,reason:z.string().trim().min(5).max(800)})).max(5)}).superRefine((v,ctx)=>{
 const scored=Object.entries(v.ratings).filter(([,n])=>n!=null);if(!scored.length)ctx.addIssue({code:'custom',message:'Nilai setidaknya satu aspek standar.'});
 if(v.basis==='editorial'&&!v.sourceUrl)ctx.addIssue({code:'custom',message:'Sumber editorial wajib diisi.'});
 if(new Set(v.personalAttributes.map(a=>a.name.toLowerCase())).size!==v.personalAttributes.length)ctx.addIssue({code:'custom',message:'Nama atribut pribadi harus berbeda.'});
});
export const submissionSchema=z.object({racketId:z.string().min(1).max(200),displayName:z.string().trim().min(2).max(60),kind:z.enum(['review','comment']),payload:z.unknown()});
export const commentSchema=z.object({body:z.string().trim().min(3).max(2000)});
