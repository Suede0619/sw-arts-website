const cities = { taos: 'Taos', 'santa-fe': 'Santa Fe' };
const categories = { gallery: 'Galleries', experience: 'Experiences', food: 'Eat', lodging: 'Stay' };
const cityPattern = /^(taos|santa-fe)$/;
const bookmark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg>';
const mark = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 33h36M10 26a14 14 0 0128 0"/><circle cx="24" cy="23" r="3"/></svg>';
const plate = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="28"/><circle cx="50" cy="50" r="21"/><path d="M10 20v60M6 20v20h8V20M88 20v60M82 20v25h6"/></svg>';
const house = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M15 75V30h70v45zM27 75V45h20v30M60 45h13v13H60zM12 30h76M20 24h60M16 81h70"/></svg>';
const idPattern = /^[a-z0-9][a-z0-9-]*$/i;
const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function external(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

function media(item) {
  return typeof item?.id === 'string' && idPattern.test(item.id) ? '/api/catalog/media/' + item.id : '';
}

function image(src, alt, { width = 700, height = 460, eager = false } = {}) {
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${width}" height="${height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function link(href, title, style = 'text-link') {
  return `<a class="${style}" href="${esc(href)}">${esc(title)}</a>`;
}

function sectionHeading(label, title, href, cta) {
  return `<div class="section-heading"><div>${label ? `<span class="eyebrow">${esc(label)}</span>` : ''}<h2>${esc(title)}</h2></div>${href ? link(href, cta) : ''}</div>`;
}

function lead(city, title, copy, parent, parentLabel) {
  return `<div class="page-lead"><div class="breadcrumb"><a href="/">ArtSouthwest</a><span>/</span><a href="/${city}">${cities[city]}</a>${parent ? `<span>/</span><a href="${parent}">${esc(parentLabel)}</a>` : ''}</div>
    <div class="page-lead-row"><div><h1>${esc(title)}</h1>${copy ? `<p>${esc(copy)}</p>` : ''}</div></div></div>`;
}

function save(href, title, label, inline = false) {
  return `<button type="button" class="${inline ? 'inline-save' : 'save-button'}" data-save="${esc(href)}" data-title="${esc(title)}" data-label="${esc(label)}" aria-label="Save ${esc(title)} to your plan" aria-pressed="false">${bookmark}</button>`;
}

function placeHref(place) {
  return `/${place.city}/${place.category === 'food' || place.category === 'lodging' ? place.category : categories[place.category].toLowerCase()}/${place.id}`;
}

function artistHref(artist) {
  return `/${artist.market}/artists/${artist.slug}`;
}

function workHref(work) {
  return artistHref(work.artist) + '/' + work.id;
}

function price(work) {
  return work.price?.currency === 'USD' && Number.isSafeInteger(work.price.amountMinor) ? priceFormatter.format(work.price.amountMinor / 100) : '';
}

function buildArtists(items) {
  return items.flatMap(artist => {
    const city = String(artist.city).split(',')[0].replace(/\s+NM\.?$/i, '').trim();
    const market = /^santa fe$/i.test(city) ? 'santa-fe' : /^(taos|el prado|arroyo seco|ranchos de taos|taos ski valley)$/i.test(city) ? 'taos' : '';
    if (!market || !idPattern.test(artist.slug)) return [];
    const profile = { ...artist, market };
    profile.works = (artist.works || []).filter(work => idPattern.test(work.id) && media(work.images?.[0]))
      .map(work => ({ ...work, artist: profile }));
    return [profile];
  });
}

function artCard(work) {
  const href = workHref(work);
  const photo = work.images[0];
  return `<article class="art-card" data-filter-item data-filter-text="${esc([work.title, work.artist.name, work.medium, price(work)].join(' '))}">
    <a class="art-image" href="${href}">${image(media(photo), photo.alt || work.title, { width: 420, height: 470 })}</a>
    ${save(href, work.title, work.artist.name)}<div class="art-meta"><span class="art-type">${esc(work.medium)}</span>
    <h3><a href="${href}">${esc(work.title)}</a></h3><p>${esc(work.artist.name)}</p>${price(work) ? `<span class="art-price">${esc(price(work))}</span>` : ''}</div></article>`;
}

function artistCard(artist) {
  const portrait = media(artist.portrait);
  const summary = artist.bio.length > 170 ? artist.bio.slice(0, 170).replace(/\s+\S*$/, '') + '…' : artist.bio;
  return `<article class="artist-card" data-filter-item data-filter-text="${esc(artist.name + ' ' + artist.city)}">
    ${portrait ? `<a class="artist-portrait" href="${artistHref(artist)}">${image(portrait, artist.portrait.alt || artist.name, { width: 590, height: 380 })}</a>` : ''}
    <span class="eyebrow">${esc(artist.city)}</span><h3><a href="${artistHref(artist)}">${esc(artist.name)}</a></h3>
    <p>${esc(summary)}</p>${link(artistHref(artist), 'Meet the artist')}</article>`;
}

function placeVisual(place, className = 'place-image') {
  if (place.image) {
    const position = place.image.position ? ` data-photo-position="${esc(place.image.position)}"` : '';
    return `<div class="${className}"${position}>${image('/' + place.image.src, place.image.alt)}</div>`;
  }
  const treatment = place.category === 'gallery' ? ['gallery-hero.webp', 'Gallery illustration'] :
    /ojo|spa|soak/.test(place.id) ? ['sage-study-card.webp', 'Desert illustration'] :
    /museum|harwood|site-santa-fe|wheelwright/.test(place.id) ? ['abstract-study-card.webp', 'Abstract illustration'] :
    ['landscape-study-card.webp', 'Landscape illustration'];
  return `<div class="${className} illustration">${image('/assets/' + treatment[0], '')}<span class="demo-tag">${treatment[1]}</span></div>`;
}

function experienceCard(place) {
  const href = placeHref(place);
  return `<article class="place-card" data-filter-item data-filter-text="${esc(place.name + ' ' + place.locality + ' ' + place.description)}">${placeVisual(place)}
    <span class="locality">${esc(place.locality)}</span><h3><a href="${href}">${esc(place.name)}</a></h3>
    <p>${esc(place.description)}</p><div class="card-bottom">${link(href, 'Take a closer look')}${save(href, place.name, place.locality, true)}</div></article>`;
}

function hospitalityCard(place) {
  const href = placeHref(place);
  return `<article class="hospitality-card" data-filter-item data-filter-text="${esc(place.name + ' ' + place.locality)}">
    ${place.image ? placeVisual(place, 'hospitality-image') : `<div class="hospitality-graphic">${place.category === 'food' ? plate : house}</div>`}
    <span class="locality">${esc(place.locality)}</span><h3><a href="${href}">${esc(place.name)}</a></h3><p>${esc(place.description)}</p>
    <div class="card-bottom">${link(href, place.category === 'food' ? 'Explore the table' : 'Explore the stay')}${save(href, place.name, place.locality, true)}</div></article>`;
}

function galleryRow(place) {
  const href = placeHref(place);
  return `<article class="gallery-row production-gallery-row" data-filter-item data-filter-text="${esc(place.name + ' ' + place.locality)}"><div><span class="locality">${esc(place.locality)}</span><h3><a href="${href}">${esc(place.name)}</a></h3></div>
    <p>${esc(place.description)}</p><div class="row-actions">${link(href, 'Explore')}${save(href, place.name, place.locality, true)}</div></article>`;
}

function askBand(city) {
  return `<div class="ask-band"><div><h3>Make a day of it</h3><p>${city === 'santa-fe' ? 'Browse Santa Fe or plan a day trip to Taos.' : 'Build a Taos itinerary around galleries, museums and a meal.'}</p></div>${link('/plan', 'Plan a visit', 'button')}</div>`;
}

function empty(title, description, href, label) {
  return `<div class="empty"><h2>${esc(title)}</h2><p>${esc(description)}</p>${link(href, label, 'button secondary')}</div>`;
}

function studioStudies() {
  const studies = [['landscape', 'High desert light'], ['abstract', 'Color and surface'], ['ceramic', 'The hand and the vessel'], ['sage', 'Quiet horizons']];
  return `<div class="art-grid home-art-grid">${studies.map(([file, title]) => `<article class="art-card"><div class="art-image">${image('/assets/' + file + '-study-card.webp', title, { width: 420, height: 470 })}</div><div class="art-meta"><h3>${esc(title)}</h3></div></article>`).join('')}</div>`;
}

function editorialHome(city, places, artists) {
  const label = cities[city];
  const selected = artists.flatMap(artist => artist.works).slice(0, 4);
  const experiences = city === 'taos' ? ['harwood-museum-of-art', 'rio-grande-gorge-overlook-and-west-rim-walk', 'ojo-caliente-day-soaking'] : ['okeeffe-museum', 'site-santa-fe', 'wheelwright'];
  const choices = experiences.map(id => places.find(place => place.id === id)).filter(Boolean);
  return `<section class="hero full-section"><div class="hero-copy"><span class="eyebrow">ART AND VISIT PLANNING, NEW MEXICO</span><h1>Art and artists<br>in <em>${label}.</em></h1>
    <p>Discover artists, galleries and museums. Plan a visit around the work you want to see.</p>
    <div class="hero-actions">${link('/' + city + '/art', 'Discover the collection', 'button')}${link('/' + city + '/experiences', 'Explore ' + label)}</div>
    <div class="hero-bottom">${label.toUpperCase()}, NEW MEXICO</div></div><div class="hero-image">${image('/assets/gallery-hero.webp', 'Illustration of a sunlit adobe gallery', { width: 1536, height: 1024, eager: true })}
    <div class="image-caption"><strong>Gallery illustration</strong></div></div></section>
    <section class="full-section inset intro-strip"><p>A guide to art<br>and places to visit</p><div><span class="strip-mark" aria-hidden="true">◌</span><span><strong>${label}</strong>Explore the local catalog.</span></div><div><span class="strip-mark" aria-hidden="true">◌</span><span><strong>${city === 'taos' ? 'Santa Fe' : 'Taos'}</strong>${link(city === 'taos' ? '/santa-fe' : '/taos', 'Explore the other city')}</span></div></section>
    <section class="section full-section inset">${sectionHeading(selected.length ? 'AVAILABLE WORK' : 'ARTSOUTHWEST ILLUSTRATIONS', selected.length ? 'Selected works' : 'Studies of the Southwest', '/' + city + '/art', 'Explore the catalog')}
    ${selected.length ? `<div class="art-grid home-art-grid">${selected.map(artCard).join('')}</div>` : studioStudies()}${askBand(city)}</section>
    <section class="mission-block full-section full-bleed"><div><span class="eyebrow">OUR PURPOSE</span><h2>Helping artists sell<br>their work.</h2></div><div class="mission-copy"><p>ArtSouthwest introduces collectors to artists in Taos and Santa Fe. Get to know the work, find places to see art in person, and contact the artist or gallery when a piece catches your eye.</p>${link('/about', 'Get to know our purpose')}</div></section>
    <section class="section full-section inset">${sectionHeading('EXPERIENCES', 'Experiences around ' + label, '/' + city + '/experiences', 'Explore experiences')}
    <div class="experience-grid">${choices.map(experienceCard).join('')}</div></section>
    <section class="journal full-section full-bleed"><div class="journal-image">${image('/assets/landscape-study.webp', 'Illustration of northern New Mexico hills', { width: 900, height: 600 })}</div><div class="journal-copy"><span class="eyebrow">VISIT PLANNING</span><h2>Your ${label} visit</h2><p>Save galleries, museums and places to eat and stay. Check hours and access before you go.</p>${link(city === 'taos' ? '/plan' : '/santa-fe/food', city === 'taos' ? 'Start your Taos plan' : 'Find a table in Santa Fe')}</div></section>
    <section class="section full-section inset">${sectionHeading('ARTISTS', 'Artists in ' + label, '/' + city + '/artists', 'Artist profiles')}
    ${artists.length ? `<div class="artist-grid">${artists.slice(0, 3).map(artistCard).join('')}</div>` : `<p class="muted">New artist profiles appear here after editorial review.</p>`}</section>`;
}

function filter(label) {
  return `<div class="filter-bar"><div class="filter-field"><label for="catalog-filter">${esc(label)}</label><input id="catalog-filter" type="search" data-catalog-filter></div><span class="muted" data-filter-count aria-live="polite"></span></div><p class="notice" id="filter-empty" hidden>No listings match this search.</p>`;
}

function artPage(city, view, artists) {
  const isArtists = view === 'artists';
  const works = artists.flatMap(artist => artist.works);
  const cards = isArtists ? artists.map(artistCard) : works.map(artCard);
  return `<section class="full-section inset bottom-space">${lead(city, isArtists ? 'Artists in ' + cities[city] : 'Art and artists', 'Explore the collection and meet the artists behind the work.')}
    <nav class="tabs" aria-label="Art catalog"><a href="/${city}/art" ${isArtists ? '' : 'class="active" aria-current="page"'}>Works</a><a href="/${city}/artists" ${isArtists ? 'class="active" aria-current="page"' : ''}>Artists</a></nav>
    ${cards.length ? filter(isArtists ? 'Find an artist' : 'Find a work or medium') + `<div class="${isArtists ? 'artist-grid' : 'art-grid'}">${cards.join('')}</div>` : empty(isArtists ? 'Artist profiles are coming' : 'The collection is taking shape', 'Look for new work as artists join the catalog.', '/' + city + '/galleries', 'Browse galleries')}${askBand(city)}</section>`;
}

function listingPage(city, category, places) {
  const label = cities[city];
  if (category === 'gallery') {
    const [featured] = places;
    return `<section class="full-section inset bottom-space">${lead(city, label + ' galleries', 'Find galleries by neighborhood and explore their programs.')}
    ${featured ? `<div class="gallery-spotlight">${placeVisual(featured, 'image-block')}<div class="spotlight-copy"><span class="eyebrow">${esc(featured.locality)}</span><h2>${esc(featured.name)}</h2><p>${esc(featured.description)}</p>${link(placeHref(featured), 'Explore the gallery')}</div></div>` : ''}
    ${filter('Find a gallery')}${places.map(galleryRow).join('')}${askBand(city)}</section>`;
  }
  if (category === 'experience') return `<section class="full-section inset bottom-space">${lead(city, label + ' experiences', 'Museums, studio visits and places to spend time outdoors.')}${filter('Find an experience or neighborhood')}<div class="experience-grid">${places.map(experienceCard).join('')}</div>${askBand(city)}</section>`;
  const staying = category === 'lodging';
  return `<section class="full-section inset bottom-space">${lead(city, staying ? 'Places to stay' : 'Places to eat', (staying ? 'Distinctive stays' : 'Restaurants and cafés') + ' in and around ' + label + '.')}
    <nav class="tabs" aria-label="Eat and stay"><a href="/${city}/food" ${staying ? '' : 'class="active" aria-current="page"'}>Eat</a><a href="/${city}/lodging" ${staying ? 'class="active" aria-current="page"' : ''}>Stay</a></nav>
    ${filter(staying ? 'Find a stay or neighborhood' : 'Find a restaurant or neighborhood')}<div class="hospitality-grid">${places.map(hospitalityCard).join('')}</div>${askBand(city)}</section>`;
}

function detailPlace(place) {
  const href = placeHref(place);
  const isHospitality = ['food', 'lodging'].includes(place.category);
  const visual = isHospitality && !place.image ? `<div class="abstract-venue">${place.category === 'food' ? plate : house}</div>` : placeVisual(place, 'place-detail-art');
  const copy = (place.detail || [place.description]).map(paragraph => `<p>${esc(paragraph)}</p>`).join('');
  return `<section class="full-section inset bottom-space">${lead(place.city, place.name, '', href.slice(0, href.lastIndexOf('/')), categories[place.category])}
    <div class="place-detail-hero">${visual}<div class="place-detail-copy"><span class="eyebrow">${esc(place.locality)}</span>${copy}
    <div class="listing-actions">${link(place.source, 'Visit the official site', 'button')}${save(href, place.name, place.locality, true)}</div></div></div></section>`;
}

function detailArtist(artist) {
  const city = artist.market;
  const contact = external(artist.contactLink) || external(artist.website);
  return `<section class="full-section inset bottom-space">${lead(city, artist.name, artist.city, '/' + city + '/artists', 'Artists')}
    <div class="journal artist-story">${media(artist.portrait) ? `<div class="journal-image">${image(media(artist.portrait), artist.portrait.alt || artist.name, { width: 900, height: 650 })}</div>` : ''}
    <div class="journal-copy"><h2>About the artist</h2><p>${esc(artist.bio)}</p>${contact ? link(contact, 'Contact the artist') : ''}</div></div>
    <div class="section">${sectionHeading('', 'Available work')}${artist.works.length ? `<div class="art-grid">${artist.works.map(artCard).join('')}</div>` : '<p class="muted">Check back for available work.</p>'}</div></section>`;
}

function detailWork(work) {
  const artist = work.artist;
  const contact = external(artist.contactLink) || external(artist.website);
  const dims = work.dimensions;
  const size = dims ? [dims.height, dims.width, dims.depth].filter(Boolean).join(' × ') + ' ' + dims.unit : '';
  const [first, ...alternates] = work.images;
  return `<section class="full-section inset bottom-space">${lead(artist.market, work.title, '', artistHref(artist), artist.name)}
    <div class="catalog-detail"><div class="large-work">${image(media(first), first.alt || work.title, { width: 700, height: 850, eager: true })}</div><div class="object-copy">
    <p>${link(artistHref(artist), artist.name)}</p>${price(work) ? `<div class="object-price">${esc(price(work))}</div>` : ''}
    <dl class="facts-table"><div><dt>Medium</dt><dd>${esc(work.medium)}</dd></div>${size ? `<div><dt>Dimensions</dt><dd>${esc(size)}</dd></div>` : ''}${work.year ? `<div><dt>Year</dt><dd>${esc(work.year)}</dd></div>` : ''}</dl>
    <div class="listing-actions">${contact ? link(contact, 'Ask about this work', 'button') : ''}${save(workHref(work), work.title, artist.name, true)}</div></div></div>
    <div class="detail-story"><h2>About this work</h2><p>${esc(work.story)}</p></div>
    ${alternates.length ? `<div class="art-grid">${alternates.filter(photo => media(photo)).map(photo => `<figure>${image(media(photo), photo.alt || work.title)}${photo.credit ? `<figcaption>${esc(photo.credit)}</figcaption>` : ''}</figure>`).join('')}</div>` : ''}</section>`;
}

function planner() {
  return `<section class="full-section inset bottom-space">${lead('taos', 'Plan a day in Taos', 'Choose what you want to see and how much time you have.')}
    <div class="plan-layout"><div><form id="itinerary" class="planner-form"><div class="planner-fields">
    <label>Visit date<input type="date" name="date" required></label><label>Start time<input type="time" name="startTime" min="08:00" max="16:59" value="10:00" required></label>
    <label>Time available<select name="hours"><option value="3">Half day</option><option value="6">Full day</option></select></label>
    <label>Main interest<select name="interest"><option value="mixed">Art and food</option><option value="art">Galleries and museums</option><option value="history">Art and local history</option></select></label>
    <label>Getting around<select name="transport"><option value="walk">Walking</option><option value="drive">Driving</option></select></label><label>Other preferences<input name="preference" maxlength="180" autocomplete="off"></label></div>
    <button class="button" type="submit">Make my itinerary</button></form><div id="plan-result" aria-live="polite" hidden></div></div>
    <aside class="plan-summary"><h2>Save what catches your eye</h2><p>See the work and places you’ve saved on this device.</p>${link('/saved', 'Open saved selections', 'button secondary')}</aside></div></section>`;
}

function headLinks(city) {
  return `<a href="/${city}/art">Art &amp; artists</a><a href="/${city}/galleries">Galleries</a><a href="/${city}/experiences">Experiences</a><a href="/${city}/food">Eat &amp; stay</a>`;
}

function shell({ city, title, content, css, script, hero, artistOrigin }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="A guide to artists, art and places to visit in Taos and Santa Fe."><meta name="theme-color" content="#f6f2eb">
    <title>${esc(title)} | ArtSouthwest</title><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${css}">
    ${hero ? '<link rel="preload" as="image" href="/assets/gallery-hero.webp">' : ''}</head><body><div class="site-frame">
    <a class="skip-link" href="#main">Skip to content</a><header class="site-header full-section">
    <a class="wordmark" href="/" aria-label="ArtSouthwest home">${mark}<span>ArtSouthwest</span></a>
    <nav class="desktop-nav" aria-label="Main navigation">${headLinks(city)}</nav><div class="header-actions">
    <details class="region-menu"><summary class="region-button">${cities[city]}</summary><nav aria-label="Choose a city"><a href="/taos">Taos</a><a href="/santa-fe">Santa Fe</a></nav></details>
    <a class="plan-link" href="/saved" aria-label="Open your saved plan">${bookmark}<span class="plan-label">Your plan</span><span id="plan-count">0</span></a>
    <details class="mobile-menu"><summary class="menu-button" aria-label="Open navigation">☰</summary><nav aria-label="Mobile navigation">${headLinks(city)}<a href="/plan">Plan a visit</a></nav></details></div></header>
    <main id="main" tabindex="-1">${content}</main>
    <footer class="site-footer full-section"><div class="footer-top"><a href="/" class="footer-brand">ArtSouthwest</a><p>Art, artists and places to visit<br>in Taos and Santa Fe.</p><div><a href="/about">Our purpose</a><a href="${esc(artistOrigin)}/?campaign=taos-artists">Artist submissions</a></div></div></footer>
    <a class="concierge-launch" href="/plan"><span class="assistant-symbol" aria-hidden="true">✳</span> Plan a visit</a><div class="toast" id="toast" role="status" aria-live="polite"></div></div>
    <script type="module" src="${script}"></script></body></html>`;
}

export function createCatalog(places, assets) {
  const routes = new Map([['galleries', 'gallery'], ['experiences', 'experience'], ['food', 'food'], ['lodging', 'lodging']]);
  const placeLookup = new Map(places.map(place => [placeHref(place), place]));
  const usesPublications = path => /^\/(?:$|(?:taos|santa-fe)(?:\/?$|\/(?:art|artists)(?:\/|$)))/.test(path);
  return {
    usesPublications,
    render(path, published = [], { artistOrigin = 'https://artist.artsouthwest.com' } = {}) {
      const parts = path.split('/').filter(Boolean);
      const [rawCity, view, slug, workId] = parts;
      const city = cityPattern.test(rawCity) ? rawCity : 'taos';
      const cityPlaces = places.filter(place => place.city === city);
      const artists = buildArtists(published).filter(artist => artist.market === city);
      let content, title = cities[city], hero = false;
      if (!rawCity || (cityPattern.test(rawCity) && !view)) {
        hero = true;
        content = editorialHome(city, cityPlaces, artists);
      } else if (cityPattern.test(rawCity)) {
        if ((view === 'art' || view === 'artists') && !slug) {
          title = view === 'art' ? 'Art in ' + title : 'Artists in ' + title;
          content = artPage(city, view, artists);
        } else if (view === 'artists' && slug && parts.length <= 4) {
          const artist = artists.find(item => item.slug === slug);
          const work = artist && workId && artist.works.find(item => item.id === workId);
          if (work) { title = work.title; content = detailWork(work); }
          else if (artist && !workId) { title = artist.name; content = detailArtist(artist); }
        } else if (routes.has(view) && !slug) {
          const category = routes.get(view);
          title = categories[category] + ' in ' + title;
          content = listingPage(city, category, cityPlaces.filter(place => place.category === category));
        } else {
          const place = placeLookup.get(path);
          if (place) { title = place.name; content = detailPlace(place); }
        }
      } else if (path === '/plan') {
        title = 'Plan a day in Taos'; content = planner();
      } else if (path === '/saved') {
        title = 'Saved selections'; content = `<section class="full-section inset bottom-space">${lead('taos', title, 'Your selections stay in this browser.')}<div id="saved-selections" class="plan-list"><p class="muted">Save a work or place to find it here.</p></div></section>`;
      } else if (path === '/about') {
        title = 'Our purpose'; content = `<section class="full-section inset bottom-space"><article class="prose"><h1>Our purpose</h1><p>ArtSouthwest helps local artists sell their work. The catalog pairs artists and galleries with places to visit in Taos and Santa Fe. Collectors can get to know the work, plan a visit and contact the artist or gallery.</p></article></section>`;
      }
      const status = content ? 200 : 404;
      if (!content) {
        title = 'Page unavailable'; content = `<section class="full-section inset bottom-space">${lead(city, title, 'This listing may have been removed or moved.')}${link('/' + city, 'Browse ' + cities[city], 'button')}</section>`;
      }
      return { status, html: shell({ city, title, content, ...assets, hero, artistOrigin }) };
    },
  };
}
