'use client';

import {createContext,useContext,useEffect,useRef,useState,useCallback,type ReactNode} from 'react';
import {Sun,Moon,Monitor,Languages,Settings2,Check,X} from 'lucide-react';
import {translate,type Locale} from './translations';
export type Theme='light'|'dark'|'system';
type Preferences={locale:Locale;theme:Theme;setLocale:(locale:Locale)=>void;setTheme:(theme:Theme)=>void;t:<T>(value:T)=>T};
const Context=createContext<Preferences>({locale:'en',theme:'light',setLocale:()=>{},setTheme:()=>{},t:value=>value});
export const usePreferences=()=>useContext(Context);
export default function PreferencesProvider({children}:{children:ReactNode}){
 const [ready,setReady]=useState(false);
 const [locale,setLanguage]=useState<Locale>('en'),[theme,setAppearance]=useState<Theme>('light');
 useEffect(()=>{try{const l=localStorage.getItem('rm-locale'),m=localStorage.getItem('rm-theme');if(l==='en'||l==='id')setLanguage(l);if(m==='light'||m==='dark'||m==='system')setAppearance(m)}catch{}setReady(true)},[]);
 useEffect(()=>{if(!ready)return;document.documentElement.lang=locale;document.title=locale==='en'?'RacketMatch — Find your racket character':'RacketMatch — Temukan karakter raketmu'},[locale,ready]);
 useEffect(()=>{if(!ready)return;const media=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme;document.documentElement.style.colorScheme=document.documentElement.dataset.theme!};apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply)},[theme,ready]);
 useEffect(()=>{function sync(e:StorageEvent){if(e.key==='rm-locale')setLanguage(e.newValue==='id'?'id':'en');if(e.key==='rm-theme')setAppearance(e.newValue==='dark'||e.newValue==='system'?e.newValue:'light')}window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
 const setLocale=(value:Locale)=>{setLanguage(value);try{localStorage.setItem('rm-locale',value)}catch{}};
 const setTheme=(value:Theme)=>{setAppearance(value);try{localStorage.setItem('rm-theme',value)}catch{}};
 const t=useCallback(<T,>(value:T):T=>typeof value==='string'?translate(value,locale) as T:value,[locale]);
 return <Context.Provider value={{locale,theme,setLocale,setTheme,t}}>{children}</Context.Provider>;
}
export function PreferenceMenu({compact=false}:{compact?:boolean}){
 const {locale,theme,setLocale,setTheme,t}=usePreferences();const[open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;function close(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false)}function key(e:KeyboardEvent){if(e.key==='Escape'){setOpen(false);trigger.current?.focus()}}document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)}},[open]);
 return <div className={'preference-menu'+(compact?' preference-account':'')} ref={root}><button ref={trigger} type="button" className="preference-trigger" aria-expanded={open} aria-controls="display-preferences" aria-label={t('Tampilan & bahasa')} title={t('Tampilan & bahasa')} onClick={()=>setOpen(!open)}><Settings2 size={17}/><span>{t(locale.toUpperCase())}</span></button>{open&&<section id="display-preferences" className="preference-popover" aria-label={t('Tampilan & bahasa')}><div className="preference-heading"><strong>{t('Tampilan & bahasa')}</strong><button aria-label={t('Tutup')} onClick={()=>setOpen(false)}><X size={15}/></button></div><fieldset><legend>{t('Tampilan')}</legend><div className="preference-choices">{([['light',Sun,'Terang'],['dark',Moon,'Gelap'],['system',Monitor,'Otomatis']] as const).map(([value,Icon,label])=><button key={value} type="button" aria-pressed={theme===value} onClick={()=>setTheme(value)}><Icon size={17}/><span>{t(label)}</span></button>)}</div></fieldset><fieldset><legend><Languages size={14}/>{t('Bahasa')}</legend><div className="preference-languages">{([['id','Bahasa Indonesia','ID'],['en','English','EN']] as const).map(([value,label,code])=><button key={value} type="button" lang={value} aria-pressed={locale===value} onClick={()=>setLocale(value)}><span>{t(code)}</span>{t(label)}{locale===value&&<Check size={15}/>}</button>)}</div></fieldset><small>{t('Preferensi tersimpan di perangkat ini.')}</small></section>}</div>;
}
