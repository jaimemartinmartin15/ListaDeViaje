const LOCAL_STORAGE_KEYS = {
  TRAVEL_LIST: 'travel-list',
};

function loadTravelListFromLocalStorage() {
  const list = localStorage.getItem(LOCAL_STORAGE_KEYS.TRAVEL_LIST);
  return list ? JSON.parse(list) : null;
}

const TRAVEL_LIST = loadTravelListFromLocalStorage();

if (TRAVEL_LIST != null) {
  document.querySelector('a').href = `https://listas.jaimeelingeniero.es?lista-de-viaje=${JSON.stringify(TRAVEL_LIST)}`;
}
