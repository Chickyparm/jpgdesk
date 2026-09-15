(function () {
  const drop = document.getElementById("drop");
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const quality = document.getElementById("quality");
  const qLabel = document.getElementById("qLabel");
  const stats = document.getElementById("stats");
  const downloadBtn = document.getElementById("downloadBtn");
  let source = null;
  let objectUrl = null;

  quality.addEventListener("input", () => {
    qLabel.textContent = quality.value + "%";
    if (source) bake();
  });

  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", () => fileInput.files[0] && load(fileInput.files[0]));

  function load(file) {
    source = file;
    bake();
  }

  function bake() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = URL.createObjectURL(blob);
          preview.src = objectUrl;
          preview.style.display = "block";
          const pct = Math.round((blob.size / source.size) * 100);
          stats.textContent = `${format(source.size)} → ${format(blob.size)} (${pct}%)`;
          downloadBtn.disabled = false;
          downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = source.name.replace(/\.[^.]+$/, "") + "-desk.jpg";
            a.click();
          };
        },
        "image/jpeg",
        Number(quality.value) / 100
      );
    };
    img.src = URL.createObjectURL(source);
  }

  function format(n) {
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(2) + " MB";
  }
})();
