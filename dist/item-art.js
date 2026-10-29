// Shared 4×4 item atlas. Crops use percentages so they work at any rendered size.
export const ITEM_ART_ATLAS = Object.freeze({
  src: 'assets/items/item-atlas.png',
  width: 1254,
  height: 1254,
  columns: 4,
  rows: 4,
  cellWidth: 313.5,
  cellHeight: 313.5
});

const frame = (col, row, category) => Object.freeze({ col, row, category });
const frames = Object.freeze({
  sword: frame(0, 0, 'sword'),
  blade: frame(1, 0, 'blade'),
  focusRod: frame(2, 0, 'focusRod'),
  buckler: frame(3, 0, 'buckler'),
  crystalFocus: frame(0, 1, 'crystalFocus'),
  canalstone: frame(1, 1, 'canalstone'),
  cap: frame(2, 1, 'cap'),
  coat: frame(3, 1, 'coat'),
  gloves: frame(0, 2, 'gloves'),
  boots: frame(1, 2, 'boots'),
  pendant: frame(2, 2, 'pendant'),
  ring: frame(3, 2, 'ring'),
  signet: frame(0, 3, 'signet'),
  pike: frame(1, 3, 'pike'),
  materials: frame(2, 3, 'materials'),
  toolkit: frame(3, 3, 'toolkit')
});

export const ITEM_ART = Object.freeze({
  rod: frames.focusRod,
  floodrod: frames.focusRod,
  sword: frames.sword,
  ironsword: frames.sword,
  blade: frames.blade,
  glassblade: frames.blade,
  shield: frames.buckler,
  gateShield: frames.buckler,
  focus: frames.crystalFocus,
  charm: frames.canalstone,
  cap: frames.cap,
  rivethelm: frames.cap,
  coat: frames.coat,
  oilskin: frames.coat,
  grips: frames.gloves,
  workgloves: frames.gloves,
  boots: frames.boots,
  wornboots: frames.boots,
  waders: frames.boots,
  penny: frames.pendant,
  lantern: frames.pendant,
  band: frames.ring,
  seal: frames.signet,
  signet: frames.signet,
  pike: frames.pike,
  spoolblade:frames.blade,teacupMace:frames.sword,lullabyRod:frames.focusRod,
  buttonBaton:frames.sword,pillowMallet:frames.sword,spoonSledge:frames.sword,kettleHammer:frames.sword,
  blanketClub:frames.sword,plushMaul:frames.sword,ribbonRapier:frames.blade,pinFoil:frames.blade,
  thimbleSabre:frames.blade,satinNeedle:frames.blade,starlingEdge:frames.blade,spoolfoil:frames.blade,
  moonlitStiletto:frames.blade,singalongScepter:frames.focusRod,starWand:frames.focusRod,cloudFlute:frames.focusRod,
  lullabyScepter:frames.focusRod,lanternWand:frames.focusRod,velvetConductor:frames.focusRod,bedtimeStar:frames.focusRod,
  quiltBuckler:frames.buckler,thimbleFocus:frames.crystalFocus,wardingBlanket:frames.canalstone,
  buttonShield:frames.buckler,tinnyFocus:frames.crystalFocus,stitchedWard:frames.canalstone,
  pillowCap:frames.cap,earmuffCrown:frames.cap,thimbleHelm:frames.cap,teaCosyHood:frames.cap,
  ribbonVisor:frames.cap,kettleHelmet:frames.cap,starryHood:frames.cap,paradeBonnet:frames.cap,
  quiltedVest:frames.coat,kettleApron:frames.coat,velvetWaistcoat:frames.coat,rainCape:frames.coat,
  storybookTunic:frames.coat,festivalCoat:frames.coat,cloudPajamas:frames.coat,captainJacket:frames.coat,
  ribbonMitts:frames.gloves,thimbleGauntlets:frames.gloves,pastryMitts:frames.gloves,spoolBracers:frames.gloves,
  starGloves:frames.gloves,mittenMitts:frames.gloves,captainsGloves:frames.gloves,woollyWristguards:frames.gloves,
  slipperBoots:frames.boots,rainGaloshes:frames.boots,sockSkates:frames.boots,buttonClogs:frames.boots,
  cloudSlippers:frames.boots,paradeBoots:frames.boots,stargazerShoes:frames.boots,
  thimblePendant:frames.pendant,spoolBracelet:frames.pendant,teaCharm:frames.canalstone,
  toyCompass:frames.ring,buttonLocket:frames.ring,bellPendant:frames.pendant,ribbonBrooch:frames.pendant,
  threadSpool:frames.materials,patchworkHeart:frames.signet,luckyButton:frames.canalstone,dreamBell:frames.signet,
  thimbleGuard:frames.signet,amberMarble:frames.canalstone,ribbonKnot:frames.pendant,stuffingSatchel:frames.toolkit
});

const sizes = new Set(['small', 'medium', 'large']);

function renderFrame(art,size) {
  if (!art) return '';
  const safeSize = sizes.has(size) ? size : 'small';
  const left = -(art.col * 100), top = -(art.row * 100);
  return `<span class="item-art item-art--${safeSize}" aria-hidden="true"><img alt="" src="${ITEM_ART_ATLAS.src}" style="position:absolute;width:400%;height:400%;max-width:none;left:${left}%;top:${top}%"></span>`;
}

export function renderItemArt(id, { size = 'small' } = {}) {
  return renderFrame(Object.hasOwn(ITEM_ART,id) ? ITEM_ART[id] : null,size);
}

export function renderServiceArt(kind, {size='small'}={}) {
  return renderFrame(['materials','toolkit'].includes(kind)?frames[kind]:null,size);
}
