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
