import { popup } from './modules/popup.js';
import { initScrollManager } from './modules/scrollManager.js';
import { initDecimalInputs, initForms, initPhoneInputs, initSelectFields } from './modules/forms.js';
import { hidePreloader } from './modules/helpers.js';
import { initAccordeons } from './modules/accordeon.js';

popup.init();
window.popup = popup;

document.addEventListener('DOMContentLoaded', () => {
  hidePreloader();
  initForms();
  initAccordeons();
  initPhoneInputs('+7 000 000 00 00');
  initSelectFields();
  initDecimalInputs();
  initScrollManager();
});
