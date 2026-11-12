export async function sendEvent(data:Record<string,unknown>){
 let session='';try{session=sessionStorage.getItem('rm-session')??crypto.randomUUID();sessionStorage.setItem('rm-session',session)}catch{}
 const res=await fetch('/api/engagement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,session})});
 if(!res.ok){const result=await res.json() as {error?:string};throw new Error(result.error??'Belum tersimpan.')}return true;
}
