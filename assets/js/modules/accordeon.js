export const initAccordeons = () => {
  const accordeons = document.querySelectorAll('[data-accordeon]');

  if (!accordeons.length) return;

  const getOwnElement = (accordeon, selector) => {
    return Array.from(accordeon.querySelectorAll(selector)).find(el => el.closest('[data-accordeon]') === accordeon);
  };

  const getBody = accordeon => getOwnElement(accordeon, '[data-accordeon-body]');
  const getHeader = accordeon => getOwnElement(accordeon, '[data-accordeon-header]');

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

  const toggleAccordeon = accordeon => {
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

  Array.from(accordeons)
    .reverse()
    .forEach(accordeon => {
      const header = getHeader(accordeon);
      const body = getBody(accordeon);

      if (!header || !body) return;

      body.style.transition = 'height 0.5s ease 0s';
      setBodyHeight(accordeon);

      header.addEventListener('click', () => toggleAccordeon(accordeon));
      body.addEventListener('transitionend', event => {
        if (event.target === body && event.propertyName === 'height') {
          if (accordeon.classList.contains('active')) {
            body.style.height = 'auto';
            body.style.overflow = 'visible';
          } else {
            body.style.overflow = 'hidden';
          }

          releaseParentHeights(accordeon);
        }
      });
    });

  window.addEventListener('resize', () => {
    Array.from(accordeons)
      .reverse()
      .forEach(accordeon => {
        if (accordeon.classList.contains('active')) {
          setBodyHeight(accordeon);
        }
      });
  });
};
