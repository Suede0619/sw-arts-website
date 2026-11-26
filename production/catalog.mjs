const cities = new Map([['taos', 'Taos'], ['santa-fe', 'Santa Fe']]);
const categories = new Map([
  ['artists', 'Artists'], ['galleries', 'Galleries'], ['experiences', 'Experiences'],
  ['food', 'Food'], ['lodging', 'Lodging'],
]);
const categoryPaths = { gallery: 'galleries', experience: 'experiences', food: 'food', lodging: 'lodging' };
const main = document.querySelector('main');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const intake = new URL('../api/', location.href);
let routeSequence = 0;

function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function external(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? escape(parsed.href) : '';
  } catch {
    return '';
  }
}

function media(image) {
  if (!image || !/^[a-f0-9-]{36}$/i.test(image.id)) return '';
  return '<figure><img loading="lazy" src="' + escape(new URL('catalog/media/' + image.id, intake)) +
    '" alt="' + escape(image.alt) + '">' +
    (image.credit ? '<figcaption><small>' + escape(image.credit) + '</small></figcaption>' : '') + '</figure>';
}

function price(work) {
  return work.price?.currency === 'USD' ? usd.format(work.price.amountMinor / 100) : '';
}

function cityArtists(items, city) {
  const match = city === 'taos' ? /^(taos|el prado|arroyo seco|ranchos de taos|taos ski valley)$/i : /^santa fe$/i;
  return items.filter(item => match.test(item.city.split(',')[0].replace(/\s+NM\.?$/i, '').trim()))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function artistLink(city, artist) {
  return '#/' + city + '/artists/' + encodeURIComponent(artist.slug);
}

function tabs(city, selected) {
  return '<nav class="tabs" aria-label="Catalog categories">' +
    [...categories].map(([key, title]) => '<a href="#/' + city + '/' + key + '"' +
      (key === selected ? ' aria-current="page"' : '') + '>' + title + '</a>').join('') + '</nav>';
}

function artistCard(city, artist) {
  return '<article class="card">' + media(artist.portrait) + '<h3><a href="' + artistLink(city, artist) + '">' +
    escape(artist.name) + '</a></h3><p>' + escape(artist.city) + '</p></article>';
}

function placeCard(city, place) {
  return '<article class="card">' + (place.image ? '<img src="' + escape(place.image.src) + '" alt="' + escape(place.image.alt) + '" loading="lazy">' : '') +
    '<p class="meta">' + escape(place.locality) + '</p><h3><a href="#/' + city + '/' + categoryPaths[place.category] + '/' +
    encodeURIComponent(place.id) + '">' + escape(place.name) + '</a></h3><p>' + escape(place.description) + '</p></article>';
}

function workCard(city, artist, work) {
  return '<article class="card">' + media(work.images[0]) + '<h3><a href="' + artistLink(city, artist) + '/' +
    encodeURIComponent(work.id) + '">' + escape(work.title) + '</a></h3><p>' + escape(work.medium) +
    '</p><p>' + escape(price(work)) + '</p></article>';
}

function home() {
  return `<section class="hero">
    <div class="hero-copy"><div class="kicker">Taos and Santa Fe</div>
      <h1>Art worth<br><em>traveling for.</em></h1>
      <p>Discover artists and galleries, then plan a visit around the work you want to see.</p>
      <a class="button" href="#/taos">Explore Taos</a>
    </div>
    <figure class="hero-image"><img src="assets/gallery-hero.webp" alt="Illustrated adobe gallery interior with paintings and ceramics" fetchpriority="high"><figcaption>Gallery illustration</figcaption></figure>
  </section>
  <section class="section wrap"><h2>Choose a city</h2><div class="grid cities">
    <article class="card"><h3><a href="#/taos">Taos</a></h3><p>Artists, galleries and places to spend time in and around Taos.</p></article>
    <article class="card"><h3><a href="#/santa-fe">Santa Fe</a></h3><p>Art and places to visit from the Plaza to Canyon Road and the Railyard.</p></article>
  </div></section>`;
}

async function json(url, init) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), ...init });
  if (!response.ok) throw new Error('Could not load data.');
  return response.json();
}

function detail(city, category, place) {
  const source = external(place.source);
  return `<section class="section wrap"><a class="breadcrumb" href="#/${city}/${category}">${cities.get(city)} ${categories.get(category).toLowerCase()}</a>
    <p class="kicker">${escape(place.locality)}</p><h1>${escape(place.name)}</h1><p>${escape(place.description)}</p>
    ${place.image ? `<div class="detail"><figure><img src="${escape(place.image.src)}" alt="${escape(place.image.alt)}"><figcaption><small>${escape(place.image.credit)}</small></figcaption></figure></div>` : ''}
    ${source ? `<a class="button secondary" href="${source}">Visit official site</a>` : ''}
  </section>`;
}

function cityCatalog(city, chosen, listing, workId, artists, places) {
  if (chosen === 'artists' && listing) {
    const artist = artists.find(entry => entry.slug === listing);
    if (!artist) return unavailable(city);
    const work = workId && artist.works.find(entry => entry.id === workId);
    if (workId && !work) return unavailable(city);
    const inquiry = external(artist.contactLink) || external(artist.website);
    if (work) return `<section class="section wrap"><a class="breadcrumb" href="${artistLink(city, artist)}">${escape(artist.name)}</a>
      <h1>${escape(work.title)}</h1><div class="detail"><div>${work.images.map(media).join('')}</div><div>
      <p>${escape(work.medium)}${work.year ? ', ' + escape(work.year) : ''}</p>
      <p>${escape([work.dimensions.height, work.dimensions.width, work.dimensions.depth].filter(Boolean).join(' × ') + ' ' + work.dimensions.unit)}</p>
      <p>${escape(price(work))}</p><p>${escape(work.story)}</p>
      ${inquiry ? `<p><a class="button" href="${inquiry}">Ask about this work</a></p>` : ''}</div></div></section>`;
    return `<section class="section wrap"><a class="breadcrumb" href="#/${city}/artists">${cities.get(city)} artists</a>
      <h1>${escape(artist.name)}</h1><div class="detail">${media(artist.portrait)}<div><p>${escape(artist.bio)}</p>
      ${inquiry ? `<p><a href="${inquiry}">Artist website or inquiries</a></p>` : ''}</div></div>
      <div class="section"><h2>Available work</h2><div class="grid">${artist.works.map(work => workCard(city, artist, work)).join('')}</div></div></section>`;
  }
  if (listing) {
    const place = places.find(p => p.id === listing && categoryPaths[p.category] === chosen);
    return place ? detail(city, chosen, place) : unavailable(city);
  }
  const cards = chosen === 'artists' ? artists.map(artist => artistCard(city, artist)) :
    places.filter(place => categoryPaths[place.category] === chosen).map(place => placeCard(city, place));
  return `<section class="section wrap"><h1>${cities.get(city)}</h1>
    ${tabs(city, chosen)}
    ${cards.length ? `<div class="grid">${cards.join('')}</div>` : '<p>New listings will appear here as they are approved.</p>'}
  </section>`;
}

function unavailable(city) {
  return `<section class="section wrap"><h1>Listing unavailable</h1><p><a href="#/${city}">Return to ${cities.get(city)}</a></p></section>`;
}

function planner() {
  return `<section class="section wrap"><div class="planner"><h1>Plan a day in Taos</h1>
    <p>Build a route around art, with time for a gallery, a museum, or a meal.</p>
    <form id="itinerary">
      <div class="inputs">
        <label>Time available<select name="hours"><option value="3">Half day</option><option value="6">Full day</option></select></label>
        <label>Main interest<select name="interest"><option value="mixed">Art and food</option><option value="art">Galleries and museums</option><option value="history">Art and local history</option></select></label>
        <label>Visit date<input type="date" name="date" required></label>
        <label>Start time<input type="time" name="startTime" min="08:00" max="16:59" value="10:00" required></label>
        <label>Getting around<select name="transport"><option value="walk">Walking</option><option value="drive">Driving</option></select></label>
        <label class="wide">Anything else? <input name="preference" maxlength="180" placeholder="For example, a longer museum visit" autocomplete="off"></label>
      </div>
      <button class="button">Make my itinerary</button>
    </form>
    <div id="plan-result" class="card" aria-live="polite"></div>
    <p>Looking for Santa Fe? <a href="#/santa-fe">Browse the catalog</a>.</p>
  </div></section>`;
}

function setupPlanner() {
  const form = document.querySelector('#itinerary');
  const output = document.querySelector('#plan-result');
  const submit = form.querySelector('button');
  let previousIds = [];
  async function requestPlan(revise) {
    const fields = Object.fromEntries(new FormData(form));
    submit.disabled = true;
    output.textContent = 'Preparing your itinerary…';
    try {
      const plan = await json(new URL('itinerary', intake), {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Intake-Request': '1' },
        body: JSON.stringify({ ...fields, avoid: revise ? previousIds : [] }),
      });
      previousIds = plan.stops.map(stop => stop.id);
      output.innerHTML = `<h2>${plan.mode === 'ai' ? 'Your itinerary' : 'Suggested itinerary'}</h2>
        <p>${escape(plan.note)}</p><ol>${plan.stops.map(stop => `<li><strong><time>${escape(stop.time)}</time> ${escape(stop.name)}</strong>
          <p>${escape(stop.duration)} minutes suggested. ${escape(stop.reason)}</p>
          <a href="${external(stop.source)}">Confirm hours and access</a></li>`).join('')}</ol>
        <button class="button secondary" type="button" id="revise">Try a different route</button>`;
      output.querySelector('#revise').addEventListener('click', () => requestPlan(true));
    } catch {
      output.textContent = 'We couldn’t make an itinerary. You can try again or browse the Taos catalog.';
    } finally {
      submit.disabled = false;
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    requestPlan(false);
  });
}

async function render() {
  const sequence = ++routeSequence;
  const [city, category = 'artists', slug, work] = location.hash.slice(1).split('/').filter(Boolean);
  if (!city) main.innerHTML = home();
  else if (city === 'plan') {
    main.innerHTML = planner();
    setupPlanner();
  } else if (cities.has(city) && categories.has(category)) {
    main.innerHTML = '<p class="wrap section" role="status">Loading catalog…</p>';
    try {
      const data = category === 'artists' ? await json(new URL('catalog', intake)) : await json('content/places.json');
      if (sequence !== routeSequence) return;
      main.innerHTML = cityCatalog(city, category, slug && decodeURIComponent(slug), work && decodeURIComponent(work),
        category === 'artists' ? cityArtists(data.artists, city) : [],
        category === 'artists' ? [] : data.filter(place => place.city === city));
    } catch {
      if (sequence !== routeSequence) return;
      main.innerHTML = '<section class="wrap section"><h1>Catalog unavailable</h1><p><button class="button" id="retry">Try again</button></p></section>';
      document.querySelector('#retry').addEventListener('click', render);
    }
  } else if (city !== 'content') {
    main.innerHTML = '<section class="section wrap"><h1>Page unavailable</h1><p><a href="#/">Return to ArtSouthwest</a></p></section>';
  }
}
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});
window.addEventListener('hashchange', () => {
  window.scrollTo(0, 0);
  main.focus();
  void render();
});
void render();
