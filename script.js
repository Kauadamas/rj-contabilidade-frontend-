/* RJ Contabilidade — interactions + Figma-like animations */
(function () {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ===== Mobile menu =====
  const menuBtn = $('#mobileMenuBtn');
  const mobileNav = $('#mobileNav');
  const menuIcon = $('#iconMenu');
  const closeIcon = $('#iconClose');

  function setMenu(open) {
    if (!mobileNav) return;
    mobileNav.hidden = !open;
    menuBtn?.setAttribute('aria-expanded', String(open));
    if (menuIcon) menuIcon.hidden = open;
    if (closeIcon) closeIcon.hidden = !open;
    if (open) mobileNav.querySelector('a')?.focus();
  }

  menuBtn?.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
  });

  $$('#mobileNav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // ===== Toast =====
  const toast = (msg) => {
    const el = document.createElement('div');
    el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 text-gray-900 px-4 py-3 rounded-2xl shadow-xl z-[60] text-sm border border-black/5 backdrop-blur';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  };

  $$('[data-action="start"]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $$('[data-action="demo"]').forEach(btn => btn.addEventListener('click', () => toast('Consulta: conecte com WhatsApp/Calendly.')));
  $$('[data-action="sales"]').forEach(btn => btn.addEventListener('click', () => toast('Vendas: conecte com WhatsApp/CRM.')));
  $$('[data-action="support"]').forEach(btn => btn.addEventListener('click', () => toast('Suporte: conecte com WhatsApp/email.')));

  // ===== FAQ accordion =====
  const faqItems = $$('.faq-item');
  function toggleFaq(index) {
    faqItems.forEach((item, i) => {
      const btn = item.querySelector('button');
      const panel = item.querySelector('[data-panel]');
      const chevron = item.querySelector('[data-chevron]');
      const open = i === index && btn?.getAttribute('aria-expanded') !== 'true';

      if (!btn || !panel) return;

      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (chevron) chevron.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }
  faqItems.forEach((item, index) => item.querySelector('button')?.addEventListener('click', () => toggleFaq(index)));
  if (faqItems.length) toggleFaq(0);

  // ===== Newsletter (se existir) =====
  const form = $('#newsletterForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail')?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Digite um email válido.');
      $('#newsletterEmail')?.focus();
      return;
    }
    toast('Inscrição registrada (placeholder).');
    form.reset();
  });

  // ===== Scroll animations (Figma feel) =====
  function markAnimatables() {
    const sections = $$('section, header, footer, main > div, main > section');
    sections.forEach((el) => {
      // não marca elementos minúsculos
      if (el.hasAttribute('data-animate')) return;
      el.setAttribute('data-animate', 'true');
    });

    // Também marca cards/itens para entrarem suave
    $$('.card, .faq-item, .image-panel').forEach(el => el.setAttribute('data-animate', 'true'));
  }

  markAnimatables();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.12 });

  $$('[data-animate]').forEach(el => io.observe(el));

  // ===== Active link highlight =====
  const navLinks = $$('header a[href^="#"]');
  const sectionIds = navLinks.map(a => a.getAttribute('href')).filter(Boolean);

  const secObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = '#' + visible.target.id;
    navLinks.forEach(a => {
      const active = a.getAttribute('href') === id;
      a.style.fontWeight = active ? '700' : '600';
    });
  }, { threshold: [0.25, 0.55] });

  sectionIds.forEach(h => {
    const el = document.querySelector(h);
    if (el) secObserver.observe(el);
  });

  // ===== Lead form with upload =====
  const leadForm = $('#leadForm');
  if (leadForm) {
    const drop = leadForm.querySelector('.drop-area');
    const inputFiles = leadForm.querySelector('#leadFiles');
    const fileListEl = leadForm.querySelector('#fileList');
    const progressWrap = leadForm.querySelector('#uploadProgressWrap');
    const progressBar = leadForm.querySelector('#uploadProgressBar > i');

    const MAX_FILES = 3;
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg'
    ];

    let selectedFiles = [];

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
    }

    function renderFiles() {
      fileListEl.innerHTML = '';
      if (!selectedFiles.length) {
        fileListEl.innerHTML = '<p class="text-sm text-gray-600">Nenhum arquivo selecionado</p>';
        return;
      }
      selectedFiles.forEach(f => {
        const el = document.createElement('div');
        el.className = 'flex items-center gap-2 file-chip mb-2';
        el.innerHTML = `
          <div class="flex-1 text-sm">${escapeHtml(f.name)}</div>
          <button type="button" class="text-xs text-red-600 remove">Remover</button>
        `;
        el.querySelector('.remove').addEventListener('click', () => {
          selectedFiles = selectedFiles.filter(x => x !== f);
          renderFiles();
        });
        fileListEl.appendChild(el);
      });
    }

    function addFiles(list) {
      const arr = Array.from(list);
      for (const f of arr) {
        if (selectedFiles.length >= MAX_FILES) { toast(`Limite: máximo ${MAX_FILES} arquivos.`); break; }
        if (f.size > MAX_SIZE) { toast(`"${f.name}" excede 10MB.`); continue; }
        if (!ALLOWED.includes(f.type) && !f.name.match(/\.(pdf|docx?|png|jpe?g)$/i)) { toast(`Tipo não permitido: ${f.name}`); continue; }
        selectedFiles.push(f);
      }
      renderFiles();
    }

    drop?.addEventListener('click', () => inputFiles.click());
    drop?.addEventListener('dragover', (e)=> { e.preventDefault(); drop.classList.add('dragover'); });
    drop?.addEventListener('dragleave', ()=> drop.classList.remove('dragover'));
    drop?.addEventListener('drop', (e)=>{ e.preventDefault(); drop.classList.remove('dragover'); addFiles(e.dataTransfer.files); });
    inputFiles?.addEventListener('change', (e)=> addFiles(e.target.files));

    leadForm.addEventListener('submit', (e)=> {
      e.preventDefault();
      const name = leadForm.querySelector('#leadName')?.value.trim();
      const email = leadForm.querySelector('#leadEmail')?.value.trim();
      const message = leadForm.querySelector('#leadMessage')?.value.trim();

      if (!name) { toast('Preencha seu nome.'); leadForm.querySelector('#leadName').focus(); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Digite um email válido.'); leadForm.querySelector('#leadEmail').focus(); return; }

      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('message', message);
      selectedFiles.forEach((f) => fd.append('files[]', f, f.name));

      progressWrap.hidden = false;
      progressBar.style.width = '0%';

      const UPLOAD_URL = "https://rj-contabilidade-backend.onrender.com/api/lead-upload";

      const xhr = new XMLHttpRequest();
      xhr.open('POST', UPLOAD_URL, true);

      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          progressBar.style.width = pct + '%';
        }
      };

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          toast('Formulário enviado com sucesso.');
          leadForm.reset();
          selectedFiles = [];
          renderFiles();
        } else {
          toast('Erro ao enviar. Verifique o backend/endpoint.');
        }
        progressWrap.hidden = true;
      };

      xhr.onerror = function() {
        toast('Erro de rede ao enviar.');
        progressWrap.hidden = true;
      };

      xhr.send(fd);
    });

    renderFiles();
  }
})();
