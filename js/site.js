(function () {
  const path = location.pathname.split("/").pop() || "index.html";

  const nav = document.getElementById("site-nav");
  if (nav) {
    nav.innerHTML = `
      <a class="brand" href="index.html">JPGDESK</a>
      <button class="nav-toggle" id="navToggle" aria-label="Menu">≡</button>
      <div class="nav-links" id="navLinks">
        <a href="convert.html" class="${path === "convert.html" ? "active" : ""}">Convert</a>
        <a href="tools.html" class="${path === "tools.html" ? "active" : ""}">Tools</a>
        <a href="uses.html" class="${path === "uses.html" ? "active" : ""}">Uses</a>
        <a href="pricing.html" class="${path === "pricing.html" ? "active" : ""}">Pricing</a>
        <a class="nav-cta" href="convert.html">Launch</a>
      </div>`;
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    toggle?.addEventListener("click", () => links.classList.toggle("open"));
  }

  const foot = document.getElementById("site-foot");
  if (foot) {
    foot.innerHTML = `
      <div>© ${new Date().getFullYear()} JpgDesk · Local compute</div>
      <div>
        <a href="privacy.html">Privacy</a> ·
        <a href="pricing.html">Pricing</a> ·
        <a href="convert.html">Convert</a>
      </div>`;
  }

  const bar = document.getElementById("scroll-progress");
  const onScroll = () => {
    if (bar) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = max > 0 ? (h.scrollTop / max) * 100 + "%" : "0%";
    }
    document.querySelector(".nav")?.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.16 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

window.JpgDesk = {
  FREE_LIMIT: 3,
  used() {
    return Number(localStorage.getItem("jpgdesk_free_used") || 0);
  },
  remaining() {
    return Math.max(0, this.FREE_LIMIT - this.used());
  },
  isPro() {
    return localStorage.getItem("jpgdesk_pro") === "1";
  },
  consume() {
    if (this.isPro()) return true;
    if (this.remaining() <= 0) return false;
    localStorage.setItem("jpgdesk_free_used", String(this.used() + 1));
    return true;
  },
  activatePro() {
    localStorage.setItem("jpgdesk_pro", "1");
  }
};
