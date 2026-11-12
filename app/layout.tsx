import type { Metadata } from 'next';
import './globals.css';
import './dark.css';
import './dark-media.css';
import './products.css';
import PreferencesProvider from '../modules/preferences/Preferences';
export const metadata:Metadata={title:'RacketMatch — Find your racket character',description:'Explore and compare tennis racket characteristics in one place.',icons:{icon:{url:'/favicon.svg?v=rm',type:'image/svg+xml'}}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`try{var m=localStorage.getItem('rm-theme'),l=localStorage.getItem('rm-locale');var d=m==='dark'||m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light';if(l==='en'||l==='id')document.documentElement.lang=l}catch(e){}`}}/></head><body><PreferencesProvider>{children}</PreferencesProvider></body></html>}
