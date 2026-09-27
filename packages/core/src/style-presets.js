// Neutral built-in presets. They are examples, not a third-party brand specification.
export const styleProfiles = {
  business: {
    name:'Деловая синяя',
    colors:[['Фон','#FFFFFF'],['Текст','#172B4D'],['Акцент','#315DA8'],['Поверхность','#E8EFF8']],
    roles:['#FFFFFF','#172B4D','#315DA8','#E8EFF8'],
    rules:'Используй сдержанную деловую иерархию. Акцентный цвет применяй для смысловых акцентов, а не для длинного основного текста.'
  },
  natural: {
    name:'Природная зелёная',
    colors:[['Фон','#FAFCF8'],['Текст','#203B2E'],['Акцент','#287A50'],['Поверхность','#E7F0E8']],
    roles:['#FAFCF8','#203B2E','#287A50','#E7F0E8'],
    rules:'Используй спокойную природную палитру и сохраняй достаточный контраст текста с фоном.'
  },
  graphite: {
    name:'Графит и янтарь',
    colors:[['Фон','#17202C'],['Текст','#F5F7FA'],['Акцент','#F3B651'],['Поверхность','#344355']],
    roles:['#17202C','#F5F7FA','#F3B651','#344355'],
    rules:'Тёмный фон используй только там, где он поддерживает читаемость и назначение материала; не уменьшай контраст второстепенного текста.'
  },
  minimal: {
    name:'Минимализм · монохром',
    colors:[['Фон','#FFFFFF'],['Текст','#202124'],['Акцент','#505C70'],['Поверхность','#EEF0F3']],
    roles:['#FFFFFF','#202124','#505C70','#EEF0F3'],
    rules:'Используй цвет экономно; визуальную иерархию формируй типографикой, отступами и композицией.'
  }
};
export const documentPalettes=Object.entries(styleProfiles).map(([id,p])=>({id,name:p.name,colors:p.roles}));
export const documentFonts=[
  {id:'office',name:'Arial · универсальная',heading:'Arial',body:'Arial',note:'Универсальный системный вариант. Проверь фактическую доступность гарнитуры в среде генерации.'},
  {id:'onest',name:'Onest · единая гарнитура',heading:'Onest',body:'Onest',note:'Современная нейтральная гарнитура. Используй только если она доступна и разрешена в целевой среде.'},
  {id:'modern',name:'Manrope + Onest',heading:'Manrope',body:'Onest',note:'Современная пара. Проверь наличие обеих гарнитур и поддержку нужного языка.'},
  {id:'editorial',name:'Georgia + Arial',heading:'Georgia',body:'Arial',note:'Контрастная редакционная пара для материалов, где уместна serif-гарнитура в заголовках.'}
];
export function palettePrompt(id){const p=styleProfiles[id];return p?`${p.name}. Цветовые роли: ${p.colors.map(([n,c])=>n+' '+c).join('; ')}.\n${p.rules}`:'';}
export function fontNote(id){return documentFonts.find(f=>f.id===id)?.note||'';}
export function documentStylePrompt(style){
  if(!style||(!styleProfiles[style.palette]&&!documentFonts.some(f=>f.id===style.fonts)))return '';
  const font=documentFonts.find(f=>f.id===style.fonts);
  const blocks=['Применяй следующие настройки только при создании оформленного документа или макета. Для обычного текстового ответа не добавляй HTML/CSS и не утверждай, что визуальное оформление уже применено.'];
  const palette=palettePrompt(style.palette);if(palette)blocks.push(palette);
  if(font)blocks.push(`Заголовки: ${font.heading}; основной текст: ${font.body}. ${font.note}`);
  blocks.push('Проверь доступность шрифтов и поддержку языка; не подменяй гарнитуры молча. Сохраняй текст редактируемым. Если среда не поддерживает оформление, передай параметры отдельно от основного текста. Проверяй контраст каждой пары текста и фона.');
  return blocks.join('\n');
}
