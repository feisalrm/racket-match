export type AdminConfig={ADMIN_EMAIL?:string;ADMIN_BOOTSTRAP_HASH?:string;ADMIN_BOOTSTRAP_SALT?:string};
export async function ensureAdminAccount(db:D1Database,config:AdminConfig){
 const email=config.ADMIN_EMAIL?.trim().toLowerCase();
 if(!email||!config.ADMIN_BOOTSTRAP_HASH||!config.ADMIN_BOOTSTRAP_SALT)return;
 // Provision exactly one reserved administrator. Never promote or overwrite an existing public signup.
 if(await db.prepare('SELECT id FROM local_users WHERE email = ?').bind(email).first())return;
 const now=new Date().toISOString();
 await db.prepare('INSERT OR IGNORE INTO local_users (id,username,display_name,email,phone,password_hash,password_salt,created_at,role,must_change_password) VALUES (?,?,?,?,?,?,?,?,?,?)')
 .bind(crypto.randomUUID(),'feisal_maulana','Lads',email,null,config.ADMIN_BOOTSTRAP_HASH,config.ADMIN_BOOTSTRAP_SALT,now,'admin',1).run();
}
