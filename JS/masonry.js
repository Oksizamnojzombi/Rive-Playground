import { instances } from "./rive.js";

// ============================================================
//  Masonry — pack cards tightly while keeping each canvas ratio
// ============================================================

export function layoutMasonry() {
  const grid = document.querySelector(".lessons-grid");
  if (!grid) return;
  const cs = getComputedStyle(grid);
  const rowH = parseFloat(cs.gridAutoRows) || 8;
  const gap = parseFloat(cs.rowGap) || 0;
  grid.querySelectorAll(".lesson-card").forEach((card) => {
    const canvas = card.querySelector(".card-canvas");
    const body = card.querySelector(".card-body");
    if (!canvas || !body) return;
    const h =
      canvas.getBoundingClientRect().height +
      body.getBoundingClientRect().height +
      2; /* card top + bottom border */
    const span = Math.max(1, Math.ceil((h + gap) / (rowH + gap)));
    card.style.gridRowEnd = "span " + span;
  });
}

layoutMasonry();
window.addEventListener("load", layoutMasonry);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(layoutMasonry);
}

// Keep every drawing surface crisp + repack on resize / orientation change
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    instances.forEach((i) => i.resizeDrawingSurfaceToCanvas());
    layoutMasonry();
  }, 120);
});

// ============================================================
//  "Load more" — each .load-more button (lessons gallery, Commercial
//  Shots) shows the first LOAD_BATCH items of its section (DOM order,
//  items = its data-items selector) and reveals the rest batch by batch.
//  With LOAD_BATCH items or fewer the button just stays hidden.
//  Collapsed items are display:none, so their Rive files aren't even
//  fetched until shown.
// ============================================================
const LOAD_BATCH = 8;

function setupLoadMore(btn) {
  const items = [...btn.closest("section, main").querySelectorAll(btn.dataset.items)];
  const collapsed = () => items.filter((el) => el.classList.contains("is-collapsed"));
  const update = () => {
    const left = collapsed().length;
    btn.hidden = left === 0;
    btn.innerHTML = `Load more <span class="count">${left}</span>`;
  };

  items.forEach((el, i) => i >= LOAD_BATCH && el.classList.add("is-collapsed"));
  update();

  btn.addEventListener("click", () => {
    collapsed()
      .slice(0, LOAD_BATCH)
      .forEach((el) => el.classList.remove("is-collapsed"));
    layoutMasonry();
    update();
  });
}

document.querySelectorAll(".load-more[data-items]").forEach(setupLoadMore);
layoutMasonry();

// ============================================================
//  Background orbs parallax — the .bg-orbs layer is taller than the
//  viewport and slides up at BG_DEPTH × the page's scroll speed
// ============================================================
const BG_DEPTH = 0.45; // 0 = pinned in place, 1 = scrolls with the content
const bgOrbs = document.querySelector(".bg-orbs");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let bgTicking = false;

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function moveOrbs() {
  bgTicking = false;
  const depth = reduceMotion.matches ? 0 : BG_DEPTH;
  bgOrbs.style.transform = `translate3d(0, ${-window.scrollY * depth}px, 0)`;
}

function sizeOrbs() {
  const depth = reduceMotion.matches ? 0 : BG_DEPTH;
  bgOrbs.style.setProperty("--bg-travel", maxScroll() * depth + "px");
  moveOrbs();
}

if (bgOrbs) {
  sizeOrbs();
  window.addEventListener(
    "scroll",
    () => {
      if (bgTicking) return;
      bgTicking = true;
      requestAnimationFrame(moveOrbs);
    },
    { passive: true }
  );
  window.addEventListener("resize", sizeOrbs);
  new ResizeObserver(sizeOrbs).observe(document.body); // page height changes after masonry / fonts
  reduceMotion.addEventListener("change", sizeOrbs);
}

// ============================================================
//  Scroll-reveal for cards & heading
// ============================================================
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 70 + "ms";
  io.observe(el);
});
