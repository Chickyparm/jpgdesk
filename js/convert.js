(function () {
  const drop = document.getElementById("drop");
  const fileInput = document.getElementById("fileInput");
  const thumbs = document.getElementById("thumbs");
  const downloadBtn = document.getElementById("downloadBtn");
  const meter = document.getElementById("meter");
  const modal = document.getElementById("paywall");
  const files = [];
  let paper = "letter";
  let fit = "fit";

  function refreshMeter() {
    if (!meter) return;
    meter.innerHTML = JpgDesk.isPro()
      ? "<strong>UNLIMITED</strong>"
      : `<strong>${JpgDesk.remaining()}</strong> FREE PDFS LEFT`;
  }

  function render() {
    thumbs.innerHTML = "";
    files.forEach((f, i) => {
      const el = document.createElement("div");
      el.className = "thumb";
      el.innerHTML = `<img alt=""><button type="button" data-i="${i}">×</button>`;
      el.querySelector("img").src = URL.createObjectURL(f);
      thumbs.appendChild(el);
    });
    downloadBtn.disabled = files.length === 0;
  }

  function addFiles(list) {
    Array.from(list).forEach((f) => {
      if (/image\/(jpeg|jpg|png|webp)/i.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name)) {
        files.push(f);
      }
    });
    render();
  }

  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    addFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", () => addFiles(fileInput.files));
  thumbs.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    files.splice(Number(btn.dataset.i), 1);
    render();
  });

  document.querySelectorAll("[data-paper]").forEach((b) => {
    b.addEventListener("click", () => {
      paper = b.dataset.paper;
      document.querySelectorAll("[data-paper]").forEach((x) => x.classList.toggle("on", x === b));
    });
  });
  document.querySelectorAll("[data-fit]").forEach((b) => {
    b.addEventListener("click", () => {
      fit = b.dataset.fit;
      document.querySelectorAll("[data-fit]").forEach((x) => x.classList.toggle("on", x === b));
    });
  });

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  downloadBtn.addEventListener("click", async () => {
    if (!files.length) return;
    if (!JpgDesk.isPro() && JpgDesk.remaining() <= 0) {
      modal.classList.add("open");
      return;
    }
    downloadBtn.textContent = "BUILDING…";
    const { jsPDF } = window.jspdf;
    const size = paper === "a4" ? "a4" : "letter";
    const doc = new jsPDF({ unit: "pt", format: size, compress: true });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 18;

    for (let i = 0; i < files.length; i++) {
      if (i) doc.addPage();
      const img = await loadImage(files[i]);
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      let w = img.width;
      let h = img.height;
      const scale = fit === "fill" ? Math.max(maxW / w, maxH / h) : Math.min(maxW / w, maxH / h);
      w *= scale;
      h *= scale;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      const data = canvas.toDataURL("image/jpeg", 0.86);
      doc.addImage(data, "JPEG", x, y, w, h);
    }

    if (!JpgDesk.consume()) {
      modal.classList.add("open");
      downloadBtn.textContent = "DOWNLOAD PDF";
      return;
    }
    doc.save("jpgdesk.pdf");
    downloadBtn.textContent = "DOWNLOAD PDF";
    refreshMeter();
  });

  document.getElementById("closeModal")?.addEventListener("click", () => modal.classList.remove("open"));
  document.getElementById("simPro")?.addEventListener("click", () => {
    JpgDesk.activatePro();
    modal.classList.remove("open");
    refreshMeter();
  });

  refreshMeter();
})();
