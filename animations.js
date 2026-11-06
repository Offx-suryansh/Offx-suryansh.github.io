(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST || reduceMotion) return;

  gsap.registerPlugin(ST);
  gsap.defaults({ ease: "power3.out" });

  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));
  const mm = gsap.matchMedia();

  // Avoid hiding content before the animation engine has successfully initialized.
  const reveal = (targets, trigger, vars = {}) => {
    if (!targets || !targets.length) return;
    gsap.fromTo(targets,
      { autoAlpha: 0, y: vars.y ?? 34, filter: "blur(7px)" },
      {
        autoAlpha: 1, y: 0, filter: "blur(0px)",
        duration: vars.duration ?? 1.05,
        stagger: vars.stagger ?? 0.12,
        ease: vars.ease ?? "power4.out",
        clearProps: "filter,opacity,visibility,transform",
        scrollTrigger: trigger ? {
          trigger,
          start: vars.start ?? "top 82%",
          once: true
        } : undefined
      }
    );
  };

  // Word splitting preserves the actual text, inline elements and line breaks.
  function splitWords(el) {
    if (!el || el.dataset.cinematicSplit) return [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    const result = [];
    textNodes.forEach(node => {
      if (!node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.append(document.createTextNode(part));
        else {
          const span = document.createElement("span");
          span.className = "cin-word";
          span.textContent = part;
          frag.append(span);
          result.push(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.cinematicSplit = "true";
    return result;
  }

  // HERO — a multi-stage title entrance, depth reveal and restrained camera drift.
  const hero = $("#home");
  if (hero) {
    const title = $(".hero-copy h1", hero);
    const words = splitWords(title);
    if (words.length) {
      gsap.fromTo(words,
        { yPercent: 135, rotateX: -58, z: -90, autoAlpha: 0, filter: "blur(10px)" },
        { yPercent: 0, rotateX: 0, z: 0, autoAlpha: 1, filter: "blur(0px)",
          duration: 1.25, stagger: 0.075, delay: 0.12, ease: "expo.out",
          clearProps: "all" }
      );
    }

    const introTl = gsap.timeline({ delay: 0.34 });
    introTl.fromTo($$(".hero-copy > .eyebrow", hero),
      { y: 18, autoAlpha: 0, letterSpacing: "0.28em" },
      { y: 0, autoAlpha: 1, letterSpacing: "0.16em", duration: 0.75 }, 0);
    introTl.fromTo($$(".hero-intro", hero),
      { y: 30, autoAlpha: 0, filter: "blur(8px)" },
      { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.95 }, 0.18);
    introTl.fromTo($$(".hero-actions .button", hero),
      { y: 22, autoAlpha: 0, scale: 0.96 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.72, stagger: 0.085 }, 0.38);
    introTl.fromTo($$(".hero-socials > *", hero),
      { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.055 }, 0.56);

    const card = $(".hero-card", hero);
    if (card) {
      gsap.fromTo(card,
        { autoAlpha: 0, y: 90, rotateX: 14, rotateY: -13, scale: 0.88, transformPerspective: 1100, filter: "blur(12px)" },
        { autoAlpha: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1, filter: "blur(0px)",
          duration: 1.65, delay: 0.22, ease: "expo.out", clearProps: "filter" }
      );
      mm.add("(min-width: 761px)", () => {
        gsap.to(card, {
          y: 78, rotateX: -5, rotateY: 4, scale: 0.965, ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.1 }
        });
        const onMove = (event) => {
          const r = card.getBoundingClientRect();
          const x = (event.clientX - r.left) / r.width - 0.5;
          const y = (event.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotateY: x * 5, rotateX: y * -4, duration: 0.55, ease: "power2.out", overwrite: "auto" });
        };
        const reset = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "power3.out" });
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", reset);
        return () => { card.removeEventListener("pointermove", onMove); card.removeEventListener("pointerleave", reset); };
      });
    }
    const cue = $(".scroll-cue", hero);
    if (cue) gsap.fromTo(cue, { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, delay: 1.1, duration: 0.8 });
  }

  // SECTION HEADING — clip-path wipe with a small depth settle.
  $$("#about, #skills, #projects, #experience, #resume, #terminal, #contact").forEach(section => {
    const heading = $("h2", section) || $(".section-heading", section);
    if (!heading) return;
    gsap.fromTo(heading,
      { clipPath: "inset(0 0 100% 0)", y: 24, autoAlpha: 0 },
      { clipPath: "inset(0 0 0% 0)", y: 0, autoAlpha: 1, duration: 1.15, ease: "power4.out",
        scrollTrigger: { trigger: heading, start: "top 88%", once: true } }
    );
    const eyebrow = $(".eyebrow", section);
    if (eyebrow) reveal([eyebrow], heading, { y: 14, duration: 0.7, start: "top 90%" });
  });

  // ABOUT — text lines cascade in; facts have a separate, delayed entrance.
  const about = $("#about");
  if (about) {
    reveal($$(".about-copy > p", about), $(".about-copy", about), { y: 28, stagger: 0.2, duration: 1.05 });
    reveal($$(".about-facts > div", about), $(".about-facts", about), { y: 24, stagger: 0.14, duration: 0.85, start: "top 88%" });
  }

  // SKILLS — perspective stagger with a quiet, non-layout-changing hover response.
  const skills = $("#skills");
  if (skills) {
    const cards = $$(".skill-card", skills);
    gsap.fromTo(cards,
      { autoAlpha: 0, y: 58, rotateX: 16, scale: 0.94, transformPerspective: 900, filter: "blur(6px)" },
      { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)",
        duration: 1, stagger: { each: 0.12, from: "start" }, ease: "power4.out",
        clearProps: "filter,transform,opacity,visibility",
        scrollTrigger: { trigger: $(".skills-grid", skills), start: "top 84%", once: true } }
    );
  }

  // PROJECTS — each row has its own masked entrance, while inner elements travel
  // on different axes. A scrubbed micro-parallax adds depth without changing layout.
  const projects = $("#projects");
  if (projects) {
    $$(".project-card", projects).forEach((card, i) => {
      const index = $(".project-index", card);
      const content = $(".project-content", card);
      const symbol = $(".project-symbol", card);
      const top = $(".project-topline", card);
      const title = $("h3", card);
      const desc = $("p", card);
      const tags = $(".tag-list", card);
      const links = $(".project-links", card);

      const rowTl = gsap.timeline({
        scrollTrigger: { trigger: card, start: "top 88%", end: "top 44%", toggleActions: "play none none reverse" }
      });
      rowTl.fromTo(card,
        { clipPath: "inset(0 0 100% 0)", y: 38 },
        { clipPath: "inset(0 0 0% 0)", y: 0, duration: 1.05, ease: "power4.out" }
      );
      if (index) rowTl.fromTo(index, { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.65 }, 0.12);
      if (top) rowTl.fromTo(top, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, 0.2);
      if (title) rowTl.fromTo(title, { y: 28, rotateX: -22, autoAlpha: 0 }, { y: 0, rotateX: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 0.28);
      if (desc) rowTl.fromTo(desc, { y: 20, autoAlpha: 0, filter: "blur(5px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.72 }, 0.4);
      if (tags) rowTl.fromTo($$("span", tags), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.045 }, 0.52);
      if (links) rowTl.fromTo($$("a", links), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.09 }, 0.64);
      if (symbol) gsap.fromTo(symbol, { x: 28, rotate: 18, autoAlpha: 0 }, {
        x: 0, rotate: 0, autoAlpha: 1, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 84%", once: true }
      });

      // Gentle scrub is limited to inner content so row geometry never changes.
      if (content) gsap.fromTo(content, { y: 18 }, {
        y: -12, ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.65 }
      });
    });
  }

  // EXPERIENCE — timeline line draws down as entries arrive in sequence.
  const experience = $("#experience");
  if (experience) {
    const timeline = $(".timeline", experience);
    if (timeline) {
      const entries = $$(".timeline-item", timeline);
      gsap.fromTo(entries,
        { x: -34, autoAlpha: 0, filter: "blur(5px)" },
        { x: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.9, stagger: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: timeline, start: "top 82%", once: true } }
      );
    }
    const certs = $$(".certificate-item", experience);
    gsap.fromTo(certs,
      { x: 32, autoAlpha: 0, clipPath: "inset(0 0 0 12%)" },
      { x: 0, autoAlpha: 1, clipPath: "inset(0 0 0 0%)", duration: 0.85, stagger: 0.16, ease: "power3.out",
        scrollTrigger: { trigger: $(".cert-box", experience), start: "top 82%", once: true } }
    );
  }

  // RESUME + TERMINAL — restrained perspective and terminal prompt cadence.
  const resume = $("#resume");
  if (resume) {
    const panel = $(".resume-panel", resume);
    if (panel) gsap.fromTo(panel, { y: 48, autoAlpha: 0, scale: 0.985, filter: "blur(7px)" }, {
      y: 0, autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: panel, start: "top 84%", once: true }
    });
  }
  const terminal = $("#terminal");
  if (terminal) {
    const windowEl = $(".terminal-window", terminal);
    if (windowEl) gsap.fromTo(windowEl, { y: 42, rotateX: 5, autoAlpha: 0, transformPerspective: 1000 }, {
      y: 0, rotateX: 0, autoAlpha: 1, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: windowEl, start: "top 84%", once: true }
    });
  }

  // CONTACT — staggered copy and a soft underline sweep on the existing email row.
  const contact = $("#contact");
  if (contact) {
    const parts = $$(".contact-copy, .email-row, .contact-links, .privacy-note", contact);
    reveal(parts, contact, { y: 26, stagger: 0.16, duration: 0.95 });
  }

  // Global scroll progress is intentionally omitted to keep the original chrome untouched.
  // Refresh after fonts/images load so scrubbed ranges align with final layout.
  window.addEventListener("load", () => ST.refresh(), { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
})();