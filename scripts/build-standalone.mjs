import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const dest=join(root,'dist','standalone');
await rm(dest,{recursive:true,force:true});
await mkdir(dest,{recursive:true});
await cp(join(root,'apps','standalone'),dest,{recursive:true,filter:(src)=>!src.endsWith('package.json')});
await cp(join(root,'packages','core','src'),join(dest,'core'),{recursive:true});
await cp(join(root,'packages','embed','src'),join(dest,'embed'),{recursive:true});
for(const rel of ['app.js','presentation-ui.js','text-style-ui.js']){
  const path=join(dest,rel);let text=await readFile(path,'utf8');
  text=text.replaceAll('../../packages/core/src/','./core/').replaceAll('../../packages/embed/src/','./embed/');
  await writeFile(path,text);
}
for(const rel of ['embed/host-adapter.js']){
  const path=join(dest,rel);let text=await readFile(path,'utf8');
  text=text.replaceAll('../../core/src/','../core/');await writeFile(path,text);
}
console.log('Built dist/standalone');
