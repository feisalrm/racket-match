import type {Racket} from '../catalog/types';
export const characters=[['power','Power','Tenaga dan kedalaman pukulan'],['spin','Spin','Potensi rotasi bola'],['control','Control','Penempatan dan arah bola'],['comfort','Comfort','Respons benturan yang lebih nyaman'],['feel','Feel','Umpan balik dan sentuhan bola'],['forgiveness','Forgiveness','Toleransi pukulan di luar titik tengah'],['maneuver','Maneuverability','Kemudahan mengayun dan mengubah arah'],['stability','Stability','Kestabilan frame saat benturan']] as const;
export const levels=[['beginner','Beginner'],['intermediate','Intermediate'],['advanced','Advanced']] as const;
export const uses=[['recreational','Recreational'],['competitive','Competitive']] as const;
export type CharacterKey=typeof characters[number][0];
export type PlayerLevel=typeof levels[number][0];
export type PlayingUse=typeof uses[number][0];
export type ClassificationSource={url:string;title:string;checkedAt:string;basis:'manufacturer'|'editorial';reason:string};
export function profileLabel(r:Racket){return (r.playerLevels??[]).map(k=>levels.find(x=>x[0]===k)?.[1]).join(' / ')||r.level;}
export function matchesProfile(r:Racket,level:string,use:string,character:string){return (!level||r.playerLevels?.includes(level as PlayerLevel))&&(!use||r.playingUses?.includes(use as PlayingUse))&&(!character||r.characterTags?.includes(character as CharacterKey));}
