document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ══════════════════════════════════════════════
    // GALLERY CAROUSEL
    // ══════════════════════════════════════════════
    initGallery();
});

// ── Gallery State ──
let galleryIndex = 0;
let galleryVisible = 3; // screenshots visible at once

function initGallery() {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    const images = track.querySelectorAll('img');
    const total = images.length;

    // Determine how many to show based on viewport
    function updateVisible() {
        const w = window.innerWidth;
        if (w <= 600) galleryVisible = 1;
        else if (w <= 968) galleryVisible = 2;
        else galleryVisible = 3;
    }
    updateVisible();
    window.addEventListener('resize', () => {
        updateVisible();
        galleryGoTo(Math.min(galleryIndex, total - galleryVisible));
    });

    // Build dots
    const dotsContainer = document.getElementById('galleryDots');
    if (dotsContainer) {
        const pages = Math.ceil(total / galleryVisible);
        dotsContainer.innerHTML = '';
        for (let i = 0; i < pages; i++) {
            const dot = document.createElement('button');
            dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Page ' + (i + 1));
            dot.addEventListener('click', () => galleryGoTo(i * galleryVisible));
            dotsContainer.appendChild(dot);
        }
    }

    galleryGoTo(0);
}

function galleryGoTo(idx) {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    const images = track.querySelectorAll('img');
    const total = images.length;
    const maxIdx = Math.max(0, total - galleryVisible);
    galleryIndex = Math.max(0, Math.min(idx, maxIdx));

    // Calculate offset from first image
    if (images.length === 0) return;
    const gap = 20; // matches CSS gap
    const firstImg = images[0];
    const imgWidth = firstImg.getBoundingClientRect().width;
    const offset = galleryIndex * (imgWidth + gap);
    track.style.transform = 'translateX(-' + offset + 'px)';

    // Update arrows
    const prev = document.querySelector('.gallery-prev');
    const next = document.querySelector('.gallery-next');
    if (prev) prev.disabled = galleryIndex <= 0;
    if (next) next.disabled = galleryIndex >= maxIdx;

    // Update dots
    const dots = document.querySelectorAll('.gallery-dot');
    const activePage = Math.floor(galleryIndex / galleryVisible);
    dots.forEach((d, i) => d.classList.toggle('active', i === activePage));
}

function galleryPrev() {
    galleryGoTo(galleryIndex - 1);
}

function galleryNext() {
    galleryGoTo(galleryIndex + 1);
}

// ══════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════
let lightboxIndex = 0;

function getLightboxImages() {
    return document.querySelectorAll('#galleryTrack img');
}

function openLightbox(imgEl) {
    const overlay = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    if (!overlay || !lightboxImg) return;

    // Find the index of this image in the gallery
    const images = getLightboxImages();
    images.forEach((img, i) => { if (img === imgEl) lightboxIndex = i; });

    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const overlay = document.getElementById('lightbox');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function lightboxPrev() {
    const images = getLightboxImages();
    if (images.length === 0) return;
    lightboxIndex = (lightboxIndex - 1 + images.length) % images.length;
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = images[lightboxIndex].src;
    lightboxImg.alt = images[lightboxIndex].alt;
}

function lightboxNext() {
    const images = getLightboxImages();
    if (images.length === 0) return;
    lightboxIndex = (lightboxIndex + 1) % images.length;
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = images[lightboxIndex].src;
    lightboxImg.alt = images[lightboxIndex].alt;
}

// Close on Escape key, navigate on arrows
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
    const isLightboxOpen = document.getElementById('lightbox')?.classList.contains('active');
    if (isLightboxOpen) {
        if (e.key === 'ArrowLeft') lightboxPrev();
        if (e.key === 'ArrowRight') lightboxNext();
    } else {
        if (e.key === 'ArrowLeft') galleryPrev();
        if (e.key === 'ArrowRight') galleryNext();
    }
});
