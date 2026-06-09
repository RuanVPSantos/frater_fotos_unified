function startSlideshow() {
    const header = document.querySelector('header'); // ou o seletor correto do seu menu superior
    header.style.display = 'none';

    currentSlide = 0;
    showSlide(currentSlide);

    slideshowInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 2000); // 2 segundos
}

function stopSlideshow() {
    const header = document.querySelector('header');
    header.style.display = 'block';

    clearInterval(slideshowInterval);
    // ... resto do código existente ...
} 