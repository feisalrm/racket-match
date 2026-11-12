export type PersonalAttribute={name:string;score:number;reason:string};
export type Review={basis:'editorial'|'playtest';title:string;body:string;ratings:Record<string,number|null>;reasons:Record<string,string>;reference:string;sourceUrl:string;stringSetup:string;tension:string;court:string;modifications:string;sessions:number|null;personalAttributes:PersonalAttribute[];rubricVersion:'1.0'};
export type Entry={isDemo?:boolean;id:string;kind:'review'|'comment';racketId:string;displayName:string;status:'pending'|'approved'|'rejected';payload:Review|{body:string};revision:number;createdAt:string;updatedAt:string};
export type Aggregate={demoReviewerCount?:number;reviewerCount:number;aspects:Record<string,{mean:number;count:number}>};
export type CommunityData={profile?:{username:string;displayName:string}|null;reviews:Entry[];comments:Entry[];ownEntries:Entry[];signedIn:boolean;isAdmin:boolean;aggregate:Aggregate};
