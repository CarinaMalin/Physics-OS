import { getDeviceId, loadSyncConfig, saveSyncConfig, generateSyncId, pushEncryptedSnapshot, pullEncryptedSnapshot } from './sync.js';

const DB_NAME = 'physics-os-db';
const DB_VERSION = 2;
const LAST_CHANGE_KEY = 'physics-os-last-change-v1';
const MODULES_KEY = 'physics-os-modules-v1';
const STATS_KEY = 'physics-os-user-stats-v1';
let db;
let documents = [];
let cards = [];
let tasks = [];
let selectedDocumentId = null;
let taskFilter = 'open';
let currentProblem = null;
let hintIndex = 0;
let reviewQueue = [];
let reviewIndex = 0;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = (v='') => String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
const rnd = (min,max,step=1) => Math.round((min + Math.random()*(max-min))/step)*step;
const fmt = (v,d=3) => Number.isFinite(v) ? Number(v).toLocaleString('de-DE',{maximumFractionDigits:d}) : '—';

const titles = {
  home:'Dashboard', study:'Studium', files:'Dateien & Goodnotes', formulas:'Formel-Explorer', trainer:'Problem Trainer',
  lab:'Praktikums-Auswertung', sim:'Physics Playground', cards:'Lernkarten', sync:'Geräte-Sync', vault:'Vault & Backup'
};

const defaultModules = ['Experimentalphysik I','Mathematik / Rechenmethoden','Programmieren','Physik-Praktikum'];
function loadModules(){ try{return JSON.parse(localStorage.getItem(MODULES_KEY)) || defaultModules}catch{return defaultModules} }
function getStats(){ try{return {trainerSolved:0,missionDates:[],...JSON.parse(localStorage.getItem(STATS_KEY)||'{}')}}catch{return {trainerSolved:0,missionDates:[]}} }
function saveStats(stats){ localStorage.setItem(STATS_KEY,JSON.stringify(stats)); }
function touch(){ localStorage.setItem(LAST_CHANGE_KEY,new Date().toISOString()); }

const conceptLexicon = [
  ['kinematik',['kinematik','geschwindigkeit','beschleunigung','weg','bewegung','freier fall']],
  ['newton',['newton','kraft','kräfte','traegheit','trägheit']],
  ['energie',['energie','arbeit','leistung','joule']],
  ['impuls',['impuls','stoß','stoss','impulserhaltung']],
  ['rotation',['drehmoment','rotation','winkelgeschwindigkeit','trägheitsmoment','traegheitsmoment']],
  ['gravitation',['gravitation','gravitations','kepler','orbit','umlaufbahn']],
  ['elektrizität',['elektrizität','elektrizitaet','spannung','strom','widerstand','ohm']],
  ['elektrostatik',['coulomb','ladung','elektrisches feld','potential']],
  ['magnetismus',['magnet','lorentzkraft','magnetfeld','induktion']],
  ['wellen',['welle','wellenlänge','wellenlaenge','frequenz','interferenz','beugung']],
  ['optik',['optik','linse','brechung','reflexion','brennweite']],
  ['thermodynamik',['thermodynamik','temperatur','wärme','waerme','entropie','gasgesetz']],
  ['quantenphysik',['quant','photon','planck','wellenfunktion','heisenberg']],
  ['relativität',['relativität','relativitaet','lorentzfaktor','zeitdilatation','einstein']],
  ['astrophysik',['astrophysik','stern','schwarzer körper','schwarzkoerper','rotverschiebung','hubble','exoplanet']],
  ['fehlerrechnung',['messunsicherheit','fehlerfortpflanzung','standardabweichung','regression','messwert']]
];

const formulas = [
  {name:'Newton II',formula:'F = m · a',topic:'Mechanik',meaning:'Die resultierende Kraft bestimmt die Beschleunigung eines Körpers.',units:'N = kg · m/s²',hint:'Vektorgleichung: Richtung und Vorzeichen beachten.',vars:[['F','Kraft','N'],['m','Masse','kg'],['a','Beschleunigung','m/s²']],rearr:['a = F / m','m = F / a'],trainer:'newton'},
  {name:'Gleichförmig beschleunigte Bewegung',formula:'s = s₀ + v₀t + ½at²',topic:'Mechanik',meaning:'Ort bei konstanter Beschleunigung.',units:'m',hint:'Nur bei konstanter Beschleunigung direkt anwendbar.',vars:[['s','Ort','m'],['v₀','Anfangsgeschwindigkeit','m/s'],['a','Beschleunigung','m/s²'],['t','Zeit','s']],rearr:['v = v₀ + at','Δs = v₀t + ½at²'],trainer:'kinematics'},
  {name:'Kinetische Energie',formula:'Eₖ = ½mv²',topic:'Mechanik',meaning:'Bewegungsenergie eines Körpers.',units:'J',hint:'Die Geschwindigkeit geht quadratisch ein.',vars:[['Eₖ','kinetische Energie','J'],['m','Masse','kg'],['v','Geschwindigkeit','m/s']],rearr:['v = √(2Eₖ/m)','m = 2Eₖ/v²'],trainer:'energy'},
  {name:'Potentielle Energie',formula:'Eₚ = mgh',topic:'Mechanik',meaning:'Lageenergie nahe der Erdoberfläche.',units:'J',hint:'Das Nullniveau von h ist frei wählbar.',vars:[['Eₚ','potentielle Energie','J'],['m','Masse','kg'],['g','Fallbeschleunigung','m/s²'],['h','Höhe','m']],rearr:['h = Eₚ/(mg)','m = Eₚ/(gh)'],trainer:'energy'},
  {name:'Impuls',formula:'p = m · v',topic:'Mechanik',meaning:'Bewegungsgröße eines Körpers.',units:'kg · m/s',hint:'Impuls ist eine Vektorgröße.',vars:[['p','Impuls','kg·m/s'],['m','Masse','kg'],['v','Geschwindigkeit','m/s']],rearr:['v = p/m','m = p/v']},
  {name:'Arbeit',formula:'W = ∫ F · ds',topic:'Mechanik',meaning:'Arbeit ist das Linienintegral der Kraft längs des Weges.',units:'J',hint:'Bei konstanter paralleler Kraft gilt W = F·s.',vars:[['W','Arbeit','J'],['F','Kraft','N'],['s','Weg','m']],rearr:['W = F·s (konstant)','P = dW/dt']},
  {name:'Zentripetalkraft',formula:'Fᶻ = mv²/r',topic:'Mechanik',meaning:'Radial nach innen gerichtete Kraft bei Kreisbewegung.',units:'N',hint:'Keine zusätzliche Kraftart – es ist die resultierende radiale Kraft.',vars:[['Fᶻ','Zentripetalkraft','N'],['m','Masse','kg'],['v','Bahngeschwindigkeit','m/s'],['r','Radius','m']],rearr:['aᶻ = v²/r','v = √(Fᶻr/m)']},
  {name:'Gravitationsgesetz',formula:'F = Gm₁m₂/r²',topic:'Gravitation',meaning:'Anziehung zweier Punktmassen.',units:'N',hint:'Für kugelsymmetrische Körper kann die Masse im Mittelpunkt gedacht werden.',vars:[['G','Gravitationskonstante','N·m²/kg²'],['m₁,m₂','Massen','kg'],['r','Abstand','m']],rearr:['g = GM/r²','vₒ = √(GM/r)'],sim:'projectile'},
  {name:'Ohmsches Gesetz',formula:'U = R · I',topic:'Elektrizität',meaning:'Zusammenhang von Spannung, Widerstand und Stromstärke.',units:'V = Ω · A',hint:'Gilt für ohmsche Bauteile im linearen Bereich.',vars:[['U','Spannung','V'],['R','Widerstand','Ω'],['I','Stromstärke','A']],rearr:['I = U/R','R = U/I'],trainer:'electric'},
  {name:'Elektrische Leistung',formula:'P = U · I',topic:'Elektrizität',meaning:'Umgesetzte elektrische Energie pro Zeit.',units:'W',hint:'Mit U=RI folgt P=I²R=U²/R.',vars:[['P','Leistung','W'],['U','Spannung','V'],['I','Stromstärke','A']],rearr:['P = I²R','P = U²/R']},
  {name:'Coulomb-Kraft',formula:'F = (1/4πε₀) · q₁q₂/r²',topic:'Elektrizität',meaning:'Elektrostatische Kraft zwischen Punktladungen.',units:'N',hint:'Das Vorzeichen der Ladungen bestimmt Anziehung oder Abstoßung.',vars:[['q₁,q₂','Ladungen','C'],['r','Abstand','m'],['ε₀','elektrische Feldkonstante','F/m']],rearr:['E = F/q','E = (1/4πε₀)·q/r²']},
  {name:'Lorentzkraft',formula:'F = q(E + v × B)',topic:'Elektromagnetismus',meaning:'Kraft auf eine Ladung in elektrischen und magnetischen Feldern.',units:'N',hint:'Der magnetische Anteil steht senkrecht auf v und B.',vars:[['q','Ladung','C'],['E','elektrisches Feld','V/m'],['v','Geschwindigkeit','m/s'],['B','magnetische Flussdichte','T']],rearr:['F_B = qvB sinθ']},
  {name:'Faradaysches Induktionsgesetz',formula:'Uᵢ = −dΦ/dt',topic:'Elektromagnetismus',meaning:'Änderung des magnetischen Flusses erzeugt eine Induktionsspannung.',units:'V',hint:'Das Minuszeichen ist die Lenzsche Regel.',vars:[['Uᵢ','Induktionsspannung','V'],['Φ','magnetischer Fluss','Wb'],['t','Zeit','s']],rearr:['Φ = ∫B·dA']},
  {name:'Wellenbeziehung',formula:'v = λ · f',topic:'Wellen & Optik',meaning:'Zusammenhang von Ausbreitungsgeschwindigkeit, Wellenlänge und Frequenz.',units:'m/s',hint:'In einem Medium hängt v von dessen Eigenschaften ab.',vars:[['v','Phasengeschwindigkeit','m/s'],['λ','Wellenlänge','m'],['f','Frequenz','Hz']],rearr:['λ = v/f','f = v/λ']},
  {name:'Linsengleichung',formula:'1/f = 1/g + 1/b',topic:'Wellen & Optik',meaning:'Dünne Linse: Brennweite, Gegenstandsweite und Bildweite.',units:'1/m',hint:'Vorzeichenkonvention der verwendeten Darstellung beachten.',vars:[['f','Brennweite','m'],['g','Gegenstandsweite','m'],['b','Bildweite','m']],rearr:['b = fg/(g−f)','V = B/G = b/g']},
  {name:'Ideales Gasgesetz',formula:'pV = nRT',topic:'Thermodynamik',meaning:'Zustandsgleichung des idealen Gases.',units:'J',hint:'T immer in Kelvin einsetzen.',vars:[['p','Druck','Pa'],['V','Volumen','m³'],['n','Stoffmenge','mol'],['R','Gaskonstante','J/(mol·K)'],['T','Temperatur','K']],rearr:['T = pV/(nR)','p = nRT/V']},
  {name:'Photonenenergie',formula:'E = h · f = hc/λ',topic:'Quantenphysik',meaning:'Energie eines Photons.',units:'J',hint:'Kürzere Wellenlänge bedeutet höhere Energie.',vars:[['E','Photonenenergie','J'],['h','Planck-Konstante','J·s'],['f','Frequenz','Hz'],['λ','Wellenlänge','m']],rearr:['f = E/h','λ = hc/E']},
  {name:'de-Broglie-Wellenlänge',formula:'λ = h/p',topic:'Quantenphysik',meaning:'Materiewellen-Wellenlänge eines Teilchens.',units:'m',hint:'Für nichtrelativistische Teilchen ist p≈mv.',vars:[['λ','Wellenlänge','m'],['h','Planck-Konstante','J·s'],['p','Impuls','kg·m/s']],rearr:['p = h/λ']},
  {name:'Lorentzfaktor',formula:'γ = 1/√(1−v²/c²)',topic:'Relativität',meaning:'Zentraler Faktor der speziellen Relativitätstheorie.',units:'dimensionslos',hint:'Für v≪c nähert sich γ der 1.',vars:[['γ','Lorentzfaktor','1'],['v','Geschwindigkeit','m/s'],['c','Lichtgeschwindigkeit','m/s']],rearr:['Δt = γΔτ','L = L₀/γ']},
  {name:'Stefan–Boltzmann',formula:'P = σAT⁴',topic:'Astrophysik',meaning:'Gesamtleistung eines idealen schwarzen Körpers.',units:'W',hint:'T in Kelvin. Für Sterne folgt L=4πR²σT⁴.',vars:[['P','Strahlungsleistung','W'],['σ','Stefan-Boltzmann-Konstante','W/(m²K⁴)'],['A','Fläche','m²'],['T','Temperatur','K']],rearr:['T = (P/σA)^(1/4)','L = 4πR²σT⁴'],sim:'blackbody'},
  {name:'Wiensches Verschiebungsgesetz',formula:'λₘₐₓT = b',topic:'Astrophysik',meaning:'Peak-Wellenlänge eines schwarzen Körpers.',units:'m·K',hint:'Heißere Körper haben ihr Maximum bei kürzeren Wellenlängen.',vars:[['λₘₐₓ','Peak-Wellenlänge','m'],['T','Temperatur','K'],['b','Wien-Konstante','m·K']],rearr:['λₘₐₓ = b/T','T = b/λₘₐₓ'],sim:'blackbody'},
  {name:'Hubble-Lemaître-Gesetz',formula:'v = H₀d',topic:'Astrophysik',meaning:'Näherungsweise Rezessionsgeschwindigkeit entfernter Galaxien.',units:'km/s',hint:'Kosmologische Interpretation; lokal dominieren gebundene Systeme.',vars:[['v','Rezessionsgeschwindigkeit','km/s'],['H₀','Hubble-Konstante','km/s/Mpc'],['d','Entfernung','Mpc']],rearr:['d = v/H₀']}
];

const missions = [
  ['Einheiten-Blitz','Nimm drei Formeln aus der Formelbibliothek und leite nur aus den SI-Einheiten her, welche Einheit die linke Seite haben muss.'],
  ['Graph-Denken','Zeichne aus dem Kopf einen v(t)-Graphen für konstante positive Beschleunigung und erkläre dir selbst die Fläche darunter.'],
  ['Grenzfall-Test','Öffne eine Formel und frage: Was passiert, wenn eine Variable gegen 0 oder sehr groß geht?'],
  ['Mechanik-Mini','Löse genau eine Trainer-Aufgabe ohne Hinweis. Danach erst kontrollieren.'],
  ['Astro-Minute','Öffne die Schwarzkörper-Simulation und vergleiche 3.000 K, 5.772 K und 10.000 K. Beobachte λmax.'],
  ['Fehlerrechnung','Nimm zwei Messwerte mit Unsicherheit und teste im Labor den Unsicherheits-Rechner.'],
  ['Formel-Verknüpfung','Finde zwei Formeln, die dieselbe Variable enthalten, und kombiniere sie algebraisch.']
];

function openDB(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,DB_VERSION);
    r.onupgradeneeded=()=>{
      const d=r.result;
      if(!d.objectStoreNames.contains('documents')) d.createObjectStore('documents',{keyPath:'id',autoIncrement:true});
      if(!d.objectStoreNames.contains('cards')) d.createObjectStore('cards',{keyPath:'id',autoIncrement:true});
      if(!d.objectStoreNames.contains('tasks')) d.createObjectStore('tasks',{keyPath:'id',autoIncrement:true});
    };
    r.onsuccess=()=>{db=r.result;resolve(db)};
    r.onerror=()=>reject(r.error);
  });
}
function getAll(store){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readonly').objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function addOne(store,value){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).add(value);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function putOne(store,value){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).put(value);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function deleteOne(store,id){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
function clearStore(store){return new Promise((resolve,reject)=>{const r=db.transaction(store,'readwrite').objectStore(store).clear();r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}

async function refresh(){
  documents=(await getAll('documents')).sort((a,b)=>(b.importedAt||0)-(a.importedAt||0));
  cards=(await getAll('cards')).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  tasks=(await getAll('tasks')).sort((a,b)=>String(a.due||'9999').localeCompare(String(b.due||'9999')) || (b.createdAt||0)-(a.createdAt||0));
  renderAll();
}
function showNotice(text){const n=$('#notice');n.textContent=text;n.classList.remove('hidden');clearTimeout(showNotice.t);showNotice.t=setTimeout(()=>n.classList.add('hidden'),4200)}
function humanSize(bytes=0){return bytes<1024?`${bytes} B`:bytes<1048576?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1048576).toFixed(1)} MB`}
function localDate(iso){if(!iso)return'ohne Termin';const d=new Date(`${iso}T12:00:00`);return d.toLocaleDateString('de-DE',{day:'2-digit',month:'short'})}

function go(tab){
  $$('.tab').forEach(e=>e.classList.remove('active'));
  $(`#tab-${tab}`)?.classList.add('active');
  $$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  $('#pageTitle').textContent=titles[tab]||'Physics OS';
  window.scrollTo({top:0,behavior:'smooth'});
  if(tab==='lab')renderLab();
  if(tab==='sim'){requestAnimationFrame(()=>{drawProjectile();drawBlackbody()})}
  if(tab==='trainer'&&!currentProblem)generateProblem();
}
$$('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.tab));
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

function classify(file,text=''){
  const h=`${file.name} ${text.slice(0,3500)}`.toLowerCase();
  if(/goodnotes|notebook|mitschrift/.test(h))return'Goodnotes';
  if(/praktikum|versuch|messwert|protokoll|labor/.test(h))return'Praktikum';
  if(/übung|uebung|exercise|blatt|aufgabe/.test(h))return'Übung';
  if(/vorlesung|lecture|skript|folien/.test(h))return'Vorlesung';
  if(/\.csv$|\.tsv$|messdaten|dataset/.test(h))return'Daten';
  return'Sonstiges';
}
function detectConcepts(text=''){
  const h=text.toLowerCase();
  const scored=[];
  for(const [name,terms] of conceptLexicon){
    let score=0;
    for(const term of terms){const matches=h.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'));score+=matches?.length||0}
    if(score)scored.push({name,score});
  }
  return scored.sort((a,b)=>b.score-a.score).slice(0,10);
}
function analyzeText(text='',name=''){
  const combined=`${name}\n${text}`;
  const concepts=detectConcepts(combined);
  const words=text.trim()?text.trim().split(/\s+/).length:0;
  const numbers=(text.match(/[-+]?\d+(?:[.,]\d+)?/g)||[]).length;
  const equations=(text.match(/[A-Za-zα-ωΑ-Ω][^\n]{0,18}=[^\n]{1,35}/g)||[]).slice(0,6);
  return{concepts,words,numbers,equations};
}
async function extractText(file){
  const ext=file.name.split('.').pop()?.toLowerCase();
  if(file.type.startsWith('text/')||['txt','md','csv','tsv'].includes(ext))return await file.text();
  return'';
}
async function importFiles(files){
  if(!files.length)return;
  showNotice('Smart Import läuft lokal …');
  let i=0;
  for(const file of files){
    const text=await extractText(file);
    const analysis=analyzeText(text,file.name);
    await addOne('documents',{name:file.name,mime:file.type||'application/octet-stream',size:file.size,kind:classify(file,text),importedAt:Date.now()+i,text:text.slice(0,2000000),analysis,blob:file});
    i++;
  }
  touch();await refresh();
  selectedDocumentId=documents[0]?.id||null;renderFiles();renderFileAnalysis();
  showNotice(`${files.length} Datei(en) importiert und vorsortiert.`);
}

const drop=$('#dropzone'),input=$('#fileInput');
$('#chooseFiles').onclick=e=>{e.stopPropagation();input.click()};drop.onclick=()=>input.click();input.onchange=()=>importFiles([...input.files]);
drop.ondragover=e=>{e.preventDefault();drop.classList.add('dragging')};drop.ondragleave=()=>drop.classList.remove('dragging');drop.ondrop=e=>{e.preventDefault();drop.classList.remove('dragging');importFiles([...e.dataTransfer.files])};
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function openDocument(doc){if(!doc?.blob)return;const u=URL.createObjectURL(doc.blob),a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.click();setTimeout(()=>URL.revokeObjectURL(u),15000)}

function documentAnalysis(d){return d?.analysis || analyzeText(d?.text||'',d?.name||'')}
function renderFiles(){
  const q=($('#fileSearch')?.value||'').toLowerCase();
  const filtered=documents.filter(d=>{const a=documentAnalysis(d);return `${d.name} ${d.kind} ${a.concepts.map(x=>x.name).join(' ')}`.toLowerCase().includes(q)});
  $('#fileCount').textContent=`${documents.length} Elemente`;
  $('#fileTable').innerHTML=filtered.length?filtered.map(d=>`<div class="file-row ${selectedDocumentId===d.id?'selected':''}" data-select-doc="${d.id}"><div class="file-icon">${/\.csv$|\.tsv$/i.test(d.name)?'⌁':d.mime==='application/pdf'?'PDF':'▤'}</div><div class="file-main"><b>${esc(d.name)}</b><small>${humanSize(d.size)} · ${esc(d.kind)} · ${new Date(d.importedAt).toLocaleDateString('de-DE')}</small></div><span class="tag">${esc(documentAnalysis(d).concepts[0]?.name||d.kind)}</span><button class="icon-btn open-doc" data-id="${d.id}" title="Öffnen">↗</button><button class="icon-btn delete-doc" data-id="${d.id}" title="Löschen">×</button></div>`).join(''):'<div class="empty">Keine passenden Dateien.</div>';
  $$('[data-select-doc]').forEach(r=>r.onclick=()=>{selectedDocumentId=Number(r.dataset.selectDoc);renderFiles();renderFileAnalysis()});
  $$('.delete-doc').forEach(b=>b.onclick=async e=>{e.stopPropagation();await deleteOne('documents',Number(b.dataset.id));if(selectedDocumentId===Number(b.dataset.id))selectedDocumentId=null;touch();await refresh()});
  $$('.open-doc').forEach(b=>b.onclick=e=>{e.stopPropagation();openDocument(documents.find(d=>d.id===Number(b.dataset.id)))})
}
$('#fileSearch').oninput=renderFiles;
function renderFileAnalysis(){
  const box=$('#fileAnalysis');const d=documents.find(x=>x.id===selectedDocumentId);
  if(!d){box.className='analysis-empty';box.innerHTML='Wähle links eine Datei aus. Bei TXT/Markdown/CSV kann Physics OS Begriffe und Struktur direkt lokal analysieren.';return}
  box.className='';const a=documentAnalysis(d);const readable=!!d.text;
  box.innerHTML=`<div class="analysis-section"><span class="eyebrow">${esc(d.kind.toUpperCase())}</span><h3>${esc(d.name)}</h3><div class="analysis-meta"><span class="tag">${humanSize(d.size)}</span><span class="tag">${readable?`${a.words} Wörter`:'Binär/PDF'}</span><span class="tag">${a.numbers||0} Zahlen erkannt</span></div></div>
  <div class="analysis-section"><h4>Erkannte Physik-Themen</h4><div class="analysis-keywords">${a.concepts.length?a.concepts.map(c=>`<span>${esc(c.name)} · ${c.score}</span>`).join(''):'<span>noch keine eindeutigen Begriffe</span>'}</div></div>
  ${a.equations?.length?`<div class="analysis-section"><h4>Mögliche Gleichungen im Text</h4><div class="rearrange-list">${a.equations.map(x=>`<code>${esc(x.slice(0,80))}</code>`).join('')}</div></div>`:''}
  <div class="analysis-section"><h4>Was Physics OS damit machen kann</h4><p class="muted">${readable?'Text lokal analysieren, Themen für den Concept Radar sammeln und Messdaten bei CSV/TSV im Labor auswerten.':'Die Datei sicher lokal verwalten und öffnen. PDF-Texterkennung ist in dieser lokalen Version noch nicht eingebaut – das Original bleibt unverändert.'}</p>${/\.csv$|\.tsv$/i.test(d.name)?'<button class="primary" id="analyzeInLab">Im Messdaten-Lab öffnen</button>':''}</div>
  ${readable?`<div class="analysis-section"><h4>Textvorschau</h4><div class="analysis-preview">${esc((d.text||'').slice(0,2500))}</div></div>`:''}`;
  $('#analyzeInLab')?.addEventListener('click',()=>go('lab'));
}

function aggregateConcepts(){
  const map=new Map();
  documents.forEach(d=>documentAnalysis(d).concepts.forEach(c=>map.set(c.name,(map.get(c.name)||0)+c.score)));
  return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12);
}
function streakCount(){
  const dates=[...new Set(getStats().missionDates||[])].sort().reverse();if(!dates.length)return 0;
  let count=0;let cursor=new Date();cursor.setHours(12,0,0,0);
  for(let i=0;i<dates.length;i++){
    const key=cursor.toISOString().slice(0,10);
    if(dates.includes(key)){count++;cursor.setDate(cursor.getDate()-1)}
    else if(i===0){cursor.setDate(cursor.getDate()-1);const y=cursor.toISOString().slice(0,10);if(dates.includes(y)){count++;cursor.setDate(cursor.getDate()-1)}else break}
    else break;
  }
  return count;
}
function nextOpenTask(){
  const open=tasks.filter(t=>!t.done);return open[0]||null;
}
function renderDashboard(){
  const good=documents.filter(d=>d.kind==='Goodnotes').length,lab=documents.filter(d=>['Praktikum','Daten'].includes(d.kind)||/\.csv$|\.tsv$/i.test(d.name)).length;
  $('#statFiles').textContent=documents.length;$('#statGoodnotes').textContent=good;$('#statLab').textContent=lab;$('#statCards').textContent=cards.length;$('#statTasks').textContent=tasks.filter(t=>!t.done).length;$('#statStreak').textContent=streakCount();
  $('#todayDate').textContent=new Date().toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'short'});
  const next=nextOpenTask();$('#nextFocus').innerHTML=next?`<span class="eyebrow">${esc(next.module)}</span><h4>${esc(next.title)}</h4><div class="focus-meta"><span class="priority ${esc(next.priority)}">${esc(next.priority)}</span><span class="tag">${esc(next.effort)}</span><span class="tag">${localDate(next.due)}</span></div>`:`<h4>Noch nichts drängt.</h4><p class="muted">Lege im Studium-Bereich deine erste Aufgabe an – dann zieht Physics OS sie hier automatisch nach vorn.</p>`;
  const concepts=aggregateConcepts();$('#conceptCount').textContent=`${concepts.length} Themen`;$('#conceptRadar').innerHTML=concepts.length?concepts.map(([n,s],i)=>`<span class="concept-chip ${i<3?'hot':''}">${esc(n)} · ${s}</span>`).join(''):'<div class="empty">Importiere Dateien – dann entsteht hier dein Wissensradar.</div>';
  $('#recentList').innerHTML=documents.length?documents.slice(0,5).map(d=>`<div><i class="file-dot"></i><div><b>${esc(d.name)}</b><small>${esc(d.kind)} · ${humanSize(d.size)}</small></div></div>`).join(''):'<div class="empty">Noch keine Dateien. Dein erster Import landet hier.</div>';
  const day=Math.floor(Date.now()/86400000)%missions.length;const [title,text]=missions[day];$('#dailyMission').innerHTML=`<h4>${esc(title)}</h4><p>${esc(text)}</p>`;
  const today=new Date().toISOString().slice(0,10),done=(getStats().missionDates||[]).includes(today);$('#missionDone').textContent=done?'Heute erledigt ✓':'Mission erledigt';$('#missionDone').classList.toggle('done',done);
}
$('#missionDone').onclick=()=>{const stats=getStats(),today=new Date().toISOString().slice(0,10);if(!(stats.missionDates||[]).includes(today)){stats.missionDates=[...(stats.missionDates||[]),today];saveStats(stats);showNotice('Focus-Streak aktualisiert ⚡')}renderDashboard()};

function renderStudy(){
  const modules=loadModules();$('#taskModule').innerHTML=modules.map(m=>`<option>${esc(m)}</option>`).join('');
  const total=tasks.length,done=tasks.filter(t=>t.done).length;$('#moduleProgressText').textContent=total?`${Math.round(done/total*100)} %`:'0 %';
  $('#moduleList').innerHTML=modules.map(m=>{const mt=tasks.filter(t=>t.module===m),md=mt.filter(t=>t.done).length,p=mt.length?Math.round(md/mt.length*100):0;return`<div class="module-item"><i class="module-color"></i><div><div class="module-name">${esc(m)}</div><div class="module-progress"><i style="width:${p}%"></i></div></div><span class="tag">${md}/${mt.length}</span></div>`}).join('');
  let filtered=tasks;if(taskFilter==='open')filtered=tasks.filter(t=>!t.done);if(taskFilter==='done')filtered=tasks.filter(t=>t.done);
  $('#taskList').innerHTML=filtered.length?filtered.map(t=>`<div class="task-item ${t.done?'done':''}"><button class="task-check" data-task-toggle="${t.id}">${t.done?'✓':''}</button><div><div class="task-title">${esc(t.title)}</div><div class="task-sub">${esc(t.module)} · ${localDate(t.due)} · ${esc(t.effort||'')}</div></div><span class="priority ${esc(t.priority)}">${esc(t.priority)}</span><button class="icon-btn" data-task-delete="${t.id}">×</button></div>`).join(''):'<div class="empty">Keine Aufgaben in dieser Ansicht.</div>';
  $$('[data-task-toggle]').forEach(b=>b.onclick=async()=>{const t=tasks.find(x=>x.id===Number(b.dataset.taskToggle));t.done=!t.done;t.doneAt=t.done?Date.now():null;await putOne('tasks',t);touch();await refresh()});
  $$('[data-task-delete]').forEach(b=>b.onclick=async()=>{await deleteOne('tasks',Number(b.dataset.taskDelete));touch();await refresh()});
}
$('#saveTask').onclick=async()=>{const title=$('#taskTitle').value.trim();if(!title)return showNotice('Gib der Aufgabe einen Titel.');await addOne('tasks',{title,module:$('#taskModule').value,due:$('#taskDue').value,priority:$('#taskPriority').value,effort:$('#taskEffort').value,done:false,createdAt:Date.now()});$('#taskTitle').value='';touch();await refresh();showNotice('Aufgabe gespeichert.')};
$('#addTaskQuick').onclick=()=>$('#taskTitle').focus();
$$('[data-task-filter]').forEach(b=>b.onclick=()=>{taskFilter=b.dataset.taskFilter;$$('[data-task-filter]').forEach(x=>x.classList.toggle('active',x===b));renderStudy()});

function renderFormulas(q=$('#formulaSearch')?.value||''){
  const x=q.toLowerCase(),topic=$('#formulaTopic')?.value||'';
  const filtered=formulas.filter(f=>(!topic||f.topic===topic)&&`${f.name} ${f.topic} ${f.meaning} ${f.formula} ${f.vars.map(v=>v.join(' ')).join(' ')}`.toLowerCase().includes(x));
  $('#formulaGrid').innerHTML=filtered.map((f,i)=>`<article class="panel formula-card"><span class="tag">${esc(f.topic)}</span><h3>${esc(f.name)}</h3><div class="formula">${esc(f.formula)}</div><p>${esc(f.meaning)}</p><dl><div><dt>Einheit</dt><dd>${esc(f.units)}</dd></div><div><dt>Achtung</dt><dd>${esc(f.hint)}</dd></div></dl><div class="formula-actions"><button class="text-btn" data-formula="${formulas.indexOf(f)}">öffnen →</button></div></article>`).join('')||'<div class="empty">Keine Formel gefunden.</div>';
  $$('[data-formula]').forEach(b=>b.onclick=()=>openFormula(Number(b.dataset.formula)));
}
function setupFormulaTopics(){const topics=[...new Set(formulas.map(f=>f.topic))];$('#formulaTopic').innerHTML='<option value="">Alle Themen</option>'+topics.map(t=>`<option>${esc(t)}</option>`).join('')}
$('#formulaSearch').oninput=()=>renderFormulas();$('#formulaTopic').onchange=()=>renderFormulas();
function openFormula(i){
  const f=formulas[i];if(!f)return;
  $('#formulaDetail').innerHTML=`<span class="eyebrow">${esc(f.topic.toUpperCase())}</span><h2>${esc(f.name)}</h2><div class="formula-big" style="display:inline-block;margin:8px 0 10px">${esc(f.formula)}</div><p class="muted">${esc(f.meaning)}</p><h3>Variablen</h3><div class="formula-variable-grid">${f.vars.map(v=>`<div class="variable-card"><strong>${esc(v[0])}</strong><span>${esc(v[1])} · ${esc(v[2])}</span></div>`).join('')}</div><h3>Umstellungen & Verwandtes</h3><div class="rearrange-list">${f.rearr.map(r=>`<code>${esc(r)}</code>`).join('')}</div><div class="analysis-section" style="margin-top:16px"><h4>Worauf achten?</h4><p class="muted">${esc(f.hint)}</p></div><div class="button-row">${f.trainer?`<button class="primary" data-formula-trainer="${f.trainer}">Passende Aufgabe</button>`:''}${f.sim?`<button class="secondary" data-formula-sim="${f.sim}">Simulation öffnen</button>`:''}</div>`;
  $('#formulaModal').classList.remove('hidden');
  $('[data-formula-trainer]')?.addEventListener('click',e=>{$('#trainerTopic').value=e.currentTarget.dataset.formulaTrainer;$('#formulaModal').classList.add('hidden');go('trainer');generateProblem()});
  $('[data-formula-sim]')?.addEventListener('click',()=>{$('#formulaModal').classList.add('hidden');go('sim')});
}
$('[data-close-modal]').onclick=()=>$('#formulaModal').classList.add('hidden');

function generateProblem(){
  const topic=$('#trainerTopic').value;hintIndex=0;$('#hintBox').classList.add('hidden');$('#solutionBox').classList.add('hidden');$('#problemAnswer').value='';$('#problemStatus').textContent='bereit';
  if(topic==='kinematics'){
    const v0=rnd(2,18),a=rnd(1,6),t=rnd(2,8);const ans=v0*t+.5*a*t*t;
    currentProblem={topic,title:'Gleichmäßig beschleunigte Bewegung',question:`Ein Körper startet mit v₀ = ${v0} m/s und beschleunigt ${t} s lang konstant mit a = ${a} m/s². Welche Strecke legt er in dieser Zeit zurück?`,data:[`v₀ = ${v0} m/s`,`a = ${a} m/s²`,`t = ${t} s`],answer:ans,unit:'m',hints:['Gesucht ist der Weg bei konstanter Beschleunigung.','Nutze Δs = v₀t + ½at².','Setze erst die lineare und dann die quadratische Komponente getrennt ein.'],solution:`Δs = ${v0}·${t} + ½·${a}·${t}² = ${fmt(ans,4)} m`};
  }else if(topic==='newton'){
    const m=rnd(2,25),a=rnd(1,9,0.5),ans=m*a;
    currentProblem={topic,title:'Newton II',question:`Auf einen Körper der Masse ${m} kg wirkt eine konstante resultierende Beschleunigung von ${fmt(a,1)} m/s². Wie groß ist die resultierende Kraft?`,data:[`m = ${m} kg`,`a = ${fmt(a,1)} m/s²`],answer:ans,unit:'N',hints:['Welche Grundgleichung verbindet Kraft, Masse und Beschleunigung?','Newton II: F = m·a.','kg·m/s² ist genau ein Newton.'],solution:`F = ${m}·${fmt(a,1)} = ${fmt(ans,4)} N`};
  }else if(topic==='energy'){
    const m=rnd(1,12),v=rnd(2,16),ans=.5*m*v*v;
    currentProblem={topic,title:'Kinetische Energie',question:`Ein Körper mit ${m} kg bewegt sich mit ${v} m/s. Wie groß ist seine kinetische Energie?`,data:[`m = ${m} kg`,`v = ${v} m/s`],answer:ans,unit:'J',hints:['Die Geschwindigkeit geht quadratisch ein.','Eₖ = ½mv².','Achte darauf, v zuerst zu quadrieren.'],solution:`Eₖ = ½·${m}·${v}² = ${fmt(ans,4)} J`};
  }else{
    const U=rnd(6,48),R=rnd(2,24),ans=U/R;
    currentProblem={topic,title:'Ohmsches Gesetz',question:`An einem ohmschen Widerstand von ${R} Ω liegen ${U} V an. Welche Stromstärke fließt?`,data:[`U = ${U} V`,`R = ${R} Ω`],answer:ans,unit:'A',hints:['Stelle U = R·I nach I um.','I = U/R.','Volt geteilt durch Ohm ergibt Ampere.'],solution:`I = ${U}/${R} = ${fmt(ans,4)} A`};
  }
  renderProblem();
}
function renderProblem(){const p=currentProblem;if(!p)return;$('#problemCard').innerHTML=`<span class="eyebrow">${esc(p.title.toUpperCase())}</span><h4>${esc(p.question)}</h4><div class="problem-data">${p.data.map(x=>`<span class="data-pill">${esc(x)}</span>`).join('')}</div>`;$('#problemUnit').textContent=p.unit;$('#trainerSolved').textContent=getStats().trainerSolved||0}
$('#newProblem').onclick=generateProblem;$('#trainerTopic').onchange=generateProblem;
$('#problemHint').onclick=()=>{if(!currentProblem)return;const box=$('#hintBox');box.textContent=currentProblem.hints[Math.min(hintIndex,currentProblem.hints.length-1)];box.classList.remove('hidden');hintIndex++};
$('#checkProblem').onclick=()=>{if(!currentProblem)return;const value=Number($('#problemAnswer').value.replace(',','.'));if(!Number.isFinite(value))return showNotice('Trag erst einen Zahlenwert ein.');const tol=Math.max(Math.abs(currentProblem.answer)*.02,.02),ok=Math.abs(value-currentProblem.answer)<=tol;const box=$('#solutionBox');box.classList.remove('hidden','error');if(ok){box.innerHTML=`<b>✓ Richtig.</b><br>${esc(currentProblem.solution)}<br><small>Toleranz ±2 %.</small>`;$('#problemStatus').textContent='gelöst';const stats=getStats();stats.trainerSolved=(stats.trainerSolved||0)+1;saveStats(stats);$('#trainerSolved').textContent=stats.trainerSolved}else{box.classList.add('error');box.innerHTML=`<b>Noch nicht.</b><br>Dein Wert liegt außerhalb der ±2-%-Toleranz. Hol dir einen Hinweis oder prüfe Einheiten und Ansatz.`;$('#problemStatus').textContent='prüfen'}};

function parseDelimited(text,delimiter){
  const lines=text.trim().split(/\r?\n/).filter(Boolean);if(!lines.length)return null;
  delimiter=delimiter||(lines[0].includes('\t')?'\t':lines[0].includes(';')?';':',');
  const splitLine=l=>{const out=[];let cur='',quoted=false;for(let i=0;i<l.length;i++){const ch=l[i];if(ch==='"'){quoted=!quoted;continue}if(ch===delimiter&&!quoted){out.push(cur.trim());cur=''}else cur+=ch}out.push(cur.trim());return out};
  const rows=lines.map(splitLine);const num=v=>Number(String(v??'').replace(',','.'));const numeric=row=>row.every(v=>Number.isFinite(num(v)));const firstNum=numeric(rows[0]);const headers=firstNum?rows[0].map((_,i)=>`Spalte ${i+1}`):rows[0],data=firstNum?rows:rows.slice(1);const columns=headers.map((_,i)=>data.map(r=>num(r[i])).filter(Number.isFinite));return{headers,columns,rows:data}
}
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN;
function sd(a){if(a.length<2)return NaN;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1))}
function regression(x,y){
  const n=Math.min(x.length,y.length);if(n<2)return null;x=x.slice(0,n);y=y.slice(0,n);const mx=mean(x),my=mean(y),sxx=x.reduce((s,v)=>s+(v-mx)**2,0);if(!sxx)return null;const slope=x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0)/sxx,intercept=my-slope*mx,p=x.map(v=>slope*v+intercept),sse=y.reduce((s,v,i)=>s+(v-p[i])**2,0),sst=y.reduce((s,v)=>s+(v-my)**2,0),r2=sst?1-sse/sst:1;const s=Math.sqrt(sse/Math.max(1,n-2));return{slope,intercept,r2,n,sSlope:s/Math.sqrt(sxx),sIntercept:s*Math.sqrt(1/n+mx*mx/sxx),x,y,p}
}
function renderLab(){
  const data=documents.filter(d=>/\.csv$|\.tsv$/i.test(d.name));const sel=$('#labSelect');sel.innerHTML=data.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('');sel.classList.toggle('hidden',!data.length);$('#labEmpty').classList.toggle('hidden',!!data.length);if(!data.length){$('#labResults').innerHTML='';return}
  if(!data.some(d=>d.id===Number(sel.value)))sel.value=String(data[0].id);const d=data.find(x=>x.id===Number(sel.value))||data[0],table=parseDelimited(d.text||'',d.name.toLowerCase().endsWith('.tsv')?'\t':undefined);if(!table){$('#labResults').innerHTML='<article class="panel padded">Keine numerischen Daten erkannt.</article>';return}
  const summaries=table.headers.map((h,i)=>({h,n:table.columns[i].length,m:mean(table.columns[i]),s:sd(table.columns[i])}));const fit=table.columns.length>=2?regression(table.columns[0],table.columns[1]):null;
  $('#labResults').innerHTML=`<div class="lab-summary">${summaries.slice(0,4).map(s=>`<article class="panel stat"><span>Σ</span><div><strong>${Number.isFinite(s.m)?fmt(s.m,5):'—'}</strong><small>${esc(s.h)} · n=${s.n} · σ=${Number.isFinite(s.s)?fmt(s.s,4):'—'}</small></div></article>`).join('')}</div>${fit?`<article class="panel fit-card"><span class="eyebrow">LINEARE REGRESSION · SPALTE 1 → 2</span><div class="fit-equation">y = (${fmt(fit.slope,6)} ± ${fmt(fit.sSlope,3)})x ${fit.intercept>=0?'+':'−'} (${fmt(Math.abs(fit.intercept),6)} ± ${fmt(fit.sIntercept,3)})</div><div class="fit-meta"><span>R² = <b>${fit.r2.toFixed(6)}</b></span><span>n = <b>${fit.n}</b></span><span>σₘ = <b>${fmt(fit.sSlope,4)}</b></span></div></article><article class="panel plot-wrap"><canvas id="labPlot" width="1200" height="520"></canvas></article>`:''}`;
  if(fit)requestAnimationFrame(()=>drawLabPlot(fit,table.headers[0],table.headers[1]));
}
$('#labSelect').onchange=renderLab;
function drawLabPlot(fit,xLabel='x',yLabel='y'){
  const c=$('#labPlot');if(!c)return;const ctx=c.getContext('2d'),W=c.width,H=c.height,pad=70;ctx.clearRect(0,0,W,H);const xs=fit.x,ys=fit.y,minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const dx=(maxX-minX)||1,dy=(maxY-minY)||1;const sx=x=>pad+(x-(minX-.08*dx))/(1.16*dx)*(W-2*pad),sy=y=>H-pad-(y-(minY-.12*dy))/(1.24*dy)*(H-2*pad);
  ctx.strokeStyle='#1c2b47';ctx.lineWidth=1;for(let i=0;i<=5;i++){const x=pad+i*(W-2*pad)/5,y=pad+i*(H-2*pad)/5;ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,H-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke()}
  ctx.strokeStyle='#778fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx(minX-.08*dx),sy(fit.slope*(minX-.08*dx)+fit.intercept));ctx.lineTo(sx(maxX+.08*dx),sy(fit.slope*(maxX+.08*dx)+fit.intercept));ctx.stroke();
  ctx.fillStyle='#63e3d1';xs.forEach((x,i)=>{ctx.beginPath();ctx.arc(sx(x),sy(ys[i]),5,0,Math.PI*2);ctx.fill()});ctx.fillStyle='#8796b2';ctx.font='20px system-ui';ctx.fillText(xLabel,W/2-20,H-20);ctx.save();ctx.translate(20,H/2+30);ctx.rotate(-Math.PI/2);ctx.fillText(yLabel,0,0);ctx.restore();
}
$('#calcUncertainty').onclick=()=>{const x=Number($('#uncX').value),dx=Number($('#uncDX').value),a=Number($('#uncA').value),y=Number($('#uncY').value),dy=Number($('#uncDY').value),b=Number($('#uncB').value);if(![x,dx,a,y,dy,b].every(Number.isFinite)||x===0||y===0)return showNotice('Bitte gültige Werte ungleich 0 für x und y.');const z=(x**a)*(y**b),rel=Math.sqrt((a*dx/x)**2+(b*dy/y)**2),dz=Math.abs(z)*rel;$('#uncResult').innerHTML=`z = <b>${fmt(z,6)} ± ${fmt(dz,4)}</b><br>relative Unsicherheit: <b>${fmt(rel*100,3)} %</b><br><span class="muted">Δz/|z| = √[(a·Δx/x)² + (b·Δy/y)²]</span>`};

function drawProjectile(){
  const c=$('#projectileCanvas');if(!c)return;const ctx=c.getContext('2d'),v0=Number($('#v0Range').value),angle=Number($('#angleRange').value),g=Number($('#gRange').value),th=angle*Math.PI/180,T=2*v0*Math.sin(th)/g,R=v0*v0*Math.sin(2*th)/g,H=v0*v0*Math.sin(th)**2/(2*g);$('#v0Label').textContent=`${fmt(v0,0)} m/s`;$('#angleLabel').textContent=`${fmt(angle,0)}°`;$('#gLabel').textContent=`${fmt(g,2)} m/s²`;$('#projectileRangeTag').textContent=`Reichweite ${fmt(R,1)} m`;
  const W=c.width,HH=c.height,pad=52;ctx.clearRect(0,0,W,HH);ctx.fillStyle='#09111f';ctx.fillRect(0,0,W,HH);ctx.strokeStyle='#1b2943';ctx.lineWidth=1;for(let i=0;i<=8;i++){ctx.beginPath();ctx.moveTo(pad+i*(W-2*pad)/8,pad);ctx.lineTo(pad+i*(W-2*pad)/8,HH-pad);ctx.stroke()}for(let i=0;i<=4;i++){ctx.beginPath();ctx.moveTo(pad,pad+i*(HH-2*pad)/4);ctx.lineTo(W-pad,pad+i*(HH-2*pad)/4);ctx.stroke()}
  const xMax=Math.max(R*1.08,1),yMax=Math.max(H*1.25,1),sx=x=>pad+x/xMax*(W-2*pad),sy=y=>HH-pad-y/yMax*(HH-2*pad);ctx.strokeStyle='#7f9bff';ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<=160;i++){const t=T*i/160,x=v0*Math.cos(th)*t,y=v0*Math.sin(th)*t-.5*g*t*t;if(i===0)ctx.moveTo(sx(x),sy(Math.max(0,y)));else ctx.lineTo(sx(x),sy(Math.max(0,y)))}ctx.stroke();ctx.fillStyle='#61e6d1';ctx.beginPath();ctx.arc(sx(R),sy(0),7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8998b6';ctx.font='18px system-ui';ctx.fillText('x',W-30,HH-pad+5);ctx.fillText('y',pad-5,25);
  $('#projectileStats').innerHTML=`<div><b>${fmt(T,2)} s</b><span>Flugzeit</span></div><div><b>${fmt(H,2)} m</b><span>max. Höhe</span></div><div><b>${fmt(R,2)} m</b><span>Reichweite</span></div>`;
}
['v0Range','angleRange','gRange'].forEach(id=>$(`#${id}`).oninput=drawProjectile);
function planck(lambda,T){const h=6.62607015e-34,c=299792458,k=1.380649e-23;const l=lambda*1e-9;const expo=h*c/(l*k*T);return (2*h*c*c)/(l**5)/(Math.exp(Math.min(expo,700))-1)}
function drawBlackbody(){
  const c=$('#blackbodyCanvas');if(!c)return;const ctx=c.getContext('2d'),T=Number($('#tempRange').value),W=c.width,H=c.height,pad=52,minL=100,maxL=2500;$('#tempLabel').textContent=`${fmt(T,0)} K`;$('#tempTag').textContent=T>7500?'heißer Stern':T>5000?'sonnenähnlich':'kühler Stern';const vals=[];let maxB=0;for(let l=minL;l<=maxL;l+=8){const b=planck(l,T);vals.push([l,b]);if(b>maxB)maxB=b}ctx.clearRect(0,0,W,H);ctx.fillStyle='#09111f';ctx.fillRect(0,0,W,H);
  const sx=l=>pad+(l-minL)/(maxL-minL)*(W-2*pad),sy=b=>H-pad-b/maxB*(H-2*pad)*.9;const vis1=sx(380),vis2=sx(750);const grad=ctx.createLinearGradient(vis1,0,vis2,0);grad.addColorStop(0,'rgba(120,90,255,.14)');grad.addColorStop(.25,'rgba(80,150,255,.14)');grad.addColorStop(.5,'rgba(90,240,180,.14)');grad.addColorStop(.75,'rgba(255,210,80,.14)');grad.addColorStop(1,'rgba(255,90,80,.14)');ctx.fillStyle=grad;ctx.fillRect(vis1,pad,vis2-vis1,H-2*pad);ctx.strokeStyle='#1b2943';ctx.lineWidth=1;for(let i=0;i<=6;i++){const x=pad+i*(W-2*pad)/6;ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,H-pad);ctx.stroke()}
  ctx.strokeStyle='#8aa0ff';ctx.lineWidth=4;ctx.beginPath();vals.forEach(([l,b],i)=>i?ctx.lineTo(sx(l),sy(b)):ctx.moveTo(sx(l),sy(b)));ctx.stroke();const peak=2.897771955e6/T,flux=5.670374419e-8*T**4;ctx.strokeStyle='#61e6d1';ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(sx(clamp(peak,minL,maxL)),pad);ctx.lineTo(sx(clamp(peak,minL,maxL)),H-pad);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#8998b6';ctx.font='18px system-ui';ctx.fillText('λ (nm)',W-75,H-20);
  $('#blackbodyStats').innerHTML=`<div><b>${fmt(peak,0)} nm</b><span>λmax nach Wien</span></div><div><b>${Number(flux).toExponential(2)} W/m²</b><span>σT⁴</span></div><div><b>${peak<380?'UV':peak<=750?'sichtbar':'IR'}</b><span>Peak-Bereich</span></div>`;
}
$('#tempRange').oninput=drawBlackbody;

async function addCard(){const front=$('#cardFront').value.trim(),back=$('#cardBack').value.trim(),topic=$('#cardTopic').value.trim()||'Allgemein';if(!front||!back)return showNotice('Vorder- und Rückseite fehlen.');await addOne('cards',{front,back,topic,createdAt:Date.now(),dueAt:Date.now(),interval:0,ease:2.5,reps:0});$('#cardFront').value='';$('#cardBack').value='';touch();await refresh()}
$('#addCard').onclick=addCard;
function cardDue(c){return !c.dueAt||c.dueAt<=Date.now()}
function renderCards(){
  const due=cards.filter(cardDue);$('#cardCount').textContent=cards.length;$('#dueCards').textContent=`${due.length} fällig`;const mastery=cards.length?Math.round(cards.reduce((s,c)=>s+Math.min(5,c.reps||0),0)/(cards.length*5)*100):0;$('#reviewMastery').textContent=`${mastery}%`;$('.review-ring').style.setProperty('--mastery',`${mastery}%`);
  $('#cardList').innerHTML=cards.length?cards.map(c=>`<article><span class="tag">${esc(c.topic)}</span><b>${esc(c.front)}</b><p>${esc(c.back)}</p><div class="card-meta"><span class="due">${cardDue(c)?'jetzt fällig':`wieder ${new Date(c.dueAt).toLocaleDateString('de-DE')}`}</span><button class="text-btn delete-card" data-id="${c.id}">Löschen</button></div></article>`).join(''):'<div class="empty">Noch keine Lernkarten.</div>';
  $$('.delete-card').forEach(b=>b.onclick=async()=>{await deleteOne('cards',Number(b.dataset.id));touch();await refresh()})
}
$('#exportCards').onclick=()=>{if(!cards.length)return showNotice('Noch keine Lernkarten vorhanden.');const csv=cards.map(c=>`"${c.front.replaceAll('"','""')}","${c.back.replaceAll('"','""')}"`).join('\n');downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'physics-os-goodnotes-cards.csv')};
$('#startReview').onclick=()=>{reviewQueue=cards.filter(cardDue);reviewIndex=0;if(!reviewQueue.length)return showNotice('Gerade ist keine Karte fällig.');$('#reviewModal').classList.remove('hidden');renderReview()};
$('[data-close-review]').onclick=()=>$('#reviewModal').classList.add('hidden');
function renderReview(){const c=reviewQueue[reviewIndex];if(!c){$('#reviewContent').innerHTML='<div class="review-front"><b>Review geschafft ✓</b><p class="muted">Alle fälligen Karten sind einsortiert.</p></div>';return}$('#reviewContent').innerHTML=`<span class="eyebrow">KARTE ${reviewIndex+1} / ${reviewQueue.length} · ${esc(c.topic)}</span><div class="review-front">${esc(c.front)}</div><button id="revealCard" class="primary full">Antwort zeigen</button><div id="reviewAnswer" class="hidden"><div class="review-back">${esc(c.back)}</div><div class="review-ratings"><button class="rating" data-rate="again">Nochmal<small>~10 min</small></button><button class="rating" data-rate="hard">Schwer<small>kurz</small></button><button class="rating" data-rate="good">Gut<small>normal</small></button><button class="rating" data-rate="easy">Leicht<small>länger</small></button></div></div>`;$('#revealCard').onclick=()=>{$('#revealCard').classList.add('hidden');$('#reviewAnswer').classList.remove('hidden');$$('[data-rate]').forEach(b=>b.onclick=()=>rateCard(c,b.dataset.rate))}}
async function rateCard(c,rating){let interval=c.interval||0,ease=c.ease||2.5,reps=c.reps||0;if(rating==='again'){interval=10/(24*60);ease=Math.max(1.3,ease-.2);reps=0}else if(rating==='hard'){interval=Math.max(1,interval?interval*1.2:1);ease=Math.max(1.3,ease-.1);reps++}else if(rating==='good'){interval=interval?Math.max(1,interval*ease):1;reps++}else{interval=interval?Math.max(3,interval*(ease+.3)):3;ease+=.05;reps++}c.interval=interval;c.ease=ease;c.reps=reps;c.dueAt=Date.now()+interval*86400000;await putOne('cards',c);touch();reviewIndex++;await refresh();renderReview()}

function bytesToB64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s)}
function b64ToBytes(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
async function deriveKey(pass,salt){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function makePayload(){const docs=await Promise.all(documents.map(async d=>({name:d.name,mime:d.mime,size:d.size,kind:d.kind,importedAt:d.importedAt,text:d.text||'',analysis:documentAnalysis(d),data:bytesToB64(new Uint8Array(await d.blob.arrayBuffer()))})));return{version:2,updatedAt:new Date().toISOString(),deviceId:getDeviceId(),documents:docs,cards:cards.map(({id,...c})=>c),tasks:tasks.map(({id,...t})=>t),modules:loadModules(),stats:getStats()}}
async function encryptPayload(payload,pass){if(pass.length<8)throw new Error('PASS_SHORT');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await deriveKey(pass,salt),plain=new TextEncoder().encode(JSON.stringify(payload)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain));return{version:1,alg:'AES-256-GCM',kdf:'PBKDF2-SHA256-250000',salt:bytesToB64(salt),iv:bytesToB64(iv),data:bytesToB64(cipher)}}
async function decryptEnvelope(env,pass){const salt=b64ToBytes(env.salt),iv=b64ToBytes(env.iv),data=b64ToBytes(env.data),key=await deriveKey(pass,salt),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data);return JSON.parse(new TextDecoder().decode(plain))}
async function restorePayload(payload){await clearStore('documents');await clearStore('cards');await clearStore('tasks');for(const d of payload.documents||[]){const bytes=b64ToBytes(d.data||''),blob=new Blob([bytes],{type:d.mime||'application/octet-stream'});await addOne('documents',{name:d.name,mime:d.mime,size:d.size||bytes.length,kind:d.kind||'Sonstiges',importedAt:d.importedAt||Date.now(),text:d.text||'',analysis:d.analysis||analyzeText(d.text||'',d.name||''),blob})}for(const c of payload.cards||[])await addOne('cards',c);for(const t of payload.tasks||[])await addOne('tasks',t);if(payload.modules)localStorage.setItem(MODULES_KEY,JSON.stringify(payload.modules));if(payload.stats)saveStats(payload.stats);touch();await refresh()}
$('#exportVault').onclick=async()=>{try{const pass=$('#vaultPass').value,env=await encryptPayload(await makePayload(),pass);downloadBlob(new Blob([JSON.stringify(env)],{type:'application/json'}),`physics-os-vault-${new Date().toISOString().slice(0,10)}.json`);showNotice('Verschlüsseltes Backup erstellt.')}catch(e){showNotice(e.message==='PASS_SHORT'?'Vault-Code muss mindestens 8 Zeichen haben.':'Backup konnte nicht erstellt werden.')}};
$('#importVaultBtn').onclick=()=>$('#vaultInput').click();$('#vaultInput').onchange=async()=>{const file=$('#vaultInput').files[0];if(!file)return;try{const env=JSON.parse(await file.text()),payload=await decryptEnvelope(env,$('#vaultPass').value);await restorePayload(payload);showNotice('Vault erfolgreich eingelesen.')}catch{showNotice('Backup oder Vault-Code ist nicht korrekt.')}};

function loadSyncUI(){const cfg=loadSyncConfig();$('#deviceId').value=getDeviceId();$('#syncId').value=cfg.syncId||'';$('#syncEndpoint').value=cfg.endpoint||'';$('#autoSync').checked=!!cfg.autoSync;$('#lastSync').textContent=cfg.lastSync?new Date(cfg.lastSync).toLocaleString('de-DE'):'noch nie';updateSyncState()}
function currentSyncConfig(){return{...loadSyncConfig(),syncId:$('#syncId').value.trim(),endpoint:$('#syncEndpoint').value.trim(),autoSync:$('#autoSync').checked}}
function persistSyncConfig(){saveSyncConfig(currentSyncConfig());updateSyncState()}
function updateSyncState(){const cfg=currentSyncConfig();const ready=!!(cfg.syncId&&cfg.endpoint);$('#syncState').textContent=ready?'konfiguriert':'nicht verbunden';$('#syncPill').textContent=ready?'↻ sync bereit':'✓ lokal-first'}
['syncId','syncEndpoint'].forEach(id=>$(`#${id}`).onchange=persistSyncConfig);$('#autoSync').onchange=persistSyncConfig;
$('#generateSyncId').onclick=()=>{$('#syncId').value=generateSyncId();persistSyncConfig();showNotice('Neue Sync-ID erzeugt. Auf anderen Geräten exakt dieselbe verwenden.')};
$('#copySyncId').onclick=async()=>{if(!$('#syncId').value)return showNotice('Noch keine Sync-ID.');await navigator.clipboard?.writeText($('#syncId').value);showNotice('Sync-ID kopiert.')};
async function syncPush(){const cfg=currentSyncConfig(),pass=$('#syncPass').value;if(pass.length<8)throw new Error('PASS_SHORT');const envelope=await encryptPayload(await makePayload(),pass);await pushEncryptedSnapshot({endpoint:cfg.endpoint,syncId:cfg.syncId,envelope,deviceId:getDeviceId()});const next={...cfg,lastSync:new Date().toISOString()};saveSyncConfig(next);loadSyncUI();return true}
async function syncPull(){const cfg=currentSyncConfig(),pass=$('#syncPass').value;if(pass.length<8)throw new Error('PASS_SHORT');const remote=await pullEncryptedSnapshot({endpoint:cfg.endpoint,syncId:cfg.syncId});if(!remote)return false;const payload=await decryptEnvelope(remote.envelope,pass);await restorePayload(payload);const next={...cfg,lastSync:new Date().toISOString()};saveSyncConfig(next);loadSyncUI();return true}
function syncError(e){if(e.message==='PASS_SHORT')return'Vault-Code braucht mindestens 8 Zeichen.';if(e.message==='NO_ENDPOINT')return'Sync-Endpunkt fehlt.';if(e.message==='NO_SYNC_ID')return'Sync-ID fehlt.';if(String(e.message).includes('HTTP'))return'Der Sync-Server hat die Anfrage abgelehnt.';return'Sync fehlgeschlagen. Prüfe Endpunkt, Sync-ID und Vault-Code.'}
$('#syncPush').onclick=async()=>{try{showNotice('Verschlüsselter Upload …');await syncPush();showNotice('Cloud-Stand aktualisiert.')}catch(e){showNotice(syncError(e))}};
$('#syncPull').onclick=async()=>{try{showNotice('Verschlüsselten Cloud-Stand laden …');const ok=await syncPull();showNotice(ok?'Cloud-Stand übernommen.':'In der Cloud liegt noch kein Stand.')}catch(e){showNotice(syncError(e))}};
$('#syncNow').onclick=async()=>{try{const cfg=currentSyncConfig(),pass=$('#syncPass').value;if(pass.length<8)throw new Error('PASS_SHORT');const remote=await pullEncryptedSnapshot({endpoint:cfg.endpoint,syncId:cfg.syncId});if(!remote){await syncPush();return showNotice('Erster Cloud-Stand angelegt.')}const localTime=Date.parse(localStorage.getItem(LAST_CHANGE_KEY)||0),remoteTime=Date.parse(remote.clientUpdatedAt||remote.serverUpdatedAt||0);if(remoteTime>localTime){const payload=await decryptEnvelope(remote.envelope,pass);await restorePayload(payload);showNotice('Neueren Cloud-Stand übernommen.')}else{await syncPush();showNotice('Neueren Geräte-Stand hochgeladen.')}}catch(e){showNotice(syncError(e))}};
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState!=='visible')return;const cfg=loadSyncConfig();if(!cfg.autoSync||!$('#syncPass')?.value)return;try{await $('#syncNow').onclick()}catch{}});

const commands=[['Dashboard','home','⌂'],['Studium & Aufgaben','study','▦'],['Smart Import','files','▤'],['Formel-Explorer','formulas','φ'],['Problem Trainer','trainer','∴'],['Messdaten-Lab','lab','⌁'],['Simulationen','sim','◎'],['Lernkarten','cards','◇'],['Geräte-Sync','sync','↻'],['Vault & Backup','vault','▣']];
function openCommands(){const m=$('#commandPalette');m.classList.remove('hidden');$('#commandInput').value='';renderCommands();setTimeout(()=>$('#commandInput').focus(),30)}
function renderCommands(){const q=$('#commandInput').value.toLowerCase();const list=commands.filter(c=>c[0].toLowerCase().includes(q));$('#commandList').innerHTML=list.map(c=>`<button class="command-item" data-command-tab="${c[1]}"><span>${c[2]} &nbsp; ${esc(c[0])}</span><small>öffnen ↵</small></button>`).join('');$$('[data-command-tab]').forEach(b=>b.onclick=()=>{$('#commandPalette').classList.add('hidden');go(b.dataset.commandTab)})}
$('#commandButton').onclick=openCommands;$('#commandInput').oninput=renderCommands;$('#commandPalette').onclick=e=>{if(e.target===$('#commandPalette'))$('#commandPalette').classList.add('hidden')};document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommands()}if(e.key==='Escape'){$('#commandPalette').classList.add('hidden');$('#formulaModal').classList.add('hidden');$('#reviewModal').classList.add('hidden')}if(e.key==='Enter'&&!$('#commandPalette').classList.contains('hidden')&&document.activeElement===$('#commandInput'))$('#commandList .command-item')?.click()});

function renderAll(){renderDashboard();renderStudy();renderFiles();renderFileAnalysis();renderFormulas();renderCards();renderProblem();}

async function init(){
  await openDB();setupFormulaTopics();loadSyncUI();await refresh();
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);$('#taskDue').value=tomorrow.toISOString().slice(0,10);
  if('serviceWorker' in navigator){try{await navigator.serviceWorker.register('./sw.js')}catch{}}
  drawProjectile();drawBlackbody();
}
init().catch(e=>{console.error(e);showNotice('Physics OS konnte die lokale Datenbank nicht öffnen.')});
