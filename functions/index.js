import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
initializeApp();
const db=getFirestore();
/** Event IDs make retries idempotent. Only the trusted backend can write auditLogs. */
async function audit(event,entity,entityId,actorUid,metadata){
  const id=Buffer.from(event.id).toString('base64url');
  try{await db.collection('auditLogs').doc(id).create({entity,entityId,actorUid:actorUid||null,action:event.data.after.exists?(event.data.before.exists?'updated':'created'):'deleted',timestamp:FieldValue.serverTimestamp(),metadata});}
  catch(error){if(error.code!==6&&error.code!=='already-exists')throw error;}
}
export const auditSong=onDocumentWritten({document:'songs/{songId}',region:'southamerica-east1'},async event=>{const s=event.data.after.data()||event.data.before.data();await audit(event,'song',event.params.songId,s.history?.at(-1)?.uid||s.createdBy,{title:s.title||'',status:s.status||'',version:s.version||0});});
export const auditMembership=onDocumentWritten({document:'organizations/{orgId}/members/{uid}',region:'southamerica-east1'},async event=>{const before=event.data.before.data()||{},after=event.data.after.data()||{};await audit(event,'membership',event.params.orgId+'/'+event.params.uid,null,{previousRole:before.role||null,newRole:after.role||null,area:after.area||null,note:'Actor identity requires Firestore auth-context audit or a callable administration endpoint.'});});
export const auditRoom=onDocumentWritten({document:'liveRooms/{roomId}',region:'southamerica-east1'},async event=>{const before=event.data.before.data(),after=event.data.after.data();if(before&&after&&before.status===after.status)return;const r=after||before;await audit(event,'liveRoom',event.params.roomId,r.directorUid,{status:r.status,organizationId:r.organizationId});});
