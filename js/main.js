/* =============================================================================
   Main Application
   ============================================================================= */

// Global references
let particleSystem;
let carousel;
let projectsManager;


/* =============================================================================
   Fetch with Timeout Utility
   ============================================================================= */

async function fetchWithTimeout(url, options = {}, timeout = TIMING.FETCH_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}


/* =============================================================================
   Focus Trap for Modals (Accessibility)
   ============================================================================= */

const FocusTrap = {
    activeElement: null,
    currentModal: null,

    activate(modal) {
        this.activeElement = document.activeElement;
        this.currentModal = modal;

        const focusable = this.getFocusableElements(modal);
        if (focusable.length > 0) {
            focusable[0].focus();
        }

        document.addEventListener('keydown', this.handleKeyDown);
    },

    deactivate() {
        document.removeEventListener('keydown', this.handleKeyDown);

        if (this.activeElement && this.activeElement.focus) {
            this.activeElement.focus();
        }

        this.currentModal = null;
        this.activeElement = null;
    },

    getFocusableElements(container) {
        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        return Array.from(container.querySelectorAll(selectors))
            .filter(el => el.offsetParent !== null); // Visible elements only
    },

    handleKeyDown: function(e) {
        if (e.key !== 'Tab' || !FocusTrap.currentModal) return;

        const focusable = FocusTrap.getFocusableElements(FocusTrap.currentModal);
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
            // Shift + Tab: if on first element, go to last
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab: if on last element, go to first
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
};


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
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

        const iconSpan = document.createElement('span');
        iconSpan.className = 'toast__icon';
        iconSpan.innerHTML = this.getIcon(type);

        const msgSpan = document.createElement('span');
        msgSpan.className = 'toast__message';
        msgSpan.textContent = message;

        toast.append(iconSpan, msgSpan);

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
    aboutSection: null,
    aboutWindow: null,
    projectsSection: null,
    lastScrollY: 0,
    ticking: false,
    cachedVh: 0,
    // Last applied values (avoid redundant DOM writes)
    lastHeroOpacity: -1,
    lastAboutOpacity: -1,
    lastAboutTranslate: -1,
    lastProjectsTranslate: -1,
    lastHeroVisible: null,
    lastAboutVisible: null,

    init() {
        this.hero = document.getElementById('hero');
        this.heroContent = this.hero.querySelector('.hero__content');
        this.scrollIndicator = document.getElementById('scrollIndicator');
        this.aboutSection = document.getElementById('about');
        this.aboutWindow = this.aboutSection ? this.aboutSection.querySelector('.about__window') : null;
        this.projectsSection = document.getElementById('projects');

        this.cachedVh = window.innerHeight;

        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => {
            this.cachedVh = window.innerHeight;
            this.scheduleUpdate();
        }, { passive: true });
        document.addEventListener('era:changed', () => this.scheduleUpdate(true));

        this.initSectionObserver();
        this.scheduleUpdate(true);
    },

    onScroll() {
        this.lastScrollY = window.scrollY || window.pageYOffset;

        if (particleSystem && window.innerWidth > 768) {
            particleSystem.parallaxOffset = this.lastScrollY * PARTICLES_CONFIG.parallaxFactor;
        }

        this.scheduleUpdate();
    },

    scheduleUpdate(force) {
        if (this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(() => {
            if (force) this.invalidateCache();
            this.updateHero();
            this.updateAbout();
            this.updateProjects();
            this.ticking = false;
        });
    },

    invalidateCache() {
        this.lastHeroOpacity = -1;
        this.lastAboutOpacity = -1;
        this.lastAboutTranslate = -1;
        this.lastProjectsTranslate = -1;
        this.lastHeroVisible = null;
        this.lastAboutVisible = null;
    },

    /** Smoothstep easing: 3t^2 - 2t^3, smooth ease-in-ease-out on [0,1]. */
    ease(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        return t * t * (3 - 2 * t);
    },

    /**
     * In retro mode the hero fades over a longer range so its disappearance
     * synchronizes with the about's rise.
     */
    updateHero() {
        const vh = this.cachedVh;
        const isRetro = document.body.dataset.era === 'past';
        const fadeRange = isRetro ? vh : (vh * 0.8);
        const progress = Math.min(this.lastScrollY / fadeRange, 1);
        const eased = this.ease(progress);

        const opacity = 1 - eased;
        const indicatorOpacity = Math.max(0, 1 - (progress * 1.5));
        const visible = eased < 0.99;

        if (opacity !== this.lastHeroOpacity) {
            this.heroContent.style.opacity = opacity;
            this.scrollIndicator.style.opacity = indicatorOpacity;
            this.lastHeroOpacity = opacity;
        }
        if (visible !== this.lastHeroVisible) {
            this.hero.style.visibility = visible ? 'visible' : 'hidden';
            this.lastHeroVisible = visible;
        }
    },

    /**
     * Retro mode: 3-section choreography where each section's transition
     * synchronizes with the next. Timeline (scrollY in vh from document top):
     *
     *     0   -> 100vh : hero fades out  +  about slides up & fades in   (handoff #1)
     *   100vh -> 150vh: about locked at center, opaque backdrop          (50vh read pause)
     *   150vh -> 250vh: about fades out  +  projects slides up           (handoff #2)
     *   250vh+        : projects settled at its natural document position
     *
     * about-spacer is 150vh, putting projects' natural top at scrollY = 250vh.
     * The lock is kept short (50vh) so the perceived scroll rate stays
     * uniform with the surrounding transitions.
     */
    updateAbout() {
        if (!this.aboutWindow || !this.aboutSection) return;

        if (document.body.dataset.era !== 'past') {
            if (this.lastAboutOpacity !== -1 || this.aboutSection.style.opacity) {
                this.aboutSection.style.opacity = '';
                this.aboutSection.style.visibility = '';
                this.aboutWindow.style.transform = '';
                this.lastAboutOpacity = -1;
                this.lastAboutTranslate = -1;
                this.lastAboutVisible = null;
            }
            return;
        }

        const vh = this.cachedVh;
        const lockY = vh;
        const releaseY = 1.5 * vh;
        const endY = 2.5 * vh;

        const y = this.lastScrollY;
        let translatePx;
        let opacity;

        if (y < 0) {
            translatePx = vh;
            opacity = 0;
        } else if (y < lockY) {
            const eased = this.ease(y / lockY);
            translatePx = vh * (1 - eased);
            opacity = eased;
        } else if (y < releaseY) {
            translatePx = 0;
            opacity = 1;
        } else if (y < endY) {
            const eased = this.ease((y - releaseY) / (endY - releaseY));
            translatePx = 0;
            opacity = 1 - eased;
        } else {
            translatePx = 0;
            opacity = 0;
        }

        const translateRounded = Math.round(translatePx);
        if (translateRounded !== this.lastAboutTranslate) {
            this.aboutWindow.style.transform = `translate3d(0, ${translateRounded}px, 0)`;
            this.lastAboutTranslate = translateRounded;
        }
        const opacityRounded = Math.round(opacity * 1000) / 1000;
        if (opacityRounded !== this.lastAboutOpacity) {
            this.aboutSection.style.opacity = opacityRounded;
            this.lastAboutOpacity = opacityRounded;
        }
        const visible = opacityRounded > 0.005;
        if (visible !== this.lastAboutVisible) {
            this.aboutSection.style.visibility = visible ? 'visible' : 'hidden';
            this.lastAboutVisible = visible;
        }
    },

    /**
     * Retro mode: projects slides UP from below the viewport during the
     * about's fade-out, reaching its natural document position by
     * scrollY = 250vh. After that, projects scrolls naturally.
     */
    updateProjects() {
        if (!this.projectsSection) return;

        if (document.body.dataset.era !== 'past') {
            if (this.lastProjectsTranslate !== -1 || this.projectsSection.style.transform) {
                this.projectsSection.style.transform = '';
                this.lastProjectsTranslate = -1;
            }
            return;
        }

        const vh = this.cachedVh;
        const startY = 1.5 * vh;
        const endY = 2.5 * vh;

        const y = this.lastScrollY;
        let translatePx;

        if (y < startY) {
            translatePx = vh;
        } else if (y < endY) {
            const eased = this.ease((y - startY) / (endY - startY));
            translatePx = vh * (1 - eased);
        } else {
            translatePx = 0;
        }

        const translateRounded = Math.round(translatePx);
        if (translateRounded !== this.lastProjectsTranslate) {
            this.projectsSection.style.transform = `translate3d(0, ${translateRounded}px, 0)`;
            this.lastProjectsTranslate = translateRounded;
        }
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
    honeypot: null,
    lastSubmitTime: 0,

    init() {
        this.modal = document.getElementById('contactModal');
        this.form = document.getElementById('contactForm');
        this.successMessage = document.getElementById('successMessage');
        this.submitBtn = document.getElementById('submitBtn');
        this.honeypot = document.getElementById('website');

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
        document.body.style.overflow = 'hidden';
        if (particleSystem) particleSystem.pause();
        FocusTrap.activate(this.modal.querySelector('.modal__content'));
    },

    close() {
        this.modal.classList.remove('is-active');
        document.body.style.overflow = '';
        this.successMessage.classList.remove('is-visible');
        this.form.reset();
        FocusTrap.deactivate();
        if (particleSystem) particleSystem.resume();
    },

    async handleSubmit(e) {
        e.preventDefault();

        // Cooldown check (5s between submissions)
        const now = Date.now();
        if (now - this.lastSubmitTime < 5000) {
            Toast.info('Veuillez patienter avant de renvoyer.');
            return;
        }
        this.lastSubmitTime = now;

        // Honeypot check - if filled, it's a bot
        if (this.honeypot && this.honeypot.value) {
            // Silently reject but pretend success to fool bots
            this.successMessage.classList.add('is-visible');
            this.form.reset();
            setTimeout(() => this.close(), TIMING.SUCCESS_MESSAGE_DURATION);
            return;
        }

        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Envoi...';

        try {
            const formData = Object.fromEntries(new FormData(this.form));
            // Remove honeypot from submission
            delete formData.website;

            const response = await fetchWithTimeout('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

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
    EraManager.init();
    EraManager.bindAmbientClicks();

    // Reveal mute button only when in past era; keep in sync via event
    const updateMuteVisibility = () => {
        const muteBtn = document.getElementById('eraMute');
        if (!muteBtn) return;
        muteBtn.hidden = document.body.dataset.era !== 'past';
    };
    updateMuteVisibility();
    document.addEventListener('era:changed', updateMuteVisibility);

    // In retro mode the canvas particles are invisible (opacity:0), so we
    // pause the canvas rAF loop. The carousel keeps animating in both modes
    // (the horizontal scroll keeps the tree-view feeling alive).
    const applyEraPerformance = () => {
        const isRetro = document.body.dataset.era === 'past';
        if (particleSystem) {
            if (isRetro) particleSystem.pause();
            else particleSystem.resume();
        }
    };
    document.addEventListener('era:changed', applyEraPerformance);
    
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

    // Apply initial era performance gate (after carousel has finished its
    // 100ms init delay so a stop() actually catches the running animation).
    setTimeout(applyEraPerformance, TIMING.CAROUSEL_INIT_DELAY + 50);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Ensure scroll position on full load
window.addEventListener('load', () => window.scrollTo(0, 0));
