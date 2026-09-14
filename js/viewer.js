/* =============================================================================
   Viewer
   'web'  : le projet dans un cadre.
   'code' : le fichier source récupéré chez GitLab et affiché en listing.
   Le code est inséré en textContent, jamais en innerHTML : on affiche du
   code source distant, il ne doit jamais pouvoir s'exécuter ici.
   ============================================================================= */

const Viewer = {
    cache: new Map(),

    init() {
        this.el = document.getElementById('viewer');
        if (!this.el) return;
        this.cat = document.getElementById('viewerCat');
        this.title = document.getElementById('viewerTitle');
        this.file = document.getElementById('viewerFile');
        this.repo = document.getElementById('viewerRepo');
        this.ext = document.getElementById('viewerExt');
        this.body = document.getElementById('viewerBody');

        this.el.querySelector('.viewer__backdrop').addEventListener('click', () => this.close());
        this.el.querySelector('.viewer__close').addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.el.classList.contains('is-open')) this.close();
        });
    },

    open(item) {
        this.lastFocus = document.activeElement;
        this.cat.textContent = item.cat;
        this.title.textContent = item.title;
        this.file.textContent = item.fileName || '';

        this.repo.hidden = !item.repo;
        if (item.repo) this.repo.href = item.repo;
        this.ext.hidden = !item.url;
        if (item.url) this.ext.href = item.url;

        this.body.textContent = '';
        this.el.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        this.el.querySelector('.viewer__close').focus();

        if (item.viewer === 'web') this.showSite(item);
        else this.showCode(item);
    },

    close() {
        this.el.classList.remove('is-open');
        document.body.style.overflow = '';
        this.body.textContent = '';
        if (this.lastFocus) this.lastFocus.focus();
    },

    showSite(item) {
        const frame = document.createElement('iframe');
        frame.className = 'viewer__frame';
        frame.src = item.url;
        frame.loading = 'lazy';
        frame.title = item.title;
        this.body.appendChild(frame);
    },

    async showCode(item) {
        const note = document.createElement('p');
        note.className = 'viewer__loading';
        note.textContent = 'Lecture du fichier...';
        this.body.appendChild(note);

        try {
            let src = this.cache.get(item.codeUrl);
            if (src === undefined) {
                const res = await fetch(item.codeUrl);
                if (!res.ok) throw new Error(String(res.status));
                src = await res.text();
                this.cache.set(item.codeUrl, src);
            }
            this.paint(src);
        } catch (e) {
            note.textContent = 'Le fichier n\'a pas pu être chargé. Le dépôt reste accessible par le lien ci-dessus.';
        }
    },

    paint(src) {
        const pre = document.createElement('pre');
        pre.className = 'listing';
        const frag = document.createDocumentFragment();

        src.replace(/\s+$/, '').split('\n').forEach((line, i) => {
            const row = document.createElement('div');
            row.className = 'listing__row';
            const n = document.createElement('span');
            n.className = 'listing__n';
            n.textContent = String(i + 1);
            const code = document.createElement('span');
            code.textContent = line || ' ';
            row.append(n, code);
            frag.appendChild(row);
        });

        pre.appendChild(frag);
        this.body.textContent = '';
        this.body.appendChild(pre);
    }
};
