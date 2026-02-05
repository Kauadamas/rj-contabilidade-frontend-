/* RJ Contabilidade - Vanilla JS interactions (menu + FAQ accordion + small UX) */
(function () {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Mobile menu
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

  // Close menu when clicking a link
  $$('#mobileNav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // FAQ accordion
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

  faqItems.forEach((item, index) => {
    const btn = item.querySelector('button');
    btn?.addEventListener('click', () => toggleFaq(index));
  });

  // Default open first FAQ (matches original)
  if (faqItems.length) toggleFaq(0);

  // Demo buttons (non-functional placeholders)
  const toast = (msg) => {
    // Tiny, dependency-free toast
    const el = document.createElement('div');
    el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-[60] text-sm';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  };

  $$('[data-action="start"]').forEach(btn => btn.addEventListener('click', () => toast('✅ CTA clicado (placeholder). Conecte com seu checkout/formulário.')));
  $$('[data-action="demo"]').forEach(btn => btn.addEventListener('click', () => toast('🎥 Demo (placeholder). Conecte com seu vídeo/calendário.')));
  $$('[data-action="sales"]').forEach(btn => btn.addEventListener('click', () => toast('💬 Vendas (placeholder). Conecte com WhatsApp/CRM.')));
  $$('[data-action="support"]').forEach(btn => btn.addEventListener('click', () => toast('🛟 Suporte (placeholder). Conecte com chat/email.')));

  // Newsletter (basic validation)
  const form = $('#newsletterForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail')?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('⚠️ Digite um email válido.');
      $('#newsletterEmail')?.focus();
      return;
    }
    toast('📩 Inscrição registrada (placeholder). Integre com seu provedor de email.');
    form.reset();
  });

  // Lead form with document upload
  const leadForm = $('#leadForm');
  if (leadForm) {
    const drop = leadForm.querySelector('.drop-area');
    const inputFiles = leadForm.querySelector('#leadFiles');
    const fileListEl = leadForm.querySelector('#fileList');
    const progressWrap = leadForm.querySelector('#uploadProgressWrap');
    const progressBar = leadForm.querySelector('#uploadProgressBar > i');

    const MAX_FILES = 3;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB per file
    const ALLOWED = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg'];

    let selectedFiles = [];

    function renderFiles() {
      fileListEl.innerHTML = '';
      if (!selectedFiles.length) return fileListEl.innerHTML = '<p class="text-sm text-gray-500">Nenhum arquivo selecionado</p>';
      selectedFiles.forEach(f => {
        const el = document.createElement('div');
        el.className = 'flex items-center gap-2 file-chip mb-2';
        el.innerHTML = `<svg class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="flex-1 text-sm text-gray-800">${escapeHtml(f.name)}</div><button type="button" class="text-xs text-red-600 remove">Remover</button>`;
        el.querySelector('.remove').addEventListener('click', () => {
          selectedFiles = selectedFiles.filter(x => x !== f);
          renderFiles();
        });
        fileListEl.appendChild(el);
      });
    }

    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

    function addFiles(list) {
      const arr = Array.from(list);
      for (const f of arr) {
        if (selectedFiles.length >= MAX_FILES) { toast(`⚠️ Limite: máximo ${MAX_FILES} arquivos.`); break; }
        if (f.size > MAX_SIZE) { toast(`⚠️ "${f.name}" excede ${MAX_SIZE/1024/1024}MB.`); continue; }
        if (!ALLOWED.includes(f.type) && !f.name.match(/\.(pdf|docx?|png|jpe?g)$/i)) { toast(`⚠️ Tipo de arquivo não permitido: ${f.name}`); continue; }
        selectedFiles.push(f);
      }
      renderFiles();
    }

    drop?.addEventListener('click', () => inputFiles.click());
    drop?.addEventListener('dragover', (e)=> { e.preventDefault(); drop.classList.add('dragover'); });
    drop?.addEventListener('dragleave', ()=> drop.classList.remove('dragover'));
    drop?.addEventListener('drop', (e)=>{ e.preventDefault(); drop.classList.remove('dragover'); addFiles(e.dataTransfer.files); });
    inputFiles?.addEventListener('change', (e)=> addFiles(e.target.files));

    leadForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = leadForm.querySelector('#leadName')?.value.trim();
      const email = leadForm.querySelector('#leadEmail')?.value.trim();
      const message = leadForm.querySelector('#leadMessage')?.value.trim();
      if (!name) { toast('⚠️ Preencha seu nome.'); leadForm.querySelector('#leadName').focus(); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('⚠️ Digite um email válido.'); leadForm.querySelector('#leadEmail').focus(); return; }

      // Prepare FormData
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('message', message);
      selectedFiles.forEach((f,i) => fd.append('files[]', f, f.name));

      // Show progress
      progressWrap.hidden = false;
      progressBar.style.width = '0%';

      // NOTE: Replace URL with your backend endpoint that accepts multipart/form-data
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
          toast('✅ Formulário enviado com sucesso. Entraremos em contato.');
          leadForm.reset();
          selectedFiles = [];
          renderFiles();
        } else {
          toast('❌ Erro ao enviar. Configure o endpoint de backend.');
        }
        progressWrap.hidden = true;
      };
      xhr.onerror = function() { toast('❌ Erro de rede ao enviar.'); progressWrap.hidden = true; };
      xhr.send(fd);
    });

    // initial render
    renderFiles();
  }
})();
