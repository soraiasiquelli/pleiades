/* ==================================================================
   PLEIADES SYSTEMS — SCRIPT PRINCIPAL
   Módulos:
   1. Consentimento de cookies (LGPD) + Google Analytics
   2. Navegação mobile
   3. Rodapé — ano corrente
   4. Filtro de categorias em /insights/
   5. Pré-seleção do tipo de necessidade
   6. Formulário de contato
================================================================== */

/* ------------------------------------------------------------------
   1. CONSENTIMENTO DE COOKIES (LGPD) + GOOGLE ANALYTICS
   O Google Analytics só é carregado depois que o visitante aceita.
   A escolha (aceitar/recusar) fica salva no navegador; sem ela, nada
   é carregado nem contabilizado. Isso vale para todas as páginas,
   já que este arquivo é compartilhado por todas.
------------------------------------------------------------------ */
(function initConsent() {
  const GA_ID = 'G-KP7L8ZX0RM';
  const STORAGE_KEY = 'pleiades-consent';

  function loadAnalytics() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }

  function saveChoice(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (e) { /* localStorage indisponível (ex.: navegação privada) */ }
  }

  function showBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner on-dark';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <p>Usamos cookies de análise (Google Analytics) para entender como o site é usado. Nenhum dado é vendido ou compartilhado para publicidade.</p>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-outline" data-consent="denied">Recusar</button>
        <button type="button" class="btn btn-primary" data-consent="granted">Aceitar</button>
      </div>
    `;
    document.body.appendChild(banner);
    document.body.classList.add('has-cookie-banner');

    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-consent]');
      if (!choice) return;
      const value = choice.dataset.consent;
      saveChoice(value);
      if (value === 'granted') loadAnalytics();
      banner.remove();
      document.body.classList.remove('has-cookie-banner');
    });
  }

  let consent = null;
  try { consent = localStorage.getItem(STORAGE_KEY); } catch (e) { /* localStorage indisponível */ }

  if (consent === 'granted') {
    loadAnalytics();
  } else if (consent !== 'denied') {
    showBanner();
  }
})();

/* ------------------------------------------------------------------
   2. NAVEGAÇÃO MOBILE
------------------------------------------------------------------ */
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');

if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ------------------------------------------------------------------
   3. RODAPÉ — ano corrente
------------------------------------------------------------------ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ------------------------------------------------------------------
   4. FILTRO DE CATEGORIAS — /insights/
   Filtra os itens de #insightList por data-category. Progressivamente
   melhorado: sem JS, a listagem completa continua visível e navegável.
------------------------------------------------------------------ */
const insightFilters = document.querySelectorAll('.insight-filter');
const insightItems = document.querySelectorAll('[data-category]');

if (insightFilters.length && insightItems.length) {
  insightFilters.forEach(filter => {
    filter.addEventListener('click', (e) => {
      e.preventDefault();
      const category = filter.dataset.filter;

      insightFilters.forEach(f => f.classList.toggle('is-active', f === filter));
      insightItems.forEach(item => {
        const match = category === 'todos' || item.dataset.category === category;
        item.hidden = !match;
      });
    });
  });
}

/* ------------------------------------------------------------------
   5. PRÉ-SELEÇÃO DO TIPO DE NECESSIDADE
   Quando o visitante chega de um link de /solucoes/ (?tipo=automacao),
   marca a opção correspondente no formulário de contato.
------------------------------------------------------------------ */
const presetTipo = new URLSearchParams(window.location.search).get('tipo');
if (presetTipo) {
  const radio = document.querySelector(`.field-need input[value="${presetTipo}"]`);
  if (radio) radio.checked = true;
}

/* ------------------------------------------------------------------
   6. FORMULÁRIO DE CONTATO
   Sem backend neste momento: confirma o recebimento na própria página.
   Ao integrar um endpoint, substituir o bloco abaixo pelo envio real.
------------------------------------------------------------------ */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      formStatus.textContent = 'Preencha nome, e-mail e o que você precisa para continuar.';
      return;
    }
    const name = contactForm.querySelector('#name').value.trim();
    formStatus.textContent = `Obrigado, ${name.split(' ')[0]}! Recebemos sua mensagem e retornamos em até um dia útil.`;
    contactForm.reset();
  });
}
