import type {Entry,Aggregate,Review} from './types';
// Only approved firsthand reviews using the same rubric contribute. Missing != zero.
export function aggregateReviews(entries:Entry[],aspectIds:string[]):Aggregate{
 const reviews=entries.filter(e=>e.kind==='review'&&e.status==='approved'&&(e.payload as Review).basis==='playtest'&&(e.payload as Review).rubricVersion==='1.0');
 const aspects:Aggregate['aspects']={};
 for(const id of aspectIds){const values=reviews.map(e=>(e.payload as Review).ratings[id]).filter((n):n is number=>n!=null);if(values.length)aspects[id]={mean:Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10,count:values.length};}
 return {reviewerCount:reviews.length,demoReviewerCount:reviews.filter(review=>review.isDemo).length,aspects};
}
