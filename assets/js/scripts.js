import { popup } from './modules/popup.js';
import { initScrollManager } from './modules/scrollManager.js';
import { initDecimalInputs, initForms, initPhoneInputs, initSelectFields, initFieldsetCollections } from './modules/forms.js';
import { hidePreloader, initCookieMessage } from './modules/helpers.js';
import { initAccordeons } from './modules/accordeon.js';

popup.init();
window.popup = popup;

document.addEventListener('DOMContentLoaded', () => {
  initCookieMessage();
  hidePreloader();
  initAccordeons();
  initScrollManager();

  // forms plugins
  initForms();
  initPhoneInputs();
  initDecimalInputs();
  initSelectFields();
  initFieldsetCollections();
});
