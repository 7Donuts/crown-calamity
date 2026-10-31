// Pure equipment and crafting rules. Item ids are save-format identifiers.
import { currentChapter, chapterUnlocked } from './campaign.js';
export const SLOTS = Object.freeze({
  weapon: 'Weapon', offhand: 'Offhand', head: 'Head', body: 'Body', hands: 'Hands',
  feet: 'Feet', accessory: 'Accessory', accessory2: 'Accessory 2', relic: 'Relic', relic2: 'Relic 2'
});
const ACCESSORY_SLOTS = ['accessory', 'accessory2'];
// Items whose category fits more than one slot. Every character starts with both relic slots.
export const RELIC_SLOTS = Object.freeze(['relic', 'relic2']);
const MULTI_SLOTS = Object.freeze({ accessory: ACCESSORY_SLOTS, relic: RELIC_SLOTS });
const slotsFor = item => item ? (MULTI_SLOTS[item.slot] || [item.slot]) : [];
const SLOT_KEYS = Object.keys(SLOTS);

export const ITEMS = Object.freeze({
  rod:{id:'rod',name:"Squeaker-Glass Wand",slot:'weapon',base:14,channel:'spell',focus:true,level:1,price:18,desc:'A squeaker-glass wand. Spells scale with Intellect; it works with a shield.'},
  sword:{id:'sword',name:'Lost-Button Bonker',slot:'weapon',base:14,channel:'heavy',level:1,price:18,desc:'A hefty button-bonker. Strikes scale with Might.'},
  blade:{id:'blade',name:'Darning-Needle Blade',slot:'weapon',base:14,channel:'precision',level:1,price:20,desc:'A nimble darning blade. Strikes scale with Finesse.'},
  shield:{id:'shield',name:'Pot-Lid Button Shield',slot:'offhand',armor:10,level:1,price:12,desc:'Enough shield to make a point. Enables Wardcast with a rod.'},
  focus:{id:'focus',name:'Crayon-Star Focus',slot:'offhand',spellBase:3,focus:true,level:1,price:15,desc:'+3 spell base. Trades shield protection for spell output.'},
  charm:{id:'charm',name:'Pebble-Pocket Charm',slot:'offhand',ward:8,stats:{ins:2},level:1,price:16,desc:'+2 Insight, +8 ward. A small stone with good intentions.'},
  coat:{id:'coat',name:'Quilt-Scrap Jacket',slot:'body',armor:8,ward:4,level:1,price:20,desc:'+8 armor, +4 ward. Dry is a relative term.'},
  gateShield:{id:'gateShield',name:'Tin-Gate Buckler',slot:'offhand',armor:28,level:3,price:45,desc:'+28 armor. A retired piece of infrastructure.'},
  oilskin:{id:'oilskin',name:'Rain-Cape Patchcoat',slot:'body',armor:20,ward:12,level:3,price:50,desc:'+20 armor, +12 ward. Finally, an actual waterproof layer.'},
  grips:{id:'grips',name:'Thimble-Stud Mitts',slot:'hands',armor:6,stats:{mig:2},level:5,price:65,desc:'+2 Might, +6 armor. Reclaimed from a reluctant donor.'},
  lantern:{id:'lantern',name:'Glowbug Button Charm',slot:'accessory',stats:{ins:2},ward:8,level:6,price:75,desc:'+2 Insight, +8 ward. Lets you see the problem more clearly.'},
  floodrod:{id:'floodrod',name:'Squeaker-Core Scepter',slot:'weapon',base:26,channel:'spell',focus:true,stats:{int:2},level:6,price:95,desc:'26 weapon base, +2 Intellect. Focus-tagged; works with a shield.'},
  ironsword:{id:'ironsword',name:'Toy-Guard Club',slot:'weapon',base:30,channel:'heavy',stats:{mig:2},level:6,price:95,desc:'30 weapon base, +2 Might. A persuasive argument.'},
  glassblade:{id:'glassblade',name:'Squeaker-Glass Stiletto',slot:'weapon',base:30,channel:'precision',stats:{fin:2},level:6,price:95,desc:'30 weapon base, +2 Finesse. Precision has its rewards.'},
  seal:{id:'seal',name:'Keeper’s Brass Button',slot:'relic',relicEffect:'seal',level:8,desc:'First useful Guard each fight grants a barrier of 4% of maximum Stuffing and gains 1 Pluck.'},
  penny:{id:'penny',name:'Lucky Copper Button',slot:'accessory',stats:{lck:4},level:1,price:25,desc:'+4 Luck. A little fortune, worn on purpose. Improves critical and equipment-drop chances.'},
  band:{id:'band',name:'Squeaker-Glass Ring',slot:'accessory',ward:8,stats:{int:2},level:8,desc:'+2 Intellect, +8 ward. Quietly, reliably magical.'},
  cap:{id:'cap',name:'Ledger-Scrap Bonnet',slot:'head',armor:4,stats:{ins:1},level:1,price:22,desc:'+1 Insight, +4 armor. Keeps the paperwork out of your eyes.'},
  boots:{id:'boots',name:'Sluice-Sock Boots',slot:'feet',armor:3,stats:{fin:1},level:2,price:24,desc:'+1 Finesse, +3 armor. Grip tested on wet stone.'},
  workgloves:{id:'workgloves',name:'Patchwork Paws',slot:'hands',armor:2,stats:{fin:1},level:1,price:16,desc:'+1 Finesse, +2 armor. Worn smooth by honest municipal labor.'},
  wornboots:{id:'wornboots',name:'Canal-Step Slippers',slot:'feet',armor:1,stats:{fin:1},level:1,price:16,desc:'+1 Finesse, +1 armor. Better than bare feet on wet stone.'},
  rivethelm:{id:'rivethelm',name:'Button-Stud Bonnet',slot:'head',armor:11,stats:{vit:1},level:5,price:68,desc:'+1 Vitality, +11 armor. A hard answer to a hard shell.'},
  waders:{id:'waders',name:'Floodgate Welly-Socks',slot:'feet',armor:7,ward:5,stats:{wil:1},level:6,price:78,desc:'+1 Will, +7 armor, +5 ward. Rated for municipal flooding.'},
  signet:{id:'signet',name:'Brass-Stamp Ring',slot:'relic',relicEffect:'signet',stats:{wil:1},ward:8,level:4,price:58,desc:'+1 Will, +8 ward. Recover restores 3% of maximum Sparkle extra.'},
  pike:{id:'pike',name:'Gate-Latch Needle Pike',slot:'weapon',base:40,channel:'heavy',twoHanded:true,stats:{mig:2},level:7,price:125,desc:'A two-handed needle pike with +2 Might; its long reach trades away the offhand.'},
  // Additional catalog pieces use existing generated item-art families.
  spoolblade:{id:'spoolblade',name:'Bobbin-Thread Needleblade',slot:'weapon',base:20,channel:'precision',stats:{fin:1},level:2,desc:'A small sewing blade with a jaunty thread tassel.'},
  teacupMace:{id:'teacupMace',name:'Teacup Mallet',slot:'weapon',base:16,channel:'heavy',stats:{mig:1},level:2,desc:'Porcelain outside, surprisingly stern inside.'},
  lullabyRod:{id:'lullabyRod',name:'Lullaby Baton',slot:'weapon',base:17,channel:'spell',focus:true,stats:{int:1},level:2,desc:'A soft hum, followed by a very firm bonk.'},
  buttonBaton:{id:'buttonBaton',name:'Button-Bonk Baton',slot:'weapon',base:18,channel:'heavy',stats:{mig:1},level:3,desc:'A sturdy toy baton with a very large button.'},
  pillowMallet:{id:'pillowMallet',name:'Pillow-Fort Mallet',slot:'weapon',base:20,channel:'heavy',stats:{mig:1},level:4,desc:'Built for fort defense and friendly bonking.'},
  spoonSledge:{id:'spoonSledge',name:'Soup-Spoon Sledge',slot:'weapon',base:22,channel:'heavy',stats:{mig:1},level:5,desc:'For stirring up trouble in one direction.'},
  kettleHammer:{id:'kettleHammer',name:'Kettle-Knight Hammer',slot:'weapon',base:31,channel:'heavy',stats:{mig:2},level:7,desc:'A brave little hammer for a brave little knight.'},
  blanketClub:{id:'blanketClub',name:'Blanket-Roll Club',slot:'weapon',base:32,channel:'heavy',stats:{mig:2},level:8,desc:'Rolled tight and ready for a pillow-fort siege.'},
  plushMaul:{id:'plushMaul',name:'Plush Parade Maul',slot:'weapon',base:33,channel:'heavy',stats:{mig:2},level:9,desc:'A ceremonial mallet with practical ambitions.'},
  ribbonRapier:{id:'ribbonRapier',name:'Ribbon-Tail Needleblade',slot:'weapon',base:22,channel:'precision',stats:{fin:1},level:3,desc:'A narrow blade with a very dashing ribbon.'},
  pinFoil:{id:'pinFoil',name:'Pincushion Foil',slot:'weapon',base:24,channel:'precision',stats:{fin:1},level:4,desc:'Pointy, nimble, and safely stored in felt.'},
  thimbleSabre:{id:'thimbleSabre',name:'Thimble-Guard Needleblade',slot:'weapon',base:26,channel:'precision',stats:{fin:1},level:5,desc:'A neat cut with a neat little handguard.'},
  satinNeedle:{id:'satinNeedle',name:'Satin-Stitch Needleblade',slot:'weapon',base:31,channel:'precision',stats:{fin:2},level:7,desc:'A precise point for unpicking a bad plan.'},
  starlingEdge:{id:'starlingEdge',name:'Star-Button Needleblade',slot:'weapon',base:32,channel:'precision',stats:{fin:2},level:8,desc:'Light as a feather, sharp as a bedtime reminder.'},
  spoolfoil:{id:'spoolfoil',name:'Golden-Bobbin Foil',slot:'weapon',base:33,channel:'precision',stats:{fin:2},level:9,desc:'A fine edge wound around a very fine story.'},
  moonlitStiletto:{id:'moonlitStiletto',name:'Moonlit Thread Needle',slot:'weapon',base:34,channel:'precision',stats:{fin:2},level:10,desc:'A bright little blade for a careful little step.'},
  singalongScepter:{id:'singalongScepter',name:'Singalong Scepter',slot:'weapon',base:18,channel:'spell',focus:true,stats:{int:1},level:3,desc:'Every spell gets a chorus and a tiny flourish.'},
  starWand:{id:'starWand',name:'Star-Button Wand',slot:'weapon',base:20,channel:'spell',focus:true,stats:{int:1},level:4,desc:'A sewn star points the spell in the right direction.'},
  cloudFlute:{id:'cloudFlute',name:'Cloud-Puff Flute',slot:'weapon',base:22,channel:'spell',focus:true,stats:{int:1},level:5,desc:'A gentle note with a firm magical finish.'},
  lullabyScepter:{id:'lullabyScepter',name:'Dreamtime Scepter',slot:'weapon',base:27,channel:'spell',focus:true,stats:{int:2},level:7,desc:'For dreams that need a little encouragement.'},
  lanternWand:{id:'lanternWand',name:'Pocket-Lantern Wand',slot:'weapon',base:28,channel:'spell',focus:true,stats:{int:2},level:8,desc:'A little light for finding the right enchantment.'},
  velvetConductor:{id:'velvetConductor',name:'Velvet-String Conductor',slot:'weapon',base:29,channel:'spell',focus:true,stats:{int:2},level:9,desc:'Conducts a whole orchestra of quiet magic.'},
  bedtimeStar:{id:'bedtimeStar',name:'Bedtime Star Baton',slot:'weapon',base:30,channel:'spell',focus:true,stats:{int:2},level:10,desc:'A final sparkle before the adventure continues.'},
  quiltBuckler:{id:'quiltBuckler',name:'Patch-Quilt Pot-Lid Shield',slot:'offhand',armor:14,level:2,desc:'The stew can wait. Incoming trouble cannot.'},
  thimbleFocus:{id:'thimbleFocus',name:'Thimble-Tone Focus',slot:'offhand',spellBase:4,focus:true,level:2,desc:'A tiny chime with a rather large opinion.'},
  wardingBlanket:{id:'wardingBlanket',name:'Pocket-Square Ward',slot:'offhand',ward:11,stats:{wil:1},level:3,desc:'For cold nights and questionable hexes.'},
  buttonShield:{id:'buttonShield',name:'Big-Bobble Button Shield',slot:'offhand',armor:18,level:3,desc:'The button is decorative. The shield is not.'},
  tinnyFocus:{id:'tinnyFocus',name:'Tin-Whistle Star Focus',slot:'offhand',spellBase:5,focus:true,stats:{int:1},level:4,desc:'A piercing note in every sense.'},
  stitchedWard:{id:'stitchedWard',name:'Patchwork Paw Ward',slot:'offhand',ward:15,stats:{wil:1},level:4,desc:'Every patch remembers a close call.'},
  pillowCap:{id:'pillowCap',name:'Pillow-Fort Bonnet',slot:'head',armor:6,stats:{vit:1},level:2,desc:'Engineered to survive enthusiastic pillow fights.'},
  earmuffCrown:{id:'earmuffCrown',name:'Earmuff Button Crown',slot:'head',armor:8,stats:{wil:1},level:3,desc:'Royal protection from cold ears and bad ideas.'},
  thimbleHelm:{id:'thimbleHelm',name:'Thimble-Stack Bonnet',slot:'head',armor:10,stats:{ins:1},level:4,desc:'A stack of thimbles. Very official.'},
  teaCosyHood:{id:'teaCosyHood',name:'Tea-Cosy Pincushion Hood',slot:'head',armor:12,ward:3,level:5,desc:'Warm, snug, and mildly enchanted by biscuits.'},
  ribbonVisor:{id:'ribbonVisor',name:'Ribbon-Bow Visor',slot:'head',armor:13,stats:{fin:1},level:6,desc:'Keeps fringe out of the line of fire.'},
  kettleHelmet:{id:'kettleHelmet',name:'Toy-Kettle Bonnet',slot:'head',armor:15,ward:4,stats:{vit:1},level:7,desc:'A brave little kettle with a visor.'},
  starryHood:{id:'starryHood',name:'Star-Print Snood',slot:'head',armor:16,ward:5,stats:{wil:1},level:8,desc:'A night sky, stitched close around your ears.'},
  paradeBonnet:{id:'paradeBonnet',name:'Parade-Day Bonnet',slot:'head',armor:18,stats:{ins:2},level:9,desc:'Makes every retreat look like a procession.'},
  quiltedVest:{id:'quiltedVest',name:'Patchwork Pocket Vest',slot:'body',armor:12,ward:5,level:2,desc:'The pockets are mostly for snacks.'},
  kettleApron:{id:'kettleApron',name:'Kettle-Warden Apron',slot:'body',armor:15,stats:{vit:1},level:3,desc:'Stain resistant, spell resistant, soup resistant.'},
  velvetWaistcoat:{id:'velvetWaistcoat',name:'Velvet Scrap Waistcoat',slot:'body',armor:18,ward:6,stats:{ins:1},level:4,desc:'Dressy enough for danger.'},
  rainCape:{id:'rainCape',name:'Buttoned Rain-Patch Cape',slot:'body',armor:21,ward:7,level:5,desc:'A tiny cape for very large weather.'},
  storybookTunic:{id:'storybookTunic',name:'Storybook Quilt Tunic',slot:'body',armor:24,stats:{wil:1},level:6,desc:'The margins contain useful footnotes.'},
  festivalCoat:{id:'festivalCoat',name:'Festival Lantern Coat',slot:'body',armor:27,ward:8,stats:{vit:1},level:7,desc:'Bright lining, sturdy seams.'},
  cloudPajamas:{id:'cloudPajamas',name:'Cloud-Quilt Pajamas',slot:'body',armor:29,ward:10,stats:{wil:1},level:8,desc:'Dream-soft fabric, nightmare-tough stitching.'},
  captainJacket:{id:'captainJacket',name:'Button-Captain Jacket',slot:'body',armor:32,stats:{mig:1,vit:1},level:9,desc:'For captains of boats, beds, or blanket forts.'},
  ribbonMitts:{id:'ribbonMitts',name:'Ribbon-Pull Mitts',slot:'hands',armor:4,stats:{fin:1},level:2,desc:'A bow at the wrist; a grip like a knot.'},
  thimbleGauntlets:{id:'thimbleGauntlets',name:'Thimble-Finger Mitts',slot:'hands',armor:7,stats:{mig:1},level:3,desc:'Precision fit for very small screws.'},
  pastryMitts:{id:'pastryMitts',name:'Pastry-Patch Paws',slot:'hands',armor:9,ward:2,level:4,desc:'Rated for hot trays and hot tempers.'},
  spoolBracers:{id:'spoolBracers',name:'Spool-Thread Cuffs',slot:'hands',armor:11,stats:{vit:1},level:5,desc:'Threaded tight against scrapes.'},
  starGloves:{id:'starGloves',name:'Star-Catcher Mitts',slot:'hands',armor:13,stats:{ins:1},level:6,desc:'For reaching into the odd corners of the sky.'},
  mittenMitts:{id:'mittenMitts',name:'Mittens of Many Patches',slot:'hands',armor:15,ward:3,stats:{wil:1},level:7,desc:'Warm hands, several layers of courage.'},
  captainsGloves:{id:'captainsGloves',name:'Captain’s Knot Mitts',slot:'hands',armor:17,stats:{mig:1,fin:1},level:8,desc:'Every knot stays tied, even under pressure.'},
  woollyWristguards:{id:'woollyWristguards',name:'Woolly Pawguards',slot:'hands',armor:19,ward:4,stats:{vit:1},level:9,desc:'A little extra padding for a long day.'},
  slipperBoots:{id:'slipperBoots',name:'Moonlit Slipper Socks',slot:'feet',armor:4,stats:{fin:1},level:2,desc:'Quiet steps, loud ambitions.'},
  rainGaloshes:{id:'rainGaloshes',name:'Rain-Drum Wellies',slot:'feet',armor:6,ward:3,level:3,desc:'They squeak in time with the weather.'},
  sockSkates:{id:'sockSkates',name:'Sock-Skate Slippers',slot:'feet',armor:8,stats:{fin:1},level:4,desc:'Fast on polished floors; use judgment.'},
  buttonClogs:{id:'buttonClogs',name:'Button-Sole Booties',slot:'feet',armor:10,stats:{vit:1},level:5,desc:'Every step makes a satisfying click.'},
  cloudSlippers:{id:'cloudSlippers',name:'Cloud-Puff Socks',slot:'feet',armor:12,ward:4,level:6,desc:'A soft landing, even after a hard lesson.'},
  paradeBoots:{id:'paradeBoots',name:'Parade-Step Boots',slot:'feet',armor:14,stats:{mig:1},level:7,desc:'March bravely; polish occasionally.'},
  stargazerShoes:{id:'stargazerShoes',name:'Stargazer Booties',slot:'feet',armor:16,ward:5,stats:{ins:1},level:8,desc:'Point toes toward the next bright idea.'},
  thimblePendant:{id:'thimblePendant',name:'Lucky Thimble Pendant',slot:'accessory',stats:{lck:1},level:2,desc:'A thimble for tiny emergencies.'},
  spoolBracelet:{id:'spoolBracelet',name:'Spool-Thread Bracelet',slot:'accessory',stats:{fin:1},level:3,desc:'A spare thread is always handy.'},
  teaCharm:{id:'teaCharm',name:'Tea-Bag Talisman',slot:'accessory',ward:3,stats:{wil:1},level:4,desc:'Steeped in patience, apparently.'},
  toyCompass:{id:'toyCompass',name:'Clockwork Toy Compass',slot:'accessory',stats:{ins:1},level:5,desc:'Points toward something interesting.'},
  buttonLocket:{id:'buttonLocket',name:'Grand Button Locket',slot:'accessory',ward:4,stats:{vit:1},level:6,desc:'Contains a smaller, more sentimental button.'},
  bellPendant:{id:'bellPendant',name:'Bedtime Bell Pendant',slot:'accessory',stats:{int:1},level:7,desc:'Rings only when a nap is overdue.'},
  ribbonBrooch:{id:'ribbonBrooch',name:'Ribbon-Knot Brooch',slot:'accessory',stats:{mig:1,fin:1},level:8,desc:'A neat bow conceals a stubborn knot.'},
  threadSpool:{id:'threadSpool',name:'Thread Spool of Second Chances',slot:'relic',relicEffect:'threadSpool',stats:{vit:1},level:3,desc:'First useful Guard each fight restores 5% of maximum Bounce and gains 1 Pluck.'},
  patchworkHeart:{id:'patchworkHeart',name:'Patchwork Heart',slot:'relic',relicEffect:'patchworkHeart',stats:{wil:1},level:3,desc:'Victory restores 5% of missing Stuffing, plus 1% of missing Stuffing per Pluck held.'},
  luckyButton:{id:'luckyButton',name:'Lucky Button',slot:'relic',relicEffect:'luckyButton',stats:{lck:2},level:4,desc:'Victory grants 5% extra coins, plus 5% more when winning with 4 or more Pluck.'},
  dreamBell:{id:'dreamBell',name:'Dream Bell',slot:'relic',relicEffect:'dreamBell',stats:{int:1},level:4,desc:'Victory restores 3% of maximum Sparkle, plus 1% of maximum Sparkle per Pluck held.'},
  thimbleGuard:{id:'thimbleGuard',name:'Thimble Guard',slot:'relic',relicEffect:'thimbleGuard',armor:5,level:5,desc:'First useful Guard each fight adds a barrier of 2% of maximum Stuffing, plus 0.5% of maximum per Pluck held.'},
  amberMarble:{id:'amberMarble',name:'Amber Marble',slot:'relic',relicEffect:'amberMarble',ward:5,level:5,desc:'First damaging action each fight deals 8% more and gains 1 Pluck.'},
  ribbonKnot:{id:'ribbonKnot',name:'Ribbon Knot of Resolve',slot:'relic',relicEffect:'ribbonKnot',stats:{mig:1},level:6,desc:'A free physical strike restores 2% of maximum Sparkle, doubled while holding 4 or more Pluck.'},
  stuffingSatchel:{id:'stuffingSatchel',name:'Emergency Stuffing Satchel',slot:'relic',relicEffect:'stuffingSatchel',stats:{vit:1},level:7,desc:'Mend heals 10% more. A Mend that heals gains 1 Pluck.'},
  // Relic engine pieces (design 43). Effects and numbers live in relic-engine.js.
  feltFang:{id:'feltFang',name:'Felt Vampire Fang',slot:'relic',relicEffect:'feltFang',stats:{vit:1},desc:'Your hits restore 20% of the damage that landed as Stuffing (health), plus 3% per Pluck held.'},
  darnedPatch:{id:'darnedPatch',name:'Darned-Elbow Patch',slot:'relic',relicEffect:'darnedPatch',armor:4,desc:'Each enemy attack that hurts you gains 1 Pluck, or 2 from a heavy.'},
  cocoaThimble:{id:'cocoaThimble',name:'Hot-Cocoa Thimble',slot:'relic',relicEffect:'cocoaThimble',stats:{wil:1},desc:'When you win, each Pluck you still hold restores 4% of maximum Stuffing (health).'},
  picnicTin:{id:'picnicTin',name:'Picnic-Tin Keepsake',slot:'relic',relicEffect:'picnicTin',stats:{ins:1},desc:'When you win, up to 3 Pluck carry into your next fight. Resting, defeat or Go still empties the tin.'},
  // Finale keepsakes: granted once by each chapter's finale claim, never stocked or sold.
  lintLocket:{id:'lintLocket',name:'Lint-Trap Locket',slot:'relic',relicEffect:'lintLocket',keepsake:true,finale:1,stats:{vit:2},desc:'Each useful Guard gains 2 Pluck, or 3 against a heavy. The first heavy you guard each fight sends 25% of the damage you prevented back at the enemy.'},
  lastToken:{id:'lastToken',name:'Last-Token Charm',slot:'relic',relicEffect:'lastToken',keepsake:true,finale:2,stats:{fin:2},desc:'A successful Disrupt gains 3 Pluck and Rattles the enemy: its next attack deals 30% less.'},
  seedHeart:{id:'seedHeart',name:'Seed-Packet Heart',slot:'relic',relicEffect:'seedHeart',keepsake:true,finale:3,stats:{wil:2},desc:'Shake it off gains 2 Pluck. If the enemy’s response that exchange is not a heavy, it also restores 6% of maximum Stuffing (health).'},
  musicBox:{id:'musicBox',name:'Keepsake Music Box',slot:'relic',relicEffect:'musicBox',keepsake:true,finale:4,stats:{ins:2},desc:'Expose gains 2 Pluck. Its bonus waits up to two exchanges for your next damaging action, and that action cannot glance.'},
  encoreRibbon:{id:'encoreRibbon',name:'Encore Ribbon',slot:'relic',relicEffect:'encoreRibbon',keepsake:true,finale:5,stats:{mig:1,fin:1,int:1},desc:'Repeating a damaging action of the same kind gains 1 Pluck. Your damaging actions deal 3% more per Pluck held.'}
  ,
  // Later chapters add original stuffie-sized weapons. Their stable IDs are
  // also used by saves and the shared generated art atlas.
  thimblePike:{id:'thimblePike',name:'Thimble-Point Pike',slot:'weapon',base:46,channel:'heavy',twoHanded:true,stats:{mig:2},desc:'A sewing thimble lashed to a knitting needle. Long reach, no offhand.'},
  spoolSpear:{id:'spoolSpear',name:'Spool-Thread Spear',slot:'weapon',base:48,channel:'heavy',stats:{mig:2},desc:'A sharpened bobbin wrapped in tough thread.'},
  buttonBashers:{id:'buttonBashers',name:'Button-Basher Pair',slot:'weapon',base:50,channel:'heavy',stats:{mig:2},desc:'Two oversized coat buttons, gripped like tiny cudgels.'},
  thimbleMaul:{id:'thimbleMaul',name:'Thimble-Stack Maul',slot:'weapon',base:52,channel:'heavy',twoHanded:true,stats:{mig:3},desc:'A tower of sewing thimbles packed around a stout handle.'},
  pincushionPounder:{id:'pincushionPounder',name:'Pincushion Pounder',slot:'weapon',base:54,channel:'heavy',stats:{mig:2},desc:'A padded mallet with a safely tucked-away point.'},
  bobbinClub:{id:'bobbinClub',name:'Grand Bobbin Club',slot:'weapon',base:56,channel:'heavy',stats:{mig:3},desc:'A huge wooden spool, just right for underfoot trouble.'},
  kettleDrumHammer:{id:'kettleDrumHammer',name:'Tin-Kettle Drumhammer',slot:'weapon',base:58,channel:'heavy',twoHanded:true,stats:{mig:3},desc:'A toy kettle mounted on a firm dowel. It rings on impact.'},
  patchworkRam:{id:'patchworkRam',name:'Patchwork Rammer',slot:'weapon',base:60,channel:'heavy',stats:{mig:3,vit:1},desc:'A stuffed battering roll with reinforced seams.'},
  thimbleKnocker:{id:'thimbleKnocker',name:'Thimble-Knuckle Knocker',slot:'weapon',base:62,channel:'heavy',stats:{mig:3},desc:'A pair of brass thimbles sewn into sturdy mitts.'},
  quiltedSledge:{id:'quiltedSledge',name:'Quilted Doorstop Sledge',slot:'weapon',base:64,channel:'heavy',twoHanded:true,stats:{mig:3},desc:'A dense quilted head on a reclaimed toy handle.'},
  pinwheelRapier:{id:'pinwheelRapier',name:'Pinwheel-Tip Rapier',slot:'weapon',base:35,channel:'precision',stats:{fin:2},desc:'A narrow toy blade with a bright spinning pom.'},
  needleFoil:{id:'needleFoil',name:'Darning-Needle Foil',slot:'weapon',base:37,channel:'precision',stats:{fin:2},desc:'A long blunt needle made for precise little jabs.'},
  ribbonStiletto:{id:'ribbonStiletto',name:'Ribbon-Tied Stiletto',slot:'weapon',base:39,channel:'precision',stats:{fin:2},desc:'A tiny bright blade hidden under a fluttering bow.'},
  safetyPinLance:{id:'safetyPinLance',name:'Safety-Pin Lance',slot:'weapon',base:41,channel:'precision',stats:{fin:2},desc:'A giant closed safety pin, quick and carefully pointed.'},
  glassBeadDart:{id:'glassBeadDart',name:'Glass-Bead Needle Dart',slot:'weapon',base:43,channel:'precision',stats:{fin:2},desc:'A fine stitch-needle with a heavy bead pommel.'},
  embroideryStiletto:{id:'embroideryStiletto',name:'Embroidery-Hoop Stiletto',slot:'weapon',base:45,channel:'precision',stats:{fin:3},desc:'A slender blade balanced with a little wooden hoop.'},
  satinSeamRipper:{id:'satinSeamRipper',name:'Satin-Seam Ripper',slot:'weapon',base:47,channel:'precision',stats:{fin:3},desc:'A neat seam tool with a very deliberate hooked tip.'},
  clockworkBodkin:{id:'clockworkBodkin',name:'Clockwork Bodkin',slot:'weapon',base:49,channel:'precision',stats:{fin:3},desc:'A spring-loaded sewing awl for swift, exact strikes.'},
  starButtonStiletto:{id:'starButtonStiletto',name:'Star-Button Stiletto',slot:'weapon',base:51,channel:'precision',stats:{fin:3},desc:'A precise little point topped by a gleaming star button.'},
  moonThreadNeedle:{id:'moonThreadNeedle',name:'Moon-Thread Needleblade',slot:'weapon',base:53,channel:'precision',stats:{fin:3},desc:'A silvery needle wrapped in luminous thread.'},
  thimbleChime:{id:'thimbleChime',name:'Thimble-Chime Wand',slot:'weapon',base:34,channel:'spell',focus:true,stats:{int:2},desc:'A tiny wand capped with a silver sewing thimble.'},
  buttonStarWand:{id:'buttonStarWand',name:'Button-Star Wand',slot:'weapon',base:36,channel:'spell',focus:true,stats:{int:2},desc:'A bright star button guides every careful spell.'},
  ribbonLoomRod:{id:'ribbonLoomRod',name:'Ribbon-Loom Rod',slot:'weapon',base:38,channel:'spell',focus:true,stats:{int:2},desc:'A toy loom shuttle humming with woven magic.'},
  bedtimeBobbin:{id:'bedtimeBobbin',name:'Bedtime Bobbin Scepter',slot:'weapon',base:40,channel:'spell',focus:true,stats:{int:2},desc:'A polished thread spool that hums a calming spell.'},
  starryPincushion:{id:'starryPincushion',name:'Starry Pincushion Staff',slot:'weapon',base:42,channel:'spell',focus:true,stats:{int:2},desc:'A soft pincushion dotted with safe, shining pins.'},
  moonKiteWand:{id:'moonKiteWand',name:'Moon-Kite Wand',slot:'weapon',base:44,channel:'spell',focus:true,stats:{int:3},desc:'A toy kite tail channels a ribbon of moonlight.'},
  plushCometScepter:{id:'plushCometScepter',name:'Plush-Comet Scepter',slot:'weapon',base:46,channel:'spell',focus:true,stats:{int:3},desc:'A stuffed comet charm carries a bright, steady spell.'},
  thimbleOrchestraRod:{id:'thimbleOrchestraRod',name:'Thimble-Orchestra Baton',slot:'weapon',base:48,channel:'spell',focus:true,stats:{int:3},desc:'A conductor’s baton with a chorus of tiny chimes.'},
  lanternThreadStaff:{id:'lanternThreadStaff',name:'Lantern-Thread Staff',slot:'weapon',base:50,channel:'spell',focus:true,stats:{int:3},desc:'A lantern bead lights a path through difficult magic.'},
  velvetNightWand:{id:'velvetNightWand',name:'Velvet-Night Wand',slot:'weapon',base:52,channel:'spell',focus:true,stats:{int:3},desc:'Soft velvet wraps a star-bright spell core.'},
  // Chapter 5 keeps the catalog useful through the finale.
  fairgroundMaul:{id:'fairgroundMaul',name:'Fairground Plush Maul',slot:'weapon',base:66,channel:'heavy',twoHanded:true,stats:{mig:3},desc:'A carnival mallet packed with resilient stuffing.'},
  carouselClub:{id:'carouselClub',name:'Carousel-Horse Club',slot:'weapon',base:68,channel:'heavy',stats:{mig:3},desc:'A wooden carousel pony makes a very determined club.'},
  ticketPuncher:{id:'ticketPuncher',name:'Giant Ticket-Puncher',slot:'weapon',base:70,channel:'heavy',stats:{mig:3,fin:1},desc:'A toy ticket punch with a satisfying, hefty snap.'},
  ringmasterDrum:{id:'ringmasterDrum',name:'Ringmaster’s Drumhammer',slot:'weapon',base:72,channel:'heavy',twoHanded:true,stats:{mig:3},desc:'A stuffed parade drum on a sturdy little handle.'},
  velvetBumper:{id:'velvetBumper',name:'Velvet Bumper Maul',slot:'weapon',base:74,channel:'heavy',stats:{mig:4},desc:'A padded fairground bumper made for a forceful bonk.'},
  cometPin:{id:'cometPin',name:'Comet-Tail Hatpin',slot:'weapon',base:55,channel:'precision',stats:{fin:3},desc:'A fine hatpin trailing bright threads like a comet.'},
  carouselLance:{id:'carouselLance',name:'Carousel Ribbon Lance',slot:'weapon',base:57,channel:'precision',stats:{fin:3},desc:'A nimble lance wrapped in a streamer of satin.'},
  ticketNeedle:{id:'ticketNeedle',name:'Silver Ticket Needle',slot:'weapon',base:59,channel:'precision',stats:{fin:3},desc:'A silver sewing needle sharpened for exact work.'},
  velvetSeamRipper:{id:'velvetSeamRipper',name:'Velvet-Seam Ripper',slot:'weapon',base:61,channel:'precision',stats:{fin:3},desc:'A careful seam tool honed for one clean opening.'},
  ringmasterPin:{id:'ringmasterPin',name:'Ringmaster’s Star Pin',slot:'weapon',base:63,channel:'precision',stats:{fin:4},desc:'A showy lapel pin with a surprisingly sharp point.'},
  fairgroundFirefly:{id:'fairgroundFirefly',name:'Fairground Firefly Wand',slot:'weapon',base:54,channel:'spell',focus:true,stats:{int:3},desc:'A toy firefly lantern guides bright, nimble magic.'},
  carouselMoon:{id:'carouselMoon',name:'Carousel-Moon Scepter',slot:'weapon',base:56,channel:'spell',focus:true,stats:{int:3},desc:'A tiny carousel moon spins up a steady spell.'},
  velvetCometRod:{id:'velvetCometRod',name:'Velvet-Comet Rod',slot:'weapon',base:58,channel:'spell',focus:true,stats:{int:3},desc:'A plush comet tail weaves a trail of light.'},
  ticketStarWand:{id:'ticketStarWand',name:'Golden Ticket Star Wand',slot:'weapon',base:60,channel:'spell',focus:true,stats:{int:3},desc:'A golden ticket folds into a bright spell focus.'},
  midnightCarousel:{id:'midnightCarousel',name:'Midnight Carousel Baton',slot:'weapon',base:62,channel:'spell',focus:true,stats:{int:4},desc:'A little carousel horse circles a deep, velvet spell.'}
});

// Content tiers describe regional stock and stay separate from character levels.
const CATEGORY_BASE = {offhand:16,head:18,body:24,hands:14,feet:14,accessory:22};
const WEAPON_TIERS = Object.freeze({
  sword:1,teacupMace:2,buttonBaton:3,pillowMallet:4,spoonSledge:5,ironsword:6,kettleHammer:7,blanketClub:8,plushMaul:9,pike:10,
  blade:1,spoolblade:2,ribbonRapier:3,pinFoil:4,thimbleSabre:5,glassblade:6,satinNeedle:7,starlingEdge:8,spoolfoil:9,moonlitStiletto:10,
  rod:1,lullabyRod:2,singalongScepter:3,starWand:4,cloudFlute:5,floodrod:6,lullabyScepter:7,lanternWand:8,velvetConductor:9,bedtimeStar:10,
  thimblePike:11,spoolSpear:12,buttonBashers:13,thimbleMaul:14,pincushionPounder:15,bobbinClub:16,kettleDrumHammer:17,patchworkRam:18,thimbleKnocker:19,quiltedSledge:20,fairgroundMaul:21,carouselClub:22,ticketPuncher:23,ringmasterDrum:24,velvetBumper:25,
  pinwheelRapier:11,needleFoil:12,ribbonStiletto:13,safetyPinLance:14,glassBeadDart:15,embroideryStiletto:16,satinSeamRipper:17,clockworkBodkin:18,starButtonStiletto:19,moonThreadNeedle:20,cometPin:21,carouselLance:22,ticketNeedle:23,velvetSeamRipper:24,ringmasterPin:25,
  thimbleChime:11,buttonStarWand:12,ribbonLoomRod:13,bedtimeBobbin:14,starryPincushion:15,moonKiteWand:16,plushCometScepter:17,thimbleOrchestraRod:18,lanternThreadStaff:19,velvetNightWand:20,fairgroundFirefly:21,carouselMoon:22,velvetCometRod:23,ticketStarWand:24,midnightCarousel:25
});
const CATEGORY_TIERS = Object.freeze({
  offhand:['shield','focus','charm','quiltBuckler','thimbleFocus','gateShield','wardingBlanket','buttonShield','tinnyFocus','stitchedWard'],
  head:['cap','pillowCap','earmuffCrown','thimbleHelm','rivethelm','teaCosyHood','ribbonVisor','kettleHelmet','starryHood','paradeBonnet'],
  body:['coat','quiltedVest','oilskin','kettleApron','velvetWaistcoat','rainCape','storybookTunic','festivalCoat','cloudPajamas','captainJacket'],
  hands:['workgloves','ribbonMitts','thimbleGauntlets','pastryMitts','grips','spoolBracers','starGloves','mittenMitts','captainsGloves','woollyWristguards'],
  feet:['wornboots','boots','slipperBoots','rainGaloshes','sockSkates','buttonClogs','waders','cloudSlippers','paradeBoots','stargazerShoes'],
  accessory:['penny','thimblePendant','spoolBracelet','teaCharm','toyCompass','lantern','buttonLocket','bellPendant','band','ribbonBrooch']
});
export const WEAPON_FAMILIES = Object.freeze({
  clubs: Object.freeze({
    name: 'Clubs and bonkers',
    ids: Object.freeze(['sword','buttonBaton','ironsword','blanketClub','buttonBashers','bobbinClub','patchworkRam','thimbleKnocker','carouselClub','ticketPuncher'])
  }),
  mauls: Object.freeze({
    name: 'Mauls and hammers',
    ids: Object.freeze(['teacupMace','pillowMallet','spoonSledge','kettleHammer','plushMaul','thimbleMaul','pincushionPounder','kettleDrumHammer','quiltedSledge','fairgroundMaul','ringmasterDrum','velvetBumper'])
  }),
  spears: Object.freeze({
    name: 'Spears and pikes',
    ids: Object.freeze(['pike','thimblePike','spoolSpear'])
  }),
  needles: Object.freeze({
    name: 'Needles and needleblades',
    ids: Object.freeze(['blade','spoolblade','ribbonRapier','thimbleSabre','satinNeedle','starlingEdge','moonlitStiletto','moonThreadNeedle','ticketNeedle'])
  }),
  foils: Object.freeze({
    name: 'Foils, rapiers and lances',
    ids: Object.freeze(['pinFoil','spoolfoil','pinwheelRapier','needleFoil','safetyPinLance','carouselLance'])
  }),
  stilettos: Object.freeze({
    name: 'Stilettos, pins and darts',
    ids: Object.freeze(['glassblade','ribbonStiletto','glassBeadDart','embroideryStiletto','satinSeamRipper','clockworkBodkin','starButtonStiletto','cometPin','velvetSeamRipper','ringmasterPin'])
  }),
  wands: Object.freeze({
    name: 'Wands',
    ids: Object.freeze(['rod','starWand','lanternWand','thimbleChime','buttonStarWand','moonKiteWand','velvetNightWand','fairgroundFirefly','ticketStarWand'])
  }),
  scepters: Object.freeze({
    name: 'Scepters and rods',
    ids: Object.freeze(['singalongScepter','floodrod','lullabyScepter','ribbonLoomRod','bedtimeBobbin','plushCometScepter','carouselMoon','velvetCometRod'])
  }),
  batons: Object.freeze({
    name: 'Batons, staves and flutes',
    ids: Object.freeze(['lullabyRod','cloudFlute','velvetConductor','bedtimeStar','starryPincushion','thimbleOrchestraRod','lanternThreadStaff','midnightCarousel'])
  })
});
export function familyLabel(item){
  if(!item||item.slot!=='weapon'||!item.family)return '';
  return WEAPON_FAMILIES[item.family]?.name||'';
}
// Relics are priced from chapter income, not the weapon curve: about one chapter's contract coins or
// roughly a hundred of that chapter's wins (design 43). A relic's tier is its chapter. Finale keepsakes
// are never stocked; echoPrice only sets their echo license base.
export const RELIC_CATALOG=Object.freeze({
  feltFang:{chapter:1,price:60},darnedPatch:{chapter:1,price:90},signet:{chapter:1,price:120},seal:{chapter:1,price:180},
  threadSpool:{chapter:2,price:300},patchworkHeart:{chapter:2,price:400},cocoaThimble:{chapter:2,price:450},picnicTin:{chapter:2,price:550},
  luckyButton:{chapter:3,price:1000},dreamBell:{chapter:3,price:1200},
  thimbleGuard:{chapter:4,price:2400},amberMarble:{chapter:4,price:3000},
  ribbonKnot:{chapter:5,price:5000},stuffingSatchel:{chapter:5,price:6000},
  lintLocket:{chapter:1,echoPrice:200},lastToken:{chapter:2,echoPrice:600},seedHeart:{chapter:3,echoPrice:1500},musicBox:{chapter:4,echoPrice:3500},encoreRibbon:{chapter:5,echoPrice:7000}
});
const weaponChapter=tier=>tier<=4?1:tier<=10?2:Math.ceil((tier-10)/5)+2;
const WEAPON_PRICE_ANCHORS=Object.freeze([[1,100],[10,10000],[15,15000],[20,30000],[25,60000]]);
function weaponPrice(tier){
  if(tier<=WEAPON_PRICE_ANCHORS[0][0])return WEAPON_PRICE_ANCHORS[0][1];
  const upperIndex=WEAPON_PRICE_ANCHORS.findIndex(([anchorTier])=>anchorTier>=tier);
  const [lowerTier,lowerPrice]=WEAPON_PRICE_ANCHORS[Math.max(0,upperIndex-1)];
  const [upperTier,upperPrice]=WEAPON_PRICE_ANCHORS[Math.max(0,upperIndex)];
  return Math.round(lowerPrice*Math.pow(upperPrice/lowerPrice,(tier-lowerTier)/(upperTier-lowerTier)));
}
const ARMOR_PRICE_ANCHORS=Object.freeze([[1,1],[4,3.2**3],[6,3750/24],[8,7500/24],[10,15000/24]]);
function armorTierMultiplier(tier){
  if(tier<=4)return 3.2**(tier-1);
  const upperIndex=ARMOR_PRICE_ANCHORS.findIndex(([anchorTier])=>anchorTier>=tier);
  const [lowerTier,lowerMultiplier]=ARMOR_PRICE_ANCHORS[upperIndex-1];
  const [upperTier,upperMultiplier]=ARMOR_PRICE_ANCHORS[upperIndex];
  return lowerMultiplier*Math.pow(upperMultiplier/lowerMultiplier,(tier-lowerTier)/(upperTier-lowerTier));
}
for (const [slot,ids] of Object.entries(CATEGORY_TIERS)) {
  if (ids.length !== 10) throw new Error(`Expected ten ${slot} catalog tiers`);
  ids.forEach((id,index)=>{ const item=ITEMS[id]; item.tier=index+1; item.chapter=Math.ceil((index+1)/2); });
}
for (const [id,tier] of Object.entries(WEAPON_TIERS)) {
  const item=ITEMS[id]; if(!item) throw new Error(`Missing weapon catalog item ${id}`);
  item.tier=tier; item.chapter=weaponChapter(tier);
  item.price=weaponPrice(tier);
}
const seenFamilyWeaponIds = new Set();
for (const [familyId, family] of Object.entries(WEAPON_FAMILIES)) {
  for (const id of family.ids) {
    if (seenFamilyWeaponIds.has(id)) throw new Error(`Weapon ID ${id} appears twice in WEAPON_FAMILIES`);
    seenFamilyWeaponIds.add(id);
    const item = ITEMS[id];
    if (!item || item.slot !== 'weapon') throw new Error(`Unknown weapon ID ${id} in family ${familyId}`);
    item.family = familyId;
  }
}
if (Object.values(ITEMS).some(item => item.slot === 'weapon' && !item.family)) {
  throw new Error('Every weapon needs a weapon family');
}
for (const [id,row] of Object.entries(RELIC_CATALOG)) {
  const item=ITEMS[id]; if(!item||item.slot!=='relic') throw new Error(`Missing relic catalog item ${id}`);
  item.tier=row.chapter; item.chapter=row.chapter; if(row.price)item.price=row.price; else delete item.price; if(row.echoPrice)item.echoPrice=row.echoPrice;
}
if (Object.values(ITEMS).some(item=>item.slot==='relic'&&!Object.hasOwn(RELIC_CATALOG,item.id))) throw new Error('Every relic needs a RELIC_CATALOG row');
for (const [slot,ids] of Object.entries(CATEGORY_TIERS)) for (const id of ids) {
  const item=ITEMS[id]; item.price=Math.round(CATEGORY_BASE[slot]*armorTierMultiplier(item.tier));
}
for (const item of Object.values(ITEMS)) {
  delete item.level;
  const regionalTopTier={1:4,2:10,3:15,4:20,5:25}[item.chapter];
  item.lootEligible=item.slot!=='relic' && !(item.slot==='weapon' && item.tier===regionalTopTier);
}
for (const id of ['rod','sword','blade','shield','focus','charm','coat']) ITEMS[id].lootEligible=false;
for (const item of Object.values(ITEMS)) if (item.slot === 'offhand' && (item.armor || 0) > 0) item.shield = true;

// Material names are save keys in `s.materials` and must never be renamed. These are the display labels shown to players.
export const MATERIAL_LABELS = Object.freeze({
  'Ledger scraps': 'Lint',
  'Canal iron': 'Lost buttons',
  'Runic residue': 'Static charge',
  'Chainback shell': 'Prize tokens',
  'Stamped brass': 'Price stickers',
  'Floodglass': 'Squeaker cores',
  'Floodglass Fragment': 'Drum fragment',
  'Salvaged fittings': 'Spare thread',
  'Repair fittings': 'Patches',
  'Arcade tokens': 'Arcade tokens',
  'Garden twine': 'Garden twine',
  'Attic ribbon': 'Attic ribbon',
  'Arcade lint': 'Prize lint',
  'Prize gears': 'Claw cogs',
  'Glass marbles': 'Runaway marbles',
  'Tin wheels': 'Tin wheels',
  'Golden token': 'Gold token',
  'Garden seeds': 'Garden seeds',
  'Silvershell': 'Silver shell',
  'Sprinkler brass': 'Sprinkler brass',
  'Bright feathers': 'Bright feathers',
  'Garden medallion': 'Garden medal',
  'Moth velvet': 'Moth velvet',
  'Packing twine': 'Packing twine',
  'Clock springs': 'Clock springs',
  'Soft buttons': 'Soft buttons',
  'Keepsake key': 'Keepsake key',
  'Painted papier-mâché': 'Painted paper',
  'Carousel brass': 'Carousel brass',
  'Velvet tickets': 'Velvet tickets',
  'Ringmaster ribbon': 'Ringmaster ribbon',
  'Velvet star': 'Velvet star'
});
export function materialLabel(key) {
  return typeof key === 'string' && Object.hasOwn(MATERIAL_LABELS, key) ? MATERIAL_LABELS[key] : String(key ?? '');
}

export const MATERIAL_CHAPTER = Object.freeze({
  'Ledger scraps': 1,
  'Canal iron': 1,
  'Runic residue': 1,
  'Chainback shell': 1,
  'Stamped brass': 1,
  'Floodglass': 1,
  'Floodglass Fragment': 1,
  'Arcade lint': 2,
  'Prize gears': 2,
  'Glass marbles': 2,
  'Tin wheels': 2,
  'Golden token': 2,
  'Arcade tokens': 2,
  'Garden seeds': 3,
  'Silvershell': 3,
  'Sprinkler brass': 3,
  'Bright feathers': 3,
  'Garden medallion': 3,
  'Garden twine': 3,
  'Moth velvet': 4,
  'Packing twine': 4,
  'Clock springs': 4,
  'Soft buttons': 4,
  'Keepsake key': 4,
  'Attic ribbon': 4,
  'Painted papier-mâché': 5,
  'Carousel brass': 5,
  'Velvet tickets': 5,
  'Ringmaster ribbon': 5,
  'Velvet star': 5,
  'Salvaged fittings': 'general',
  'Repair fittings': 'general'
});

export function recipeRegion(recipe) {
  let highest = null;
  const cost = recipe?.cost || {};
  for (const mat of Object.keys(cost)) {
    const ch = MATERIAL_CHAPTER[mat];
    if (typeof ch === 'number') {
      if (highest === null || ch > highest) highest = ch;
    }
  }
  return highest !== null ? highest : 'general';
}

const REGIONAL_MATERIAL_FAMILIES=Object.freeze({
  2:Object.freeze({physical:'Prize gears',spell:'Arcade lint',armor:'Glass marbles',ward:'Tin wheels'}),
  3:Object.freeze({physical:'Sprinkler brass',spell:'Bright feathers',armor:'Garden seeds',ward:'Silvershell'}),
  4:Object.freeze({physical:'Clock springs',spell:'Moth velvet',armor:'Packing twine',ward:'Soft buttons'}),
  5:Object.freeze({physical:'Carousel brass',spell:'Painted papier-mâché',armor:'Ringmaster ribbon',ward:'Velvet tickets'})
});
const AFFIX_MATERIAL_FAMILY=Object.freeze({keen:'physical',of_might:'physical',focused:'spell',of_insight:'spell',sturdy:'armor',of_vigor:'armor',warded:'ward',of_the_tide:'ward'});
function upgradeMaterialFamily(item){return item.base?(item.channel==='spell'?'spell':'physical'):item.armor?'armor':item.ward?'ward':'spell';}
function regionalMaterial(item,family,legacyMaterial){
 const candidate=item?.chapter===1?legacyMaterial:REGIONAL_MATERIAL_FAMILIES[item?.chapter]?.[family],region=MATERIAL_CHAPTER[candidate];
 return region===item?.chapter||item?.chapter===1&&region==='general'?candidate:legacyMaterial;
}

// Exchanges use guaranteed drops and quest materials; boss fragments always have a sink.
export const EXCHANGES = Object.freeze({
  ledger_fittings:{id:'ledger_fittings',name:'Sort lint',cost:{'Ledger scraps':3},gain:{'Salvaged fittings':1},coins:5},
  iron_fittings:{id:'iron_fittings',name:'Sort lost buttons',cost:{'Canal iron':2},gain:{'Salvaged fittings':1},coins:8},
  repair_parts:{id:'repair_parts',name:'Unpick patches into spare thread',cost:{'Repair fittings':2},gain:{'Salvaged fittings':1},coins:0},
  residue_parts:{id:'residue_parts',name:'Bottle static charge',cost:{'Runic residue':2},gain:{'Floodglass':1},coins:12},
  shell_parts:{id:'shell_parts',name:'Trade in prize tokens',cost:{'Chainback shell':2},gain:{'Repair fittings':2},coins:15},
  brass_parts:{id:'brass_parts',name:'Rework price stickers',cost:{'Stamped brass':2},gain:{'Repair fittings':3},coins:20},
  fragment_glass:{id:'fragment_glass',name:'Stabilize a drum fragment',cost:{'Floodglass Fragment':1},gain:{'Floodglass':3,'Repair fittings':2},coins:0},
  salvage_glass:{id:'salvage_glass',name:'Unpick squeaker cores',cost:{'Floodglass':2},gain:{'Salvaged fittings':2},coins:15},
  fittings_repair:{id:'fittings_repair',name:'Turn spare thread into patches',cost:{'Salvaged fittings':2},gain:{'Repair fittings':2},coins:0},
  craft_cap:{id:'craft_cap',name:'Assemble a ledger-keeper’s cap',cost:{'Ledger scraps':2,'Salvaged fittings':1},gain:{},gainItems:['cap'],coins:8,level:1},
  craft_boots:{id:'craft_boots',name:'Assemble sluicewalker boots',cost:{'Canal iron':3,'Ledger scraps':2},gain:{},gainItems:['boots'],coins:18,level:2},
  craft_gate_shield:{id:'craft_gate_shield',name:'Rivet a gate shield',cost:{'Canal iron':3,'Salvaged fittings':2},gain:{},gainItems:['gateShield'],coins:24,level:3},
  fragment_seal:{id:'fragment_seal',name:'Forge the Keeper’s Brass Button',cost:{'Floodglass Fragment':5},gain:{},gainItems:['seal'],coins:0,level:8},
  fragment_band:{id:'fragment_band',name:'Forge a Squeaker-Glass Ring',cost:{'Floodglass Fragment':5},gain:{},gainItems:['band'],coins:0,level:8},
  arcade_tokens_gears:{id:'arcade_tokens_gears',name:'Press tokens into claw cogs',cost:{'Arcade tokens':2},gain:{'Prize gears':1},coins:0,chapter:2},
  arcade_wheels_marbles:{id:'arcade_wheels_marbles',name:'Trade tin wheels for loose marbles',cost:{'Tin wheels':2},gain:{'Glass marbles':1},coins:0,chapter:2},
  arcade_champion_token:{id:'arcade_champion_token',name:'Rebuild a champion’s gold token',cost:{'Arcade lint':4,'Prize gears':4},gain:{'Golden token':1},coins:100,chapter:2},
  garden_twine_seeds:{id:'garden_twine_seeds',name:'Unpick twine into seed packets',cost:{'Garden twine':2},gain:{'Garden seeds':1},coins:0,chapter:3},
  garden_shell_brass:{id:'garden_shell_brass',name:'Trade silver shells for sprinkler brass',cost:{'Silvershell':2},gain:{'Sprinkler brass':1},coins:0,chapter:3},
  garden_medallion_exchange:{id:'garden_medallion_exchange',name:'Stamp a garden medal',cost:{'Garden seeds':4,'Bright feathers':4},gain:{'Garden medallion':1},coins:150,chapter:3},
  attic_ribbon_twine:{id:'attic_ribbon_twine',name:'Unpick ribbon into packing twine',cost:{'Attic ribbon':2},gain:{'Packing twine':1},coins:0,chapter:4},
  attic_buttons_springs:{id:'attic_buttons_springs',name:'Wind buttons into clock springs',cost:{'Soft buttons':2},gain:{'Clock springs':1},coins:0,chapter:4},
  attic_keepsake_key:{id:'attic_keepsake_key',name:'Cut a spare keepsake key',cost:{'Moth velvet':4,'Soft buttons':4},gain:{'Keepsake key':1},coins:300,chapter:4},
  fair_ticket_ribbon:{id:'fair_ticket_ribbon',name:'Unspool tickets into ringmaster ribbon',cost:{'Velvet tickets':2},gain:{'Ringmaster ribbon':1},coins:0,chapter:5},
  fair_paper_brass:{id:'fair_paper_brass',name:'Trade painted paper for carousel brass',cost:{'Painted papier-mâché':2},gain:{'Carousel brass':1},coins:0,chapter:5},
  fair_velvet_star:{id:'fair_velvet_star',name:'Set a spare velvet star',cost:{'Painted papier-mâché':4,'Ringmaster ribbon':4},gain:{'Velvet star':1},coins:500,chapter:5}
});

export const PREFIXES = Object.freeze({
  sturdy:{id:'sturdy',name:'Sturdy',slots:['head','body','hands','feet','offhand'],bonus:{armor:3},cost:{coins:24,materials:{'Salvaged fittings':1}}},
  warded:{id:'warded',name:'Warded',slots:['head','body','hands','feet','offhand','accessory','relic'],bonus:{ward:3},cost:{coins:28,materials:{'Runic residue':1}}},
  keen:{id:'keen',name:'Keen',slots:['weapon'],bonus:{base:2},cost:{coins:30,materials:{'Canal iron':1}}},
  focused:{id:'focused',name:'Focused',slots:['weapon','offhand'],bonus:{spellBase:1},cost:{coins:30,materials:{'Runic residue':1}}}
});
export const SUFFIXES = Object.freeze({
  of_might:{id:'of_might',name:'of Might',slots:['weapon','hands'],bonus:{stats:{mig:1}},cost:{coins:32,materials:{'Chainback shell':1}}},
  of_insight:{id:'of_insight',name:'of Insight',slots:['head','feet','accessory','relic','offhand'],bonus:{stats:{ins:1}},cost:{coins:30,materials:{'Runic residue':1}}},
  of_vigor:{id:'of_vigor',name:'of Vigor',slots:['body','hands','feet','head'],bonus:{stats:{vit:1}},cost:{coins:34,materials:{'Repair fittings':1}}},
  of_the_tide:{id:'of_the_tide',name:'of the Tide',slots:['body','feet','accessory','relic','offhand'],bonus:{ward:2},cost:{coins:28,materials:{'Floodglass':1}}}
});

export const LAB_MENDERS = Object.freeze({
  mender_kit: Object.freeze({
    id: 'mender_kit',
    name: 'Thread-and-Thimble Kit',
    slot: 'offhand',
    kind: 'mender',
    mend: 6,
    stats: { wil: 1 },
    level: 1,
    price: 15,
    desc: 'A stuffie-scale sewing kit. Restores Stuffing on strike, useful Guard, and Recover.'
  }),
  bandage_roll: Object.freeze({
    id: 'bandage_roll',
    name: 'Bandage Roll',
    slot: 'offhand',
    kind: 'mender',
    mend: 10,
    stats: { wil: 2 },
    level: 5,
    price: 45,
    desc: 'Clean linen bandages for serious stuffing repairs.'
  })
});

const LOCKED = s => !!(s?.fight || s?.delve);
const noCost = () => ({coins:0,materials:{}});
const clone = x => JSON.parse(JSON.stringify(x));
function getItem(s, id) { return s?.customItems?.[id] || ITEMS[id] || (s?.rulesPreview?.twoHands ? LAB_MENDERS[id] : null) || null; }
function canFit(item,slot,s){
  if (!item) return false;
  if (s?.rulesPreview?.twoHands) {
    if (slot === 'offhand' && item.slot === 'weapon' && !item.twoHanded) return true;
    if (slot === 'offhand' && item.kind === 'mender') return true;
  }
  return slotsFor(item).includes(slot);
}
function owned(s,id){return Array.isArray(s?.bag)&&s.bag.includes(id);}
function costAffordable(s,cost){return (s.coins||0)>=(cost.coins||0)&&Object.entries(cost.materials||{}).every(([m,n])=>(s.materials?.[m]||0)>=n);}
function spend(s,cost){s.coins-=cost.coins||0;for(const [m,n]of Object.entries(cost.materials||{}))s.materials[m]-=n;}
function makeCost(coins=0,materials={}){return {coins,materials:{...materials}};}

export function effectiveItem(s,id){
  const base=getItem(s,id);if(!base)return null;
  const item=clone(base),mod=s?.itemMods?.[id]||{};
  const up=Math.max(0,Math.min(3,Number.isInteger(mod.upgrade)?mod.upgrade:0));
  const inc={base:0,armor:0,ward:0,spellBase:0};
  let upgradeStat=null;
  if(base.base)inc.base=up*(base.twoHanded?2:1);
  else if(base.armor)inc.armor=up;
  else if(base.ward)inc.ward=up;
  else if(base.spellBase)inc.spellBase=up;
  else upgradeStat=Object.keys(base.stats||{})[0]||({head:'ins',body:'vit',hands:'mig',feet:'fin',offhand:'vit',accessory:'ins',relic:'wil'}[base.slot]||'vit');
  for(const key of ['base','armor','ward','spellBase'])item[key]=(item[key]||0)+inc[key];
  if(upgradeStat)item.stats={...item.stats,[upgradeStat]:(item.stats?.[upgradeStat]||0)+up};
  const bonuses=[];
  const affixIds={prefix:null,suffix:null};
  for(const kind of ['prefix','suffix']){const aff=(kind==='prefix'?PREFIXES:SUFFIXES)[mod[kind]];if(aff&&aff.slots.includes(base.slot)){bonuses.push(aff.bonus);affixIds[kind]=mod[kind];}}
  for(const bonus of bonuses){for(const key of ['base','armor','ward','spellBase'])item[key]=(item[key]||0)+(bonus[key]||0);for(const [stat,n]of Object.entries(bonus.stats||{})){item.stats={...item.stats,[stat]:(item.stats?.[stat]||0)+n};}}
  item.upgrade=up;item.prefix=affixIds.prefix;item.suffix=affixIds.suffix;
  item.name=`${affixIds.prefix?`${PREFIXES[affixIds.prefix].name} `:''}${base.name}${affixIds.suffix?` ${SUFFIXES[affixIds.suffix].name}`:''}${up?` +${up}`:''}`;
  return item;
}

const CHANNEL_ATTRIBUTE=Object.freeze({heavy:'mig',precision:'fin',spell:'int'});
export function weaponRankScore(s,id){
  const item=effectiveItem(s,id),primary=item&&CHANNEL_ATTRIBUTE[item.channel];
  if(!item||item.slot!=='weapon'||!primary)return null;
  return item.base+1.8*(item.stats?.[primary]||0);
}
export function isStrictWeaponDowngrade(s,candidateId,currentId=s?.gear?.weapon){
  const candidate=getItem(s,candidateId),current=getItem(s,currentId);
  if(!candidate||!current||candidate.slot!=='weapon'||current.slot!=='weapon'||candidate.channel!==current.channel)return false;
  return weaponRankScore(s,candidateId)<weaponRankScore(s,currentId);
}

export function resolveItem(s,id){const item=effectiveItem(s,id);return item?{...item,owned:owned(s,id),levelRequired:null,usable:true}:null;}
export function slotChoices(s,id){
  const item=getItem(s,id);if(!item||!owned(s,id))return [];
  let slots=slotsFor(item);
  if(s?.rulesPreview?.twoHands){
    if(item.slot==='weapon'&&!item.twoHanded&&!slots.includes('offhand'))slots=[...slots,'offhand'];
    if(item.kind==='mender'&&!slots.includes('offhand'))slots=[...slots,'offhand'];
  }
  return slots.filter(slot=>!(slot==='offhand'&&getItem(s,s.gear?.weapon)?.twoHanded));
}
export function unequipReason(s,slot){
  if(LOCKED(s))return 'Equipment cannot be changed during a fight or delve.';
  if(!SLOTS[slot])return 'Unknown equipment slot.';
  if(!s.gear?.[slot])return 'That slot is already empty.';
  if(slot==='weapon')return 'A weapon is required for the universal Attack action. Equip another weapon first.';
  return null;
}
export function equipItem(s,id,targetSlot){
  const item=getItem(s,id);if(LOCKED(s)||!item||!owned(s,id))return false;
  const slots=slotChoices(s,id);const slot=targetSlot||slots.find(x=>!s.gear?.[x])||slots[0];
  if(!slot||!slots.includes(slot)||!canFit(item,slot,s))return false;
  const gear={...(s.gear||{})};for(const key of SLOT_KEYS)if(gear[key]===id)gear[key]=null;
  if(item.twoHanded)gear.offhand=null;
  gear[slot]=id;
  if(slot==='offhand'&&!gear.weapon)return false;
  s.gear=gear;return true;
}
export function unequipItem(s,slot){if(unequipReason(s,slot))return false;s.gear[slot]=null;return true;}
export function buyPreview(s,id){
  const item=getItem(s,id),price=item?.price||0;
  const chapterRequired=item?.chapter||null;
  let reason=!item?'Unknown item.':LOCKED(s)?'Shopping is unavailable during a fight or delve.':!chapterUnlocked(s,chapterRequired)?`This stock opens in Chapter ${chapterRequired}.`:!price?'This item is not stocked by the outfitter.':owned(s,id)?'You already own this item.':(s.coins||0)<price?'You cannot afford this item.':null;
  return {allowed:!reason,reason,price,item:item?clone(item):null,tier:item?.tier||null,tierLabel:item?`Tier ${item.tier}`:null,chapterRequired,chapterCurrent:currentChapter(s),levelRequired:null};
}
export function buyItem(s,id){
  const p=buyPreview(s,id);if(!p.allowed||!Array.isArray(s.bag))return false;
  s.coins-=p.price;s.bag.push(id);if(s.itemMods)delete s.itemMods[id];return true;
}
export function buyAndEquipPreview(s,id,targetSlot){
  const purchase=buyPreview(s,id), item=getItem(s,id);
  let slots=slotsFor(item);
  if(s?.rulesPreview?.twoHands){
    if(item?.slot==='weapon'&&!item?.twoHanded&&!slots.includes('offhand'))slots=[...slots,'offhand'];
    if(item?.kind==='mender'&&!slots.includes('offhand'))slots=[...slots,'offhand'];
  }
  slots=slots.filter(slot=>!(slot==='offhand'&&getItem(s,s?.gear?.weapon)?.twoHanded));
  const selectedSlot=targetSlot||slots.find(slot=>!s?.gear?.[slot])||slots[0]||null;
  let reason=purchase.reason;
  if(!reason&&(!selectedSlot||!slots.includes(selectedSlot)||!canFit(item,selectedSlot,s)))reason='That item cannot be equipped in the selected slot.';
  return {...purchase,allowed:!reason,reason,slotChoices:slots,selectedSlot,willReplace:selectedSlot?s?.gear?.[selectedSlot]||null:null,willClearOffhand:!!(item?.twoHanded&&s?.gear?.offhand)};
}
export function buyAndEquipItem(s,id,targetSlot){
  const p=buyAndEquipPreview(s,id,targetSlot);
  if(!p.allowed||!Array.isArray(s.bag))return false;
  // Validate the eventual loadout before changing coins or ownership.
  if(LOCKED(s))return false;
  const item=getItem(s,id);
  const gear={...(s.gear||{})};
  if(item?.twoHanded)gear.offhand=null;
  for(const key of SLOT_KEYS)if(gear[key]===id)gear[key]=null;
  gear[p.selectedSlot]=id;
  if(p.selectedSlot==='offhand'&&!gear.weapon)return false;
  s.coins-=p.price;s.bag.push(id);if(s.itemMods)delete s.itemMods[id];s.gear=gear;
  return {id,slot:p.selectedSlot,price:p.price,clearedOffhand:p.willClearOffhand};
}
const CHAPTER_SALVAGE = Object.freeze([0,3,6,11,20,38]);
function baseResaleValue(item){return CHAPTER_SALVAGE[item.chapter]||3;}
const CRAFT_SALE_CAPS = Object.freeze({cap:8,boots:18,gateShield:24,seal:1,band:1});
function resaleValue(s,id){
  const item=getItem(s,id);if(!item)return 0;
  const base=baseResaleValue(item),up=Math.max(0,Math.min(3,Number.isInteger(s.itemMods?.[id]?.upgrade)?s.itemMods[id].upgrade:0));
  // Regional salvage receipts track local coin rewards, not exponential sticker prices.
  // Upgrades return at most three extra coins, and affixes return no material value.
  const craftCap=Object.hasOwn(CRAFT_SALE_CAPS,id)?CRAFT_SALE_CAPS[id]:Infinity;
  return Math.max(1,Math.min(base+up,craftCap));
}
export function sellPreview(s,id){
  const item=getItem(s,id),price=item?resaleValue(s,id):0;
  const equipped=Object.values(s?.gear||{}).includes(id);
  const activeEcho=s?.relicSockets?.some(socket=>socket?.unlocked&&socket.relicId===id);
  let reason=!item?'Unknown item.':LOCKED(s)?'Selling is unavailable during a fight or delve.':!owned(s,id)?'You do not own this item.':equipped?'Unequip this item before selling it.':activeEcho?'Clear all active echo sockets using this relic before selling it.':item.keepsake?'Finale keepsakes stay with you; they cannot be sold.':null;
  return {allowed:!reason,reason,price,item:item?resolveItem(s,id):null,id};
}
export function sellItem(s,id){
  const p=sellPreview(s,id);if(!p.allowed||!Array.isArray(s.bag))return false;
  s.bag=s.bag.filter(ownedId=>ownedId!==id);if(s.itemMods)delete s.itemMods[id];if(s.relicRanks)delete s.relicRanks[id];s.coins+=p.price;
  return {id,coins:p.price};
}
export function exchangeMaterials(s,recipeId){
  const recipe=EXCHANGES[recipeId];if(LOCKED(s)||!recipe||(recipe.chapter&&!chapterUnlocked(s,recipe.chapter))||!costAffordable(s,{coins:recipe.coins,materials:recipe.cost})||(recipe.gainItems||[]).some(id=>!ITEMS[id]||owned(s,id)))return false;
  spend(s,{coins:recipe.coins,materials:recipe.cost});s.materials??={};for(const [m,n]of Object.entries(recipe.gain||{}))s.materials[m]=(s.materials[m]||0)+n;
  const gainedItems=[...(recipe.gainItems||[])];s.bag??=[];for(const id of gainedItems)s.bag.push(id);
  return {recipeId,gained:{...(recipe.gain||{})},gainedItems};
}

const UPGRADE_COINS=[0,35,70,120];
const UPGRADE_CHAPTER_MULTIPLIERS=[1,1,4,16,64,256];
function upgradeCost(item,level){const oldMat=item.base?(item.channel==='spell'?'Runic residue':'Canal iron'):item.armor?'Salvaged fittings':item.ward?'Repair fittings':'Runic residue';const mat=regionalMaterial(item,upgradeMaterialFamily(item),oldMat);const coins=UPGRADE_COINS[level+1]*(UPGRADE_CHAPTER_MULTIPLIERS[item.chapter]||1);return makeCost(coins,{[mat]:level===2?2:1});}
export function affixCost(item,affix){if(!affix)return noCost();const oldMat=Object.keys(affix.cost.materials||{})[0];const fallbackFamily=oldMat==='Canal iron'||oldMat==='Chainback shell'?'physical':oldMat==='Salvaged fittings'||oldMat==='Repair fittings'?'armor':'spell';const mat=regionalMaterial(item,AFFIX_MATERIAL_FAMILY[affix.id]||fallbackFamily,oldMat);return makeCost(affix.cost.coins*(UPGRADE_CHAPTER_MULTIPLIERS[item?.chapter]||1),{[mat]:Object.values(affix.cost.materials||{})[0]||1});}
function statPreview(s,id,nextMods){const before=effectiveItem(s,id),after=effectiveItem({...s,itemMods:{...s.itemMods,[id]:nextMods}},id);return {before,after};}
export function upgradePreview(s,id){
 const item=ITEMS[id],mod=s?.itemMods?.[id]||{},level=mod.upgrade||0,cost=item&&level<3?upgradeCost(item,level):noCost();
 let reason=!item?'Unknown item.':LOCKED(s)?'Equipment cannot be changed during a fight or delve.':!owned(s,id)?'You do not own this item.':level>=3?'This item is already at the upgrade cap.':!costAffordable(s,cost)?'You cannot afford this upgrade.':null;
 const next={...mod,upgrade:Math.min(3,level+1)};const pair=item?statPreview(s,id,next):{before:null,after:null};
 return {allowed:!reason,reason,cost,before:pair.before,after:pair.after,level,cap:3};
}
export function upgradeItem(s,id){const p=upgradePreview(s,id);if(!p.allowed)return false;spend(s,p.cost);s.itemMods??={};s.itemMods[id]={...(s.itemMods[id]||{}),upgrade:p.level+1};return {id,upgrade:p.level+1};}
function affixPreviewBase(s,id,kind,affixId){
 const item=ITEMS[id],list=kind==='prefix'?PREFIXES:kind==='suffix'?SUFFIXES:null,affix=list?.[affixId],mod=s?.itemMods?.[id]||{},slot=item?.slot;
 const cost=affixCost(item,affix);
 let reason=!item?'Unknown item.':LOCKED(s)?'Equipment cannot be changed during a fight or delve.':!owned(s,id)?'You do not own this item.':!affix?'Unknown affix.':!affix.slots.includes(slot)?'That affix does not fit this item slot.':mod[kind]===affixId?'That affix is already applied.':!costAffordable(s,cost)?'You cannot afford this affix.':null;
 const next={...mod,[kind]:affixId};const pair=item?statPreview(s,id,next):{before:null,after:null};
 return {allowed:!reason,reason,cost,before:pair.before,after:pair.after,kind,affixId,replacing:mod[kind]||null};
}
export function affixPreview(s,id,kind,affixId){return affixPreviewBase(s,id,kind,affixId);}
export function applyAffix(s,id,kind,affixId){const p=affixPreviewBase(s,id,kind,affixId);if(!p.allowed)return false;spend(s,p.cost);s.itemMods??={};s.itemMods[id]={...(s.itemMods[id]||{}),[kind]:affixId};return {id,kind,affixId,replaced:p.replacing};}

export function normalizeGearState(s){
  if(!s||typeof s!=='object')return s;
  s.bag=Array.isArray(s.bag)?[...new Set(s.bag.filter(id=>ITEMS[id]))]:[];
  const old=s.gear&&typeof s.gear==='object'?s.gear:{};const gear=Object.fromEntries(SLOT_KEYS.map(k=>[k,null]));
  // Preserve legacy equipment absent from the bag, then accept only a single valid slot per id.
  for(const slot of SLOT_KEYS){const id=old[slot];if(ITEMS[id]&&!s.bag.includes(id))s.bag.push(id);}
  for(const slot of SLOT_KEYS){const id=old[slot],item=ITEMS[id];if(!item||!s.bag.includes(id)||!canFit(item,slot)||Object.values(gear).includes(id))continue;if(slot==='offhand'&&ITEMS[old.weapon]?.twoHanded)continue;if(item.twoHanded&&slot==='weapon')gear.offhand=null;gear[slot]=id;}
  s.gear=gear;
  const mods={};for(const id of s.bag){const m=s.itemMods?.[id];if(!m||typeof m!=='object')continue;const next={upgrade:Number.isInteger(m.upgrade)?Math.max(0,Math.min(3,m.upgrade)):0};for(const kind of ['prefix','suffix']){const aff=(kind==='prefix'?PREFIXES:SUFFIXES)[m[kind]];if(aff&&aff.slots.includes(ITEMS[id].slot))next[kind]=m[kind];}mods[id]=next;}
  s.itemMods=mods;return s;
}
