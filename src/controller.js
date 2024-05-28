import { DEFAULT_TRAVEL_LIST } from "./default-travel-list.js";

const SELECTORS = {
  // template ids
  SECTION_TEMPLATE: "#section-template",
  ITEM_TEMPLATE: "#item-template",

  // unique ids
  SECTIONS_LIST: "ul#sections-list",
  CLEAN_CHECKS_BUTTON: "button#clean-checks",
  NEW_SECTION_BUTTON: "button#new-section",

  // section template elements
  SECTION: "li.section",
  SECTION_FOREGROUND: "li.section .foreground",
  SECTION_NAME: 'input[type="text"].section__header__name',
  SECTION_COLLAPSIBLE_ARROW: ".section__header__arrow",
  SECTION_COLLAPSIBLE_CONTAINER: "section__collapsible",
  SECTION_ITEMS_CONTAINER: ".items-container",
  SECTION_ADD_ITEM_BUTTON: "button.add-item",

  // item template elements
  ITEM: "li.item",
  ITEM_FOREGROUND: "li.item .foreground",
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
  } else {
    // show group of items
    svg.style.transform = "";
    collapsible.style.height = "auto";
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
  sectionTemplateClone
    .querySelector(SELECTORS.SECTION_NAME)
    .addEventListener("input", saveStateToLocalStorageFromView);

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
}

//#endregion bottom controls listeners

//#region delete items group or item

let elementToScrollOnDelete = null;
let initialXCoord = 0;

document.addEventListener("pointerdown", (event) => {
  // TODO delete items-group only if click was origin in the header
  elementToScrollOnDelete =
    event.target.closest(SELECTORS.ITEM_FOREGROUND) ??
    event.target.closest(SELECTORS.SECTION_FOREGROUND);
  if (elementToScrollOnDelete !== null) {
    initialXCoord = event.clientX;
    elementToScrollOnDelete.style.position = "relative";
  }
});

document.addEventListener("pointermove", (event) => {
  const distance = event.clientX - initialXCoord;
  const minThreshold = 10;
  const maxThreshold = 80;
  if (
    elementToScrollOnDelete !== null &&
    Math.abs(distance) > minThreshold &&
    Math.abs(distance) < maxThreshold
  ) {
    const translation = distance - (distance > 0 ? minThreshold : -minThreshold);
    elementToScrollOnDelete.style.transform = `translateX(${translation}px)`;
  }
});

document.addEventListener("pointerup", (event) => {
  const distance = event.clientX - initialXCoord;
  const threshold = 40;
  if (elementToScrollOnDelete !== null && Math.abs(distance) < threshold) {
    elementToScrollOnDelete.style.transform = `translateX(0)`;
  } else if (elementToScrollOnDelete !== null) {
    elementToScrollOnDelete.style.transform = `translateX(${distance > 0 ? "80px" : "-80px"})`;
  }
});

//#endregion delete items group or item

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
