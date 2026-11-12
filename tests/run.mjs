import ts from 'typescript';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
for(const file of ['modules/admin/workbook','tests/workbook.test','modules/admin/bulk','tests/bulk.test','modules/catalog/defyer','tests/defyer.test','modules/taxonomy/csv-characters','tests/csv-characters.test','modules/catalog/import-data','modules/catalog/import-catalog','tests/import.test','modules/products/structure','tests/products.test','modules/auth/admin-bootstrap','modules/auth/local','modules/community/organic-pilot','modules/comparison/highlights','tests/highlights.test','modules/matching/engine','tests/matching.test','modules/taxonomy/registry','modules/taxonomy/editorial-levels','modules/catalog/v2-seed','modules/catalog/factory','modules/catalog/types','modules/catalog/seed','modules/catalog/legacy-seed','modules/catalog/upgrade','modules/catalog/wilson-front-photos','modules/detail/photos','modules/specifications/registry','modules/ratings/rubric','modules/auth/access','modules/community/demo','modules/community/types','modules/community/validation','modules/community/aggregate','modules/community/server','modules/catalog/validation','modules/catalog/storage','tests/catalog.test','tests/ratings.test']){
 const source=await readFile(file+'.ts','utf8');
 let out=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 out=out.replace(/from ['"](\.[^'"]+)['"]/g,(_,p)=>`from '${p}.js'`);
 const path='.sites-runtime/test-build/'+file+'.js';await mkdir(path.slice(0,path.lastIndexOf('/')),{recursive:true});await writeFile(path,out);
}
await import('../.sites-runtime/test-build/tests/catalog.test.js');

await import('../.sites-runtime/test-build/tests/ratings.test.js');

await import('../.sites-runtime/test-build/tests/matching.test.js');

await import('../.sites-runtime/test-build/tests/highlights.test.js');

await import('../.sites-runtime/test-build/tests/products.test.js');

await import('../.sites-runtime/test-build/tests/import.test.js');

await import('../.sites-runtime/test-build/tests/csv-characters.test.js');

await import('../.sites-runtime/test-build/tests/defyer.test.js');

await import('../.sites-runtime/test-build/tests/bulk.test.js');

await import('../.sites-runtime/test-build/tests/workbook.test.js');
