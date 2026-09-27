import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPrompt, validMessage, trustedMessage} from '../packages/core/src/core.js';
import {imageTarget, imageIssues, buildImagePrompt, parseMode, defaults as imageDefaults} from '../packages/core/src/image-core.js';
import {presentationDefaults, buildPresentationPrompt, palettePresets, cleanStyle, contrastRatio, presentationIssues} from '../packages/core/src/presentation-core.js';
import {styleProfiles} from '../packages/core/src/style-presets.js';

test('generic protocol accepts valid text insertion',()=>{
  assert.equal(validMessage({type:'prompt-constructor.prompt.insert',version:1,requestId:'1',prompt:'hello',mode:'text',renderTarget:'text'}),true);
});

test('protocol rejects unknown namespace, target mismatch and oversized prompt',()=>{
  assert.equal(validMessage({type:'legacy.prompt.insert',version:1,requestId:'1',prompt:'hello'}),false);
  assert.equal(validMessage({type:'prompt-constructor.prompt.insert',version:1,requestId:'1',prompt:'hello',mode:'text',renderTarget:'image'}),false);
  assert.equal(validMessage({type:'prompt-constructor.prompt.insert',version:1,requestId:'1',prompt:'x'.repeat(50001)}),false);
});

test('trustedMessage requires exact source and origin',()=>{
  const source={};
  assert.equal(trustedMessage({source,origin:'https://example.test',data:{type:'prompt-constructor.prompt.insert',version:1,requestId:'1',prompt:'hello'}},source,'https://example.test'),true);
  assert.equal(trustedMessage({source:{},origin:'https://example.test',data:{type:'prompt-constructor.prompt.insert',version:1,requestId:'1',prompt:'hello'}},source,'https://example.test'),false);
});

test('text prompt is generated with neutral document style',()=>{
  const parts=buildPrompt({role:'Аналитик',task:'Сравни варианты',goal:'',context:'',scenario:'analysis',format:'Таблица',audience:'Руководитель',tone:'Деловой',detail:'Средняя',freedom:'balanced',facts:true,missing:'ask',questions:false,limits:'',sample:'',documentType:'',documentStyle:{palette:'business',fonts:'office'}});
  assert.ok(parts.some(([h])=>h==='Задача'));
  assert.ok(parts.flat().join(' ').includes('Деловая синяя'));
});

test('parseMode falls back to text',()=>{
  assert.equal(parseMode('presentation'),'presentation');
  assert.equal(parseMode('unknown'),'text');
});

test('exact data visual targets SVG',()=>{
  assert.equal(imageTarget({...imageDefaults,type:'chart',precision:'exact'}),'svg');
  assert.equal(imageTarget({...imageDefaults,type:'cover',precision:'exact'}),'image');
});

test('image validation requires task or data',()=>{
  assert.ok(imageIssues({...imageDefaults,subject:'',data:'',type:'infographic'}).length>0);
  assert.equal(imageIssues({...imageDefaults,subject:'',data:'A;1',type:'chart',precision:'exact'}).length,0);
});

test('image prompt includes supplied data without inventing transport',()=>{
  const parts=buildImagePrompt({...imageDefaults,type:'chart',precision:'exact',subject:'Quarterly totals',data:'Q1;10\nQ2;12'});
  const text=parts.flat().join('\n');
  assert.ok(text.includes('Q1;10'));
  assert.ok(text.includes('SVG'));
});

test('presentation defaults use neutral built-in presets',()=>{
  assert.equal(presentationDefaults.palette,'business');
  assert.equal(presentationDefaults.fonts,'office');
  assert.ok(styleProfiles.business);
  assert.ok(palettePresets.some(p=>p.id==='minimal'));
});

test('presentation validation catches invalid hex and numeric fields',()=>{
  const errors=presentationIssues({...presentationDefaults,topic:'Review',background:'bad',slideCount:'0'});
  assert.ok(errors.background);
  assert.ok(errors.slideCount);
});

test('cleanStyle keeps exact built-in and converts modified preset to custom',()=>{
  const exact=cleanStyle({palette:'business',background:'#FFFFFF',foreground:'#172B4D',accent:'#315DA8',secondary:'#E8EFF8',fonts:'office',headingFont:'Arial',bodyFont:'Arial'});
  assert.equal(exact.palette,'business');
  const modified=cleanStyle({...exact,accent:'#123456'});
  assert.equal(modified.palette,'custom');
});

test('contrast ratio recognizes high-contrast black on white',()=>{
  assert.ok(contrastRatio('#FFFFFF','#000000')>20);
});

test('presentation prompt includes generic palette rules',()=>{
  const parts=buildPresentationPrompt({...presentationDefaults,topic:'Quarterly review'});
  assert.ok(parts.some(([h])=>h==='Правила выбранной палитры'));
  assert.ok(parts.some(([h])=>h==='Примечание к шрифтовому пресету'));
});

test('presentation UI has no removed brand-catalog references', async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('../apps/standalone/presentation-ui.js', import.meta.url),'utf8');
  assert.equal(/\bbrands\s*\[/.test(source),false);
});
