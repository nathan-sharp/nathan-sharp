const lifeTips = [
  "Embrace failure as a learning opportunity.",
  "Practice gratitude daily to improve your mindset.",
  "Stay curious and never stop learning.",
  "Build meaningful connections with others.",
  "Take care of your physical health through exercise and nutrition.",
  "Set realistic goals and celebrate small victories.",
  "Practice mindfulness to reduce stress and improve focus.",
  "Be kind to yourself and others.",
  "Don't be afraid to step outside of your comfort zone.",
  "Live in the present moment."
];

function displayLifeTip() {
  const randomIndex = Math.floor(Math.random() * lifeTips.length);
  const lifeTip = lifeTips[randomIndex];
  document.getElementById("lifeTip").textContent = lifeTip;
}
