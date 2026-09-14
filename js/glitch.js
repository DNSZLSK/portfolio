/* =============================================================================
   Glitch

   Le mot est découpé en tranches horizontales fines et contiguës. Au repos
   elles sont toutes alignées : le titre est net, on ne voit rien. Par
   intermittence, une rafale courte déplace au hasard une partie des tranches,
   change leur encre et en fait disparaître certaines, puis tout se recale.

   Trois principes pour que ça reste pro :
   - le repos est propre, le glitch n'est pas un état mais un accident ;
   - les rafales sont brèves (moins d'un demi-tiers de seconde) et espacées
     de façon aléatoire, donc jamais perçues comme une boucle ;
   - le hasard est régénéré à chaque rafale, il n'y a pas deux fois le
     même décrochage.

   Le texte d'origine reste dans le DOM, rendu transparent : la mesure, la
   sélection et les lecteurs d'écran continuent de le voir.
   ============================================================================= */

const Glitch = {
    SLICES: 18,
    CALM: [4200, 13000],   // attente entre deux rafales, en ms
    FRAMES: [3, 8],        // nombre d'images par rafale
    HOLD: [26, 82],        // durée d'une image, en ms

    // Les encres de la quadri, plus le blanc du papier pour les disparitions.
    INKS: ['#00c8d7', '#e8007a', '#f0b400', 'var(--ink)', 'var(--ink)', 'var(--ink)'],

    rand(range) {
        return range[0] + Math.random() * (range[1] - range[0]);
    },

    init() {
        this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.querySelectorAll('.cover__line--glitch').forEach((line) => this.build(line));
    },

    build(line) {
        const text = line.dataset.t || line.textContent;
        const bands = [];

        // Des tranches de hauteurs inégales : une découpe régulière se lit
        // comme une grille, pas comme un signal abîmé.
        let edge = 0;
        for (let i = 0; i < this.SLICES; i += 1) {
            const remaining = this.SLICES - i;
            const height = i === this.SLICES - 1
                ? 100 - edge
                : Math.max(1.6, (100 - edge) / remaining * (0.45 + Math.random() * 1.25));
            const top = edge;
            const bottom = Math.max(0, 100 - (edge + height));
            edge = Math.min(100, edge + height);

            const band = document.createElement('i');
            band.className = 'cover__band';
            band.setAttribute('aria-hidden', 'true');
            band.textContent = text;
            band.style.clipPath = `inset(${top.toFixed(2)}% 0 ${bottom.toFixed(2)}% 0)`;
            line.appendChild(band);
            bands.push(band);
        }

        line.classList.add('is-sliced');
        this.followPointer(line, bands);

        if (this.reduced) return;
        line.classList.add('is-live');
        this.schedule(line, bands);
    },

    schedule(line, bands) {
        setTimeout(() => this.burst(line, bands), this.rand(this.CALM));
    },

    burst(line, bands) {
        const frames = Math.round(this.rand(this.FRAMES));
        line.classList.add('is-bursting');

        let i = 0;
        const step = () => {
            if (i >= frames) {
                this.rest(line, bands);
                this.schedule(line, bands);
                return;
            }
            this.frame(bands);
            i += 1;
            setTimeout(step, this.rand(this.HOLD));
        };
        step();
    },

    /** Une image de rafale : chaque tranche est tirée au sort indépendamment. */
    frame(bands) {
        // L'amplitude varie d'une image à l'autre : certaines sont à peine
        // perceptibles, d'autres franches. C'est ce contraste qui fait le sale.
        const power = 0.05 + Math.random() * 0.4;

        bands.forEach((band) => {
            const roll = Math.random();

            if (roll < 0.42) {
                // Tranche intacte : il en faut, sinon le mot devient illisible.
                band.style.transform = 'translate(0, 0)';
                band.style.color = '';
                band.style.opacity = '1';
                return;
            }

            const dx = (Math.random() - 0.5) * 2 * power;
            const dy = (Math.random() - 0.5) * 0.03;
            band.style.transform = `translate(${dx.toFixed(3)}em, ${dy.toFixed(3)}em)`;
            band.style.color = roll > 0.72 ? this.INKS[(Math.random() * this.INKS.length) | 0] : '';
            band.style.opacity = roll > 0.94 ? '0' : '1';
        });
    },

    rest(line, bands) {
        line.classList.remove('is-bursting');
        bands.forEach((band) => {
            band.style.transform = '';
            band.style.color = '';
            band.style.opacity = '';
        });
    },

    /**
     * Hors rafale, le titre suit le curseur : chaque tranche se décale de son
     * propre coefficient, donc le mot se désaligne au passage de la souris et
     * se recale quand elle s'éloigne.
     */
    followPointer(line, bands) {
        if (this.reduced) return;

        // Reserve au vrai pointeur. Sur ecran tactile, pointermove se declenche
        // au toucher mais pointerleave ne vient jamais : les bandes restaient
        // decalees jusqu'au rechargement de la page, y compris apres rotation.
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const host = line.closest('.cover__title');
        if (!host) return;

        let raf = null;
        let target = 0;

        const draw = () => {
            raf = null;
            if (line.classList.contains('is-bursting')) return;
            bands.forEach((band, i) => {
                const k = (i % 2 ? -1 : 1) * (0.25 + (i % 5) * 0.3);
                band.style.setProperty('--pull', (target * k).toFixed(3) + 'em');
            });
        };
        const schedule = () => { if (raf === null) raf = requestAnimationFrame(draw); };

        host.addEventListener('pointerenter', () => line.classList.add('is-pulling'), { passive: true });

        host.addEventListener('pointermove', (e) => {
            const r = line.getBoundingClientRect();
            target = ((e.clientX - r.left) / r.width - 0.5) * 0.34;
            line.classList.add('is-pulling');
            schedule();
        }, { passive: true });

        // Tout ce qui interrompt le geste doit remettre les bandes a plat,
        // sinon un decalage survit a l'evenement qui l'a provoque.
        const release = () => {
            target = 0;
            schedule();
            line.classList.remove('is-pulling');
        };
        ['pointerleave', 'pointercancel', 'pointerup', 'blur'].forEach((evt) => {
            host.addEventListener(evt, release, { passive: true });
        });
        ['resize', 'orientationchange'].forEach((evt) => {
            window.addEventListener(evt, release, { passive: true });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Glitch.init());
