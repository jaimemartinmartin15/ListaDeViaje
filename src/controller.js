import { TRAVEL_LIST } from "./travel-list.js";

const TEMPLATES = {
  ITEM_GROUP: document.querySelector("#items-group-template"),
  ITEM: document.querySelector("#item-template"),
};

const ELEMENTS = {
  ITEM_GROUPS_CONTAINER: document.querySelector("#items-group-container"),
  LIST_NAME: document.querySelector("#list-name"),
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
