import { readdir, readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
async function files(dir){const result=[];for(const f of await readdir(dir,{withFileTypes:true})){if(['node_modules','dist','.git','releases'].includes(f.name))continue;const p=dir+'/'+f.name;if(f.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
const all=await files('.');let count=0;
for(const f of all.filter(p=>/\.(js|mjs)$/.test(p))){const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});if(r.status!==0)throw new Error(`${f}\n${r.stderr}`);const text=await readFile(f,'utf8');for(const m of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){await access(resolve(dirname(f),m[1]));}count++;}
for(const f of ['index.html','manifest.webmanifest','firebase.json','firestore.indexes.json','js/config.js','assets/vale.webp','assets/icon-192.png','assets/icon-512.png','vendor/qrcode.js'])await access(f);
for(const f of all.filter(p=>p.endsWith('.json')||p.endsWith('.webmanifest')))JSON.parse((await readFile(f,'utf8')).replace(/^\uFEFF/,''));
const html=await readFile('index.html','utf8');for(const m of html.matchAll(/(?:src|href)="((?!https?:|#)[^"]+)"/g))await access(m[1]);
console.log(`OK: ${count} scripts; imports, JSON, manifest and local assets.`);
