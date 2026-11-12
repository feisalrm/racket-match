
import {Zap,Orbit,Target,Feather,Hand,Scan,Move,Shield} from 'lucide-react';
const icons={power:Zap,spin:Orbit,control:Target,comfort:Feather,feel:Hand,forgiveness:Scan,maneuver:Move,stability:Shield};
export default function CharacterIcon({id}:{id:string}){
const Icon=icons[id as keyof typeof icons]??Orbit;return <Icon size={16} strokeWidth={1.6} aria-hidden="true"/>;}
