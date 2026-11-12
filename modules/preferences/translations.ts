import english from './en.json';
export type Locale='id'|'en';
const en:Record<string,string>=english;
// Exact UI phrases only. No substring replacement of community or catalogue content.
const patterns:[RegExp,(...parts:string[])=>string][]=[
 [/^Profil katalog mencakup level (.+)\.$/,level=>`The catalogue profile includes ${level} players.`],
 [/^Positioning produk menonjolkan (.+)\.$/,aspects=>`Product positioning highlights ${aspects.replaceAll(' dan ',' and ')}.`],
 [/^Prioritas (.+) belum tercantum pada positioning produk\.$/,aspects=>`The ${aspects} priority is not listed in the product positioning.`],
 [/^Memiliki karakter (.+) yang Anda cari untuk tantangan pukulan\.$/,aspects=>`Offers the ${aspects} character you want for your shot challenge.`],
 [/^Berat utama (.+) g sesuai rentang pilihan Anda\.$/,weight=>`The primary weight of ${weight} g is in your preferred range.`],
 [/^(\d+) reviewer uji main$/,n=>`${n} playtest reviewers`],
 [/^(.+) · (\d+) penilai( · Termasuk DEMO)?$/,(name,n,demo)=>`${name} · ${n} raters${demo?' · Includes DEMO':''}`],
 [/^(.+) belum dinilai$/,name=>`${name} not yet rated`],
 [/^(.+) (\d+(?:\.\d+)?) dari 10$/,(name,n)=>`${name} ${n} out of 10`],
 [/^(Hapus dari favorit|Simpan ke favorit|Lihat detail|Bandingkan|Hapus|Lepas|Pilih) (.+)$/,(action,name)=>`${en[action]??action} ${name}`],
 [/^(Kondisi dan sumber|Konteks skor|Informasi penilai|Lihat sumber) (.+)$/,(label,name)=>`${en[label]??label} ${name}`],
 [/^Skor (.+)$/,name=>`Score ${en[name]??name}`],
 [/^Skor pribadi (\d+)$/,n=>`Personal score ${n}`],
 [/^(\d+) bersumber$/,n=>`${n} sourced`],
 [/^(.+) · Diperbarui (.+)$/,(a,date)=>`${a} · Updated ${date}`],
];
export function translate(value:string,locale:Locale):string{
 if(locale==='id')return value;
 const key=value.trim().replace(/\s+/g,' ');let result=en[key];
 if(result===undefined){for(const [pattern,format]of patterns){const match=key.match(pattern);if(match){result=format(...match.slice(1));break}}}
 if(result===undefined)return value;
 return (value.match(/^\s*/)?.[0]??'')+result+(value.match(/\s*$/)?.[0]??'');
}
