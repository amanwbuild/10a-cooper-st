(function initialiseTemplate(){
  'use strict';

  const TEMPLATE = window.W_TEMPLATE_CONFIG;
  const DOCUMENTS = window.W_DOCUMENT_INDEX;
  const PORTFOLIO = window.W_PORTFOLIO_INDEX;

  if (!TEMPLATE || !DOCUMENTS || !PORTFOLIO){
    throw new Error('Template data failed to load. Check the files in site/data/.');
  }

  const docSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/>' +
    '<path d="M14 2.5V8h5.5"/><path d="M8.5 13h7M8.5 17h7"/></svg>';

  // ---- proposal-level content ----
  document.title = TEMPLATE.proposal.browserTitle;
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', TEMPLATE.proposal.browserTitle);
  document.querySelectorAll('img.wlogo, .wbuild img').forEach(logo => {
    logo.src = TEMPLATE.brand.logo;
    logo.alt = TEMPLATE.brand.name;
  });
  document.getElementById('proposalAddress').innerHTML = TEMPLATE.proposal.addressHeading;
  document.getElementById('proposalRecipients').textContent = TEMPLATE.proposal.recipients;
  document.getElementById('proposalFullAddress').textContent = TEMPLATE.proposal.fullAddress;
  document.getElementById('proposalCost').textContent = TEMPLATE.proposal.indicativeCost;
  document.getElementById('proposalDuration').textContent = TEMPLATE.proposal.duration;

  // ---- page order and navigation ----
  const pageRoot = document.querySelector('main');
  TEMPLATE.pages.forEach((definition, index) => {
    const page = document.querySelector(`main > .page[data-section="${definition.id}"]`);
    if (!page) throw new Error(`Missing page section: ${definition.id}`);
    page.dataset.page = String(index + 1);
    pageRoot.appendChild(page);
  });

  function renderPageNavigation(){
    const total = TEMPLATE.pages.length;
    TEMPLATE.pages.forEach((definition, index) => {
      const pageNumber = index + 1;
      const page = document.querySelector(`.page[data-section="${definition.id}"]`);
      const nav = page.querySelector('.pagenav');
      if (!nav) return;

      const indicator = nav.querySelector('.pn-ind');
      if (indicator) indicator.innerHTML = `<b>${String(pageNumber).padStart(2, '0')}</b> / ${total}`;

      const back = nav.querySelector('.pn-back');
      if (back && index > 0){
        back.textContent = `← ${TEMPLATE.pages[index - 1].title}`;
        back.onclick = () => showPage(pageNumber - 1);
      }

      const next = nav.querySelector('.pn-next');
      if (next && index < total - 1){
        next.textContent = `${TEMPLATE.pages[index + 1].title} →`;
        next.onclick = () => showPage(pageNumber + 1);
      }
    });

    const closingBack = document.querySelector('[data-section="closing"] .fin-back');
    closingBack.textContent = `← back to ${TEMPLATE.pages[TEMPLATE.pages.length - 2].title.toLowerCase()}`;
    closingBack.onclick = () => showPage(TEMPLATE.pages.length - 1);
  }
  renderPageNavigation();

  // ---- cost-page supporting documents (optional per proposal) ----
  const SUPPORTING = TEMPLATE.supportingDocuments || [];
  if (SUPPORTING.length){
    document.getElementById('supdocs').hidden = false;
    document.getElementById('supgrid').innerHTML = SUPPORTING.map((document, index) => {
      const isPDF = document.type === 'pdf' || /\.pdf$/i.test(document.file);
      return '<button class="igcard" type="button" data-support="' + index + '">' + docSVG +
      '<span class="t">' + document.name + '</span>' +
      '<span class="u">' + (isPDF ? 'PDF · view or download' : 'XLSX · preview or download') + '</span>' +
      '<span class="open">' + (isPDF ? 'Open document ↗' : 'Preview workbook ↗') + '</span></button>';
    }).join('');
    document.querySelectorAll('[data-support]').forEach(button => {
      const document = SUPPORTING[Number(button.dataset.support)];
      const isPDF = document.type === 'pdf' || /\.pdf$/i.test(document.file);
      button.addEventListener('click', () => {
        if (isPDF) openDoc(document.file);
        else openCostPlan(document.file, document.name);
      });
    });
  }

  // ---- portfolio order from the supplied workbook ----
  const constructionHeading = document.getElementById('portfolioConstructionHeading');
  const portfolioNav = document.getElementById('portfolioNav');
  PORTFOLIO.filter(project => project.category === 'Completed').forEach(project => {
    const card = document.querySelector(`[data-project="${project.id}"]`);
    if (!card) throw new Error(`Missing portfolio card: ${project.id}`);
    constructionHeading.before(card);
  });
  PORTFOLIO.filter(project => project.category === 'Under Construction').forEach(project => {
    const card = document.querySelector(`[data-project="${project.id}"]`);
    if (!card) throw new Error(`Missing portfolio card: ${project.id}`);
    portfolioNav.before(card);
  });

  // ---- proposal-specific case studies cloned from the portfolio library ----
  const caseStudyRoot = document.getElementById('caseStudyProjects');
  (TEMPLATE.caseStudies || []).forEach(projectId => {
    const source = document.querySelector(`[data-project="${projectId}"]`);
    if (!source) throw new Error(`Missing case study project: ${projectId}`);
    const caseStudy = source.cloneNode(true);
    caseStudy.removeAttribute('data-project');
    caseStudy.dataset.caseStudy = projectId;
    caseStudyRoot.appendChild(caseStudy);
    source.remove();
  });

  // ---- reusable proposal document library ----
  document.querySelectorAll('.docgrid').forEach(grid => {
    const files = DOCUMENTS.proposal[grid.dataset.docs] || [];
    const fallback = grid.parentElement.querySelector('.docfallback');
    if (!files.length){
      if (fallback) fallback.hidden = false;
      return;
    }
    files.forEach(document => grid.appendChild(createDocumentCard(document)));
  });

  // ---- state-specific business details and insurance ----
  const stateParam = new URLSearchParams(window.location.search).get('state')?.toUpperCase();
  const configuredState = String(TEMPLATE.state || 'QLD').toUpperCase();
  const activeState = DOCUMENTS.business[stateParam] ? stateParam : configuredState;
  const stateRecord = DOCUMENTS.business[activeState];
  if (!stateRecord) throw new Error(`Unsupported state: ${activeState}`);

  document.documentElement.dataset.state = activeState;
  const businessCard = document.createElement('div');
  businessCard.className = 'trade';
  const businessHead = document.createElement('div');
  businessHead.className = 'trade-head';
  businessHead.innerHTML = '<h4>Company details</h4>';
  businessCard.appendChild(businessHead);
  stateRecord.details.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'trow';
    const name = document.createElement('span');
    name.className = 'nm';
    name.textContent = label;
    const amount = document.createElement('span');
    amount.className = 'amt';
    if (label === 'Address') amount.classList.add('txt');
    if (label === 'Mobile' || label === 'Email'){
      const link = document.createElement('a');
      link.href = label === 'Mobile' ? `tel:${value.replace(/\s+/g, '')}` : `mailto:${value}`;
      link.style.cssText = 'color:inherit;text-decoration:none;';
      link.textContent = value;
      amount.appendChild(link);
    } else {
      amount.textContent = value;
    }
    row.append(name, amount);
    businessCard.appendChild(row);
  });
  document.getElementById('businessDetails').appendChild(businessCard);
  const businessDocuments = window.document.getElementById('businessDocuments');
  if (businessDocuments){
    stateRecord.documents.forEach(indexedDocument => {
      businessDocuments.appendChild(createDocumentCard(indexedDocument));
    });
  }

  function createDocumentCard(document){
    const button = documentElement('button', 'igcard');
    button.type = 'button';
    button.innerHTML = docSVG +
      '<span class="t"></span>' +
      '<span class="u">PDF · view or download</span>' +
      '<span class="open">Open document ↗</span>';
    button.querySelector('.t').textContent = document.name;
    button.addEventListener('click', () => openDoc(document.file));
    return button;
  }

  function documentElement(tagName, className){
    const element = window.document.createElement(tagName);
    element.className = className;
    return element;
  }

  // ---- popup: PDF and workbook preview ----
  const igModal = document.getElementById('igModal');
  const igFrame = document.getElementById('igFrame');
  const igDl = document.getElementById('igDl');
  const sheetPreview = document.getElementById('sheetPreview');

  window.openDoc = openDoc;
  window.openCostPlan = openCostPlan;
  window.closeIG = closeIG;
  window.showPage = showPage;

  function openDoc(url){
    if (matchMedia('(max-width: 760px)').matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)){
      window.open(url, '_blank', 'noopener');
      return;
    }
    igModal.setAttribute('aria-label', 'Document preview');
    igDl.href = url;
    igDl.textContent = 'Download PDF ↓';
    igDl.style.display = 'inline-flex';
    sheetPreview.hidden = true;
    igFrame.style.display = 'block';
    igModal.querySelector('.ig-box').classList.add('doc');
    igModal.querySelector('.ig-box').classList.remove('sheet');
    igFrame.src = url + '#page=1&view=Fit&zoom=page-fit';
    igModal.classList.add('open');
  }

  function openCostPlan(url, name){
    igModal.setAttribute('aria-label', 'Cost plan preview');
    igDl.href = encodeURI(url);
    igDl.textContent = 'Download workbook ↓';
    igDl.style.display = 'inline-flex';
    igFrame.src = 'about:blank';
    igFrame.style.display = 'none';
    sheetPreview.innerHTML = '<div class="sheet-preview-head"><h3></h3><span>Workbook preview</span></div>';
    sheetPreview.querySelector('h3').textContent = name;
    const previewTable = document.querySelector('.opc-scroll').cloneNode(true);
    previewTable.classList.remove('rv', 'in');
    sheetPreview.appendChild(previewTable);
    sheetPreview.hidden = false;
    igModal.querySelector('.ig-box').classList.add('doc', 'sheet');
    igModal.classList.add('open');
  }

  function closeIG(){
    igModal.classList.remove('open');
    igFrame.src = 'about:blank';
    igFrame.style.display = 'block';
    sheetPreview.hidden = true;
  }

  igModal.addEventListener('click', event => { if (event.target === igModal) closeIG(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeIG(); });

  // ---- photo carousels ----
  const cars = [...document.querySelectorAll('.dr-car')].map(car => {
    const track = car.querySelector('.dr-track');
    const state = { track, pause: 0, page: +car.closest('.page').dataset.page };
    const step = () => {
      const image = track.querySelector('img');
      return image ? image.clientWidth + 12 : 0;
    };
    const navigate = direction => {
      state.pause = Date.now() + 8000;
      const max = track.scrollWidth - track.clientWidth;
      let left = track.scrollLeft + direction * step();
      if (left > max + 4) left = 0;
      if (left < -4) left = max;
      track.scrollTo({ left, behavior: 'smooth' });
    };
    car.querySelector('.dr-nav.prev').addEventListener('click', () => navigate(-1));
    car.querySelector('.dr-nav.next').addEventListener('click', () => navigate(1));
    track.addEventListener('pointerenter', () => { state.pause = Date.now() + 4000; });
    track.addEventListener('touchstart', () => { state.pause = Date.now() + 8000; }, { passive: true });
    state.step = step;
    return state;
  });

  setInterval(() => {
    if (document.hidden) return;
    cars.forEach(car => {
      if (car.page !== cur || Date.now() < car.pause) return;
      const max = car.track.scrollWidth - car.track.clientWidth;
      if (max <= 0) return;
      car.track.scrollTo({ left: car.track.scrollLeft >= max - 4 ? 0 : car.track.scrollLeft + car.step(), behavior: 'smooth' });
    });
  }, 3500);

  // ---- Matterport lazy loading ----
  let matterportInitialised = false;
  function initialiseMatterport(){
    if (matterportInitialised) return;
    matterportInitialised = true;
    const frame = document.getElementById('mpFrame');
    frame.src = frame.dataset.src;
  }

  // ---- paging ----
  let cur = 1;
  const pageCount = TEMPLATE.pages.length;
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  function showPage(pageNumber){
    const targetNumber = Math.max(1, Math.min(pageCount, pageNumber));
    const active = document.querySelector('.page.active');
    if (active && +active.dataset.page === targetNumber){
      cur = targetNumber;
      return;
    }
    const isFirstShow = !active;
    cur = targetNumber;
    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('active', +page.dataset.page === cur);
    });
    const currentPage = document.querySelector('.page.active');
    if (!isFirstShow){
      const heading = currentPage.querySelector('h1, h2');
      if (heading){
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
    window.scrollTo(0, 0);
    currentPage.querySelectorAll('.rv').forEach(element => {
      element.classList.remove('in');
      revealObserver.observe(element);
    });
    if (currentPage.dataset.section === 'technology') setTimeout(initialiseMatterport, 60);
  }

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (igModal.classList.contains('open')) return;
    if (event.key === 'ArrowRight') showPage(cur + 1);
    if (event.key === 'ArrowLeft') showPage(cur - 1);
  });

  showPage(1);

  // ---- passcode gate ----
  const passcode = String(TEMPLATE.passcode);
  const gateKey = `w-template-gate-${passcode}`;
  const gate = document.getElementById('gate');
  const form = document.getElementById('gateForm');
  const input = document.getElementById('gateInput');
  const error = document.getElementById('gateErr');
  function unlock(){ gate.classList.add('hide'); }
  if (sessionStorage.getItem(gateKey) === 'ok'){
    unlock();
  } else {
    setTimeout(() => input.focus(), 50);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (input.value.trim() === passcode){
      sessionStorage.setItem(gateKey, 'ok');
      unlock();
    } else {
      error.classList.add('show');
      input.value = '';
      input.focus();
    }
  });
})();
