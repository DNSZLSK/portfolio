/* =============================================================================
   Tech Carousel
   ============================================================================= */

class TechCarousel {
    constructor(container) {
        this.container = container;
        this.track = null;
        this.position = 0;
        this.speed = 0.3;
        this.setWidth = 0;
        this.animationId = null;
        this.isPaused = false;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        // Create track
        this.track = document.createElement('div');
        this.track.className = 'carousel__track';
        this.container.appendChild(this.track);
        
        // Duplicate items for seamless loop
        for (let i = 0; i < 2; i++) {
            TECH_STACK.forEach(tech => {
                const item = this.createItem(tech);
                this.track.appendChild(item);
            });
        }
        
        // Calculate dimensions after DOM update
        setTimeout(() => this.calculateDimensions(), TIMING.CAROUSEL_INIT_DELAY);
    }
    
    createItem(tech) {
        const item = document.createElement('div');
        item.className = 'carousel__item';
        
        const logo = document.createElement('img');
        logo.src = tech.src;
        logo.alt = tech.label;
        logo.className = `carousel__logo ${tech.mastered ? 'carousel__logo--mastered' : 'carousel__logo--learning'}`;
        
        const label = document.createElement('span');
        label.className = 'carousel__label';
        label.textContent = tech.label;
        
        item.appendChild(logo);
        item.appendChild(label);
        
        return item;
    }
    
    calculateDimensions() {
        const firstItem = this.track.firstElementChild;
        if (!firstItem) return;
        
        const computedStyle = window.getComputedStyle(this.track);
        const gap = parseFloat(computedStyle.gap) || 32;
        const itemWidth = firstItem.offsetWidth;
        
        this.setWidth = (itemWidth + gap) * TECH_STACK.length;
        this.start();
    }
    
    start() {
        if (this.animationId) return;
        
        const animate = () => {
            if (!this.isPaused) {
                this.position -= this.speed;
                
                if (Math.abs(this.position) >= this.setWidth) {
                    this.position = 0;
                }
                
                this.track.style.transform = `translateX(${this.position}px)`;
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
}
