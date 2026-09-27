import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
const roots=['apps','packages','scripts','tests'];
async function walk(path){const out=[];for(const e of await readdir(path,{withFileTypes:true})){const p=join(path,e.name);if(e.isDirectory())out.push(...await walk(p));else if(/\.(m?js)$/.test(e.name))out.push(p);}return out;}
let failed=false;
for(const root of roots){for(const file of await walk(root)){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status){failed=true;console.error(file,r.stderr);}}}
if(failed)process.exit(1);console.log('Syntax OK');
