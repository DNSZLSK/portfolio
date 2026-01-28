/* =============================================================================
   Main Application
   ============================================================================= */

// Global references
let particleSystem;
let carousel;
let projectsManager;


/* =============================================================================
   Toast Notifications
   ============================================================================= */

const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
    },

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <span class="toast__icon">${this.getIcon(type)}</span>
            <span class="toast__message">${message}</span>
        `;

        this.container.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            toast.classList.add('is-leaving');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    },

    getIcon(type) {
        const icons = {
            error: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            success: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        return icons[type] || icons.info;
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

/* =============================================================================
   Theme Management
   ============================================================================= */

const ThemeManager = {
    current: 'dark',
    
    init() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            this.current = saved;
            document.body.dataset.theme = saved;
        }
        
        document.getElementById('themeToggle').addEventListener('click', () => this.toggle());
    },
    
    toggle() {
        this.current = this.current === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = this.current;
        localStorage.setItem('theme', this.current);
        
        if (particleSystem) {
            particleSystem.invalidateColorCache();
        }
    }
};


/* =============================================================================
   Scroll Effects
   ============================================================================= */

const ScrollEffects = {
    hero: null,
    heroContent: null,
    scrollIndicator: null,
    lastScrollY: 0,
    ticking: false,
    
    init() {
        this.hero = document.getElementById('hero');
        this.heroContent = this.hero.querySelector('.hero__content');
        this.scrollIndicator = document.getElementById('scrollIndicator');
        
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        this.initSectionObserver();
    },
    
    onScroll() {
        this.lastScrollY = window.scrollY || window.pageYOffset;
        
        // Update parallax offset for particles
        if (particleSystem && window.innerWidth > 768) {
            particleSystem.parallaxOffset = this.lastScrollY * PARTICLES_CONFIG.parallaxFactor;
        }
        
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateHero());
            this.ticking = true;
        }
    },
    
    updateHero() {
        const heroHeight = window.innerHeight;
        const scrollProgress = Math.min(this.lastScrollY / (heroHeight * 0.8), 1);
        const easedProgress = 1 - Math.pow(1 - scrollProgress, 2);
        
        this.heroContent.style.opacity = 1 - easedProgress;
        this.scrollIndicator.style.opacity = Math.max(0, 1 - (scrollProgress * 1.5));
        this.hero.style.visibility = easedProgress >= 0.99 ? 'hidden' : 'visible';
        
        this.ticking = false;
    },
    
    initSectionObserver() {
        const sections = document.querySelectorAll('.section--fade');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const rect = entry.boundingClientRect;
                const vh = window.innerHeight;
                
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    entry.target.classList.remove('is-fading-out');
                } else {
                    if (rect.bottom < vh * 0.2) {
                        entry.target.classList.add('is-fading-out');
                        entry.target.classList.remove('is-visible');
                    } else if (rect.top > vh * 0.8) {
                        entry.target.classList.remove('is-visible', 'is-fading-out');
                    }
                }
            });
        }, {
            threshold: [0, 0.1, 0.3, 0.5, 1],
            rootMargin: '-5% 0px'
        });
        
        sections.forEach(s => observer.observe(s));
    }
};


/* =============================================================================
   Contact Modal
   ============================================================================= */

const ContactModal = {
    modal: null,
    form: null,
    successMessage: null,
    submitBtn: null,
    
    init() {
        this.modal = document.getElementById('contactModal');
        this.form = document.getElementById('contactForm');
        this.successMessage = document.getElementById('successMessage');
        this.submitBtn = document.getElementById('submitBtn');
        
        // Open button
        document.getElementById('contactBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.open();
        });
        
        // Close button
        this.modal.querySelector('.modal__close').addEventListener('click', () => this.close());
        
        // Backdrop click
        this.modal.querySelector('.modal__backdrop').addEventListener('click', () => this.close());
        
        // Form submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },
    
    open() {
        this.modal.classList.add('is-active');
        if (particleSystem) particleSystem.pause();
    },
    
    close() {
        this.modal.classList.remove('is-active');
        this.successMessage.classList.remove('is-visible');
        this.form.reset();
        if (particleSystem) particleSystem.resume();
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Envoi...';
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMING.FETCH_TIMEOUT);
            
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(this.form))),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await response.json();
            
            if (data.success) {
                this.successMessage.classList.add('is-visible');
                this.form.reset();
                setTimeout(() => this.close(), TIMING.SUCCESS_MESSAGE_DURATION);
            } else {
                throw new Error('Submit failed');
            }
            
        } catch (e) {
            Toast.error('Erreur lors de l\'envoi. Veuillez réessayer.');
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Envoyer';
        }
    }
};


/* =============================================================================
   Keyboard Navigation
   ============================================================================= */

const KeyboardNav = {
    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ContactModal.close();
                if (ideViewer) ideViewer.close();
                if (webViewer) webViewer.close();
            }
        });
    }
};


/* =============================================================================
   Resize Handler
   ============================================================================= */

const ResizeHandler = {
    timeout: null,
    
    init() {
        window.addEventListener('resize', () => this.onResize(), { passive: true });
        window.addEventListener('orientationchange', () => this.onOrientationChange());
    },
    
    onResize() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (particleSystem) particleSystem.resize();
        }, TIMING.RESIZE_DEBOUNCE);
    },
    
    onOrientationChange() {
        setTimeout(() => {
            window.scrollTo(0, 0);
            if (particleSystem) particleSystem.resize();
        }, TIMING.ORIENTATION_DELAY);
    }
};


/* =============================================================================
   Initialize Application
   ============================================================================= */

function init() {
    // Reset scroll
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    // Initialize modules
    Toast.init();
    ThemeManager.init();
    
    // Particle system
    const canvas = document.getElementById('bgCanvas');
    particleSystem = new ParticleSystem(canvas);
    particleSystem.start();
    window.particleSystem = particleSystem;
    
    // Carousel
    carousel = new TechCarousel(document.getElementById('techCarousel'));
    
    // Projects
    ideViewer = new IDEViewer();
    webViewer = new WebViewer();
    projectsManager = new ProjectsManager();
    window.projectsManager = projectsManager;
    window.Toast = Toast;
    
    // Other modules
    ScrollEffects.init();
    ContactModal.init();
    KeyboardNav.init();
    ResizeHandler.init();
    
    // Preload code after delay
    setTimeout(() => {
        projectsManager.preloadCode();
    }, TIMING.CODE_PRELOAD_DELAY);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Ensure scroll position on full load
window.addEventListener('load', () => window.scrollTo(0, 0));
