export const initAccordeons = () => {
  if (window.__accordeonsInitialized) return;
  window.__accordeonsInitialized = true;

  const initializedAccordeons = new WeakSet();

  const getOwnElement = (accordeon, selector) => {
    return Array.from(accordeon.querySelectorAll(selector)).find(el => el.closest('[data-accordeon]') === accordeon);
  };

  const getBody = accordeon => getOwnElement(accordeon, '[data-accordeon-body]');

  const getActiveParentAccordeons = accordeon => {
    const parents = [];
    let parentBody = accordeon.parentElement?.closest('[data-accordeon-body]');

    while (parentBody) {
      const parentAccordeon = parentBody.closest('[data-accordeon]');

      if (parentAccordeon?.classList.contains('active')) {
        parents.push(parentAccordeon);
      }

      parentBody = parentAccordeon?.parentElement?.closest('[data-accordeon-body]');
    }

    return parents;
  };

  const setBodyHeight = accordeon => {
    const body = getBody(accordeon);
    if (!body) return;

    if (accordeon.classList.contains('active')) {
      body.style.height = 'auto';
      body.style.overflow = 'visible';
    } else {
      body.style.height = '0px';
      body.style.overflow = 'hidden';
    }
  };

  const releaseParentHeights = accordeon => {
    getActiveParentAccordeons(accordeon).forEach(parentAccordeon => {
      const body = getBody(parentAccordeon);
      if (!body) return;

      body.style.height = 'auto';
      body.style.overflow = 'visible';
    });
  };

  const prepareAccordeon = accordeon => {
    if (initializedAccordeons.has(accordeon)) return;

    const body = getBody(accordeon);
    if (!body) return;

    body.style.transition = 'height 0.5s ease 0s';
    setBodyHeight(accordeon);
    initializedAccordeons.add(accordeon);
  };

  const toggleAccordeon = accordeon => {
    prepareAccordeon(accordeon);

    const body = getBody(accordeon);
    if (!body) return;

    const isActive = accordeon.classList.contains('active');

    releaseParentHeights(accordeon);

    if (isActive) {
      body.style.overflow = 'hidden';
      body.style.height = `${body.scrollHeight}px`;
      void body.offsetHeight;
      accordeon.classList.remove('active');

      requestAnimationFrame(() => {
        body.style.height = '0px';
      });
    } else {
      accordeon.classList.add('active');
      body.style.overflow = 'hidden';
      body.style.height = '0px';
      void body.offsetHeight;

      requestAnimationFrame(() => {
        body.style.height = `${body.scrollHeight}px`;
      });
    }
  };

  document.querySelectorAll('[data-accordeon]').forEach(prepareAccordeon);

  document.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const header = target.closest('[data-accordeon-head]');
    if (!header) return;

    const accordeon = header.closest('[data-accordeon]');
    if (!accordeon) return;

    toggleAccordeon(accordeon);
  });

  document.addEventListener('transitionend', event => {
    if (event.propertyName !== 'height') return;

    const body = event.target;
    if (!(body instanceof Element) || !body.matches('[data-accordeon-body]')) return;

    const accordeon = body.closest('[data-accordeon]');
    if (!accordeon) return;

    if (accordeon.classList.contains('active')) {
      body.style.height = 'auto';
      body.style.overflow = 'visible';
    } else {
      body.style.overflow = 'hidden';
    }

    releaseParentHeights(accordeon);
  });

  window.addEventListener('resize', () => {
    Array.from(document.querySelectorAll('[data-accordeon]'))
      .reverse()
      .forEach(accordeon => {
        prepareAccordeon(accordeon);

        if (accordeon.classList.contains('active')) {
          setBodyHeight(accordeon);
        }
      });
  });
};
