(function(){
  const STORAGE_KEY = 'research.notes.v1';
  let notes = [];
  let currentId = null;
  let dirty = false;

  // elements
  const notesList = document.getElementById('notesList');
  const newBtn = document.getElementById('newBtn');
  const saveBtn = document.getElementById('saveBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const titleEl = document.getElementById('title');
  const contentEl = document.getElementById('content');
  const searchEl = document.getElementById('search');
  const previewToggle = document.getElementById('previewToggle');
  const previewEl = document.getElementById('preview');

  function load() {
    try{
      notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }catch(e){ notes = []; }
  }

  function persist(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function renderList(filter){
    notesList.innerHTML = '';
    const f = (filter||'').toLowerCase();
    notes.slice().reverse().forEach(n => {
      if(f && !(n.title||'').toLowerCase().includes(f) && !(n.content||'').toLowerCase().includes(f)) return;
      const li = document.createElement('li');
      li.textContent = n.title || (n.content||'').slice(0,60) || '(untitled)';
      li.dataset.id = n.id;
      if(n.id === currentId) li.classList.add('active');
      li.addEventListener('click', ()=> selectNote(n.id));
      notesList.appendChild(li);
    });
  }

  function newNote(){
    const n = { id: uid(), title: 'New note', content: '', updated: Date.now() };
    notes.push(n);
    currentId = n.id;
    renderList(searchEl.value);
    loadCurrent();
    dirty = true;
  }

  function saveCurrent(){
    if(!currentId) return;
    const n = notes.find(x=>x.id===currentId);
    if(!n) return;
    n.title = titleEl.value;
    n.content = contentEl.value;
    n.updated = Date.now();
    persist();
    renderList(searchEl.value);
    dirty = false;
  }

  function deleteCurrent(){
    if(!currentId) return;
    notes = notes.filter(n=>n.id !== currentId);
    currentId = notes.length ? notes[notes.length-1].id : null;
    persist();
    renderList(searchEl.value);
    loadCurrent();
  }

  function selectNote(id){
    if(dirty){ saveCurrent(); }
    currentId = id;
    renderList(searchEl.value);
    loadCurrent();
  }

  function loadCurrent(){
    const n = notes.find(x=>x.id===currentId) || { title:'', content:'' };
    titleEl.value = n.title || '';
    contentEl.value = n.content || '';
    renderPreview();
  }

  function exportNotes(){
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'research-notes.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function importNotes(file){
    const reader = new FileReader();
    reader.onload = e => {
      try{
        const imported = JSON.parse(e.target.result);
        if(Array.isArray(imported)){
          // merge by id
          const byId = Object.fromEntries(notes.map(n=>[n.id,n]));
          imported.forEach(n=>{ if(n.id) byId[n.id]=n; else byId[uid()]=n; });
          notes = Object.values(byId);
          persist();
          renderList(searchEl.value);
          alert('Import complete');
        }else{ alert('Invalid file format'); }
      }catch(er){ alert('Failed to import: '+er.message); }
    };
    reader.readAsText(file);
  }

  function simpleMarkdown(s){
    if(!s) return '';
    // very small subset: headings, bold, italics, links, line breaks
    let out = s
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/^### (.*$)/gim,'<h3>$1</h3>')
      .replace(/^## (.*$)/gim,'<h2>$1</h2>')
      .replace(/^# (.*$)/gim,'<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g,'<br/>');
    return out;
  }

  function renderPreview(){
    if(previewToggle.checked){
      previewEl.innerHTML = simpleMarkdown(contentEl.value);
      previewEl.style.display = 'block';
    }else{
      previewEl.style.display = 'none';
    }
  }

  // events
  newBtn.addEventListener('click', newNote);
  saveBtn.addEventListener('click', ()=>{ saveCurrent(); alert('Saved'); });
  deleteBtn.addEventListener('click', ()=>{ if(confirm('Delete this note?')) deleteCurrent(); });
  exportBtn.addEventListener('click', exportNotes);
  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', e=>{ if(e.target.files.length) importNotes(e.target.files[0]); e.target.value=''; });

  titleEl.addEventListener('input', ()=> dirty = true);
  contentEl.addEventListener('input', ()=> { dirty = true; renderPreview(); });
  searchEl.addEventListener('input', ()=> renderList(searchEl.value));
  previewToggle.addEventListener('change', renderPreview);

  // autosave every 2s if dirty
  setInterval(()=>{ if(dirty) { saveCurrent(); } }, 2000);

  // initial load
  load();
  if(notes.length) currentId = notes[notes.length-1].id;
  renderList();
  loadCurrent();

  // expose for console debugging
  window._notes = { notes, saveCurrent, persist };
})();
