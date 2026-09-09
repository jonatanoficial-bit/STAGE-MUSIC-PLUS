export const CHROMATIC = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const ROOT_KEYS=['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];
export const KEYS = [...ROOT_KEYS,...ROOT_KEYS.map(k=>k+'m')];
const SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLATS = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const NOTES = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const chordRE = /^([A-G](?:#|b)?)(?:(m|min|maj|M|dim|aug|sus|add|°|ø|\+)?((?:\d+|M|maj|min|m|sus|add|dim|aug|[#b]\d+|\+|°|ø|\((?:[#b]?\d+(?:[,/][#b]?\d+)*)\))*)?)(?:\/([A-G](?:#|b)?))?$/;
export const mod = n => ((n % 12) + 12) % 12;
export function pitch(note) {
  const m = /^([A-G])([#b]?)/.exec(note || '');
  if (!m) throw new Error('Tom inválido');
  return mod(NOTES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
}
export function parseChord(token) {
  const clean = token.replaceAll('♯','#').replaceAll('♭','b');
  const m = chordRE.exec(clean);
  if (!m || !m[0]) return null;
  const suffix = clean.slice(m[1].length, m[4] ? -m[4].length - 1 : undefined);
  // Limit to conventional qualities/extensions; do not accept words beginning in A–G.
  if (/[A-Za-z]/.test(suffix.replace(/min|maj|dim|aug|sus|add|m|M|b(?=\d)/g,''))) return null;
  return {root:m[1], suffix, bass:m[4] || null};
}
export function transposeChord(token, semitones = 0, preferFlats = false) {
  const c = parseChord(token);
  if (!c) return token;
  if (mod(semitones) === 0) return token;
  const names = preferFlats ? FLATS : SHARPS;
  return names[mod(pitch(c.root) + semitones)] + c.suffix + (c.bass ? '/' + names[mod(pitch(c.bass) + semitones)] : '');
}
export function transposeKey(key, n) { return transposeChord(key,n,/[b]|^(F|Dm|Gm|Cm)$/.test(key)); }
export function preferFlats(key) { return key.includes('b') || ['F','Dm','Gm','Cm','Fm'].includes(key); }
export function keyOffset(original, target) { return mod(pitch(target) - pitch(original)); }
export function capoShapes(original, target, capo) { return keyOffset(original,target) - Number(capo || 0); }
export function capoSuggestions(target) {
  return Array.from({length:8},(_,capo)=>({capo,key:transposeChord(target,-capo,false)})).filter(x=>['C','G','D','A','E','Am','Em','Dm'].includes(x.key));
}
export function parseSheet(raw, overrides = {}) {
  const metadata = {};
  const lines = String(raw).replace(/\r\n?/g,'\n').split('\n').map((text,index) => {
    const meta = /^(Título|Titulo|Title|Artista|Artist|Tom|Key|Capo|Afinação|Afinacao|Compasso|BPM):\s*(.+)$/i.exec(text.trim());
    const tokens = [...text.matchAll(/\S+/g)];
    const meaningful = tokens.filter(t=>!/^\|:?|^:?\|$|^\d+x$|^[%:·-]+$/.test(t[0]));
    const chordLine = meaningful.length > 0 && meaningful.every(t=>parseChord(t[0]));
    let type = !text.trim() ? 'blank' : meta ? 'meta' : /^\s*\[.*\]\s*$/.test(text) || /^(Intro|Verso|Refrão|Refrão final|Ponte|Final|Solo|Pré-coro|Interlúdio)(\s+\d+)?\s*:?(?:\s*\(\d+x\))?$/i.test(text.trim()) ? 'section' : chordLine ? 'chords' : 'lyrics';
    if (meta) metadata[meta[1].toLowerCase()] = meta[2];
    if (['lyrics','chords','section'].includes(overrides[index])) type = overrides[index];
    return {text,index,type,tokens};
  });
  return {raw, metadata, lines, sections:lines.filter(l=>l.type==='section').map(l=>({id:l.index,title:l.text.replace(/^\[|\]$/g,'')}))};
}
export function transposeSheet(raw,n,flats=false,overrides={}) {
  return parseSheet(raw,overrides).lines.map(l => l.type === 'chords' ? l.text.replace(/\S+/g,t=>transposeChord(t,n,flats)) : l.text).join('\n');
}
/** Basic piano voicing, preserving slash bass. Advanced altered extensions are included. */
export function chordNotes(token) {
  const c=parseChord(token); if(!c)return [];
  let s=c.suffix, intervals=[0, /^m(?!aj)|^min|dim|°|ø/.test(s)?3:4, /dim|°|ø|b5/.test(s)?6:/aug|\+|#5/.test(s)?8:7];
  if(/sus2/.test(s))intervals[1]=2; if(/sus4/.test(s))intervals[1]=5;
  if(/^5$/.test(s))intervals=[0,7];
  if(/7M|maj7|M7/.test(s))intervals.push(11); else if(/7|9|11|13|ø/.test(s)&&!/^add/.test(s))intervals.push(/dim7|°7/.test(s)?9:10);
  if(/6/.test(s))intervals.push(9);
  for(const [ext,n] of [['9',2],['11',5],['13',9]])if(s.includes(ext))intervals.push(n+(s.includes('#'+ext)?1:s.includes('b'+ext)?-1:0));
  return [...new Set([...(c.bass?[pitch(c.bass)]:[]),...intervals.map(i=>mod(pitch(c.root)+i))])];
}
