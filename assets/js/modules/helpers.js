export const hidePreloader = () => {
  const preloader = document.querySelector('[data-preloader]');
  const body = document.querySelector('.body');

  if (!preloader || !body) return;

  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 300);

  setTimeout(() => {
    body.classList.add('loaded');
  }, 400);

  setTimeout(() => {
    preloader.remove();
  }, 2000);
};

export const initCookieMessage = () => {
  const body = document.querySelector('.body');
  const cookieMessage = document.querySelector('[data-cookie-message]');
  const closeBtn = document.querySelector('[data-close-cookie]');
  const acceptBtn = document.querySelector('[data-accept-cookie]');
  const storageKey = 'cookieAccepted';

  if (!body || !cookieMessage || !closeBtn || !acceptBtn) return;

  const setCookieMessageWidth = () => {
    const scrollbarWidth = body.offsetWidth - body.clientWidth;
    cookieMessage.style.width = `calc(100% - ${scrollbarWidth}px)`;
  };

  const hideCookieMessage = () => {
    cookieMessage.classList.remove('active');
  };

  const acceptCookies = () => {
    localStorage.setItem(storageKey, 'true');
    hideCookieMessage();
  };

  setCookieMessageWidth();

  window.addEventListener('resize', setCookieMessageWidth);
  window.addEventListener('orientationchange', setCookieMessageWidth);

  if (localStorage.getItem(storageKey) !== 'true') {
    setTimeout(() => {
      cookieMessage.classList.add('active');
    }, 2000);
  }

  closeBtn.addEventListener('click', hideCookieMessage);
  acceptBtn.addEventListener('click', acceptCookies);
};
