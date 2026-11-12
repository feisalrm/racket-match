import {decodeCatalog} from '../catalog/storage';
import {organicCatalog} from './organic-pilot';
import {seed} from '../catalog/seed';import {upgradeCatalog} from '../catalog/upgrade';
import type {Catalog} from '../catalog/types';import type {Entry} from './types';
export async function readCatalog(db:D1Database):Promise<Catalog>{const row=await db.prepare('SELECT payload, revision FROM catalog_state WHERE id = ?').bind('main').first<{payload:string;revision:number}>();return organicCatalog(row?upgradeCatalog(await decodeCatalog(row.payload)):seed)}
export type Row={id:string;kind:string;racket_id:string;author_id:string;display_name:string;status:string;payload:string;revision:number;created_at:string;updated_at:string};
export function publicEntry(row:Row):Entry{return {isDemo:row.author_id.startsWith('demo:v1:'),id:row.id,kind:row.kind as Entry['kind'],racketId:row.racket_id,displayName:row.display_name,status:row.status as Entry['status'],payload:JSON.parse(row.payload),revision:row.revision,createdAt:row.created_at,updatedAt:row.updated_at}}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
