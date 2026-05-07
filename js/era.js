/* =============================================================================
   Era Management (Past / Present)
   Past mode: Ghidra / Java Swing aesthetic. Sounds are synthesized via
   Web Audio so we don't depend on external WAV assets.
   ============================================================================= */

const EraManager = {
    current: 'past',
    soundEnabled: true,
    audioCtx: null,

    init() {
        const toggle = document.getElementById('eraToggle');
        const toggleEnabled = toggle && !toggle.hidden;

        if (toggleEnabled) {
            // Toggle is live: respect the user's last choice.
            const saved = localStorage.getItem('era');
            if (saved === 'past' || saved === 'present') {
                this.current = saved;
            }
        } else {
            // Toggle is on stand-by: lock to past and clear any stale value
            // so existing visitors get the new default.
            this.current = 'past';
            localStorage.removeItem('era');
        }

        document.body.dataset.era = this.current;

        const savedSound = localStorage.getItem('eraSound');
        if (savedSound === 'off') this.soundEnabled = false;

        if (toggle) {
            toggle.setAttribute('aria-pressed', this.current === 'past' ? 'true' : 'false');
            toggle.addEventListener('click', () => this.toggle());
        }

        const muteBtn = document.getElementById('eraMute');
        if (muteBtn) {
            muteBtn.setAttribute('aria-pressed', this.soundEnabled ? 'false' : 'true');
            muteBtn.classList.toggle('is-muted', !this.soundEnabled);
            muteBtn.addEventListener('click', () => this.toggleSound());
        }
    },

    ensureCtx() {
        if (this.audioCtx) return this.audioCtx;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        try {
            this.audioCtx = new Ctx();
        } catch (e) {
            return null;
        }
        return this.audioCtx;
    },

    /**
     * Synth a short "tick" or "beep" - one of: "click", "toggle", "boot".
     * All sounds are synthesized on the fly with WebAudio.
     */
    synth(kind) {
        const ctx = this.ensureCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        const now = ctx.currentTime;

        if (kind === 'click') {
            // Tiny system tick: ~30ms square wave
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1800, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.06, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (kind === 'toggle') {
            // Two-tone descending blip (~140ms)
            [880, 660].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                const t = now + i * 0.07;
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(0.1, t + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 0.07);
            });
        } else if (kind === 'boot') {
            // Win98-ish ascending bootup: three rising tones with reverb-like decay
            const tones = [
                { f: 440, dur: 0.18, t: 0 },
                { f: 660, dur: 0.18, t: 0.15 },
                { f: 880, dur: 0.30, t: 0.30 }
            ];
            tones.forEach(({ f, dur, t }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                const start = now + t;
                osc.frequency.setValueAtTime(f, start);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
                osc.connect(gain).connect(ctx.destination);
                osc.start(start);
                osc.stop(start + dur + 0.05);
            });
        }
    },

    play(kind) {
        if (!this.soundEnabled) return;
        if (document.body.dataset.era !== 'past') return;
        this.synth(kind);
    },

    /** Same as play() but ignores the era guard - used during a transition where era is mid-flip. */
    playUnconditional(kind) {
        if (!this.soundEnabled) return;
        this.synth(kind);
    },

    toggle() {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const next = this.current === 'past' ? 'present' : 'past';

        if (next === 'past') {
            this.playUnconditional('boot');
        } else {
            this.playUnconditional('toggle');
        }

        if (!reduced) {
            this.scanlineTransition(next);
        } else {
            this.applyEra(next);
        }
    },

    scanlineTransition(next) {
        const overlay = document.createElement('div');
        overlay.className = 'era-transition';
        document.body.appendChild(overlay);

        // Force reflow then trigger animation
        // eslint-disable-next-line no-unused-expressions
        overlay.offsetHeight;
        overlay.classList.add('is-active');

        setTimeout(() => this.applyEra(next), 250);

        setTimeout(() => {
            overlay.classList.remove('is-active');
            overlay.classList.add('is-leaving');
        }, 400);

        setTimeout(() => overlay.remove(), 800);
    },

    applyEra(value) {
        this.current = value;
        document.body.dataset.era = value;
        localStorage.setItem('era', value);

        const toggle = document.getElementById('eraToggle');
        if (toggle) toggle.setAttribute('aria-pressed', value === 'past' ? 'true' : 'false');

        document.dispatchEvent(new CustomEvent('era:changed', { detail: { era: value } }));
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('eraSound', this.soundEnabled ? 'on' : 'off');

        const muteBtn = document.getElementById('eraMute');
        if (muteBtn) {
            muteBtn.setAttribute('aria-pressed', this.soundEnabled ? 'false' : 'true');
            muteBtn.classList.toggle('is-muted', !this.soundEnabled);
        }

        if (this.soundEnabled) this.play('click');
    },

    bindAmbientClicks() {
        document.addEventListener('click', (e) => {
            if (document.body.dataset.era !== 'past') return;
            const target = e.target.closest(
                'button, .filter-btn, .nav__link, .project-card, .ide__btn, .browser__btn, .form__submit'
            );
            if (target) this.play('click');
        }, true);
    }
};
