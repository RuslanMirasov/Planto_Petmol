// РЕНДЕРИТЬ ТЕКСТ ОШИБОК ВАЛИДАЦИИ?
const SHOW_ERRORS = true;

// ВАЛИДИРОВАТЬ ПОЛЯ СРАЗУ ПРИ ЗАПОЛНЕНИИ?
const VALIDATE_ON_TYPING = true;

// ДЕФОЛТНЫЕ ТЕКСТЫ ОШИБОК ПОЛЕЙ РАЗНЫХ ТИПОВ
const INPUT_ERROR_DEFAULT_TEXT = 'Это обязательное поле!';
const CHECKBOX_ERROR_DEFAULT_TEXT = 'Выберите хотябы один вариант!';
const RADIO_ERROR_DEFAULT_TEXT = 'Выбор обязателен!';

export const initSelectFields = () => {
  const allSelectEl = document.querySelectorAll('[data-select]');

  if (allSelectEl.length === 0) return;

  allSelectEl.forEach(select => {
    new Choices(select, {
      searchEnabled: false,
      shouldSort: false,
    });
  });
};

const validationRegEx = [
  {
    name: 'name',
    rules: [
      { rule: 'empty', error: 'Введите ваше полное имя!' },
      { rule: /^.{2,}$/, error: 'Минимум 2 символа' },
      { rule: /^[А-Яа-яЁё]+$/, error: 'Допустимы только буквы кириллицы' },
      { rule: /^.{0,200}$/, error: 'Максимум 200 символов' },
    ],
  },
  {
    name: 'confirmation',
    rules: [{ rule: 'checked', error: 'Согласие на обработку персональных данных обязательно!' }],
  },
  {
    name: 'confirmation2',
    rules: [{ rule: 'checked', error: 'Согласие с пользовательским соглашением обязательно!' }],
  },
  {
    type: 'email',
    rules: [
      { rule: 'empty', error: 'E-mail - это обязательное поле!' },
      { rule: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, error: 'Некоректно введён адрес емейл' },
    ],
  },
  {
    type: 'tel',
    rules: [
      { rule: 'empty', error: 'Введите ваш номер телефона!' },
      { rule: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, error: 'Некоректно введён телефон' },
    ],
  },
  {
    type: 'select-one',
    rules: [{ rule: 'empty', error: INPUT_ERROR_DEFAULT_TEXT }],
  },
  {
    type: 'checkbox',
    rules: [{ rule: 'checked', error: CHECKBOX_ERROR_DEFAULT_TEXT }],
  },
  {
    type: 'radio',
    rules: [{ rule: 'selected', error: RADIO_ERROR_DEFAULT_TEXT }],
  },
];

const getInputGroup = input => {
  if (!input || (input.type !== 'checkbox' && input.type !== 'radio') || !input.name) return null;

  const scope = input.closest('form') || document;
  const group = Array.from(scope.querySelectorAll(`input[type="${input.type}"]`)).filter(field => field.name === input.name && !field.disabled);

  return group.length > 1 ? group : null;
};

const getCommonParent = inputs => {
  if (!inputs?.length) return null;

  let parent = inputs[0].parentElement;

  while (parent) {
    if (inputs.every(input => parent.contains(input))) return parent;
    parent = parent.parentElement;
  }

  return null;
};

const getInputErrorHolder = input => {
  const group = getInputGroup(input);

  if (group) return getCommonParent(group);

  return input.closest('label');
};

const getHolderError = holder => {
  if (!holder) return null;

  return Array.from(holder.children).find(child => child.classList.contains('inputError'));
};

const setInputInvalidState = (input, isInvalid) => {
  const group = getInputGroup(input) || [input];

  group.forEach(field => {
    field.classList.toggle('invalid', isInvalid);
  });
};

const validateInput = input => {
  if (!input || input.disabled) return true;

  const validationError = error => {
    addErrorHTML(error, input);
    return false;
  };

  const { name, value, type } = input;
  const group = getInputGroup(input);
  const isRequired = group ? group.some(field => field.required) : input.required;
  const validations = validationRegEx.filter(
    v => (v.name && v.name === name) || (v.type && v.type === type) || (v.inputmode && v.inputmode === input.inputMode)
  );
  const hasRequiredValidation = validations.some(validation =>
    validation.rules.some(({ rule }) => rule === 'empty' || rule === 'checked' || rule === 'selected')
  );

  if (isRequired && !hasRequiredValidation) {
    if (group && (type === 'checkbox' || type === 'radio') && !group.some(field => field.checked)) {
      return validationError(INPUT_ERROR_DEFAULT_TEXT);
    }

    if (!group && (type === 'checkbox' || type === 'radio') && !input.checked) {
      return validationError(INPUT_ERROR_DEFAULT_TEXT);
    }

    if (type !== 'checkbox' && type !== 'radio' && value.trim() === '') {
      return validationError(INPUT_ERROR_DEFAULT_TEXT);
    }
  }

  for (const validation of validations) {
    for (const { rule, error } of validation.rules) {
      if (rule === 'empty') {
        if (isRequired && value.trim() === '') {
          return validationError(error);
        }

        continue;
      }

      if (rule === 'checked') {
        if (isRequired && !input.checked) {
          return validationError(error);
        }

        continue;
      }

      if (rule === 'selected') {
        if (isRequired && group && !group.some(field => field.checked)) {
          return validationError(error);
        }

        if (isRequired && !group && !input.checked) {
          return validationError(error);
        }

        continue;
      }

      if (!isRequired && value.trim() === '') continue;

      if (!rule.test(value.trim())) {
        return validationError(error);
      }
    }
  }

  removeErrorHTML(input);
  return true;
};

const validateForm = form => {
  if (!form) return;
  let errorsCount = 0;
  let firstInvalidInput = null;
  const validatedGroups = new Set();

  const inputs = form.querySelectorAll('input, textarea, select');
  if (inputs.length === 0) return true;

  inputs.forEach(input => {
    const group = getInputGroup(input);
    const groupKey = group ? `${input.type}:${input.name}` : null;

    if (groupKey && validatedGroups.has(groupKey)) return;
    if (groupKey) validatedGroups.add(groupKey);

    const isInputValid = validateInput(input);
    if (!isInputValid && !firstInvalidInput) firstInvalidInput = input;
    errorsCount = isInputValid ? errorsCount : errorsCount + 1;
  });

  if (firstInvalidInput) {
    const scroller = document.querySelector('.body') || document.scrollingElement || document.documentElement;
    const target = getInputErrorHolder(firstInvalidInput) || firstInvalidInput;
    const header = document.querySelector('.header');
    const offset = (header?.offsetHeight || 0) + 30;
    const targetRect = target.getBoundingClientRect();

    if (scroller === document.scrollingElement || scroller === document.documentElement) {
      window.scrollTo({
        top: Math.max(0, targetRect.top + window.scrollY - offset),
        behavior: 'smooth',
      });
    } else {
      const scrollerRect = scroller.getBoundingClientRect();
      const top = targetRect.top - scrollerRect.top + scroller.scrollTop - offset;

      scroller.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth',
      });
    }
  }

  return errorsCount <= 0;
};

const addErrorHTML = (error, input) => {
  if (!input) return;

  const errorHolder = getInputErrorHolder(input);
  const existingError = getHolderError(errorHolder);
  if (!errorHolder) return;

  if (error) {
    setInputInvalidState(input, true);

    if (existingError) {
      existingError.innerHTML = `<span>${error}</span>`;
      return;
    }

    if (SHOW_ERRORS) {
      errorHolder.insertAdjacentHTML('beforeend', `<p class="inputError"><span>${error}</span></p>`);
      const newError = getHolderError(errorHolder);
      newError.style.height = newError.scrollHeight + 'px';
    }
    return;
  }

  if (existingError) existingError.remove();
  setInputInvalidState(input, false);
};

const removeErrorHTML = input => {
  if (!input) return;

  const errorHolder = getInputErrorHolder(input);
  const error = getHolderError(errorHolder);
  if (!errorHolder) return;

  setInputInvalidState(input, false);

  if (error) {
    error.style.height = '0px';
    setTimeout(() => {
      error.remove();
    }, 500);
  }
};

const onRequiredInputFocus = e => {
  const input = e.target;
  removeErrorHTML(input);
};

const initQuantityFields = () => {
  const quantityFields = document.querySelectorAll('[data-quantity]');

  if (!quantityFields.length) return;

  quantityFields.forEach(field => {
    if (field.dataset.quantityInitialized === 'true') return;

    const input = field.querySelector('input[type="number"]');
    const minusBtn = field.querySelector('[data-minus]');
    const plusBtn = field.querySelector('[data-plus]');

    if (!input || !minusBtn || !plusBtn) return;

    const min = Number.isNaN(parseFloat(input.min)) ? 0 : parseFloat(input.min);
    const step = Number.isNaN(parseFloat(input.step)) ? 1 : parseFloat(input.step);

    const getValue = () => {
      const value = parseFloat(input.value);

      return Number.isNaN(value) ? min : value;
    };

    const setValue = (value, emitChange = false) => {
      input.value = Math.max(min, value);
      if (emitChange) input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const normalizeValue = () => {
      setValue(getValue());
    };

    minusBtn.addEventListener('click', () => {
      setValue(getValue() - step, true);
    });

    plusBtn.addEventListener('click', () => {
      setValue(getValue() + step, true);
    });

    input.addEventListener('input', normalizeValue);
    input.addEventListener('change', normalizeValue);

    normalizeValue();
    field.dataset.quantityInitialized = 'true';
  });
};

export const initForms = () => {
  initQuantityFields();

  document.addEventListener('focusin', e => {
    if (e.target.matches('[required]')) {
      onRequiredInputFocus(e);
    }
  });

  document.addEventListener('input', e => {
    if (!VALIDATE_ON_TYPING || !e.target.matches('input, textarea')) return;
    if (e.target.type === 'checkbox' || e.target.type === 'radio') return;

    validateInput(e.target);
  });

  document.addEventListener('change', e => {
    if (!VALIDATE_ON_TYPING || !e.target.matches('input, textarea, select')) return;

    validateInput(e.target);
  });

  // SUBMIT MIDDLEWARE
  document.addEventListener(
    'submit',
    function (event) {
      const form = event.target;
      if (form.tagName.toLowerCase() !== 'form') return;

      const isValid = validateForm(form);
      if (!isValid) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
};

export function initPhoneInputs(mask = '+7 (000) 000-00-00') {
  const inputs = document.querySelectorAll('[type="tel"]');

  if (!inputs.length) return;

  inputs.forEach(input => {
    if (input.dataset.maskInitialized === 'true') return;

    IMask(input, {
      mask,
    });

    input.dataset.maskInitialized = 'true';
  });
}

export function initDecimalInputs() {
  const inputs = document.querySelectorAll('[inputmode="decimal"]');

  if (!inputs.length) return;

  inputs.forEach(input => {
    if (input.dataset.decimalMaskInitialized === 'true') return;

    IMask(input, {
      mask: Number,
      scale: 2,
      signed: false,
      thousandsSeparator: ' ',
      padFractionalZeros: false,
      normalizeZeros: true,
      radix: '.',
      mapToRadix: [',', ' '],
      min: 0,
    });

    input.dataset.decimalMaskInitialized = 'true';
  });
}

export const initFieldsetCollections = () => {
  const selects = document.querySelectorAll('[data-select-collection]');

  if (!selects.length) return;

  const setCollectionState = (collection, isActive) => {
    collection.classList.toggle('active', isActive);
    collection.hidden = !isActive;

    collection.querySelectorAll('input, textarea, select, button').forEach(field => {
      if (!isActive && !field.disabled) {
        field.disabled = true;
        field.dataset.collectionDisabledByScript = 'true';
        return;
      }

      if (isActive && field.dataset.collectionDisabledByScript === 'true') {
        field.disabled = false;
        delete field.dataset.collectionDisabledByScript;
      }
    });
  };

  const updateCollections = (select, keepInitialActive = false) => {
    const collectionName = select.dataset.selectCollection;
    const selectedCollection = select.value;
    const collections = document.querySelectorAll(`[data-collection="${collectionName}"]`);

    collections.forEach(collection => {
      const isActive =
        keepInitialActive && !selectedCollection ? collection.classList.contains('active') : collection.dataset.collectionName === selectedCollection;
      setCollectionState(collection, isActive);
    });
  };

  selects.forEach(select => {
    updateCollections(select, true);
    select.addEventListener('change', () => updateCollections(select));
  });
};
