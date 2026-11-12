import type {Catalog} from '../catalog/types';
import type {PlayerLevel} from './registry';

// IDs from the original product import. Classify each variant once.
const groups: [PlayerLevel[], number[]][] = [
 [['beginner'], [40,41,42,43,56,57,59,75,109,110,117,158,165,181,182]],
 [['beginner','intermediate'], [9,10,16,39,52,55,71,72,94,100,108,114,116,129,143,148]],
 [['intermediate'], [19,24,25,66,70,93,113,115,121,128,132,169,180]],
 [['intermediate','advanced'], [6,18,36,77,83,92,112,127,131,133,156,168,177,178]],
 [['advanced'], [7,12,17,20,23,26,76,81,88,89,90,91,105,111,119,120,134,135,140,144,145,149,155,160,161,162,179]],
];

const assignments = new Map(groups.flatMap(([levels, ids]) =>
 ids.map(id => ['csv-20261106-racket-'+String(id).padStart(3,'0'), levels] as const)));

const sources: Record<string,[string,string]> = {
 Wilson: ['Wilson Racquet Sports 2026','https://catalogs.asbsports.com/vendors/pdfs/Wilson-Racquet_Sports-SS_2026.pdf'],
 Yonex: ['Yonex Tennis Racquets','https://www.yonex.com/tennis/racquets'],
 Babolat: ['Tennis Warehouse · Babolat Tennis Racquets','https://www.tennis-warehouse.com/Babolatracquets.html'],
 Tecnifibre: ['Tennis Warehouse · Tecnifibre Tennis Racquets','https://www.tennis-warehouse.com/Tecnifibreracquets.html'],
 Diadem: ['Diadem Tennis Rackets','https://diademsports.com/collections/tennis-rackets'],
 HEAD: ['Tennis Warehouse · Head Tennis Racquets','https://www.tennis-warehouse.com/Headracquets.html'],
 Solinco: ['Solinco · Blackout Series Guide','https://solincosports.com/total-blackout-your-comprehensive-guide-on-the-blackout-series/'],
};

export function applyEditorialLevels(catalog: Catalog): Catalog {
 if ((catalog.datasetVersion??0)>=9) return catalog;
 const rackets = catalog.rackets.map(racket => {
  const levels = assignments.get(racket.id);
  if (!levels || racket.playerLevels?.length || racket.level !== 'Belum dinilai') return racket;
  const [title,url] = sources[racket.brand];
  return {...racket,playerLevels:[...levels],audienceSource:{
   title,url,checkedAt:'2026-11-11',basis:'editorial' as const,reason:'Level indikatif editorial',
  }};
 });
 return {...catalog,rackets,datasetVersion:9};
}
