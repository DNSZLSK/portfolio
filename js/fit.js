/* =============================================================================
   Fit
   Chaque ligne du titre est dimensionnée pour occuper exactement la largeur
   du bloc. Les longueurs de mots étant différentes, les corps le deviennent
   aussi : le titre forme un pavé plein, calé à gauche et à droite.
   Le CSS garde une taille de repli, donc si ce script ne tourne pas le
   titre reste lisible, simplement pas justifié.
   ============================================================================= */

const FitLines = {
    REF: 100, // corps de mesure, en px

    init() {
        this.lines = Array.from(document.querySelectorAll('[data-fit] .cover__line'));
        if (!this.lines.length) return;

        this.apply();

        // Les corps mesurés avec la fonte de repli seraient faux : on attend
        // qu'Archivo Black soit réellement chargée avant de figer les tailles.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => this.apply());
        }

        // Sur telephone, la rotation est le cas fragile : iOS declenche le
        // redimensionnement AVANT d'avoir fini de recalculer la page, donc une
        // seule mesure tombe sur des dimensions perimees et le titre reste
        // calibre pour l'orientation precedente. On remesure donc plusieurs
        // fois apres l'evenement, jusqu'a ce que la page soit stabilisee.
        const settle = () => {
            [0, 120, 320, 650].forEach((d) => setTimeout(() => this.apply(), d));
        };

        let t;
        const onResize = () => {
            clearTimeout(t);
            t = setTimeout(settle, 60);
        };

        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('orientationchange', settle, { passive: true });
        window.addEventListener('load', settle, { passive: true });

        // La fenetre visuelle bouge sans declencher resize quand la barre
        // d'adresse se retracte : c'est elle qui fait foi sur mobile.
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', onResize, { passive: true });
        }
    },

    apply() {
        const host = this.lines[0].parentElement;
        const width = host.clientWidth;
        if (!width) return;

        // 1. Mise à la largeur : chaque ligne occupe la mesure.
        //    Le 0.996 laisse un cheveu de marge, sinon les débords de chasse
        //    des glyphes font déborder le bloc d'un ou deux pixels.
        this.lines.forEach((line) => {
            line.style.display = 'inline-block';
            line.style.fontSize = this.REF + 'px';
            const natural = line.getBoundingClientRect().width;
            line.style.display = '';
            if (!natural) return;
            line.style.fontSize = (this.REF * width * 0.996 / natural).toFixed(2) + 'px';
        });

        // 2. Plafond en hauteur. En paysage sur un téléphone, la fenêtre fait
        //    390px de haut : un titre calé sur la largeur déborderait sous
        //    l'invite. On calcule un facteur unique à partir de la place
        //    réellement disponible entre l'accroche et l'invite, et on
        //    l'applique d'un coup : pas de boucle, pas de mesure de hauteur
        //    globale qui s'est révélée peu fiable.
        const line = this.lines[0];
        const cs = getComputedStyle(line);
        const lh = (parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)) || 0.9;

        //    La place se mesure dans le bloc qui contient le titre, pas entre
        //    l'accroche et l'invite : le titre y est centré, donc il déborde
        //    de son conteneur bien avant d'atteindre l'invite.
        const main = host.parentElement;
        if (!main) return;

        let avail = main.clientHeight - 14;
        Array.from(main.children).forEach((child) => {
            if (child !== host) avail -= child.getBoundingClientRect().height;
        });
        if (avail <= 0) return;

        //    L'interlignage serré fait dépasser les glyphes de leur propre
        //    boîte : le navigateur mesure moins que ce que l'encre occupe.
        //    On compte donc au moins un cadratin par ligne, sinon la
        //    réduction se déclenche trop tard.
        const ink = Math.max(lh, 1.02);
        const total = this.lines.reduce((sum, l) => sum + (parseFloat(l.style.fontSize) || 0), 0) * ink;
        if (total <= avail) return;

        const k = avail / total;
        this.lines.forEach((l) => {
            const current = parseFloat(l.style.fontSize);
            if (current) l.style.fontSize = (current * k).toFixed(2) + 'px';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => FitLines.init());
