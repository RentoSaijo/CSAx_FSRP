const rowsElement = document.querySelector('#ranking-rows');
const countElement = document.querySelector('#ranking-count');
const searchElement = document.querySelector('#player-search');
const panelElement = document.querySelector('#ranking-panel');
const tableScroll = document.querySelector('.table-scroll');
const tabs = [...document.querySelectorAll('[role="tab"]')];
let rankings = [];
let position = 'Forwards';

function renderRows() {
  const query = searchElement.value.trim().toLocaleLowerCase();
  const visible = rankings.filter(row => row.position === position && row.player.toLocaleLowerCase().includes(query));
  const fragment = document.createDocumentFragment();
  for (const row of visible) {
    const tr = document.createElement('tr');
    for (const value of [row.rank, row.player, row.csax.toFixed(2), `${row.percentile.toFixed(2)}%`, row.trackedGames]) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    fragment.append(tr);
  }
  if (!visible.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'No matching players.';
    tr.append(td);
    fragment.append(tr);
  }
  rowsElement.replaceChildren(fragment);
  countElement.textContent = `Showing ${visible.length} of ${rankings.filter(row => row.position === position).length} ${position.toLocaleLowerCase()}`;
  tableScroll.scrollTop = 0;
  tableScroll.scrollLeft = 0;
  setTimeout(() => {
    tableScroll.scrollTop = 0;
    tableScroll.scrollLeft = 0;
  });
}

function selectPosition(nextPosition) {
  position = nextPosition;
  for (const tab of tabs) {
    const selected = tab.dataset.position === position;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected) panelElement.setAttribute('aria-labelledby', tab.id);
  }
  renderRows();
}

for (const tab of tabs) {
  tab.addEventListener('click', () => selectPosition(tab.dataset.position));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = tabs.find(item => item !== tab);
    selectPosition(next.dataset.position);
    next.focus();
  });
}
searchElement.addEventListener('input', renderRows);

fetch('./rankings.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    rankings = data;
    renderRows();
  })
  .catch(() => {
    rowsElement.innerHTML = '<tr><td colspan="5">Rankings are temporarily unavailable. Please reload the page.</td></tr>';
    countElement.textContent = 'Rankings unavailable';
  });
