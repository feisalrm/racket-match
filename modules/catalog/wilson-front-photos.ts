import {photosFor} from '../detail/photos';
import type {Catalog} from './types';

type PhotoUpdate={
  previousMain:string;
  frontUrl:string;
  sourceUrl?:string;
};

const updates:Record<string,PhotoUpdate>={
  "wilson-prostaff": {
    "previousMain": "/api/photos?key=acf602ab-6600-4d4b-9549-eb961449edc9.webp",
    "frontUrl": "/api/photos?key=beb297cd-86ac-4bdc-83a9-d3e608097451.webp"
  },
  "csv-20261106-racket-012": {
    "previousMain": "/api/photos?key=6cd0040a-5eb7-4e4c-8565-16c35a15c53b.webp",
    "frontUrl": "/api/photos?key=927b17b7-cc3c-4149-81bb-897d2756bc6a.webp"
  },
  "csv-20261106-racket-013": {
    "previousMain": "/api/photos?key=f92a5eff-08a8-48e5-a939-20020d669e35.webp",
    "frontUrl": "/api/photos?key=bddd7175-cc34-4824-b5e2-ef26816a4781.webp"
  },
  "csv-20261106-racket-014": {
    "previousMain": "/api/photos?key=18505e5d-d212-4f46-b5f0-b965d8d12203.webp",
    "frontUrl": "/api/photos?key=d714a37d-c797-4908-8385-c91bce46e2e3.webp"
  },
  "csv-20261106-racket-015": {
    "previousMain": "/api/photos?key=2ada0f94-3f95-4bf5-b113-ea80d9878e8a.webp",
    "frontUrl": "/api/photos?key=80d22a20-7ecd-4c4b-8886-cb8e46ddc2b7.webp"
  },
  "csv-20261106-racket-016": {
    "previousMain": "/api/photos?key=6f94885d-5a85-4d88-907b-c640efb45805.webp",
    "frontUrl": "/api/photos?key=17cca707-0575-43a1-abca-ea94bcc4823b.webp"
  },
  "csv-20261106-racket-020": {
    "previousMain": "/api/photos?key=308a370d-1643-4b6c-8b6f-ca77354fb9f6.webp",
    "frontUrl": "/api/photos?key=9ac704b0-e52a-4b7f-bd69-0000d38d8523.webp"
  },
  "csv-20261106-racket-021": {
    "previousMain": "/api/photos?key=2bf43cb0-87ed-4abc-85eb-c6ef75bd8edd.webp",
    "frontUrl": "/api/photos?key=3afd5af5-88d6-4883-95e6-47c20d8d5a4b.webp"
  },
  "csv-20261106-racket-023": {
    "previousMain": "/api/photos?key=ac594ad3-eeeb-46d6-8576-5367af58dfe4.webp",
    "frontUrl": "/api/photos?key=4c549407-f9c2-4d6c-b992-0e5672361244.webp"
  },
  "csv-20261106-racket-024": {
    "previousMain": "/api/photos?key=a3bfb6c3-db4e-4306-afd3-c601f2d356ad.webp",
    "frontUrl": "/api/photos?key=fddb7fa9-d750-4677-85e3-eb8bb0f87bea.webp"
  },
  "csv-20261106-racket-025": {
    "previousMain": "/api/photos?key=d22ad41d-0c72-4aa5-b520-34395c000aa0.webp",
    "frontUrl": "/api/photos?key=564602ab-3e38-4c65-b953-c8b2b3b9dcf7.webp"
  },
  "csv-20261106-racket-017": {
    "previousMain": "/api/photos?key=e8a65a6a-9fac-4861-8010-3d5cd1764981.webp",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/shift-99-pro-v1.png",
    "sourceUrl": "https://id.wilson.com/products/shift-99-pro-v1"
  },
  "csv-20261106-racket-018": {
    "previousMain": "/api/photos?key=f226908b-b61f-45c4-818e-0549dde3239c.webp",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/shift-99-v1.png",
    "sourceUrl": "https://www.wilson.com/en-gb/products/shift-99-v1-tennis-racket-wr14530"
  },
  "csv-20261106-racket-019": {
    "previousMain": "/api/photos?key=9461e119-33e9-4641-bbd8-0d538c4f69df.webp",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/shift-99l-v1.png",
    "sourceUrl": "https://id.wilson.com/products/shift-99l-v1"
  },
  "csv-20261106-racket-026": {
    "previousMain": "/api/photos?key=ccfea852-fcb0-4c81-bb9d-aaf7cd12d694.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/rf-01-pro.png",
    "sourceUrl": "https://id.wilson.com/products/rf-01-pro-tennis-racket-wr151311u"
  },
  "csv-20261106-racket-027": {
    "previousMain": "/api/photos?key=d12e70a4-a688-4706-bdb6-0de1659adb49.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/rf-01.png",
    "sourceUrl": "https://id.wilson.com/products/rf-01"
  },
  "csv-20261106-racket-028": {
    "previousMain": "/api/photos?key=ecf7c144-ee05-4f2b-a545-bce589c66e0d.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/rf-01-future.png",
    "sourceUrl": "https://id.wilson.com/products/rf-01-future"
  },
  "csv-20261106-racket-029": {
    "previousMain": "/api/photos?key=02947862-9574-4153-b1da-306006573441.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/rf-01-future-lite.png",
    "sourceUrl": "https://id.wilson.com/products/rf-01-future-lite"
  },
  "wilson-defyer-98-pro-v1": {
    "previousMain": "/api/photos?key=434a19b8-384c-40c6-b242-7db41c503a85.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/defyer-98-pro-v1.png",
    "sourceUrl": "https://www.wilson.com/en-us/products/defyer-98-pro-v1-tennis-racket-wr21530"
  },
  "wilson-defyer-100-v1": {
    "previousMain": "/api/photos?key=e21ec7e5-54ac-4df3-9957-c6894e7a0ca3.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/defyer-100-v1.png",
    "sourceUrl": "https://www.wilson.com/en-us/products/defyer-100-v1-tennis-racket-wr21540"
  },
  "wilson-defyer-100l-v1": {
    "previousMain": "/api/photos?key=3e41f758-a0d9-4c25-8da1-3608638c4abc.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/defyer-100l-v1.png",
    "sourceUrl": "https://www.wilson.com/en-us/products/defyer-100l-v1-tennis-racket-wr21550"
  },
  "wilson-defyer-100ul-v1": {
    "previousMain": "/api/photos?key=dfb93c60-13ca-48ea-9b69-1bdb908a436e.png",
    "frontUrl": "https://racketmatch-lads.diniestrim.chatgpt.site/images/wilson-front/defyer-100ul-v1.png",
    "sourceUrl": "https://www.wilson.com/en-us/products/defyer-100ul-v1-tennis-racket-wr21560"
  }
};

// Compare the saved main photo so an edit made after review takes precedence.
export function updateWilsonFrontPhotos(catalog:Catalog):Catalog{
  if((catalog.datasetVersion??0)>=8)return catalog;
  const rackets=catalog.rackets.map(racket=>{
    const update=updates[racket.id];
    if(!update||racket.brand!=='Wilson'||racket.status!=='published')return racket;
    const photos=photosFor(racket);
    if(photos[0]?.url!==update.previousMain)return racket;

    const frontIndex=photos.findIndex(photo=>photo.url===update.frontUrl);
    if(frontIndex>=0){
      return {...racket,photos:[photos[frontIndex],...photos.filter((_,index)=>index!==frontIndex)]};
    }
    if(!update.sourceUrl||photos.length>=8)return racket;

    const frontPhoto={
      url:update.frontUrl,
      alt:'Wilson '+racket.name+' · Tampak depan',
      sourceUrl:update.sourceUrl,
    };
    return {...racket,photos:[frontPhoto,...photos]};
  });
  return {...catalog,rackets,datasetVersion:8};
}
