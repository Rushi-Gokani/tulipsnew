class ProductAutoScroll {
  constructor() {
    this.swiperInstance = null;
    this.autoScrollEnabled = false;
    this.autoScrollDelay = 4000; // 4 seconds default
    this.pauseOnHover = true;
    this.autoScrollInterval = null;
    this.currentSlideIndex = 0;
    this.totalSlides = 0;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupAutoScroll());
    } else {
      this.setupAutoScroll();
    }
  }

  setupAutoScroll() {
    // Find the product gallery swiper instance
    const productGallery = document.querySelector('swiper-product-gallery');
    if (!productGallery) return;

    // Get settings from data attributes or theme settings
    this.autoScrollEnabled = productGallery.hasAttribute('data-auto-scroll');
    this.autoScrollDelay = parseInt(productGallery.getAttribute('data-auto-scroll-delay')) || 4000;
    this.pauseOnHover = productGallery.getAttribute('data-pause-on-hover') !== 'false';

    if (!this.autoScrollEnabled) return;

    // Wait for Swiper to be initialized
    this.waitForSwiper(productGallery);
  }

  waitForSwiper(productGallery) {
    const checkSwiper = () => {
      if (productGallery.instance && productGallery.instance.swiper) {
        this.swiperInstance = productGallery.instance.swiper;
        this.totalSlides = this.swiperInstance.slides.length;
        
        if (this.totalSlides > 1) {
          this.startAutoScroll();
          this.setupEventListeners();
        }
      } else {
        setTimeout(checkSwiper, 100);
      }
    };
    
    checkSwiper();
  }

  startAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }

    this.autoScrollInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoScrollDelay);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  nextSlide() {
    if (!this.swiperInstance) return;

    const nextIndex = (this.currentSlideIndex + 1) % this.totalSlides;
    this.swiperInstance.slideTo(nextIndex);
    this.currentSlideIndex = nextIndex;
  }

  setupEventListeners() {
    if (!this.swiperInstance) return;

    const galleryElement = this.swiperInstance.el;

    // Pause on hover
    if (this.pauseOnHover) {
      galleryElement.addEventListener('mouseenter', () => {
        this.stopAutoScroll();
      });

      galleryElement.addEventListener('mouseleave', () => {
        this.startAutoScroll();
      });
    }

    // Pause on touch/click
    galleryElement.addEventListener('touchstart', () => {
      this.stopAutoScroll();
    });

    galleryElement.addEventListener('click', () => {
      this.stopAutoScroll();
      // Resume after a delay
      setTimeout(() => {
        this.startAutoScroll();
      }, 2000);
    });

    // Update current slide index when swiper changes
    this.swiperInstance.on('slideChange', () => {
      this.currentSlideIndex = this.swiperInstance.activeIndex;
    });

    // Pause on keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        this.stopAutoScroll();
        setTimeout(() => {
          this.startAutoScroll();
        }, 3000);
      }
    });
  }

  // Public methods for external control
  enable() {
    this.autoScrollEnabled = true;
    this.startAutoScroll();
  }

  disable() {
    this.autoScrollEnabled = false;
    this.stopAutoScroll();
  }

  setDelay(delay) {
    this.autoScrollDelay = delay;
    if (this.autoScrollEnabled) {
      this.startAutoScroll();
    }
  }

  setPauseOnHover(pause) {
    this.pauseOnHover = pause;
  }
}

// Initialize auto-scroll when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if auto-scroll is enabled in theme settings
  const productGallery = document.querySelector('swiper-product-gallery');
  if (productGallery && productGallery.hasAttribute('data-auto-scroll')) {
    new ProductAutoScroll();
  }
});

// Export for potential external use
window.ProductAutoScroll = ProductAutoScroll; 