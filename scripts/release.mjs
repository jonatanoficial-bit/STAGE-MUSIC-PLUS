import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import JSZip from 'jszip';
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
const info=JSON.parse(await readFile('BUILD.json','utf8')),zip=new JSZip();
async function add(dir,prefix=''){for(const ent of await readdir(dir,{withFileTypes:true})){if(['node_modules','.git','releases','.firebase'].includes(ent.name)||ent.name.endsWith('-debug.log')||ent.name.startsWith('.env')||/adminsdk|service[-_]?account|credentials|^id_(rsa|ed25519)$|\.(pem|key|p12|pfx)$/i.test(ent.name))continue;const path=resolve(dir,ent.name),name=prefix+ent.name;if(ent.isDirectory())await add(path,name+'/');else zip.file(name,await readFile(path));}}
await add(process.cwd());await mkdir('releases',{recursive:true});const name=`Stage-Music_v${info.version}_${info.fileStamp}_BRT.zip`,data=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:9}});await writeFile('releases/'+name,data);await writeFile('releases/'+name+'.sha256',createHash('sha256').update(data).digest('hex')+'  '+name+'\n');console.log(resolve('releases',name));
