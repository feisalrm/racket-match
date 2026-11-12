import type {Racket} from '../catalog/types';
import {characters, type CharacterKey, type PlayerLevel, type PlayingUse} from '../taxonomy/registry';

export type MatchAnswers = {
  level: PlayerLevel | 'unsure';
  use: PlayingUse;
  style: 'baseline' | 'net' | 'allcourt' | 'unsure';
  priorities: CharacterKey[];
  challenge: 'mishits' | 'late' | 'short' | 'long' | 'none';
  response: 'soft' | 'crisp' | 'balanced' | 'unsure';
  weight: 'light' | 'medium' | 'heavy' | 'any';
};
export type MatchResult = {
  racket: Racket;
  index: number;
  reasons: string[];
  notes: string[];
  coverage: number;
};

export function isComplete(answers: Partial<MatchAnswers>): answers is MatchAnswers {
  return !!(answers.level && answers.use && answers.style && answers.priorities?.length &&
    answers.priorities.length <= 2 && answers.challenge && answers.response && answers.weight);
}

const styleAspects: Record<MatchAnswers['style'], CharacterKey[]> = {
  baseline: ['power','spin'], net: ['maneuver','feel'],
  allcourt: ['control','stability'], unsure: []
};
const challengeAspects: Record<MatchAnswers['challenge'], CharacterKey[]> = {
  mishits: ['forgiveness'], late: ['maneuver'], short: ['power'],
  long: ['control','spin'], none: []
};
const characterName = (id: CharacterKey) => characters.find(character => character[0] === id)![1];

// Version 1.1 is a transparent catalogue-fit index. Review scores and demo data are excluded.
export function rankMatches(rackets: Racket[], answers: MatchAnswers): MatchResult[] {
  const priorities = [...new Set(answers.priorities)];
  return rackets.filter(racket => racket.status === 'published' && racket.basis !== 'demo').map(racket => {
    let earned = 0;
    let possible = 0;
    let knownWeight = 0;
    const reasons: string[] = [];
    const notes: string[] = [];
    const tags = new Set(racket.characterTags ?? []);
    function criterion(weight: number, value: number, known: boolean) {
      possible += weight;
      earned += weight * value;
      if (known) knownWeight += weight;
    }
    function aspectFit(ids: CharacterKey[], weight: number) {
      if (!ids.length) return;
      const known = tags.size > 0;
      criterion(weight, known ? ids.filter(id => tags.has(id)).length / ids.length : 0.35, known);
    }

    if (answers.level !== 'unsure') {
      const known = !!racket.playerLevels?.length;
      const matched = racket.playerLevels?.includes(answers.level) ?? false;
      criterion(20, matched ? 1 : known ? 0.15 : 0.35, known);
      if (matched) reasons.push('Profil katalog mencakup level '+answers.level+'.');
      if (known && !matched) notes.push('Level pada katalog berbeda dari pilihan Anda.');
    }
    const knownUse = !!racket.playingUses?.length;
    const matchedUse = racket.playingUses?.includes(answers.use) ?? false;
    criterion(8, matchedUse ? 1 : knownUse ? 0.2 : 0.35, knownUse);
    if (matchedUse) reasons.push('Kategori penggunaan sesuai tujuan bermain Anda.');

    aspectFit(priorities, 35);
    const matchedPriorities = priorities.filter(id => tags.has(id));
    if (matchedPriorities.length) reasons.unshift('Positioning produk menonjolkan '+matchedPriorities.map(characterName).join(' dan ')+'.');
    const missingPriorities = priorities.filter(id => !tags.has(id));
    if (missingPriorities.length) notes.push('Prioritas '+missingPriorities.map(characterName).join(' / ')+' belum tercantum pada positioning produk.');

    aspectFit(styleAspects[answers.style], 12);
    const challenge = challengeAspects[answers.challenge];
    aspectFit(challenge, 15);
    if (challenge.some(id => tags.has(id))) reasons.push('Memiliki karakter '+challenge.filter(id => tags.has(id)).map(characterName).join(' / ')+' yang Anda cari untuk tantangan pukulan.');

    if (answers.response === 'soft') {
      aspectFit(['comfort'], 8);
      if (tags.has('comfort')) reasons.push('Comfort termasuk karakter yang ditonjolkan pabrikan.');
    }
    if (answers.response === 'crisp') aspectFit(['feel','control'], 8);

    if (answers.weight !== 'any') {
      const weight = racket.weight;
      const known = weight != null;
      const matched = known && (answers.weight === 'light' ? weight < 295 : answers.weight === 'medium' ? weight >= 295 && weight <= 305 : weight > 305);
      criterion(12, matched ? 1 : known ? 0.1 : 0.35, known);
      if (matched) reasons.push('Berat utama '+weight+' g sesuai rentang pilihan Anda.');
      else notes.push(known ? 'Berat utama berada di luar rentang yang Anda pilih.' : 'Berat utama belum tersedia.');
    }
    const coverage = Math.round(knownWeight / possible * 100);
    if (coverage < 100) notes.push('Sebagian data profil belum tersedia pada katalog.');
    return {racket, index: Math.round(earned / possible * 100), reasons, notes, coverage};
  }).sort((a,b) => b.index - a.index || b.coverage - a.coverage ||
    (a.racket.brand+' '+a.racket.name).localeCompare(b.racket.brand+' '+b.racket.name,'id')).slice(0,3);
}
