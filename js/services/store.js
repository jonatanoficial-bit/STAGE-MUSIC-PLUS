import { firebaseConfig, appCheckSiteKey, firebaseVersion, useEmulators } from '../config.js';
import { demoSongs, demoSetlist } from '../core/demo.js';
import { updateLive, canDirect, canReadNote } from '../core/live.js';
const demoKey='stage-music-demo-v1';
const clone=x=>structuredClone(x);
const uid=()=>crypto.randomUUID();
export const configured=!!firebaseConfig.projectId && !!firebaseConfig.apiKey && !(typeof location!=='undefined'&&['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('demo')==='1');
export const state={mode:configured?'firebase':'demo',user:null,claims:{},member:null,organization:null,connected:navigator.onLine};
let sdk,auth,db,storage,channels=new Map(),authStop;
function initial(){return {songs:Object.fromEntries(demoSongs.map(s=>[s.id,s])),setlists:{'ensaio-aurora':demoSetlist()},liveRooms:{},annotations:{},organizations:{'demo-team':{id:'demo-team',name:'Coletivo Aurora',ownerUid:'demo-director'}},members:{'demo-team':{'demo-director':{id:'demo-director',role:'owner',area:'band',displayName:'Direção Demo'},'demo-band':{id:'demo-band',role:'member',area:'band',displayName:'Banda Demo'},'demo-vocal':{id:'demo-vocal',role:'member',area:'vocal',displayName:'Vocal Demo'},'demo-projection':{id:'demo-projection',role:'member',area:'projection',displayName:'Projeção Demo'},'demo-audio':{id:'demo-audio',role:'member',area:'audio',displayName:'Áudio Demo'},'demo-lighting':{id:'demo-lighting',role:'member',area:'lighting',displayName:'Luz Demo'},'demo-production':{id:'demo-production',role:'member',area:'production',displayName:'Produção Demo'}}},messages:{},participants:{}};}
function read(){let raw=localStorage.getItem(demoKey); if(!raw){let d=initial();localStorage.setItem(demoKey,JSON.stringify(d));return d;}return JSON.parse(raw);}
function write(d){localStorage.setItem(demoKey,JSON.stringify(d));window.dispatchEvent(new Event('stage-data'));}
async function mutate(fn){const run=()=>{const d=read(),result=fn(d);write(d);return clone(result??null);};return navigator.locks ? navigator.locks.request(demoKey,run) : run();}
export async function init(onAuth){
  if(state.mode==='demo'){setDemoUser(sessionStorage.getItem('stage-demo-user')||'demo-director');onAuth();return;}
  try {
    const base=`https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-`;
    const [app,a,f,s,c]=await Promise.all(['app','auth','firestore','storage','app-check'].map(n=>import(base+n+'.js')));
    const fb=app.initializeApp(firebaseConfig); auth=a.getAuth(fb);db=f.getFirestore(fb);storage=s.getStorage(fb);sdk={...a,...f,...s};
    if(appCheckSiteKey)c.initializeAppCheck(fb,{provider:new c.ReCaptchaEnterpriseProvider(appCheckSiteKey),isTokenAutoRefreshEnabled:true});
    if(useEmulators && ['localhost','127.0.0.1'].includes(location.hostname)){a.connectAuthEmulator(auth,'http://127.0.0.1:9099');f.connectFirestoreEmulator(db,'127.0.0.1',8080);s.connectStorageEmulator(storage,'127.0.0.1',9199);}
    authStop=a.onAuthStateChanged(auth,async user=>{
      state.user=user?{uid:user.uid,displayName:user.displayName||'Músico',email:user.email||''}:null;state.claims={};state.member=null;state.organization=null;
      try{if(user){state.claims=(await user.getIdTokenResult()).claims;await sdk.setDoc(sdk.doc(db,'users',user.uid),{displayName:state.user.displayName,email:state.user.email,lastLoginAt:sdk.serverTimestamp()},{merge:true});}}
      catch(e){window.dispatchEvent(new CustomEvent('stage-error',{detail:e}));}
      onAuth();
    });
  }catch(e){throw new Error('Não foi possível conectar ao Firebase. Confira js/config.js e a conexão. '+e.message);}
}
export function setDemoUser(id){const d=read();const m=d.members['demo-team'][id]||d.members['demo-team']['demo-band'];state.user={uid:m.id,displayName:m.displayName};state.claims={masterAdmin:id==='demo-director'};state.member=m;state.organization=d.organizations['demo-team'];sessionStorage.setItem('stage-demo-user',m.id);}
export async function login(){if(state.mode==='demo')return;const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});try{await sdk.signInWithPopup(auth,provider);}catch(err){const errors={'auth/popup-blocked':'Permita a janela de login Google neste navegador e tente novamente.','auth/unauthorized-domain':'Este endereço ainda não está autorizado no Firebase Authentication. Use o endereço oficial do aplicativo.','auth/popup-closed-by-user':'O login foi fechado. Clique em Entrar com Google para tentar novamente.'};throw new Error(errors[err.code]||err.message);}}
export async function logout(){if(auth)await sdk.signOut(auth);}
export function me(){if(!state.user)throw new Error('Entre com sua conta Google para continuar.');return state.user.uid;}
export function master(){return state.claims.masterAdmin===true;}
export async function list(collection, filters=[], maximum=100){
  if(state.mode==='demo'){let values=Object.values(read()[collection]||{});for(const [key,op,val] of filters)values=values.filter(v=>op==='in'?val.includes(v[key]):op==='array-contains'?(v[key]||[]).includes(val):v[key]===val);return clone(values.slice(0,maximum));}
  const q=sdk.query(sdk.collection(db,collection),...filters.map(([k,op,v])=>sdk.where(k,op,v)),sdk.limit(maximum));const snap=await sdk.getDocs(q);return snap.docs.map(d=>({...d.data(),id:d.id}));
}
export async function get(collection,id){if(!id)return null;if(state.mode==='demo')return clone(read()[collection]?.[id]||null);const s=await sdk.getDoc(sdk.doc(db,collection,id));return s.exists()?{...s.data(),id:s.id}:null;}
export async function save(collection, data){
  me();const id=data.id||uid(), value={...data,id,updatedAt:Date.now()};
  if(collection==='songs'&&!master())throw new Error('Somente ADM MASTER pode editar o catálogo.');
  if(state.mode==='demo'){await mutate(d=>{d[collection]??={};d[collection][id]=value;});return value;}
  await sdk.setDoc(sdk.doc(db,collection,id),value);return value;
}
export async function saveSong(data){const existing=data.id?await get('songs',data.id):null;return save('songs',{...data,createdBy:existing?.createdBy||me(),version:(existing?.version||0)+1,history:[...(existing?.history||[]).slice(-19),{uid:me(),at:Date.now(),status:data.status}],contentOriginal:existing?.contentOriginal||data.contentOriginal||data.contentRaw});}
export async function mySetlists(){return list('setlists',[['createdBy','==',me()]],200);}
export async function songs(){const result=await list('songs',master()?[]:[['status','==','published'],['visibility','==','public']],500);return result.filter(s=>master()||s.status==='published');}
export async function favorite(id){const key='stage-favorites-'+me(),arr=JSON.parse(localStorage.getItem(key)||'[]'),set=new Set(arr);set.has(id)?set.delete(id):set.add(id);localStorage.setItem(key,JSON.stringify([...set]));if(state.mode==='firebase')await sdk.setDoc(sdk.doc(db,'users',me()),{favorites:[...set]},{merge:true});return [...set];}
export function favorites(){return JSON.parse(localStorage.getItem('stage-favorites-'+me())||'[]');}
export async function loadFavorites(){if(state.mode==='firebase'&&state.user){const p=await get('users',me());localStorage.setItem('stage-favorites-'+me(),JSON.stringify(p?.favorites||[]));}}
export async function organizations(){if(state.mode==='demo')return list('organizations');const a=await list('organizations',[['ownerUid','==',me()]]);const ids=JSON.parse(localStorage.getItem('stage-orgs-'+me())||'[]');for(const id of ids){try{const o=await get('organizations',id);if(o&&!a.some(x=>x.id===id))a.push(o);}catch{}}return a;}
export async function selectOrganization(id){const org=await get('organizations',id);if(!org)throw new Error('Equipe não encontrada.');let member;
  if(state.mode==='demo')member=read().members[id]?.[me()];else {const snap=await sdk.getDoc(sdk.doc(db,'organizations',id,'members',me()));member=snap.exists()?snap.data():null;}
  if(org.ownerUid===me())member={...member,role:'owner',area:member?.area||'band'};
  if(!member||member.status==='inactive')throw new Error('Solicite ao administrador da equipe que adicione seu UID.');state.organization=org;state.member=member;
  let ids=JSON.parse(localStorage.getItem('stage-orgs-'+me())||'[]');localStorage.setItem('stage-orgs-'+me(),JSON.stringify([...new Set([...ids,id])]));return org;
}
export async function createOrganization(name){const org=await save('organizations',{name,ownerUid:me(),createdAt:Date.now()});await setMember(org.id,{id:me(),displayName:state.user.displayName,role:'owner',area:'band'});await selectOrganization(org.id);return org;}
export async function members(orgId){if(state.mode==='demo')return clone(Object.values(read().members[orgId]||{}));const s=await sdk.getDocs(sdk.collection(db,'organizations',orgId,'members'));return s.docs.map(x=>({...x.data(),id:x.id}));}
export async function setMember(orgId,m){if(state.mode==='demo')return mutate(d=>{d.members[orgId]??={};d.members[orgId][m.id]=m;});await sdk.setDoc(sdk.doc(db,'organizations',orgId,'members',m.id),{...m,status:'active',updatedAt:sdk.serverTimestamp()});}
export async function removeMember(orgId,id){if(id===state.organization?.ownerUid)throw new Error('O proprietário não pode ser removido.');if(state.mode==='demo')return mutate(d=>{delete d.members[orgId][id];});await sdk.deleteDoc(sdk.doc(db,'organizations',orgId,'members',id));}
export async function createRoom(setlist,rehearsal=false){
  if(!setlist.items.length)throw new Error('Adicione pelo menos um item ao repertório.');
  if(!state.organization)throw new Error('Selecione ou crie uma equipe antes de abrir a sala.');
  if(!['owner','admin','director'].includes(state.member?.role))throw new Error('Sua função não permite dirigir uma sala.');
  const items=[];for(const item of setlist.items){const song=item.songId?await get('songs',item.songId):null;const sharedItem={...item};delete sharedItem.areaNotes;items.push({...sharedItem,song:song?{title:song.title,artist:song.artist,originalKey:song.originalKey,contentRaw:song.contentRaw,overrides:song.overrides||{},timeSignature:song.timeSignature}:null});}
  return save('liveRooms',{id:uid(),name:setlist.name,setlistId:setlist.id,organizationId:state.organization.id,directorUid:me(),status:'live',rehearsal,items,currentIndex:0,currentSongId:items[0].songId||null,nextSongId:items[1]?.songId||null,section:0,liveRevision:0,startedAt:Date.now(),songStartedAt:Date.now(),notice:null});
}
export function watchRoom(id,callback,onError){
  let disposed=false,timer;
  if(state.mode==='demo'){const emit=()=>{if(!disposed)callback(clone(read().liveRooms[id]||null),{connected:navigator.onLine,local:true});};window.addEventListener('storage',emit);window.addEventListener('stage-data',emit);emit();return ()=>{disposed=true;window.removeEventListener('storage',emit);window.removeEventListener('stage-data',emit);};}
  const stop=sdk.onSnapshot(sdk.doc(db,'liveRooms',id),{includeMetadataChanges:true},s=>{if(!disposed)callback(s.exists()?{...s.data(),id:s.id}:null,{connected:!s.metadata.fromCache&&!s.metadata.hasPendingWrites,local:false});},onError);return ()=>{disposed=true;clearTimeout(timer);stop();};
}
export async function command(room,cmd){
  if(!canDirect(room,state.user,state.member))throw new Error('Somente a direção pode enviar este comando.');
  if(state.mode==='firebase'&&!navigator.onLine)throw new Error('Sem conexão. Comandos ao vivo não são enfileirados.');
  if(state.mode==='demo')return mutate(d=>{const live=d.liveRooms[room.id];if(live.liveRevision!==room.liveRevision)throw new Error('A sala mudou. Confira o estado atual e tente novamente.');const next=updateLive(live,cmd);d.liveRooms[room.id]=next;return next;});
  const ref=sdk.doc(db,'liveRooms',room.id), eventRef=sdk.doc(sdk.collection(db,'liveRooms',room.id,'events'));
  await sdk.runTransaction(db,async tx=>{const snap=await tx.get(ref),live=snap.data();if(live.liveRevision!==room.liveRevision)throw new Error('A sala mudou. Confira o estado atual e tente novamente.');const next=updateLive(live,cmd);tx.update(ref,{...next,updatedAt:sdk.serverTimestamp()});tx.set(eventRef,{type:cmd.type,payload:cmd,createdBy:me(),createdAt:sdk.serverTimestamp(),revision:next.liveRevision});});
}
export async function noteList(songId){
  if(state.mode==='demo')return clone(Object.values(read().annotations).filter(n=>n.songId===songId&&(n.uid===me()||n.organizationId===state.organization?.id)&&canReadNote(n,state.user,state.member)));
  const own=await list('annotations',[['uid','==',me()],['songId','==',songId]]);if(!state.organization)return own;
  const vis=['team','area',...(['owner','admin','director'].includes(state.member?.role)?['direction']:[])];
  for(const visibility of vis){const filters=[['organizationId','==',state.organization.id],['songId','==',songId],['visibility','==',visibility]];if(visibility==='area')filters.push(['area','==',state.member.area]);const rows=await list('annotations',filters);for(const r of rows)if(!own.some(x=>x.id===r.id))own.push(r);}
  return own;
}
export async function saveNote(data){return save('annotations',{...data,uid:me(),organizationId:state.organization?.id||'',area:state.member?.area||'band',createdAt:Date.now()});}
export async function deleteNote(id){if(state.mode==='demo')return mutate(d=>{if(d.annotations[id]?.uid!==me())throw new Error('Esta anotação pertence a outra pessoa.');delete d.annotations[id];});await sdk.deleteDoc(sdk.doc(db,'annotations',id));}
export async function presence(roomId,online=true){const p={uid:me(),displayName:state.user.displayName,area:state.member?.area||'band',online,lastSeen:Date.now()};if(state.mode==='demo')return mutate(d=>{d.participants[roomId]??={};d.participants[roomId][me()]=p;});await sdk.setDoc(sdk.doc(db,'liveRooms',roomId,'participants',me()),p);}
export function watchParticipants(roomId,cb,onError){if(state.mode==='demo'){const emit=()=>cb(Object.values(read().participants[roomId]||{}));window.addEventListener('storage',emit);window.addEventListener('stage-data',emit);emit();return ()=>{window.removeEventListener('storage',emit);window.removeEventListener('stage-data',emit);};}return sdk.onSnapshot(sdk.collection(db,'liveRooms',roomId,'participants'),s=>cb(s.docs.map(x=>x.data())),onError);}
export async function sendMessage(roomId,{text='',target='all',priority='normal',duration=15,voicePath=null}){const value={id:uid(),uid:me(),displayName:state.user.displayName,text,target,priority,createdAt:Date.now(),expiresAt:Date.now()+Number(duration)*1000,voicePath};if(state.mode==='demo')return mutate(d=>{d.messages[roomId]??={};d.messages[roomId][value.id]=value;});await sdk.setDoc(sdk.doc(db,'liveRooms',roomId,'messages',value.id),value);}
export function watchMessages(roomId,cb,onError){
  const targets=['all',state.member?.area||'band'];
  if(state.mode==='demo'){const emit=()=>cb(Object.values(read().messages[roomId]||{}).filter(m=>targets.includes(m.target)).sort((a,b)=>a.createdAt-b.createdAt).slice(-40));window.addEventListener('storage',emit);window.addEventListener('stage-data',emit);emit();return ()=>{window.removeEventListener('storage',emit);window.removeEventListener('stage-data',emit);};}
  const q=sdk.query(sdk.collection(db,'liveRooms',roomId,'messages'),sdk.where('target','in',targets),sdk.orderBy('createdAt','desc'),sdk.limit(40));return sdk.onSnapshot(q,s=>cb(s.docs.map(x=>x.data()).reverse()),onError);
}
export async function uploadVoice(roomId,blob,target){
  if(blob.size>2*1024*1024)throw new Error('Áudio maior que 2 MB. Grave uma mensagem mais curta.');
  const path=`voice/${roomId}/${target}/${me()}/${uid()}`;
  if(state.mode==='demo'){await new Promise((resolve,reject)=>{const req=indexedDB.open('stage-voice',1);req.onupgradeneeded=()=>req.result.createObjectStore('clips');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const d=req.result,tx=d.transaction('clips','readwrite');tx.objectStore('clips').put(blob,path);tx.oncomplete=()=>{d.close();resolve();};tx.onerror=()=>reject(tx.error);};});return path;}
  await sdk.uploadBytes(sdk.ref(storage,path),blob,{contentType:blob.type});return path;
}
export async function voiceBlob(path){if(state.mode==='demo')return new Promise((resolve,reject)=>{const req=indexedDB.open('stage-voice',1);req.onerror=()=>reject(req.error);req.onsuccess=()=>{const d=req.result;if(!d.objectStoreNames.contains('clips'))return reject(new Error('Áudio não disponível neste navegador.'));const q=d.transaction('clips').objectStore('clips').get(path);q.onsuccess=()=>{d.close();q.result?resolve(q.result):reject(new Error('Áudio local não encontrado.'));};q.onerror=()=>reject(q.error);};});return sdk.getBlob(sdk.ref(storage,path));}
export function backup(){if(state.mode!=='demo')throw new Error('Exportação disponível para os dados locais da demonstração.');return JSON.stringify({schema:1,exportedAt:new Date().toISOString(),data:read()},null,2);}

export async function createInvitation(area='band'){
  const org=state.organization;
  if(!org||!['owner','admin'].includes(state.member?.role))throw new Error('Somente administradores podem convidar novos membros.');
  return save('invitations',{organizationId:org.id,organizationName:org.name,area,role:'member',createdBy:me(),active:true,expiresAt:Date.now()+7*24*3600*1000});
}
export async function acceptInvitation(id){
  const invite=await get('invitations',id);
  if(!invite||!invite.active||invite.expiresAt<=Date.now())throw new Error('Convite expirado ou desativado. Solicite um novo link.');
  try{await selectOrganization(invite.organizationId);return invite;}catch{}
  const m={id:me(),displayName:state.user.displayName.slice(0,100),role:'member',area:invite.area,status:'active',inviteId:id};
  if(state.mode==='demo')await mutate(d=>{d.members[invite.organizationId]??={};d.members[invite.organizationId][me()]=m;});
  else await sdk.setDoc(sdk.doc(db,'organizations',invite.organizationId,'members',me()),{...m,updatedAt:sdk.serverTimestamp()});
  await selectOrganization(invite.organizationId);return invite;
}
