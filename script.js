/* ==================================================================
   PLEIADES SYSTEMS — SCRIPT PRINCIPAL
   Organizado em módulos independentes:
   1. Starfield (constelação animada do hero e do CTA)
   2. Navegação mobile
   3. Header com fundo dinâmico ao rolar
   4. Conteúdo dinâmico (serviços, diferenciais, tecnologia, timeline, depoimentos)
   5. Reveal on scroll (IntersectionObserver)
   6. Formulário de contato
================================================================== */

document.getElementById('year').textContent = new Date().getFullYear();

/* ------------------------------------------------------------------
   1. STARFIELD — constelação inspirada nas Plêiades
   Sete estrelas principais conectadas (referência ao aglomerado M45),
   com um campo de partículas ao fundo e leve efeito parallax pelo mouse.
------------------------------------------------------------------ */
function createStarfield(canvasId, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const density = options.density || 0.00012;
  let width, height, dpr;
  let particles = [];
  let pointer = { x: 0.5, y: 0.5 };
  let rafId;

  // As "sete irmãs" — posições relativas (0 a 1) que formam o aglomerado
  const principals = [
    { x: 0.30, y: 0.28 }, { x: 0.46, y: 0.16 }, { x: 0.62, y: 0.24 },
    { x: 0.40, y: 0.42 }, { x: 0.56, y: 0.50 }, { x: 0.34, y: 0.62 },
    { x: 0.58, y: 0.70 }
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(40, Math.floor(width * height * density));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.15 + 0.02,
      twinkle: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.05
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Campo de partículas com leve brilho e movimento
    particles.forEach(p => {
      p.twinkle += 0.02;
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
      const alpha = 0.35 + Math.sin(p.twinkle) * 0.35;
      ctx.beginPath();
      ctx.fillStyle = `rgba(180, 205, 255, ${Math.max(alpha, 0.08)})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Deslocamento sutil pelo mouse (parallax)
    const offsetX = (pointer.x - 0.5) * 26;
    const offsetY = (pointer.y - 0.5) * 18;

    const pts = principals.map(p => ({
      x: p.x * width + offsetX,
      y: p.y * height + offsetY
    }));

    // Linhas conectando o aglomerado (traço do "raio" discreto)
    ctx.strokeStyle = 'rgba(111, 166, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    pts.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    // Estrelas principais com brilho (glow)
    pts.forEach((p, i) => {
      const radius = i === 1 ? 3.2 : 2.2;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 6);
      grad.addColorStop(0, 'rgba(160, 200, 255, 0.9)');
      grad.addColorStop(1, 'rgba(160, 200, 255, 0)');
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, radius * 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = '#EAF2FF';
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width;
    pointer.y = (e.clientY - rect.top) / rect.height;
  });

  resize();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    draw();
  } else {
    // Desenha um único frame estático se o usuário preferir menos animação
    draw();
    cancelAnimationFrame(rafId);
  }
}

createStarfield('starfield', { density: 0.00016 });
createStarfield('ctaStarfield', { density: 0.00009 });

/* ------------------------------------------------------------------
   2. NAVEGAÇÃO MOBILE
------------------------------------------------------------------ */
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');

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

/* ------------------------------------------------------------------
   3. HEADER — leve mudança de fundo ao rolar a página
------------------------------------------------------------------ */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.style.background = window.scrollY > 40
    ? 'rgba(8,27,51,.85)'
    : 'rgba(8,27,51,.55)';
}, { passive: true });

/* ------------------------------------------------------------------
   4. CONTEÚDO DINÂMICO
------------------------------------------------------------------ */

// Serviços
const services = [
  { icon: 'code', title: 'Desenvolvimento de Software', text: 'Sistemas sob medida, do desenho da arquitetura à entrega em produção.' },
  { icon: 'globe', title: 'Desenvolvimento Web', text: 'Sites e aplicações web rápidas, acessíveis e otimizadas para conversão.' },
  { icon: 'layers', title: 'Sistemas SaaS', text: 'Plataformas multiusuário escaláveis, prontas para crescer com o seu negócio.' },
  { icon: 'spark', title: 'Inteligência Artificial', text: 'IA aplicada a processos reais: reconhecimento, automação e decisão.' },
  { icon: 'flow', title: 'Automação de Processos', text: 'Eliminamos tarefas manuais repetitivas com fluxos automatizados.' },
  { icon: 'link', title: 'Integrações', text: 'Conectamos sistemas, APIs e serviços para que seus dados conversem entre si.' },
  { icon: 'device', title: 'Aplicativos', text: 'Apps móveis e multiplataforma com experiência nativa.' },
  { icon: 'compass', title: 'Consultoria Tecnológica', text: 'Direcionamento técnico estratégico para decisões de tecnologia mais seguras.' }
];

const icons = {
  code: '<path d="M8 6L2 12l6 6M16 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  globe: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  spark: '<path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  flow: '<circle cx="5" cy="6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="19" cy="18" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 6h6a4 4 0 0 1 4 4v4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  link: '<path d="M9 15l6-6M8 16l-2 2a4 4 0 1 1-6-6l3-3M16 8l2-2a4 4 0 1 1 6 6l-3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  device: '<rect x="6" y="2" width="12" height="20" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11 19h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  compass: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 9l-2.2 5.8L9 17l2.2-5.8L15 9z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>'
};

const servicosGrid = document.getElementById('servicosGrid');
servicosGrid.innerHTML = services.map(s => `
  <article class="service-card reveal">
    <div class="service-card-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24">${icons[s.icon]}</svg></div>
    <h3>${s.title}</h3>
    <p>${s.text}</p>
  </article>
`).join('');

// Diferenciais
const diffs = [
  { n: '01', title: 'Arquitetura pensada para o volume real', text: 'Banco de dados, filas e cache dimensionados para o crescimento esperado do seu negócio — não para uma demo.' },
  { n: '02', title: 'Performance monitorada, não prometida', text: 'Consultas indexadas, carregamento otimizado e tempos de resposta acompanhados desde o primeiro deploy.' },
  { n: '03', title: 'Segurança por padrão', text: 'Controle de acesso por papel, autenticação forte e dados sensíveis nunca armazenados em texto puro.' },
  { n: '04', title: 'Testado com quem usa', text: 'Fluxos validados com o operador do sistema no dia a dia — não só com quem aprovou o orçamento.' },
  { n: '05', title: 'Sem dependência de quem construiu', text: 'Código documentado e padronizado, para que qualquer time consiga dar manutenção depois de nós.' },
  { n: '06', title: 'Canal direto com quem desenvolve', text: 'Contato com o time técnico responsável pelo projeto — sem triagem em fila de suporte genérica.' }
];
const diferenciaisGrid = document.getElementById('diferenciaisGrid');
diferenciaisGrid.innerHTML = diffs.map(d => `
  <article class="diff-card reveal">
    <span class="diff-card-num">${d.n}</span>
    <h3>${d.title}</h3>
    <p>${d.text}</p>
  </article>
`).join('');

// Tecnologia
const techs = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'NestJS', 'Express', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'OpenAI', 'REST APIs'];
document.getElementById('techBadges').innerHTML = techs.map(t => `<li>${t}</li>`).join('');

// Processo — cada etapa leva o nome de uma das sete irmãs do aglomerado
// M45 (Alcíone, Maia, Electra, Táigete, Celeno, Astérope, Mérope), na ordem
// em que a tradição grega costuma listá-las.
const steps = [
  { star: 'Alcíone', title: 'Descoberta', text: 'Entendemos o problema, o negócio e os objetivos antes de propor qualquer solução.' },
  { star: 'Maia', title: 'Planejamento', text: 'Definimos escopo, arquitetura e cronograma com previsibilidade.' },
  { star: 'Electra', title: 'Design', text: 'Criamos a experiência da interface alinhada à identidade da sua marca.' },
  { star: 'Táigete', title: 'Desenvolvimento', text: 'Codificamos com boas práticas, versionamento e revisão contínua.' },
  { star: 'Celeno', title: 'Testes', text: 'Validamos funcionalidade, performance e segurança antes da entrega.' },
  { star: 'Astérope', title: 'Implantação', text: 'Colocamos o sistema no ar com monitoramento ativo.' },
  { star: 'Mérope', title: 'Evolução contínua', text: 'Acompanhamos métricas reais e evoluímos o produto com o seu negócio.' }
];
document.getElementById('timelineList').innerHTML = steps.map((s, i) => `
  <li class="timeline-step reveal">
    <span class="timeline-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <div class="timeline-body">
      <span class="timeline-star">${s.star}</span>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </div>
  </li>
`).join('');

/* ------------------------------------------------------------------
   5. REVEAL ON SCROLL
   Observa cada card e revela quando entra na tela. Inclui uma rede de
   segurança: se por qualquer motivo o IntersectionObserver não disparar
   (navegadores antigos, ferramentas de preview, etc.), os elementos são
   revelados automaticamente depois de um curto intervalo, para que o
   conteúdo nunca fique invisível permanentemente.
------------------------------------------------------------------ */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // Rede de segurança: garante que nada fique preso em opacity 0
  window.addEventListener('load', () => {
    setTimeout(() => {
      revealEls.forEach(el => el.classList.add('is-visible'));
    }, 1200);
  });
} else {
  // Navegador sem suporte: revela tudo imediatamente
  revealEls.forEach(el => el.classList.add('is-visible'));
}

/* ------------------------------------------------------------------
   6. FORMULÁRIO DE CONTATO
------------------------------------------------------------------ */
const ctaForm = document.getElementById('ctaForm');
const formStatus = document.getElementById('formStatus');

ctaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!ctaForm.checkValidity()) {
    formStatus.textContent = 'Preencha nome e e-mail para continuar.';
    return;
  }
  const name = document.getElementById('name').value.trim();
  formStatus.textContent = `Obrigado, ${name}! Recebemos sua mensagem e retornaremos em breve.`;
  ctaForm.reset();
});