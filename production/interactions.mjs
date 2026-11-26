const savedKey = 'asw-saved-v2';
const legacy = location.hash.match(/^#\/(taos|santa-fe)(?:\/(artists|galleries|experiences|food|lodging)(?:\/([a-z\d-]+)(?:\/([a-z\d-]+))?)?)?\/?$/i);
if (legacy) location.replace('/' + legacy.slice(1).filter(Boolean).join('/'));
if (location.hash === '#/plan') location.replace('/plan');
if (location.hash === '#/') history.replaceState(null, '', location.pathname + location.search);

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function isPublicPath(value) {
  return typeof value === 'string' && /^\/(taos|santa-fe)\/(artists|galleries|experiences|food|lodging)\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/i.test(value);
}

let saved = [];
try {
  const value = JSON.parse(localStorage.getItem(savedKey) || '[]');
  if (Array.isArray(value)) saved = value.filter(item => item && isPublicPath(item.href) && typeof item.title === 'string').slice(0, 50);
} catch {}

const toast = document.querySelector('#toast');
let toastTimer;
function announce(text) {
  toast.textContent = text;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

function savedView() {
  const list = document.querySelector('#saved-selections');
  if (!list) return;
  if (!saved.length) {
    list.replaceChildren(node('p', 'Save a work or place to find it here.', 'muted'));
    return;
  }
  list.replaceChildren(...saved.map(item => {
    const row = node('article', '', 'plan-item saved-item');
    const details = node('div');
    const heading = node('h3');
    const link = node('a', item.title);
    link.href = item.href;
    heading.append(link);
    details.append(heading, node('p', item.label || ''));
    const remove = node('button', 'Remove', 'text-link');
    remove.type = 'button';
    remove.addEventListener('click', () => toggle(item));
    row.append(details, remove);
    return row;
  }));
}

const buttons = [...document.querySelectorAll('[data-save]')];
function updateButtons() {
  document.querySelector('#plan-count').textContent = saved.length;
  for (const button of buttons) {
    const active = saved.some(item => item.href === button.dataset.save);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', (active ? 'Remove ' : 'Save ') + button.dataset.title + (active ? ' from your plan' : ' to your plan'));
    button.classList.toggle('saved', active);
  }
}

function toggle(item) {
  const exists = saved.some(savedItem => savedItem.href === item.href);
  if (!exists && saved.length >= 50) return announce('Remove an item to save another.');
  saved = exists ? saved.filter(savedItem => savedItem.href !== item.href) : [...saved, item];
  try { localStorage.setItem(savedKey, JSON.stringify(saved)); } catch {}
  updateButtons();
  savedView();
  announce(exists ? 'Removed from your plan.' : 'Saved to your plan.');
}

for (const button of buttons) {
  const { save, title, label } = button.dataset;
  if (isPublicPath(save)) button.addEventListener('click', () => toggle({ href: save, title, label }));
}
updateButtons();
savedView();

const filter = document.querySelector('[data-catalog-filter]');
const filterItems = [...document.querySelectorAll('[data-filter-item]')];
if (filter && filterItems.length) {
  const count = document.querySelector('[data-filter-count]');
  const empty = document.querySelector('#filter-empty');
  function applyFilter() {
    const query = filter.value.toLowerCase().trim();
    let visible = 0;
    for (const item of filterItems) {
      item.hidden = !item.dataset.filterText.toLowerCase().includes(query);
      if (!item.hidden) visible++;
    }
    count.textContent = visible + ' ' + (visible === 1 ? 'listing' : 'listings');
    empty.hidden = visible > 0;
  }
  filter.addEventListener('input', applyFilter);
  applyFilter();
}

const itinerary = document.querySelector('#itinerary');
if (itinerary) {
  const result = document.querySelector('#plan-result');
  const submit = itinerary.querySelector('[type="submit"]');
  let previousStops = [];
  async function createPlan(revise) {
    const input = Object.fromEntries(new FormData(itinerary));
    submit.disabled = true;
    result.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Intake-Request': '1' },
        body: JSON.stringify({ ...input, avoid: revise ? previousStops : [] }),
        signal: AbortSignal.timeout(14000),
      });
      if (!response.ok) throw new Error('Plan could not be created.');
      const plan = await response.json();
      previousStops = plan.stops.map(stop => stop.id);
      const list = node('ol');
      for (const stop of plan.stops) {
        const item = node('li');
        const confirm = node('a', 'Confirm hours and access', 'text-link');
        if (typeof stop.source === 'string' && stop.source.startsWith('https://')) confirm.href = stop.source;
        item.append(node('strong', stop.time + '  ' + stop.name), node('p', stop.duration + ' minutes suggested. ' + stop.reason), confirm);
        list.append(item);
      }
      const reviseButton = node('button', 'Try a different route', 'button secondary');
      reviseButton.type = 'button';
      reviseButton.addEventListener('click', () => createPlan(true));
      result.replaceChildren(node('h2', plan.mode === 'ai' ? 'Your itinerary' : 'Suggested itinerary'), node('p', plan.note), list, reviseButton);
    } catch {
      result.replaceChildren(node('p', 'We couldn’t make an itinerary. Check your date and try again.'));
    } finally {
      submit.disabled = false;
      result.hidden = false;
      result.removeAttribute('aria-busy');
    }
  }
  itinerary.addEventListener('submit', event => {
    event.preventDefault();
    createPlan(false);
  });
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const open = document.querySelector('.header-actions details[open]');
  if (open) {
    open.open = false;
    open.querySelector('summary').focus();
  }
});
