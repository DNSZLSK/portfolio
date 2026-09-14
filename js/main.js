/* =============================================================================
   Amorçage
   ============================================================================= */

const FETCH_TIMEOUT = 10000;
const SUBMIT_COOLDOWN = 5000;

async function postWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

const ContactForm = {
    lastSubmit: 0,

    init() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;
        this.msg = document.getElementById('formMsg');
        this.btn = document.getElementById('sendBtn');
        this.honeypot = document.getElementById('website');
        this.form.addEventListener('submit', (e) => this.submit(e));
    },

    say(text, kind) {
        this.msg.textContent = text;
        this.msg.dataset.kind = kind;
    },

    async submit(e) {
        e.preventDefault();

        const now = Date.now();
        if (now - this.lastSubmit < SUBMIT_COOLDOWN) {
            this.say('Patientez quelques secondes avant de renvoyer.', 'ko');
            return;
        }
        this.lastSubmit = now;

        // Pot de miel : rempli, c'est un robot. On simule le succès.
        if (this.honeypot && this.honeypot.value) {
            this.say('Message envoyé. Réponse rapide.', 'ok');
            this.form.reset();
            return;
        }

        this.btn.disabled = true;
        this.btn.textContent = 'Envoi...';
        this.say('', 'ok');

        try {
            const payload = Object.fromEntries(new FormData(this.form));
            delete payload.website;

            const res = await postWithTimeout('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) throw new Error('refusé');

            this.say('Message envoyé. Réponse rapide.', 'ok');
            this.form.reset();
        } catch (err) {
            this.say('L\'envoi a échoué. Écrivez-moi directement à ' + IDENTITY.email + '.', 'ko');
        } finally {
            this.btn.disabled = false;
            this.btn.textContent = 'Envoyer';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Viewer.init();
    Catalogue.render('sideA', CATALOGUE.filter((i) => i.side === 'A'));
    Catalogue.render('sideB', CATALOGUE.filter((i) => i.side === 'B'));
    Catalogue.lives('lives');
    ContactForm.init();
});
