"use strict";

const APPS = {
    managerTufting: { name: "Menager Tufting", src: "MENAGER TUFTING/index.html" },
    inventory: { name: "Inventar Tufting", src: "INVENTAR TUFTING/index.html" },
    projectSheet: { name: "Fleta e Projektit", src: "FLETA E PROJEKTIT/index.html" },
    salesManager: { name: "Menager Shitje", src: "MENAGER SHITJE MODERN/index.html" },
    salesControl: { name: "Kontrolli i Shitjeve", src: "kontrolli i shitjeve/index.html" },
    invoice: { name: "Fatura", src: "FATURA/index.html" },
    calculator: { name: "Llogaritëse", src: "calculator.html" },
    ngjyrat: { name: "Inventari i Ngjyrave", src: "ngjyrat.html" },
};
const state = {
  currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  currentApp: null,
  timer: null,
  timerStart: null,
  elapsedToday: 0,
  notificationTimer: null,
  pendingWorkSession: null
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

const SUPABASE_URL = "https://xvnvzadfteklfqaiqdrq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ekRk1TrmEX8wF3DTxx1pZw_hahcOzzu";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const monthNames = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];


const UI_LANG = {
  sq: {dashboard:'Dashboard', programs:'Programet', appointments:'Terminat', workhours:'Orët e Punës', statistics:'Statistikat', gallery:'Galeria', backup:'Backup & Restore', settings:'Cilësimet', more:'Më shumë', settingsTitle:'Cilësimet', langTitle:'Gjuha e faqes', langDesc:'Zgjidh gjuhën që preferon për ndërfaqen.', nameTitle:'Emri në përshëndetje', nameDesc:'Ky emër shfaqet në Dashboard.', notifTitle:'Njoftimet e termineve', notifDesc:'Lejo browser-in të të njoftojë 30 minuta para dhe në orën e terminit.', clearTitle:'Pastro të dhënat lokale', clearDesc:'Fshin terminet, shënimet dhe orët e ruajtura.', clear:'Pastro', enable:'Aktivizo', active:'Aktive ✓', disable:'Çaktivizo', disabled:'Të çaktivizuara', backupDesc:'Ruaj një kopje të të gjitha të dhënave lokale dhe riktheje kur të duhet.', workDesc:'Çdo ndalesë ruhet me datë, orë fillimi, orë mbarimi dhe përshkrim.', exportCsv:'Eksporto CSV'},
  de: {dashboard:'Dashboard', programs:'Programme', appointments:'Termine', workhours:'Arbeitszeiten', statistics:'Statistiken', gallery:'Galerie', backup:'Backup & Wiederherstellung', settings:'Einstellungen', more:'Mehr', settingsTitle:'Einstellungen', langTitle:'Seitensprache', langDesc:'Wähle die gewünschte Sprache der Oberfläche.', nameTitle:'Name in der Begrüßung', nameDesc:'Dieser Name wird im Dashboard angezeigt.', notifTitle:'Terminbenachrichtigungen', notifDesc:'Der Browser erinnert dich 30 Minuten vorher und zum Terminzeitpunkt.', clearTitle:'Lokale Daten löschen', clearDesc:'Löscht Termine, Notizen und gespeicherte Arbeitszeiten.', clear:'Löschen', enable:'Aktivieren', active:'Aktiv ✓', disable:'Deaktivieren', disabled:'Deaktiviert', backupDesc:'Speichere eine Kopie aller lokalen Daten und stelle sie bei Bedarf wieder her.', workDesc:'Jeder Stopp wird mit Datum, Startzeit, Endzeit und Beschreibung gespeichert.', exportCsv:'CSV exportieren'},
  en: {dashboard:'Dashboard', programs:'Programs', appointments:'Appointments', workhours:'Work Hours', statistics:'Statistics', gallery:'Gallery', backup:'Backup & Restore', settings:'Settings', more:'More', settingsTitle:'Settings', langTitle:'Page language', langDesc:'Choose the preferred interface language.', nameTitle:'Greeting name', nameDesc:'This name appears on the Dashboard.', notifTitle:'Appointment notifications', notifDesc:'The browser can notify you 30 minutes before and at appointment time.', clearTitle:'Clear local data', clearDesc:'Deletes appointments, notes and saved work hours.', clear:'Clear', enable:'Enable', active:'Active ✓', disable:'Disable', disabled:'Disabled', backupDesc:'Save a copy of all local data and restore it whenever you need.', workDesc:'Every stop is saved with date, start time, end time and description.', exportCsv:'Export CSV'}
};
function currentUiLang(){ return storage.get('cc_lang','sq'); }
function uiText(key){ const lang=currentUiLang(); return (UI_LANG[lang]||UI_LANG.sq)[key] || UI_LANG.sq[key] || key; }
function setNodeText(selector,text){ const el=$(selector); if(el) el.textContent=text; }
function applyUiLanguage(lang=currentUiLang()){
  storage.set('cc_lang',lang); document.documentElement.lang=lang;
  const t=UI_LANG[lang]||UI_LANG.sq;
  const navMap={dashboard:t.dashboard,appointments:t.appointments,workhours:t.workhours,statistics:t.statistics,gallery:t.gallery,backup:t.backup,settings:t.settings};
  Object.entries(navMap).forEach(([k,v])=>{
    // Ndrysho vetëm etiketat e tekstit; mos prek span-in e ikonës në drawer.
    $$(`.side-nav [data-view="${k}"] span, .mp-bottom [data-view="${k}"] span, .mobile-bottom-nav [data-view="${k}"] span`).forEach(el=>el.textContent=v);
    const drawerLabel=$(`#mpDrawerList [data-view="${k}"] strong`);
    if(drawerLabel) drawerLabel.textContent=v;
  });
  const mpPrograms=$('#mpProgramsBottom span'); if(mpPrograms) mpPrograms.textContent=t.programs;
  const mpMore=$('#mpMore span'); if(mpMore) mpMore.textContent=t.more;
  const settingsRows=$$('#settingsView .setting-row');
  setNodeText('#settingsView h2',t.settingsTitle);
  if(settingsRows[0]){settingsRows[0].querySelector('strong').textContent=t.nameTitle;settingsRows[0].querySelector('span').textContent=t.nameDesc;}
  if(settingsRows[1]){settingsRows[1].querySelector('strong').textContent=t.langTitle;settingsRows[1].querySelector('span').textContent=t.langDesc;}
  if(settingsRows[2]){settingsRows[2].querySelector('strong').textContent=t.notifTitle;settingsRows[2].querySelector('span').textContent=t.notifDesc;}
  if(settingsRows[3]){settingsRows[3].querySelector('strong').textContent=t.clearTitle;settingsRows[3].querySelector('span').textContent=t.clearDesc;setNodeText('#clearData',t.clear);}
  setNodeText('#backupView h2',t.backup); setNodeText('#backupView .view-heading p',t.backupDesc);
  setNodeText('#workhoursView h2',t.workhours); setNodeText('#workhoursView .view-heading p',t.workDesc);
  const exp=$('#exportWorkCsv'); if(exp) exp.innerHTML='<i class="fa-solid fa-file-csv"></i> '+t.exportCsv;
  updateNotificationButton();
}
function notificationsEnabled(){ return storage.get('cc_notifications_enabled',true); }

window.addEventListener("DOMContentLoaded", () => {
  ensureToastContainer();
  initAuth();
  initClock();
  updateDateGreeting();
  setInterval(updateDateGreeting, 60000);
  bindNavigation();
  bindSearch();
  initTimer();
  initRealStats();
  initWorkHistory();
  initBackup();
  initCalendar();
  initAppointments();
  initNotifications();
  initNotes();
  initGallery();
  initSettings();
});

function setView(name) {
  $$('.view').forEach(view => view.classList.remove('active'));
  $(`#${name}View`)?.classList.add('active');
  $$('.nav-item').forEach(item => item.classList.remove('active'));
  $(`.nav-item[data-view="${name}"]`)?.classList.add('active');
  const titles = { dashboard: 'Dashboard', appointments: 'Terminat', workhours: 'Orët e Punës', statistics: 'Statistikat', gallery: 'Galeria', backup: 'Backup & Restore', settings: 'Cilësimet', app: 'Aplikacioni' };
  $('#topTitle').textContent = titles[name] || 'Dashboard';
  if (name === 'appointments') renderAppointments();
  if (name === 'workhours') renderWorkHistory();
  if (name === 'statistics') renderRealStats();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindNavigation() {
  document.addEventListener('click', event => {
    const app = event.target.closest('[data-app]');
    const view = event.target.closest('[data-view]');
    if (app) openApp(app.dataset.app);
    if (view) setView(view.dataset.view);
  });
  $('#resetView').onclick = logout;
  $('#backDashboard').onclick = () => setView('dashboard');
  $('#jumpCalendar').onclick = () => {
    setView('dashboard');
    setTimeout(() => $('#calendarPanel').scrollIntoView({ behavior: 'smooth' }), 60);
  };
  $('#refreshFrame').onclick = () => {
    $('#frameLoader').classList.remove('hidden');
    $('#appFrame').src = $('#appFrame').src;
  };
  $('#openNewTab').onclick = () => state.currentApp && window.open(APPS[state.currentApp].src, '_blank');
  $('#appFrame').addEventListener('load', () => setTimeout(() => $('#frameLoader').classList.add('hidden'), 250));
}

function openApp(key) {
  const app = APPS[key];
  if (!app) return;
  state.currentApp = key;
  $('#activeAppName').textContent = app.name;
  $('#topTitle').textContent = app.name;
  $('#frameLoader').classList.remove('hidden');
  $('#appFrame').src = app.src;
  setView('app');
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.app === key));
}

function bindSearch() {
  $('#appSearch').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    $$('#quickGrid .quick-card').forEach(card => {
      card.classList.toggle('hidden-by-search', query && !card.innerText.toLowerCase().includes(query));
    });
  });
}

function updateDateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = hour < 5 ? 'Natën e mirë' : hour < 12 ? 'Mirëmëngjes' : hour < 18 ? 'Mirëdita' : hour < 22 ? 'Mirëmbrëma' : 'Natën e mirë';
  const name = storage.get('cc_name', 'Jimmi');
  $('#greeting').textContent = `${greeting}, ${name} 👋`;
  $('#todayText').textContent = new Intl.DateTimeFormat('sq-AL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(now);
}

function initClock() {
  const tick = () => {
    const now = new Date();
    $('#secondHand').style.transform = `translateX(-50%) rotate(${now.getSeconds() * 6}deg)`;
    $('#minuteHand').style.transform = `translateX(-50%) rotate(${now.getMinutes() * 6 + now.getSeconds() * 0.1}deg)`;
    $('#hourHand').style.transform = `translateX(-50%) rotate(${(now.getHours() % 12) * 30 + now.getMinutes() * 0.5}deg)`;
  };
  tick();
  setInterval(tick, 1000);
}

function dayKey(date = new Date()) { return dayKeyLocal(date); }
function dayKeyLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function fmtSeconds(total) {
  total = Math.max(0, Math.floor(total));
  const hours = String(Math.floor(total / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function workSessions() { return storage.get('cc_work_sessions', []); }
function saveWorkSessions(list) { storage.set('cc_work_sessions', list); }

function initTimer() {
  const key = `cc_work_${dayKey()}`;
  state.elapsedToday = storage.get(key, 0);
  const savedStart = storage.get('cc_timer_start', null);
  if (savedStart && storage.get('cc_timer_day', '') === dayKey()) {
    state.timerStart = Number(savedStart);
    startTicker();
  }
  renderTimer();
  $('#startTimer').onclick = () => {
    if (state.timerStart) return;
    state.timerStart = Date.now();
    storage.set('cc_timer_start', state.timerStart);
    storage.set('cc_timer_day', dayKey());
    startTicker();
    renderWorkHistory();
    showToast('Matësi filloi', 'Koha e punës po regjistrohet.');
  };
  $('#stopTimer').onclick = () => {
    if (!state.timerStart) return;
    const stop = Date.now();
    const duration = Math.max(1, Math.floor((stop - state.timerStart) / 1000));
    state.pendingWorkSession = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), date: dayKey(), start: state.timerStart, stop, duration, description: '' };
    state.elapsedToday += duration;
    state.timerStart = null;
    storage.set(key, state.elapsedToday);
    localStorage.removeItem('cc_timer_start');
    localStorage.removeItem('cc_timer_day');
    clearInterval(state.timer); state.timer = null;
    renderTimer();
    $('#workDescription').value = '';
    $('#workSessionPreview').textContent = `${formatTimeStamp(state.pendingWorkSession.start)} – ${formatTimeStamp(stop)} · ${formatHumanDuration(duration)}`;
    $('#workDialog').showModal();
  };
}
function startTicker() { clearInterval(state.timer); state.timer = setInterval(renderTimer, 1000); renderTimer(); }
function renderTimer() {
  const running = state.timerStart ? Math.floor((Date.now() - state.timerStart) / 1000) : 0;
  const total = state.elapsedToday + running;
  $('#timerDisplay').textContent = fmtSeconds(running);
  $('#todayTotal').textContent = fmtSeconds(total);
  if ($('#workTodayBig')) $('#workTodayBig').textContent = fmtSeconds(total);
  if ($('#workLiveStatus')) $('#workLiveStatus').textContent = state.timerStart ? '● PUNË NË PROGRES' : 'Matësi është i ndalur';
}
function formatTimeStamp(ms) { return new Intl.DateTimeFormat('sq-AL',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(ms)); }
function formatHumanDuration(seconds) { const h=Math.floor(seconds/3600), m=Math.floor((seconds%3600)/60); return h ? `${h}h ${m}m` : `${m}m`; }

function events() { return storage.get('cc_events', []); }
function saveEvents(value) { storage.set('cc_events', value); }
function eventDateTime(item) { return new Date(`${item.date}T${item.time || '00:00'}:00`); }
function sortedEvents() { return events().slice().sort((a, b) => eventDateTime(a) - eventDateTime(b)); }

function initCalendar() {
  $('#prevMonth').onclick = () => { state.currentMonth.setMonth(state.currentMonth.getMonth() - 1); renderCalendar(); };
  $('#nextMonth').onclick = () => { state.currentMonth.setMonth(state.currentMonth.getMonth() + 1); renderCalendar(); };
  $('#appointmentsPrevMonth') && ($('#appointmentsPrevMonth').onclick = () => { state.currentMonth.setMonth(state.currentMonth.getMonth() - 1); renderCalendar(); });
  $('#appointmentsNextMonth') && ($('#appointmentsNextMonth').onclick = () => { state.currentMonth.setMonth(state.currentMonth.getMonth() + 1); renderCalendar(); });
  $('#heroAddEvent').onclick = () => openEventDialog(new Date());
  $('#eventForm').addEventListener('submit', event => {
    event.preventDefault();
    const id = $('#eventId').value || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
    const item = {
      id,
      date: $('#eventDate').value,
      time: $('#eventTime').value,
      title: $('#eventTitle').value.trim(),
      note: $('#eventNote').value.trim(),
      completed: $('#eventCompleted').checked,
      notified30: false,
      notifiedNow: false
    };
    if (!item.title || !item.time || !item.date) return;
    const list = events();
    const index = list.findIndex(entry => String(entry.id) === String(id));
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
    saveEvents(list);
    $('#eventDialog').close();
    renderAllEventViews();
    showToast(index >= 0 ? 'Termini u përditësua' : 'Termini u ruajt', `${formatDate(item.date)} në ${item.time}`);
  });
  renderCalendar();
}

function renderCalendar() {
  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth();
  if ($('#monthTitle')) $('#monthTitle').textContent = `${monthNames[month]} ${year}`;
  if ($('#appointmentsMonthTitle')) $('#appointmentsMonthTitle').textContent = `${monthNames[month]} ${year}`;
  const first = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const previousDays = new Date(year, month, 0).getDate();
  const all = events();
  const today = dayKey();
  let html = '';
  for (let i = 0; i < 42; i++) {
    let date;
    let muted = false;
    if (i < first) { date = new Date(year, month - 1, previousDays - first + i + 1); muted = true; }
    else if (i >= first + days) { date = new Date(year, month + 1, i - first - days + 1); muted = true; }
    else date = new Date(year, month, i - first + 1);
    const key = dayKeyLocal(date);
    const count = all.filter(item => item.date === key && !item.completed).length;
    html += `<button class="day ${muted ? 'muted' : ''} ${key === today ? 'today' : ''} ${count ? 'has-event' : ''}" data-date="${key}">${date.getDate()}${count ? `<span class="count">${count}</span>` : ''}</button>`;
  }
  if ($('#calendarGrid')) $('#calendarGrid').innerHTML = html;
  if ($('#appointmentsCalendarGrid')) $('#appointmentsCalendarGrid').innerHTML = html;
  $$('#calendarGrid .day, #appointmentsCalendarGrid .day').forEach(button => button.onclick = () => openDay(button.dataset.date));
}

function openDay(dateKey) {
  const dayEvents = sortedEvents().filter(item => item.date === dateKey);
  if (!dayEvents.length) {
    openEventDialog(new Date(`${dateKey}T12:00:00`));
    return;
  }
  setView('appointments');
  $('#appointmentFilter').value = 'all';
  $('#appointmentSearch').value = '';
  renderAppointments(dateKey);
}

function openEventDialog(date, item = null) {
  const key = item?.date || dayKeyLocal(date);
  $('#eventId').value = item?.id || '';
  $('#eventDate').value = key;
  $('#eventDateText').value = new Intl.DateTimeFormat('sq-AL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${key}T12:00:00`));
  $('#eventTime').value = item?.time || '09:00';
  $('#eventTitle').value = item?.title || '';
  $('#eventNote').value = item?.note || '';
  $('#eventCompleted').checked = Boolean(item?.completed);
  $('#eventDialog .modal-head h3').textContent = item ? 'Ndrysho termin' : 'Shto termin';
  $('#saveEvent').textContent = item ? 'Ruaj ndryshimet' : 'Ruaj termin';
  $('#eventDialog').showModal();
}

function initAppointments() {
  $('#addAppointment').onclick = () => openEventDialog(new Date());
  $('#appointmentSearch').addEventListener('input', () => renderAppointments());
  $('#appointmentFilter').addEventListener('change', () => renderAppointments());
  renderAllEventViews();
}

function renderAllEventViews() {
  renderCalendar();
  renderAppointments();
  renderUpcomingAppointments();
  renderNotifications();
}

function renderAppointments(forcedDate = '') {
  const container = $('#appointmentsList');
  if (!container) return;
  const query = ($('#appointmentSearch')?.value || '').trim().toLowerCase();
  const filter = $('#appointmentFilter')?.value || 'upcoming';
  const now = new Date();
  const today = dayKey();
  let list = sortedEvents().filter(item => {
    if (forcedDate && item.date !== forcedDate) return false;
    if (query && !`${item.title} ${item.note || ''}`.toLowerCase().includes(query)) return false;
    if (forcedDate) return true;
    if (filter === 'today') return item.date === today && !item.completed;
    if (filter === 'completed') return item.completed;
    if (filter === 'upcoming') return !item.completed && eventDateTime(item) >= new Date(now.getTime() - 60000);
    return true;
  });
  if (!list.length) {
    container.innerHTML = '<div class="gallery-empty"><div><i class="fa-regular fa-calendar-xmark" style="font-size:38px;display:block;text-align:center;margin-bottom:12px"></i>Nuk ka termine për këtë zgjedhje.</div></div>';
    return;
  }
  container.innerHTML = list.map(item => `
    <article class="appointment-row ${item.completed ? 'completed' : ''}">
      <div class="appointment-when"><strong>${formatDate(item.date)}</strong><span><i class="fa-regular fa-clock"></i> ${escapeHtml(item.time)}</span></div>
      <div class="appointment-main"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.note || 'Pa shënim shtesë')}</span></div>
      <div class="appointment-actions">
        <button title="${item.completed ? 'Rihap' : 'Përfundo'}" data-toggle-completed="${item.id}"><i class="fa-solid ${item.completed ? 'fa-rotate-left' : 'fa-check'}"></i></button>
        <button title="Ndrysho" data-edit-appointment="${item.id}"><i class="fa-solid fa-pen"></i></button>
        <button title="Fshi" class="delete-appointment" data-delete-appointment="${item.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    </article>`).join('');
  $$('[data-edit-appointment]').forEach(button => button.onclick = () => {
    const item = events().find(entry => String(entry.id) === button.dataset.editAppointment);
    if (item) openEventDialog(new Date(`${item.date}T12:00:00`), item);
  });
  $$('[data-toggle-completed]').forEach(button => button.onclick = () => {
    const list = events();
    const item = list.find(entry => String(entry.id) === button.dataset.toggleCompleted);
    if (!item) return;
    item.completed = !item.completed;
    saveEvents(list);
    renderAllEventViews();
  });
  $$('[data-delete-appointment]').forEach(button => button.onclick = () => {
    if (!confirm('Ta fshij këtë termin?')) return;
    saveEvents(events().filter(entry => String(entry.id) !== button.dataset.deleteAppointment));
    renderAllEventViews();
  });
}

function renderUpcomingAppointments() {
  const container = $('#upcomingAppointments');
  if (!container) return;
  const now = new Date();
  const list = sortedEvents().filter(item => !item.completed && eventDateTime(item) >= new Date(now.getTime() - 60000)).slice(0, 6);
  if (!list.length) {
    container.innerHTML = '<div class="notification-empty" style="grid-column:1/-1">Nuk ka termine të ardhshme.</div>';
    return;
  }
  container.innerHTML = list.map(item => {
    const date = new Date(`${item.date}T12:00:00`);
    return `<article class="upcoming-item">
      <div class="upcoming-date"><strong>${date.getDate()}</strong><span>${monthNames[date.getMonth()].slice(0,3)}</span></div>
      <div class="upcoming-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.time)} · ${formatDate(item.date)}</span></div>
      <button data-open-upcoming="${item.id}" title="Ndrysho"><i class="fa-solid fa-chevron-right"></i></button>
    </article>`;
  }).join('');
  $$('[data-open-upcoming]').forEach(button => button.onclick = () => {
    const item = events().find(entry => String(entry.id) === button.dataset.openUpcoming);
    if (item) openEventDialog(new Date(`${item.date}T12:00:00`), item);
  });
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${dateString}T12:00:00`));
}

function initNotifications() {
  $('#notificationButton').onclick = event => {
    event.stopPropagation();
    $('#notificationPopover').classList.toggle('show');
    renderNotifications();
  };
  $('#closeNotifications').onclick = () => $('#notificationPopover').classList.remove('show');
  document.addEventListener('click', event => {
    if (!event.target.closest('#notificationPopover') && !event.target.closest('#notificationButton')) $('#notificationPopover').classList.remove('show');
  });
  checkDueNotifications();
  state.notificationTimer = setInterval(checkDueNotifications, 30000);
  renderNotifications();
}

function notificationItems() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return sortedEvents().filter(item => !item.completed && eventDateTime(item) >= new Date(now.getTime() - 60 * 60 * 1000) && eventDateTime(item) <= tomorrow);
}

function renderNotifications() {
  const list = notificationItems();
  const badge = $('#notificationBadge');
  badge.textContent = String(list.length);
  badge.classList.toggle('is-hidden', list.length === 0);
  $('#notificationList').innerHTML = list.length ? list.map(item => {
    const diff = eventDateTime(item) - new Date();
    const label = diff <= 0 ? 'Termini është tani' : diff <= 30 * 60000 ? `Pas ${Math.max(1, Math.ceil(diff / 60000))} minutash` : `${formatDate(item.date)} në ${item.time}`;
    return `<div class="notification-item" data-notification-event="${item.id}"><i class="fa-regular fa-calendar-check"></i><div><strong>${escapeHtml(item.title)}</strong><span>${label}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</span></div></div>`;
  }).join('') : '<div class="notification-empty"><i class="fa-regular fa-bell-slash"></i><br><br>Nuk ka njoftime të reja.</div>';
  $$('[data-notification-event]').forEach(item => item.onclick = () => {
    const eventItem = events().find(entry => String(entry.id) === item.dataset.notificationEvent);
    if (eventItem) openEventDialog(new Date(`${eventItem.date}T12:00:00`), eventItem);
    $('#notificationPopover').classList.remove('show');
  });
}

function checkDueNotifications() {
  if (!notificationsEnabled()) { renderNotifications(); return; }
  const now = new Date();
  const list = events();
  let changed = false;
  list.forEach(item => {
    if (item.completed) return;
    const diff = eventDateTime(item) - now;
    if (diff <= 30 * 60000 && diff > 29 * 60000 && !item.notified30) {
      sendRealNotification(`Termini pas 30 minutash`, `${item.time} — ${item.title}`);
      item.notified30 = true;
      changed = true;
    }
    if (diff <= 30000 && diff > -30000 && !item.notifiedNow) {
      sendRealNotification(`Termini fillon tani`, `${item.time} — ${item.title}`);
      item.notifiedNow = true;
      changed = true;
    }
  });
  if (changed) saveEvents(list);
  renderNotifications();
}

function sendRealNotification(title, body) {
  if (!notificationsEnabled()) return;
  showToast(title, body);
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body, icon: 'assets/cuffi-logo.png' }); } catch {}
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Njoftimet nuk mbështeten', 'Ky browser nuk ofron njoftime të sistemit.');
    updateNotificationButton();
    return;
  }
  const permission = await Notification.requestPermission();
  updateNotificationButton();
  if (permission === 'granted') { storage.set('cc_notifications_enabled', true); showToast('Njoftimet u aktivizuan', 'Do të njoftohesh 30 minuta para dhe kur fillon termini.'); }
  else showToast('Njoftimet nuk u aktivizuan', 'Mund t’i lejosh nga cilësimet e browser-it.');
}

function updateNotificationButton() {
  const button = $('#enableNotifications');
  const off = $('#disableNotifications');
  if (!button) return;
  if (!('Notification' in window)) { button.textContent = 'Nuk mbështetet'; button.disabled = true; if(off) off.disabled=true; return; }
  const enabled = notificationsEnabled();
  if (Notification.permission === 'granted') { button.textContent = enabled ? uiText('active') : uiText('enable'); button.disabled = enabled; }
  else if (Notification.permission === 'denied') { button.textContent = 'E bllokuar'; button.disabled = false; }
  else { button.textContent = uiText('enable'); button.disabled = false; }
  if(off){ off.textContent = enabled ? uiText('disable') : uiText('disabled'); off.disabled = !enabled; }
}

function safeArray(key) { const value = storage.get(key, []); return Array.isArray(value) ? value : []; }
function parseFlexibleDate(value) {
  if (!value) return null;
  if (typeof value === 'number') return new Date(value);
  const raw=String(value).trim();
  let m=raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (m) return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));
  const d=new Date(raw); return Number.isNaN(d.getTime()) ? null : d;
}
function euro(value) { return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(value)||0); }
function collectRealData() {
  const invoices=safeArray('cuffi_invoices_orders');
  const sales=safeArray('cuffi_sales_log');
  const projects=safeArray('myTuftingProjects');
  const inventory=safeArray('tuftingInventory');
  const now=new Date();
  const inMonth=d=>d && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  const monthInvoices=invoices.filter(x=>inMonth(parseFlexibleDate(x.date)));
  const invoiceRevenueMonth=monthInvoices.reduce((s,x)=>s+Number(x.price||x.total_price||0),0);
  const salesRevenue=sales.reduce((s,x)=>s+Number(x.price||0),0);
  const salesProfit=sales.reduce((s,x)=>s+Number(x.profit||0),0);
  const names=[...invoices.map(x=>x.client||x.client_name),...sales.map(x=>x.client)].filter(Boolean).map(x=>String(x).trim().toLowerCase());
  return { invoices,sales,projects,inventory,monthInvoices, revenueMonth: invoiceRevenueMonth || salesRevenue, revenueAll: invoices.reduce((s,x)=>s+Number(x.price||x.total_price||0),0)+salesRevenue, profit:salesProfit, clients:new Set(names).size };
}
function initRealStats() { $('#refreshStats')?.addEventListener('click',renderRealStats); window.addEventListener('storage',renderRealStats); renderRealStats(); }
function renderRealStats() {
  const d=collectRealData();
  $('#metricRevenue').textContent=euro(d.revenueMonth);
  $('#metricOrders').textContent=String(d.monthInvoices.length || d.sales.length);
  $('#metricProjects').textContent=String(d.projects.length);
  $('#metricClients').textContent=String(d.clients);
  $('#statsRevenue') && ($('#statsRevenue').textContent=euro(d.revenueAll));
  $('#statsProfit') && ($('#statsProfit').textContent=euro(d.profit));
  $('#statsInvoices') && ($('#statsInvoices').textContent=String(d.invoices.length));
  $('#statsInventory') && ($('#statsInventory').textContent=String(d.inventory.length));
  renderSourceStatus(d); renderRevenueChart(d.invoices);
}
function renderSourceStatus(d) {
  const el=$('#dataSourceStatus'); if(!el)return;
  const rows=[['Faturat',d.invoices.length],['Shitjet',d.sales.length],['Projektet',d.projects.length],['Inventari',d.inventory.length],['Terminat',events().length],['Orët e punës',workSessions().length]];
  el.innerHTML=rows.map(([name,count])=>`<div class="source-row"><span>${name}</span><strong class="${count?'ok':'empty'}">${count} regjistrime</strong></div>`).join('');
}
function renderRevenueChart(invoices) {
  const canvas=$('#revenueChart'); if(!canvas)return; const ctx=canvas.getContext('2d');
  const cssW=canvas.clientWidth||900, cssH=320, ratio=window.devicePixelRatio||1; canvas.width=cssW*ratio; canvas.height=cssH*ratio; ctx.scale(ratio,ratio);
  ctx.clearRect(0,0,cssW,cssH); const values=Array(12).fill(0);
  invoices.forEach(x=>{const d=parseFlexibleDate(x.date); if(d&&d.getFullYear()===new Date().getFullYear()) values[d.getMonth()]+=Number(x.price||x.total_price||0)});
  const max=Math.max(...values,1), pad=42, w=cssW-pad*2, h=cssH-pad*2;
  ctx.strokeStyle='rgba(148,163,184,.16)';ctx.lineWidth=1;for(let i=0;i<5;i++){let y=pad+h*i/4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(pad+w,y);ctx.stroke()}
  const grad=ctx.createLinearGradient(0,pad,0,pad+h);grad.addColorStop(0,'rgba(168,85,247,.45)');grad.addColorStop(1,'rgba(168,85,247,0)');
  ctx.beginPath();values.forEach((v,i)=>{const x=pad+w*i/11,y=pad+h-(v/max)*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.lineTo(pad+w,pad+h);ctx.lineTo(pad,pad+h);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();values.forEach((v,i)=>{const x=pad+w*i/11,y=pad+h-(v/max)*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle='#a855f7';ctx.lineWidth=3;ctx.shadowColor='#a855f7';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#9aa2c4';ctx.font='11px Inter';monthNames.forEach((m,i)=>ctx.fillText(m.slice(0,3),pad+w*i/11-8,cssH-12));
}

function initWorkHistory() {
  $('#workForm').addEventListener('submit',e=>{ e.preventDefault(); if(!state.pendingWorkSession)return; const item={...state.pendingWorkSession,description:$('#workDescription').value.trim()||'Punë në studio'}; const list=workSessions(); list.unshift(item); saveWorkSessions(list); state.pendingWorkSession=null; $('#workDialog').close(); renderWorkHistory(); renderRealStats(); showToast('Seanca u ruajt',`${formatHumanDuration(item.duration)} · ${item.description}`); });
  $('#discardWorkSession').addEventListener('click',()=>{state.pendingWorkSession=null;});
  $('#exportWorkCsv').addEventListener('click',exportWorkCsv);
  $('#clearWorkHistory').addEventListener('click',()=>{if(confirm('Ta pastroj historikun e orëve?')){saveWorkSessions([]);renderWorkHistory();}});
  renderWorkHistory();
}
function renderWorkHistory() {
  const list=workSessions().slice().sort((a,b)=>b.start-a.start), body=$('#workHistoryBody'); if(!body)return;
  body.innerHTML=list.length?list.map(x=>`<tr><td>${formatDate(x.date)}</td><td>${formatTimeStamp(x.start)}</td><td>${formatTimeStamp(x.stop)}</td><td class="duration">${formatHumanDuration(x.duration)}</td><td>${escapeHtml(x.description||'Punë në studio')}</td><td class="row-actions"><button data-delete-work="${x.id}"><i class="fa-solid fa-trash"></i></button></td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:#858dac;padding:30px">Nuk ka ende seanca të ruajtura.</td></tr>';
  $$('[data-delete-work]').forEach(b=>b.onclick=()=>{saveWorkSessions(list.filter(x=>String(x.id)!==b.dataset.deleteWork));renderWorkHistory();});
  const now=new Date(), monday=new Date(now); monday.setDate(now.getDate()-((now.getDay()+6)%7));monday.setHours(0,0,0,0); const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const week=list.filter(x=>new Date(x.start)>=monday).reduce((s,x)=>s+Number(x.duration||0),0), month=list.filter(x=>new Date(x.start)>=monthStart).reduce((s,x)=>s+Number(x.duration||0),0);
  $('#workWeekTotal').textContent=formatHumanDuration(week); $('#workMonthTotal').textContent=formatHumanDuration(month); $('#workDaysCount').textContent=String(new Set(list.map(x=>x.date)).size); renderTimer();
}
function exportWorkCsv(){const rows=[['Data','Start','Stop','Sekonda','Koha','Pershkrimi'],...workSessions().map(x=>[x.date,formatTimeStamp(x.start),formatTimeStamp(x.stop),x.duration,formatHumanDuration(x.duration),x.description||''])];downloadBlob('\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'),'cuffi-oret-e-punes.csv','text/csv;charset=utf-8');}
function downloadBlob(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

function initBackup(){
  $('#exportBackup').addEventListener('click',()=>{const data={version:6,created:new Date().toISOString(),localStorage:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);data.localStorage[k]=localStorage.getItem(k)}downloadBlob(JSON.stringify(data,null,2),`cuffi-backup-${dayKey()}.json`,'application/json');showToast('Backup u krijua','Skedari JSON u shkarkua.');});
  $('#importBackup').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data.localStorage||typeof data.localStorage!=='object')throw new Error();if(!confirm('Të zëvendësohen të dhënat aktuale me backup-in?'))return;localStorage.clear();Object.entries(data.localStorage).forEach(([k,v])=>localStorage.setItem(k,v));alert('Backup u rikthye. Faqja do të rifreskohet.');location.reload()}catch{alert('Skedari backup nuk është i vlefshëm.')}finally{e.target.value=''}});
}

function initNotes() {
  renderNotes();
  $('#saveNote').onclick = saveNote;
  $('#addNoteBtn').onclick = () => $('#noteInput').focus();
  $('#noteInput').addEventListener('keydown', event => { if (event.key === 'Enter') saveNote(); });
}
function saveNote() {
  const text = $('#noteInput').value.trim();
  if (!text) return;
  const list = storage.get('cc_notes', []);
  list.unshift({ id: Date.now(), text, created: new Date().toISOString() });
  storage.set('cc_notes', list);
  $('#noteInput').value = '';
  renderNotes();
}
function renderNotes() {
  const list = storage.get('cc_notes', []);
  $('#notesList').innerHTML = list.length ? list.map(note => `<div class="note-item"><span>${escapeHtml(note.text)}</span><button data-delete-note="${note.id}"><i class="fa-solid fa-trash"></i></button></div>`).join('') : '<div style="color:#8389a8;font-size:12px;padding:10px">Nuk ka ende shënime.</div>';
  $$('[data-delete-note]').forEach(button => button.onclick = () => {
    storage.set('cc_notes', list.filter(note => String(note.id) !== button.dataset.deleteNote));
    renderNotes();
  });
}

function initGallery() {
  renderGallery();
  $('#galleryUpload').addEventListener('change', async event => {
    const files = [...event.target.files].filter(file => file.type.startsWith('image/'));
    const items = await Promise.all(files.map(async file => ({ id: Date.now() + Math.random(), name: file.name, src: await fileData(file) })));
    storage.set('cc_gallery', [...items, ...storage.get('cc_gallery', [])]);
    renderGallery();
    event.target.value = '';
  });
  $('#closeImage').onclick = () => $('#imageDialog').close();
}
function fileData(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
function renderGallery() {
  const list = storage.get('cc_gallery', []);
  $('#galleryGrid').innerHTML = list.length ? list.map(item => `<article class="gallery-item"><img src="${item.src}" data-open-image="${item.id}" alt="${escapeHtml(item.name)}"><footer><span>${escapeHtml(item.name)}</span><button data-delete-image="${item.id}"><i class="fa-solid fa-trash"></i></button></footer></article>`).join('') : '<div class="gallery-empty"><div><i class="fa-regular fa-images" style="font-size:40px;display:block;text-align:center;margin-bottom:12px"></i>Nuk ka foto. Kliko “Ngarko foto”.</div></div>';
  $$('[data-open-image]').forEach(image => image.onclick = () => {
    const item = list.find(entry => String(entry.id) === image.dataset.openImage);
    $('#largeImage').src = item.src;
    $('#imageCaption').textContent = item.name;
    $('#imageDialog').showModal();
  });
  $$('[data-delete-image]').forEach(button => button.onclick = () => {
    storage.set('cc_gallery', list.filter(item => String(item.id) !== button.dataset.deleteImage));
    renderGallery();
  });
}

function initSettings() {
  const name = storage.get('cc_name', 'Jimmi');
  $('#nameSetting').value = name;
  $('#nameSetting').addEventListener('change', event => {
    storage.set('cc_name', event.target.value.trim() || 'Jimmi');
    updateDateGreeting();
  });
  const language = $('#languageSetting');
  if(language){ language.value=currentUiLang(); language.addEventListener('change',e=>applyUiLanguage(e.target.value)); }
  $('#enableNotifications').onclick = requestNotificationPermission;
  const off=$('#disableNotifications');
  if(off) off.onclick=()=>{storage.set('cc_notifications_enabled',false);updateNotificationButton();showToast('Njoftimet','Njoftimet e termineve u çaktivizuan.');};
  applyUiLanguage(currentUiLang());
  updateNotificationButton();
  $('#clearData').onclick = () => {
    if (!confirm('Të fshihen të gjitha të dhënat lokale?')) return;
    ['cc_events', 'cc_notes', 'cc_gallery', 'cc_name', 'cc_timer_start', 'cc_timer_day', 'cc_work_sessions'].forEach(key => localStorage.removeItem(key));
    Object.keys(localStorage).filter(key => key.startsWith('cc_work_')).forEach(key => localStorage.removeItem(key));
    location.reload();
  };
}

async function initAuth() {
  const overlay = $('#loginOverlay');
  const emailInput = $('#loginUsername');
  const passwordInput = $('#loginPassword');
  const errorBox = $('#loginError');

  const showLogin = () => {
    overlay.classList.remove('is-hidden');
    setTimeout(() => emailInput?.focus(), 80);
  };

  const hideLogin = () => {
    overlay.classList.add('is-hidden');
    passwordInput.value = '';
    errorBox.textContent = '';
  };

  $('#togglePassword').onclick = () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    $('#togglePassword i').className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  };

  $('#loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    errorBox.textContent = 'Duke hyrë...';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      errorBox.textContent = error.message === 'Invalid login credentials'
        ? 'Email-i ose fjalëkalimi është gabim.'
        : `Nuk u krye hyrja: ${error.message}`;
      passwordInput.select();
      return;
    }

    errorBox.textContent = '';
    hideLogin();
  });

  $('#forgotPassword').onclick = () => {
    const dialog = $('#forgotPasswordDialog');
    const emailField = $('#forgotPasswordEmail');
    const currentEmail = $('#loginUsername')?.value.trim() || '';
    $('#forgotPasswordError').textContent = '';
    emailField.value = currentEmail;
    dialog.showModal();
    setTimeout(() => emailField.focus(), 50);
  };

  $('#forgotPasswordForm').addEventListener('submit', async event => {
    event.preventDefault();

    const email = $('#forgotPasswordEmail').value.trim();
    const errorBox = $('#forgotPasswordError');
    const sendButton = $('#sendResetEmail');

    if (!email) {
      errorBox.textContent = 'Shkruaj email-in.';
      return;
    }

    errorBox.textContent = 'Po dërgohet email-i...';
    sendButton.disabled = true;

    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });

    sendButton.disabled = false;

    if (error) {
      if ((error.message || '').toLowerCase().includes('security purposes')) {
        errorBox.textContent = 'Prit pak sekonda dhe provo përsëri.';
      } else {
        errorBox.textContent = `Email-i nuk u dërgua: ${error.message}`;
      }
      return;
    }

    errorBox.textContent = '';
    $('#forgotPasswordDialog').close();
    showToast('Email-i u dërgua', 'Kontrollo Inbox dhe Spam/Junk për linkun e ndryshimit të fjalëkalimit.');
  });

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) hideLogin();
  else showLogin();

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) hideLogin();
    if (event === 'SIGNED_OUT') showLogin();

    if (event === 'PASSWORD_RECOVERY') {
      hideLogin();
      setTimeout(() => {
        $('#newPassword').value = '';
        $('#confirmNewPassword').value = '';
        $('#resetPasswordError').textContent = '';
        $('#resetPasswordDialog').showModal();
        $('#newPassword').focus();
      }, 50);
    }
  });

  $('#resetPasswordForm').addEventListener('submit', async event => {
    event.preventDefault();
    const password = $('#newPassword').value;
    const confirmPassword = $('#confirmNewPassword').value;
    const resetError = $('#resetPasswordError');

    if (password.length < 6) {
      resetError.textContent = 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.';
      return;
    }
    if (password !== confirmPassword) {
      resetError.textContent = 'Fjalëkalimet nuk përputhen.';
      return;
    }

    resetError.textContent = 'Duke ruajtur...';
    const { error } = await supabaseClient.auth.updateUser({ password });

    if (error) {
      resetError.textContent = `Nuk u ruajt: ${error.message}`;
      return;
    }

    resetError.textContent = '';
    $('#resetPasswordDialog').close();
    showToast('Fjalëkalimi u ndryshua', 'Tani mund të përdorësh fjalëkalimin e ri.');
  });
}

async function logout() {
  await supabaseClient.auth.signOut();
  setView('dashboard');
  $('#loginOverlay').classList.remove('is-hidden');
  $('#loginUsername').value = '';
  $('#loginPassword').value = '';
  $('#loginError').textContent = '';
  setTimeout(() => $('#loginUsername')?.focus(), 80);
}

function ensureToastContainer() {
  if ($('#toastStack')) return;
  const container = document.createElement('div');
  container.id = 'toastStack';
  container.className = 'toast-stack';
  document.body.appendChild(container);
}
function showToast(title, message) {
  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
  $('#toastStack').appendChild(toast);
  setTimeout(() => toast.remove(), 5500);
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  document.head.insertAdjacentHTML("beforeend", "<style>body, .app-container, .dashboard, main { background: #070000 !important; }</style>");
