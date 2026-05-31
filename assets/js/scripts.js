import { popup } from './modules/popup.js';
import { initScrollManager } from './modules/scrollManager.js';
import { initDecimalInputs, initForms, initPhoneInputs, initSelectFields } from './modules/forms.js';
import { initNavigationMenu, initDropzones, hidePreloader } from './modules/helpers.js';
import { initTabs } from './modules/tabs.js';
import { initAccordeons } from './modules/accordeon.js';

popup.init();
window.popup = popup;

document.addEventListener('DOMContentLoaded', () => {
  hidePreloader();
  initForms();
  initNavigationMenu();
  initTabs();
  initAccordeons();
  initPhoneInputs('+7 000 000 00 00');
  initSelectFields();
  initDecimalInputs();
  initDropzones();
  initScrollManager();
});
