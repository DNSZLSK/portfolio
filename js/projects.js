/* =============================================================================
   Projects Management
   ============================================================================= */

class ProjectsManager {
    constructor() {
        this.grid = document.getElementById('projectGrid');
        this.filtersContainer = document.getElementById('filters');
        this.currentFilter = 'all';
        this.codeCache = new Map();
        
        this.init();
    }
    
    init() {
        this.renderFilters();
        this.renderProjects();
        this.preloadCode();
    }
    
    renderFilters() {
        FILTER_CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `filter-btn ${cat.id === 'all' ? 'filter-btn--active' : ''}`;
            btn.dataset.filter = cat.id;
            btn.innerHTML = `<span>${cat.label}</span>`;
            
            btn.addEventListener('click', () => this.handleFilterClick(btn, cat.id));
            
            this.filtersContainer.appendChild(btn);
        });
    }
    
    handleFilterClick(btn, filterId) {
        this.currentFilter = filterId;
        
        // Update active state
        this.filtersContainer.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('filter-btn--active');
        });
        btn.classList.add('filter-btn--active');
        
        this.renderProjects();
    }
    
    renderProjects() {
        this.grid.innerHTML = '';
        
        const filtered = this.currentFilter === 'all' 
            ? PROJECTS_DATA 
            : PROJECTS_DATA.filter(p => p.category === this.currentFilter);
        
        if (filtered.length === 0) {
            this.grid.innerHTML = `
                <div class="projects__empty">
                    <h3 class="projects__empty-title">Aucun projet trouvé</h3>
                    <p class="projects__empty-text">Aucun projet ne correspond à ce filtre.</p>
                </div>
            `;
            return;
        }
        
        filtered.forEach(project => {
            const card = this.createCard(project);
            this.grid.appendChild(card);
        });
    }
    
    createCard(project) {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-card__content">
                <div class="project-card__icon project-card__icon--${project.language}"></div>
                <h3 class="project-card__title">${project.title}</h3>
                <p class="project-card__description">${project.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => this.handleCardClick(project));
        
        return card;
    }
    
    handleCardClick(project) {
        if (project.viewerType === 'web') {
            webViewer.open(project);
        } else if (project.codeUrl) {
            ideViewer.open(project);
        } else if (project.projectUrl) {
            window.open(project.projectUrl, '_blank');
        }
    }
    
    async preloadCode() {
        const projects = PROJECTS_DATA.filter(p => p.codeUrl);

        await Promise.all(projects.map(async p => {
            try {
                const res = await fetchWithTimeout(
                    'https://corsproxy.io/?' + encodeURIComponent(p.codeUrl),
                    {},
                    TIMING.FETCH_TIMEOUT
                );
                if (res.ok) {
                    this.codeCache.set(p.codeUrl, { success: true, code: await res.text() });
                }
            } catch (e) {
                // Silent fail for preload
            }
        }));
    }
    
    getCachedCode(url) {
        return this.codeCache.get(url);
    }
    
    setCachedCode(url, code) {
        this.codeCache.set(url, { success: true, code });
    }
}


/* =============================================================================
   IDE Viewer
   ============================================================================= */

class IDEViewer {
    constructor() {
        this.viewer = document.getElementById('ideViewer');
        this.backdrop = this.viewer.querySelector('.viewer__backdrop');
        this.name = document.getElementById('ideName');
        this.file = document.getElementById('ideFile');
        this.editor = document.getElementById('ideEditor');
        this.language = document.getElementById('ideLanguage');
        this.repoLink = document.getElementById('ideRepoLink');
        this.closeBtn = this.viewer.querySelector('.ide__btn--close');
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', () => this.close());
    }
    
    async open(project) {
        // Pause particles and lock scroll
        if (window.particleSystem) window.particleSystem.pause();
        document.body.style.overflow = 'hidden';

        // Setup header
        const lang = LANGUAGE_MAP[project.language] || { text: 'Code', hljs: 'plaintext' };
        this.name.textContent = project.title;
        this.file.textContent = '— ' + (project.fileName || 'code');
        this.language.textContent = lang.text;

        // Repo link
        if (project.repoUrl) {
            this.repoLink.href = project.repoUrl;
            this.repoLink.style.display = 'flex';
        } else {
            this.repoLink.style.display = 'none';
        }

        // Show viewer and activate focus trap
        this.viewer.classList.add('is-active');
        FocusTrap.activate(this.viewer.querySelector('.ide'));

        // Check cache
        const cached = window.projectsManager?.getCachedCode(project.codeUrl);
        if (cached?.success) {
            this.displayCode(cached.code, lang.hljs);
            return;
        }

        // Show loading
        this.editor.innerHTML = `
            <div class="ide__loading" aria-live="polite">
                <div class="spinner"></div>
                <span>Chargement...</span>
            </div>
        `;

        // Fetch code with timeout
        try {
            const res = await fetchWithTimeout(
                'https://corsproxy.io/?' + encodeURIComponent(project.codeUrl)
            );

            if (!res.ok) throw new Error('Fetch failed');

            const code = await res.text();
            window.projectsManager?.setCachedCode(project.codeUrl, code);
            this.displayCode(code, lang.hljs);

        } catch (e) {
            this.editor.innerHTML = `
                <div class="ide__error" aria-live="assertive">
                    <svg viewBox="0 0 24 24" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>Erreur de chargement</span>
                </div>
            `;
        }
    }
    
    displayCode(code, lang) {
        this.editor.innerHTML = `<pre><code class="ide__code language-${lang}" id="ideCode"></code></pre>`;
        const el = document.getElementById('ideCode');
        el.textContent = code;
        hljs.highlightElement(el);
    }
    
    close() {
        this.viewer.classList.remove('is-active');
        document.body.style.overflow = '';
        FocusTrap.deactivate();
        if (window.particleSystem) window.particleSystem.resume();
    }
}


/* =============================================================================
   Web Viewer
   ============================================================================= */

class WebViewer {
    constructor() {
        this.viewer = document.getElementById('webViewer');
        this.backdrop = this.viewer.querySelector('.viewer__backdrop');
        this.title = document.getElementById('browserTitle');
        this.body = document.getElementById('browserBody');
        this.loading = document.getElementById('browserLoading');
        this.repoLink = document.getElementById('browserRepoLink');
        this.externalLink = document.getElementById('browserExternalLink');
        this.closeBtn = this.viewer.querySelector('.browser__btn--close');
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', () => this.close());
    }
    
    open(project) {
        // Pause particles and lock scroll
        if (window.particleSystem) window.particleSystem.pause();
        document.body.style.overflow = 'hidden';

        // Setup header
        this.title.textContent = project.title;
        this.externalLink.href = project.projectUrl;

        // Repo link
        if (project.repoUrl) {
            this.repoLink.href = project.repoUrl;
            this.repoLink.style.display = 'flex';
        } else {
            this.repoLink.style.display = 'none';
        }

        // Show loading
        this.loading.style.display = 'flex';

        // Remove existing iframe
        const existingIframe = this.body.querySelector('iframe');
        if (existingIframe) existingIframe.remove();

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.style.opacity = '0';
        iframe.style.transition = 'opacity 0.5s ease';
        iframe.src = project.projectUrl;
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

        iframe.onload = () => {
            setTimeout(() => {
                this.loading.style.display = 'none';
                iframe.style.opacity = '1';
            }, TIMING.IFRAME_FADE_DELAY);
        };

        this.body.appendChild(iframe);
        this.viewer.classList.add('is-active');
        FocusTrap.activate(this.viewer.querySelector('.browser'));
    }

    close() {
        const iframe = this.body.querySelector('iframe');
        if (iframe) iframe.remove();

        this.viewer.classList.remove('is-active');
        document.body.style.overflow = '';
        FocusTrap.deactivate();
        if (window.particleSystem) window.particleSystem.resume();
    }
}

// Global instances (initialized in main.js)
let ideViewer, webViewer;