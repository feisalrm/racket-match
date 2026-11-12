import {structureExisting} from '../products/structure';
import {seed as previous} from './v2-seed';
import {sourced} from './factory';
import type {Catalog,Racket} from './types';
import type {CharacterKey,PlayerLevel,PlayingUse} from '../taxonomy/registry';
const additions:Racket[]=[
 sourced('tecnifibre-tfight300','Tecnifibre','T-Fight 300 · 14FI300X51','#c9ccbf',{weight:300,head:100,balance:320,pattern:'16 × 19',beam:'23 / 23.5 / 23'},'https://www.tecnifibre.com/products/t-fight-300','Tecnifibre · T-Fight 300'),
 sourced('tecnifibre-tfight285','Tecnifibre','T-Fight 285 · 14FI285X51','#c0c5b4',{weight:285,head:100,pattern:'16 × 19'},'https://www.tecnifibre.com/products/t-fight-285','Tecnifibre · T-Fight 285','unspecified'),
 sourced('diadem-elevate','Diadem','Elevate V3 98','#4195ac',{weight:305,head:98,balance:320,length:27,stiffness:64,pattern:'16 × 20',beam:'21.5'},'https://diademsports.com/products/diadem-elevate-v3','Diadem · Elevate V3 98','unspecified'),
 sourced('diadem-nova','Diadem','Nova V3 100','#a9bd67',{weight:300,head:100,balance:320,length:27,stiffness:69,pattern:'16 × 19',beam:'23.5'},'https://www.diademsports.com.au/products/nova-v3-100','Diadem Australia · Nova V3 100','unspecified'),
 sourced('diadem-novatour','Diadem','Nova V3 Tour','#b6c875',{weight:315,head:100,balance:305,length:27,pattern:'16 × 19',beam:'23.5'},'https://diademsports.com/products/nova-v3-tour','Diadem · Nova V3 Tour','unspecified'),
 sourced('solinco-blackout','Solinco','Blackout V2 300','#393f38',{weight:300,head:100,balance:315,length:27,pattern:'16 × 19',beam:'23.5 / 26 / 23',tensionMin:45,tensionMax:50},'https://shop.solincosports.com/products/blackout-v2-300','Solinco · Blackout V2 300','unspecified'),
 sourced('solinco-whiteout','Solinco','Whiteout V2 305 · 16×19','#c1c7bd',{weight:305,head:98,balance:320,length:27,pattern:'16 × 19',beam:'21.7',tensionMin:45,tensionMax:50},'https://solincosports.com/equipment/whiteout-305-v2/','Solinco · Whiteout V2 305','unspecified'),
 sourced('solinco-whiteout1820','Solinco','Whiteout V2 305 · 18×20','#aeb9ab',{weight:305,head:98,balance:325,length:27,pattern:'18 × 20',beam:'21.7',tensionMin:45,tensionMax:50},'https://solincosports.com/equipment/whiteout-v2-18x20/','Solinco · Whiteout V2 305 18×20','unspecified'),
 sourced('wilson-tourslamlite','Wilson','Tour Slam Lite · Pre-strung','#4f84b8',{weight:274,weightStrung:291,head:112,balance:320,balanceStrung:330,length:27.5,pattern:'16 × 19',beam:'21'},'https://id.wilson.com/en/products/wilson-tour-slam-lite-recreational-tennis-racket-pre-strung','Wilson Indonesia · Tour Slam Lite'),
 sourced('babolat-boostdrive','Babolat','Boost Drive · 121263','#668ac1',{weight:260,balance:345,head:105.4,length:26.97,pattern:'16 × 19',beam:'23 / 26 / 23',swingweight:290,stiffness:70},'https://www.babolat.ae/en-ae/boost-drive-strung-121263-100.html','Babolat UAE · Boost Drive 121263')
];
const boost=additions.find(r=>r.id==='babolat-boostdrive')!;
boost.evidence!.head!.note='Konversi 680 cm² ÷ 6.4516, dibulatkan satu desimal.';
boost.evidence!.length!.note='Konversi 685 mm ÷ 25.4, dibulatkan dua desimal.';
boost.evidence!.weight!.note='Toleransi pabrikan ±7 g.';boost.evidence!.balance!.note='Toleransi pabrikan ±7 mm.';
const classifications:Record<string,[CharacterKey[],PlayerLevel[],PlayingUse[],string]>={
 'wilson-blade':[['control','feel','stability'],['intermediate','advanced'],['competitive'],'Seri Blade menekankan kontrol, feel dan stabilitas. Level merupakan interpretasi editorial untuk pemain dengan teknik yang berkembang.'],
 'wilson-prostaff':[['control','feel'],['advanced'],['competitive'],'Pro Staff 97 menekankan presisi dan feel; profil advanced merupakan interpretasi editorial atas positioning frame performa.'],
 'wilson-ultra':[['power','comfort'],['intermediate','advanced'],['recreational','competitive'],'Ultra menonjolkan tenaga dan kenyamanan; pengelompokan pengguna merupakan interpretasi editorial, bukan batas kemampuan.'],
 'babolat-drive':[['power','feel'],['intermediate','advanced'],['recreational','competitive'],'Pure Drive diposisikan untuk tenaga dan sensasi pukulan. Pemetaan level dan penggunaan merupakan interpretasi editorial.'],
 'head-gravity':[['control','feel','forgiveness'],['intermediate','advanced'],['competitive'],'Gravity mengutamakan kontrol, feel dan sweet spot. Level dan tujuan bermain merupakan interpretasi editorial atas profil pemain agresif.'],
 'head-boom':[['power','feel'],['intermediate','advanced'],['recreational','competitive'],'Boom MP ditujukan bagi intermediate dan advanced yang mencari power. Tujuan bermain dipetakan secara editorial.'],
 'yonex-ezone':[['power','comfort','forgiveness'],['intermediate','advanced'],['recreational','competitive'],'EZONE memadukan tenaga dan kenyamanan. Halaman produk menyebut intermediate/advanced; tujuan bermain merupakan pemetaan editorial.'],
 'yonex-ezone98':[['power','comfort'],['intermediate','advanced'],['competitive'],'Halaman produk menyebut intermediate/advanced dengan tenaga dan kenyamanan. Tujuan competitive merupakan pemetaan editorial.'],
 'yonex-ezone100l':[['power','comfort','maneuver'],['intermediate','advanced'],['recreational','competitive'],'Versi ringan untuk tenaga dan kenyamanan. Level mengacu profil produk, tujuan bermain merupakan pemetaan editorial.'],
 'yonex-percept':[['control','feel'],['intermediate','advanced'],['competitive'],'PERCEPT ditujukan untuk kontrol dan feel. Profil intermediate/advanced mengikuti halaman produk; competitive merupakan interpretasi editorial.'],
 'tecnifibre-tfight300':[['power','control','spin','maneuver'],['intermediate','advanced'],['competitive'],'Pabrikan menyebut pemain reguler dan kompetitor dengan keseimbangan power/control serta spin. Intermediate/advanced adalah padanan editorial.'],
 'tecnifibre-tfight285':[['power','control','spin','maneuver','forgiveness'],['intermediate','advanced'],['competitive'],'Pabrikan menyebut kompetitor dan pemain reguler, power/control, spin, manuver dan toleransi. Level merupakan padanan editorial.'],
 'diadem-elevate':[['control','feel','comfort','stability'],['intermediate','advanced'],['competitive'],'Pabrikan menyebut kontrol, feel, comfort dan stabilitas untuk pemukul presisi agresif. Level dan competitive adalah pemetaan editorial.'],
 'diadem-nova':[['power','stability','feel','forgiveness'],['beginner','intermediate','advanced'],['recreational','competitive'],'Pabrikan menyebut semua level dari baru mulai hingga pro dan sweet spot luas. Recreational adalah pemetaan editorial.'],
 'diadem-novatour':[['power','stability','feel'],['advanced'],['competitive'],'Pabrikan secara eksplisit menyebut high-level competitive players, power, stabilitas dan responsive feel. Advanced adalah padanan editorial.'],
 'solinco-blackout':[['power','spin','comfort'],['intermediate','advanced'],['recreational','competitive'],'Pabrikan menyebut power, spin, comfort dan recreational sampai profesional. Pilihan intermediate/advanced adalah kurasi editorial, bukan klaim pabrikan tentang batas level.'],
 'solinco-whiteout':[['control','feel','comfort'],['intermediate','advanced'],['competitive'],'Pabrikan menyebut control/feel untuk ayunan cepat serta peredaman getaran. Level dan competitive merupakan pemetaan editorial.'],
 'solinco-whiteout1820':[['control','spin','comfort','feel','stability'],['advanced'],['competitive'],'Pabrikan menyebut precision hitters dengan control, spin, comfort, feel dan stabilitas. Advanced/competitive adalah pemetaan editorial.'],
 'wilson-tourslamlite':[['power','forgiveness','comfort','maneuver'],['beginner'],['recreational'],'Pabrikan menyebut beginner usia 14+, casual/leisure, power, toleransi pukulan dan kenyamanan.'],
 'babolat-boostdrive':[['power','forgiveness','maneuver','comfort'],['beginner'],['recreational'],'Pabrikan menyebut pemain yang baru mulai/kembali bermain dan occasional players. Beginner/recreational adalah padanan editorial.' ]
};
export const seed:Catalog=structureExisting({...previous,datasetVersion:3,rackets:[...previous.rackets,...additions].map(original=>{const r=structuredClone(original),c=classifications[r.id];if(!c)return r;const e=Object.values(r.evidence??{})[0]!;r.characterTags=c[0];r.playerLevels=c[1];r.playingUses=c[2];r.characterSource={url:e.url,title:e.title,checkedAt:'2026-11-03',basis:'manufacturer',reason:c[3]};if(r.id==='wilson-ultra')r.characterSource={...r.characterSource,url:'https://www.wilson.com/en-gb/products/ultra-100-v4-tennis-racket-wr10830',title:'Wilson · Ultra 100 V4'};r.audienceSource={...r.characterSource,basis:'editorial'};r.source='Spesifikasi nominal pabrikan. Kategori karakter berdasarkan positioning produk; skor review belum tersedia.';return r;})});
