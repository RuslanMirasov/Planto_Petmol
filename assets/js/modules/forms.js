const showErrors = true;

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
    regex: /^[А-Яа-яЁё]+$/,
    error: 'допустимы только буквы кириллицы',
  },
  {
    type: 'email',
    regex: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
    error: 'некоректно введён адрес емейл',
  },
  {
    type: 'tel',
    regex: /^\+7 \d{3} \d{3} \d{2} \d{2}$/,
    error: 'некоректно введён телефон',
  },
  {
    type: 'checkbox',
    error: 'необходимо согласиться с условиями',
  },
  {
    type: 'radio',
    error: 'выбор варианта обязателен',
  },
  {
    inputmode: 'decimal',
    regex: /^\d+(?:[.,]\d{1,2})?$/,
    error: 'введите число, например 100.00',
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
  if (!input.required || input.disabled) return true;

  const validationError = error => {
    addErrorHTML(error, input);
    return false;
  };

  const { name, value, checked, type } = input;
  const group = getInputGroup(input);

  if (group && (type === 'checkbox' || type === 'radio') && !group.some(field => field.checked)) {
    return validationError(validationRegEx.find(rule => rule.type === type).error);
  }

  if (!group && (type === 'checkbox' || type === 'radio') && !checked) {
    return validationError(validationRegEx.find(rule => rule.type === type).error);
  }

  if (!value || value === '') {
    return validationError('Это обязательное поле!');
  }

  const typeValidation = validationRegEx.find(v => v.type === type);

  if (typeValidation) {
    const regex = new RegExp(typeValidation.regex);

    if (!regex.test(value.trim())) {
      return validationError(typeValidation.error);
    }
  }

  const nameValidation = validationRegEx.find(v => v.name === name);

  if (nameValidation) {
    const regex = new RegExp(nameValidation.regex);

    if (!regex.test(value.trim())) {
      return validationError(nameValidation.error);
    }
  }

  const inputmodeValidation = validationRegEx.find(v => v.inputmode === input.inputMode);

  if (inputmodeValidation) {
    const regex = new RegExp(inputmodeValidation.regex);

    if (!regex.test(value.trim())) {
      return validationError(inputmodeValidation.error);
    }
  }

  removeErrorHTML(input);
  return true;
};

const validateForm = form => {
  if (!form) return;
  let errorsCount = 0;
  const validatedGroups = new Set();

  const inputs = form.querySelectorAll('[required]');
  if (inputs.length === 0) return true;

  inputs.forEach(input => {
    const group = getInputGroup(input);
    const groupKey = group ? `${input.type}:${input.name}` : null;

    if (groupKey && validatedGroups.has(groupKey)) return;
    if (groupKey) validatedGroups.add(groupKey);

    const isInputValid = validateInput(input);
    errorsCount = isInputValid ? errorsCount : errorsCount + 1;
  });

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

    if (showErrors) {
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

export const initForms = () => {
  document.addEventListener('focusin', e => {
    if (e.target.matches('[required]')) {
      onRequiredInputFocus(e);
    }
  });

  document.addEventListener('change', e => {
    if (e.target.type === 'checkbox' || e.target.type === 'radio') {
      validateInput(e.target);
    }
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

export function initPhoneInputs(mask = '+7 000 000-00-00') {
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
      thousandsSeparator: '',
      padFractionalZeros: false,
      normalizeZeros: true,
      radix: '.',
      mapToRadix: [','],
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
