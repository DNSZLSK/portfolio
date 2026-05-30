/* =============================================================================
   Configuration & Data
   ============================================================================= */

// Timing constants
const TIMING = {
    RESIZE_DEBOUNCE: 150,
    ORIENTATION_DELAY: 400,
    CAROUSEL_INIT_DELAY: 100,
    CODE_PRELOAD_DELAY: 1000,
    IFRAME_FADE_DELAY: 150,
    SUCCESS_MESSAGE_DURATION: 2000,
    FETCH_TIMEOUT: 10000
};

// Device detection
const DEVICE = {
    isAndroid: /Android/i.test(navigator.userAgent),
    isChrome: /Chrome/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    get isAndroidChrome() {
        return this.isAndroid && this.isChrome;
    },
    get isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || window.innerWidth <= 768;
    }
};

// Particle system configuration
const PARTICLES_CONFIG = {
    get count() {
        if (DEVICE.isAndroidChrome) return 30;
        if (DEVICE.isMobile) return 35;
        return 80;
    },
    get maxDistance() {
        if (DEVICE.isAndroidChrome) return 150;
        if (DEVICE.isMobile) return 180;
        return 250;
    },
    get pointerRadius() {
        if (DEVICE.isAndroidChrome) return 70;
        if (DEVICE.isMobile) return 80;
        return 120;
    },
    get speed() {
        if (DEVICE.isAndroidChrome) return 0.3;
        if (DEVICE.isMobile) return 0.4;
        return 0.6;
    },
    parallaxFactor: 0.2
};

// Tech stack for carousel
const TECH_STACK = [
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', label: 'Git', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', label: 'Python', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', label: 'Java', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', label: 'HTML5', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', label: 'CSS3', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', label: 'JS', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', label: 'TypeScript', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg', label: 'IntelliJ', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pycharm/pycharm-original.svg', label: 'PyCharm', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', label: 'VS Code', mastered: true },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Construct_3_Logo.svg', label: 'Construct 3', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', label: 'Docker', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', label: 'PHP', mastered: true },
    { src: 'https://cdn.worldvectorlogo.com/logos/mamp-2.svg', label: 'MAMP', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg', label: 'Angular', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', label: 'PostgreSQL', mastered: true },
    { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg', label: 'Spring', mastered: true }
];

// Projects data
const PROJECTS_DATA = [
    {
        title: 'GitCoach',
        description: 'CLI éducatif pour apprendre Git. Niveaux adaptatifs, multilingue (FR/EN/ES), 383 tests.',
        language: 'cli',
        category: 'cli',
        viewerType: 'web',
        projectUrl: 'https://dnszlsk.github.io/gitcoach-cli',
        repoUrl: 'https://github.com/DNSZLSK/gitcoach-cli'
    },
    {
        title: 'MUAD\'DIB',
        description: 'Scanner de sécurité npm. Détecte typosquatting, malware, exfiltration. 900+ IOCs.',
        language: 'security',
        category: 'security',
        viewerType: 'web',
        projectUrl: 'https://dnszlsk.github.io/muad-dib',
        repoUrl: 'https://github.com/DNSZLSK/muad-dib'
    },
    {
        title: 'Musubi',
        description: 'Jeu de logique rétro. Remplissez les cercles pour correspondre aux chiffres indiqués.',
        language: 'games',
        category: 'games',
        viewerType: 'web',
        projectUrl: 'https://dnszlsk.github.io/musubi/',
        repoUrl: 'https://github.com/DNSZLSK/musubi'
    },
    {
        title: 'Le Juste Prix',
        description: 'Jeu du "Juste Prix" en Python. Un des premiers exercices de la formation CDA.',
        language: 'python',
        category: 'python',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fpython-projects%2Fle-juste-prix/repository/files/ECF%201%20k%C3%A9win_Le%20juste%20prix.py/raw?ref=main',
        repoUrl: 'https://gitlab.com/dnszlsk/python-projects/le-juste-prix',
        fileName: 'juste_prix.py'
    },
    {
        title: 'Spy Hunter',
        description: 'Script Python pour débusquer un espion dans un fichier CSV en analysant les langues et voyages.',
        language: 'python',
        category: 'python',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fpython-projects%2Fpython-spy-hunter/repository/files/k%C3%A9win_D%C3%A9busquez%20l%27espion.py/raw?ref=main',
        repoUrl: 'https://gitlab.com/dnszlsk/python-projects/python-spy-hunter',
        fileName: 'spy_hunter.py'
    },
    {
        title: 'Mot de Passe',
        description: 'Vérificateur de mot de passe en Java avec validation de règles complexes.',
        language: 'java',
        category: 'java',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fjava-projects%2Fjava-password-validator/repository/files/src%2Fmain%2Fjava%2Forg%2Fexample%2FMain.java/raw?ref=main',
        repoUrl: 'https://gitlab.com/dnszlsk/java-projects/java-password-validator',
        fileName: 'Main.java'
    },
    {
        title: 'Simulation Océanographique',
        description: 'Analyse de données de marées à partir de fichiers CSV.',
        language: 'java',
        category: 'java',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fjava-projects%2Fsimulation-oceanographique/repository/files/src%2Fmain%2Fjava%2Forg%2Fexample%2FMain.java/raw?ref=main',
        repoUrl: 'https://gitlab.com/dnszlsk/java-projects/simulation-oceanographique',
        fileName: 'Main.java'
    },
    {
        title: 'Mock of Duty',
        description: 'Tests unitaires Java avec Mockito. Implémentation de mocks, stubs et vérifications.',
        language: 'mockito',
        category: 'tests',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fmockito-projects%2Fmock-of-duty/repository/files/src%2Ftest%2Fjava%2FSoldatTest.java/raw?ref=main',
        repoUrl: 'https://gitlab.com/dnszlsk/mockito-projects/mock-of-duty',
        fileName: 'SoldatTest.java'
    },
    {
        title: 'Py2Java',
        description: 'Guide de transition complet entre Python et Java - Commandes et syntaxes équivalentes.',
        language: 'html',
        category: 'html',
        viewerType: 'web',
        projectUrl: 'https://dnszlsk.github.io/py2java/'
    },
    {
        title: 'JetBrains Shortcuts',
        description: 'Guide des raccourcis clavier pour PyCharm et IntelliJ IDEA.',
        language: 'html',
        category: 'html',
        viewerType: 'web',
        projectUrl: 'https://dnszlsk.github.io/JetBrainShortcuts/'
    },
    {
        title: 'CDA Quiz',
        description: 'Protocole d\'évaluation des compétences CDA - Quiz interactif de formation.',
        language: 'html',
        category: 'html',
        viewerType: 'web',
        projectUrl: 'https://dnszlsk.github.io/cdaquiz/'
    }
];

// Filter categories
const FILTER_CATEGORIES = [
    { id: 'all', label: 'Tous' },
    { id: 'cli', label: 'CLI' },
    { id: 'security', label: 'Security' },
    { id: 'games', label: 'Games' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'tests', label: 'Tests' },
    { id: 'html', label: 'Web' }
];

// Language mapping for syntax highlighting
const LANGUAGE_MAP = {
    python: { text: 'Python', hljs: 'python' },
    java: { text: 'Java', hljs: 'java' },
    mockito: { text: 'Java (Mockito)', hljs: 'java' },
    html: { text: 'HTML', hljs: 'html' }
};
