import {readdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';
const blocked=[/komos/i,/комос/i,/село\s*зел[её]ное/i,/routerai/i,/ии[-\s]?хаб/i,/ai[-\s]?hub/i];
const skip=new Set(['node_modules','dist','.git']);
const self='scripts/check-neutral.mjs';
async function walk(path){const out=[];for(const e of await readdir(path,{withFileTypes:true})){if(skip.has(e.name))continue;const p=join(path,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const hits=[];
for(const file of await walk('.')){if(file.replaceAll('\\','/').replace(/^\.\//,'')===self)continue;let text;try{text=await readFile(file,'utf8');}catch{continue;}for(const rx of blocked)if(rx.test(text))hits.push(`${file}: ${rx}`);}
if(hits.length){console.error(hits.join('\n'));process.exit(1);}console.log('Neutralization scan OK');
