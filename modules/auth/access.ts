import {profile} from './local';
export type Identity={id:string;email:string};
export function identity(request:Request):Identity|null{const local=profile(request);if(local)return {id:local.id,email:local.email??''};const id=request.headers.get('oai-authenticated-user-id');return id?{id,email:request.headers.get('oai-authenticated-user-email')??''}:null}
// The hosted proxy supplies these headers. Membership is never inferred from "signed in" alone.
export function isAdmin(request:Request,config:{ADMIN_EMAIL?:string}){const local=profile(request);if(local)return local.role==='admin'&&!local.mustChangePassword&&!!config.ADMIN_EMAIL&&local.email?.toLowerCase()===config.ADMIN_EMAIL.trim().toLowerCase();const user=identity(request);return !!user&&!!config.ADMIN_EMAIL&&user.email.trim().toLowerCase()===config.ADMIN_EMAIL.trim().toLowerCase()}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin}
