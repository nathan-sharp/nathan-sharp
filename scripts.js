// Development Warning

function Development_Warning() {
    alert("Warning this content is in development, it may behave in unexpected ways or provide incorrect information.");
}

// Dynamic Favicon Update

function updateFaviconToMatchBg() {
  // Get computed background color
  const bg = getComputedStyle(document.body).backgroundColor;
  // Convert rgb/rgba to hex
  function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (!result) return '#232436';
    return (
      '#' +
      result.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('')
    );
  }
  const color = rgbToHex(bg);
  // SVG circle
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='28' fill='${color}'/></svg>`;
  const url = 'data:image/svg+xml,' + encodeURIComponent(svg);
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = url;
}

window.addEventListener('DOMContentLoaded', updateFaviconToMatchBg);
const observer = new MutationObserver(updateFaviconToMatchBg);
observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
