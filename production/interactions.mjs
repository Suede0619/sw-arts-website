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
  const tz = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const now = Object.fromEntries(tz.formatToParts().map(({type,value})=>[type,value]));
  const today = now.year+'-'+now.month+'-'+now.day;
  const nextHour = Number(now.hour)+1;
  itinerary.elements.date.min = today;
  itinerary.elements.date.value = nextHour>16 ?
    new Date(Date.parse(today+'T12:00:00Z')+86400000).toISOString().slice(0,10) : today;
  if (nextHour>10 && nextHour<=16) itinerary.elements.startTime.value = String(nextHour).padStart(2,'0')+':00';
  let currentPlan;
  let brief;
  function renderPlan(plan, message) {
    const title = node('h2', plan.stops.length ? (plan.mode === 'ai' ? 'Your itinerary' : 'Suggested itinerary') : 'Try another time');
    const notice = node('p', message || plan.note);
    result.replaceChildren(title, notice);
    if (!plan.stops.length) return;
    if (plan.origin) result.append(node('p', 'Start at ' + plan.origin + '.'));
    const list = node('ol', '', 'itinerary-stops');
    for (const stop of plan.stops) {
      const item = node('li');
      const finish = stop.endTime ? ' to ' + stop.endTime : '';
      const aside = [stop.travelMinutes ? stop.travelMinutes + ' min travel' : '', stop.wait ? stop.wait + ' min before opening' : ''].filter(Boolean);
      if (aside.length) item.append(node('p', aside.join(' · '), 'muted'));
      item.append(node('strong', stop.time + finish + ' · ' + stop.name), node('p', stop.reason));
      if (stop.availability) item.append(node('p', stop.availability, 'muted'));
      const actions = node('div', '', 'itinerary-actions');
      if (typeof stop.source === 'string' && stop.source.startsWith('https://')) {
        const confirm = node('a', 'Official site', 'text-link');
        confirm.href = stop.source;
        actions.append(confirm);
      }
      const swap = node('button', 'Swap this stop', 'text-link');
      swap.type = 'button';
      swap.setAttribute('aria-label', 'Swap ' + stop.name);
      swap.addEventListener('click', () => createPlan(stop.id));
      actions.append(swap);
      item.append(actions);
      list.append(item);
    }
    result.append(list);
    if (typeof plan.map === 'string' && plan.map.startsWith('https://www.google.com/maps/dir/')) {
      const map = node('a', 'Open route in Google Maps', 'button secondary');
      map.href = plan.map;
      result.append(map);
    }
  }
  async function createPlan(swapId) {
    if (submit.disabled) return;
    const input = Object.fromEntries(new FormData(itinerary));
    const unchanged = JSON.stringify(input) === brief;
    const swap = swapId && unchanged && currentPlan;
    submit.disabled = true;
    for (const button of result.querySelectorAll('button')) button.disabled = true;
    result.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Intake-Request': '1' },
        body: JSON.stringify({ ...input, avoid: swap ? [swapId] : [],
          retain: swap ? currentPlan.stops.map(stop => stop.id).filter(id => id !== swapId) : [] }),
        signal: AbortSignal.timeout(14000),
      });
      const plan = await response.json();
      if (!response.ok) throw new Error(plan.message || 'We couldn’t make an itinerary. Try again.');
      if (swap && !plan.stops.length) {
        renderPlan(currentPlan, plan.note);
      } else {
        currentPlan = plan;
        brief = JSON.stringify(input);
        renderPlan(plan);
      }
    } catch (error) {
      if (swap) renderPlan(currentPlan, error.message);
      else result.replaceChildren(node('p', error.message || 'We couldn’t make an itinerary. Try again.'));
    } finally {
      submit.disabled = false;
      result.hidden = false;
      result.removeAttribute('aria-busy');
      result.focus();
    }
  }
  itinerary.addEventListener('submit', event => {
    event.preventDefault();
    createPlan();
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
