// Image to ASCII Art logic
document.addEventListener('DOMContentLoaded', function() {
  const imgInput = document.getElementById('imgInput');
  const convertBtn = document.getElementById('convertBtn');
  const copyBtn = document.getElementById('copyBtn');
  const canvas = document.getElementById('imgCanvas');
  const asciiPre = document.getElementById('asciiPre');
  let img = new Image();
  let imgLoaded = false;

  imgInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  img.onload = function() {
    imgLoaded = true;
  };

  convertBtn.addEventListener('click', function() {
    if (!imgLoaded) {
      alert('Please upload an image first.');
      return;
    }
    // Resize for ASCII (smaller width)
    const maxWidth = 100;
    const scale = Math.min(1, maxWidth / img.width);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale * 0.5); // 0.5 for font aspect ratio
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;
    const chars = '@%#*+=-:. ';
    let asciiHTML = '';
    let asciiText = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = imgData[i];
        const g = imgData[i+1];
        const b = imgData[i+2];
        const avg = (r + g + b) / 3;
        const charIdx = Math.floor((avg / 255) * (chars.length - 1));
        const char = chars[charIdx];
        asciiHTML += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
        asciiText += char;
      }
      asciiHTML += '<br>';
      asciiText += '\n';
    }
    asciiPre.innerHTML = asciiHTML;
    asciiPre.setAttribute('data-ascii', asciiText);
  });

  copyBtn.addEventListener('click', function() {
    // Get plain ASCII from data attribute
    const asciiText = asciiPre.getAttribute('data-ascii') || '';
    if (!asciiText.trim()) {
      alert('No ASCII art to copy.');
      return;
    }
    navigator.clipboard.writeText(asciiText).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy ASCII', 1200);
    }, () => {
      alert('Failed to copy.');
    });
  });
});
