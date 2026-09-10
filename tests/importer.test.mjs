import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {analyzeImport,extractClipboard} from '../js/core/importer.js';
test('Pasted title, artist and sharp key become fields, spacing remains',()=>{
 const text='Minha canção\r\nMinha banda\r\nTom: C#\r\nCapotraste: 2\r\n\r\n[Intro] C#  G#\r\nC#        A#m\r\nUma letra original';
 const r=analyzeImport(text);assert.equal(r.metadata.originalKey,'C#');assert.equal(r.metadata.title,'Minha canção');assert.equal(r.metadata.artist,'Minha banda');assert.equal(r.metadata.capo,2);assert.equal(r.contentOriginal,text);assert.ok(r.contentRaw.includes('C#        A#m'));assert.ok(r.contentRaw.startsWith('[Intro]\nC#  G#'));assert.equal(r.stats.chordLines,2);
});
test('Explicit metadata, Unicode flats and minor keys',()=>{const r=analyzeImport('Título: Canção\nArtista: Banda\nTom: B♭m\nBPM: 120\nCompasso: 6/8\n\nBbm F\nNossa letra');assert.equal(r.metadata.originalKey,'Bbm');assert.equal(r.metadata.bpm,120);assert.equal(r.metadata.timeSignature,'6/8');assert.equal(r.metadata.title,'Canção');});
test('Lyrics-only content remains intact with review warning',()=>{const text='Nossa voz vai além\nO caminho vai abrir\nMais um dia vai nascer';const r=analyzeImport(text);assert.equal(r.contentRaw,text);assert.ok(r.warnings.some(w=>w.includes('Não encontrei')));});
test('Ambiguous single letters receive review warning',()=>{assert.ok(analyzeImport('[Verso]\nA\nNossa letra').warnings.some(w=>w.includes('única letra')));});
test('Clipboard extracts preformatted music from inert HTML',()=>{const dom=new JSDOM('');const html='<h1>Minha canção</h1><h2>Minha banda</h2><pre>C    G\nUma letra</pre><script>throw Error("must not run")</script><img src=x onerror="alert(1)">';const r=extractClipboard({text:'full page',html},dom.window.document);assert.equal(r.text,'C    G\nUma letra');assert.equal(r.title,'Minha canção');assert.equal(dom.window.document.querySelector('img'),null);dom.window.close();});
