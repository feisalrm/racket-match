import type {Attribute,Racket,ScoringGuide,RatingSnapshot,Catalog} from '../catalog/types';
export const RUBRIC_VERSION='1.0';
export const bands=[{range:'1–3',name:'Rendah'},{range:'4–6',name:'Sedang'},{range:'7–8',name:'Tinggi'},{range:'9–10',name:'Sangat tinggi'}];
export const standardGuides:Record<string,ScoringGuide>={
 power:{procedure:'Bandingkan kedalaman dan kecepatan bola pada ayunan nyaman yang serupa. Catat bila teknik atau setup berubah.',low:'Perlu usaha besar untuk mencapai kedalaman.',mid:'Kedalaman cukup dengan ayunan penuh yang nyaman.',high:'Mudah menghasilkan kedalaman tanpa memaksa ayunan.',top:'Kedalaman sangat mudah; sering perlu menahan laju bola.'},
 control:{procedure:'Uji target arah dan kedalaman pada forehand/backhand dengan niat pukulan yang sama. Pisahkan kesalahan kontak dari respons raket.',low:'Sulit mengulangi arah dan kedalaman yang diinginkan.',mid:'Target cukup mudah dicapai dengan penyesuaian.',high:'Arah dan kedalaman terasa konsisten saat kontak bersih.',top:'Penempatan sangat presisi dan berulang dalam kondisi uji.'},
 spin:{procedure:'Uji topspin dan slice dengan lintasan ayunan dan setup senar yang dicatat. Tidak mengklaim RPM tanpa alat ukur.',low:'Sulit menghasilkan putaran yang diinginkan.',mid:'Putaran cukup pada teknik yang sudah dikuasai.',high:'Mudah menghasilkan topspin atau slice yang konsisten.',top:'Putaran terasa sangat mudah dan konsisten sepanjang uji.'},
 maneuver:{procedure:'Uji persiapan pukulan, perubahan arah kepala raket, reaksi volley, dan percepatan ayunan. Jangan menilai dari berat statis saja.',low:'Sering terlambat menyiapkan atau mengarahkan kepala raket.',mid:'Cukup mudah digerakkan dengan persiapan baik.',high:'Cepat diarahkan dan dipercepat pada berbagai pukulan.',top:'Sangat ringan digerakkan saat reaksi cepat dan transisi.'},
 stability:{procedure:'Amati putaran dan dorongan balik saat menerima bola cepat serta kontak sedikit meleset. Gunakan kecepatan umpan yang serupa.',low:'Mudah berputar atau terdorong saat menerima bola.',mid:'Cukup kokoh pada kontak bersih; meleset masih terasa.',high:'Tetap kokoh pada bola berat dan kontak agak meleset.',top:'Sangat kokoh; arah muka raket terjaga sepanjang uji.'},
 comfort:{procedure:'Catat rasa benturan dan getaran pada setup yang diuji. Ini persepsi reviewer, bukan ukuran medis atau jaminan bebas cedera.',low:'Benturan atau getaran terasa keras dan mengganggu.',mid:'Benturan dapat diterima tetapi masih cukup terasa.',high:'Benturan terasa lembut dengan getaran yang tidak mengganggu.',top:'Sangat nyaman bagi reviewer pada setup dan kondisi uji.'},
 forgiveness:{procedure:'Bandingkan kedalaman dan arah pada kontak bersih versus sedikit meleset. Berbeda dari stability yang menilai gerakan frame.',low:'Sedikit meleset menyebabkan penurunan hasil yang besar.',mid:'Kontak agak meleset masih dapat dimainkan.',high:'Arah dan kedalaman cukup terjaga saat sedikit meleset.',top:'Hasil sangat toleran terhadap kontak di sekitar pusat.'},
 feel:{procedure:'Uji touch volley, drop shot, dan kontrol panjang bola pada ayunan pendek. Pisahkan sensasi informasi kontak dari comfort.',low:'Sulit membaca kontak dan mengatur sentuhan halus.',mid:'Umpan balik cukup jelas dengan penyesuaian.',high:'Kontak terasa jelas; sentuhan halus mudah diatur.',top:'Umpan balik sangat jelas dan sentuhan halus konsisten.'},
};
export function guideFor(a:Attribute):ScoringGuide|undefined{return standardGuides[a.id]??a.scoringGuide}
export function bandFor(score:number|null|undefined){return score==null?'Belum dinilai':score<=3?'Rendah':score<=6?'Sedang':score<=8?'Tinggi':'Sangat tinggi'}
export const hasScores=(r:Racket)=>Object.values(r.ratings).some(x=>x!=null);
const stable=(v:unknown):string=>v&&typeof v==='object'?Array.isArray(v)?'['+v.map(stable).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable((v as Record<string,unknown>)[k])).join(',')+'}':JSON.stringify(v);
function assessmentSignature(r:Racket){const{snapshot:_,...context}=r.ratingContext??{};return stable({basis:r.basis,ratings:r.ratings,context})}
export function prepareRatingSnapshots(catalog:Catalog,previous:Catalog):Catalog{
 return {...catalog,rackets:catalog.rackets.map(r=>{
  if(!hasScores(r)||r.basis==='demo'||!r.ratingContext)return r;
  const old=previous.rackets.find(x=>x.id===r.id);
  if(old?.ratingContext?.snapshot&&assessmentSignature(old)===assessmentSignature(r))return {...r,ratingContext:{...r.ratingContext,snapshot:old.ratingContext.snapshot}};
  const snapshot:Record<string,RatingSnapshot>={};
  for(const a of catalog.attributes){if(r.ratings[a.id]==null)continue;const guide=guideFor(a);if(guide)snapshot[a.id]={name:a.name,description:a.description,...guide};}
  return {...r,ratingContext:{...r.ratingContext,snapshot}};
 })};
}
export function comparisonCaveats(rackets:Racket[]):string[]{
 const rated=rackets.filter(hasScores);if(rated.length<2)return [];
 const notes:string[]=[];
 if(rated.some(r=>!r.ratingContext))notes.push('Ada penilaian lama tanpa konteks lengkap; skor belum dapat disetarakan.');
 if(new Set(rated.map(r=>r.basis)).size>1)notes.push('Basis penilaian berbeda: editorial, uji main, dan simulasi dibaca terpisah.');
 if(new Set(rated.map(r=>r.ratingContext?.rubricVersion??'legacy')).size>1)notes.push('Versi rubrik berbeda.');
 if(new Set(rated.map(r=>r.ratingContext?.reviewer.trim().toLowerCase()??'')).size>1)notes.push('Reviewer berbeda; preferensi penilai dapat memengaruhi skor.');
 if(new Set(rated.filter(r=>r.basis==='playtest').map(r=>JSON.stringify([r.ratingContext?.stringSetup,r.ratingContext?.tension,r.ratingContext?.court,r.ratingContext?.modifications]))).size>1)notes.push('Setup atau kondisi uji berbeda; perbedaan skor perlu dibaca bersama konteksnya.');
 return notes;
}
export const methodologyReferences=[
 {title:'TWU · Prosedur pengukuran power',url:'https://twu.tennis-warehouse.com/learning_center/test_method.php'},
 {title:'Tennis Warehouse · Memahami spesifikasi raket',url:'https://www.tennis-warehouse.com/learning_center/gear_guides/tennis_racquets/selecting_the_right_tennis_racquet.html'},
];
export function newAssessmentError(catalog:Catalog,previous:Catalog):string|null{
 for(const r of catalog.rackets){
  if(r.status!=='published'||!hasScores(r)||r.basis==='demo')continue;
  const old=previous.rackets.find(x=>x.id===r.id);
  if(r.ratingContext&&(!old||assessmentSignature(old)!==assessmentSignature(r))){for(const [id,n] of Object.entries(r.ratings)){const a=catalog.attributes.find(a=>a.id===id);if(n!=null&&a&&!guideFor(a))return `Lengkapi panduan skor untuk ${a.name} sebelum memperbarui penilaian.`;}}
  if(!r.ratingContext&&(!old||old.status!=='published'||assessmentSignature(old)!==assessmentSignature(r)))return `${r.name}: lengkapi konteks penilaian sebelum memublikasikan skor.`;
 }
 return null;
}
