export const AREAS = {band:'Banda',vocal:'Vocal',projection:'Projeção',lighting:'Iluminação',audio:'Áudio',production:'Produção'};
export const COMMANDS = ['Atenção','Crescer um pouco','Forte agora','Mais uma vez','Última vez','Acabar','Repetir refrão','Estender','Cortar','Segurar','Voltar intro','Sem intro','Com intro','Modulação','Entrar direto'];
export function canDirect(room, user, member) { return !!user && (room.directorUid === user.uid || ['owner','admin','director'].includes(member?.role)); }
export function canReadNote(note,user,member) { return !!user && (note.uid===user.uid || (note.visibility==='area'&&member?.area===note.area) || (note.visibility==='team'&&!!member) || (note.visibility==='direction'&&['owner','admin','director'].includes(member?.role))); }
export function updateLive(room, command, now = Date.now()) {
  if (room.status==='ended') throw new Error('Esta sala já foi encerrada. Abra uma nova sala.');
  const r=structuredClone(room), length=r.items.length;
  if (!length) throw new Error('O repertório está vazio.');
  if(command.type==='next')r.currentIndex=Math.min(length-1,r.currentIndex+1);
  if(command.type==='previous')r.currentIndex=Math.max(0,r.currentIndex-1);
  if(command.type==='jump')r.currentIndex=Math.max(0,Math.min(length-1,Number(command.index)));
  if(command.type==='pause')r.status=r.status==='paused'?'live':'paused';
  if(command.type==='end')r.status='ended';
  if(command.type==='key') { r.previousKey=r.items[r.currentIndex].key; r.items[r.currentIndex].key=command.key; r.notice={text:`Tom alterado: ${r.previousKey} → ${command.key}`,expiresAt:now+12000}; }
  if(command.type==='section')r.section=Number(command.section);
  if(command.type==='notice')r.notice={text:command.text,expiresAt:now+Number(command.duration||12)*1000};
  if(command.type==='reorder') {
    const current=r.items[r.currentIndex].id;
    if(command.from<0||command.to<0||command.from>=length||command.to>=length)throw new Error('Posição inválida');
    const [item]=r.items.splice(command.from,1); r.items.splice(command.to,0,item); r.currentIndex=r.items.findIndex(x=>x.id===current);
  }
  if(r.currentIndex!==room.currentIndex){r.section=0;r.songStartedAt=now;r.previousKey=null;}
  r.currentSongId=r.items[r.currentIndex].songId||null;
  r.nextSongId=r.items[r.currentIndex+1]?.songId||null;
  r.liveRevision=(room.liveRevision||0)+1; r.updatedAt=now;
  return r;
}
