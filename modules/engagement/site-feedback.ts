export const feedbackAreas = {
  catalog: 'Katalog & filter',
  compare: 'Perbandingan raket',
  match: 'Find Your Match',
  detail: 'Detail raket',
  reviews: 'Ulasan pemain',
  other: 'Lainnya',
} as const;

export type FeedbackArea = keyof typeof feedbackAreas;
export const feedbackLimit = 1000;
