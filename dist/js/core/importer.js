import { parseSheet, parseChord, KEYS } from './music.js';
const metadataPatterns = {
  title: /^(?:t[ií]tulo|title|m[uú]sica)\s*:\s*(.+)$/i,
  artist: /^(?:artista|artist|int[eé]rprete|banda)\s*:\s*(.+)$/i,
  originalKey: /^(?:tom|tonalidade|key)\s*:\s*([A-G](?:#|b|♯|♭)?m?)(?=\s|$|[),])/i,
  bpm: /^(?:bpm|andamento)\s*:\s*(\d{2,3})\b/i,
  timeSignature: /^(?:compasso|time signature)\s*:\s*(\d{1,2}\/\d{1,2})/i,
  capo: /^(?:capotraste|capo)\s*(?::|na|na casa)?\s*(\d{1,2})/i,
  tuning: /^(?:afina[çc][aã]o|tuning)\s*:\s*(.+)$/i
};
const normalize = text => String(text||'').replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ').replace(/[\u200b\ufeff]/g,'');
const sectionWithChords=/^\s*(\[[^\]]{1,70}\])\s+(.+)$/;
const onlyChords=s=>{const tokens=s.trim().split(/\s+/).filter(x=>!/^\|[:|]*$|^\d+x$/.test(x));return tokens.length>0&&tokens.every(x=>parseChord(x));};
/** Analyze only user-pasted text. Never downloads a song or changes lyric words. */
export function analyzeImport(input,{title='',artist='',sourceUrl=''}={}) {
  const original=String(input||''), normalized=normalize(original), lines=normalized.split('\n');
  const metadata={};const metadataIndexes=new Set();let warnings=[];
  for(let i=0;i<Math.min(lines.length,25);i++)for(const [name,re]of Object.entries(metadataPatterns)){
    const match=re.exec(lines[i].trim());if(match){metadata[name]=['bpm','capo'].includes(name)?Number(match[1]):match[1].trim();metadataIndexes.add(i);}
  }
  if(metadata.originalKey){metadata.originalKey=metadata.originalKey.replace('♯','#').replace('♭','b');if(!KEYS.includes(metadata.originalKey)){delete metadata.originalKey;warnings.push('Confira o tom original.');}}
  if(metadata.bpm&&!(metadata.bpm>=20&&metadata.bpm<=300))delete metadata.bpm;
  if(metadata.capo>12)delete metadata.capo;
  const parsed=parseSheet(normalized);
  const firstMusic=parsed.lines.findIndex(l=>l.type==='chords'||l.type==='section'||sectionWithChords.test(l.text));
  const headerLines=lines.slice(0,firstMusic<0?Math.min(8,lines.length):firstMusic).map((text,index)=>({text:text.trim(),index})).filter(l=>l.text&&!metadataIndexes.has(l.index));
  let headerIndexes=[];
  const pageTitle=headerLines.find(l=>/\s[-–—]\sCifra Club\s*$/i.test(l.text));
  if(pageTitle){const parts=pageTitle.text.replace(/\s[-–—]\sCifra Club\s*$/i,'').split(/\s[-–—]\s/);if(parts.length===2){metadata.title??=parts[0];metadata.artist??=parts[1];headerIndexes.push(pageTitle.index);}}
  if(!metadata.title&&title)metadata.title=title.trim();if(!metadata.artist&&artist)metadata.artist=artist.trim();
  if(headerLines.length===2&&!pageTitle&&firstMusic>=0&&headerLines.every(x=>x.text.length<160&&!/^https?:|[{}<>]/i.test(x.text))){metadata.title??=headerLines[0].text;metadata.artist??=headerLines[1].text;headerIndexes=headerLines.map(x=>x.index);warnings.push('Título e artista foram sugeridos a partir do cabeçalho; confira antes de salvar.');}
  let removed=[];const body=lines.flatMap((line,index)=>{
    if(metadataIndexes.has(index)||headerIndexes.includes(index)){removed.push(line);return [];}
    const m=sectionWithChords.exec(line);if(m&&onlyChords(m[2]))return [m[1],m[2]];
    return [line];
  }).join('\n').replace(/^\n+|\n+$/g,'');
  const analysis=parseSheet(body),chordLines=analysis.lines.filter(x=>x.type==='chords'),ambiguous=chordLines.filter(l=>l.text.trim().split(/\s+/).length===1&&/^[A-G]$/.test(l.text.trim()));
  if(ambiguous.length)warnings.push(`${ambiguous.length} linha(s) com uma única letra podem ser letra ou acorde. Revise a classificação.`);
  if(!chordLines.length)warnings.push('Não encontrei linhas de acordes. Confira se a cifra completa foi selecionada.');
  if(!metadata.title)warnings.push('Preencha o título.');if(!metadata.artist)warnings.push('Preencha o artista.');
  return {contentOriginal:original,contentRaw:body,metadata,sourceUrl,removedHeader:removed.join('\n'),warnings,stats:{chordLines:chordLines.length,chords:chordLines.reduce((n,l)=>n+l.tokens.filter(t=>parseChord(t[0])).length,0),sections:analysis.sections.length,lyrics:analysis.lines.filter(l=>l.type==='lyrics').length}};
}
/** Clipboard HTML is parsed in an inert template and never inserted into the page. */
export function extractClipboard({text='',html=''},documentRef){
  if(!html||!documentRef)return {text};
  const template=documentRef.createElement('template');template.innerHTML=html;
  const root=template.content;const pre=[...root.querySelectorAll('pre')];
  const title=root.querySelector('h1')?.textContent.trim()||'';
  const artist=root.querySelector('h2')?.textContent.trim()||'';
  return {text:pre.length?pre.map(x=>x.textContent).join('\n'):text,title,artist};
}
