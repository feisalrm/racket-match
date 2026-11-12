import type { Catalog, Racket } from './types';
const definitions = [
['power','Power','Kemudahan menghasilkan kecepatan dan kedalaman bola.'],
['control','Control','Kemudahan mengatur arah dan kedalaman pukulan.'],
['spin','Spin potential','Dukungan terhadap pembentukan topspin dan slice.'],
['maneuver','Maneuverability','Kemudahan menggerakkan dan mempercepat raket.'],
['stability','Stability','Ketahanan terhadap putaran saat menerima bola berat.'],
['comfort','Comfort','Kenyamanan benturan; dipengaruhi senar dan setup. Bukan jaminan bebas cedera.'],
['forgiveness','Forgiveness','Toleransi terhadap kontak di luar sweet spot.'],
['feel','Touch / feel','Umpan balik dan kemudahan mengatur pukulan halus.']
];
const rows:any[] = [
['wilson-blade','Wilson','Blade 100 v9',2024,300,100,320,'16 × 19','Intermediate','#507a4f',[7,9,8,8,8,8,8,9]],
['babolat-pure-aero','Babolat','Pure Aero',2023,300,100,320,'16 × 19','Intermediate','#b8bf37',[8,7,10,8,8,6,8,7]],
['yonex-ezone','Yonex','EZONE 100',2025,300,100,320,'16 × 19','Intermediate','#356aa0',[9,8,8,8,8,8,9,8]],
['head-speed','HEAD','Speed MP',2024,300,100,320,'16 × 19','Intermediate','#ece9df',[8,8,8,8,8,8,8,8]],
['wilson-clash','Wilson','Clash 100 v3',2025,295,100,310,'16 × 19','Pemula','#a6473c',[8,7,8,9,7,10,9,8]],
['babolat-drive','Babolat','Pure Drive',2025,300,100,320,'16 × 19','Intermediate','#4b89c2',[10,7,8,8,8,6,9,7]],
['wilson-prostaff','Wilson','Pro Staff 97 v14',2023,315,97,310,'16 × 19','Advanced','#92664b',[6,10,7,7,9,7,6,10]],
['head-gravity','HEAD','Gravity MP',2025,295,100,325,'16 × 20','Intermediate','#629f9c',[7,9,8,8,7,9,8,9]],
['yonex-vcore','Yonex','VCORE 100',2023,300,100,320,'16 × 19','Intermediate','#b34538',[8,7,10,8,8,8,8,8]],
['wilson-ultra','Wilson','Ultra 100 v4',2022,300,100,320,'16 × 19','Pemula','#536ca8',[9,7,8,8,8,7,9,7]],
['head-boom','HEAD','Boom MP',2024,295,100,315,'16 × 19','Pemula','#7cbdb0',[9,7,8,9,7,8,9,8]],
['yonex-percept','Yonex','PERCEPT 97',2023,310,97,310,'16 × 19','Advanced','#799a72',[6,10,7,8,8,9,6,10]],
];
export const seed:Catalog={attributes:definitions.map(([id,name,description])=>({id,name,description,active:true})),rackets:rows.map(([id,brand,name,year,weight,head,balance,pattern,level,color,scores])=>({id,brand,name,year,weight,head,balance,pattern,level,color,status:'published',basis:'demo',source:'Dataset simulasi untuk demonstrasi fitur. Seluruh spesifikasi dan skor belum diverifikasi.',notes:'Contoh profil untuk mencoba katalog dan comparison. Jangan gunakan sebagai acuan pembelian.',ratings:Object.fromEntries(definitions.map((a,i)=>[a[0],scores[i]]))} as Racket))};
