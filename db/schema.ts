import {sql} from 'drizzle-orm';
import { sqliteTable, text, integer,uniqueIndex } from 'drizzle-orm/sqlite-core';
export const catalogState = sqliteTable('catalog_state', {
  id: text('id').primaryKey(), payload: text('payload').notNull(),
  revision: integer('revision').notNull().default(0), updatedAt: text('updated_at').notNull(),
});
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(), actor: text('actor').notNull(), action: text('action').notNull(), createdAt: text('created_at').notNull(),
});
export const communityEntries=sqliteTable('community_entries',{
 id:text('id').primaryKey(),kind:text('kind').notNull(),racketId:text('racket_id').notNull(),authorId:text('author_id').notNull(),displayName:text('display_name').notNull(),status:text('status').notNull(),payload:text('payload').notNull(),revision:integer('revision').notNull().default(1),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[uniqueIndex('one_active_review_per_account').on(t.racketId,t.authorId).where(sql`${t.kind} = 'review' AND ${t.status} != 'rejected'`)]);
export const localUsers=sqliteTable('local_users',{
 role:text('role').notNull().default('reviewer'),mustChangePassword:integer('must_change_password').notNull().default(0),
 id:text('id').primaryKey(),username:text('username').notNull().unique(),displayName:text('display_name').notNull(),email:text('email').unique(),phone:text('phone').unique(),passwordHash:text('password_hash').notNull(),passwordSalt:text('password_salt').notNull(),createdAt:text('created_at').notNull(),
});
export const localSessions=sqliteTable('local_sessions',{
 tokenHash:text('token_hash').primaryKey(),userId:text('user_id').notNull().references(()=>localUsers.id),expiresAt:text('expires_at').notNull(),
});
export const authAttempts=sqliteTable('auth_attempts',{
 id:text('id').primaryKey(),actor:text('actor').notNull(),createdAt:text('created_at').notNull(),
});
