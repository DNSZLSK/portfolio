/* =============================================================================
   Rendu du catalogue
   ============================================================================= */

const Catalogue = {
    /** Une plage du catalogue. `link` enveloppe la ligne si le projet est visitable. */
    cut(item) {
        // Un projet doté d'un viewer s'ouvre sur place ; sinon le lien sort
        // du site (OPAC est chez le client, il ne se met pas dans un cadre).
        const inline = Boolean(item.viewer);
        const row = document.createElement(item.url || inline ? 'a' : 'div');
        row.className = 'cut';

        if (inline) {
            row.href = item.url || item.repo || '#';
            row.addEventListener('click', (e) => {
                e.preventDefault();
                Viewer.open(item);
            });
        } else if (item.url) {
            row.href = item.url;
            row.target = '_blank';
            row.rel = 'noopener';
        }

        const cat = document.createElement('span');
        cat.className = 'cut__cat';
        cat.textContent = item.cat;

        const title = document.createElement('span');
        title.className = 'cut__title';
        title.dataset.t = item.title;
        title.textContent = item.title;

        const desc = document.createElement('span');
        desc.className = 'cut__desc';
        desc.innerHTML = item.desc;

        const format = document.createElement('span');
        format.className = 'cut__format';
        format.textContent = item.format.join(' · ');
        desc.appendChild(format);

        const year = document.createElement('span');
        year.className = 'cut__year';
        year.textContent = item.year;

        const state = document.createElement('span');
        state.className = 'cut__state';
        const em = document.createElement('i');
        em.textContent = item.state;
        state.appendChild(em);

        row.append(cat, title, desc, year, state);
        return row;
    },

    render(target, items) {
        const host = document.getElementById(target);
        if (!host) return;
        const frag = document.createDocumentFragment();
        items.forEach((item) => frag.appendChild(this.cut(item)));
        host.appendChild(frag);
    },

    lives(target) {
        const host = document.getElementById(target);
        if (!host) return;
        PREVIOUS_LIVES.forEach((life, i) => {
            const li = document.createElement('li');
            const n = document.createElement('span');
            n.textContent = String(i + 1).padStart(2, '0');
            const role = document.createElement('span');
            role.textContent = life.role;
            const note = document.createElement('em');
            note.textContent = life.note;
            li.append(n, role, note);
            host.appendChild(li);
        });
    }
};
