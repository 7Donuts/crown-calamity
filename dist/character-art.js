import { APPEARANCE_OPTIONS, normalizeAppearance, getAppearanceOptions, getAppearanceLabels } from './races.js';
export { APPEARANCE_OPTIONS, normalizeAppearance };

// Generated illustrations use the same references and prompt headers as every
// other production asset. SVG only crops and recolors their existing pixels.
export const CHARACTER_ATLASES = Object.freeze(Object.fromEntries([
  ['quayfolk', 'assets/characters/quayfolk-atlas.png', 414, 0, 36],
  ['cobblekin', 'assets/characters/cobblekin-atlas.png', 396, 31, 43],
  ['reedling', 'assets/characters/reedling-atlas.png', 396, 17, 33],
  ['emberling', 'assets/characters/emberling-atlas.png', 396, 23, 38]
].map(([id, src, split, topPad, bottomPad]) => [id, Object.freeze({
  src, width: 1983, height: 793,
  columns: 5, split, topPad, bottomPad
})])));
const NAMES = Object.freeze({quayfolk:'Quayfolk', cobblekin:'Cobblekin', reedling:'Reedling', emberling:'Emberling'});
const SIZES = Object.freeze({small:64, medium:96, large:128});
const EYES = Object.freeze({
  quayfolk: [[[173,195],[247,195]],[[168,195],[241,195]],[[156,195],[229,195]],[[133,195],[205,195]],[[155,191],[231,191]],[[174,169],[246,169]],[[169,169],[241,169]],[[157,169],[229,169]],[[133,169],[205,169]],[[155,167],[228,167]]],
  cobblekin: [[[201,148],[288,132]],[[193,149],[278,135]],[[187,149],[269,138]],[[192,147],[274,135]],[[191,150],[274,134]],[[208,121],[298,106]],[[201,126],[289,114]],[[196,126],[281,114]],[[206,125],[293,111]],[[203,125],[287,113]]],
  reedling: [[[241,136],[307,128]],[[244,141],[308,134]],[[246,141],[309,133]],[[248,144],[313,136]],[[238,141],[303,133]],[[241,124],[308,116]],[[244,130],[309,122]],[[249,124],[314,116]],[[252,130],[317,122]],[[245,128],[310,120]]],
  emberling: [[[249,159],[319,153]],[[216,158],[286,153]],[[200,161],[270,157]],[[217,155],[288,149]],[[202,160],[271,154]],[[249,142],[317,138]],[[218,140],[287,135]],[[202,142],[269,138]],[[212,139],[281,134]],[[200,143],[270,140]]]
});
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[c]);
const rgb = hex => [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255);

function tintFilter(id, hex, key, mid = .55) {
  // The keyed alpha is multiplied by SourceAlpha: color never paints empty
  // margins. Luminance supplies the generated shading, not flat fill shapes.
  const channels = rgb(hex);
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${key}" result="key"/><feComposite in="key" in2="SourceAlpha" operator="in" result="matte"/><feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray"/><feComponentTransfer in="gray" result="tint">${channels.map((c,i)=>`<feFunc${['R','G','B'][i]} type="linear" slope="${(c*.85/mid).toFixed(4)}" intercept="${(c*.12).toFixed(4)}"/>`).join('')}</feComponentTransfer><feComposite in="tint" in2="matte" operator="in"/></filter>`;
}

function regions(race, style, eyePoints) {
  const eyeHoles = eyePoints.map(([x,y])=>`M${x-21} ${y}a21 22 0 1 0 42 0a21 22 0 1 0 -42 0`).join('');
  let skin, accent;
  if (race === 'quayfolk') {
    skin='M65 55H335V257H65Z M95 309H150V350H95Z M255 309H307V350H255Z';
    accent='M40 0H370V252H40Z';
    if(style==='braid') accent+=' M240 240H310V375H240Z';
    if(style==='ponytail') accent+=' M270 180H365V290H270Z';
    if(style==='shaved') accent='M100 60H300V115H100Z';
  } else if (race === 'cobblekin') {
    skin='M35 15H365V220H35Z M20 240H125V340H20Z M280 240H385V340H280Z M75 335H335V392H75Z';
    accent=style==='shaved'?'':'M35 0H365V115Q270 90 200 125Q110 95 35 115Z';
  } else if (race === 'reedling') {
    skin='M70 45H345V195H70Z M40 285H195V365H40Z M120 322H355V396H120Z M280 235H350V316H280Z M190 203H230V245H190Z';
    accent='M40 0H370V240H40Z M25 280H190V370H25Z';
  } else {
    skin='M80 0H365V221H80Z M0 185H150V371H0Z M155 335H355V392H155Z M160 228H250V282H160Z M296 230H348V285H296Z';
    accent='M70 0H365V235H70Z M0 180H155V372H0Z M140 210H345V282H140Z M150 330H355V395H150Z';
  }
  return {skin:skin+eyeHoles, accent:accent ? accent+eyeHoles : ''};
}

export function renderCharacterArt(raceId, appearance, {size='medium'}={}) {
  const race=Object.hasOwn(CHARACTER_ATLASES,raceId)?raceId:'quayfolk';
  const a=normalizeAppearance(race,appearance), options=getAppearanceOptions(race), labels=getAppearanceLabels(race);
  const choice=(key)=>options[key].find(o=>o.id===a[key]);
  const atlas=CHARACTER_ATLASES[race], col=options.hairStyle.findIndex(o=>o.id===a.hairStyle), male=a.presentation==='male';
  const fw=atlas.width/atlas.columns, sy=male?atlas.split:0, sh=male?atlas.height-atlas.split:atlas.split, py=male?atlas.bottomPad:atlas.topPad;
  const id=['portrait',race,...Object.values(a)].join('-');
  const eyePoints=EYES[race][col+(male?5:0)], paths=regions(race,a.hairStyle,eyePoints);
  const keySkin=race==='reedling'?'-10 0 14 0 -0.8':race==='emberling'?'-8 8 12 0 -0.5':'20 -24 0 0 -1';
  const keyAccent=race==='quayfolk'?'-14 20 -2 0 -0.2':race==='cobblekin'?(a.hairStyle==='shaved'?'8 8 8 0 -11':'0 0 0 1 0'):'14 -16 -1 0 -0.5';
  const accessible=`${a.presentation} ${NAMES[race]} adventurer; ${labels.hairStyle}: ${choice('hairStyle').label}; ${labels.hairColor}: ${choice('hairColor').label}; ${labels.skinTone}: ${choice('skinTone').label}; ${choice('eyeColor').label} eyes`;
  const px=SIZES[size]||SIZES.medium;
  const defs=`<g id="${id}-source"><svg x="0" y="0" width="${fw}" height="${sh}" viewBox="${(col*fw).toFixed(2)} ${sy} ${fw} ${sh}" overflow="hidden"><image href="${atlas.src}" x="0" y="0" width="${atlas.width}" height="${atlas.height}"/></svg></g><clipPath id="${id}-skin"><path d="${paths.skin}" clip-rule="evenodd"/></clipPath><clipPath id="${id}-accent"><path d="${paths.accent}" clip-rule="evenodd"/></clipPath><clipPath id="${id}-eyes">${eyePoints.map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="${race==='reedling'&&i===1?8:race==='cobblekin'?12:15}" ry="${race==='cobblekin'?15:17}"/>`).join('')}</clipPath>${tintFilter(id+'-skin-tint',choice('skinTone').color,keySkin,race==='emberling'?.3:.55)}${tintFilter(id+'-accent-tint',choice('hairColor').color,keyAccent,.6)}${tintFilter(id+'-eye-tint',choice('eyeColor').color,'8 -6 -2 0 -0.15',.3)}`;
  const layer=(mask,filter)=>`<g clip-path="url(#${id}-${mask})"><use href="#${id}-source" filter="url(#${id}-${filter}-tint)"/></g>`;
  return `<span class="character-art character-art--${Object.hasOwn(SIZES,size)?size:'medium'}"><svg class="character-art__portrait" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fw} 420" width="${px}" height="${Math.ceil(px*420/fw)}" role="img" aria-label="${xml(accessible)}"><title>${NAMES[race]} adventurer</title><defs>${defs}</defs><g transform="translate(0 ${py})"><use href="#${id}-source"/>${layer('skin','skin')}${layer('accent','accent')}${layer('eyes','eye')}</g></svg></span>`;
}
