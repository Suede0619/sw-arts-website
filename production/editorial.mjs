const cityNames={ taos:'Taos','santa-fe':'Santa Fe' };
const kinds={ exhibition:'Exhibition',opening:'Opening',event:'Event' };
const states={ canceled:'Canceled',postponed:'Postponed',rescheduled:'Rescheduled' };
const dateText=date=>new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
const timeText=time=>{
  const [hour,minute]=time.split(':').map(Number);
  return (hour%12||12)+':'+String(minute).padStart(2,'0')+(hour<12?' a.m.':' p.m.');
};
const dateLabel=row=>row.kind==='exhibition' ? dateText(row.startDate)+' to '+dateText(row.endDate) :
  dateText(row.startDate)+', '+timeText(row.startTime)+' to '+(row.startDate===row.endDate?'':dateText(row.endDate)+', ')+timeText(row.endTime);
const href=row=>'/'+row.city+'/whats-on/'+row.id;
const room='<div class="editorial-empty">';
const nextDates=date=>new Date(new Date(date+'T12:00:00Z').valueOf()+86400000).toISOString().slice(0,10);
const nicePrice=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);

export function createEditorialPages({esc,image,link,lead}) {
  const card=row=>`<article class="calendar-row">${row.image ? `<a class="calendar-image" href="${href(row)}" tabindex="-1" aria-hidden="true">${image(row.image,'')}</a>` : ''}
    <div><p class="calendar-date">${esc(dateLabel(row))}</p><h3><a href="${href(row)}">${esc(row.title)}</a></h3><p>${esc(row.venue)}</p>
    <p>${esc(row.summary)}</p></div></article>`;
  const wrap=body=>'<section class="full-section inset bottom-space">'+body+'</section>';
  function cityFeature(city,editorial) {
    const rows=editorial?.week?.filter(row=>row.city===city)||[];
    const pick=rows.find(row=>row.kind==='exhibition'&&row.image)||rows.find(row=>row.image);
    if (!pick) return '';
    return `<section class="section full-section inset calendar-feature"><div class="section-heading"><h2>What’s on in ${cityNames[city]}</h2>
      ${link('/'+city+'/whats-on','See what’s on')}</div>${card(pick)}</section>`;
  }
  function calendar(city,editorial,query) {
    const home='/'+city+'/whats-on';
    const dates=editorial.day && editorial.end ? dateText(editorial.day)+' to '+dateText(editorial.end) : '';
    const rows=(editorial.week||[]).filter(row=>row.city===city);
    const dayOptions=[];
    if (editorial.day && editorial.end) {
      for (let day=editorial.day;day<=editorial.end;day=nextDates(day)) dayOptions.push(day);
    }
    const day=dayOptions.includes(query.get('day')) ? query.get('day') : '';
    const view=rows.filter(row=>!day || row.startDate<=day&&row.endDate>=day);
    const timed=view.filter(row=>row.kind!=='exhibition').sort((a,b)=>(a.startDate+a.startTime).localeCompare(b.startDate+b.startTime));
    const shows=view.filter(row=>row.kind==='exhibition');
    return wrap(`${lead(city,'What’s on in '+cityNames[city],dates)}
      <nav class="tabs" aria-label="Calendar city"><a href="/taos/whats-on" ${city==='taos'?'aria-current="page" class="active"':''}>Taos</a>
      <a href="/santa-fe/whats-on" ${city==='santa-fe'?'aria-current="page" class="active"':''}>Santa Fe</a></nav>
      <div class="editorial-actions"><form method="get" action="${home}" class="calendar-filter"><label for="calendar-day">Date</label>
      <select name="day" id="calendar-day"><option value="">Next 7 days</option>${dayOptions.map(value=>
        `<option value="${value}" ${value===day?'selected':''}>${dateText(value)}</option>`).join('')}</select><button class="button secondary">Show</button></form>
      ${link('/submit-event','Submit an event')}${link('/weekly','Weekly roundup')}</div>
      <div class="calendar-list"><h2>Openings &amp; events</h2>${timed.length?timed.map(card).join(''):room+'No openings or events on these dates.</div>'}
      <h2>Exhibitions on view</h2>${shows.length?shows.map(card).join(''):room+'No exhibitions on these dates.</div>'}</div>`);
  }
  function detail(city,row,editorial) {
    const related=row.relatedId ? editorial.all?.find(item=>item.id===row.relatedId) : null;
    const openings=editorial.week?.filter(item=>item.relatedId===row.id)||[];
    return wrap(`${lead(city,row.title,'','/'+city+'/whats-on','What’s on')}
      <div class="place-detail-hero">${row.image ? `<div class="place-detail-art">${image(row.image,row.imageAlt,{eager:true})}</div>`:''}
      <div class="place-detail-copy"><span class="eyebrow">${kinds[row.kind]} · ${esc(row.venue)}</span>
      <p class="calendar-date">${esc(dateLabel(row))}</p>
      ${states[row.scheduleStatus] || row.ended ? `<p class="editorial-status">${esc(states[row.scheduleStatus] || 'Ended')}</p>` : ''}
      <p>${esc(row.summary)}</p>${row.admission ? `<p>${esc(row.admission)}</p>`:''}
      ${related ? `<p>Exhibition ${link(href(related),related.title)}</p>` : ''}
      ${openings.map(event=>`<p>Opening ${link(href(event),event.title)} · ${esc(dateLabel(event))}</p>`).join('')}
      ${row.artistSlug ? `<p>${link('/'+city+'/artists/'+row.artistSlug,'Artist profile')}</p>` : ''}
      <div class="listing-actions">${link(row.source,'Visit the official site','button')}<button class="text-link" type="button" data-share>Copy link</button>
      <span aria-live="polite" data-share-status></span></div></div></div>`);
  }
  function weekly(editorial, edition=false) {
    const issue=editorial.issue;
    const body=edition && issue ? `<article class="weekly-article"><p class="calendar-date">${esc(dateText(issue.date))}</p>
      ${Object.entries(cityNames).map(([city,name])=>{
        const rows=issue.events.filter(row=>row.city===city);
        return rows.length ? '<h2>'+name+'</h2>'+rows.map(card).join('') : '';
      }).join('')}${issue.artist ? `<h2>Artist story</h2><div class="weekly-story">${issue.artist.image ? image(issue.artist.image,issue.artist.imageAlt) : ''}
      <h3>${esc(issue.artist.title)}</h3><p>${esc(issue.artist.summary)}</p>${link('/'+issue.artist.city+'/artists/'+issue.artist.slug,'Meet the artist')}</div>` : ''}
      ${issue.sponsor ? `<aside class="weekly-sponsor"><p class="eyebrow">PAID SPONSORSHIP</p><h3>${esc(issue.sponsor.title)}</h3>
      ${issue.sponsor.image ? image(issue.sponsor.image,issue.sponsor.imageAlt) : ''}<p>${esc(issue.sponsor.summary)}</p>${link(issue.sponsor.destination,'Visit the sponsor')}</aside>` : ''}</article>` :
      editorial.issueList?.length ? `<ul class="weekly-article">${editorial.issueList.map(row=>`<li>${link('/weekly/'+row.issue_date,'Week of '+dateText(row.issue_date))}</li>`).join('')}</ul>` :
      '<p>The first roundup will appear here when it’s published.</p>';
    return wrap(`${lead('taos','ArtSouthwest Weekly','Exhibitions, openings and artists in Taos and Santa Fe.')}${body}
      <div class="listing-actions">${editorial.signup ? link(editorial.signup,'Subscribe to the roundup','button') : ''}
      ${editorial.sponsorEnabled ? link('/advertise','Advertise in the roundup') : ''}</div>`);
  }
  const field=(label,name,options='')=>`<label>${label}<input name="${name}" ${options}></label>`;
  const paragraph=(label,name,max)=>`<label>${label}<textarea name="${name}" rows="4" required maxlength="${max}"></textarea></label>`;
  function submission(category,editorial) {
    const sponsor=category==='sponsor';
    if(sponsor&&!editorial.sponsorEnabled) return wrap(lead('taos','Advertising','Sponsorship submissions are currently closed.'));
    const calendarFields=`<label>City<select name="city" required><option value="taos">Taos</option><option value="santa-fe">Santa Fe</option></select></label>
      <label>Listing type<select name="kind" data-event-kind required><option value="exhibition">Exhibition</option><option value="opening">Opening</option><option value="event">Event</option></select></label>
      ${field('Venue','venue','required maxlength="140"')}${field('Official event page','source','type="url" required maxlength="480"')}
      ${field('Start date','startDate','type="date" required')}${field('End date','endDate','type="date" required')}
      ${field('Start time in New Mexico','startTime','type="time" data-event-time')}${field('End time in New Mexico','endTime','type="time" data-event-time')}
      ${field('Related exhibition','relatedTitle','maxlength="130"')}${field('Admission or RSVP details','admission','maxlength="150"')}`;
    const sponsorFields=`${field('Organization','organization','required maxlength="120"')}${field('Thursday issue date','issueDate','type="date" required')}
      ${field('Link for readers','destination','type="url" required maxlength="480"')}`;
    const intro=sponsor ? 'One sponsor per issue. The price is '+nicePrice(editorial.sponsorPrice)+' after creative approval.' :
      'Submit an exhibition, opening or arts event in Taos or Santa Fe.';
    return wrap(`${lead('taos',sponsor?'Advertise in ArtSouthwest Weekly':'Submit an event',intro)}
      <form class="editorial-form" data-editorial-form="${category}" method="post" action="/api/editorial/submissions/${category}" enctype="multipart/form-data">
        <div class="editorial-fields">${field(sponsor?'Headline':'Title','title','required maxlength="'+(sponsor?85:130)+'"')}
        ${field('Contact email','contact','type="email" required maxlength="254"')}${sponsor?sponsorFields:calendarFields}</div>
        ${paragraph(sponsor?'Ad copy':'Short description','summary',sponsor?250:900)}
        <label>Image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required></label>
        <p>Choose a JPEG, PNG or WebP up to 12 MB and at least 1,080 pixels on its longest side.</p>
        ${field('What does the image show?','imageAlt','required maxlength="180"')}${field('Image credit','imageCredit','maxlength="180"')}
        <label class="editorial-check"><input name="imageRights" type="checkbox" required> I have permission to share this image for publication.</label>
        <div hidden>${field('Website','website','tabindex="-1" autocomplete="off"')}</div>
        <noscript><p>Enable JavaScript to upload a photo and submit this form.</p></noscript>
        <button class="button" type="submit">Submit for review</button>
        <p data-editorial-result role="status"></p><ul data-editorial-errors></ul><div data-editorial-receipt></div>
      </form>`);
  }
  function sponsorshipStatus() {
    return wrap(`${lead('taos','Sponsorship status','Keep this private link to return to your submission.')}
      <div class="editorial-form" data-sponsor-status><p role="status">Checking your submission.</p></div>`);
  }
  return { cityFeature,calendar,detail,weekly,submission,sponsorshipStatus };
}
