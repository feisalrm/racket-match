import {useEffect,useId,useRef,useState,type ChangeEvent} from 'react';
import type {Racket} from '../catalog/types';
import {usePreferences} from '../preferences/Preferences';
import {photosFor} from './photos';

type Photos=NonNullable<Racket['photos']>;
type UploadFailure={file:string;reason:string};
type Props={
  racket:Racket;
  onPhotosChange:(photos:Photos)=>void;
  uploading:boolean;
  onUploadingChange:(uploading:boolean)=>void;
  disabled:boolean;
  variantSharing?:{
    groupLabel:string;
    variants:Pick<Racket,'id'|'name'|'status'>[];
    checked:boolean;
    onChange:(checked:boolean)=>void;
  };
};

const acceptedImages='image/jpeg,image/png,image/webp,image/avif,.avif';
const maxSupportingPhotos=7;
const emptyPhoto={url:'',alt:'',sourceUrl:''};
const uploadError='Upload belum berhasil. Coba lagi.';

async function uploadPhoto(file:File,signal:AbortSignal):Promise<string>{
  if(file.size>5*1024*1024)throw new Error('Maksimal 5 MB per foto.');
  const data=new FormData();
  data.append('file',file);
  const response=await fetch('/api/photos',{method:'POST',body:data,signal}).catch(()=>null);
  const result=await response?.json().catch(()=>null) as {url?:string;error?:string}|null|undefined;
  if(!response?.ok||!result?.url)throw new Error(result?.error||uploadError);
  return result.url;
}

export default function PhotoEditor({racket,onPhotosChange,uploading,onUploadingChange,disabled,variantSharing}:Props){
  const {t}=usePreferences();
  const sharingHelpId=useId();
  const [message,setMessage]=useState('');
  const [failures,setFailures]=useState<UploadFailure[]>([]);
  const activeUpload=useRef<AbortController|null>(null);
  useEffect(()=>()=>activeUpload.current?.abort(),[]);

  const photos=photosFor(racket);
  const [mainPhoto,...supportingPhotos]=photos;
  const hasMainPhoto=!!mainPhoto?.url.trim();
  const canAddSupporting=hasMainPhoto&&supportingPhotos.length<maxSupportingPhotos;

  async function upload(files:File[],target:'main'|'supporting'){
    if(!files.length||disabled||uploading||activeUpload.current)return;
    setMessage('');
    setFailures([]);
    if(target==='supporting'&&(!canAddSupporting||supportingPhotos.length+files.length>maxSupportingPhotos)){
      setMessage('Jumlah foto pendukung melebihi slot yang tersedia.');
      return;
    }
    const controller=new AbortController();
    activeUpload.current=controller;
    onUploadingChange(true);
    try{
      const added:Photos=[];
      const failed:UploadFailure[]=[];
      const alt=('Foto '+racket.brand+' '+racket.name).trim().slice(0,200);
      // Keep requests small and preserve the file picker's order.
      for(let offset=0;offset<files.length;offset+=3){
        const batch=files.slice(offset,offset+3);
        const results=await Promise.allSettled(batch.map(file=>uploadPhoto(file,controller.signal)));
        if(controller.signal.aborted)return;
        results.forEach((result,index)=>{
          if(result.status==='fulfilled')added.push({url:result.value,alt,sourceUrl:''});
          else failed.push({file:batch[index].name,reason:result.reason instanceof Error?result.reason.message:uploadError});
        });
      }
      if(added.length){
        onPhotosChange(target==='main'?[...added,...supportingPhotos]:[...photos,...added]);
        setMessage('Foto berhasil diunggah. Klik Simpan raket untuk menerbitkan perubahan galeri.');
      }
      setFailures(failed);
    }finally{
      activeUpload.current=null;
      onUploadingChange(false);
    }
  }

  function selectPhotos(event:ChangeEvent<HTMLInputElement>,target:'main'|'supporting'){
    const files=Array.from(event.currentTarget.files??[]);
    event.currentTarget.value='';
    void upload(target==='main'?files.slice(0,1):files,target);
  }

  function photoRow(photo:Photos[number],index:number){
    const stored=photo.url.startsWith('/api/photos?');
    function change(field:keyof Photos[number],value:string){
      onPhotosChange(photos.map((item,i)=>i===index?{...item,[field]:value}:item));
    }
    return <div key={index} className="photo-editor-row">
      {photo.url&&<img src={photo.url} alt={photo.alt||t('Preview foto')} loading="lazy"/>}
      <div className="form-grid">
        <label>{stored?t('File tersimpan di server'):t('URL foto')+' '+(index+1)}
          <input required type={stored?'text':'url'} readOnly={stored} value={photo.url} onChange={e=>change('url',e.target.value)}/>
        </label>
        <label>{t('Sudut / keterangan')}
          <input required maxLength={200} value={photo.alt} onChange={e=>change('alt',e.target.value)}/>
        </label>
        <label>{t('Halaman sumber · opsional')}
          <input type="url" value={photo.sourceUrl} onChange={e=>change('sourceUrl',e.target.value)}/>
        </label>
        <button type="button" className="text-button" onClick={()=>onPhotosChange(photos.filter((_,i)=>i!==index))}>
          {t('Hapus dari galeri')}
        </button>
      </div>
    </div>;
  }

  return <fieldset className="affiliate-editor photo-editor" disabled={disabled||uploading}>
    <legend>{t('Galeri foto produk')}</legend>
    <p className="small muted">{t('Maksimal 8 foto. Upload JPEG, PNG, WebP, atau AVIF, maksimal 5 MB per file. Gunakan foto model yang tepat dan yang boleh digunakan.')}</p>
    {variantSharing&&<div className="photo-variant-scope">
      <label className="checkbox-label">
        <input type="checkbox" checked={variantSharing.checked&&hasMainPhoto} disabled={!hasMainPhoto}
          aria-describedby={sharingHelpId} onChange={event=>variantSharing.onChange(event.target.checked)}/>
        {t('Terapkan galeri ke semua varian')}
      </label>
      <p id={sharingHelpId} className="small muted">
        <strong>{variantSharing.groupLabel} · {variantSharing.variants.length} {t('varian')}</strong>
        <br/>
        {t(hasMainPhoto?'Saat disimpan, galeri ini menggantikan foto utama dan pendukung pada varian yang tercantum.':'Tambahkan foto utama untuk memakai galeri ini pada varian lain.')}
      </p>
      <details>
        <summary>{t('Lihat daftar varian')}</summary>
        <ul>{variantSharing.variants.map(variant=><li key={variant.id}>
          {variant.name.trim()||t('Raket baru')}
          {variant.status!=='published'&&' · '+t(variant.status==='draft'?'Draft':'Archived')}
        </li>)}</ul>
      </details>
    </div>}
    {(uploading||message)&&<p role="status" className="small">{t(uploading?'Mengunggah…':message)}</p>}
    {failures.length>0&&<div role="alert" className="small photo-upload-errors">
      <strong>{t('Pilih kembali file yang gagal diunggah.')}</strong>
      <ul>{failures.map(({file,reason},index)=><li key={index}>{file} · {t(reason)}</li>)}</ul>
    </div>}

    <section className="photo-editor-section">
      <h3>{t('Foto utama')}</h3>
      <p className="small muted">{t('Satu foto untuk kartu katalog dan halaman perbandingan.')}</p>
      <label className="photo-upload">{t(mainPhoto?.url?'Ganti foto utama':'Unggah foto utama')}
        <input type="file" accept={acceptedImages} onChange={e=>selectPhotos(e,'main')}/>
      </label>
      {mainPhoto?photoRow(mainPhoto,0):<button type="button" className="button outline" onClick={()=>onPhotosChange([emptyPhoto])}>
        {t('+ Tambah melalui URL')}
      </button>}
    </section>

    <section className="photo-editor-section">
      <h3>{t('Foto pendukung')} <span>{supportingPhotos.length}/{maxSupportingPhotos}</span></h3>
      <p className="small muted">{t(hasMainPhoto?'Pilih beberapa foto sekaligus untuk galeri detail.':'Tambahkan foto utama terlebih dahulu.')}</p>
      <label className="photo-upload">{t('Unggah foto pendukung')}
        <input type="file" accept={acceptedImages} multiple disabled={!canAddSupporting} onChange={e=>selectPhotos(e,'supporting')}/>
      </label>
      {supportingPhotos.map((photo,index)=>photoRow(photo,index+1))}
      <button type="button" className="button outline" disabled={!canAddSupporting} onClick={()=>onPhotosChange([...photos,emptyPhoto])}>
        {t('+ Tambah melalui URL')}
      </button>
    </section>
  </fieldset>;
}
