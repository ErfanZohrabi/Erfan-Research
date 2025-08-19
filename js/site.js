document.addEventListener('DOMContentLoaded', function(){
  // Simple hero carousel
  const slides = document.querySelectorAll('.hero-slide');
  let idx = 0;
  function show(i){
    slides.forEach((s,si)=> s.style.opacity = si===i? '1':'0');
  }
  if(slides.length){
    show(0);
    setInterval(()=>{ idx = (idx+1) % slides.length; show(idx); }, 4500);
  }
});
