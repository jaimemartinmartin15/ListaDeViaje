import { DEFAULT_TRAVEL_LIST } from './default-travel-list.js';

const SELECTORS = {
  // template ids
  SECTION_TEMPLATE: '#section-template',
  ITEM_TEMPLATE: '#item-template',

  // unique ids
  SECTIONS_LIST: 'ul#sections-list',
  CLEAN_CHECKS_BUTTON: 'button#clean-checks',
  CONFIRM_CLEAN_CHECKS_BUTTON: 'button#confirm-clean-checks',
  OVERLAY_CLEAN_CHECKS: '#overlay-clean-checks',
  NEW_SECTION_BUTTON: 'button#new-section',
  TOGGLE_ALL_SECTIONS_BUTTON: 'button#collapse-all-sections',
  TRASH_CAN_ICON: '.trash-can',

  // section template elements
  SECTION: 'li.section',
  SECTION_FOREGROUND: 'li.section .foreground',
  SECTION_BACKGROUND: 'li.section .background',
  SECTION_NAME: 'input[type="text"].section__header__name',
  SECTION_COMPLETED_ITEMS_NUMBER: '.section__header__progress__completed-items',
  SECTION_TOTAL_ITEMS_NUMBER: '.section__header__progress__total-items',
  SECTION_COLLAPSIBLE_ARROW: '.section__header__arrow',
  SECTION_COLLAPSIBLE_CONTAINER: '.section__collapsible',
  SECTION_ITEMS_CONTAINER: '.items-container',
  SECTION_ADD_ITEM_BUTTON: 'button.add-item',

  // item template elements
  ITEM: 'li.item',
  ITEM_FOREGROUND: 'li.item .foreground',
  ITEM_BACKGROUND: 'li.item .background',
  ITEM_CHECKBOX_INPUT: 'input[type="checkbox"].item__checkbox',
  ITEM_NAME_INPUT: 'input[type="text"].item__name',
};

const TEMPLATES = {
  SECTION: document.querySelector(SELECTORS.SECTION_TEMPLATE),
  ITEM: document.querySelector(SELECTORS.ITEM_TEMPLATE),
};

const ELEMENTS = {
  SECTIONS_LIST: document.querySelector(SELECTORS.SECTIONS_LIST),
  CLEAN_CHECKS_BUTTON: document.querySelector(SELECTORS.CLEAN_CHECKS_BUTTON),
  CONFIRM_CLEAN_CHECKS_BUTTON: document.querySelector(SELECTORS.CONFIRM_CLEAN_CHECKS_BUTTON),
  OVERLAY_CLEAN_CHECKS: document.querySelector(SELECTORS.OVERLAY_CLEAN_CHECKS),
  NEW_SECTION_BUTTON: document.querySelector(SELECTORS.NEW_SECTION_BUTTON),
  TOGGLE_ALL_SECTIONS_BUTTON: document.querySelector(SELECTORS.TOGGLE_ALL_SECTIONS_BUTTON),
};

const LOCAL_STORAGE_KEYS = {
  TRAVEL_LIST: 'travel-list',
};

function loadTravelListFromLocalStorage() {
  const list = localStorage.getItem(LOCAL_STORAGE_KEYS.TRAVEL_LIST);
  return list ? JSON.parse(list) : null;
}

const TRAVEL_LIST = loadTravelListFromLocalStorage() ?? DEFAULT_TRAVEL_LIST;

function loadListInView(list) {
  list.forEach((section) => addSectionToView(section));

  // set fixed height of collapsible container to allow animate it form the beginning
  document
    .querySelectorAll(SELECTORS.SECTION_COLLAPSIBLE_CONTAINER)
    .forEach((collapsibleEl) => (collapsibleEl.style.height = `${collapsibleEl.scrollHeight}px`));
}

loadListInView(TRAVEL_LIST);

function addSectionToView(model) {
  const sectionTemplateClone = TEMPLATES.SECTION.content.cloneNode(true);

  // section name
  const sectionNameInputEl = sectionTemplateClone.querySelector(SELECTORS.SECTION_NAME);
  if (model !== undefined) {
    sectionNameInputEl.value = model.name;
  }
  sectionNameInputEl.addEventListener('input', saveStateToLocalStorageFromView);

  // collapsible arrow button
  sectionTemplateClone
    .querySelector(SELECTORS.SECTION_COLLAPSIBLE_ARROW)
    .addEventListener('click', collapseSection);

  // items
  const itemsContainer = sectionTemplateClone.querySelector(SELECTORS.SECTION_ITEMS_CONTAINER);
  if (model !== undefined) {
    model.items.forEach((item) => addItemToSection(itemsContainer, item));
  } else {
    // add at least an empty item
    addItemToSection(itemsContainer);
  }

  // listener add new item button
  sectionTemplateClone
    .querySelector(SELECTORS.SECTION_ADD_ITEM_BUTTON)
    .addEventListener('click', () => addItemToSection(itemsContainer));

  // add the section to the DOM
  ELEMENTS.SECTIONS_LIST.append(sectionTemplateClone);

  // adapt the height because is set fixed to allow animation
  const collapsibleContainerEl = itemsContainer.closest(SELECTORS.SECTION_COLLAPSIBLE_CONTAINER);
  collapsibleContainerEl.style.height = `${collapsibleContainerEl.scrollHeight}px`;

  // when adding a new section, set focus on section name input
  if (model === undefined) {
    sectionNameInputEl.focus();
  }
}

function collapseSection(event) {
  const svg = event.target.closest('svg');
  const collapsible = svg.parentNode.parentNode.querySelector(
    SELECTORS.SECTION_COLLAPSIBLE_CONTAINER
  );

  if (svg.style.transform === '') {
    // hide group of items
    svg.style.transform = 'rotate(0deg)';
    collapsible.style.height = 0;
    collapsible.style.opacity = 0;
  } else {
    // show group of items
    svg.style.transform = '';
    collapsible.style.height = `${collapsible.scrollHeight}px`;
    collapsible.style.opacity = 1;
  }
}

function updateProgressOfSectionOnToggleCheck() {
  // 'this' is the checkbox element

  const sectionEl = this.closest(SELECTORS.SECTION);
  const completedItemsNumberEl = sectionEl.querySelector(SELECTORS.SECTION_COMPLETED_ITEMS_NUMBER);
  completedItemsNumberEl.textContent =
    +completedItemsNumberEl.textContent + (this.checked ? 1 : -1);
}

function addItemToSection(itemsListContainer, model) {
  const newItemTemplateClone = TEMPLATES.ITEM.content.cloneNode(true);
  const checkboxEl = newItemTemplateClone.querySelector(SELECTORS.ITEM_CHECKBOX_INPUT);
  const inputEl = newItemTemplateClone.querySelector(SELECTORS.ITEM_NAME_INPUT);

  // set model into view
  if (model !== undefined) {
    checkboxEl.checked = model.checked;
    inputEl.value = model.name;
  }

  // add event listeners
  checkboxEl.addEventListener('change', updateProgressOfSectionOnToggleCheck);
  checkboxEl.addEventListener('change', saveStateToLocalStorageFromView);
  inputEl.addEventListener('input', saveStateToLocalStorageFromView);

  itemsListContainer.append(newItemTemplateClone);

  // set the focus on the item when it is adding a new item
  if (model === undefined) {
    inputEl.focus();
  }

  // adapt the height because is set fixed to allow animation
  const collapsibleContainerEl = itemsListContainer.closest(
    SELECTORS.SECTION_COLLAPSIBLE_CONTAINER
  );
  collapsibleContainerEl.style.height = `${collapsibleContainerEl.scrollHeight}px`;

  // if the item is checked, increase the number of completed items
  if (model !== undefined && model.checked) {
    const completedItemsNumberEl = itemsListContainer
      .closest(SELECTORS.SECTION)
      .querySelector(SELECTORS.SECTION_COMPLETED_ITEMS_NUMBER);

    completedItemsNumberEl.textContent = +completedItemsNumberEl.textContent + 1;
  }

  // increase the number of total elements in the section header
  const spanEl = itemsListContainer
    .closest(SELECTORS.SECTION)
    .querySelector(SELECTORS.SECTION_TOTAL_ITEMS_NUMBER);
  spanEl.textContent = +spanEl.textContent + 1;
}

//#region bottom controls listeners

ELEMENTS.CLEAN_CHECKS_BUTTON.addEventListener('click', showConfirmationCleanCheckboxes);
function showConfirmationCleanCheckboxes() {
  ELEMENTS.OVERLAY_CLEAN_CHECKS.style.display = 'block';
  // align confirm button to appear above this button
  const position = this.getBoundingClientRect();

  ELEMENTS.CONFIRM_CLEAN_CHECKS_BUTTON.style.left = `${
    position.left + position.width / 2 - ELEMENTS.CONFIRM_CLEAN_CHECKS_BUTTON.scrollWidth / 2 - 5
  }px`;
  ELEMENTS.CONFIRM_CLEAN_CHECKS_BUTTON.style.top = `${
    position.top - ELEMENTS.CONFIRM_CLEAN_CHECKS_BUTTON.scrollHeight + 2
  }px`;
}

ELEMENTS.OVERLAY_CLEAN_CHECKS.addEventListener('click', function () {
  this.style.display = 'none';
});

ELEMENTS.CONFIRM_CLEAN_CHECKS_BUTTON.addEventListener('click', cleanCheckboxes);
function cleanCheckboxes() {
  // uncheck items
  document
    .querySelectorAll(SELECTORS.ITEM_CHECKBOX_INPUT)
    .forEach((checkboxEl) => (checkboxEl.checked = false));

  // reset progress of each section
  document
    .querySelectorAll(SELECTORS.SECTION_COMPLETED_ITEMS_NUMBER)
    .forEach((el) => (el.textContent = '0'));

  saveStateToLocalStorageFromView();
}

ELEMENTS.TOGGLE_ALL_SECTIONS_BUTTON.addEventListener('click', function () {
  const svg = this.querySelector('svg');
  if (svg.style.transform === '') {
    svg.style.transform = 'rotate(180deg)';
    document.querySelectorAll(SELECTORS.SECTION_COLLAPSIBLE_ARROW).forEach((arrowEl) => {
      if (arrowEl.style.transform === '') {
        // collapse expanded sections
        arrowEl.dispatchEvent(new Event('click'));
      }
    });
  } else {
    svg.style.transform = '';
    document.querySelectorAll(SELECTORS.SECTION_COLLAPSIBLE_ARROW).forEach((arrowEl) => {
      if (arrowEl.style.transform === 'rotate(0deg)') {
        // expand collapsed sections
        arrowEl.dispatchEvent(new Event('click'));
      }
    });
  }
});

ELEMENTS.NEW_SECTION_BUTTON.addEventListener('click', () => addSectionToView());

//#endregion bottom controls listeners

//#region delete section or item

const MIN_THRESHOLD_SCROLLING = 15;
const THRESHOLD_TO_DELETE = screen.width / 2;
const BACKGROUND_COLOR = '#ff5c5c'; // backgroundColor like in css and html
const BACKGROUND_COLOR_DELETE = '#c20000';
let elementToScrollOnDelete = null;
let initialXCoord = 0;

document.body.addEventListener('pointerdown', (event) => {
  elementToScrollOnDelete =
    event.target.closest(SELECTORS.ITEM_FOREGROUND) ??
    event.target.closest(SELECTORS.SECTION_FOREGROUND);
  if (elementToScrollOnDelete !== null) {
    initialXCoord = event.clientX;
    // delete transition to apply transform with same speed than pointer move
    elementToScrollOnDelete.style.transition = '';
  }
});

document.body.addEventListener('pointermove', (event) => {
  const distance = event.clientX - initialXCoord;
  if (elementToScrollOnDelete === null || Math.abs(distance) <= MIN_THRESHOLD_SCROLLING) {
    return;
  }

  const translation =
    distance - (distance > 0 ? MIN_THRESHOLD_SCROLLING : -MIN_THRESHOLD_SCROLLING);
  elementToScrollOnDelete.style.transform = `translateX(${translation}px)`;

  let backgroundEl;
  if (elementToScrollOnDelete.matches(SELECTORS.ITEM_FOREGROUND)) {
    backgroundEl = elementToScrollOnDelete.parentNode.querySelector(SELECTORS.ITEM_BACKGROUND);
  } else {
    backgroundEl = elementToScrollOnDelete.parentNode.querySelector(SELECTORS.SECTION_BACKGROUND);
  }
  let color;
  if (Math.abs(distance) >= THRESHOLD_TO_DELETE) {
    color = BACKGROUND_COLOR_DELETE;
  } else {
    color = BACKGROUND_COLOR;
  }

  // change color of background and svg
  backgroundEl.style.backgroundColor = color;
  document
    .querySelectorAll(`${SELECTORS.TRASH_CAN_ICON} [fill^="#"]`)
    .forEach((el) => el.setAttribute('fill', color));
  document
    .querySelectorAll(`${SELECTORS.TRASH_CAN_ICON} [stroke^="#"]`)
    .forEach((el) => el.setAttribute('stroke', color));
});

document.body.addEventListener('pointerup', (event) => {
  const distance = event.clientX - initialXCoord;

  if (elementToScrollOnDelete === null) return;

  elementToScrollOnDelete.style.transition = 'transform 0.3s';

  if (Math.abs(distance) < THRESHOLD_TO_DELETE) {
    elementToScrollOnDelete.style.transform = `translateX(0)`;
    return;
  }

  const sectionParent = elementToScrollOnDelete.closest(SELECTORS.SECTION);

  if (elementToScrollOnDelete.matches(SELECTORS.ITEM_FOREGROUND)) {
    // remove the item and adapt the height of the collapsible section, that is fixed to allow animation
    const collapsibleContainerEl = elementToScrollOnDelete.closest(
      SELECTORS.SECTION_COLLAPSIBLE_CONTAINER
    );
    const itemHeight = elementToScrollOnDelete.scrollHeight;
    elementToScrollOnDelete.closest(SELECTORS.ITEM).remove();
    collapsibleContainerEl.style.height = `${collapsibleContainerEl.scrollHeight - itemHeight}px`;
    saveStateToLocalStorageFromView();

    // adapt progress
    const totalItemsNumberEl = sectionParent.querySelector(SELECTORS.SECTION_TOTAL_ITEMS_NUMBER);
    totalItemsNumberEl.textContent = +totalItemsNumberEl.textContent - 1;
    if (elementToScrollOnDelete.querySelector(SELECTORS.ITEM_CHECKBOX_INPUT).checked) {
      const completedItemsNumberEl = sectionParent.querySelector(
        SELECTORS.SECTION_COMPLETED_ITEMS_NUMBER
      );
      completedItemsNumberEl.textContent = +completedItemsNumberEl.textContent - 1;
    }
  }

  if (
    !elementToScrollOnDelete.matches(SELECTORS.ITEM_FOREGROUND) ||
    sectionParent.querySelectorAll(SELECTORS.ITEM).length === 0
  ) {
    // animate the deletion of the section
    sectionParent.style.height = `${sectionParent.scrollHeight}px`;
    setTimeout(() => (sectionParent.style.height = '0px'));
    setTimeout(() => {
      sectionParent.remove();
      saveStateToLocalStorageFromView();
    }, 300); // like --transition-time in css
  }
});

//#endregion delete section or item

//#region save state

function saveStateToLocalStorageFromView() {
  const sectionsEl = document.querySelectorAll(SELECTORS.SECTION);

  const list = Array.from(sectionsEl).map((sectionEl) => {
    const sectionModel = {};
    sectionModel.name = sectionEl.querySelector(SELECTORS.SECTION_NAME).value;
    sectionModel.items = Array.from(sectionEl.querySelectorAll(SELECTORS.ITEM)).map((itemEl) => ({
      checked: itemEl.querySelector(SELECTORS.ITEM_CHECKBOX_INPUT).checked,
      name: itemEl.querySelector(SELECTORS.ITEM_NAME_INPUT).value,
    }));
    return sectionModel;
  });

  localStorage.setItem(LOCAL_STORAGE_KEYS.TRAVEL_LIST, JSON.stringify(list));
}

//#endregion save state
