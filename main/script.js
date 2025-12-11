const track = document.querySelector('.carousel-track');
let slides = Array.from(track.children);

// Clone the first slide and append it to the end for seamless looping
const firstSlideClone = slides[0].cloneNode(true);
track.appendChild(firstSlideClone);

// Update slides array to include the clone
slides = Array.from(track.children);

let slideWidth = slides[0].getBoundingClientRect().width;
let currentIndex = 0;

function moveToNextSlide() {
    currentIndex++;
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = 'translateX(' + (-slideWidth * currentIndex) + 'px)';

    // Seamless loop check:
    // If we have just moved TO the clone (which is the last slide)
    if (currentIndex === slides.length - 1) {
        track.addEventListener('transitionend', () => {
            // Disable transition to jump instantly
            track.style.transition = 'none';
            // Jump back to the real first slide (index 0)
            currentIndex = 0;
            track.style.transform = 'translateX(0px)';
            // Force reflow to flush CSS changes
            void track.offsetWidth;
            // Transition will be re-enabled on next move
        }, { once: true });
    }
}

// Auto play
setInterval(moveToNextSlide, 3000);

// Recalculate slide width on resize
window.addEventListener('resize', () => {
    slideWidth = slides[0].getBoundingClientRect().width;
    // Also adjust current position to avoid misalignment during resize
    track.style.transition = 'none';
    track.style.transform = 'translateX(' + (-slideWidth * currentIndex) + 'px)';
});
