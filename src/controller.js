import { TRAVEL_LIST } from "./travel-list.js";

const TEMPLATES = {
  ITEM_GROUP: document.querySelector("#items-group-template"),
  ITEM: document.querySelector("#item-template"),
};

const ELEMENTS = {
  ITEM_GROUPS_CONTAINER: document.querySelector("#items-group-container"),
  LIST_NAME: document.querySelector("#list-name"),
  CLEAN_CHECKS_BUTTON: document.querySelector(".clean-checks-button"),
  NEW_ITEM_GROUP_BUTTON: document.querySelector(".new-item-group-button"),
};

const LOCAL_STORAGE_KEYS = {
  LISTS: "lists",
};

function loadListsFromLocalStorage() {
  const lists = localStorage.getItem(LOCAL_STORAGE_KEYS.LISTS);
  return lists ? JSON.parse(lists) : null;
}

const lists = loadListsFromLocalStorage() ?? [TRAVEL_LIST];

function loadListInView(list) {
  ELEMENTS.LIST_NAME.textContent = list.listName;

  list.itemGroups.forEach((itemGroup) => {
    const itemGroupTemplateClone = TEMPLATES.ITEM_GROUP.content.cloneNode(true);

    itemGroupTemplateClone.querySelector(".items-group-header__name").value = itemGroup.title;
    itemGroupTemplateClone
      .querySelector(".items-group-header__arrow")
      .addEventListener("click", collapseSection);

    const itemsContainer = itemGroupTemplateClone.querySelector(".items-container");

    itemGroup.items.forEach((item) => {
      const itemTemplateClone = TEMPLATES.ITEM.content.cloneNode(true);
      itemTemplateClone.querySelector(".item__name").value = item.name;
      itemsContainer.append(itemTemplateClone);
    });

    itemGroupTemplateClone
      .querySelector(".add-item-button")
      .addEventListener("click", () => addNewItem(itemGroup, itemsContainer));

    ELEMENTS.ITEM_GROUPS_CONTAINER.append(itemGroupTemplateClone);
  });
}

function collapseSection(event) {
  const svg = event.target.closest("svg");
  const collapsible = svg.parentNode.parentNode.querySelector(".collapsible");

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

loadListInView(lists[0]);

function addNewItem(itemGroup, itemsContainer) {
  // TODO: improvement - add only if last one is not empty!

  itemGroup.items.push({ name: "Nuevo ítem", checked: false });
  const newItemTemplateClone = TEMPLATES.ITEM.content.cloneNode(true);
  const input = newItemTemplateClone.querySelector(".item__name");
  input.placeholder = "Nuevo ítem";
  itemsContainer.append(newItemTemplateClone);
  input.focus();
}

//#region bottom controls listeners

ELEMENTS.CLEAN_CHECKS_BUTTON.addEventListener("click", cleanCheckboxes);
function cleanCheckboxes() {
  // clean view
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkboxEl) => (checkboxEl.checked = false));

  // clean model
  TRAVEL_LIST.itemGroups.forEach((itemGroup) =>
    itemGroup.items.forEach((item) => (item.checked = false))
  );

  // TODO ask confirmation
}

ELEMENTS.NEW_ITEM_GROUP_BUTTON.addEventListener("click", addNewItemGroup);
function addNewItemGroup() {
  const newItemGroupModel = {
    title: "",
    items: [],
  };

  const itemGroupTemplateClone = TEMPLATES.ITEM_GROUP.content.cloneNode(true);

  itemGroupTemplateClone
    .querySelector(".items-group-header__arrow")
    .addEventListener("click", collapseSection);

  const itemsContainer = itemGroupTemplateClone.querySelector(".items-container");

  // add at least a new empty item
  addNewItem(newItemGroupModel, itemsContainer);

  itemGroupTemplateClone
    .querySelector(".add-item-button")
    .addEventListener("click", () => addNewItem(newItemGroupModel, itemsContainer));

  ELEMENTS.ITEM_GROUPS_CONTAINER.append(itemGroupTemplateClone);
}

//#endregion bottom controls listeners

//#region delete items group or item

let elementToDelete = null;
let initialXCoord = 0;

document.addEventListener("pointerdown", (event) => {
  // TODO delete items-group only if click was origin in the header
  elementToDelete = event.target.closest("div.item") ?? event.target.closest("section.items-group");
  if (elementToDelete !== null) {
    initialXCoord = event.clientX;
    elementToDelete.style.position = "relative";
  }
});

document.addEventListener("pointermove", (event) => {
  const distance = event.clientX - initialXCoord;
  const minThreshold = 10;
  const maxThreshold = 80;
  if (
    elementToDelete !== null &&
    Math.abs(distance) > minThreshold &&
    Math.abs(distance) < maxThreshold
  ) {
    const translation = distance - (distance > 0 ? minThreshold : -minThreshold);
    elementToDelete.style.transform = `translateX(${translation}px)`;
  }
});

document.addEventListener("pointerup", (event) => {
  const distance = event.clientX - initialXCoord;
  const threshold = 40;
  if (elementToDelete !== null && Math.abs(distance) < threshold) {
    elementToDelete.style.transform = `translateX(0)`;
  } else if (elementToDelete !== null) {
    elementToDelete.style.transform = `translateX(${distance > 0 ? "80px" : "-80px"})`;
  }
});

//#endregion delete items group or item
