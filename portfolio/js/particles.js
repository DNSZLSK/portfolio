/* =============================================================================
   Particle System
   ============================================================================= */

class Particle {
    constructor(width, height) {
        this.reset(width, height);
    }
    
    reset(width, height) {
        this.radius = Math.random() * 2 + 1.5;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * PARTICLES_CONFIG.speed;
        this.vy = (Math.random() - 0.5) * PARTICLES_CONFIG.speed;
        this.parallaxFactor = Math.random() * 0.2 + 0.05;
    }
    
    update(width, height, pointer, parallaxOffset) {
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = PARTICLES_CONFIG.pointerRadius ** 2;
        
        if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (PARTICLES_CONFIG.pointerRadius - dist) / PARTICLES_CONFIG.pointerRadius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 2.5;
            this.y -= Math.sin(angle) * force * 2.5;
        }
        
        this.y = this.baseY - (parallaxOffset * this.parallaxFactor);
        this.x += this.vx;
        this.baseY += this.vy;
        
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.baseY < -10) this.baseY = height + 10;
        if (this.baseY > height + 10) this.baseY = -10;
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        this.particles = [];
        this.pointer = { x: -200, y: -200 };
        this.parallaxOffset = 0;
        this.isRunning = true;
        this.lastFrameTime = 0;
        this.frameInterval = DEVICE.isAndroidChrome ? 1000 / 30 : 1000 / 60;
        
        this.currentColors = null;
        this.targetColors = null;
        this.colorTransitionProgress = 1;
        this.colorTransitionDuration = 600;
        this.colorTransitionStart = 0;
        
        this.resize();
        this.createParticles();
        this.bindEvents();
    }
    
    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < PARTICLES_CONFIG.count; i++) {
            this.particles.push(new Particle(this.width, this.height));
        }
    }
    
    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            this.pointer.x = e.clientX;
            this.pointer.y = e.clientY;
        }, { passive: true });
        
        window.addEventListener('mouseleave', () => {
            this.pointer.x = -200;
            this.pointer.y = -200;
        }, { passive: true });
        
        let touchStartX = 0, touchStartY = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            this.pointer.x = touchStartX;
            this.pointer.y = touchStartY;
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            if (Math.abs(touch.clientX - touchStartX) < 20 && Math.abs(touch.clientY - touchStartY) < 20) {
                this.pointer.x = touch.clientX;
                this.pointer.y = touch.clientY;
            }
        }, { passive: true });
        
        window.addEventListener('touchend', () => {
            setTimeout(() => {
                this.pointer.x = -200;
                this.pointer.y = -200;
            }, 100);
        }, { passive: true });
        
        document.addEventListener('visibilitychange', () => {
            this.isRunning = !document.hidden;
        });
    }
    
    getRawColors() {
        const style = getComputedStyle(document.documentElement);
        const theme = document.body.dataset.theme;
        return {
            bg: theme === 'dark' ? [0, 0, 0] : [245, 245, 247],
            particleColor: this.parseRgba(style.getPropertyValue('--particle-color').trim()),
            particleGlow: style.getPropertyValue('--particle-glow').trim(),
            lineColor1: style.getPropertyValue('--line-color-1').trim(),
            lineColor2: style.getPropertyValue('--line-color-2').trim(),
            lineColor3: style.getPropertyValue('--line-color-3').trim()
        };
    }
    
    parseRgba(c) {
        const m = c.match(/[\d.]+/g);
        return m ? m.map(Number) : [255, 255, 255, 1];
    }
    
    lerp(a, b, p) { return a + (b - a) * p; }
    
    lerpColor(c1, c2, p) {
        return [
            Math.round(this.lerp(c1[0], c2[0], p)),
            Math.round(this.lerp(c1[1], c2[1], p)),
            Math.round(this.lerp(c1[2], c2[2], p))
        ];
    }
    
    easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    
    invalidateColorCache() {
        if (!this.currentColors) {
            this.currentColors = this.getRawColors();
            this.targetColors = this.currentColors;
            return;
        }
        this.targetColors = this.getRawColors();
        this.colorTransitionProgress = 0;
        this.colorTransitionStart = performance.now();
    }
    
    getColors() {
        if (!this.currentColors) {
            this.currentColors = this.getRawColors();
            this.targetColors = this.currentColors;
        }
        
        if (this.colorTransitionProgress < 1) {
            const elapsed = performance.now() - this.colorTransitionStart;
            this.colorTransitionProgress = Math.min(elapsed / this.colorTransitionDuration, 1);
            const ep = this.easeOutCubic(this.colorTransitionProgress);
            const bg = this.lerpColor(this.currentColors.bg, this.targetColors.bg, ep);
            
            if (this.colorTransitionProgress >= 1) {
                this.currentColors = this.targetColors;
            }
            
            return {
                bg: `rgb(${bg.join(',')})`,
                particleColor: `rgba(${this.targetColors.particleColor.join(',')})`,
                particleGlow: this.targetColors.particleGlow,
                lineColor1: this.targetColors.lineColor1,
                lineColor2: this.targetColors.lineColor2,
                lineColor3: this.targetColors.lineColor3
            };
        }
        
        return {
            bg: `rgb(${this.currentColors.bg.join(',')})`,
            particleColor: `rgba(${this.currentColors.particleColor.join(',')})`,
            particleGlow: this.currentColors.particleGlow,
            lineColor1: this.currentColors.lineColor1,
            lineColor2: this.currentColors.lineColor2,
            lineColor3: this.currentColors.lineColor3
        };
    }
    
    draw() {
        const ctx = this.ctx;
        const colors = this.getColors();
        const particles = this.particles;
        const len = particles.length;
        const maxDist = PARTICLES_CONFIG.maxDistance;
        const maxDistSq = maxDist * maxDist;
        const isSimple = DEVICE.isAndroidChrome || DEVICE.isMobile;
        
        for (let i = 0; i < len; i++) {
            particles[i].update(this.width, this.height, this.pointer, this.parallaxOffset);
        }
        
        ctx.lineWidth = 1;
        for (let a = 0; a < len; a++) {
            const pA = particles[a];
            for (let b = a + 1; b < len; b++) {
                const pB = particles[b];
                const dx = pA.x - pB.x;
                const dy = pA.y - pB.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < maxDistSq) {
                    const opacity = (1 - Math.sqrt(distSq) / maxDist) * 0.7;
                    
                    if (isSimple) {
                        ctx.strokeStyle = `rgba(${colors.lineColor1},${opacity})`;
                    } else {
                        const g = ctx.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
                        g.addColorStop(0, `rgba(${colors.lineColor1},${opacity})`);
                        g.addColorStop(0.5, `rgba(${colors.lineColor2},${opacity})`);
                        g.addColorStop(1, `rgba(${colors.lineColor3},${opacity})`);
                        ctx.strokeStyle = g;
                    }
                    
                    ctx.beginPath();
                    ctx.moveTo(pA.x, pA.y);
                    ctx.lineTo(pB.x, pB.y);
                    ctx.stroke();
                }
            }
        }
        
        if (!isSimple) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = colors.particleGlow;
        }
        
        ctx.fillStyle = colors.particleColor;
        for (let i = 0; i < len; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (!isSimple) ctx.shadowBlur = 0;
    }
    
    animate(timestamp = 0) {
        if (!this.isRunning) {
            requestAnimationFrame((ts) => this.animate(ts));
            return;
        }
        
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed < this.frameInterval) {
            requestAnimationFrame((ts) => this.animate(ts));
            return;
        }
        
        this.lastFrameTime = timestamp - (elapsed % this.frameInterval);
        
        const colors = this.getColors();
        this.ctx.fillStyle = colors.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.draw();
        
        requestAnimationFrame((ts) => this.animate(ts));
    }
    
    start() {
        this.animate();
    }
    
    pause() {
        this.isRunning = false;
    }
    
    resume() {
        this.isRunning = true;
    }
}
