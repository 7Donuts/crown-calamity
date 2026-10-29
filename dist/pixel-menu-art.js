/* Original miniature props. Each character is a 2px cell on a 24px canvas. */
const palette={d:'#1B2D36',s:'#536A73',t:'#397773',T:'#6BA397',g:'#687C50',G:'#91A36A',a:'#AE6940',A:'#D99551',y:'#F0C477',c:'#DED1AF',w:'#F1E6C8'};
function prop(rows){
  if(rows.length>12||rows.some(row=>row.length>12||[...row].some(c=>c!=='.'&&!palette[c])))throw new Error('Invalid pixel prop grid');
  const paths={};rows.forEach((row,y)=>{for(let x=0;x<row.length;){const c=row[x];let end=x+1;while(row[end]===c)end++;if(c!=='.')paths[c]=(paths[c]||'')+`M${x*2} ${y*2}h${(end-x)*2}v2H${x*2}z`;x=end;}});
  return Object.entries(paths).map(([c,d])=>`<path fill="${palette[c]}" d="${d}"/>`).join('');
}
const art={
 crown:prop(['............','.....yy.....','.y...dd...y.','.dyd.yy.dyd.','.dayAyyAyad.','..dayAAyad..','..dAAAAAAd..','..dyyyyyyd..','..daaAaaad..','...dddddd...']),
 hunt:prop(['.dw......wd.','.dww....wwd.','..dww..wwd..','...dwwwwd...','....dwwd....','...AdwwdA...','..AAddddAA..','...da..ad...','..da....ad..','.da......ad.','..d......d..']),
 sword:prop(['........dd..','.......dwwd.','......dwwsd.','.....dwwsd..','....dwwsd...','...dwwsd....','..dwwsd.....','...dTd......','..dAyAd.....','...dAd......','..dAd.......','...d........']),
 character:prop(['....dddd....','...dyAAyd...','...dATTAd..','..ddTTTTdd..','.dAsTTTTsAd.','.dAAsTTsAAd.','..dAsTTsAd..','...dsyysd...','...dsAAsd...','...dsTTsd...','....dddd....']),
 coat:prop(['....dddd....','...dTccTd...','..dTTccTTd..','.dTTTddTTTd.','.dTTTssTTTd.','.dTTTssTTTd.','..dTTssTTd..','..dTTssTTd..','..dTTyyTTd..','..dTTddTTd..','...dd..dd...']),
 bag:prop(['....dddd....','...dAAAAd..','...dA..Ad...','..ddAddAdd..','.dAAyyyyAAd.','.dAyAAAAyAd.','.dAyAttAyAd.','.dAAAyyAAAd.','.dAAAttAAAd.','..dAAAAAAd..','...dddddd...']),
 market:prop(['.....yy.....','....daAd....','..dddddddd..','.dTTccTTccd.','.dTTccTTccd.','..dddddddd..','..dA....Ad..','..dA.ay.Ad..','..dAddddAd..','.dAAAAAAAAd','.dAAttttAAd.','..dddddddd..']),
 journal:prop(['...ddddddd..','..dTccccccd.','.dTTccccccd.','.dTTcwwwwcd.','.dTTcggggcd.','.dTTcwwwwcd.','.dTTcggggcd.','.dTTccccccd.','.dTTyyyyyyd.','..dTccccccd.','...ddddddd..']),
 scroll:prop(['..dddddddd..','.dccccccAAd.','.dcwwwwcAAd.','..dcggggcd..','..dcwwwwcd..','..dcggggcd..','..dcwwwwcd..','..dccccccd..','.dAAccccccd.','.dAAccccccd.','..dddddddd..']),
 guide:prop(['............','..dd..ddd...','.dTTddcccd..','.dTTTccgcd..','.dTgTccgcd..','.dTgTcgccd..','.dTTTcgccd..','.dTTTcggcd..','.dTTTccccd..','..dddddd...','.....d......']),
 shield:prop(['.....dd.....','...ddyydd...','..dTTyyTTd..','.dTTTyyTTTd.','.dTTTyyTTTd.','.dTTyyyyTTd.','.dTTTyyTTTd.','..dTTyyTTd..','...dTyyTd...','....dyyd....','.....dd.....']),
 staff:prop(['.......dd...','......dTTd..','.....dTwwTd.','......dTTd..','.......Ad...','......dAd...','.....dAd....','....dAd.....','...dAd......','..dAd.......','.dAd........','..d.........']),
 lock:prop(['....dddd....','...dyyyyd..','..dy....yd..','..dy....yd..','..dy....yd..','.dddddddddd.','.dAAyyyyAAd.','.dAAddddAAd.','.dAAdyydAd.','.dAAAddAAAd.','..dddddddd..']),
 leaf:prop(['........dd..','......ddGd..','....ddGGGd..','...dGGgGGd..','..dGGggGd...','.dGGggGd....','.dGGggd.....','..dGgd......','...dgd.....','..dgd......','...d........']),
 clock:prop(['....dddd....','..ddyyyydd..','.dyccccccyd.','.dyccddccyd.','dycccddcccyd','dycccddcccyd','dycccdddccyd','.dyccccccyd.','.dyccccccyd.','..ddyyyydd..','....dddd....']),
 settings:prop(['....dddd....','..ddssssdd..','.dssdyydssd.','.dsdyAAydsd.','dssdyAAydssd','dssdyAAydssd','.dsdyAAydsd.','.dssdyydssd.','..ddssssdd..','....dddd....']),
 lab:prop(['....dddd....','....dTTd....','....dTTd....','...dTwwTd...','..dTTwwTTd..','.dTTTTTTTTd.','.dTTyyyyTTd.','.dTTTyyTTTd.','..dTTTTTTd..','...dddddd...']),
 pin:prop(['....dddd....','...dyyyyd..','..dyAAAAyd.','..dyAddAyd..','..dyAddAyd..','..dyAAAAyd..','...dyAAyd...','....dyyd....','.....dd.....','.....dd.....']),
 spark:prop(['.....dd.....','.....yyd....','....dyyd....','..dddyyddd..','.dyyywwyyyd.','..dddyydd..','....dyyd....','.....yyd....','.....dd.....']),
 cross:prop(['....dddd....','....dGGd....','....dGGd....','.ddddGGdddd.','.dGGGGGGGGd.','.dGGGGGGGGd.','.ddddGGdddd.','....dGGd....','....dGGd....','....dddd....']),
 close:prop(['............','..dd....dd..','.dAAd..dAAd.','..dAAddAAd..','...dAAAAd...','....dAAd....','...dAAAAd...','..dAAddAAd..','.dAAd..dAAd.','..dd....dd..']),
 check:prop(['............','.........dd.','........dGGd','.......dGGd.','..dd..dGGd..','.dGGddGGd...','..dGGGGd....','...dGGd.....','....dd......']),
 arrow:prop(['............','......dd....','......dyd...','..dddddyyd..','.dyyyyyyyyd.','.dyyyyyyyyd.','..dddddyyd..','......dyd...','......dd....']),
 chevron:prop(['............','....dd......','....dyd.....','.....dyd....','......dyd...','.......dyd..','......dyd...','.....dyd....','....dyd.....','....dd......']),
 compare:prop(['..ddd..ddd..','.dTcd..dTcd.','.dTcd..dTcd.','.dTcd..dTcd.','.dTcd..dTcd.','.dTcd..dTcd.','.dTcd..dTcd.','.dTcd..dTcd.','.dTcd..dTcd.','..ddd..ddd..']),
 download:prop(['.....dd.....','....dTTd....','....dTTd....','..dddTTddd..','..dTTTTTTd..','...dTTTTd...','....dTTd....','.....dd.....','.dddddddddd.','.dAAAAAAAAd','..dddddddd..']),
 exit:prop(['..dddddd....','..dATTAd....','..dATTAd....','..dATTAdddd.','..dATTdyAAAd','..dATTdyAAAd','..dATTAdddd.','..dATTAd....','..dATTAd....','..dddddd....']),
 chat:prop(['..dddddddd..','.dccccccccd.','.dcTTTTTTcd.','.dccccccccd.','.dcTTTTcccd.','.dccccccccd.','..ddddcddd..','.....dcd....','.....dd.....']),
 coin:prop(['....dddd....','..ddyyyydd..','.dyAAAAAAyd.','.dyAyyyyAyd.','dyAAyAAyAAyd','dyAAyAAyAAyd','.dyAyyyyAyd.','.dyAAAAAAyd.','..ddyyyydd..','....dddd....']),
 heart:prop(['............','..ddd..ddd..','.dGGGddGGGd.','.dGGwGGGGGd.','.dGGGGGGGGd.','..dGGGGGGd..','...dGGGGd...','....dGGd....','.....dd.....']),
 mana:prop(['.....dd.....','....dTTd....','...dTwwTd...','..dTwwwTTd..','.dTTwwwTTTd.','.dTTTTTTTTd.','..dTTTTTTd..','...dTTTTd...','....dddd....']),
 bolt:prop(['......dddd..','.....dyyyd..','....dyyyd...','...dyyyd....','..dyyydddd..','..dddyyyyd..','....dyyyd...','...dyyyd....','..dyyyd.....','..dddd......']),
 rest:prop(['....dd......','....dAd.....','...dAAAd....','..dAAyyAd...','..dAyyyyAd..','...dywyd....','....ddd.....','..ddAAAAdd..','.dAAAAAAAAd','..dddddddd..']),
};
art.overview=art.character;art.workbench=prop(['...dd.......','..dAAd......','...dAAd.....','....dAAdd...','.....dAAAAd.','..ddddAAAAd.','.dssssdddd..','..dssssssd..','...dsssssd..','....dddddd..']);
art.materials=prop(['....dddd....','...dccccd...','...dcyycd...','..ddcTTcdd..','.dcccTTcccd.','.dccccccccd.','.dccTTTTccd.','..dccTTccd..','...dddddd...']);
art.buy=art.coin;art.sell=art.bag;
export const PIXEL_MENU_ART=Object.freeze(art);
