import ExcelJS from 'exceljs';
import type {Catalog} from '../catalog/types';
import {bulkColumns,get,numeric} from './bulk';
const isNumber=(key:string)=>numeric.includes(key)||key.startsWith('ratings.');
const isDate=(key:string)=>key.endsWith('.checkedAt')||key==='ratingContext.evaluatedAt';
const lists=['characterTags','playerLevels','playingUses'];
const arrays=['photos','importInfo.referenceUrls'];
export async function exportWorkbook(catalog:Catalog){
 const book=new ExcelJS.Workbook();book.creator='RacketMatch';
 const sheet=book.addWorksheet('Katalog',{views:[{state:'frozen',xSplit:3,ySplit:1}]});
 const columns=bulkColumns(catalog);
 sheet.columns=columns.map(key=>({header:key,key,width:key==='id'?38:key==='name'?32:24,style:{numFmt:isNumber(key)?'General':'@'}}));
 for(const racket of catalog.rackets){sheet.addRow(columns.map(key=>{const value=get(racket,key);return value==null?'':lists.includes(key)?(value as string[]).join('|'):arrays.includes(key)?JSON.stringify(value):value as string|number;}));}
 sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF244B35'}};sheet.getRow(1).height=30;
 sheet.autoFilter={from:{row:1,column:1},to:{row:catalog.rackets.length+1,column:columns.length}};
 const guide=book.addWorksheet('Panduan');guide.columns=[{width:38},{width:110}];
 guide.addRows([
 ['Aturan','Cara menggunakan'],['Format','Simpan dan unggah kembali sebagai Excel Workbook (.xlsx). Jangan konversi ke CSV.'],
 ['id','Primary key permanen. Jangan diubah. Hanya ID yang sudah ada dapat diperbarui.'],
 ['Sel kosong / [CLEAR]','Kosong mempertahankan nilai lama; [CLEAR] menghapus nilai. Baris/kolom yang tidak disertakan tetap dipertahankan.'],
 ['Angka','Sel spesifikasi dan skor adalah Number. 21.7 berbeda dari 21.07. Jangan mengubah format sel menjadi jam/tanggal.'],
 ['beam','Kolom teks untuk satu atau beberapa ukuran beam, misalnya 21.7 atau 23 / 23.5 / 23. Format Text menjaga desimal.'],
 ['Tanggal','Teks YYYY-MM-DD; format Text menjaga tanggal dan ID dari konversi otomatis Excel.'],
 ['characterTags','Pisahkan dengan |: power|spin|control|comfort|feel|forgiveness|maneuver|stability'],
 ['playerLevels / playingUses','beginner|intermediate|advanced / recreational|competitive'],
 ['ratings.<id>','Skor 1–10; lengkapi basis, konteks penilaian dan ratingContext.reasons.<id>.'],
 ...catalog.attributes.map(a=>['ratings.'+a.id,a.name+' — '+a.description]),
 ['Foto & URL referensi','photos dan importInfo.referenceUrls berupa JSON array. Foto pertama adalah foto utama.'],
 ['Keamanan','Rumus Excel ditolak saat impor. Isi nilai langsung. Pratinjau harus diperiksa sebelum disimpan.']]);
 guide.getRow(1).font={bold:true};guide.eachRow(row=>{row.alignment={wrapText:true,vertical:'top'};row.height=44;});
 return new Uint8Array(await book.xlsx.writeBuffer());
}
// Read raw cell values, never formatted display text (which may round decimals).
export async function readWorkbook(buffer:ArrayBuffer):Promise<string>{
 const book=new ExcelJS.Workbook();await book.xlsx.load(buffer as any);
 const sheet=book.getWorksheet('Katalog')??(book.worksheets.length===1?book.worksheets[0]:undefined);
 if(!sheet)throw Error('Sheet Katalog tidak ditemukan. Gunakan file ekspor Excel dari Admin Studio.');
 if(sheet.rowCount>501||sheet.columnCount>300)throw Error('Maksimal 500 baris raket dan 300 kolom.');
 const rows:string[][]=[];const count=sheet.columnCount;
 for(let i=1;i<=sheet.rowCount;i++){
  const row:string[]=[];
  for(let j=1;j<=count;j++){
   const cell=sheet.getCell(i,j),value=cell.value,key=sheet.getCell(1,j).text;
   if(cell.type===ExcelJS.ValueType.Formula)throw Error('Baris '+i+' · '+key+': rumus Excel tidak didukung. Isi nilai langsung.');
   if(i>1&&isNumber(key)&&value!=null&&value!==''&&(value instanceof Date||/[hysd]/i.test((cell.numFmt??'General').replace(/"[^"]*"|\[[^\]]*\]/g,''))))throw Error('Baris '+i+' · '+key+': format jam/tanggal tidak boleh digunakan untuk angka. Isi ulang nilai yang benar.');
   if(value instanceof Date){if(!isDate(key))throw Error('Baris '+i+' · '+key+': tanggal tidak sesuai tipe kolom.');row.push(value.toISOString().slice(0,10));}
   else if(value==null)row.push('');
   else if(typeof value==='object'){
    if('richText' in value)row.push(value.richText.map(part=>part.text).join(''));
    else if('hyperlink' in value)row.push(value.text);
    else throw Error('Baris '+i+' · '+key+': tipe sel tidak didukung.');
   }else row.push(String(value));
  }
  if(row.some(value=>value.trim()))rows.push(row);
 }
 return rows.map(row=>row.map(value=>'"'+value.replaceAll('"','""')+'"').join(';')).join('\r\n');
}
