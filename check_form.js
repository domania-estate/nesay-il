
mapboxgl.accessToken='pk.eyJ1IjoibmVzYXkiLCJhIjoiY21xeTZpeHllMHg0dzJ0c2Vma2Vsc3N3ayJ9._ABUJLdsv0SC6upvQ4gP2w';

// ═══ DATA ═══
const listings=[
  {id:1,dealType:'rent',thumb:'linear-gradient(135deg,#1a3a5c,#0d5480)',icon:'🏢',priceNum:8500,addr:{ru:'Ибн Гвироль 78, Тель-Авив',he:'אבן גבירול 78, תל אביב',en:'Ibn Gabirol 78, Tel Aviv'},rooms:4,sqm:110,floor:'7/14',tags:{ru:['Безоп. комн. ✓','Балкон ✓','Парковка','Кондиц.'],he:["ממ\"ד ✓",'מרפסת ✓','חניה','מזגן'],en:['Safe room ✓','Balcony ✓','Parking','A/C']},hi:[0,1],desc:{ru:'Отличная квартира в Северном Тель-Авиве. Высокий этаж, открытый вид.',he:'דירה מצוינת בצפון תל אביב.',en:'Excellent apartment in North Tel Aviv.'},agent:{name:'Roni Tzadok',initials:'RT',type:'agent',verified:true,deals:43,rating:4.9,reviews:127,honesty:92},badge:'top',promoted:true,_promoMins:1380,lat:32.0858,lng:34.7823},
  {id:2,dealType:'rent',thumb:'linear-gradient(135deg,#2d4a1e,#4a7c2f)',icon:'🌿',priceNum:6200,addr:{ru:'Биалик 12, Ришон',he:'ביאליק 12, ראשון לציון',en:'Bialik 12, Rishon LeZion'},rooms:3,sqm:85,floor:'2/6',tags:{ru:['Сад ✓','Парковка','Двор'],he:['גינה ✓','חניה','קדמי'],en:['Garden ✓','Parking','Front']},hi:[0],desc:{ru:'Красивая квартира с частным садом.',he:'דירה יפה עם גינה פרטית.',en:'Beautiful apartment with private garden.'},agent:{name:'Michal Israeli',initials:'MI',type:'owner',verified:false,deals:3,rating:4.2,reviews:8,honesty:45},badge:'new',lat:31.9896,lng:34.7993},
  {id:3,dealType:'sale',thumb:'linear-gradient(135deg,#5c1a3a,#8f2d5c)',icon:'🏙️',priceNum:2800000,addr:{ru:'Ротшильд 88, Тель-Авив',he:'רוטשילד 88, תל אביב',en:'Rothschild 88, Tel Aviv'},rooms:4.5,sqm:166,floor:'18/18',tags:{ru:['Безоп. комн. ✓','Крыша ✓','2 паркинга','Вид на море'],he:["ממ\"ד ✓",'גג ✓','2 חניות','נוף ים'],en:['Safe room ✓','Roof ✓','2 parking','Sea view']},hi:[0,1],desc:{ru:'Пентхаус на Ротшильд с видом на море.',he:'פנטהאוס ברוטשילד עם נוף לים.',en:'Penthouse on Rothschild with sea view.'},agent:{name:'Anglo-Saxon',initials:'AS',type:'agency',verified:true,deals:210,rating:4.7,reviews:532,honesty:88},badge:null,lat:32.0699,lng:34.7744},
  {id:4,dealType:'rent',thumb:'linear-gradient(135deg,#1a3a5c,#2c5f8a)',icon:'🏘️',priceNum:4500,addr:{ru:'Герцль 44, Хайфа',he:'הרצל 44, חיפה',en:'Herzl 44, Haifa'},rooms:2,sqm:55,floor:'1/4',tags:{ru:['Балкон','Лифт'],he:['מרפסת','מעלית'],en:['Balcony','Elevator']},hi:[],desc:{ru:'Тихая 2-комнатная квартира.',he:'דירת 2 חדרים שקטה.',en:'Quiet 2-room apartment.'},agent:{name:'David Levy',initials:'DL',type:'agent',verified:false,deals:19,rating:4.0,reviews:31,honesty:62},badge:null,lat:32.7940,lng:34.9896},
  {id:5,dealType:'sale',thumb:'linear-gradient(135deg,#3a2a0e,#7a5a20)',icon:'🏠',priceNum:1950000,addr:{ru:'Шиболим 3, Раанана',he:'שיבולים 3, רעננה',en:"Shibolim 3, Ra'anana"},rooms:5,sqm:140,floor:'1/1',tags:{ru:['Сад ✓','2 паркинга','Кондиц.'],he:['גינה ✓','2 חניות','מזגן'],en:['Garden ✓','2 parking','A/C']},hi:[0],desc:{ru:'Просторный дом с садом.',he:'בית מרווח עם גינה.',en:'Spacious house with garden.'},agent:{name:'RE/MAX',initials:'RM',type:'agency',verified:true,deals:380,rating:4.8,reviews:891,honesty:95},badge:null,lat:32.0867,lng:34.8786},
  {id:6,dealType:'sale',thumb:'linear-gradient(135deg,#0e2a3a,#1a5c7a)',icon:'🌊',priceNum:1400000,addr:{ru:'Ха-Намаль 7, Хайфа',he:'הנמל 7, חיפה',en:'Ha-Namal 7, Haifa'},rooms:3,sqm:78,floor:'4/8',tags:{ru:['Вид на море ✓','Безоп. комн. ✓'],he:['נוף ים ✓',"ממ\"ד ✓"],en:['Sea view ✓','Safe room ✓']},hi:[0,1],desc:{ru:'Квартира с видом на море.',he:'דירה עם נוף לים.',en:'Sea-view apartment.'},agent:{name:'Israel Kadmi',initials:'IK',type:'owner',verified:false,deals:1,rating:0,reviews:0,honesty:20},badge:'new',lat:32.8100,lng:34.9896}
];
(function(){
  const streets=[{ru:'Герцль',he:'הרצל',en:'Herzl'},{ru:'Алленби',he:'אלנבי',en:'Allenby'},{ru:'Бен-Гурион',he:'בן גוריון',en:'Ben Gurion'},{ru:'Жаботинский',he:"ז'בוטינסקי",en:'Jabotinsky'},{ru:'Вайцман',he:'ויצמן',en:'Weizmann'},{ru:'Бялик',he:'ביאליק',en:'Bialik'},{ru:'Ротшильд',he:'רוטשילד',en:'Rothschild'},{ru:'Кинг Джордж',he:'קינג ג\'ורג',en:'King George'}];
  const cities=[{ru:'Хайфа',he:'חיפה',en:'Haifa',lat:32.7940,lng:34.9896},{ru:'Кирьят-Ям',he:'קריית ים',en:'Kiryat Yam',lat:32.8467,lng:35.0683},{ru:'Кирьят-Бялик',he:'קריית ביאליק',en:'Kiryat Bialik',lat:32.8275,lng:35.0837},{ru:'Нешер',he:'נשר',en:'Nesher',lat:32.7682,lng:35.0467},{ru:'Акко',he:'עכו',en:'Akko',lat:32.9237,lng:35.0683}];
  const grads=['linear-gradient(135deg,#1a3a5c,#0d5480)','linear-gradient(135deg,#2d4a1e,#4a7c2f)','linear-gradient(135deg,#5c1a3a,#8f2d5c)','linear-gradient(135deg,#3a2a0e,#7a5a20)','linear-gradient(135deg,#0e2a3a,#1a5c7a)'];
  const icons=['🏢','🏠','🏘️','🏡','🌿','🏙️'];
  const ags=[{name:'RE/MAX',initials:'RM',type:'agency',verified:true,deals:380,rating:4.8,reviews:891,honesty:95},{name:'David Levy',initials:'DL',type:'agent',verified:false,deals:19,rating:4.0,reviews:31,honesty:62},{name:'Tamar Gold',initials:'TG',type:'agent',verified:true,deals:67,rating:4.6,reviews:154,honesty:84}];
  const AMENITIES=[
    {ru:'Балкон',he:'מרפסת',en:'Balcony'},
    {ru:'Парковка',he:'חניה',en:'Parking'},
    {ru:'Сад',he:'גינה',en:'Garden'},
    {ru:'Вид на море',he:'נוף ים',en:'Sea view'},
    {ru:'Безоп. комн.',he:'ממ"ד',en:'Safe room'},
    {ru:'Лифт',he:'מעלית',en:'Elevator'},
    {ru:'Кондиц.',he:'מזגן',en:'A/C'},
    {ru:'Кладовая',he:'מחסן',en:'Storage'}
  ];
  function randomTags(){
    const n=2+Math.floor(Math.random()*3);
    const pool=[...AMENITIES].sort(()=>Math.random()-.5).slice(0,n);
    return {ru:pool.map(t=>t.ru),he:pool.map(t=>t.he),en:pool.map(t=>t.en)};
  }
  const b=listings.length;
  for(let k=0;k<80;k++){
    const c=cities[k%cities.length];const dt=Math.random()<.6?'rent':'sale';
    const rooms=[1,1.5,2,2.5,3,3.5,4,4.5,5][Math.floor(Math.random()*9)];
    const sqm=Math.floor(35+Math.random()*150);const fl=Math.floor(1+Math.random()*13);
    const st=streets[Math.floor(Math.random()*streets.length)];const num=Math.floor(2+Math.random()*180);
    const pnum=dt==='rent'?Math.floor(3000+Math.random()*9000):Math.floor(900000+Math.random()*2500000);
    const tg=randomTags();const ag=ags[Math.floor(Math.random()*ags.length)];const conds=['new','renovated','cosmetic','needs_repair'];const cond=conds[Math.floor(Math.random()*conds.length)];const furns=['full','partial','none'];const furn=furns[Math.floor(Math.random()*furns.length)];const petsOpts=['yes','no','small_dog','small_cat'];const pets=petsOpts[Math.floor(Math.random()*petsOpts.length)];const ptypes=['apartment','apartment','apartment','house','commercial'];const ptype=ptypes[Math.floor(Math.random()*ptypes.length)];
    listings.push({id:b+k+1,dealType:dt,thumb:grads[Math.floor(Math.random()*grads.length)],icon:icons[Math.floor(Math.random()*icons.length)],priceNum:pnum,addr:{ru:st.ru+' '+num+', '+c.ru,he:st.he+' '+num+', '+c.he,en:st.en+' '+num+', '+c.en},rooms,sqm,floor:fl+'/'+(fl+Math.floor(1+Math.random()*12)),tags:tg,condition:cond,furnished:furn,petsPolicy:pets,propertyType:ptype,hi:[0],desc:{ru:'Уютная квартира в '+c.ru+'.',he:'דירה נחמדה ב'+c.he+'.',en:'Cozy apt in '+c.en+'.'},agent:ag,badge:Math.random()<.08?'new':null,lat:c.lat+(Math.random()-.5)*.03,lng:c.lng+(Math.random()-.5)*.03});
  }
})();
// ═══ ДЕМО-ФОТО (Unsplash, свободная лицензия) ═══
(function(){
  const Q='?w=800&q=70&auto=format&fit=crop';
  const living=['1583847268964-b28dc8f51f92','1613575831056-0acd5da8f085','1612419299101-6c294dc2901d','1630699144867-37acec97df5a','1629042306547-c1d7c6c85ffa','1629042306548-afec37a5e46b','1629042306558-7d1e15cc02fa','1629042306541-85e77116aed3','1630699294897-723e02620662','1630699375895-fe5996d163ee','1663756915301-2ba688e078cf','1600493505873-cddd69453072','1567101692882-6630684230bf'];
  const kitchen=['1714860534425-7ce04e013dec','1682888813795-192fca4a10d9','1665507279644-67d8ed143a84','1610177534644-34d881503b83','1680210849773-f97a41c6b7ed','1665507279638-5b48073c637b','1665507279750-ced2d97a9be9','1665507279636-0b268fb3f6ca','1665507279656-0cdec047c4ea','1665507279458-b21dea52c447','1666704369274-83898c9309ef','1658280911730-467b4764c09c','1669046222569-a7672da06e12'];
  const bedroom=['1616594039964-ae9021a400a0','1560185893-a55cbc8c57e8','1562438668-bcf0ca6578f0','1586105251261-72a756497a11','1696762932825-2737db830bbe','1578683010236-d716f9a3f461','1633505650701-6104c4fc72c2','1615529162924-f8605388461d','1750420556288-d0e32a6f517b','1595526051245-4506e0005bd0','1642541070065-3912f347e7c6','1653974123568-b5eff6d851e1','1640109478916-f445f8f19b11'];
  const bathroom=['1584622650111-993a426fbf0a','1631889993959-41b4e9c6e3c5','1507652313519-d4e9174996dd','1661107259637-4e1c55462428','1629079447777-1e605162dc8d','1576698483491-8c43f0862543','1643949719317-4342d8d4031e','1521783593447-5702b9bfd267','1603825491103-bd638b1873b0','1638799869566-b17fa794c4de','1650894622076-e09ab837c502'];
  function url(id){return 'https://images.unsplash.com/photo-'+id+Q}
  function shuffle(arr,seed){
    const a=arr.slice();
    for(let i=a.length-1;i>0;i--){
      seed=(seed*9301+49297)%233280;
      const j=Math.floor((seed/233280)*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  listings.forEach(function(d,i){
    const seed=(d.id||i)*7+13;
    const count=5+(seed%3);
    const lv=shuffle(living,seed)[0],lv2=shuffle(living,seed+1)[1];
    const kt=shuffle(kitchen,seed)[0];
    const bd=shuffle(bedroom,seed)[0],bd2=shuffle(bedroom,seed+2)[1];
    const bt=shuffle(bathroom,seed)[0];
    const pool=[lv,kt,bd,bt,lv2,bd2,shuffle(kitchen,seed+3)[1]].filter(Boolean);
    d.allPhotos=pool.slice(0,count).map(url);
    d.userPhoto=d.allPhotos[0];
  });
})();

// ═══ STATE ═══
let lang='ru',activeCat='all',activeIdx=-1,loggedIn=false,selectedRole='user',authMode='login',activePropertyType=null;
function toggleDealDropdown(kind){
  document.querySelectorAll('.smn').forEach(m=>{if(m.id!=='dealMenu-'+kind)m.classList.remove('open')});
  document.getElementById('dealMenu-'+kind).classList.toggle('open');
  updateDealMenuCounts();
}
function updateDealMenuCounts(){
  ['rent','sale'].forEach(kind=>{
    let allN=0;
    ['apartment','house','commercial'].forEach(pt=>{
      const n=listings.filter(l=>l.dealType===kind&&l.propertyType===pt).length;
      allN+=n;
      const el=document.getElementById('cnt-'+kind+'-'+pt);
      if(el)el.textContent=n+' '+t('count_obj');
    });
    const allEl=document.getElementById('cnt-'+kind+'-all');
    if(allEl)allEl.textContent=allN+' '+t('count_obj');
  });
}
function pickDealType(kind, ptype){
  document.getElementById('dealMenu-'+kind).classList.remove('open');
  const btn=document.querySelector(kind==='rent'?'.ctab.rt':'.ctab.st');
  activePropertyType=ptype;
  selCat(btn, kind);
}
let tierPrice=950,tierCredits=10,map=null,mapLoaded=false,satelliteOn=false;
let cmpList=[],promoTargetIdx=-1,filteredListings=[...listings],currentSort='rel';
let dzFiles=[],markersArr=[],userCredits=0,addrTimer=null;
let activeFilters=new Set();
let activeType='all'; // 'all','rent','sale'

// ═══ MAPBOX с статичными DOM маркерами ═══
function initMap(){
  try{
  var isMobDevice = Math.min(window.screen.width, window.screen.height) <= 768 || window.innerWidth <= 768;
  map=new mapboxgl.Map({
    container:'map3d',style:'mapbox://styles/mapbox/dark-v11',
    center:[34.7818,32.0853],
    zoom:isMobDevice?11:12,
    pitch:isMobDevice?0:55,
    bearing:0,
    antialias:!isMobDevice,
    attributionControl:false
  });
  window.map=map;
  }catch(e){
    var el=document.getElementById('map3d');
    if(el)el.innerHTML='<div style="position:absolute;inset:0;background:#fff;color:#c00;font-size:14px;padding:20px;overflow:auto;z-index:999">MAP INIT ERROR:<br>'+(e&&e.message?e.message:String(e))+'</div>';
    return;
  }
  map.on('error',function(e){
    var el=document.getElementById('map3d');
    if(el){
      var d=document.createElement('div');
      d.style.cssText='position:absolute;inset:0;background:#fff;color:#c00;font-size:13px;padding:16px;overflow:auto;z-index:999';
      d.textContent='MAP ERROR: '+(e&&e.error&&e.error.message?e.error.message:JSON.stringify(e&&e.error||e));
      el.appendChild(d);
    }
  });
  // Автоматически ресайзим карту при ЛЮБОМ изменении размера контейнера
  try{
    var mapEl=document.getElementById('map3d');
    if(mapEl&&window.ResizeObserver){
      var _roTimer=null;
      var ro=new ResizeObserver(function(){
        clearTimeout(_roTimer);
        _roTimer=setTimeout(function(){try{map.resize();}catch(e){}},50);
      });
      ro.observe(mapEl);
    }
  }catch(e){}
  map.addControl(new mapboxgl.AttributionControl({compact:true}),'bottom-right');
  map.scrollZoom.setWheelZoomRate(1/450);
  map.on('load',()=>{
    // Set map language based on current lang
    try{
      const mapLang=lang==='he'?'he':lang==='en'?'en':'ru';
      map.getStyle().layers.forEach(layer=>{
        if(layer.type==='symbol'&&layer.layout&&layer.layout['text-field']){
          map.setLayoutProperty(layer.id,'text-field',['get','name_'+mapLang]||['get','name']);
        }
      });
    }catch(e){}
    mapLoaded=true;
    try{if(!isMobDevice&&!map.getLayer('3d-buildings')&&map.getSource('composite'))map.addLayer({id:'3d-buildings',source:'composite','source-layer':'building',filter:['==','extrude','true'],type:'fill-extrusion',minzoom:14,paint:{'fill-extrusion-color':['interpolate',['linear'],['get','height'],0,'#12173a',20,'#1a2050',50,'#1e2860',100,'#222d70'],'fill-extrusion-height':['interpolate',['linear'],['zoom'],14,0,14.05,['get','height']],'fill-extrusion-base':['interpolate',['linear'],['zoom'],14,0,14.05,['get','min_height']],'fill-extrusion-opacity':0.88}})}catch(e){}
    rebuildMarkers(filteredListings);
    map.on('move',()=>{if(activeIdx>=0)updatePopupPos(activeIdx)});
    map.on('click',()=>document.getElementById('mapPop').style.display='none');
  });
}

function makePinEl(d,idx){
  const isR=d.dealType==='rent',isP=!!d.promoted;
  const cls=isP?'pm':isR?'rm':'sm';
  const v=d.priceNum;
  const lbl=(v>=1000000?('₪'+(v/1000000).toFixed(1)+'M'+(isR?'/מ':'')):(v>=1000?'₪'+Math.round(v/1000)+'K'+(isR?'/מ':''):'₪'+v));
  const el=document.createElement('div');
  el.className='mbp';
  el.innerHTML=`<div class="mbb ${cls}">${isP?'⚡ ':isR?'':' '}${lbl}</div><div class="mba ${cls}"></div>`;
  el._touchStart=null;
  el.addEventListener('touchstart',function(e){el._touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()};},{passive:true});
  el.addEventListener('click',function(e){
    if(el._touchStart){
      var dx=e.clientX-el._touchStart.x,dy=e.clientY-el._touchStart.y;
      var dist=Math.sqrt(dx*dx+dy*dy);
      var dt=Date.now()-el._touchStart.t;
      if(dist>8||dt>400){el._touchStart=null;return;}
      el._touchStart=null;
    }
    openDetail(idx);
  });
  el.addEventListener('mouseenter',()=>{el.classList.add('hl');showPopup(idx)});
  el.addEventListener('mouseleave',()=>{el.classList.remove('hl');document.getElementById('mapPop').style.display='none'});
  el.addEventListener('touchend',function(e){
    e.preventDefault();
    if(el._touchStart){
      var t=e.changedTouches[0];
      var dx=t.clientX-el._touchStart.x,dy=t.clientY-el._touchStart.y;
      var dist=Math.sqrt(dx*dx+dy*dy);
      var dt=Date.now()-el._touchStart.t;
      el._touchStart=null;
      if(dist>10||dt>500)return;
    }
    openDetail(idx);
  });
  return el;
}

function rebuildMarkers(data){
  markersArr.forEach(m=>m.remove());markersArr=[];
  if(!mapLoaded||!map)return;
  (data||filteredListings).forEach(d=>{
    const idx=listings.indexOf(d);if(idx<0)return;
    const el=makePinEl(d,idx);
    const m=new mapboxgl.Marker({element:el,anchor:'bottom',pitchAlignment:'viewport',rotationAlignment:'viewport'})
      .setLngLat([d.lng,d.lat]).addTo(map);
    m._idx=idx;markersArr.push(m);
  });
  document.getElementById('mapCnt').textContent=(data||filteredListings).length;
}

function showPopup(idx){
  const d=listings[idx];if(!d||!map||!mapLoaded)return;
  const isR=d.dealType==='rent';
  const pop=document.getElementById('mapPop');
  pop.style.display='block';
  pop.innerHTML=`<span class="pt2 ${isR?'r':'s'}">${isR?'🔵 Аренда':'🟠 Продажа'}</span><div class="pp2">₪${d.priceNum.toLocaleString()}${isR?'/מ':''}</div><div class="pa2">📍 ${d.addr[lang]}</div><div class="pc2"><span class="pch">${d.rooms} комн.</span><span class="pch">${d.sqm} м²</span>${d.tags[lang].slice(0,2).map((t,j)=>`<span class="pch ${d.hi.includes(j)?'hi':''}">${t}</span>`).join('')}</div><div class="pag">${d.agent.name}${d.agent.verified?' ✓':''} · 🏅 ${d.agent.honesty}/100</div><div class="parr"></div>`;
  updatePopupPos(idx);
}
function updatePopupPos(idx){
  const d=listings[idx];if(!d||!map||!mapLoaded)return;
  const pt=map.project([d.lng,d.lat]);
  const r=document.getElementById('map3d').getBoundingClientRect();
  const pop=document.getElementById('mapPop');
  pop.style.left=Math.max(8,Math.min(pt.x-110,r.width-236))+'px';
  pop.style.top=Math.max(8,pt.y-170)+'px';
}

function setView(v){if(!map)return;if(v==='2d')map.easeTo({pitch:0,bearing:0,duration:700});else map.easeTo({pitch:55,bearing:-15,duration:700})}
function toggleSat(){
  satelliteOn=!satelliteOn;document.getElementById('satBtn').classList.toggle('on',satelliteOn);
  if(!map)return;
  map.setStyle(satelliteOn?'mapbox://styles/mapbox/satellite-streets-v12':'mapbox://styles/mapbox/dark-v11');
  map.once('style.load',()=>{mapLoaded=true;var _mob=Math.min(window.screen.width,window.screen.height)<=768||window.innerWidth<=768;try{if(!_mob)map.addLayer({id:'3d-buildings',source:'composite','source-layer':'building',filter:['==','extrude','true'],type:'fill-extrusion',minzoom:14,paint:{'fill-extrusion-color':'#1a2050','fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','min_height'],'fill-extrusion-opacity':0.88}})}catch(e){}updateMapLang(lang);rebuildMarkers(filteredListings)});
}
function flyTo(lat,lng,zoom,name){if(map)map.flyTo({center:[lng,lat],zoom,pitch:55,bearing:-15,duration:1400,essential:true});showToast('✈️ '+name)}

// ═══ ADDRESS AUTOCOMPLETE — параллельный поиск RU+HE+EN ═══
// ═══ CITY + ADDRESS — двухшаговый выбор ═══
let selectedCityData=null;

async function citySearch(q){
  clearTimeout(window._cityTimer);
  const sg=document.getElementById('pubCitySugg');
  if(!q||q.length<2){sg.classList.add('hid');return}
  sg.innerHTML='<div class="ald">🔍 Поиск...</div>';
  sg.classList.remove('hid');
  window._cityTimer=setTimeout(async()=>{
    try{
      const cur=/[\u0590-\u05FF]/.test(q)?'he':/[\u0400-\u04FF]/.test(q)?'ru':'en';
      const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&accept-language=${cur}&countrycodes=il&limit=8&addressdetails=0`;
      const res=await fetch(url,{headers:{'Accept-Language':cur}});
      const data=await res.json();
      const features=(data||[]).filter(f=>{
        return f.addresstype==='city'||f.addresstype==='town'||f.addresstype==='village'||f.addresstype==='hamlet'||f.addresstype==='suburb'||f.class==='place';
      }).slice(0,7);
      if(!features.length){
        sg.innerHTML='<div class="ald" style="color:var(--ink3);padding:10px 14px">Город не найден</div>';
        return;
      }
      sg.innerHTML=features.map(f=>{
        const name=(f.name||f.display_name||q).split(',')[0];
        const nm=JSON.stringify(name).replace(/"/g,'&quot;');
        return `<div class="asi" onclick="selCity(${nm},${f.lat},${f.lon})" tabindex="0">
          <span class="asi-ico">📍</span>
          <div><div class="asi-main">${name}</div></div>
        </div>`;
      }).join('');
    }catch(e){
      sg.innerHTML='<div class="ald" style="color:var(--ink3);padding:10px 14px">Ошибка поиска, введите вручную</div>';
    }
  },400);
}
function selCity(name,lat,lng){
  selectedCityData={name,lat:parseFloat(lat),lng:parseFloat(lng)};
  document.getElementById('pubCityInp').value=name;
  document.getElementById('pubCitySugg').classList.add('hid');
  document.getElementById('addrCityName').value=name;
  document.getElementById('addrLat').value=lat;
  document.getElementById('addrLng').value=lng;
  // Фолбэк — пока не подтянулись переводы, используем введённое имя везде
  document.getElementById('addrCityHe').value=name;
  document.getElementById('addrCityRu').value=name;
  document.getElementById('addrCityEn').value=name;
  const inp=document.getElementById('addrInp');
  const house=document.getElementById('addrHouse');
  inp.disabled=false;inp.style.opacity='1';inp.value='';inp.classList.remove('has-val');inp.placeholder=' ';
  house.disabled=false;house.style.opacity='1';
  if(map&&mapLoaded)map.flyTo({center:[parseFloat(lng),parseFloat(lat)],zoom:13,pitch:45,bearing:-15,duration:1000,essential:true});
  showToast('📍 '+name);
  inp.focus();
  // Подтягиваем название города на всех 3 языках (для корректного поиска)
  ['he','ru','en'].forEach(function(l){
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=${l}&zoom=10`)
      .then(function(r){return r.json()})
      .then(function(d){
        var nm=(d&&d.address)?(d.address.city||d.address.town||d.address.village||d.address.municipality||d.name):null;
        var fld=document.getElementById(l==='he'?'addrCityHe':l==='ru'?'addrCityRu':'addrCityEn');
        if(nm&&fld)fld.value=nm;
      })
      .catch(function(){});
  });
}
function onCityChange(){
  const sel=document.getElementById('pubCity');
  const val=sel.value;
  const inp=document.getElementById('addrInp');
  const house=document.getElementById('addrHouse');
  const sg=document.getElementById('addrSugg');
  if(!val){
    selectedCityData=null;
    inp.disabled=true;inp.style.opacity='.5';inp.value='';inp.classList.remove('has-val');
    house.disabled=true;house.style.opacity='.5';house.value='';
    return;
  }
  const [cityName,lat,lng]=val.split('|');
  selectedCityData={name:cityName,lat:parseFloat(lat),lng:parseFloat(lng)};
  document.getElementById('addrCityName').value=cityName;
  document.getElementById('addrLat').value=lat;
  document.getElementById('addrLng').value=lng;
  inp.disabled=false;inp.style.opacity='1';inp.value='';inp.classList.remove('has-val');inp.placeholder=' ';
  house.disabled=false;house.style.opacity='1';
  sg.classList.add('hid');
  if(map&&mapLoaded)map.flyTo({center:[parseFloat(lng),parseFloat(lat)],zoom:13,pitch:45,bearing:-15,duration:1000,essential:true});
  showToast('📍 '+cityName);
  inp.focus();
}

async function addrSearch(q){
  clearTimeout(addrTimer);
  const sg=document.getElementById('addrSugg');
  if(!selectedCityData){sg.classList.add('hid');return}
  if(!q||q.length<2){sg.classList.add('hid');return}
  sg.innerHTML='<div class="ald">\ud83d\udd0d Поиск...</div>';
  sg.classList.remove('hid');
  addrTimer=setTimeout(async()=>{
    try{
      const city=selectedCityData.name;
      const lat=selectedCityData.lat;
      const lng=selectedCityData.lng;
      const cur=/[\u0590-\u05FF]/.test(q)?'he':/[\u0400-\u04FF]/.test(q)?'ru':'en';
      const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q+' '+city)}&format=jsonv2&accept-language=${cur}&countrycodes=il&limit=8&addressdetails=1`;
      const res=await fetch(url,{headers:{'Accept-Language':cur}});
      const data=await res.json();
      const features=(data||[]).filter(f=>f.address&&(f.address.road||f.class==='highway'||f.type==='house')).slice(0,7);
      if(!features.length){
        sg.innerHTML=`<div class="ald" style="color:var(--ink3);padding:10px 14px">
          Улица не найдена автоматически.<br>
          <span style="font-size:11px">Введите адрес вручную и нажмите «Далее»</span>
        </div>
        <div class="asi" onclick="selAddrManual()" tabindex="0">
          <span class="asi-ico">✏️</span>
          <div><div class="asi-main">Ввести вручную: "${q}"</div>
          <div class="asi-sub">${city}</div></div>
        </div>`;
        return;
      }
      sg.innerHTML=features.map(f=>{
        const a=f.address||{};
        const street=a.road||f.name||q;
        const houseNum=a.house_number?` ${a.house_number}`:'';
        const district=a.suburb||a.city_district||a.city||city;
        let ico=a.house_number?'\ud83c\udfe0':'\ud83d\udee3\ufe0f';
        const nm=JSON.stringify(street).replace(/"/g,'&quot;');
        const hn=JSON.stringify((houseNum).trim()).replace(/"/g,'&quot;');
        return `<div class="asi" onclick="selAddr(${nm},${hn},${f.lat},${f.lon})" tabindex="0">
          <span class="asi-ico">${ico}</span>
          <div>
            <div class="asi-main">${street}${houseNum?'<b style="color:var(--c)">'+houseNum+'</b>':''}</div>
            <div class="asi-sub">${district}</div>
          </div>
        </div>`;
      }).join('');
      sg.classList.remove('hid');
    }catch(e){
      sg.innerHTML=`<div class="ald">
        <div style="color:var(--ink3);margin-bottom:6px">Поиск недоступен</div>
        <div class="asi" onclick="selAddrManual()" tabindex="0" style="border-radius:8px;background:var(--cl)">
          <span class="asi-ico">✏️</span>
          <div><div class="asi-main">Ввести адрес вручную</div></div>
        </div>
      </div>`;
    }
  },400);
}

function selAddrManual(){
  // Пользователь вводит адрес вручную — берём что написал и координаты города
  const inp=document.getElementById('addrInp');
  const q=inp.value;
  document.getElementById('addrSugg').classList.add('hid');
  if(!document.getElementById('addrLat').value&&selectedCityData){
    document.getElementById('addrLat').value=selectedCityData.lat;
    document.getElementById('addrLng').value=selectedCityData.lng;
  }
  document.getElementById('addrHouse').focus();
  showToast('📍 Адрес введён вручную');
}

let _refineTimer=null;
async function refineAddrCoords(){
  clearTimeout(_refineTimer);
  _refineTimer=setTimeout(async function(){
    try{
      const street=document.getElementById('addrInp')?.value||'';
      const house=document.getElementById('addrHouse')?.value||'';
      const cityName=document.getElementById('addrCityName')?.value||(selectedCityData&&selectedCityData.name)||'';
      if(!street||!house||!cityName)return;
      const q=street+' '+house+', '+cityName;
      const cur=/[\u0590-\u05FF]/.test(street)?'he':/[\u0400-\u04FF]/.test(street)?'ru':'en';
      const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&accept-language=${cur}&countrycodes=il&limit=3&addressdetails=1`;
      const res=await fetch(url,{headers:{'Accept-Language':cur}});
      const data=await res.json();
      if(!data||!data.length)return;
      // Предпочитаем результат с точным совпадением номера дома
      const exact=data.find(function(f){return f.address&&String(f.address.house_number)===String(house);});
      const best=exact||data[0];
      if(best&&best.lat&&best.lon){
        document.getElementById('addrLat').value=best.lat;
        document.getElementById('addrLng').value=best.lon;
        if(map&&mapLoaded)map.flyTo({center:[parseFloat(best.lon),parseFloat(best.lat)],zoom:18,pitch:55,bearing:-15,duration:700,essential:true});
      }
    }catch(e){}
  },600);
}
function selAddr(street,houseNum,lat,lng){
  const inp=document.getElementById('addrInp');
  const house=document.getElementById('addrHouse');
  inp.value=street;
  inp.classList.add('has-val');
  if(houseNum&&!house.value)house.value=houseNum;
  if(houseNum)house.classList.add('has-val');
  document.getElementById('addrLat').value=lat;
  document.getElementById('addrLng').value=lng;
  document.getElementById('addrSugg').classList.add('hid');
  if(map&&mapLoaded)map.flyTo({center:[parseFloat(lng),parseFloat(lat)],zoom:17,pitch:55,bearing:-15,duration:900,essential:true});
  // Фокус на номер дома если он не заполнен
  if(!house.value)house.focus();
}

// Floating label helper — when input gets value from JS
document.addEventListener('input',e=>{
  if(e.target.classList.contains('finput')){
    e.target.classList.toggle('has-val',e.target.value.length>0);
  }
});

// ═══ FILTER ═══
// Фильтры работают: pills соответствуют тегам в данных
const FILTER_MAP={
  rooms12:(d)=>d.rooms<=2,
  rooms34:(d)=>d.rooms>=3&&d.rooms<=4,
  safeRoom:(d)=>d.tags.ru.some(t=>t.includes('Безоп') || t.includes("ממ\"ד") || t.includes('Safe')),
  parking:(d)=>d.tags.ru.some(t=>t.includes('Парков') || t.includes('חניה') || t.includes('Parking')),
  balcony:(d)=>d.tags.ru.some(t=>t.includes('Балкон') || t.includes('מרפסת') || t.includes('Balcony')),
  garden:(d)=>d.tags.ru.some(t=>t.includes('Сад') || t.includes('גינה') || t.includes('Garden')),
  sea:(d)=>d.tags.ru.some(t=>t.includes('море') || t.includes('ים') || t.includes('Sea')),
  new:(d)=>d.badge==='new',
  owner:(d)=>d.agent.type==='owner',
  agency:(d)=>d.agent.type==='agency'||d.agent.type==='agent',
  rooms1:(d)=>d.rooms<2,
  rooms2:(d)=>d.rooms>=2&&d.rooms<3,
  rooms3:(d)=>d.rooms>=3&&d.rooms<4,
  rooms4plus:(d)=>d.rooms>=4,
  cond_new:(d)=>d.condition==='new',
  cond_renovated:(d)=>d.condition==='renovated',
  cond_cosmetic:(d)=>d.condition==='cosmetic',
  cond_needs_repair:(d)=>d.condition==='needs_repair',
  furn_full:(d)=>d.furnished==='full',
  furn_partial:(d)=>d.furnished==='partial',
  furn_none:(d)=>d.furnished==='none',
  pets_yes:(d)=>d.petsPolicy==='yes',
  pets_no:(d)=>d.petsPolicy==='no',
  pets_small_dog:(d)=>d.petsPolicy==='small_dog',
  pets_small_cat:(d)=>d.petsPolicy==='small_cat',
  elevator:(d)=>d.tags.ru.some(t=>t.includes('Лифт')),
  ac:(d)=>d.tags.ru.some(t=>t.includes('Кондиц')),
  furnished:(d)=>d.tags.ru.some(t=>t.includes('Мебель')),
  pets:(d)=>d.tags.ru.some(t=>t.includes('животными')),
};

function toggleFPill(el){
  const f=el.dataset.filter;
  el.classList.toggle('on');
  if(el.classList.contains('on'))activeFilters.add(f);
  else activeFilters.delete(f);
  applyFilter();
}
function toggleFCheck(el){
  const f=el.dataset.filter;
  if(el.checked)activeFilters.add(f);
  else activeFilters.delete(f);
  applyFilter();
  const n=activeFilters.size;
  const lbl=document.getElementById('filterLbl');
  if(lbl)lbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');
}
let panelRooms=new Set(), panelSeller=null, panelAmenities=new Set(), panelCondition=null, panelFurnished=null, panelPets=null;
function paintToggle(el,on){
  el.style.background=on?'#3167F1':'#fff';
  el.style.borderColor=on?'#3167F1':'#ddd';
  el.style.color=on?'#fff':'#000';
  el.style.fontWeight=on?'700':'400';
}
function toggleRoom(el){
  const r=el.dataset.rooms;
  if(panelRooms.has(r)){panelRooms.delete(r);paintToggle(el,false);}
  else{panelRooms.add(r);paintToggle(el,true);}
}
function toggleSeller(el){
  const s=el.dataset.seller;
  document.querySelectorAll('.fseller').forEach(b=>paintToggle(b,false));
  if(panelSeller===s){panelSeller=null;}
  else{panelSeller=s;paintToggle(el,true);}
}
function toggleChip(el){
  const f=el.dataset.filter;
  if(panelAmenities.has(f)){panelAmenities.delete(f);paintToggle(el,false);}
  else{panelAmenities.add(f);paintToggle(el,true);}
}
function openFilterPanel(){document.getElementById('filterOvl').style.display='flex';}
function closeFilterPanel(){
  document.getElementById('filterOvl').style.display='none';
  applyPanelFilters();
}
function openDealTypeModal(kind){
  const items=[
    {p:null,icon:'🏠',label:t('nav.allTypes')},
    {p:'apartment',icon:'🏢',label:t('type.apartment')},
    {p:'house',icon:'🏡',label:t('type.house')},
    {p:'commercial',icon:'🏬',label:t('type.commercial')}
  ];
  const html=items.map(function(it){
    const n=it.p?listings.filter(function(l){return l.dealType===kind&&l.propertyType===it.p}).length:listings.filter(function(l){return l.dealType===kind}).length;
    const pArg=it.p?("'"+it.p+"'"):'null';
    return '<div class="smi" style="display:flex;align-items:center;gap:12px;padding:10px 8px;border-radius:8px" onclick="pickDealType(\''+kind+'\','+pArg+');closeDealTypeModal()">'+
      '<div style="width:34px;height:34px;border-radius:50%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:16px">'+it.icon+'</div>'+
      '<div><div style="font-size:14px;font-weight:600">'+it.label+'</div><div style="font-size:11px;color:#999">'+n+' '+t('count_obj')+'</div></div>'+
      '</div>';
  }).join('');
  document.getElementById('dealTypeContent').innerHTML=html;
  document.getElementById('dealTypeTitle').textContent=kind==='rent'?t('nav.rent'):t('nav.sale');
  document.getElementById('dealTypeOvl').style.display='flex';
}
function closeDealTypeModal(){
  document.getElementById('dealTypeOvl').style.display='none';
}
function showMobileFavPopup(){
  if(localStorage.getItem('nesay_hide_fav_popup')==='1')return;
  document.getElementById('mobileFavOvl').style.display='flex';
}
function closeMobileFavPopup(){
  document.getElementById('mobileFavOvl').style.display='none';
}
function goToMobileFavorites(){
  closeMobileFavPopup();
  if(window.M&&M.tab)M.tab('fav');
}
function dontShowFavPopup(){
  localStorage.setItem('nesay_hide_fav_popup','1');
  closeMobileFavPopup();
}
function toggleCondition(el){
  const c=el.dataset.cond;
  document.querySelectorAll('.fcond').forEach(b=>paintToggle(b,false));
  if(panelCondition===c){panelCondition=null;}
  else{panelCondition=c;paintToggle(el,true);}
}
function toggleFurnished(el){
  const f=el.dataset.furn;
  document.querySelectorAll('.ffurn').forEach(b=>paintToggle(b,false));
  if(panelFurnished===f){panelFurnished=null;}
  else{panelFurnished=f;paintToggle(el,true);}
}
function togglePets(el){
  const p=el.dataset.pets;
  document.querySelectorAll('.fpets').forEach(b=>paintToggle(b,false));
  if(panelPets===p){panelPets=null;}
  else{panelPets=p;paintToggle(el,true);}
}
function resetFilterPanel(){
  panelRooms.clear();panelSeller=null;panelAmenities.clear();panelCondition=null;panelFurnished=null;panelPets=null;
  document.querySelectorAll('.froom,.fseller,.fchip,.fcond,.ffurn,.fpets').forEach(b=>paintToggle(b,false));
  applyPanelFilters();
}
function applyPanelFilters(){
  activeFilters=new Set();
  panelRooms.forEach(r=>activeFilters.add('rooms'+r));
  if(panelSeller)activeFilters.add(panelSeller);
  panelAmenities.forEach(a=>activeFilters.add(a));
  if(panelCondition)activeFilters.add('cond_'+panelCondition);
  if(panelFurnished)activeFilters.add('furn_'+panelFurnished);
  if(panelPets)activeFilters.add('pets_'+panelPets);
  applyFilter();
  const lbl=document.getElementById('filterLbl');
  const n=panelRooms.size+(panelSeller?1:0)+panelAmenities.size+(panelCondition?1:0)+(panelFurnished?1:0)+(panelPets?1:0);
  if(lbl)lbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');
}

function ttSwitch(type,btn){
  activeType=type;
  document.querySelectorAll('.tt-btn').forEach(b=>b.classList.remove('on-rent','on-sale'));
  if(type==='all')btn.classList.add('on-rent');
  else if(type==='rent')btn.classList.add('on-rent');
  else btn.classList.add('on-sale');
  // sync top cats
  activeCat=type;
  closeDetail();
  applyFilter();
}

function getFiltered(){
  let d=[...listings];
  const q=(document.getElementById('searchInput')?.value||'').toLowerCase().trim();
  if(q)d=d.filter(x=>
    x.addr.ru.toLowerCase().includes(q)||
    x.addr.he.toLowerCase().includes(q)||
    x.addr.en.toLowerCase().includes(q)
  );
  if(activePropertyType)d=d.filter(x=>x.propertyType===activePropertyType);
  if(activeType==='rent')d=d.filter(x=>x.dealType==='rent');
  else if(activeType==='sale')d=d.filter(x=>x.dealType==='sale');
  else if(['rent-apt','rent-villa'].includes(activeCat))d=d.filter(x=>x.dealType==='rent');
  else if(['buy-apt','buy-villa'].includes(activeCat))d=d.filter(x=>x.dealType==='sale');
  // Apply active pills (OR logic within each filter, AND between filters)
  if(activeFilters.size>0){
    const roomFilters=[...activeFilters].filter(f=>f.startsWith('rooms'));
    const otherFilters=[...activeFilters].filter(f=>!f.startsWith('rooms'));
    if(roomFilters.length>0)d=d.filter(x=>roomFilters.some(f=>FILTER_MAP[f]&&FILTER_MAP[f](x)));
    for(const f of otherFilters){
      if(FILTER_MAP[f])d=d.filter(FILTER_MAP[f]);
    }
  }
  if(currentSort==='price-asc')d.sort((a,b)=>a.priceNum-b.priceNum);
  else if(currentSort==='price-desc')d.sort((a,b)=>b.priceNum-a.priceNum);
  else if(currentSort==='new')d.sort((a,b)=>b.id-a.id);
  return mixPromoted(d);
}

function applyFilter(){
  filteredListings=getFiltered();
  renderCards(filteredListings);
  rebuildMarkers(filteredListings);
  if(typeof M!=='undefined'&&M.renderCards)M.renderCards();
  const mlbl=document.getElementById('mFilterLbl');
  if(mlbl){const n=activeFilters.size;mlbl.textContent=n>0?(t('filter.label')+' ('+n+')'):t('filter.label');}
  const mlbl2=document.getElementById('mFilterLbl2');
  if(mlbl2){const n2=activeFilters.size;mlbl2.textContent=n2>0?(t('filter.label')+' ('+n2+')'):t('filter.label');}
}

let favLists=[], favItems=[], activeFavList=null, inFavoritesView=false;
async function openFavoritesView(){
  const token=localStorage.getItem('nesay_token');
  if(!token){showToast(t('toast.need_auth'));return;}
  inFavoritesView=true;
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));
  try{
    const res=await fetch(`${API}/listings/favorite-lists`,{headers:{Authorization:'Bearer '+token}});
    const data=await res.json();
    favLists=data.lists||[];
    const itemsRes=await fetch(`${API}/listings/favorites/mine`,{headers:{Authorization:'Bearer '+token}});
    favItems=await itemsRes.json();
  }catch(e){favLists=[];favItems=[];}
  activeFavList=null;
  renderFavTabs();
  renderFavView();
}
function renderFavTabs(){
  activeFavList='__all__';
  const el=document.getElementById('favTabs');
  if(el)el.innerHTML='<button class="fpill" onclick="closeFavoritesView()">✕ '+t('fav.exit')+'</button>';
}
function switchFavTab(id){activeFavList=id;renderFavTabs();renderFavView();}
function renderFavView(){
  const ids=favItems.map(f=>String(f.listing_id));
  const data=listings.filter(l=>ids.includes(String(l.id)));
  renderCards(data);
}
function createFavList(){
  document.getElementById('favNameInput').value='';
  document.getElementById('favNameOvl').style.display='flex';
  setTimeout(()=>document.getElementById('favNameInput').focus(),50);
}
function closeFavNameModal(){
  document.getElementById('favNameOvl').style.display='none';
}
function showSearchSavedModal(){
  document.getElementById('searchSavedOvl').style.display='flex';
}
function closeSearchSavedModal(){
  document.getElementById('searchSavedOvl').style.display='none';
}
function goToSavedSearches(){
  closeSearchSavedModal();
  openCab();
  setTimeout(()=>swCab('searches'),150);
}
async function confirmCreateFavList(){
  const name=document.getElementById('favNameInput').value;
  if(!name||!name.trim())return;
  closeFavNameModal();
  const token=localStorage.getItem('nesay_token');
  try{
    const res=await fetch(`${API}/listings/favorite-lists`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name:name.trim()})});
    const l=await res.json();
    favLists.push({id:l.id,name:l.name,count:0});
    renderFavTabs();
  }catch(e){}
}
function closeFavoritesView(){
  inFavoritesView=false;
  const el=document.getElementById('favTabs');if(el)el.innerHTML='';
  applyFilter();
}
function selCat(btn,cat){
  inFavoritesView=false;
  const ft=document.getElementById('favTabs');if(ft)ft.innerHTML='';
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');activeCat=cat;
  if(cat==='rent'||cat==='rent-apt'||cat==='rent-villa')activeType='rent';
  else if(cat==='sale'||cat==='buy-apt'||cat==='buy-villa')activeType='sale';
  else activeType='all';
  // sync sidebar toggles
  document.querySelectorAll('.tt-btn').forEach(b=>b.classList.remove('on-rent','on-sale'));
  if(activeType==='rent')document.getElementById('ttRent').classList.add('on-rent');
  else if(activeType==='sale')document.getElementById('ttSale').classList.add('on-sale');
  else document.getElementById('ttAll').classList.add('on-rent');
  closeDetail();applyFilter();
}

function pickSort(el){
  document.querySelectorAll('.smi').forEach(i=>i.classList.remove('on'));
  el.classList.add('on');currentSort=el.dataset.v;
  document.getElementById('sortLbl').textContent=el.textContent.replace(/^[🎯💰🆕]\s*/,'');
  document.getElementById('smn').classList.remove('open');applyFilter();
}

// ═══ RENDER CARDS — горизонтальный современный стиль ═══
function renderCards(data){
  const list=document.getElementById('cardsList');list.innerHTML='';
  if(!data.length){
    list.innerHTML=`<div style="text-align:center;padding:40px 20px;color:var(--ink3)">
      <div style="font-size:40px;margin-bottom:12px">🔍</div>
      <div style="font-size:15px;font-weight:700;color:var(--ink);margin-bottom:6px">${t('card.empty_title')}</div>
      <div style="font-size:13px">${t('card.empty_sub')}</div>
      <button onclick="resetFilters()" style="margin-top:14px;font-family:var(--font);font-size:13px;font-weight:700;color:var(--c);background:var(--cl);border:1.5px solid rgba(28,110,242,.2);padding:9px 20px;border-radius:10px;cursor:pointer">${t('card.reset')}</button>
    </div>`;
    document.getElementById('cntNum').textContent=0;document.getElementById('mapCnt').textContent=0;return;
  }
  data.forEach(d=>{
    const idx=listings.indexOf(d);const isR=d.dealType==='rent';
    const div=document.createElement('div');
    div.className=`card${d.promoted?' promo':''}${activeIdx===idx?' active':''}`;
    div.dataset.id=d.id;
    const h=Math.floor((d._promoMins||0)/60),m=Math.round((d._promoMins||0)%60);
    const pStr='₪'+d.priceNum.toLocaleString()+(isR?('/'+t('mo')):'');
    // Build photo slides
    const allPhotos=d.allPhotos||(d.userPhoto?[d.userPhoto]:[]);
    const hasPhotos=allPhotos.length>0;
    const photoCount=allPhotos.length||d.photos||0;
    let photoHtml='';
    if(hasPhotos&&allPhotos.length>1){
      photoHtml=`<div class="card-slides" id="slides_${idx}" style="transform:translateX(0%)">
        ${allPhotos.map(u=>`<div class="card-slide" style="background:url('${u}') center/cover"></div>`).join('')}
      </div>
      <button class="slide-btn slide-prev" onclick="event.stopPropagation();slidePhoto(${idx},-1)">‹</button>
      <button class="slide-btn slide-next" onclick="event.stopPropagation();slidePhoto(${idx},1)">›</button>
      <div class="slide-dots" id="dots_${idx}">${allPhotos.map((_,i)=>`<div class="slide-dot${i===0?' on':''}"></div>`).join('')}</div>`;
    } else if(hasPhotos){
      photoHtml=`<div class="card-img-bg" style="background:url('${allPhotos[0]}') center/cover"></div>`;
    } else {
      photoHtml=`<div class="card-img-bg" style="background:${d.thumb}"></div><div class="card-img-emoji">${d.icon}</div>`;
    }
    let inner='';
    if(d.promoted)inner+=`<div class="promo-strip" style="width:100%">⚡ TOP<span style="opacity:.8;font-size:9px;margin-right:auto"> · ${h}ч ${m}м</span></div>`;
    inner+=`<div class="card-stripe ${isR?'r':'s'}"></div>
    <div class="card-img" onclick="event.stopPropagation();openLightbox(${idx},slideIdx[${idx}]||0)">
      ${photoHtml}
      ${photoCount>0?`<div class="card-photo-cnt">📷 ${photoCount}</div>`:''}
      ${d.badge?`<div class="card-badge badge-${d.badge}">${d.badge==='top'?'TOP':'NEW'}</div>`:''}
    </div>
    <div class="card-body">
      <div class="card-top-row">
        <div>
          <span class="card-type-badge ${isR?'r':'s'}">${isR?t('deal.rent'):t('deal.sale')}</span>
          <div class="card-price" style="margin-top:3px">${pStr}</div>
        </div>
        <div class="card-acts" style="flex-shrink:0">
          <button class="act-btn" onclick="event.stopPropagation();toggleFav(this,${idx})" title="Сохранить">🤍</button>
          <button class="act-btn" id="cmpB${idx}" onclick="event.stopPropagation();toggleCmp(${idx})" title="Сравнить" style="font-size:10px;font-weight:800">⚖</button>
        </div>
      </div>
      <div class="card-specs">
        <span class="card-spec">🛏 ${d.rooms} ${t('card.rooms')}</span>
        <span class="card-spec-sep"></span>
        <span class="card-spec">📐 ${d.sqm} ${t('card.sqm')}</span>
        <span class="card-spec-sep"></span>
        <span class="card-spec">🏢 ${d.floor} ${t('card.floor')}</span>
      </div>
      <div class="card-addr">📍 ${d.addr[lang]}</div>
      <div class="card-tags">${d.tags[lang].slice(0,3).map((t,j)=>`<span class="ctag ${d.hi.includes(j)?'hi':''}">${t}</span>`).join('')}</div>
      <div class="card-bot">
        <div class="agent-info">${d.agent.name}${d.agent.verified?` <span class="vt">✓</span>`:''}</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--ink3)">
          ${(d.views||0)>0?`<span>👁 ${d.views||0}</span>`:''}
          ${(d.fav_count||0)>0?`<span>❤️ ${d.fav_count||0}</span>`:''}
          ${d.agent.rating>0?`<span style="color:#F59E0B;font-weight:700">★ ${d.agent.rating}</span>`:''}
        </div>
      </div>
    </div>`;
    div.innerHTML=inner;
    div.style.flexDirection='column';
    div.onclick=()=>openDetail(idx);
    div.onmouseenter=()=>{const mk=markersArr.find(x=>x._idx===idx);if(mk){mk.getElement().classList.add('hl');showPopup(idx)}};
    div.onmouseleave=()=>{const mk=markersArr.find(x=>x._idx===idx);if(mk)mk.getElement().classList.remove('hl');document.getElementById('mapPop').style.display='none'};
    list.appendChild(div);
  });
  const lm=document.createElement('div');lm.style.cssText='text-align:center;padding:10px 0 4px';
  lm.innerHTML=`<button style="font-family:var(--font);font-size:13px;font-weight:700;color:var(--ink2);border:1.5px solid var(--line);border-radius:20px;background:var(--white);padding:10px 28px;cursor:pointer;transition:all .15s" onmouseover="this.style.borderColor='var(--c)';this.style.color='var(--c)'" onmouseout="this.style.borderColor='var(--line)';this.style.color='var(--ink2)'" onclick="showToast(t('toast.loading'))">${t('card.load_more')}</button>`;
  list.appendChild(lm);
  document.getElementById('cntNum').textContent=data.length;
  document.getElementById('mapCnt').textContent=data.length;
  const cntObj=document.querySelector('.cnt');if(cntObj)cntObj.innerHTML=t('count')+' <b id="cntNum">'+data.length+'</b> '+t('count_obj');
}

function resetFilters(){
  activeFilters.clear();
  document.querySelectorAll('.fpill').forEach(p=>p.classList.remove('on'));
  activeType='all';
  document.querySelectorAll('.tt-btn').forEach(b=>b.classList.remove('on-rent','on-sale'));
  document.getElementById('ttAll').classList.add('on-rent');
  applyFilter();
}

// ═══ DETAIL ═══
function openDetail(idx){
  // Считаем просмотр
  const _dv=listings[idx];
  if(_dv&&_dv.id&&String(_dv.id).length>10){
    fetch(`${API}/listings/${_dv.id}/view`,{method:'POST'}).catch(()=>{});
    if(_dv.views!==undefined)_dv.views=(_dv.views||0)+1;
  }
  activeIdx=idx;const d=listings[idx];if(!d)return;
  const isR=d.dealType==='rent';
  const pStr='₪'+d.priceNum.toLocaleString()+(isR?('/'+t('mo')):'');
  document.getElementById('dTypHdr').className=`dth ${isR?'r':'s'}`;
  document.getElementById('dTypHdr').textContent=isR?t('deal.rent'):t('deal.sale');
  const photos=(d.allPhotos&&d.allPhotos.length)?d.allPhotos:(d.userPhoto?[d.userPhoto]:[]);
  const bg=document.getElementById('dThBg'),em=document.getElementById('dThEm');
  const slidesWrap=document.getElementById('dtmSlides'),prevBtn=document.getElementById('dtmPrev'),nextBtn=document.getElementById('dtmNext'),dotsWrap=document.getElementById('dtmDots');
  if(photos.length){
    bg.style.backgroundImage='';bg.style.display='none';em.style.display='none';
    slidesWrap.style.display='block';
    slidesWrap.style.transform='none';
    slidesWrap.innerHTML=`<div class="dtm-slide" id="dtmSingleSlide" style="width:100%;height:100%;position:absolute;inset:0;background:url('${photos[0]}') center/cover"></div>`;
    document.getElementById('dtmSingleSlide').onclick=function(){openLightbox(idx,window._dtmIdx||0)};
    window._dtmIdx=0;window._dtmPhotos=photos;window._dtmListingIdx=idx;
    if(photos.length>1){prevBtn.style.display='flex';nextBtn.style.display='flex';dotsWrap.innerHTML=photos.map(function(_,i){return `<div class="slide-dot${i===0?' on':''}"></div>`}).join('')}
    else{prevBtn.style.display='none';nextBtn.style.display='none';dotsWrap.innerHTML=''}
  }else{
    slidesWrap.style.display='none';prevBtn.style.display='none';nextBtn.style.display='none';dotsWrap.innerHTML='';
    bg.style.display='';bg.style.background=d.thumb;bg.style.backgroundImage='';em.style.display='flex';em.textContent=d.icon;
  }
  document.getElementById('dPrc').textContent=pStr;
  document.getElementById('dAdr').textContent='📍 '+d.addr[lang];
  document.getElementById('dSpc').innerHTML=`<div class="spi"><div class="sv">${d.rooms}</div><div class="sk">${t('detail.rooms')}</div></div><div class="spi"><div class="sv">${d.sqm}</div><div class="sk">${t('detail.sqm')}</div></div><div class="spi"><div class="sv">${d.floor}</div><div class="sk">${t('detail.floor')}</div></div>`;
  document.getElementById('dTgs').innerHTML=d.tags[lang].map((t,i)=>`<span class="dtga ${d.hi.includes(i)?'hi':''}">${t}</span>`).join('');
  const ag=d.agent;
  document.getElementById('dHon').innerHTML=ag.honesty>0?`<div class="hl"><span>🏅 ${t('detail.honesty')}</span><span style="font-weight:800;color:var(--ink)">${ag.honesty}/100</span></div><div class="ht"><div class="hf" style="width:${ag.honesty}%"></div></div>`:'';
  document.getElementById('dDsc').textContent=d.desc[lang]||d.desc.ru||'';
  document.getElementById('dAgt').innerHTML=`<div class="agav">${ag.initials}</div><div><div style="font-size:13px;font-weight:700;color:var(--ink)">${ag.name}${ag.verified?' <span style="color:var(--green)">✓</span>':''}</div><div style="font-size:11px;color:var(--ink3)">${t('agent.type.'+(ag.type||'agent'))}</div></div>`;
  document.getElementById('dRtg').innerHTML=ag.rating>0?`<span class="st">${'★'.repeat(Math.round(ag.rating))}${'☆'.repeat(5-Math.round(ag.rating))}</span><span style="font-size:11px;color:var(--ink3)">${ag.rating} (${ag.reviews})</span>`:'';
  document.getElementById('chatAv').textContent=ag.initials;
  document.getElementById('chatAgNm').textContent=ag.name;
  document.getElementById('chatLst').textContent=d.addr[lang]+' · '+pStr;
  document.getElementById('detailPop').classList.add('open');
  document.querySelectorAll('.card').forEach(c=>c.classList.toggle('active',c.dataset.id==d.id));
  document.querySelector(`.card[data-id="${d.id}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest'});
  markersArr.forEach(mk=>{mk.getElement().style.zIndex=mk._idx===idx?'9999':'';if(mk._idx===idx)mk.getElement().classList.add('hl')});
  if(map&&mapLoaded){map.flyTo({center:[d.lng,d.lat],zoom:16,pitch:60,bearing:-20,duration:900,essential:true});setTimeout(()=>showPopup(idx),650)}
}
function closeDetail(){activeIdx=-1;document.getElementById('detailPop').classList.remove('open');document.querySelectorAll('.card').forEach(c=>c.classList.remove('active'));markersArr.forEach(mk=>{mk.getElement().style.zIndex='';mk.getElement().classList.remove('hl')});document.getElementById('mapPop').style.display='none'}
function dtmNav(dir){
  if(!window._dtmPhotos||window._dtmPhotos.length<2)return;
  window._dtmIdx=(window._dtmIdx+dir+window._dtmPhotos.length)%window._dtmPhotos.length;
  const slide=document.getElementById('dtmSingleSlide');
  if(slide)slide.style.background=`url('${window._dtmPhotos[window._dtmIdx]}') center/cover`;
  document.querySelectorAll('#dtmDots .slide-dot').forEach(function(dot,i){dot.classList.toggle('on',i===window._dtmIdx)});
}
function openLightbox(listingIdx,photoIdx){
  const d=listings[listingIdx];if(!d)return;
  const photos=(d.allPhotos&&d.allPhotos.length)?d.allPhotos:(d.userPhoto?[d.userPhoto]:[]);
  if(!photos.length)return;
  window._lbxPhotos=photos;window._lbxIdx=photoIdx||0;
  document.getElementById('lightboxImg').src=photos[window._lbxIdx];
  document.getElementById('lightboxCounter').textContent=(window._lbxIdx+1)+' / '+photos.length;
  document.getElementById('lightbox').classList.add('open');
}
function lightboxNav(dir){
  if(!window._lbxPhotos)return;
  window._lbxIdx=(window._lbxIdx+dir+window._lbxPhotos.length)%window._lbxPhotos.length;
  document.getElementById('lightboxImg').src=window._lbxPhotos[window._lbxIdx];
  document.getElementById('lightboxCounter').textContent=(window._lbxIdx+1)+' / '+window._lbxPhotos.length;
}
function closeLightbox(){document.getElementById('lightbox').classList.remove('open')}
document.addEventListener('keydown',function(e){
  if(!document.getElementById('lightbox').classList.contains('open'))return;
  if(e.key==='Escape')closeLightbox();
  if(e.key==='ArrowLeft')lightboxNav(-1);
  if(e.key==='ArrowRight')lightboxNav(1);
});

// ═══ PUBLISH ═══
let pubStep=1;
function setDealType(type){
  document.getElementById('pubDeal').value=type;
  document.getElementById('dtRent').className='dt-btn'+(type==='rent'?' on-r':'');
  document.getElementById('dtSale').className='dt-btn'+(type==='sale'?' on-s':'');
}
function goStep1Next(){
  const price=parseFloat(document.getElementById('pubPrice')?.value)||0;
  const street=document.getElementById('addrInp')?.value||'';
  const cityName=document.getElementById('addrCityName')?.value||'';
  if(!price){showToast(t('err.price'));return}
  if(!cityName){showToast(t('err.city'));return}
  if(!street){showToast(t('err.street'));return}
  goStep(2);
}
function goStep(n){
  pubStep=n;
  ['pst1','pst2','pst3','pst4','pstSuc'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none'});
  const m={'1':'pst1','2':'pst2','3':'pst3','4':'pst4','success':'pstSuc'};
  const el=document.getElementById(m[String(n)]||'pst1');if(el)el.style.display='';
  [1,2,3,4].forEach(i=>{const nd=document.getElementById('pn'+i);if(!nd)return;nd.classList.remove('on','dn');if(i<n)nd.classList.add('dn');else if(i===n)nd.classList.add('on')});
}
function useCredit(){_publish()}
function submitPay(){_publish()}
async function _publish(){
  const cityName=document.getElementById('addrCityName')?.value||'';
  const cityHe=document.getElementById('addrCityHe')?.value||cityName;
  const cityRu=document.getElementById('addrCityRu')?.value||cityName;
  const cityEn=document.getElementById('addrCityEn')?.value||cityName;
  const street=document.getElementById('addrInp')?.value||'';
  const house=document.getElementById('addrHouse')?.value||'';
  const streetPart=street+(house?' '+house:'');
  const addr=[streetPart,cityName].filter(Boolean).join(', ')||'Адрес не указан';
  const addrHe=[streetPart,cityHe].filter(Boolean).join(', ')||addr;
  const addrRu=[streetPart,cityRu].filter(Boolean).join(', ')||addr;
  const addrEn=[streetPart,cityEn].filter(Boolean).join(', ')||addr;
  const lat=parseFloat(document.getElementById('addrLat')?.value)||selectedCityData?.lat||32.0853;
  const lng=parseFloat(document.getElementById('addrLng')?.value)||selectedCityData?.lng||34.7818;
  const price=parseFloat(document.getElementById('pubPrice')?.value)||0;
  const rooms=parseFloat(document.getElementById('pubRooms')?.value)||1;
  const sqm=parseFloat(document.getElementById('pubSqm')?.value)||null;
  const floor=document.getElementById('pubFloor')?.value||null;
  const objTypeMap={'Квартира':'apartment','Дом / Вилла':'house','Пентхаус':'apartment','Студия':'apartment','Коммерческая':'commercial'};
  const objTypeRaw=document.getElementById('pubObjType')?.value||'Квартира';
  const propertyType=objTypeMap[objTypeRaw]||'apartment';
  const condition=document.getElementById('pubReno')?.value||null;
  const furnished=document.getElementById('pubFurn')?.value||null;
  const petsAllowed=document.getElementById('pubPets')?.value||null;
  const dealType=document.getElementById('pubDeal')?.value||'rent';
  const desc=document.getElementById('pubDesc')?.value||'';
  const isR=dealType==='rent';
  const firstPhoto=dzFiles.length>0?dzFiles[0].url:null;
  const agName=document.getElementById('navNm')?.textContent||'Agent';

  if(!price){showToast(t('err.price'));return}
  if(!street){showToast(t('err.street'));return}
  if(!cityName){showToast(t('err.city'));return}

  // Пробуем сохранить на сервер
  const token=localStorage.getItem('nesay_token');
  let savedToDb=false;
  let dbId=null;

  if(token){
    try{
      const res=await fetch(`${API}/listings`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify({
          deal_type:dealType,
          property_type:propertyType,
          city_id:getCityId(cityName),
          street,house_number:house,
          lat,lng,price,rooms,sqm,
          description:{ru:desc,he:desc,en:desc},
          condition,furnished,pets_allowed:petsAllowed
        })
      });
      if(res.ok){
        const data=await res.json();
        savedToDb=true;
        dbId=data.id;
        // Загружаем фото на сервер если есть
        if(dzFiles.length>0&&dbId){
          try{
            const photoRes=await fetch(`${API}/listings/${dbId}/photos`,{
              method:'POST',
              headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
              body:JSON.stringify({photos:dzFiles.map(f=>f.url)})
            });
            if(photoRes.ok){
              const pd=await photoRes.json();
              if(pd.urls&&pd.urls.length>0){
                // Обновляем фото в локальном объявлении
                newL.userPhoto=pd.urls[0];
                newL.cover_photo=pd.urls[0];
              }
            }
          }catch(e){console.warn('Photo upload error:',e)}
        }
        showToast('✅ Сохранено в базе данных!');
      } else {
        const err=await res.json();
        console.warn('API error:',err);
      }
    }catch(e){console.warn('API недоступен:',e)}
  }

  // В любом случае добавляем локально на карту
  const newId=dbId||Date.now();
  const newL={id:newId,dealType,promoted:false,_userAdded:true,
    thumb:'linear-gradient(135deg,#1C6EF2,#0d5480)',icon:'🏠',
    userPhoto:firstPhoto,photos:dzFiles.length||1,priceNum:price,
    addr:{ru:addrRu,he:addrHe,en:addrEn},rooms,sqm:sqm||85,floor:floor||'—',
    tags:{ru:['Новое ✓'],he:['חדש ✓'],en:['New ✓']},hi:[0],
    desc:{ru:desc||'Новое объявление.',he:'מודעה חדשה.',en:'New listing.'},
    agent:{name:agName,initials:agName.slice(0,2).toUpperCase(),type:'agent',verified:loggedIn,deals:0,rating:0,reviews:0,honesty:50},
    badge:'new',lat,lng};
  listings.unshift(newL);
  saveUserListings();
  applyFilter();
  if(map&&mapLoaded)setTimeout(()=>map.flyTo({center:[lng,lat],zoom:16,pitch:60,bearing:-20,duration:1100,essential:true}),300);

  userCredits=Math.max(0,userCredits-1);
  document.getElementById('navCr').textContent='₪'+userCredits+' '+t('nav.balance');
  const cabCr=document.getElementById('cabCr');if(cabCr)cabCr.textContent='₪'+userCredits;
  const crBal=document.getElementById('crBal');if(crBal)crBal.textContent='₪'+userCredits;

  const tbl=document.getElementById('cabListTbl');
  if(tbl){const tr=document.createElement('tr');const newIdx=listings.indexOf(newL);
    tr.innerHTML=`<td><b>${addr.split(',')[0]}</b><br><span style="font-size:11px;color:var(--ink3)">₪${price.toLocaleString()}${isR?t('per_mo'):''} · ${rooms} ${t('card.rooms')}</span></td><td><span class="sd sa"></span>${t('cab.active')}</td><td>0</td><td style="display:flex;gap:5px;flex-wrap:wrap"><button class="mb2" onclick="openPromoFromCab(${newIdx})" style="color:var(--orange);border-color:var(--orange)">${t('cab.promote')}</button><button class="mb2 dn">${t('cab.remove')}</button></td>`;
    tbl.insertBefore(tr,tbl.firstChild)}

  const exp=new Date(Date.now()+30*24*3600*1000);
  document.getElementById('newId').textContent='#IL-'+String(newId).toString().slice(-5);
  document.getElementById('newAdr').textContent=addr.slice(0,32)+(addr.length>32?'…':'');
  document.getElementById('newExp').textContent=exp.toLocaleDateString('ru-RU')+' (30 дней)';
  document.getElementById('crLeft').textContent=userCredits;
  goStep('success');
  if(!savedToDb)showToast('✅ Объявление добавлено на карту!');
}

// Получить ID города по имени
function getCityId(name){
  const map={'Tel Aviv':1,'Jerusalem':2,'Haifa':3,'Rishon LeZion':4,'Netanya':5,'Ashdod':6,'Herzliya':7,'Raanana':8,'Petah Tikva':9,'Ramat Gan':10,'Holon':11,'Bat Yam':12,'Kiryat Yam':13,'Rehovot':14,'Eilat':15};
  return map[name]||1;
}
function openPub(){
  if(!loggedIn){openAuth('login');return}
  document.getElementById('pubOvl').classList.add('open');
  goStep(1);dzFiles=[];renderDz();
  // Сброс адреса
  selectedCityData=null;
  const pci=document.getElementById('pubCityInp');if(pci)pci.value='';
  const inp=document.getElementById('addrInp');
  inp.value='';inp.disabled=true;inp.style.opacity='.5';inp.classList.remove('has-val');
  const house=document.getElementById('addrHouse');
  house.value='';house.disabled=true;house.style.opacity='.5';
  document.getElementById('addrLat').value='';
  document.getElementById('addrLng').value='';
  document.getElementById('addrCityName').value='';
  var ch=document.getElementById('addrCityHe');if(ch)ch.value='';
  var cr=document.getElementById('addrCityRu');if(cr)cr.value='';
  var ce=document.getElementById('addrCityEn');if(ce)ce.value='';
  document.getElementById('addrSugg').classList.add('hid');
  setDealType('rent');
}
function closePub(){document.getElementById('pubOvl').classList.remove('open')}
function selTier(card,p,c){document.querySelectorAll('.tc').forEach(x=>x.classList.remove('on'));card.classList.add('on');tierPrice=p;tierCredits=c;document.getElementById('totPrc').textContent='₪'+p.toLocaleString();document.getElementById('payBtn').textContent='Оплатить ₪'+p.toLocaleString();document.getElementById('pubPln').textContent=c+' объявлений'}
function chkPrice(v){document.getElementById('priceWarn').style.display=(v&&parseFloat(v)<5000)?'block':'none'}
function genAI(){const ta=document.getElementById('pubDesc');ta.value='...';setTimeout(()=>{ta.value='Светлая квартира с качественным ремонтом. Просторная планировка, большой балкон. Рядом парк, метро, отличная транспортная доступность.';showToast('✨ AI описание готово')},900)}

// DROPZONE
function dzDrop(e){e.preventDefault();document.getElementById('dropzone').classList.remove('ov');dzAdd(e.dataTransfer.files)}
function dzAdd(files){[...files].forEach(f=>{if(dzFiles.length>=15){showToast('Макс. 15 фото');return}if(!/image\/(jpeg|png|webp)/.test(f.type)){showToast('JPG/PNG только');return}if(f.size>10*1024*1024){showToast(f.name.slice(0,20)+' > 10 МБ');return}const r=new FileReader();r.onload=ev=>{dzFiles.push({file:f,url:ev.target.result});renderDz()};r.readAsDataURL(f)});document.getElementById('dzInp').value=''}
function dzRemove(i){dzFiles.splice(i,1);renderDz()}
function renderDz(){const l=document.getElementById('dzList');if(!l)return;l.innerHTML=dzFiles.map((f,i)=>`<div class="dzth" style="background-image:url('${f.url}')"><button class="dzrm" onclick="dzRemove(${i})" type="button">✕</button></div>`).join('');const cnt=document.getElementById('dzCnt');if(cnt)cnt.textContent=dzFiles.length>0?dzFiles.length+' фото выбрано':''}

// AUTH
function openAuth(mode){authMode=mode;document.getElementById('authOvl').classList.add('open');document.getElementById('authS1').style.display='';document.getElementById('authS2').style.display='none';switchTab(mode)}
function closeAuth(){document.getElementById('authOvl').classList.remove('open')}
function switchTab(tab){authMode=tab;const isR=tab==='register';document.getElementById('tabLg').classList.toggle('on',!isR);document.getElementById('tabRg').classList.toggle('on',isR);document.getElementById('roleWrap').style.display=isR?'':'none';document.getElementById('nameWrap').style.display=isR?'':'none';document.getElementById('authBtn').textContent=isR?'Зарегистрироваться':'Войти';document.getElementById('authTtl').textContent=(isR?'Регистрация':'Вход')+' — Domania'}
function pickRole(card,role){document.querySelectorAll('.rc').forEach(c=>c.classList.remove('on'));card.classList.add('on');selectedRole=role;}
// ═══ I18N — полный словарь ═══
const I18N={
  ru:{
    'nav.all':'Все','nav.rent':'Аренда','nav.sale':'Продажа',
    'nav.rent_apt':'Аренда квартир','nav.rent_villa':'Аренда домов',
    'nav.buy_apt':'Покупка квартир','nav.buy_villa':'Покупка домов',
    'nav.signin':'Войти','nav.publish':'+ Разместить','nav.balance':'баланс',
    'nav.promote':'⚡ Продвижение',
    'role.agent':'Агент','role.owner':'Собственник','role.buyer':'Покупатель',
    'search.placeholder':'Город, район, улица...',
    'filter.all':'🏠 Все','filter.rent':'🔵 Аренда','filter.sale':'🟠 Продажа',
    'filter.rooms12':'1–2 комн.','filter.rooms34':'3–4 комн.',
    'filter.saferoom':'Безоп. комн.','filter.parking':'Парковка',
    'filter.balcony':'Балкон','filter.garden':'Сад','filter.sea':'Море 🌊','filter.new':'Новые',
    'filter.owner':'От собственника','filter.agency':'От агентства','filter.elevator':'Лифт','filter.ac':'Кондиционер','filter.furnished':'Мебель','filter.pets':'Можно с животными','filter.label':'Фильтры','filter.title':'Фильтры','filter.roomsTitle':'Комнаты','filter.sellerTitle':'Тип продавца','filter.amenitiesTitle':'Удобства','filter.reset':'Сбросить','filter.apply':'Показать','search.save':'Сохранить поиск','cab.searches':'Поиски','search.filtersWord':'фильтра','search.default_name':'Мой поиск','search.saved':'Поиск сохранён','search.empty':'Пока нет сохранённых поисков','search.applied':'Поиск применён','search.hint':'смотри в кабинете → 🔍 Поиски','search.modalTitle':'Готово, поиск в кармане','search.modalDesc':'Вернуться к нему можно в любой момент — кабинет → 🔍 Поиски','search.goToSearches':'Перейти к поискам','nav.allTypes':'Все типы','type.apartment':'Квартиры','type.house':'Дома и виллы','type.commercial':'Коммерция','nav.favorites':'Избранное','fav.default':'Себе','fav.new':'Новая подборка','fav.prompt':'Название подборки','fav.create':'Создать','fav.exit':'Показать все','filter.conditionTitle':'Состояние','filter.furnishedTitle':'Мебель','filter.petsTitle':'Можно ли с животными','pets.yes':'Да','pets.no':'Нет','pets.smallDog':'Маленькая собачка','pets.smallCat':'Маленький котик','cond.new':'Новый','cond.renovated':'Свежий ремонт','cond.cosmetic':'Косметический','cond.needsRepair':'Без ремонта','furn.full':'С мебелью','furn.partial':'Частично','furn.none':'Без мебели',
    'sort.label':'Релевантность','sort.rel':'🎯 Релевантность',
    'sort.price_asc':'💰 Цена ↑','sort.price_desc':'💰 Цена ↓','sort.new':'🆕 Сначала новые',
    'count':'Найдено','count_obj':'объектов',
    'map.rent':'🔵 Аренда','map.sale':'🟠 Продажа','map.objects':'объектов',
    'city.haifa':'⚓ Хайфа','city.kyam':'🏖 К.-Ям','city.ta':'🌆 ТА',
    'city.rishon':'🌇 Ришон','city.raanana':'🏘 Раанана',
    'deal.rent':'🔵 Аренда','deal.sale':'🟠 Продажа',
    'card.rooms':'комн.','card.sqm':'м²','card.floor':'эт.',
    'card.save':'Сохранить','card.compare':'Сравнить',
    'card.load_more':'Загрузить ещё →',
    'card.empty_title':'Объявлений не найдено','card.empty_sub':'Попробуйте изменить фильтры',
    'card.reset':'Сбросить фильтры',
    'detail.rooms':'комн.','detail.sqm':'м²','detail.floor':'этаж',
    'detail.honesty':'Индекс честности',
    'detail.wa':'💬 WhatsApp','detail.call':'📞 Позвонить','detail.chat':'💬 Написать в чат',
    'agent.type.agent':'Агент','agent.type.owner':'Владелец','agent.type.agency':'Агентство',
    'auth.title_login':'Вход в Domania','auth.title_reg':'Регистрация — Domania',
    'auth.login':'Войти','auth.register':'Регистрация',
    'auth.btn_login':'Войти','auth.btn_register':'Зарегистрироваться',
    'auth.email':'Email','auth.password':'Пароль','auth.name':'Имя',
    'auth.or':'или','auth.google':'Войти через Google',
    'auth.2fa':'2FA — Подтверждение','auth.2fa_sub':'Введите 6-значный код из Google Authenticator',
    'auth.2fa_btn':'Подтвердить',
    'role.buyer_title':'Клиент','role.buyer_sub':'Аренда или покупка для себя',
    'role.agent_title':'Риелтор / Агентство','role.agent_sub':'Сдать или продать за комиссию',
    'role.owner_title':'Собственник','role.owner_sub':'Сдаю или продаю без %',
    'pub.title':'Новое объявление','pub.step1':'Объект','pub.step2':'Фото','pub.step3':'Тариф','pub.step4':'Оплата',
    'pub.deal_rent':'🔵 Аренда','pub.deal_sale':'🟠 Продажа',
    'pub.city':'Город','pub.street':'Улица','pub.house':'Дом №',
    'pub.price':'Цена (₪)','pub.sqm':'Площадь (м²)','pub.floor':'Этаж','pub.reno':'Ремонт',
    'pub.desc':'Расскажите об объекте — это увеличивает число откликов...',
    'pub.ai':'✨ AI описание','pub.next':'Далее','pub.back':'← Назад',
    'pub.photo_title':'Загрузите фото объекта','pub.photo_sub':'Хорошие фото увеличивают отклики в 3–5 раз',
    'pub.drop':'Перетащите фото или нажмите для выбора','pub.drop_sub':'До 15 файлов · JPG/PNG · макс. 10 МБ',
    'pub.choose':'Выбрать файлы',
    'pub.balance_label':'Баланс','pub.buy_more':'Купить ещё','pub.use_credit':'✅ Использовать кредит из баланса',
    'pub.pay_card':'💳 Банковская карта',
    'pub.card_num':'Номер карты','pub.card_exp':'ММ/ГГ','pub.card_cvv':'CVV',
    'pub.pay_btn':'Оплатить',
    'pub.success':'Объявление опубликовано! 🎉',
    'pub.success_sub':'Ваш объект добавлен на карту и виден всем пользователям',
    'pub.listing_id':'ID объявления','pub.address':'Адрес','pub.expires':'Активно до',
    'pub.balance_left':'Остаток баланса','pub.close':'Закрыть',
    'pub.price_warn':'⚠️ Цена ниже рыночной — потребуется модерация.',
    'pub.reno.new':'Новый','pub.reno.fresh':'Свежий ремонт','pub.reno.cosm':'Косметический','pub.reno.needs':'Требует ремонта',
    'pub.prop.apt':'Квартира','pub.prop.villa':'Дом/Вилла','pub.prop.studio':'Студия','pub.prop.comm':'Коммерческая',
    'pub.rooms_label':'Комнат',
    'cab.dash':'Дашборд','cab.listings':'Объявления','cab.billing':'Подписка','cab.profile':'Профиль',
    'cab.views_today':'Просмотров сегодня','cab.messages':'Новых сообщений','cab.rating':'Рейтинг',
    'cab.week_chart':'Просмотры за неделю',
    'cab.verified':'Верифицированный агент','cab.verified_sub':'Документы проверены',
    'cab.my_listings':'Мои объявления',
    'cab.col_obj':'Объект','cab.col_status':'Статус','cab.col_views':'Просм.','cab.col_actions':'Действия',
    'cab.active':'Активно','cab.inactive':'Неактивно',
    'cab.promote':'⚡ ТОП','cab.remove':'Снять',
    'cab.balance':'Баланс','cab.topup':'Пополнить','cab.tx_title':'История транзакций','cab.no_tx':'Пока нет транзакций',
    'cab.topup_entry':'Пополнение',
    'cab.save':'Сохранить','cab.logout':'Выйти',
    'cab.phone':'Телефон','cab.name':'Имя',
    'ref.tab':'🔗 Рефералы','ref.title':'🔗 Реферальная программа','ref.link_label':'Твоя реферальная ссылка','ref.copy':'📋 Скопировать',
    'ref.invited':'Приглашено','ref.earned':'Кредитов заработано','ref.how':'Как это работает:',
    'ref.step1':'🎁 Ты приглашаешь друга → он регистрируется по твоей ссылке',
    'ref.step2':'✅ Ты получаешь +50 кредитов','ref.step3':'✅ Друг получает +20 кредитов',
    'ref.invited_users':'Приглашённые пользователи:',
    'pub.close_view':'Закрыть и посмотреть на карте',
    'topup.title':'Пополнение баланса','topup.current':'Текущий баланс:',
    'topup.card_num':'Номер карты','topup.card_exp':'ММ/ГГ','topup.card_cvv':'CVV',
    'topup.summary':'К оплате','topup.btn':'Пополнить на',
    'topup.plan1':'Старт','topup.plan2':'Базовый','topup.plan3':'Профи','topup.plan4':'Агентство',
    'topup.popular':'Популярный',
    'promo.title':'Поднять в ТОП','promo.sub':'24 часа в топе ленты',
    'promo.views':'В 5–8 раз больше просмотров','promo.pin':'Закрепляется выше всех',
    'promo.cost':'Стоимость','promo.pay':'⚡ Оплатить ₪50','promo.cancel':'Отмена',
    'chat.placeholder':'Написать...',
    'cmp.title':'Сравнение объектов','cmp.close':'Закрыть',
    'cmp.price':'Цена','cmp.rooms':'Комнат','cmp.sqm':'Площадь','cmp.sqm_price':'₪/м²','cmp.honesty':'Честность',
    'toast.saved':'✅ Сохранено в базе данных!',
    'toast.welcome':'✅ Добро пожаловать,',
    'toast.balance':'— ваш баланс',
    'toast.loading':'Загружено ещё...',
    'toast.need_auth':'Войдите чтобы сохранить',
    'toast.max_cmp':'Максимум 3 объекта для сравнения',
    'err.price':'❌ Укажите цену','err.street':'❌ Укажите улицу','err.city':'❌ Выберите город',
    'err.email':'Введите email','err.pass':'Минимум 8 символов',
    'err.card':'❌ Введите номер карты','err.exp':'❌ Введите срок действия','err.cvv':'❌ Введите CVV',
    'days':['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    'addr.manual_prompt':'Введите адрес вручную и нажмите «Далее»',
    'addr.manual_btn':'Ввести вручную:',
    'addr.searching':'🔍 Поиск...','addr.not_found':'Улица не найдена автоматически.',
    'addr.unavail':'Поиск недоступен','addr.enter_manual':'Ввести адрес вручную',
    'addr.toast':'📍 Адрес введён вручную',
    'mo':'мес.','per_mo':'/мес',
    'confirm.remove':'Снять объявление?',
    'loading':'Загрузка...','err.load':'Ошибка загрузки','server.down':'Сервер недоступен',
    'no_listings':'Объявлений пока нет',
    'topup.processing':'Обрабатываем...',
    'topup.topup_word':'Пополнить на',
    'topup.success':'✅ Баланс пополнен на',
    'topup.pay_method':'Способ оплаты',
    'pub.1_listing':'1 объявление','pub.per_unit':'₪100/шт',
    'topup.listings':'объявлений','topup.secure':'🔒 Защищённая оплата через Tranzila','topup.no_store':'Данные не хранятся',
    'pub.next_payment':'Далее: Оплата →','pub.card_expiry':'Срок действия','pub.card_name':'Имя на карте','pub.bank_card':'💳 Банковская карта','pub.reno.none':'— Ремонт —','pub.next_tariff':'Далее: Тариф →','pub.to_pay':'К оплате',
    'mod.tab':'🛡️ Модерация','mod.title':'Объявления на проверке','mod.empty':'Нет объявлений на проверке',
    'mod.approve':'✅ Одобрить','mod.reject':'❌ Отклонить','mod.reason':'Причина','mod.agent':'Агент',
    'mod.approved_toast':'✅ Объявление одобрено','mod.rejected_toast':'❌ Объявление отклонено',
    'mod.subtab_queue':'Очередь на проверку','mod.subtab_users':'Все пользователи',
    'mod.stat_users':'Пользователей','mod.stat_listings':'Объявлений','mod.stat_pending':'На проверке','mod.stat_revenue':'Оборот',
    'mod.col_user':'Пользователь','mod.col_role':'Роль','mod.col_credits':'Баланс','mod.col_listings':'Объявл.',
    'mod.col_referrals':'Рефералы','mod.col_deposited':'Внесено','mod.col_registered':'Регистрация','mod.col_verified':'Верифиц.',
    'mod.search_placeholder':'Поиск по имени или email...',
    'mod.select_user':'Выберите пользователя из списка слева',
    'mod.add_balance':'Пополнить','mod.sub_balance':'Списать','mod.block':'Заблокировать','mod.unblock':'Разблокировать',
    'mod.blocked_badge':'Заблокирован','mod.enter_amount':'Введите сумму (₪)',
    'mod.balance_updated':'✅ Баланс обновлён','mod.blocked_toast':'🔒 Пользователь заблокирован','mod.unblocked_toast':'🔓 Пользователь разблокирован',
    'mod.registered':'Зарегистрирован',
    'cab.balance_hint':'₪100 = 1 объявление на 30 дней',
  },
  en:{
    'nav.all':'All','nav.rent':'Rent','nav.sale':'Sale',
    'nav.rent_apt':'Rent Apartments','nav.rent_villa':'Rent Houses',
    'nav.buy_apt':'Buy Apartments','nav.buy_villa':'Buy Houses',
    'nav.signin':'Sign In','nav.publish':'+ List Property','nav.balance':'balance',
    'nav.promote':'⚡ Promote',
    'role.agent':'Agent','role.owner':'Owner','role.buyer':'Buyer',
    'search.placeholder':'City, area, street...',
    'filter.all':'🏠 All','filter.rent':'🔵 Rent','filter.sale':'🟠 Sale',
    'filter.rooms12':'1–2 rooms','filter.rooms34':'3–4 rooms',
    'filter.saferoom':'Safe room','filter.parking':'Parking',
    'filter.balcony':'Balcony','filter.garden':'Garden','filter.sea':'Sea 🌊','filter.new':'New',
    'filter.owner':'From owner','filter.agency':'From agency','filter.elevator':'Elevator','filter.ac':'A/C','filter.furnished':'Furnished','filter.pets':'Pets allowed','filter.label':'Filters','filter.title':'Filters','filter.roomsTitle':'Rooms','filter.sellerTitle':'Seller type','filter.amenitiesTitle':'Amenities','filter.reset':'Reset','filter.apply':'Show','search.save':'Save search','cab.searches':'Searches','search.filtersWord':'filters','search.default_name':'My search','search.saved':'Search saved','search.empty':'No saved searches yet','search.applied':'Search applied','search.hint':'find it in your cabinet → 🔍 Searches','search.modalTitle':'Search saved','search.modalDesc':'Come back to it anytime — cabinet → 🔍 Searches','search.goToSearches':'Go to searches','nav.allTypes':'All types','type.apartment':'Apartments','type.house':'Houses and villas','type.commercial':'Commercial','nav.favorites':'Favorites','fav.default':'Saved','fav.new':'New list','fav.prompt':'List name','fav.create':'Create','fav.exit':'Show all','filter.conditionTitle':'Condition','filter.furnishedTitle':'Furnishing','filter.petsTitle':'Pets allowed','pets.yes':'Yes','pets.no':'No','pets.smallDog':'Small dog','pets.smallCat':'Small cat','cond.new':'New','cond.renovated':'Renovated','cond.cosmetic':'Cosmetic','cond.needsRepair':'Needs repair','furn.full':'Furnished','furn.partial':'Partially furnished','furn.none':'Unfurnished',
    'sort.label':'Relevance','sort.rel':'🎯 Relevance',
    'sort.price_asc':'💰 Price ↑','sort.price_desc':'💰 Price ↓','sort.new':'🆕 Newest first',
    'count':'Found','count_obj':'listings',
    'map.rent':'🔵 Rent','map.sale':'🟠 Sale','map.objects':'listings',
    'city.haifa':'⚓ Haifa','city.kyam':'🏖 Kiryat Yam','city.ta':'🌆 Tel Aviv',
    'city.rishon':'🌇 Rishon','city.raanana':'🏘 Raanana',
    'deal.rent':'🔵 Rent','deal.sale':'🟠 Sale',
    'card.rooms':'rooms','card.sqm':'m²','card.floor':'fl.',
    'card.save':'Save','card.compare':'Compare',
    'card.load_more':'Load more →',
    'card.empty_title':'No listings found','card.empty_sub':'Try changing your filters',
    'card.reset':'Reset filters',
    'detail.rooms':'rooms','detail.sqm':'m²','detail.floor':'floor',
    'detail.honesty':'Honesty index',
    'detail.wa':'💬 WhatsApp','detail.call':'📞 Call','detail.chat':'💬 Chat',
    'agent.type.agent':'Agent','agent.type.owner':'Owner','agent.type.agency':'Agency',
    'auth.title_login':'Sign In to Domania','auth.title_reg':'Register — Domania',
    'auth.login':'Sign In','auth.register':'Register',
    'auth.btn_login':'Sign In','auth.btn_register':'Create Account',
    'auth.email':'Email','auth.password':'Password','auth.name':'Name',
    'auth.or':'or','auth.google':'Continue with Google',
    'auth.2fa':'2FA Verification','auth.2fa_sub':'Enter the 6-digit code from Google Authenticator',
    'auth.2fa_btn':'Confirm',
    'role.buyer_title':'Buyer','role.buyer_sub':'Looking to rent or buy',
    'role.agent_title':'Agent / Agency','role.agent_sub':'List properties for commission',
    'role.owner_title':'Owner','role.owner_sub':'Renting or selling directly',
    'pub.title':'New Listing','pub.step1':'Property','pub.step2':'Photos','pub.step3':'Plan','pub.step4':'Payment',
    'pub.deal_rent':'🔵 Rent','pub.deal_sale':'🟠 Sale',
    'pub.city':'City','pub.street':'Street','pub.house':'House №',
    'pub.price':'Price (₪)','pub.sqm':'Area (m²)','pub.floor':'Floor','pub.reno':'Condition',
    'pub.desc':'Tell about the property — this increases responses...',
    'pub.ai':'✨ AI description','pub.next':'Next','pub.back':'← Back',
    'pub.photo_title':'Upload property photos','pub.photo_sub':'Good photos increase responses 3–5x',
    'pub.drop':'Drag photos or click to select','pub.drop_sub':'Up to 15 files · JPG/PNG · max 10 MB',
    'pub.choose':'Choose files',
    'pub.balance_label':'Balance','pub.buy_more':'Buy more','pub.use_credit':'✅ Use balance credit',
    'pub.pay_card':'💳 Bank Card',
    'pub.card_num':'Card number','pub.card_exp':'MM/YY','pub.card_cvv':'CVV',
    'pub.pay_btn':'Pay',
    'pub.success':'Listing published! 🎉',
    'pub.success_sub':'Your property is on the map and visible to all users',
    'pub.listing_id':'Listing ID','pub.address':'Address','pub.expires':'Active until',
    'pub.balance_left':'Balance left','pub.close':'Close',
    'pub.price_warn':'⚠️ Price is below market — moderation required.',
    'pub.reno.new':'New','pub.reno.fresh':'Recently renovated','pub.reno.cosm':'Cosmetic','pub.reno.needs':'Needs renovation',
    'pub.prop.apt':'Apartment','pub.prop.villa':'House/Villa','pub.prop.studio':'Studio','pub.prop.comm':'Commercial',
    'pub.rooms_label':'Rooms',
    'cab.dash':'Dashboard','cab.listings':'Listings','cab.billing':'Billing','cab.profile':'Profile',
    'cab.views_today':'Views today','cab.messages':'New messages','cab.rating':'Rating',
    'cab.week_chart':'Views this week',
    'cab.verified':'Verified agent','cab.verified_sub':'Documents checked',
    'cab.my_listings':'My Listings',
    'cab.col_obj':'Property','cab.col_status':'Status','cab.col_views':'Views','cab.col_actions':'Actions',
    'cab.active':'Active','cab.inactive':'Inactive',
    'cab.promote':'⚡ TOP','cab.remove':'Remove',
    'cab.balance':'Balance','cab.topup':'Top Up','cab.tx_title':'Transaction history','cab.no_tx':'No transactions yet',
    'cab.topup_entry':'Top-up',
    'cab.save':'Save','cab.logout':'Sign Out',
    'cab.phone':'Phone','cab.name':'Name',
    'ref.tab':'🔗 Referrals','ref.title':'🔗 Referral program','ref.link_label':'Your referral link','ref.copy':'📋 Copy',
    'ref.invited':'Invited','ref.earned':'Credits earned','ref.how':'How it works:',
    'ref.step1':'🎁 Invite a friend → they sign up with your link',
    'ref.step2':'✅ You get +50 credits','ref.step3':'✅ Your friend gets +20 credits',
    'ref.invited_users':'Invited users:',
    'pub.close_view':'Close and view on map',
    'topup.title':'Top Up Balance','topup.current':'Current balance:',
    'topup.card_num':'Card number','topup.card_exp':'MM/YY','topup.card_cvv':'CVV',
    'topup.summary':'Total','topup.btn':'Pay',
    'topup.plan1':'Starter','topup.plan2':'Basic','topup.plan3':'Pro','topup.plan4':'Agency',
    'topup.popular':'Popular',
    'promo.title':'Boost to TOP','promo.sub':'24 hours at top of feed',
    'promo.views':'5–8x more views','promo.pin':'Pinned above all listings',
    'promo.cost':'Cost','promo.pay':'⚡ Pay ₪50','promo.cancel':'Cancel',
    'chat.placeholder':'Write a message...',
    'cmp.title':'Compare listings','cmp.close':'Close',
    'cmp.price':'Price','cmp.rooms':'Rooms','cmp.sqm':'Area','cmp.sqm_price':'₪/m²','cmp.honesty':'Honesty',
    'toast.saved':'✅ Saved to database!',
    'toast.welcome':'✅ Welcome,',
    'toast.balance':'— your balance',
    'toast.loading':'Loading more...',
    'toast.need_auth':'Sign in to save',
    'toast.max_cmp':'Max 3 items to compare',
    'err.price':'❌ Enter price','err.street':'❌ Enter street','err.city':'❌ Select city',
    'err.email':'Enter email','err.pass':'Minimum 8 characters',
    'err.card':'❌ Enter card number','err.exp':'❌ Enter expiry date','err.cvv':'❌ Enter CVV',
    'days':['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    'addr.manual_prompt':'Street not found. Enter manually and press Next',
    'addr.manual_btn':'Enter manually:',
    'addr.searching':'🔍 Searching...','addr.not_found':'Street not found automatically.',
    'addr.unavail':'Search unavailable','addr.enter_manual':'Enter address manually',
    'addr.toast':'📍 Address entered manually',
    'mo':'mo.','per_mo':'/mo',
    'confirm.remove':'Remove this listing?',
    'loading':'Loading...','err.load':'Failed to load','server.down':'Server unavailable',
    'no_listings':'No listings yet',
    'topup.processing':'Processing...','topup.topup_word':'Pay','topup.success':'✅ Balance topped up by',
    'topup.pay_method':'Payment method',
    'pub.1_listing':'1 listing','pub.per_unit':'₪100/each',
    'topup.listings':'listings','topup.secure':'🔒 Secure payment via Tranzila','topup.no_store':'Data is not stored',
    'pub.next_payment':'Next: Payment →','pub.card_expiry':'Expiry date','pub.card_name':'Name on card','pub.bank_card':'💳 Bank card','pub.reno.none':'— Condition —','pub.next_tariff':'Next: Plan →','pub.to_pay':'Total',
    'mod.tab':'🛡️ Moderation','mod.title':'Listings under review','mod.empty':'No listings pending review',
    'mod.approve':'✅ Approve','mod.reject':'❌ Reject','mod.reason':'Reason','mod.agent':'Agent',
    'mod.approved_toast':'✅ Listing approved','mod.rejected_toast':'❌ Listing rejected',
    'mod.subtab_queue':'Review queue','mod.subtab_users':'All users',
    'mod.stat_users':'Users','mod.stat_listings':'Listings','mod.stat_pending':'Pending','mod.stat_revenue':'Revenue',
    'mod.col_user':'User','mod.col_role':'Role','mod.col_credits':'Balance','mod.col_listings':'Listings',
    'mod.col_referrals':'Referrals','mod.col_deposited':'Deposited','mod.col_registered':'Registered','mod.col_verified':'Verified',
    'mod.search_placeholder':'Search by name or email...',
    'mod.select_user':'Select a user from the list',
    'mod.add_balance':'Add funds','mod.sub_balance':'Deduct','mod.block':'Block','mod.unblock':'Unblock',
    'mod.blocked_badge':'Blocked','mod.enter_amount':'Enter amount (₪)',
    'mod.balance_updated':'✅ Balance updated','mod.blocked_toast':'🔒 User blocked','mod.unblocked_toast':'🔓 User unblocked',
    'mod.registered':'Registered',
    'cab.balance_hint':'₪100 = 1 listing for 30 days',
  },
  he:{
    'nav.all':'הכל','nav.rent':'שכירות','nav.sale':'מכירה',
    'nav.rent_apt':'השכרת דירות','nav.rent_villa':'השכרת בתים',
    'nav.buy_apt':'קניית דירות','nav.buy_villa':'קניית בתים',
    'nav.signin':'כניסה','nav.publish':'+ פרסם מודעה','nav.balance':'יתרה',
    'nav.promote':'⚡ קידום',
    'role.agent':'סוכן','role.owner':'בעל נכס','role.buyer':'קונה',
    'search.placeholder':'עיר, שכונה, רחוב...',
    'filter.all':'🏠 הכל','filter.rent':'🔵 שכירות','filter.sale':'🟠 מכירה',
    'filter.rooms12':'1–2 חד\'','filter.rooms34':'3–4 חד\'',
    'filter.saferoom':'ממ"ד','filter.parking':'חניה',
    'filter.balcony':'מרפסת','filter.garden':'גינה','filter.sea':'ים 🌊','filter.new':'חדש',
    'filter.owner':'מבעל הבית','filter.agency':'מסוכנות','filter.elevator':'מעלית','filter.ac':'מזגן','filter.furnished':'מרוהטת','filter.pets':'מותר בעלי חיים','filter.label':'סינון','filter.title':'סינון','filter.roomsTitle':'חדרים','filter.sellerTitle':'סוג המוכר','filter.amenitiesTitle':'מאפיינים','filter.reset':'איפוס','filter.apply':'הצג','search.save':'שמור חיפוש','cab.searches':'חיפושים','search.filtersWord':'סינונים','search.default_name':'החיפוש שלי','search.saved':'החיפוש נשמר','search.empty':'אין עדיין חיפושים שמורים','search.applied':'החיפוש הופעל','search.hint':'תמצא אותו בפרופיל → 🔍 חיפושים','search.modalTitle':'החיפוש נשמר','search.modalDesc':'תוכל לחזור אליו בכל עת — פרופיל → 🔍 חיפושים','search.goToSearches':'עבור לחיפושים','nav.allTypes':'כל הסוגים','type.apartment':'דירות','type.house':'בתים ופרטיות','type.commercial':'מסחרי','nav.favorites':'מועדפים','fav.default':'שלי','fav.new':'רשימה חדשה','fav.prompt':'שם הרשימה','fav.create':'צור','fav.exit':'הצג הכל','filter.conditionTitle':'מצב','filter.furnishedTitle':'ריהוט','filter.petsTitle':'בעלי חיים','pets.yes':'כן','pets.no':'לא','pets.smallDog':'כלב קטן','pets.smallCat':'חתול קטן','cond.new':'חדש','cond.renovated':'משופץ','cond.cosmetic':'קוסמטי','cond.needsRepair':'דורש שיפוץ','furn.full':'מרוהטת','furn.partial':'מרוהטת חלקית','furn.none':'לא מרוהטת',
    'sort.label':'רלוונטיות','sort.rel':'🎯 רלוונטיות',
    'sort.price_asc':'💰 מחיר ↑','sort.price_desc':'💰 מחיר ↓','sort.new':'🆕 החדשים קודם',
    'count':'נמצאו','count_obj':'מודעות',
    'map.rent':'🔵 שכירות','map.sale':'🟠 מכירה','map.objects':'מודעות',
    'city.haifa':'⚓ חיפה','city.kyam':'🏖 קריית ים','city.ta':'🌆 תל אביב',
    'city.rishon':'🌇 ראשון','city.raanana':'🏘 רעננה',
    'deal.rent':'🔵 שכירות','deal.sale':'🟠 מכירה',
    'card.rooms':'חד\'','card.sqm':'מ"ר','card.floor':'קומה',
    'card.save':'שמור','card.compare':'השווה',
    'card.load_more':'טען עוד →',
    'card.empty_title':'לא נמצאו מודעות','card.empty_sub':'נסה לשנות את הפילטרים',
    'card.reset':'איפוס פילטרים',
    'detail.rooms':'חד\'','detail.sqm':'מ"ר','detail.floor':'קומה',
    'detail.honesty':'מדד אמינות',
    'detail.wa':'💬 ווטסאפ','detail.call':'📞 התקשר','detail.chat':'💬 שלח הודעה',
    'agent.type.agent':'סוכן','agent.type.owner':'בעל נכס','agent.type.agency':'משרד תיווך',
    'auth.title_login':'כניסה ל-Domania','auth.title_reg':'הרשמה — Domania',
    'auth.login':'כניסה','auth.register':'הרשמה',
    'auth.btn_login':'כניסה','auth.btn_register':'הרשמה',
    'auth.email':'אימייל','auth.password':'סיסמה','auth.name':'שם',
    'auth.or':'או','auth.google':'כניסה עם גוגל',
    'auth.2fa':'אימות דו-שלבי','auth.2fa_sub':'הכנס קוד 6 ספרות מ-Google Authenticator',
    'auth.2fa_btn':'אשר',
    'role.buyer_title':'לקוח','role.buyer_sub':'מחפש שכירות או קנייה',
    'role.agent_title':'מתווך / משרד','role.agent_sub':'להשכיר או למכור בעמלה',
    'role.owner_title':'בעל נכס','role.owner_sub':'משכיר או מוכר ישירות',
    'pub.title':'מודעה חדשה','pub.step1':'נכס','pub.step2':'תמונות','pub.step3':'תעריף','pub.step4':'תשלום',
    'pub.deal_rent':'🔵 שכירות','pub.deal_sale':'🟠 מכירה',
    'pub.city':'עיר','pub.street':'רחוב','pub.house':'מס\' בית',
    'pub.price':'מחיר (₪)','pub.sqm':'שטח (מ"ר)','pub.floor':'קומה','pub.reno':'מצב',
    'pub.desc':'ספר על הנכס — זה מגדיל את מספר הפניות...',
    'pub.ai':'✨ תיאור AI','pub.next':'הבא','pub.back':'← חזור',
    'pub.photo_title':'העלה תמונות לנכס','pub.photo_sub':'תמונות טובות מגדילות פניות פי 3–5',
    'pub.drop':'גרור תמונות או לחץ לבחירה','pub.drop_sub':'עד 15 קבצים · JPG/PNG · מקסימום 10 מ"ב',
    'pub.choose':'בחר קבצים',
    'pub.balance_label':'יתרה','pub.buy_more':'קנה עוד','pub.use_credit':'✅ השתמש בקרדיט',
    'pub.pay_card':'💳 כרטיס אשראי',
    'pub.card_num':'מספר כרטיס','pub.card_exp':'MM/YY','pub.card_cvv':'CVV',
    'pub.pay_btn':'שלם',
    'pub.success':'המודעה פורסמה! 🎉',
    'pub.success_sub':'הנכס שלך על המפה וגלוי לכל המשתמשים',
    'pub.listing_id':'מזהה מודעה','pub.address':'כתובת','pub.expires':'פעיל עד',
    'pub.balance_left':'יתרה נותרת','pub.close':'סגור',
    'pub.price_warn':'⚠️ מחיר נמוך מהשוק — נדרש בדיקת מנהל.',
    'pub.reno.new':'חדש','pub.reno.fresh':'שיפוץ טרי','pub.reno.cosm':'קוסמטי','pub.reno.needs':'דרוש שיפוץ',
    'pub.prop.apt':'דירה','pub.prop.villa':'בית/וילה','pub.prop.studio':'סטודיו','pub.prop.comm':'מסחרי',
    'pub.rooms_label':'חדרים',
    'cab.dash':'לוח בקרה','cab.listings':'מודעות','cab.billing':'חיוב','cab.profile':'פרופיל',
    'cab.views_today':'צפיות היום','cab.messages':'הודעות חדשות','cab.rating':'דירוג',
    'cab.week_chart':'צפיות השבוע',
    'cab.verified':'סוכן מאומת','cab.verified_sub':'מסמכים נבדקו',
    'cab.my_listings':'המודעות שלי',
    'cab.col_obj':'נכס','cab.col_status':'סטטוס','cab.col_views':'צפיות','cab.col_actions':'פעולות',
    'cab.active':'פעיל','cab.inactive':'לא פעיל',
    'cab.promote':'⚡ TOP','cab.remove':'הסר',
    'cab.balance':'יתרה','cab.topup':'הפקד','cab.tx_title':'היסטוריית עסקאות','cab.no_tx':'אין עסקאות עדיין',
    'cab.topup_entry':'הפקדה',
    'cab.save':'שמור','cab.logout':'יציאה',
    'cab.phone':'טלפון','cab.name':'שם',
    'ref.tab':'🔗 הפניות','ref.title':'🔗 תוכנית הפניות','ref.link_label':'קישור ההפניה שלך','ref.copy':'📋 העתק',
    'ref.invited':'הוזמנו','ref.earned':'קרדיטים שנצברו','ref.how':'איך זה עובד:',
    'ref.step1':'🎁 אתה מזמין חבר ← הוא נרשם עם הקישור שלך',
    'ref.step2':'✅ אתה מקבל +50 קרדיטים','ref.step3':'✅ החבר מקבל +20 קרדיטים',
    'ref.invited_users':'משתמשים מוזמנים:',
    'pub.close_view':'סגור וצפה במפה',
    'topup.title':'טעינת יתרה','topup.current':'יתרה נוכחית:',
    'topup.card_num':'מספר כרטיס','topup.card_exp':'MM/YY','topup.card_cvv':'CVV',
    'topup.summary':'סה"כ לתשלום','topup.btn':'שלם',
    'topup.plan1':'סטארט','topup.plan2':'בסיסי','topup.plan3':'פרו','topup.plan4':'משרד',
    'topup.popular':'פופולרי',
    'promo.title':'קדם לTOP','promo.sub':'24 שעות בראש הפיד',
    'promo.views':'פי 5–8 יותר צפיות','promo.pin':'מוצמד מעל כולם',
    'promo.cost':'עלות','promo.pay':'⚡ שלם ₪50','promo.cancel':'ביטול',
    'chat.placeholder':'כתוב הודעה...',
    'cmp.title':'השוואת נכסים','cmp.close':'סגור',
    'cmp.price':'מחיר','cmp.rooms':'חדרים','cmp.sqm':'שטח','cmp.sqm_price':'₪/מ"ר','cmp.honesty':'אמינות',
    'toast.saved':'✅ נשמר במסד הנתונים!',
    'toast.welcome':'✅ ברוך הבא,',
    'toast.balance':'— יתרתך',
    'toast.loading':'טוען עוד...',
    'toast.need_auth':'כנס כדי לשמור',
    'toast.max_cmp':'מקסימום 3 נכסים להשוואה',
    'err.price':'❌ הכנס מחיר','err.street':'❌ הכנס רחוב','err.city':'❌ בחר עיר',
    'err.email':'הכנס אימייל','err.pass':'מינימום 8 תווים',
    'err.card':'❌ הכנס מספר כרטיס','err.exp':'❌ הכנס תוקף','err.cvv':'❌ הכנס CVV',
    'days':['ב\'','ג\'','ד\'','ה\'','ו\'','ש\'','א\''],
    'addr.manual_prompt':'הרחוב לא נמצא. הכנס ידנית ולחץ "הבא"',
    'addr.manual_btn':'הכנס ידנית:',
    'addr.searching':'🔍 מחפש...','addr.not_found':'הרחוב לא נמצא אוטומטית.',
    'addr.unavail':'החיפוש לא זמין','addr.enter_manual':'הכנס כתובת ידנית',
    'addr.toast':'📍 כתובת הוכנסה ידנית',
    'mo':'חו\'','per_mo':'/חו\'',
    'confirm.remove':'להסיר את המודעה?',
    'loading':'טוען...','err.load':'שגיאה בטעינה','server.down':'השרת לא זמין',
    'no_listings':'אין מודעות עדיין',
    'topup.processing':'מעבד...','topup.topup_word':'שלם','topup.success':'✅ היתרה הוטענה ב-',
    'topup.pay_method':'אמצעי תשלום',
    'pub.1_listing':'מודעה אחת','pub.per_unit':'₪100/יחידה',
    'topup.listings':'מודעות','topup.secure':'🔒 תשלום מאובטח דרך Tranzila','topup.no_store':'הנתונים אינם נשמרים',
    'pub.next_payment':'הבא: תשלום →','pub.card_expiry':'תוקף','pub.card_name':'שם על הכרטיס','pub.bank_card':'💳 כרטיס אשראי','pub.reno.none':'— מצב —','pub.next_tariff':'הבא: תעריף →','pub.to_pay':'לתשלום',
    'mod.tab':'🛡️ ניהול','mod.title':'מודעות לבדיקה','mod.empty':'אין מודעות לבדיקה',
    'mod.approve':'✅ אשר','mod.reject':'❌ דחה','mod.reason':'סיבה','mod.agent':'סוכן',
    'mod.approved_toast':'✅ המודעה אושרה','mod.rejected_toast':'❌ המודעה נדחתה',
    'mod.subtab_queue':'תור לבדיקה','mod.subtab_users':'כל המשתמשים',
    'mod.stat_users':'משתמשים','mod.stat_listings':'מודעות','mod.stat_pending':'ממתינות','mod.stat_revenue':'מחזור',
    'mod.col_user':'משתמש','mod.col_role':'תפקיד','mod.col_credits':'יתרה','mod.col_listings':'מודעות',
    'mod.col_referrals':'הפניות','mod.col_deposited':'הופקד','mod.col_registered':'נרשם','mod.col_verified':'מאומת',
    'mod.search_placeholder':'חפש לפי שם או אימייל...',
    'mod.select_user':'בחר משתמש מהרשימה',
    'mod.add_balance':'הפקד','mod.sub_balance':'נכה','mod.block':'חסום','mod.unblock':'בטל חסימה',
    'mod.blocked_badge':'חסום','mod.enter_amount':'הכנס סכום (₪)',
    'mod.balance_updated':'✅ היתרה עודכנה','mod.blocked_toast':'🔒 המשתמש נחסם','mod.unblocked_toast':'🔓 החסימה בוטלה',
    'mod.registered':'נרשם',
    'cab.balance_hint':'₪100 = מודעה אחת ל-30 יום',
  }
};

function t(k){return (I18N[lang]||I18N.ru)[k]||k;}

// ═══ API — подключение к серверу ═══
const API=(function(){
  var h=window.location.hostname;
  if(h==='localhost'||h==='127.0.0.1'||h==='10.100.102.101')return 'http://10.100.102.101:4000/api';
  return window.location.origin+'/api';
})();

async function doAuth(){
  const _errEl=document.getElementById('authErr');if(_errEl)_errEl.style.display='none';
  let email=document.getElementById('authEmail')?.value?.trim();
  // Короткий логин без @ (для служебных/модераторских аккаунтов) — дополняем доменом
  if(email && !email.includes('@')) email = email + '@nesay.il';
  const pass=document.querySelector('#authS1 input[type="password"]')?.value;
  const name=document.getElementById('authName')?.value?.trim();
  if(!email){const em=document.getElementById('authErr');if(em){em.textContent=t('err.email');em.style.display='block';}return}
  if(!pass||pass.length<8){const em=document.getElementById('authErr');if(em){em.textContent=t('err.pass');em.style.display='block';}return}
  const btn=document.getElementById('authBtn');
  btn.textContent='...';btn.disabled=true;showLoader();
  try{
    const url=authMode==='register'?`${API}/auth/register`:`${API}/auth/login`;
    const body=authMode==='register'
      ?{email,password:pass,name:name||'Пользователь',role:selectedRole==='owner'?'owner':(selectedRole==='agent'?'agent':'buyer'),ref_code:new URLSearchParams(window.location.search).get('ref')||localStorage.getItem('nesay_ref')||undefined}
      :{email,password:pass};
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(!res.ok){hideLoader();const em=document.getElementById('authErr');if(em){em.textContent=data.error||'Неверный логин или пароль';em.style.display='block';}return}
    localStorage.setItem('nesay_token',data.token);
    // Получаем свежие данные из БД (включая актуальные кредиты)
    const meRes=await fetch(`${API}/auth/me`,{headers:{Authorization:'Bearer '+data.token}});
    const freshUser=meRes.ok?(await meRes.json()):data.user;
    finishAuth(freshUser);
    setTimeout(()=>refreshCredits(),300);
  }catch(e){hideLoader();const em=document.getElementById('authErr');if(em){em.textContent=t('server.down');em.style.display='block';}}
  finally{btn.textContent=authMode==='register'?'Зарегистрироваться':'Войти';btn.disabled=false}
}
function tfin(inp,idx){if(inp.value.length===1&&idx<5)document.querySelectorAll('#tfd input')[idx+1].focus()}
function tfkey(e,idx){if(e.key==='Backspace'&&idx>0&&!e.target.value)document.querySelectorAll('#tfd input')[idx-1].focus()}
function verify2FA(){const code=Array.from(document.querySelectorAll('#tfd input')).map(i=>i.value).join('');if(code.length===6)finishAuth('agent@nesay.il');else showToast('Введите все 6 цифр')}

function showLoader(){
  var l=document.getElementById('nesay-loader');
  if(!l)return;
  var star=document.getElementById('loader-star-wrap');
  // Reset animations
  ['.star-t1','.star-t2'].forEach(function(sel){
    var p=l.querySelector(sel);
    if(p){p.style.animation='none';void p.offsetHeight;p.style.animation='';}
  });
  if(star){star.classList.remove('spin');void star.offsetHeight;}
  l.style.opacity='1';
  l.classList.add('show');
  // After draw completes - spin and zoom into screen
  setTimeout(function(){
    var isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if(isSafari&&l){l.style.backdropFilter='none';l.style.webkitBackdropFilter='none';}
    if(star && star.animate){
      if(isSafari){
        star.animate([
          {transform:'scale(1)', opacity:1},
          {transform:'scale(1.15)', opacity:1, offset:0.4},
          {transform:'scale(8)', opacity:0}
        ], {duration:900, easing:'ease-out', fill:'forwards'});
      } else {
        star.animate([
          {transform:'rotateY(0deg) scale(1)', opacity:1},
          {transform:'rotateY(360deg) scale(1.2)', opacity:1, offset:0.4},
          {transform:'rotateY(360deg) scale(12)', opacity:0}
        ], {duration:1400, easing:'cubic-bezier(0.4,0,0.2,1)', fill:'forwards'});
      }
    } else if(star){
      star.classList.add('spin');
    }
    setTimeout(function(){
      l.style.transition='opacity 0.3s';
      l.style.opacity='0';
      setTimeout(function(){
        l.classList.remove('show');
        l.style.opacity='';
        l.style.transition='';
      },300);
    },900);
      },2300);
}
function hideLoader(){
  var l=document.getElementById('nesay-loader');
  if(l){
    l.style.transition='opacity 0.3s';
    l.style.opacity='0';
    setTimeout(function(){
      l.classList.remove('show');
      l.style.opacity='';
      l.style.transition='';
    },300);
  }
}
function finishAuth(user){
  const u=typeof user==='object'?user:{email:user,name:'Пользователь',role:selectedRole||'buyer',credits:0};
  loggedIn=true;
  const isAgent=u.role==='agent'||u.role==='owner';
  closeAuth();
  document.getElementById('navGuest').style.display='none';
  document.getElementById('navUser').style.display='flex';
  const displayName=u.name||(u.email||'').split('@')[0]||'Пользователь';
  // Навбар
  document.getElementById('navNm').textContent=displayName;
  const roleEl=document.getElementById('navRl');roleEl.textContent=isAgent?(u.role==='owner'?t('role.owner'):t('role.agent')):t('role.buyer');roleEl.dataset.role=u.role||'buyer';
  document.getElementById('navAv').textContent=displayName.slice(0,2).toUpperCase();
  document.getElementById('navCr').style.display=isAgent?'':'none';
  userCredits=u.credits||0;
  document.getElementById('navCr').textContent='₪'+userCredits+' '+t('nav.balance');
  // Кабинет
  const cabAv=document.getElementById('cabAv');if(cabAv)cabAv.textContent=displayName.slice(0,2).toUpperCase();
  const cabNm=document.getElementById('cabNm');if(cabNm)cabNm.textContent=displayName+(u.verified?' ✓':'');
  const cabEmail=document.getElementById('cabEmail');if(cabEmail)cabEmail.textContent=u.email||'';
  const profName=document.getElementById('profName');if(profName)profName.value=displayName;
  const cabCr=document.getElementById('cabCr');if(cabCr)cabCr.textContent='₪'+userCredits;
  const crBal=document.getElementById('crBal');if(crBal)crBal.textContent='₪'+userCredits;
  window.isModerator=!!u.is_moderator;
  const modBtn=document.getElementById('modTabBtn');if(modBtn)modBtn.style.display=window.isModerator?'':'none';
  showToast(t('toast.welcome')+' '+displayName+'!');
}
function doOAuth(){selectedRole='agent';setTimeout(()=>finishAuth('agent@nesay.il'),900)}
function reqAuth(){if(!loggedIn)openAuth('login');else openPub()}
function logout(){loggedIn=false;localStorage.removeItem('nesay_token');closeCab();document.getElementById('navGuest').style.display='flex';document.getElementById('navUser').style.display='none';showToast('👋')}

// CHAT
function openChat(){document.getElementById('chatOvl').classList.add('open');document.querySelector('.cn').style.display='none';setTimeout(()=>document.getElementById('chatMsgs').scrollTop=9999,50)}
function closeChat(){document.getElementById('chatOvl').classList.remove('open')}
function sendMsg(){const inp=document.getElementById('chatInp');const txt=inp.value.trim();if(!txt)return;inp.value='';const msgs=document.getElementById('chatMsgs'),typ=document.getElementById('typInd');const d=document.createElement('div');d.className='msg in';d.innerHTML=`<div class="mb">${txt}</div><div class="mm">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>`;msgs.insertBefore(d,typ);msgs.scrollTop=msgs.scrollHeight;typ.style.display='';msgs.scrollTop=msgs.scrollHeight;setTimeout(()=>{typ.style.display='none';const r=['👍','!מעולה','OK!','Отлично!'];const x=document.createElement('div');x.className='msg out';x.innerHTML=`<div class="mb">${r[Math.floor(Math.random()*r.length)]}</div><div class="mm">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} ✓✓</div>`;msgs.insertBefore(x,typ);msgs.scrollTop=msgs.scrollHeight},1400)}

// CABINET
let _modUsersCache=[];
function switchModSubtab(tab){
  document.getElementById('modSubQueueBtn').classList.toggle('on',tab==='queue');
  document.getElementById('modSubUsersBtn').classList.toggle('on',tab==='users');
  document.getElementById('modSubQueueBtn').style.borderBottom=tab==='queue'?'2px solid var(--c)':'2px solid transparent';
  document.getElementById('modSubUsersBtn').style.borderBottom=tab==='users'?'2px solid var(--c)':'2px solid transparent';
  document.getElementById('modSubQueue').style.display=tab==='queue'?'':'none';
  document.getElementById('modSubUsers').style.display=tab==='users'?'':'none';
  if(tab==='users'&&!_modUsersCache.length)loadModUsers();
}
async function loadModStats(){
  const token=localStorage.getItem('nesay_token');
  try{
    const res=await fetch(`${API}/admin/stats`,{headers:{Authorization:'Bearer '+token}});
    if(!res.ok)return;
    const d=await res.json();
    const eu=document.getElementById('modStatUsers');if(eu)eu.textContent=d.users;
    const el=document.getElementById('modStatListings');if(el)el.textContent=d.listings;
    const ep=document.getElementById('modStatPending');if(ep)ep.textContent=d.pending;
    const er=document.getElementById('modStatRevenue');if(er)er.textContent='₪'+Math.round(d.revenue).toLocaleString();
  }catch(e){}
}
let _selectedModUserId=null;
function renderModUsers(list){
  const wrap=document.getElementById('modUserList');
  if(!wrap)return;
  if(!list.length){wrap.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">—</div>';return}
  wrap.innerHTML=list.map(function(u){
    const displayName=(u.name||'')+(u.surname?' '+u.surname:'')||u.email;
    const isSel=u.id===_selectedModUserId;
    return `<div onclick="selectModUser('${u.id}')" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--line);background:${isSel?'var(--cl)':'transparent'}">
      <div style="font-weight:700;font-size:13px;display:flex;align-items:center;gap:5px">${displayName}${u.blocked?' 🔒':''}${u.is_moderator?' 🛡️':''}</div>
      <div style="font-size:11px;color:var(--ink3);margin-top:2px">₪${parseInt(u.credits||0).toLocaleString()}</div>
    </div>`;
  }).join('');
}
function filterModUsers(q){
  q=(q||'').toLowerCase().trim();
  if(!q){renderModUsers(_modUsersCache);return}
  const filtered=_modUsersCache.filter(function(u){
    const name=((u.name||'')+' '+(u.surname||'')).toLowerCase();
    const email=(u.email||'').toLowerCase();
    return name.includes(q)||email.includes(q);
  });
  renderModUsers(filtered);
}
function selectModUser(id){
  _selectedModUserId=id;
  renderModUsers(_modUsersCache);
  const u=_modUsersCache.find(function(x){return x.id===id});
  if(!u)return;
  const displayName=(u.name||'')+(u.surname?' '+u.surname:'')||u.email;
  const regDate=u.created_at?new Date(u.created_at).toLocaleDateString('ru-RU'):'—';
  const roleLbl=u.role==='agent'?t('role.agent'):u.role==='owner'?t('role.owner'):t('role.buyer');
  const detail=document.getElementById('modUserDetail');
  if(!detail)return;
  detail.innerHTML=`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div class="ua" style="width:44px;height:44px;font-size:14px">${displayName.slice(0,2).toUpperCase()}</div>
      <div>
        <div style="font-weight:800;font-size:15px">${displayName}${u.blocked?' <span style="color:var(--red);font-size:12px">('+t('mod.blocked_badge')+')</span>':''}</div>
        <div style="font-size:12px;color:var(--ink3)">${u.email} · ${roleLbl}${u.verified?' ✓':''}</div>
        <div style="font-size:11px;color:var(--ink3);margin-top:2px">${t('mod.registered')}: ${regDate}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      <div style="background:var(--bg);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--ink3)">${t('cab.balance')}</div><div style="font-size:16px;font-weight:800;margin-top:2px">₪${parseInt(u.credits||0).toLocaleString()}</div></div>
      <div style="background:var(--bg);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--ink3)">${t('mod.col_listings')}</div><div style="font-size:16px;font-weight:800;margin-top:2px">${u.listings_count}</div></div>
      <div style="background:var(--bg);border-radius:10px;padding:10px"><div style="font-size:11px;color:var(--ink3)">${t('mod.col_referrals')}</div><div style="font-size:16px;font-weight:800;margin-top:2px">${u.referrals_count}</div></div>
    </div>
    <div style="font-size:12px;color:var(--ink3);margin-bottom:12px">${t('mod.col_deposited')}: ₪${Math.round(u.total_deposited||0).toLocaleString()}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="mb2" style="color:var(--green);border-color:var(--green)" onclick="adjustModBalance('${u.id}',1)">➕ ${t('mod.add_balance')}</button>
      <button class="mb2" style="color:var(--orange);border-color:var(--orange)" onclick="adjustModBalance('${u.id}',-1)">➖ ${t('mod.sub_balance')}</button>
      <button class="mb2" style="color:var(--red);border-color:var(--red)" onclick="toggleModBlock('${u.id}',${u.blocked?'true':'false'})">${u.blocked?'🔓 '+t('mod.unblock'):'🔒 '+t('mod.block')}</button>
    </div>
  `;
}
async function adjustModBalance(id,sign){
  const raw=prompt(t('mod.enter_amount'));
  if(!raw)return;
  const amount=parseInt(raw);
  if(!amount||amount<=0)return;
  const token=localStorage.getItem('nesay_token');
  try{
    const res=await fetch(`${API}/admin/users/${id}/balance`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({amount:amount*sign})});
    if(res.ok){showToast(t('mod.balance_updated'));loadModUsers();loadModStats();}
    else{showToast('❌ Error')}
  }catch(e){showToast('❌ Error')}
}
async function toggleModBlock(id,isBlocked){
  const token=localStorage.getItem('nesay_token');
  const action=isBlocked?'unblock':'block';
  try{
    const res=await fetch(`${API}/admin/users/${id}/${action}`,{method:'POST',headers:{Authorization:'Bearer '+token}});
    if(res.ok){showToast(isBlocked?t('mod.unblocked_toast'):t('mod.blocked_toast'));loadModUsers();}
    else{showToast('❌ Error')}
  }catch(e){showToast('❌ Error')}
}
async function loadModUsers(){
  const token=localStorage.getItem('nesay_token');
  const wrap=document.getElementById('modUserList');
  if(wrap)wrap.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">'+t('loading')+'</div>';
  try{
    const res=await fetch(`${API}/admin/users`,{headers:{Authorization:'Bearer '+token}});
    if(!res.ok){if(wrap)wrap.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">'+t('err.load')+'</div>';return}
    _modUsersCache=await res.json();
    renderModUsers(_modUsersCache);
    if(_selectedModUserId)selectModUser(_selectedModUserId);
  }catch(e){if(wrap)wrap.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">'+t('server.down')+'</div>'}
}
async function loadModerationQueue(){
  loadModStats();
  const token=localStorage.getItem('nesay_token');
  const list=document.getElementById('modList');
  if(!list)return;
  list.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">'+t('loading')+'</div>';
  try{
    const res=await fetch(`${API}/listings/moderation/pending`,{headers:{Authorization:'Bearer '+token}});
    if(!res.ok){list.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">'+t('err.load')+'</div>';return}
    const data=await res.json();
    if(!data.length){list.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">'+t('mod.empty')+'</div>';return}
    list.innerHTML=data.map(function(d){
      const cn=d.city_name||{};const city=cn.ru||cn.en||'';
      const addr=(d.street||'')+(d.house_number?' '+d.house_number:'')+(city?', '+city:'');
      return `<div class="vfb" style="align-items:flex-start;flex-direction:column;gap:8px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;width:100%">
          <div>
            <div style="font-weight:800;font-size:14px">${addr||'—'}</div>
            <div style="font-size:12px;color:var(--ink3);margin-top:2px">₪${parseInt(d.price).toLocaleString()} · ${d.rooms} ${t('card.rooms')}</div>
            <div style="font-size:12px;color:var(--ink3);margin-top:2px">${t('mod.agent')}: ${d.agent_name||''} (${d.agent_email||''})</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--red);background:#FFF1F1;padding:8px 10px;border-radius:8px;width:100%">
          <b>${t('mod.reason')}:</b> ${d.moderation_reason||'—'}
        </div>
        <div style="display:flex;gap:8px">
          <button class="bm2" style="background:var(--green);color:#fff;border:none" onclick="approveListing('${d.id}',this)">${t('mod.approve')}</button>
          <button class="bm2" style="background:var(--red);color:#fff;border:none" onclick="rejectListing('${d.id}',this)">${t('mod.reject')}</button>
        </div>
      </div>`;
    }).join('');
  }catch(e){list.innerHTML='<div style="text-align:center;color:var(--ink3);padding:20px">'+t('server.down')+'</div>'}
}
async function approveListing(id,btn){
  const token=localStorage.getItem('nesay_token');
  btn.disabled=true;
  try{
    const res=await fetch(`${API}/listings/${id}/approve`,{method:'POST',headers:{Authorization:'Bearer '+token}});
    if(res.ok){showToast(t('mod.approved_toast'));loadModerationQueue()}
    else{showToast('❌ Error');btn.disabled=false}
  }catch(e){showToast('❌ Error');btn.disabled=false}
}
async function rejectListing(id,btn){
  const token=localStorage.getItem('nesay_token');
  btn.disabled=true;
  try{
    const res=await fetch(`${API}/listings/${id}/reject`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({reason:'Отклонено модератором'})});
    if(res.ok){showToast(t('mod.rejected_toast'));loadModerationQueue()}
    else{showToast('❌ Error');btn.disabled=false}
  }catch(e){showToast('❌ Error');btn.disabled=false}
}
function openCab(){document.getElementById('cabOvl').classList.add('open');renderWkChart();loadMyListings()}
async function loadMyListings(){
  const token=localStorage.getItem('nesay_token');
  if(!token)return;
  const tbl=document.getElementById('cabListTbl');
  if(!tbl)return;
  tbl.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--ink3);padding:20px">'+t('loading')+'</td></tr>';
  try{
    const res=await fetch(`${API}/listings/my/all`,{headers:{Authorization:'Bearer '+token}});
    if(!res.ok){tbl.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--ink3);padding:20px">'+t('err.load')+'</td></tr>';return}
    const data=await res.json();
    if(!data.length){tbl.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--ink3);padding:20px">'+t('no_listings')+'</td></tr>';return}
    tbl.innerHTML=data.map((d,i)=>{
      const cn=d.city_name||{};const city=cn.ru||cn.en||'';
      const addr=(d.street||'')+(d.house_number?' '+d.house_number:'')+(city?', '+city:'');
      const price='₪'+parseInt(d.price).toLocaleString()+(d.deal_type==='rent'?t('per_mo'):'');
      const status=d.status==='active'?'<span class="sd sa"></span>'+t('cab.active'):'<span class="sd sx"></span>'+t('cab.inactive');
      return `<tr>
        <td><b>${addr.split(',')[0]||'Без адреса'}</b><br><span style="font-size:11px;color:var(--ink3)">${price} · ${d.rooms} ${t('card.rooms')}</span></td>
        <td>${status}</td>
        <td>👁 ${d.views||0} &nbsp; ❤️ ${d.fav_count||0}</td>
        <td style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="mb2" onclick="openPromoModal()" style="color:var(--orange);border-color:var(--orange)">${t('cab.promote')}</button>
          <button class="mb2 dn" onclick="deleteMyListing('${d.id}',this)">${t('cab.remove')}</button>
        </td>
      </tr>`;
    }).join('');
  }catch(e){tbl.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--ink3);padding:20px">'+t('server.down')+'</td></tr>'}
}
async function deleteMyListing(id,btn){
  if(!confirm(t('confirm.remove')))return;
  const token=localStorage.getItem('nesay_token');
  try{
    const res=await fetch(`${API}/listings/${id}`,{method:'DELETE',headers:{Authorization:'Bearer '+token}});
    if(res.ok){btn.closest('tr').remove();showToast('✅ Объявление снято')}
  }catch(e){showToast('❌ Ошибка')}
}
function closeCab(){document.getElementById('cabOvl').classList.remove('open')}
function swCab(tab){document.querySelectorAll('.cabt').forEach((b,i)=>b.classList.toggle('on',['dash','list','bill','prof','ref','mod','searches'][i]===tab));document.querySelectorAll('.cabp').forEach(p=>p.classList.remove('on'));document.getElementById('cab-'+tab).classList.add('on');if(tab==='ref')loadRefStats();if(tab==='mod')loadModerationQueue();if(tab==='searches')loadSavedSearches();}
let savedSearchesCache=[];
async function saveCurrentSearch(){
  const token=localStorage.getItem('nesay_token');
  if(!token){showToast(t('toast.need_auth'));return;}
  const q=(document.getElementById('searchInput')?.value||'').trim();
  const filters={q, activeType, activeFilters:[...activeFilters], sort:currentSort};
  let name=q;
  if(activeType==='rent')name+=(name?' · ':'')+'Аренда';
  else if(activeType==='sale')name+=(name?' · ':'')+'Продажа';
  if(activeFilters.size>0)name+=' · '+activeFilters.size+' '+t('search.filtersWord');
  if(!name)name=t('search.default_name');
  try{
    const res=await fetch(`${API}/listings/saved-searches`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({name,filters})});
    if(res.ok)showSearchSavedModal();
  }catch(e){}
}
async function loadSavedSearches(){
  const token=localStorage.getItem('nesay_token');
  const box=document.getElementById('cabSearchesList');
  if(!token||!box)return;
  try{
    const res=await fetch(`${API}/listings/saved-searches`,{headers:{Authorization:'Bearer '+token}});
    savedSearchesCache=await res.json();
    if(!savedSearchesCache.length){box.innerHTML='<div style="padding:20px;text-align:center;color:var(--ink3);font-size:13px">'+t('search.empty')+'</div>';return;}
    box.innerHTML=savedSearchesCache.map(r=>
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)">'+
      '<span style="font-size:13px;font-weight:600;cursor:pointer" onclick="applySavedSearch(\''+r.id+'\')">🔍 '+r.name+'</span>'+
      '<span style="cursor:pointer;color:var(--ink3)" onclick="deleteSavedSearch(\''+r.id+'\')">✕</span>'+
      '</div>'
    ).join('');
  }catch(e){}
}
function applySavedSearch(id){
  const s=savedSearchesCache.find(x=>String(x.id)===String(id));
  if(!s)return;
  const f=s.filters||{};
  if(document.getElementById('searchInput'))document.getElementById('searchInput').value=f.q||'';
  activeType=f.activeType||'all';
  activeFilters=new Set(f.activeFilters||[]);
  currentSort=f.sort||'rel';
  closeCab();
  applyFilter();
  showToast('✅ '+t('search.applied'));
}
async function deleteSavedSearch(id){
  const token=localStorage.getItem('nesay_token');
  try{
    await fetch(`${API}/listings/saved-searches/${id}`,{method:'DELETE',headers:{Authorization:'Bearer '+token}});
    loadSavedSearches();
  }catch(e){}
}
function renderWkChart(){const data=[12,28,19,35,42,23,30];const days=t('days');const max=Math.max(...data);const ch=document.getElementById('wkChart');if(!ch)return;ch.innerHTML=data.map((v,i)=>`<div class="brc"><div class="bv">${v}</div><div class="br ${i===4?'hi':''}" style="height:${v/max*100}%"></div><div class="bdy">${days[i]}</div></div>`).join('')}

// PROMO
function openPromoModal(idx){promoTargetIdx=idx;document.getElementById('promoOvl').classList.add('open')}
function closePromo(){document.getElementById('promoOvl').classList.remove('open')}
function payPromo(){const btn=document.getElementById('promoPayBtn');btn.textContent='...';btn.disabled=true;setTimeout(()=>{if(promoTargetIdx>=0){listings[promoTargetIdx].promoted=true;listings[promoTargetIdx]._promoMins=1440}closePromo();applyFilter();showToast('⚡ TOP 24h активирован!')},900)}
setInterval(()=>{let expired=false;listings.forEach(d=>{if(d.promoted&&d._promoMins>0){d._promoMins=Math.max(0,d._promoMins-1/60);if(d._promoMins<=0){d.promoted=false;expired=true;}}});if(expired){renderCards(filteredListings);if(typeof M!=='undefined'&&M.renderCards)M.renderCards();}},1000);

// COMPARE
function toggleCmp(idx){const btn=document.getElementById('cmpB'+idx);const a=cmpList.indexOf(idx);if(a>=0){cmpList.splice(a,1);if(btn){btn.style.color='var(--ink3)';btn.style.background='none';btn.style.borderColor='var(--line)'}}else{if(cmpList.length>=3){showToast(t('toast.max_cmp'));return}cmpList.push(idx);if(btn){btn.style.color='var(--c)';btn.style.background='var(--cl)';btn.style.borderColor='var(--c)'}}updCmpBar()}
function updCmpBar(){const bar=document.getElementById('cmpBar');bar.classList.toggle('open',cmpList.length>0);for(let s=0;s<3;s++){const sl=document.getElementById('cs'+s);if(!sl)continue;if(s<cmpList.length){const d=listings[cmpList[s]];sl.className='csl fl';sl.innerHTML=`<span class="csn">${d.addr[lang].split(',')[0]}</span><button class="csrm" onclick="toggleCmp(${cmpList[s]})">✕</button>`}else{sl.className='csl';sl.innerHTML=`<span style="font-size:18px;opacity:.3">+</span>`}}document.getElementById('doCmp').disabled=cmpList.length<2}
function clearCmp(){cmpList.forEach(i=>{const b=document.getElementById('cmpB'+i);if(b){b.style.color='var(--ink3)';b.style.background='none';b.style.borderColor='var(--line)'}});cmpList=[];updCmpBar()}
function openCmpT(){if(cmpList.length<2)return;const items=cmpList.map(i=>listings[i]);const prices=items.map(d=>d.priceNum);const psm=items.map((d,i)=>Math.round(prices[i]/d.sqm));const rows=[{l:'Цена',vals:items.map((d,i)=>({v:'₪'+prices[i].toLocaleString(),best:prices[i]===Math.min(...prices),worst:prices[i]===Math.max(...prices)&&cmpList.length>1}))},{l:'Комнат',vals:items.map(d=>({v:d.rooms,best:d.rooms===Math.max(...items.map(x=>x.rooms))}))},{l:'Площадь',vals:items.map(d=>({v:d.sqm+' м²',best:d.sqm===Math.max(...items.map(x=>x.sqm))}))},{l:'₪/м²',vals:items.map((d,i)=>({v:'₪'+psm[i].toLocaleString(),best:psm[i]===Math.min(...psm),worst:psm[i]===Math.max(...psm)&&cmpList.length>1}))},{l:'Честность',vals:items.map(d=>({v:d.agent.honesty+'/100',best:d.agent.honesty===Math.max(...items.map(x=>x.agent.honesty))}))}];const hd='<thead><tr><th></th>'+items.map(d=>`<th><div style="font-size:28px;margin-bottom:6px">${d.icon}</div><div style="font-size:15px;font-weight:900;color:var(--ink)">₪${d.priceNum.toLocaleString()}</div><div style="font-size:11px;color:var(--ink3)">${d.addr[lang].split(',')[0]}</div></th>`).join('')+'</tr></thead>';const body='<tbody>'+rows.map(r=>`<tr><td>${r.l}</td>${r.vals.map(v=>`<td class="${v.best?'bv2':''} ${v.worst?'wv':''}">${v.v}</td>`).join('')}</tr>`).join('')+'</tbody>';document.getElementById('cmpTbl').innerHTML=hd+body;document.getElementById('cmpOvl').classList.add('open')}
function closeCmpT(){document.getElementById('cmpOvl').classList.remove('open')}

// LANG
function setLang(l){
  lang=l;
  setTimeout(function(){updateMapLang(l);},100);
  document.querySelectorAll('#M-bar .lb').forEach(function(b){var txt=b.textContent.trim();b.classList.toggle('on',(l==='he'&&txt==='עב')||(l==='ru'&&txt==='РУ')||(l==='en'&&txt==='EN'));});
  const isHe=l==='he';
  document.querySelectorAll('.lb').forEach(b=>{const txt=b.textContent.trim();b.classList.toggle('on',(l==='he'&&txt==='עב')||(l==='ru'&&txt==='РУ')||(l==='en'&&txt==='EN'))});
  document.documentElement.lang=l;
  document.documentElement.dir=isHe?'rtl':'ltr';
  document.body.dir=isHe?'rtl':'ltr';
  // Mobile elements always LTR
  ['M-bar','M-list-wrap','M-tabs'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.setAttribute('dir','ltr');
  });
  const si=document.getElementById('searchInput');if(si)si.placeholder=t('search.placeholder');
  const ttMap={'ttAll':'filter.all','ttRent':'filter.rent','ttSale':'filter.sale'};
  Object.entries(ttMap).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.textContent=t(key)});
  const pillMap={'rooms12':'filter.rooms12','rooms34':'filter.rooms34','safeRoom':'filter.saferoom','parking':'filter.parking','balcony':'filter.balcony','garden':'filter.garden','sea':'filter.sea','new':'filter.new'};
  document.querySelectorAll('.fpill[data-filter]').forEach(p=>{const k=pillMap[p.dataset.filter];if(k)p.textContent=t(k)});
  const sortKeyMap={'rel':'sort.rel','price-asc':'sort.price_asc','price-desc':'sort.price_desc','new':'sort.new'};
  const slbl=document.getElementById('sortLbl');if(slbl)slbl.textContent=t(sortKeyMap[currentSort]||'sort.label').replace(/^[\u{1F3AF}\u{1F4B0}\u{1F195}\s]*/u,'');
  document.querySelectorAll('.smi').forEach(mi=>{const k=sortKeyMap[mi.dataset.v];if(k)mi.textContent=t(k)});
  const mcntSpan=document.querySelector('.mcnt span');if(mcntSpan)mcntSpan.textContent=t('map.objects');
  const chi=document.getElementById('chatInp');if(chi)chi.placeholder=t('chat.placeholder');
  applyI18nStatic();
  const navRlEl=document.getElementById('navRl');
  if(navRlEl&&navRlEl.dataset.role){
    const r=navRlEl.dataset.role;
    navRlEl.textContent=r==='owner'?t('role.owner'):r==='agent'?t('role.agent'):t('role.buyer');
  }
  applyFilter();
  renderWkChart();
  if(loggedIn){document.getElementById('navCr').textContent='\u20aa'+userCredits+' '+t('nav.balance');}
  // Sync mob lang buttons
  document.querySelectorAll('#M-bar .lb').forEach(function(b){
    var txt=b.textContent.trim();
    b.classList.toggle('on',(l==='he'&&txt==='עב')||(l==='ru'&&txt==='РУ')||(l==='en'&&txt==='EN'));
  });
  // Update map language
  if(window.map){
    try{
      var ml=l==='he'?'he':l==='en'?'en':'ru';
      window.map.getStyle().layers.forEach(function(layer){
        if(layer.type==='symbol'){
          try{window.map.setLayoutProperty(layer.id,'text-field',['coalesce',['get','name_'+ml],['get','name']]);}catch(e){}
        }
      });
    }catch(e){}
  }
  // Mob cards re-render
  if(typeof M!=='undefined'&&M.renderCards)M.renderCards();
}

// MISC
function flyToFav(startEl){
  const target=document.querySelector('.ctab[onclick="openFavoritesView()"]');
  if(!target||!startEl)return;
  const s=startEl.getBoundingClientRect();
  const t=target.getBoundingClientRect();
  const fly=document.createElement('div');
  fly.textContent='\u2764\ufe0f';
  fly.style.cssText='position:fixed;left:'+s.left+'px;top:'+s.top+'px;font-size:18px;z-index:9999;pointer-events:none;transition:all .6s cubic-bezier(.2,.8,.2,1)';
  document.body.appendChild(fly);
  requestAnimationFrame(()=>{
    fly.style.left=t.left+'px';
    fly.style.top=t.top+'px';
    fly.style.fontSize='10px';
    fly.style.opacity='0.2';
  });
  setTimeout(()=>{fly.remove();bumpFavBadge(1);},600);
}
function bumpFavBadge(delta){
  const target=document.querySelector('.ctab[onclick="openFavoritesView()"]');
  if(!target)return;
  let badge=document.getElementById('favBadge');
  if(!badge){
    badge=document.createElement('span');
    badge.id='favBadge';
    badge.style.cssText='background:#e63946;color:#fff;border-radius:10px;font-size:10px;padding:1px 5px;margin-left:2px;font-weight:700;transition:transform .2s;display:inline-block';
    target.appendChild(badge);
  }
  let n=Math.max(0,parseInt(badge.textContent||'0')+delta);
  badge.textContent=n>0?n:'';
  badge.style.display=n>0?'inline-block':'none';
  badge.style.transform='scale(1.4)';
  setTimeout(()=>{badge.style.transform='scale(1)'},200);
}
async function toggleFav(btn,idx){
  const d=listings[idx];
  const token=localStorage.getItem('nesay_token');
  if(!token){showToast(t('toast.need_auth'));return}
  const liked=btn.textContent.includes('\u2764\ufe0f');
  btn.textContent=liked?'\ud83e\udd0d':'\u2764\ufe0f';
  if(!liked)flyToFav(btn);else bumpFavBadge(-1);
  if(d&&d.id&&String(d.id).length>10){
    try{
      const res=await fetch(`${API}/listings/${d.id}/favorite`,{method:'POST',headers:{Authorization:'Bearer '+token}});
      if(res.ok){
        const rd=await res.json();
        if(d)d.fav_count=rd.count;
        showToast(rd.liked?'\u2764\ufe0f '+t('card.save'):'\u2715 '+t('card.save'));
      }
    }catch(e){}
  }else{showToast(liked?'\u2715':'\u2764\ufe0f '+t('card.save'))}
}
function updateMapLang(l){if(!map)return;try{var ml=l==='he'?'he':l==='en'?'en':'ru';map.getStyle().layers.forEach(function(layer){if(layer.type==='symbol'){try{map.setLayoutProperty(layer.id,'text-field',['coalesce',['get','name_'+ml],['get','name']]);}catch(e){}}});}catch(e){}}
let _tt;
function showToast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>el.classList.remove('show'),2800)}
document.addEventListener('click',e=>{
  if(!e.target.closest('.sdd')){document.getElementById('smn')?.classList.remove('open');document.getElementById('fmn')?.classList.remove('open');document.getElementById('dealMenu-rent')?.classList.remove('open');document.getElementById('dealMenu-sale')?.classList.remove('open');}
  if(!e.target.closest('.aw'))document.getElementById('addrSugg')?.classList.add('hid');
});

// Keyboard navigation for address suggestions
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')document.getElementById('addrSugg')?.classList.add('hid');
});

// TOPUP — пополнение баланса
let topupAmount=500,topupCredits=5;
function openTopup(){document.getElementById('topupOvl').classList.add('open');document.getElementById('topupBal').textContent='₪'+userCredits}
function closeTopup(){document.getElementById('topupOvl').classList.remove('open')}
function selTopup(card,amount,credits){document.querySelectorAll('#topupOvl .tc').forEach(c=>c.classList.remove('on'));card.classList.add('on');topupAmount=amount;topupCredits=amount;/* shekels = amount */document.getElementById('topupTotal').textContent='₪'+amount.toLocaleString();document.getElementById('topupBtn').textContent=t('topup.topup_word')+' ₪'+amount.toLocaleString()}
async function doTopup(){
  const card=document.getElementById('topupCard')?.value?.replace(/\s/g,'');
  const exp=document.getElementById('topupExp')?.value;
  const cvv=document.getElementById('topupCvv')?.value;
  if(!card||card.length<16){showToast('❌ Введите номер карты');return}
  if(!exp||exp.length<5){showToast('❌ Введите срок действия');return}
  if(!cvv||cvv.length<3){showToast('❌ Введите CVV');return}
  const btn=document.getElementById('topupBtn');btn.textContent=t('topup.processing');btn.disabled=true;
  setTimeout(async()=>{
    try{
      const token=localStorage.getItem('nesay_token');
      const res=await fetch(`${API}/payments/topup`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({amount:topupAmount,credits:topupCredits})});
      if(res.ok){
        const rd=await res.json();
        userCredits=rd.credits||userCredits+topupAmount;
        document.getElementById('navCr').textContent='₪'+userCredits+' '+t('nav.balance');
        const cabCr=document.getElementById('cabCr');if(cabCr)cabCr.textContent='₪'+userCredits;
        const tb=document.getElementById('topupBal');if(tb)tb.textContent='₪'+userCredits;
        const hist=document.getElementById('txHistory');
        if(hist){if(hist.querySelector('[data-i18n="cab.no_tx"]'))hist.innerHTML='';const row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:12px';row.innerHTML=`<span style="color:var(--ink2)">${t('cab.topup_entry')}</span><span style="color:var(--green);font-weight:700">+₪${topupAmount}</span>`;hist.insertBefore(row,hist.firstChild)}
        closeTopup();showToast('✅ Баланс пополнен на ₪'+topupAmount+'!');
      }else{showToast('❌ Ошибка оплаты')}
    }catch(e){userCredits+=topupAmount;document.getElementById('navCr').textContent='₪'+userCredits+' баланс';const cabCr=document.getElementById('cabCr');if(cabCr)cabCr.textContent='₪'+userCredits;closeTopup();showToast('✅ Баланс пополнен на ₪'+topupAmount+'!')}
    btn.textContent=t('topup.topup_word')+' ₪'+topupAmount.toLocaleString();hideLoader();btn.disabled=false;
  },2000);
}

// ═══ PROMO FROM CABINET ═══
function openPromoFromCab(idx){promoTargetIdx=idx;closeCab();document.getElementById('promoOvl').classList.add('open')}

// ═══ INDEXEDDB — сохранение объявлений с фото (лимит ~гигабайты) ═══
const DB_NAME='nesay_db', DB_VER=2, STORE='listings';
let db=null;

function openDB(){
  return new Promise((res,rej)=>{
    if(db){res(db);return}
    const req=indexedDB.open(DB_NAME,DB_VER);
    req.onupgradeneeded=e=>{
      const d=e.target.result;
      if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});
    };
    req.onsuccess=e=>{db=e.target.result;res(db)};
    req.onerror=e=>rej(e.target.error);
  });
}

async function saveUserListings(){
  try{
    const idb=await openDB();
    const userL=listings.filter(d=>d._userAdded);
    const tx=idb.transaction(STORE,'readwrite');
    const store=tx.objectStore(STORE);
    // Сохраняем ПОЛНОСТЬЮ включая userPhoto (base64)
    userL.forEach(d=>store.put({...d}));
    await new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=e=>rej(e.target.error)});
  }catch(e){console.warn('IDB save:',e)}
}

async function loadUserListings(){
  try{
    const idb=await openDB();
    const tx=idb.transaction(STORE,'readonly');
    const store=tx.objectStore(STORE);
    const all=await new Promise((res,rej)=>{
      const req=store.getAll();
      req.onsuccess=e=>res(e.target.result);
      req.onerror=e=>rej(e.target.error);
    });
    // Восстанавливаем: сортируем по id убыванию (новые первыми)
    all.sort((a,b)=>b.id-a.id).forEach(d=>{
      if(!listings.find(x=>x.id===d.id)){
        d._userAdded=true;
        listings.unshift(d);
      }
    });
    // После загрузки — рендерим с реальными фото
    filteredListings=getFiltered();
    renderCards(filteredListings);
    if(mapLoaded)rebuildMarkers(filteredListings);
  }catch(e){console.warn('IDB load:',e)}
}

// ═══ АВТОВХОД при открытии страницы ═══
async function tryAutoLogin(){
  const token=localStorage.getItem('nesay_token');
  if(!token)return;
  try{
    const res=await fetch(`${API}/auth/me`,{headers:{Authorization:'Bearer '+token}});
    if(res.ok){
      const user=await res.json();
      user.credits=Number(user.credits)||0;
      finishAuth(user);
      setTimeout(()=>refreshCredits(),300);
    }
    else localStorage.removeItem('nesay_token');
  }catch(e){}
}

// Обновить кредиты с сервера
async function refreshCredits(){
  const token=localStorage.getItem('nesay_token');
  if(!token)return;
  try{
    const res=await fetch(API+'/auth/me',{headers:{'Authorization':'Bearer '+token}});
    if(res.ok){
      const u=await res.json();
      userCredits=Number(u.credits)||0;
      document.getElementById('navCr').textContent='₪'+userCredits+' '+t('nav.balance');
      const cabCr=document.getElementById('cabCr');if(cabCr)cabCr.textContent='₪'+userCredits;
      const crBal=document.getElementById('crBal');if(crBal)crBal.textContent='₪'+userCredits;
      showToast('₪'+userCredits+' — ваш баланс');
    }
  }catch(e){showToast('Сервер недоступен');}
}

// ═══ PHOTO SLIDER ═══
const slideIdx={};
function slidePhoto(idx,dir){
  if(!slideIdx[idx])slideIdx[idx]=0;
  const d=listings[idx];
  const photos=d.allPhotos||(d.userPhoto?[d.userPhoto]:[]);
  if(photos.length<2)return;
  slideIdx[idx]=(slideIdx[idx]+dir+photos.length)%photos.length;
  const sl=document.getElementById('slides_'+idx);
  if(sl)sl.style.transform=`translateX(-${slideIdx[idx]*100}%)`;
  const dots=document.getElementById('dots_'+idx);
  if(dots){dots.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('on',i===slideIdx[idx]))}
}

// ═══ TOP MIXING — алгоритм как OLX ═══
function mixPromoted(data){
  const promoted=data.filter(d=>d.promoted);
  const normal=data.filter(d=>!d.promoted);
  if(!promoted.length)return data;
  const result=[];
  let pi=0,ni=0,pos=0;
  while(ni<normal.length||pi<promoted.length){
    // Каждые 3 обычных — 1 топовое (ротация)
    if(pi<promoted.length&&pos%4===0){
      result.push(promoted[pi%promoted.length]);pi++;
    } else if(ni<normal.length){
      result.push(normal[ni]);ni++;
    } else if(pi<promoted.length){
      result.push(promoted[pi%promoted.length]);pi++;
    }
    pos++;
  }
  return result;
}

// Apply i18n on page load
function applyI18nStatic(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    if(k)el.textContent=t(k);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const k=el.getAttribute('data-i18n-placeholder');
    if(k)el.placeholder=t(k);
  });
}

// INIT — карта и карточки сначала без пользовательских объявлений,
// потом IndexedDB подгружает их асинхронно с фото
applyI18nStatic();
filteredListings=getFiltered();
renderCards(filteredListings);
renderWkChart();
try{initMap()}catch(e){console.warn('Mapbox:',e)}
// Грузим сохранённые объявления (включая фото) из IndexedDB
loadUserListings();
// Автовход если токен сохранён в localStorage
tryAutoLogin();
// Загружаем объявления из базы данных
(async function loadFromDB(){
  try{
    const res=await fetch(API+'/listings?limit=50');
    if(!res.ok)return;
    const data=await res.json();
    const dbListings=data.listings||[];
    if(!dbListings.length)return;
    let added=0;
    dbListings.forEach(function(d){
      if(listings.find(function(x){return String(x.id)===String(d.id);}))return;
      var cn=d.city_name||{};
      var cityName=cn[lang]||cn.ru||cn.en||'';
      var street=(d.street||'')+(d.house_number?' '+d.house_number:'');
      var addr=[street,cityName].filter(Boolean).join(', ')||'Адрес не указан';
      var desc=d.description||{};
      listings.unshift({
        id:d.id,
        dealType:d.deal_type,
        promoted:d.promoted||false,
        allPhotos:d.all_photos||[],
        thumb:'linear-gradient(135deg,#1C6EF2,#0d5480)',
        icon:'🏠',
        priceNum:parseInt(d.price)||0,
        addr:{ru:addr,he:addr,en:addr},
        rooms:parseFloat(d.rooms)||1,
        sqm:parseInt(d.sqm)||0,
        floor:d.floor||'—',
        tags:{ru:['Активно ✓'],he:['פעיל ✓'],en:['Active ✓']},
        hi:[0],
        desc:{ru:desc.ru||desc.en||'',he:desc.he||'',en:desc.en||desc.ru||''},
        agent:{
          name:d.agent_name||'Агент',
          initials:(d.agent_name||'АГ').slice(0,2).toUpperCase(),
          type:d.agent_role||'agent',
          verified:d.agent_verified||false,
          deals:0,rating:0,reviews:0,honesty:50
        },
        views:parseInt(d.views)||0,
        fav_count:parseInt(d.fav_count)||0,
        badge:'new',
        lat:parseFloat(d.lat)||32.0853,
        lng:parseFloat(d.lng)||34.7818
      });
      added++;
    });
    if(added>0){
      filteredListings=getFiltered();
      renderCards(filteredListings);
      if(mapLoaded)rebuildMarkers(filteredListings);
    }
  }catch(e){console.warn('DB load error:',e);}
})();
