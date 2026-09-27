import {confirmAction} from '../../packages/embed/src/confirm.js';
import {getPresentationExample} from './presentation-examples.js';
import {palettePresets,fontPresets,presentationDefaults,styleKeys,cleanStyle,contrastRatio,presentationIssues} from '../../packages/core/src/presentation-core.js';
const storageKey='prompt-constructor-presentation-styles-v1';
export function mountPresentation(onChange,notify){
  const panel=document.createElement('div');panel.className='editor';panel.id='presentation-editor';panel.hidden=true;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-presentation');
  const fields={};
  function section(title,parent=panel){const h=document.createElement('h2');h.className='presentation-section';h.textContent=title;parent.append(h);return parent;}
  function field(key,label,options={},parent=panel){
    const wrap=document.createElement('div');wrap.className='presentation-field';
    const lab=document.createElement('label');lab.htmlFor='pr-'+key;lab.textContent=label;
    const el=document.createElement(options.values?'select':options.rows?'textarea':'input');el.id='pr-'+key;
    if(options.values)for(const value of options.values){const o=document.createElement('option');o.value=typeof value==='string'?value:value.id;o.textContent=typeof value==='string'?value:value.name;el.append(o);}
    else{el.maxLength=options.max||2000;if(options.rows){el.rows=options.rows;el.style.resize='none';}else el.type='text';if(options.numeric)el.inputMode='numeric';}
    el.value=presentationDefaults[key]??'';el.placeholder=options.placeholder||'';
    const error=document.createElement('p');error.id=el.id+'-error';error.className='field-error';el.setAttribute('aria-describedby',error.id);
    wrap.append(lab,el,error);parent.append(wrap);fields[key]=el;el.addEventListener('input',()=>{update();onChange();});return wrap;
  }
  function disclosure(title){const details=document.createElement('details');details.className='disclosure';const summary=document.createElement('summary');summary.textContent=title;const body=document.createElement('div');body.className='disclosure-body';details.append(summary,body);panel.append(details);return body;}
  section('О чём презентация?');
  const example=document.createElement('button');example.id='presentation-example';example.type='button';example.className='text-button';example.textContent='Заполнить пример';panel.append(example);
  const exampleNote=document.createElement('p');exampleNote.className='field-note';exampleNote.textContent='Учебный пример по выбранному типу презентации. Палитра и шрифты сохранятся.';panel.append(exampleNote);
  example.onclick=async()=>{
    example.disabled=true;
    try {
      const sample=getPresentationExample(fields.scenario.value);
      const occupied=Object.keys(sample).some(k=>fields[k].value.trim()&&fields[k].value!==(presentationDefaults[k]??''));
      if(occupied&&!await confirmAction('Заменить тему, цель, аудиторию, материалы, структуру и объём учебным примером? Оформление сохранится.'))return;
      for(const [k,v] of Object.entries(sample))fields[k].value=v;
      update();onChange();fields.topic.focus();notify('Пример заполнен. Данные условные.');
    } finally {example.disabled=false;}
  };
  field('topic','Тема и задача *',{rows:3,max:6000,placeholder:'Например: результаты продаж и план на следующий квартал'});
  field('goal','Что аудитория должна понять или сделать?',{placeholder:'Например: согласовать запуск следующего этапа'});
  field('audience','Для кого',{max:500});
  field('scenario','Тип презентации',{values:['Управленческая','Отчётная / аналитическая','Обучающая','Проектная','Коммерческая','Выступление / конференция','Подобрать по задаче']});
  const grid=document.createElement('div');grid.className='two-col';panel.append(grid);
  field('slideCount','Количество слайдов',{numeric:true,max:3,placeholder:'Автоматически'},grid);
  field('duration','Выступление, минут',{numeric:true,max:3,placeholder:'Не задано'},grid);
  field('ratio','Формат слайдов',{values:['16:9','4:3','Подобрать под назначение']},grid);
  field('language','Язык',{values:['Русский','Английский','На двух языках: русский и английский']},grid);
  section('Оформление');
  field('palette','Пресет палитры',{values:palettePresets});
  const colors=document.createElement('div');colors.className='two-col';panel.append(colors);
  for(const [k,l] of [['background','Фон · HEX'],['foreground','Текст · HEX'],['accent','Акцент · HEX'],['secondary','Поверхность · HEX']])field(k,l,{max:7},colors);
  fields.palette.addEventListener('change',()=>{const p=palettePresets.find(p=>p.id===fields.palette.value);if(p?.colors)['background','foreground','accent','secondary'].forEach((k,i)=>fields[k].value=p.colors[i]);update();onChange();});
  for(const k of ['background','foreground','accent','secondary'])fields[k].addEventListener('input',()=>{fields.palette.value='custom';update();onChange();});
  const swatches=document.createElement('div');swatches.className='palette-swatches';swatches.setAttribute('aria-label','Выбранные цвета');panel.append(swatches);
  const contrast=document.createElement('p');contrast.className='field-note';contrast.setAttribute('role','status');panel.append(contrast);
  field('fonts','Пресет шрифтов',{values:fontPresets});
  const fonts=document.createElement('div');fonts.className='two-col';panel.append(fonts);
  field('headingFont','Заголовки',{max:100},fonts);field('bodyFont','Основной текст',{max:100},fonts);
  fields.fonts.addEventListener('change',()=>{const p=fontPresets.find(p=>p.id===fields.fonts.value);if(p?.heading){fields.headingFont.value=p.heading;fields.bodyFont.value=p.body;}update();onChange();});
  for(const k of ['headingFont','bodyFont'])fields[k].addEventListener('input',()=>{fields.fonts.value='custom';update();onChange();});
  const saved=disclosure('Мои пресеты оформления');
  const name=document.createElement('input');name.id='preset-name';name.maxLength=60;name.placeholder='Например: Отчёт для руководства';
  const nameLabel=document.createElement('label');nameLabel.htmlFor=name.id;nameLabel.textContent='Название пресета';saved.append(nameLabel,name);
  const save=document.createElement('button');save.type='button';save.className='text-button';save.textContent='Сохранить палитру и шрифты';saved.append(save);
  const list=document.createElement('div');saved.append(list);
  const localNote=document.createElement('p');localNote.className='field-note';localNote.textContent='Только на этом устройстве и домене. Содержание презентации не сохраняется. До 20 пресетов.';saved.append(localNote);
  let presets=[];
  try{const stored=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(stored))presets=stored.filter(x=>typeof x?.name==='string'&&x.name.length<=60&&cleanStyle(x.style)).slice(0,20);}catch{}
  function persist(next){try{localStorage.setItem(storageKey,JSON.stringify(next));presets=next;drawPresets();return true;}catch{notify('Не удалось сохранить пресеты: хранилище браузера недоступно.');return false;}}
  function drawPresets(){list.replaceChildren();for(const p of presets){const row=document.createElement('div');row.className='preset-row';const apply=document.createElement('button');apply.className='text-button';apply.textContent=p.name;apply.onclick=()=>{const s=cleanStyle(p.style);if(!s)return;for(const k of styleKeys)fields[k].value=s[k];update();onChange();notify('Оформление применено');};const del=document.createElement('button');del.className='text-button';del.textContent='Удалить';del.setAttribute('aria-label','Удалить пресет '+p.name);del.onclick=()=>{if(persist(presets.filter(x=>x!==p)))notify('Пресет удалён');};row.append(apply,del);list.append(row);}}
  save.onclick=()=>{const title=name.value.trim();const style=cleanStyle(state());if(!title){notify('Введите название пресета');name.focus();return;}if(!style){notify('Проверьте цвета и названия шрифтов');return;}if(presets.some(p=>p.name===title)){notify('Такое имя уже есть. Укажите другое название.');name.focus();return;}if(presets.length>=20){notify('Удалите ненужный пресет: доступно до 20.');return;}if(persist([...presets,{name:title,style}])){name.value='';notify('Пресет сохранён');}};drawPresets();
  const content=disclosure('Материалы и структура');
  field('sources','Исходные данные и источники',{rows:4,max:12000,placeholder:'Тезисы, показатели, ссылки и описание материалов, доступных целевому приложению'},content);
  field('structure','Обязательные разделы или план',{rows:3,max:4000,placeholder:'Необязательно — можно доверить структуру ИИ'},content);
  field('brand','Требования брендбука',{rows:2,max:2000,placeholder:'Логотип и брендбук передаются через целевое приложение'},content);
  const advanced=disclosure('Подача и результат');
  field('workflow','Порядок работы',{values:['Сначала план, затем слайды после согласования','Сразу подготовить презентацию','Только послайдовая спецификация']},advanced);
  field('density','Подробность',{values:['Ключевые тезисы + заметки докладчика','Краткие слайды для выступления','Самодостаточные слайды для чтения']},advanced);
  field('visuals','Иллюстрации и диаграммы',{values:['Подобрать по содержанию','Больше схем и точных диаграмм','Фотографии и короткие тезисы','Минимум иллюстраций']},advanced);
  field('freedom','Свобода оформления',{values:[{id:'balanced',name:'Подобрать незаданные параметры'},{id:'creative',name:'Выразительные визуальные решения'},{id:'strict',name:'Строго по моим требованиям'}]},advanced);
  field('missing','Если не хватает данных',{values:[{id:'ask',name:'Уточнить только необходимое'},{id:'draft',name:'Черновик с пометками [уточнить]'}]},advanced);
  field('output','Результат',{values:['PPTX — редактируемая презентация','PPTX + PDF','Google Slides — совместимый PPTX','PDF','Послайдовая спецификация']},advanced);
  field('requirements','Дополнительные требования',{rows:2,max:3000},advanced);
  function state(){return Object.fromEntries(Object.entries(fields).map(([k,el])=>[k,el.value]));}
  function update(){
    const s=state();colors.hidden=s.palette==='auto';fonts.hidden=s.fonts==='auto';swatches.replaceChildren();fields.output.disabled=s.workflow==='Только послайдовая спецификация';
    if(s.palette!=='auto')for(const [key,label] of [['background','Фон'],['foreground','Текст'],['accent','Акцент'],['secondary','Поверхность']]){const span=document.createElement('span');const chip=document.createElement('i');if(/^#[0-9a-f]{6}$/i.test(s[key]))chip.style.backgroundColor=s[key];span.append(chip,document.createTextNode(label+' '+s[key]));swatches.append(span);}
    const ratio=contrastRatio(s.background,s.foreground);contrast.textContent=s.palette==='auto'?'Цвета подберёт ИИ по теме презентации.':ratio?`Контраст текста и фона: ${ratio.toFixed(1)}:1.${ratio<4.5?' Низкий для обычного текста: измените цвета или задайте коррекцию.':' Акценты и диаграммы нужно проверить отдельно.'}`:'Проверьте HEX-коды цветов.';
    const errors=presentationIssues(s);for(const [k,el] of Object.entries(fields)){document.getElementById(el.id+'-error')?.replaceChildren(document.createTextNode(errors[k]||''));el.setAttribute('aria-invalid',Boolean(errors[k]));}
    for(const el of Object.values(fields))if(el.tagName==='TEXTAREA'){el.style.height='auto';el.style.height=Math.max(90,el.scrollHeight)+'px';}
  }
  return {panel,state,update,reset(){for(const [k,v] of Object.entries(presentationDefaults))fields[k].value=v;update();}};
}
