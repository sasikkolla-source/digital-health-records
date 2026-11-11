const KEY = "dhr_patients_v1";
let patients = [], sel = null;

function load(){
  try { patients = JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ patients = []; }
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(patients)); } catch(e){}
}
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = id => document.getElementById(id);

function addPatient(){
  const name = $("n").value.trim();
  if(!name){ alert("Please enter the patient’s name."); return; }
  const p = {
    id: Date.now().toString(36), name,
    age: $("a").value, gender: $("g").value, phone: $("ph").value.trim(),
    blood: $("b").value,
    allergies: $("al").value.split(",").map(s=>s.trim()).filter(Boolean),
    records: []
  };
  patients.push(p); sel = p.id; save();
  ["n","a","ph","al"].forEach(i => $(i).value = "");
  render();
}

function addRecord(){
  const p = patients.find(x => x.id === sel); if(!p) return;
  const diagnosis = $("rd").value.trim();
  if(!diagnosis){ alert("Please enter a diagnosis."); return; }
  p.records.unshift({
    date: $("rdate").value || new Date().toISOString().slice(0,10),
    diagnosis, treatment: $("rt").value.trim(), notes: $("rn").value.trim()
  });
  save(); renderDetail();
}

function delRecord(i){
  const p = patients.find(x => x.id === sel);
  p.records.splice(i,1); save(); renderDetail();
}
function delPatient(){
  if(!confirm("Delete this patient and all records?")) return;
  patients = patients.filter(x => x.id !== sel); sel = null; save(); render();
}
function pick(id){ sel = id; render(); }

function renderList(){
  const q = $("q").value.toLowerCase();
  const rows = patients.filter(p => p.name.toLowerCase().includes(q) || (p.phone||"").includes(q));
  $("list").innerHTML = rows.length ? rows.map(p =>
    `<div class="p ${p.id===sel?"on":""}" onclick="pick('${p.id}')"><b>${esc(p.name)}</b><br><small>${esc(p.age||"–")} yrs · ${esc(p.gender)} · ${p.records.length} record(s)</small></div>`
  ).join("") : `<div class="empty">No patients yet</div>`;
}

function renderDetail(){
  const p = patients.find(x => x.id === sel);
  if(!p){ $("detail").innerHTML = `<div class="empty">Select or add a patient to view their health records.</div>`; return; }
  $("detail").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start">
      <div><h2>${esc(p.name)}</h2>
      <div class="muted">${esc(p.age||"–")} yrs · ${esc(p.gender)} · Blood group ${esc(p.blood)} · ${esc(p.phone||"No phone")}</div></div>
      <button class="del" onclick="delPatient()">Delete patient</button>
    </div>
    <h3>Allergies</h3>
    <div class="tags">${p.allergies.length ? p.allergies.map(a=>`<span>${esc(a)}</span>`).join("") : `<span class="muted">None recorded</span>`}</div>
    <h3>Add visit record</h3>
    <div class="row">
      <div><label>Date</label><input id="rdate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div><label>Diagnosis</label><input id="rd"></div>
    </div>
    <label>Treatment / prescription</label><input id="rt">
    <label>Notes</label><textarea id="rn" rows="2"></textarea>
    <button onclick="addRecord()">Add record</button>
    <h3>Medical history</h3>
    ${p.records.length ? p.records.map((r,i)=>`
      <div class="rec"><div style="display:flex;justify-content:space-between"><b>${esc(r.diagnosis)}</b>
      <span><small class="muted">${esc(r.date)}</small> <button class="del" onclick="delRecord(${i})">✕</button></span></div>
      ${r.treatment?`<div><small class="muted">Treatment:</small> ${esc(r.treatment)}</div>`:""}
      ${r.notes?`<div><small class="muted">Notes:</small> ${esc(r.notes)}</div>`:""}</div>`).join("")
      : `<div class="empty">No records yet</div>`}`;
}

function render(){ renderList(); renderDetail(); }

function exportData(){
  const blob = new Blob([JSON.stringify(patients,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "health-records.json"; a.click();
}

load(); render();
