
import {usePreferences} from "../preferences/Preferences";
import {bandFor} from '../ratings/rubric';

export default function ScoreSlider({label, value, onChange}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}) {
 const {t,locale}=usePreferences();

  const description = value ? value + '/10 · ' + bandFor(value) : 'Belum dinilai';
  return <label className="review-slider">
    <span>{t(label)} <strong>{t(description)}</strong></span>
    <input type="range" min={0} max={10} step={1} value={value ?? 0}
      aria-label={t(label)} aria-valuetext={description}
      onChange={event => onChange(Number(event.target.value) || null)}/>
    <span className="review-scale-labels"><small>{t("Lewati")}</small><small>{t("10 · Sangat menonjol")}</small></span>
  </label>;
}
