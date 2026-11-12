const yonexEquipment = 'https://www.yonex.com/news/us-open-2025-confidence-is-high-for-shelton-and-the-rest-of-team-yonex/';

// Match the manufacturer's named model, without extending the association to other variants.
export const proRacketAssociations: Partial<Record<string, {name:string; peak:number; equipmentUrl:string}>> = {
  'yonex-ezone': {name:'Casper Ruud', peak:2, equipmentUrl:yonexEquipment},
  'yonex-ezone98': {name:'Ben Shelton', peak:5, equipmentUrl:yonexEquipment},
  'yonex-percept': {name:'Frances Tiafoe', peak:10, equipmentUrl:yonexEquipment},
};
