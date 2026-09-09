import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { demoSongs } from '../../js/core/demo.js';
if(!process.argv.includes('--confirm-seed'))throw new Error('Para importar as quatro cifras originais de demonstração: node functions/tools/seed.mjs --confirm-seed');
initializeApp({credential:applicationDefault()});const db=getFirestore();
for(const song of demoSongs){const ref=db.doc('songs/'+song.id);await db.runTransaction(async tx=>{const existing=await tx.get(ref);if(existing.exists)return;tx.create(ref,{...song,createdBy:'seed-admin',updatedAt:Date.now()});});}
await db.collection('auditLogs').add({actorUid:'server-admin',action:'seed-original-demo-songs',timestamp:FieldValue.serverTimestamp(),entity:'songs',entityId:'demo',metadata:{count:demoSongs.length}});
console.log('Cifras de demonstração importadas; documentos existentes preservados.');
