import type {Catalog,Racket} from '../catalog/types';
import {normalized,sameGeneration} from '../products/structure';

const bladeV10Ids=Array.from({length:6},(_,index)=>'csv-20261106-racket-'+String(index+1).padStart(3,'0'));
const bladeV10Photos=[
  ['front','Tampak depan'],
  ['throat-and-grip','Detail throat dan grip'],
  ['head-side','Detail kepala dari samping'],
  ['blade-side','Tampak tiga perempat sisi Blade'],
  ['string-bed','Detail senar dari arah grip'],
  ['wilson-side','Tampak tiga perempat sisi Wilson'],
].map(([file,view])=>({
  url:'https://racketmatch-lads.diniestrim.chatgpt.site/images/blade-v10/'+file+'.webp',
  alt:'Wilson Blade 104 V10 · '+view,
  sourceUrl:'',
}));

export const defaultPhotos:Record<string,NonNullable<Racket['photos']>>={
 ...Object.fromEntries(bladeV10Ids.map(id=>[id,bladeV10Photos])),
 'wilson-blade':['0','2','1'].map((n,i)=>({url:`https://img.myshopline.com/image/store/1749020664963/WR151511U-${n}-Blade-100-V9-RKT-Green.png?h=2000&q=90&w=2000`,alt:['Foto produk 1','Foto produk 2','Foto produk 3'][i],sourceUrl:'https://id.wilson.com/products/blade-100-v9'}))
};
export const photosFor=(r:Racket)=>r.photos??defaultPhotos[r.id]??[];

export function galleryVariantsFor(rackets:Racket[],source:Racket):Racket[]{
  return rackets.filter(racket=>racket.id!==source.id&&sameGeneration(racket,source));
}

export function applyGalleryToVariants(catalog:Catalog,source:Racket):Catalog{
  const photos=photosFor(source);
  if(!photos[0]?.url.trim())return catalog;

  const variants=galleryVariantsFor(catalog.rackets,source);
  if(!variants.length)return catalog;

  const variantIds=new Set([source.id,...variants.map(racket=>racket.id)]);
  const rackets=catalog.rackets.map(racket=>
    variantIds.has(racket.id)?{...racket,photos:photos.map(photo=>({...photo}))}:racket
  );
  return {...catalog,rackets};
}

export function updateBladeV10Gallery(catalog:Catalog):Catalog{
  // Apply the replacement once so later gallery edits are retained.
  if((catalog.datasetVersion??0)>=7)return catalog;
  const rackets=catalog.rackets.map(racket=>{
    const product=racket.product;
    const bladeV10=bladeV10Ids.includes(racket.id)||
      (product&&normalized(product.family)==='blade'&&normalized(product.generation)==='v10');
    if(normalized(racket.brand)!=='wilson'||!bladeV10)return racket;
    return {...racket,photos:structuredClone(bladeV10Photos)};
  });
  return {...catalog,rackets,datasetVersion:7};
}
