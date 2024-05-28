import { DEFAULT_TRAVEL_LIST } from "./default-travel-list.js";

const SELECTORS = {
  // template ids
  SECTION_TEMPLATE: "#section-template",
  ITEM_TEMPLATE: "#item-template",

  // unique ids
  SECTIONS_LIST: "ul#sections-list",
  CLEAN_CHECKS_BUTTON: "button#clean-checks",
  NEW_SECTION_BUTTON: "button#new-section",
  TRASH_CAN_ICON: ".trash-can",

  // section template elements
  SECTION: "li.section",
  SECTION_FOREGROUND: "li.section .foreground",
  SECTION_BACKGROUND: "li.section .background",
  SECTION_NAME: 'input[type="text"].section__header__name',
  SECTION_COLLAPSIBLE_ARROW: ".section__header__arrow",
  SECTION_COLLAPSIBLE_CONTAINER: ".section__collapsible",
  SECTION_ITEMS_CONTAINER: ".items-container",
  SECTION_ADD_ITEM_BUTTON: "button.add-item",

  // item template elements
  ITEM: "li.item",
  ITEM_FOREGROUND: "li.item .foreground",
  ITEM_BACKGROUND: "li.item .background",
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
  NEW_SECTION_BUTTON: document.querySelector(SELECTORS.NEW_SECTION_BUTTON),
};

const LOCAL_STORAGE_KEYS = {
  TRAVEL_LIST: "travel-list",
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
  sectionNameInputEl.addEventListener("input", saveStateToLocalStorageFromView);

  // collapsible arrow button
  sectionTemplateClone
    .querySelector(SELECTORS.SECTION_COLLAPSIBLE_ARROW)
    .addEventListener("click", collapseSection);

  // items
  const itemsContainer = sectionTemplateClone.querySelector(SELECTORS.SECTION_ITEMS_CONTAINER);
  if (model !== undefined) {
    model.items.forEach((item) => {
      const itemTemplateClone = TEMPLATES.ITEM.content.cloneNode(true);

      // checkbox
      itemTemplateClone.querySelector(SELECTORS.ITEM_CHECKBOX_INPUT).checked = item.checked;
      itemTemplateClone
        .querySelector(SELECTORS.ITEM_CHECKBOX_INPUT)
        .addEventListener("change", saveStateToLocalStorageFromView);

      // item name
      itemTemplateClone.querySelector(SELECTORS.ITEM_NAME_INPUT).value = item.name;
      itemTemplateClone
        .querySelector(SELECTORS.ITEM_NAME_INPUT)
        .addEventListener("input", saveStateToLocalStorageFromView);

      itemsContainer.append(itemTemplateClone);
    });
  } else {
    // add at least an empty item
    addItemToSectionView(itemsContainer);
  }

  // listener add new item button
  sectionTemplateClone
    .querySelector(SELECTORS.SECTION_ADD_ITEM_BUTTON)
    .addEventListener("click", () => addItemToSectionView(itemsContainer));

  ELEMENTS.SECTIONS_LIST.append(sectionTemplateClone);
}

function collapseSection(event) {
  const svg = event.target.closest("svg");
  const collapsible = svg.parentNode.parentNode.querySelector(
    SELECTORS.SECTION_COLLAPSIBLE_CONTAINER
  );

  if (svg.style.transform === "") {
    // hide group of items
    svg.style.transform = "rotate(0deg)";
    collapsible.style.height = 0;
    collapsible.style.opacity = 0;
  } else {
    // show group of items
    svg.style.transform = "";
    collapsible.style.height = `${collapsible.scrollHeight}px`;
    collapsible.style.opacity = 1;
  }
}

function addItemToSectionView(itemsListContainer, model) {
  // * TODO: improvement - add only if last one is not empty!

  const newItemTemplateClone = TEMPLATES.ITEM.content.cloneNode(true);
  const checkboxEl = newItemTemplateClone.querySelector(SELECTORS.ITEM_CHECKBOX_INPUT);
  const inputEl = newItemTemplateClone.querySelector(SELECTORS.ITEM_NAME_INPUT);

  // set model into view
  if (model !== undefined) {
    checkboxEl.checked = model.checked;
    inputEl.value = model.name;
  }

  // add event listeners
  checkboxEl.addEventListener("change", saveStateToLocalStorageFromView);
  inputEl.addEventListener("input", saveStateToLocalStorageFromView);

  itemsListContainer.append(newItemTemplateClone);

  if (model === undefined) {
    // the user is adding a new item pressing the add item button
    inputEl.focus();
  }
}

//#region bottom controls listeners

ELEMENTS.CLEAN_CHECKS_BUTTON.addEventListener("click", cleanCheckboxes);
function cleanCheckboxes() {
  // TODO ask confirmation before cleaning

  document
    .querySelectorAll(SELECTORS.ITEM_CHECKBOX_INPUT)
    .forEach((checkboxEl) => (checkboxEl.checked = false));

  saveStateToLocalStorageFromView();
}

ELEMENTS.NEW_SECTION_BUTTON.addEventListener("click", addNewSectionToView);
function addNewSectionToView() {
  const sectionTemplateClone = TEMPLATES.SECTION.content.cloneNode(true);

  // listener section name
  const sectionNameEl = sectionTemplateClone.querySelector(SELECTORS.SECTION_NAME);
  sectionNameEl.addEventListener("input", saveStateToLocalStorageFromView);

  // listener to expand and collapse the section
  sectionTemplateClone
    .querySelector(SELECTORS.SECTION_COLLAPSIBLE_ARROW)
    .addEventListener("click", collapseSection);

  const itemsContainer = sectionTemplateClone.querySelector(SELECTORS.SECTION_ITEMS_CONTAINER);

  // add at least a new empty item
  addItemToSectionView(itemsContainer);

  sectionTemplateClone
    .querySelector(SELECTORS.SECTION_ADD_ITEM_BUTTON)
    .addEventListener("click", () => addItemToSectionView(itemsContainer));

  ELEMENTS.SECTIONS_LIST.append(sectionTemplateClone);
  sectionNameEl.focus();
}

//#endregion bottom controls listeners

//#region delete section or item

const MIN_THRESHOLD_SCROLLING = 15;
const THRESHOLD_TO_DELETE = screen.width / 2;
const BACKGROUND_COLOR = "#ff5c5c"; // backgroundColor like in css and html
const BACKGROUND_COLOR_DELETE = "#c20000";
let elementToScrollOnDelete = null;
let initialXCoord = 0;

document.body.addEventListener("pointerdown", (event) => {
  elementToScrollOnDelete =
    event.target.closest(SELECTORS.ITEM_FOREGROUND) ??
    event.target.closest(SELECTORS.SECTION_FOREGROUND);
  if (elementToScrollOnDelete !== null) {
    initialXCoord = event.clientX;
  }
});

document.body.addEventListener("pointermove", (event) => {
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
    .forEach((el) => el.setAttribute("fill", color));
  document
    .querySelectorAll(`${SELECTORS.TRASH_CAN_ICON} [stroke^="#"]`)
    .forEach((el) => el.setAttribute("stroke", color));
});

document.body.addEventListener("pointerup", (event) => {
  const distance = event.clientX - initialXCoord;
  if (elementToScrollOnDelete !== null && Math.abs(distance) < THRESHOLD_TO_DELETE) {
    elementToScrollOnDelete.style.transform = `translateX(0)`;
  } else if (elementToScrollOnDelete !== null) {
    const sectionParent = elementToScrollOnDelete.closest(SELECTORS.SECTION);

    if (elementToScrollOnDelete.matches(SELECTORS.ITEM_FOREGROUND)) {
      elementToScrollOnDelete.closest(SELECTORS.ITEM).remove();
    } else {
      elementToScrollOnDelete.closest(SELECTORS.SECTION).remove();
    }
    if (sectionParent.querySelectorAll(SELECTORS.ITEM).length === 0) {
      sectionParent.remove();
    }

    saveStateToLocalStorageFromView();
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
