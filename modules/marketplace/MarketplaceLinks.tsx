
import {usePreferences} from "../preferences/Preferences";
import {sendEvent} from '../engagement/client';
import type {Racket} from '../catalog/types';
export const marketplaces=[['tokopedia','Tokopedia'],['shopee','Shopee'],['tiktok','TikTok Shop']] as const;
export type Marketplace=typeof marketplaces[number][0];
export function MarketplaceIcon({id}:{id:Marketplace}) {

  return <svg viewBox="0 0 32 32" width="23" height="23" fill="none" aria-hidden="true">
    {id==='tokopedia'?<><path d="M5 11 8 5l8 4 8-4 3 6v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" fill="#48a568"/><circle cx="11.5" cy="17" r="5" fill="white"/><circle cx="20.5" cy="17" r="5" fill="white"/><circle cx="12" cy="17" r="2" fill="#287548"/><circle cx="20" cy="17" r="2" fill="#287548"/><path d="m14 22 2 3 2-3" fill="#e1bd62"/></>:id==='shopee'?<><path d="m7 10-2 18h22l-2-18Z" fill="#ee805d"/><path d="M11 11V8a5 5 0 0 1 10 0v3" stroke="#ee805d" strokeWidth="2"/><path d="M20 15c-5-3-10 2-4 4s1 6-4 3" stroke="white" strokeWidth="2" strokeLinecap="round"/></>:<><rect x="2" y="2" width="28" height="28" rx="7" fill="#343c3c"/><path d="M18 8v13a4 4 0 1 1-4-4M18 8c0 5 4 6 6 6" stroke="#80d6ce" strokeWidth="3"/><path d="M19.5 8v13a4 4 0 1 1-4-4M19.5 8c0 5 4 6 6 6" stroke="#f2b2c0" strokeWidth="2"/></>}
  </svg>;
}
export default function MarketplaceLinks({racket,compact=false,showStoreNames=false}:{racket:Racket;compact?:boolean;showStoreNames?:boolean}) {
  const {t}=usePreferences();
  const links=marketplaces.map(([id,label])=>{
    const value=racket.affiliateLinks?.[id]?.trim();
    return {id,label,url:value&&/^https:\/\//i.test(value)?value:undefined};
  });
  const hasLinks=links.some(({url})=>url);
  return <section className={'marketplace-section'+(compact?' marketplace-compact':'')} aria-label={t("Pilihan marketplace")+" · "+racket.brand+" "+racket.name}>
    <div className={showStoreNames?'marketplace-buttons marketplace-store-list':'marketplace-buttons'}>{(showStoreNames?[...links.filter(({url})=>url),...links.filter(({url})=>!url)]:links).map(({id,label,url})=>
      url?<a key={id} className={showStoreNames?'marketplace-link marketplace-store-cta':'marketplace-link'} href={url} target="_blank" rel="sponsored noopener noreferrer"
        aria-label={t(label)} title={t(label)} onClick={() => { void sendEvent({kind:'usage',event:'marketplace-click'}).catch(()=>{}); }}><MarketplaceIcon id={id}/>{showStoreNames&&<span>{t(label)}</span>}</a>:
        <span key={id} className="marketplace-link unavailable" role="img"
          aria-label={t(label)+' · '+t("Link belum tersedia")} title={t(label)+' · '+t("Link belum tersedia")}>
          <MarketplaceIcon id={id}/>
        </span>
    )}</div>
    {showStoreNames&&!hasLinks&&<p>{t('Tautan toko belum tersedia.')}</p>}
    {!compact&&hasLinks&&<p><strong>{t('Cek harga di toko pilihanmu.')}</strong></p>}
  </section>;
}
