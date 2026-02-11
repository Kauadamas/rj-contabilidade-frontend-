(() => {
  const header = document.getElementById("siteHeader");
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  function setHeaderH() {
    if (!header) return;
    const h = header.offsetHeight || 76;
    document.documentElement.style.setProperty("--headerH", `${h}px`);
  }

  // roda já e em resize
  setHeaderH();
  window.addEventListener("resize", setHeaderH, { passive: true });

  // Ano no footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menu (hambúrguer)
  if (menuBtn && mobileNav) {
    const closeMenu = () => {
      mobileNav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      setHeaderH();
    };

    const openMenu = () => {
      mobileNav.classList.add("open");
      menuBtn.setAttribute("aria-expanded", "true");
      setHeaderH();
    };

    menuBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.contains("open");
      if (isOpen) closeMenu();
      else openMenu();
    });

    // Fecha ao clicar em link
    mobileNav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", closeMenu);
    });

    // Fecha ao apertar ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Fecha ao clicar fora (opcional, melhora UX)
    document.addEventListener("click", (e) => {
      if (!mobileNav.classList.contains("open")) return;
      const target = e.target;
      const clickedInside = mobileNav.contains(target) || menuBtn.contains(target);
      if (!clickedInside) closeMenu();
    });
  }

  // Destaque do link ativo conforme scroll (inclui #sobre)
  const sectionIds = ["inicio", "servicos", "sobre", "faq", "contato"];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  const setActive = () => {
    const y =
      window.scrollY +
      (parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--headerH")
      ) || 76) +
      60;

    let currentId = sectionIds[0] || "inicio";
    for (const sec of sections) {
      if (sec.offsetTop <= y) currentId = sec.id;
    }

    navLinks.forEach(l => {
      const href = l.getAttribute("href") || "";
      l.classList.toggle("is-active", href === `#${currentId}`);
    });
  };

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const ans = item.querySelector(".faq-a");
    if (!btn || !ans) return;

    btn.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      ans.hidden = !open;
    });
  });

  // Reveal on scroll
  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  if (prefersReduced) {
    revealEls.forEach(el => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    revealEls.forEach(el => io.observe(el));
  }

  // Submit real com upload de arquivos
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalText = submitBtn ? submitBtn.textContent : null;

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Enviando...";
        }

        const formData = new FormData(contactForm);

        const response = await fetch(
          "https://rj-contabilidade-backend.onrender.com/api/lead-upload",
          {
            method: "POST",
            body: formData
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const msg = (data && data.error) || "Erro ao enviar o formulário.";
          alert(msg);
          return;
        }

        alert("Mensagem enviada com sucesso! Em breve entraremos em contato.");
        contactForm.reset();
      } catch (err) {
        console.error(err);
        alert("Ocorreu um erro ao enviar. Tente novamente em instantes.");
      } finally {
        if (submitBtn && originalText) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }
})();