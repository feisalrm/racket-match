// Keep the existing visual hierarchy without inverting product photos or illustrations.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.resolve('vite'));
const postcss=require('postcss');
const input=postcss.parse(fs.readFileSync('app/globals.css','utf8'));
function convert(hex,kind){
 let h=hex.slice(1);if(h.length===3||h.length===4)h=[...h].map(x=>x+x).join('');
 const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);const hi=Math.max(r,g,b),lo=Math.min(r,g,b),l=(hi+lo)/2;
 let hue=0,s=0;if(hi!==lo){const d=hi-lo;s=l>.5?d/(2-hi-lo):d/(hi+lo);hue=hi===r?((g-b)/d+(g<b?6:0)):hi===g?(b-r)/d+2:(r-g)/d+4;hue*=60;}
 const neutral=s<.13||hue>60&&hue<165;
 let light,saturation;
 if(kind==='bg'){light=l>.8?.10+(1-l)*.28:l>.5?.21:.23;saturation=neutral?.16:Math.min(s,.32)}
 else if(kind==='border'){light=.25;saturation=neutral?.15:Math.min(s,.28)}
 else {light=l>.85?.89:l>.5?.70:.82;saturation=neutral?.16:Math.min(s,.5)}
 if(neutral)hue=132;
 return `hsl(${Math.round(hue)} ${Math.round(saturation*100)}% ${Math.round(light*100)}%${h.length===8?' / '+(parseInt(h.slice(6,8),16)/255).toFixed(2):''})`;
}
const out=postcss.root();
function walk(nodes,target){for(const node of nodes){if(node.type==='atrule'&&['media','supports','container'].includes(node.name)){const at=node.clone({nodes:[]});walk(node.nodes??[],at);if(at.nodes.length)target.append(at)}else if(node.type==='rule'){
 const declarations=[];for(const d of node.nodes??[]){if(d.type!=='decl'||d.prop.startsWith('--')||!/(?:color|background|border|shadow|outline|fill|stroke)/.test(d.prop))continue;
 let value=d.value;const kind=/background/.test(d.prop)?'bg':/border|outline/.test(d.prop)?'border':'text';if(/shadow/.test(d.prop))continue;
 value=value.replace(/#[\da-f]{3,8}\b/gi,h=>convert(h,kind));value=value.replace(/\bwhite\b/g,convert('#fff',kind)).replace(/\bblack\b/g,convert('#000',kind));
 value=value.replace(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)\s*(?:[,/]\s*([\d.]+))?\)/gi,(_,r,g,b,a)=>{const v=convert('#'+[r,g,b].map(x=>Number(x).toString(16).padStart(2,'0')).join(''),kind);return a?v.replace(')',` / ${a})`):v});
 if(value!==d.value)declarations.push(d.clone({value}));}
 if(declarations.length){const rule=node.clone({nodes:declarations});rule.selector=node.selectors.map(s=>s.trim()===':root'?':root[data-theme="dark"]':':root[data-theme="dark"] '+s).join(',');target.append(rule)}
}}}
walk(input.nodes,out);
fs.writeFileSync('app/dark.css','/* Generated palette from globals.css. Run node scripts/generate-dark-theme.mjs after colour changes. */\n:root[data-theme="dark"]{--ink:#e0e9dc;--muted:#a4b29e;--green:#a2c28e;--lime:#acc66f;--line:#344437;--paper:#121b16;color-scheme:dark}\n'+out.toString()+`\n:root[data-theme="dark"] .button.dark,:root[data-theme="dark"] .dock-text .count,:root[data-theme="dark"] .character-filters button[aria-pressed="true"],:root[data-theme="dark"] .rd-tabs button.active{background:#3c6149;color:#f2f6e9}\n:root[data-theme="dark"] .button.dark:hover{background:#4b7559}\n:root[data-theme="dark"] .logo-mark,:root[data-theme="dark"] .count{background:#527447;color:#f1f8df}\n:root[data-theme="dark"] .radar-svg text{fill:#b4c2aa}\n:root[data-theme="dark"] .radar-svg text[font-weight="700"],:root[data-theme="dark"] .radar-svg text[font-weight="700"] tspan{fill:#e6b979}\n:root[data-theme="dark"] .radar-svg polygon[fill="none"],:root[data-theme="dark"] .radar-svg line[stroke="#dce4d5"]{stroke:#354b39}\n:root[data-theme="dark"] .radar-svg line[stroke="#356744"],:root[data-theme="dark"] .radar-svg polygon[stroke="#356744"]{stroke:#9ec585}\n:root[data-theme="dark"] .radar-svg circle[fill="#244b35"]{fill:#b3d59c}\n:root[data-theme="dark"] .picker-brands button[aria-pressed=true],:root[data-theme="dark"] .chosen .picker-check{background:#45633d;color:#f2f6e9}
:root[data-theme="dark"] .marketplace-link svg{filter:none}\n:root[data-theme="dark"] input::placeholder,:root[data-theme="dark"] textarea::placeholder{color:#9aab95}\n:root[data-theme="dark"] .preference-choices button[aria-pressed="true"],:root[data-theme="dark"] .preference-languages button[aria-pressed="true"]{background:#2c4230;border-color:#9bbf81;color:#e0edcf}\n`);
