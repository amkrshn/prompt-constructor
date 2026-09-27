import {styleProfiles,documentFonts} from '../../packages/core/src/style-presets.js';
export function mountTextStyle(onChange){
 const panel=document.createElement('details');panel.className='disclosure';panel.id='text-style-details';
 const summary=document.createElement('summary');summary.textContent='Оформление документа · палитра и шрифты';
 const body=document.createElement('div');body.className='disclosure-body';panel.append(summary,body);
 function select(id,label,values,initial){const lab=document.createElement('label');lab.htmlFor=id;lab.textContent=label;const el=document.createElement('select');el.id=id;for(const [value,name] of values){const o=document.createElement('option');o.value=value;o.textContent=name;el.append(o);}el.value=initial;body.append(lab,el);el.addEventListener('change',()=>{update();onChange();});return el;}
 const palette=select('tx-palette','Палитра',[['none','Не задавать'],...Object.entries(styleProfiles).map(([k,b])=>[k,b.name])],'business');
 const fonts=select('tx-fonts','Шрифтовой пресет',[['none','Не задавать'],...documentFonts.map(f=>[f.id,f.name])],'office');
 const swatches=document.createElement('div');swatches.className='palette-swatches';body.append(swatches);
 function update(){const brand=styleProfiles[palette.value];swatches.replaceChildren();if(brand)for(const [label,color] of brand.colors){const span=document.createElement('span');const i=document.createElement('i');i.style.backgroundColor=color;span.append(i,document.createTextNode(label+' '+color));swatches.append(span);}}
 update();return {panel,state:()=>({palette:palette.value,fonts:fonts.value}),reset(){palette.value='business';fonts.value='office';update();}};
}
