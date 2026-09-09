import { readFile, writeFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
const root=process.cwd(),dist=resolve(root,'dist');if(!dist.startsWith(root+sep)||dist===root)throw Error('Unsafe build path');
execFileSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['--test','tests/music.test.mjs','tests/live.test.mjs'],{stdio:'inherit'});
const pkg=JSON.parse((await readFile('package.json','utf8')).replace(/^\uFEFF/,''));
const date=new Date(),local=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(date);
const info={version:pkg.version,builtAt:date.toISOString(),timezone:'America/Sao_Paulo',label:local+' BRT',fileStamp:local.replace(' ','_').replaceAll(':','-')};
await writeFile('js/build-info.js',`export const BUILD = ${JSON.stringify(info,null,2)};\n`);
await writeFile('BUILD.json',JSON.stringify(info,null,2)+'\n');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const p of ['index.html','404.html','manifest.webmanifest','sw.js','assets','css','js','vendor','BUILD.json','.nojekyll'])await cp(p,resolve(dist,p),{recursive:true});
async function files(dir,prefix=''){let result=[];for(const ent of await readdir(dir,{withFileTypes:true})){const p=prefix+ent.name;if(ent.isDirectory())result.push(...await files(resolve(dir,ent.name),p+'/'));else result.push('./'+p);}return result;}
const assets=(await files(dist)).filter(x=>x!=='./sw.js');
const worker=`const CACHE='stage-music-${pkg.version}-${info.fileStamp}';\nconst ASSETS=${JSON.stringify(assets)};\nself.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});\nself.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('stage-music-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});\nself.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok&&ASSETS.some(p=>new URL(p,self.location.href).href===u.href)){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});\n`;
await writeFile('sw.js',worker);await writeFile(resolve(dist,'sw.js'),worker);
console.log(`Build complete: Stage Music ${pkg.version} | ${info.label}`);
