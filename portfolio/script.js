document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return; 
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  try {
    if (typeof ScrollReveal !== "undefined") {
      const sr = ScrollReveal();
      sr.reveal(".hero", { origin: "left", distance: "40px", duration: 800, delay: 100 });
      sr.reveal(".img-hero", { origin: "right", distance: "40px", duration: 900, delay: 300 });
      sr.reveal(".serviceitem", { origin: "bottom", distance: "40px", duration: 800, interval: 120 }); 
      sr.reveal(".about-img, .content-about", { origin: "bottom", distance: "30px", duration: 800, interval: 150 });
      sr.reveal(".ads", { origin: "top", distance: "30px", duration: 800, delay: 200 });
      sr.reveal(".contact-info, .contact-last", { origin: "bottom", distance: "30px", duration: 800, delay: 200 });
    }
  } catch (err) {
    console.warn("ScrollReveal init failed or not loaded:", err);
  }

  try {
    if (typeof Swiper !== "undefined") {
      const swipers = document.querySelectorAll(".swiper");
      swipers.forEach((el) => {
        new Swiper(el, {
          loop: true,
          speed: 600,
          slidesPerView: 1,
          autoplay: { delay: 4500, disableOnInteraction: false },
          pagination: { el: ".swiper-pagination", clickable: true },
          navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
          breakpoints: { 768: { slidesPerView: 1 } },
        });
      });
    }
  } catch (err) {
    console.warn("Swiper init failed or not loaded:", err);
  }

  try {
    if (typeof mixitup !== "undefined") {
      const grid = document.querySelector(".mix-container"); 
      if (grid) {
        mixitup(grid, { selectors: { target: ".mix" }, animation: { duration: 300 } });
      }
    }
  } catch (err) {
    console.warn("MixItUp init failed or not loaded:", err);
  }

  (function navHighlightOnScroll() {
    const navLinks = $$("header .nav a");
    const sections = navLinks
      .map((a) => {
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) return null;
        const el = document.querySelector(href);
        return el ? { el, link: a } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const match = sections.find((s) => s.el === entry.target);
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            match.link.classList.add("active");
          }
        });
      },
      { root: null, rootMargin: "-35% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s.el));
  })();

  (function aboutTabs() {
    const aboutButtons = $$(".about-btn button");
    const aboutContents = $$(".content-btn > .content"); 

    if (!aboutButtons.length || !aboutContents.length) return;

    aboutContents.forEach((c, index) => {
        if (index !== 0) {
            c.style.display = 'none';
        } else {
            c.style.display = 'block';
        }
    });

    aboutButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        aboutButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        
        const targetIndex = parseInt(btn.getAttribute("data-target")); 

        aboutContents.forEach((c, index) => {
            if (index === targetIndex) {
                c.style.display = 'block'; 
            } else {
                c.style.display = 'none'; 
            }
        });
      });
    });
  })();

  (function servicesReadMore() {
    const readLinks = $$(".read-more, .readMore");
    if (!readLinks.length) return;

    let modal = document.getElementById("site-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "site-modal";
      modal.style.cssText = "position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:10000;background:rgba(0,0,0,0.5);";
      modal.innerHTML = `
        <div role="dialog" aria-modal="true" id="site-modal-inner" style="max-width:720px;width:90%;background:#fff;border-radius:10px;padding:22px;box-shadow:0 8px 40px rgba(0,0,0,.35);color:#111;">
          <button id="site-modal-close" aria-label="Close" style="float:right;background:none;border:none;font-size:20px;cursor:pointer;">✕</button>
          <div id="site-modal-content" style="margin-top:8px;"></div>
        </div>`;
      document.body.appendChild(modal);
    }

    const modalContent = $("#site-modal-content");
    const modalClose = $("#site-modal-close");

    const openModal = (html) => {
      modalContent.innerHTML = html;
      modal.style.display = "flex";
      modalClose.focus();
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      modal.style.display = "none";
      modalContent.innerHTML = "";
      document.body.style.overflow = "";
    };

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    readLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const item = link.closest(".service-item, .serviceitem");
        if (!item) {
          openModal("<h3>More info</h3><p>Details coming soon.</p>");
          return;
        }
        const title = item.querySelector("h3") ? item.querySelector("h3").textContent : "Service";
        const desc = item.querySelector("p") ? item.querySelector("p").innerHTML : "<p>Details coming soon.</p>";
        const html = `<h2 style="margin-top:0">${title}</h2><div>${desc}</div><p style="margin-top:12px;color:#555">Contact me to discuss this service in detail.</p>`;
        openModal(html);
      });
    });
  })();

  (function contactFormHandler() {
    const form = $("form[action], form#contact-form, .contact form");
    if (!form) return;

    const nameEl = form.querySelector('input[placeholder*="First"]');
    const emailEl = form.querySelector('input[type="email"]');
    const subjectEl = form.querySelector('input[placeholder*="Subject"]');
    const messageEl = form.querySelector('textarea');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailVal = emailEl ? emailEl.value.trim() : "";
      const nameVal = nameEl ? nameEl.value.trim() : "";
      const messageVal = messageEl ? messageEl.value.trim() : "";
      
      if (!emailVal || !/\S+@\S+\.\S+/.test(emailVal)) {
        alert("Please enter a valid email address.");
        if (emailEl) emailEl.focus();
        return;
      }
      if (!messageVal) {
        alert("Please enter your message.");
        if (messageEl) messageEl.focus();
        return;
      }

      const mailto = `mailto:mdaarifansari5553@gmail.com?subject=${encodeURIComponent(
        subjectEl ? subjectEl.value.trim() : "Contact from portfolio"
      )}&body=${encodeURIComponent(`${nameVal ? nameVal + "\n\n" : ""}${messageVal}\n\nEmail: ${emailVal}`)}`;
      
      if (confirm("No form endpoint configured. Open your mail client to send the message?")) {
        window.location.href = mailto;
      }
    });
  })();

  (function tracking() {
    const cvBtn = $(".b-cv");
    const hireBtn = $('a[href^="mailto:"]');

    const inc = (key) => {
      try {
        const n = Number(localStorage.getItem(key) || 0) + 1;
        localStorage.setItem(key, String(n));
        return n;
      } catch {
        return null;
      }
    };

    if (cvBtn) {
      cvBtn.addEventListener("click", () => {
        const total = inc("cv_downloads");
        console.log("CV download clicked. Total:", total);
      });
    }

    if (hireBtn) {
      hireBtn.addEventListener("click", () => {
        const total = inc("hire_clicks");
        console.log("Hire button clicked. Total:", total);
      });
    }
  })();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("site-modal");
      if (modal && modal.style.display === "flex") {
        const closeBtn = $("#site-modal-close");
        if (closeBtn) closeBtn.click();
      }
    }
  });

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    console.log("User prefers reduced motion. Consider disabling animations.");
  }
});