/* =============================================================================
   Données du catalogue
   Chaque projet a un numéro, une année et un état. L'état est l'info que
   les portfolios juniors n'affichent jamais et que tout recruteur cherche :
   qu'est-ce qui tourne encore, qu'est-ce qui est maintenu, qu'est-ce qui dort.
   ============================================================================= */

const IDENTITY = {
    name: 'Kéwin Poszalski',
    role: 'Développeur full stack',
    place: 'Bretagne',
    email: 'k.poszalski@gmail.com',
    catalogue: 'KP-000',
    pressing: 5,
    availability: 'Disponible en alternance',
    contract: 'Alternance, rythme 3 semaines entreprise / 1 semaine école',
    start: 'À confirmer',
    training: 'Titre CDA obtenu, en route vers Expert en développement logiciel (bac+5)',
    links: {
        github: 'https://github.com/DNSZLSK',
        linkedin: 'https://www.linkedin.com/in/kewin-poszalski'
    }
};

/* side: 'A' = les produits qui tournent, en page d'accueil.
   side: 'B' = le reste du catalogue, sur la page dédiée. */
const CATALOGUE = [
    {
        cat: 'KP-001',
        side: 'A',
        title: 'DigDigDig',
        viewer: 'web',
        year: '2026',
        state: 'En ligne',
        format: ['Python', 'Flet', 'ONNX', 'Docker'],
        desc: '<b>App desktop pour DJs et diggers.</b> Scan de bibliothèque, identification Discogs, classification de genre par ML embarqué. Un vrai produit, avec sa communauté d\'utilisateurs.',
        url: 'https://dnszlsk.github.io/digdigdig/',
        repo: 'https://github.com/DNSZLSK/digdigdig'
    },
    {
        cat: 'KP-002',
        side: 'A',
        title: 'Muad\'Dib',
        viewer: 'web',
        year: '2026',
        state: 'Maintenu',
        format: ['Node.js', 'JavaScript', 'Docker', 'tree-sitter'],
        desc: '<b>Détection de code malveillant</b> dans npm et PyPI. Analyse comportementale et de flux inter-fichiers, sandbox Docker.',
        url: 'https://dnszlsk.github.io/muad-dib',
        repo: 'https://github.com/DNSZLSK/muad-dib'
    },
    {
        cat: 'KP-003',
        side: 'A',
        title: 'OPAC Plérin',
        year: '2026',
        state: 'En production',
        format: ['PHP', 'WordPress FSE', 'MySQL'],
        desc: '<b>Site livré chez le client, de A à Z.</b> Association culturelle : thème WordPress sur-mesure, inscriptions avec liste d\'attente, emailing en masse côté admin. Conception, développement, mise en ligne et suivi.',
        url: 'https://opacplerin.fr/'
    },
    {
        cat: 'KP-004',
        side: 'A',
        title: 'GitCoach',
        viewer: 'web',
        year: '2026',
        state: 'Maintenu',
        format: ['Node.js', 'TypeScript', 'Jest', 'i18next'],
        desc: '<b>Assistant Git en ligne de commande</b> qui prévient les erreurs avant qu\'elles arrivent. Niveaux adaptatifs, multilingue, IA intégrée.',
        url: 'https://dnszlsk.github.io/gitcoach-cli',
        repo: 'https://github.com/DNSZLSK/gitcoach-cli'
    },
    {
        cat: 'KP-005',
        side: 'A',
        title: 'Musubi',
        viewer: 'web',
        year: '2026',
        state: 'En ligne',
        format: ['JavaScript', 'Vite', 'PWA', 'Vitest'],
        desc: '<b>Jeu de logique rétro façon CRT.</b> JavaScript vanilla, installable en PWA.',
        url: 'https://dnszlsk.github.io/musubi/',
        repo: 'https://github.com/DNSZLSK/musubi'
    },
    {
        cat: 'KP-006', side: 'B', title: 'Py2Java',
        viewer: 'web', year: '2025', state: 'Archivé',
        format: ['HTML', 'CSS', 'JavaScript'],
        desc: 'Guide de transition entre Python et Java : commandes et syntaxes équivalentes.',
        url: 'https://dnszlsk.github.io/py2java/'
    },
    {
        cat: 'KP-007', side: 'B', title: 'JetBrains Shortcuts',
        viewer: 'web', year: '2025', state: 'Archivé',
        format: ['HTML', 'CSS', 'JavaScript'],
        desc: 'Guide des raccourcis clavier pour PyCharm et IntelliJ IDEA.',
        url: 'https://dnszlsk.github.io/JetBrainShortcuts/'
    },
    {
        cat: 'KP-008', side: 'B', title: 'CDA Quiz',
        viewer: 'web', year: '2025', state: 'Archivé',
        format: ['HTML', 'CSS', 'JavaScript'],
        desc: 'Quiz interactif d\'évaluation des compétences CDA.',
        url: 'https://dnszlsk.github.io/cdaquiz/'
    },
    {
        cat: 'KP-009', side: 'B', title: 'Mock of Duty',
        viewer: 'code',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fmockito-projects%2Fmock-of-duty/repository/files/src%2Ftest%2Fjava%2FSoldatTest.java/raw?ref=main',
        fileName: 'SoldatTest.java', year: '2025', state: 'Exercice',
        format: ['Java', 'JUnit', 'Mockito'],
        desc: 'Tests unitaires Java avec Mockito : mocks, stubs et vérifications.',
        repo: 'https://gitlab.com/dnszlsk/mockito-projects/mock-of-duty'
    },
    {
        cat: 'KP-010', side: 'B', title: 'Simulation Océanographique',
        viewer: 'code',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fjava-projects%2Fsimulation-oceanographique/repository/files/src%2Fmain%2Fjava%2Forg%2Fexample%2FMain.java/raw?ref=main',
        fileName: 'Main.java', year: '2025', state: 'Exercice',
        format: ['Java'],
        desc: 'Analyse de données de marées à partir de fichiers CSV.',
        repo: 'https://gitlab.com/dnszlsk/java-projects/simulation-oceanographique'
    },
    {
        cat: 'KP-011', side: 'B', title: 'Mot de Passe',
        viewer: 'code',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fjava-projects%2Fjava-password-validator/repository/files/src%2Fmain%2Fjava%2Forg%2Fexample%2FMain.java/raw?ref=main',
        fileName: 'Main.java', year: '2025', state: 'Exercice',
        format: ['Java'],
        desc: 'Vérificateur de mot de passe avec validation de règles complexes.',
        repo: 'https://gitlab.com/dnszlsk/java-projects/java-password-validator'
    },
    {
        cat: 'KP-012', side: 'B', title: 'Spy Hunter',
        viewer: 'code',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fpython-projects%2Fpython-spy-hunter/repository/files/k%C3%A9win_D%C3%A9busquez%20l%27espion.py/raw?ref=main',
        fileName: 'spy_hunter.py', year: '2025', state: 'Exercice',
        format: ['Python'],
        desc: 'Débusquer un espion dans un fichier CSV en analysant langues et voyages.',
        repo: 'https://gitlab.com/dnszlsk/python-projects/python-spy-hunter'
    },
    {
        cat: 'KP-013', side: 'B', title: 'Le Juste Prix',
        viewer: 'code',
        codeUrl: 'https://gitlab.com/api/v4/projects/dnszlsk%2Fpython-projects%2Fle-juste-prix/repository/files/ECF%201%20k%C3%A9win_Le%20juste%20prix.py/raw?ref=main',
        fileName: 'juste_prix.py', year: '2025', state: 'Exercice',
        format: ['Python'],
        desc: 'Le jeu du Juste Prix. Un des tout premiers exercices de la formation.',
        repo: 'https://gitlab.com/dnszlsk/python-projects/le-juste-prix'
    }
];

/* Les plages de la face B : le métier à gauche, ce qu'il a laissé à droite.
   La note porte la compétence transversale, pas le lieu ni l'employeur. */
const PREVIOUS_LIVES = [
    { role: 'Sous-chef de cuisine', note: 'Ordonnancer sous pression' },
    { role: "Chef d'équipe plombier", note: 'Remonter à la cause' },
    { role: 'Régisseur général', note: 'Tenir une date immuable' },
    { role: 'DJ', note: 'Corriger en direct' },
    { role: 'Beatmaker et créateur de visuels', note: 'Porter de bout en bout' }
];
