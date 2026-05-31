const getSelectorValue = value => {
  const stringValue = String(value);

  return globalThis.CSS?.escape ? globalThis.CSS.escape(stringValue) : stringValue.replace(/"/g, '\\"');
};

const getTabsGroup = groupName => {
  if (typeof Element !== 'undefined' && groupName instanceof Element) return groupName;

  return document.querySelector(`[data-tabs="${getSelectorValue(groupName)}"]`);
};

const getGroupItems = (tabsGroup, selector) => {
  return Array.from(tabsGroup.querySelectorAll(selector)).filter(item => item.closest('[data-tabs]') === tabsGroup);
};

const getActiveTab = tabsGroup => {
  return getGroupItems(tabsGroup, '[data-tab]').find(item => item.classList.contains('active'));
};

const setActiveButton = (tabsGroup, tabName) => {
  getGroupItems(tabsGroup, '[data-tab-target]').forEach(button => {
    button.classList.toggle('active', button.dataset.tabTarget === tabName);
  });
};

const ensureActiveTab = tabsGroup => {
  const tabs = getGroupItems(tabsGroup, '[data-tab]');

  if (tabs.length === 0) return null;

  const activeTabs = tabs.filter(tab => tab.classList.contains('active'));
  const activeTab = activeTabs[0] || tabs[0];

  tabs.forEach(tab => {
    const isActive = tab === activeTab;

    tab.classList.toggle('active', isActive);

    if (!isActive) {
      tab.style.height = '0px';
    }
  });

  setActiveButton(tabsGroup, activeTab.dataset.tab);

  return activeTab;
};

const getDirectNestedTabsGroups = tab => {
  return Array.from(tab.querySelectorAll('[data-tabs]')).filter(tabsGroup => tabsGroup.parentElement?.closest('[data-tab]') === tab);
};

const getActiveTabsChain = tabsGroup => {
  const chain = [];
  let currentGroup = tabsGroup;

  while (currentGroup) {
    const activeTab = ensureActiveTab(currentGroup);

    if (!activeTab) break;

    chain.push(activeTab);

    currentGroup = getDirectNestedTabsGroups(activeTab).find(group => getActiveTab(group));
  }

  return chain;
};

const setActiveTabsChainHeight = tabsGroup => {
  const chain = getActiveTabsChain(tabsGroup);
  const deepestActiveTab = chain[chain.length - 1];

  if (!deepestActiveTab) return;

  const height = deepestActiveTab.scrollHeight + 'px';

  chain.forEach(tab => {
    tab.style.height = height;
  });
};

const getRootTabsGroups = () => {
  return Array.from(document.querySelectorAll('[data-tabs]')).filter(tabsGroup => !tabsGroup.parentElement?.closest('[data-tabs]'));
};

const updateAllActiveTabsHeight = () => {
  Array.from(document.querySelectorAll('[data-tabs]')).forEach(ensureActiveTab);
  getRootTabsGroups().forEach(setActiveTabsChainHeight);
};

const scheduleActiveTabsHeightUpdate = () => {
  updateAllActiveTabsHeight();

  const updateAfterFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : callback => setTimeout(callback, 0);

  updateAfterFrame(() => {
    updateAllActiveTabsHeight();
  });
};

export const openTab = (groupName, tabName) => {
  const tabsGroup = getTabsGroup(groupName);

  if (!tabsGroup || tabName === undefined || tabName === null) return;

  const buttons = getGroupItems(tabsGroup, '[data-tab-target]');
  const tabs = getGroupItems(tabsGroup, '[data-tab]');
  const button = buttons.find(item => item.dataset.tabTarget === String(tabName));
  const targetTab = tabs.find(item => item.dataset.tab === String(tabName));
  const activeButton = buttons.find(item => item.classList.contains('active'));
  const activeTab = tabs.find(item => item.classList.contains('active'));

  if (!targetTab) return;

  if (activeButton) {
    activeButton.classList.remove('active');
  }

  if (activeTab) {
    activeTab.classList.remove('active');
    activeTab.style.height = '0px';
  }

  if (button) {
    button.classList.add('active');
  } else {
    setActiveButton(tabsGroup, targetTab.dataset.tab);
  }

  targetTab.classList.add('active');
  scheduleActiveTabsHeightUpdate();
};

export const initTabs = () => {
  const tabsGroups = Array.from(document.querySelectorAll('[data-tabs]'));

  if (tabsGroups.length === 0) return;

  tabsGroups.forEach(tabsGroup => {
    const tabButtons = getGroupItems(tabsGroup, '[data-tab-target]');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => openTab(tabsGroup, btn.dataset.tabTarget));
    });
  });

  scheduleActiveTabsHeightUpdate();
};

if (typeof window !== 'undefined') {
  window.openTab = openTab;
}
