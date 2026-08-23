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

const AUTH_USER = "cuffi";
const AUTH_PASS = "11asdrosagzimi";
const monthNames = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];

const UI_TRANSLATIONS = {
  sq: {
    settingsTitle: 'Cilësimet',
    backupTitle: 'Backup & Restore',
    backupDesc: 'Ruaj një kopje të të gjitha të dhënave lokale dhe riktheje kur të duhet.',
    backupCreateTitle: 'Krijo Backup',
    backupCreateDesc: 'Eksporton terminet, galerinë, shënimet, orët dhe të dhënat e programeve në një skedar JSON.',
    backupDownload: 'Shkarko Backup',
    backupRestoreTitle: 'Rikthe Backup',
    backupRestoreDesc: 'Zgjidh një skedar backup të krijuar nga ky sistem. Të dhënat aktuale do të zëvendësohen.',
    chooseFile: 'Zgjidh skedarin',
    workTitle: 'Orët e Punës',
    workDesc: 'Çdo ndalesë ruhet me datë, orë fillimi, orë mbarimi dhe përshkrim.',
    exportCsv: 'Eksporto CSV',
    settingNameTitle: 'Emri në përshëndetje',
    settingNameDesc: 'Ky emër shfaqet në Dashboard.',
    settingLangTitle: 'Gjuha e faqes',
    settingLangDesc: 'Zgjidh gjuhën që preferon për ndërfaqen.',
    settingNotifTitle: 'Njoftimet e termineve',
    settingNotifDesc: 'Lejo browser-in të të njoftojë 30 minuta para dhe në orën e terminit.',
    settingClearTitle: 'Pastro të dhënat lokale',
    settingClearDesc: 'Fshin terminet, shënimet dhe orët e ruajtura.',
    enableNotif: 'Aktivizo',
    activeNotif: 'Aktive ✓',
    disabledNotif: 'Të çaktivizuara',
    disableNotif: 'Çaktivizo',
    blockedNotif: 'E bllokuar',
    unsupportedNotif: 'Nuk mbështetet',
    clearData: 'Pastro'
  },
  de: {
    settingsTitle: 'Einstellungen',
    backupTitle: 'Backup & Wiederherstellung',
    backupDesc: 'Speichere eine Kopie aller lokalen Daten und stelle sie bei Bedarf wieder her.',
    backupCreateTitle: 'Backup erstellen',
    backupCreateDesc: 'Exportiert Termine, Galerie, Notizen, Arbeitszeiten und Programmdaten in eine JSON-Datei.',
    backupDownload: 'Backup herunterladen',
    backupRestoreTitle: 'Backup wiederherstellen',
    backupRestoreDesc: 'Wähle eine mit diesem System erstellte Backup-Datei. Die aktuellen Daten werden ersetzt.',
    chooseFile: 'Datei auswählen',
    workTitle: 'Arbeitszeiten',
    workDesc: 'Jeder Stopp wird mit Datum, Startzeit, Endzeit und Beschreibung gespeichert.',
    exportCsv: 'CSV exportieren',
    settingNameTitle: 'Name in der Begrüßung',
    settingNameDesc: 'Dieser Name wird im Dashboard angezeigt.',
    settingLangTitle: 'Seitensprache',
    settingLangDesc: 'Wähle die gewünschte Sprache der Oberfläche.',
    settingNotifTitle: 'Terminbenachrichtigungen',
    settingNotifDesc: 'Erlaube dem Browser, dich 30 Minuten vorher und zum Terminzeitpunkt zu benachrichtigen.',
    settingClearTitle: 'Lokale Daten löschen',
    settingClearDesc: 'Löscht Termine, Notizen und gespeicherte Arbeitszeiten.',
    enableNotif: 'Aktivieren',
    activeNotif: 'Aktiv ✓',
    disabledNotif: 'Deaktiviert',
    disableNotif: 'Deaktivieren',
    blockedNotif: 'Blockiert',
    unsupportedNotif: 'Nicht unterstützt',
    clearData: 'Löschen'
  },
  en: {
    settingsTitle: 'Settings',
    backupTitle: 'Backup & Restore',
    backupDesc: 'Save a copy of all local data and restore it whenever you need.',
    backupCreateTitle: 'Create Backup',
    backupCreateDesc: 'Exports appointments, gallery, notes, work hours and app data into a JSON file.',
    backupDownload: 'Download Backup',
    backupRestoreTitle: 'Restore Backup',
    backupRestoreDesc: 'Choose a backup file created by this system. Current data will be replaced.',
    chooseFile: 'Choose file',
    workTitle: 'Work Hours',
    workDesc: 'Every stop is saved with date, start time, end time and description.',
    exportCsv: 'Export CSV',
    settingNameTitle: 'Greeting name',
    settingNameDesc: 'This name appears on the Dashboard.',
    settingLangTitle: 'Page language',
    settingLangDesc: 'Choose the preferred interface language.',
    settingNotifTitle: 'Appointment notifications',
    settingNotifDesc: 'Allow the browser to notify you 30 minutes before and at appointment time.',
    settingClearTitle: 'Clear local data',
    settingClearDesc: 'Deletes appointments, notes and saved work hours.',
    enableNotif: 'Enable',
    activeNotif: 'Active ✓',
    disabledNotif: 'Disabled',
    disableNotif: 'Disable',
    blockedNotif: 'Blocked',
    unsupportedNotif: 'Unsupported',
    clearData: 'Clear'
  }
};
function currentLanguage(){ return storage.get('cc_lang', 'sq'); }
function tr(key, lang = currentLanguage()){
  const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.sq;
  return dict[key] || UI_TRANSLATIONS.sq[key] || key;
}
function notificationsEnabled(){ return storage.get('cc_notifications_enabled', true); }
function setNotificationsEnabled(enabled){ storage.set('cc_notifications_enabled', !!enabled); updateNotificationButton(); }
function setText(selector, text){ const el = $(selector); if (el) el.textContent = text; }
function setHtmlWithIcon(selector, iconClass, text){ const el = $(selector); if (el) el.innerHTML = iconClass ? '<i class="'+iconClass+'"></i> ' + text : text; }
function applyLanguage(lang = currentLanguage()){
  storage.set('cc_lang', lang);
  document.documentElement.lang = lang;
  const nameRow = $$('#settingsView .setting-row')[0];
  const langRow = $$('#settingsView .setting-row')[1];
  const notifRow = $$('#settingsView .setting-row')[2];
  const clearRow = $$('#settingsView .setting-row')[3];
  setText('#settingsView h2', tr('settingsTitle', lang));
  if (nameRow){ setText('#settingsView .setting-row:nth-of-type(1) strong', tr('settingNameTitle', lang)); setText('#settingsView .setting-row:nth-of-type(1) span', tr('settingNameDesc', lang)); }
  if (langRow){ setText('#settingsView .setting-row:nth-of-type(2) strong', tr('settingLangTitle', lang)); setText('#settingsView .setting-row:nth-of-type(2) span', tr('settingLangDesc', lang)); }
  if (notifRow){ setText('#settingsView .setting-row:nth-of-type(3) strong', tr('settingNotifTitle', lang)); setText('#settingsView .setting-row:nth-of-type(3) span', tr('settingNotifDesc', lang)); }
  if (clearRow){ setText('#settingsView .setting-row:nth-of-type(4) strong', tr('settingClearTitle', lang)); setText('#settingsView .setting-row:nth-of-type(4) span', tr('settingClearDesc', lang)); setText('#clearData', tr('clearData', lang)); }

  setText('#backupView h2', tr('backupTitle', lang));
  setText('#backupView .view-heading p', tr('backupDesc', lang));
  const backupCards = $$('#backupView .backup-card');
  if (backupCards[0]) {
    const title = backupCards[0].querySelector('h3'); const desc = backupCards[0].querySelector('p'); const btn = backupCards[0].querySelector('button');
    if (title) title.textContent = tr('backupCreateTitle', lang);
    if (desc) desc.textContent = tr('backupCreateDesc', lang);
    if (btn) btn.textContent = tr('backupDownload', lang);
  }
  if (backupCards[1]) {
    const title = backupCards[1].querySelector('h3'); const desc = backupCards[1].querySelector('p'); const label = backupCards[1].querySelector('label.upload-label'); const input = label?.querySelector('input');
    if (title) title.textContent = tr('backupRestoreTitle', lang);
    if (desc) desc.textContent = tr('backupRestoreDesc', lang);
    if (label) { label.textContent = tr('chooseFile', lang); if (input) label.appendChild(input); }
  }

  setText('#workhoursView h2', tr('workTitle', lang));
  setText('#workhoursView .view-heading p', tr('workDesc', lang));
  setHtmlWithIcon('#exportWorkCsv', 'fa-solid fa-file-csv', tr('exportCsv', lang));
  updateNotificationButton();
}

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
  document.body.style.backgroundColor = '#d92525';
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
  $('#monthTitle').textContent = `${monthNames[month]} ${year}`;
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
  $('#calendarGrid').innerHTML = html;
  $$('.day').forEach(button => button.onclick = () => openDay(button.dataset.date));
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
  if (permission === 'granted') {
    setNotificationsEnabled(true);
    showToast('Njoftimet u aktivizuan', 'Do të njoftohesh 30 minuta para dhe kur fillon termini.');
  } else {
    showToast('Njoftimet nuk u aktivizuan', 'Mund t’i lejosh nga cilësimet e browser-it.');
  }
  updateNotificationButton();
}

function disableNotifications() {
  setNotificationsEnabled(false);
  showToast('Njoftimet u çaktivizuan', 'Nuk do të shfaqen njoftime të reja derisa t’i aktivizosh sërish.');
}

function updateNotificationButton() {
  const enableButton = $('#enableNotifications');
  const disableButton = $('#disableNotifications');
  if (!enableButton) return;
  const enabled = notificationsEnabled();
  if (!('Notification' in window)) {
    enableButton.textContent = tr('unsupportedNotif');
    enableButton.disabled = true;
    if (disableButton) { disableButton.textContent = tr('disableNotif'); disableButton.disabled = true; }
    return;
  }
  if (Notification.permission === 'granted') {
    enableButton.textContent = enabled ? tr('activeNotif') : tr('enableNotif');
    enableButton.disabled = enabled;
  } else if (Notification.permission === 'denied') {
    enableButton.textContent = tr('blockedNotif');
    enableButton.disabled = false;
  } else {
    enableButton.textContent = tr('enableNotif');
    enableButton.disabled = false;
  }
  if (disableButton) {
    disableButton.textContent = enabled ? tr('disableNotif') : tr('disabledNotif');
    disableButton.disabled = !enabled;
  }
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
  // Backup overflow storage:
  // Disa backup-e të vjetra kanë shumë foto base64 dhe mund të kalojnë kufirin e localStorage.
  // Çelësat që nuk futen më në localStorage ruhen këtu, që të mos humbasin nga backup-i.
  const CUFFI_OVERFLOW_DB='cuffi_backup_overflow_v1';
  const CUFFI_OVERFLOW_STORE='items';

  function cuffiOpenOverflowDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(CUFFI_OVERFLOW_DB,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(CUFFI_OVERFLOW_STORE))req.result.createObjectStore(CUFFI_OVERFLOW_STORE)};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }

  async function cuffiOverflowClear(){
    const db=await cuffiOpenOverflowDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(CUFFI_OVERFLOW_STORE,'readwrite');
      tx.objectStore(CUFFI_OVERFLOW_STORE).clear();
      tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
    });
    db.close();
  }

  async function cuffiOverflowPut(key,value){
    const db=await cuffiOpenOverflowDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(CUFFI_OVERFLOW_STORE,'readwrite');
      tx.objectStore(CUFFI_OVERFLOW_STORE).put(value,key);
      tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
    });
    db.close();
  }

  async function cuffiOverflowGetAll(){
    const db=await cuffiOpenOverflowDB();
    const result=await new Promise((resolve,reject)=>{
      const tx=db.transaction(CUFFI_OVERFLOW_STORE,'readonly');
      const store=tx.objectStore(CUFFI_OVERFLOW_STORE);
      const out={};
      const req=store.openCursor();
      req.onsuccess=()=>{
        const c=req.result;
        if(!c){resolve(out);return}
        out[c.key]=c.value;
        c.continue();
      };
      req.onerror=()=>reject(req.error);
    });
    db.close();
    return result;
  }

  $('#exportBackup').addEventListener('click',async()=>{
    try{
      const data={version:7,created:new Date().toISOString(),localStorage:{}};
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i);
        data.localStorage[k]=localStorage.getItem(k);
      }
      // Bashko edhe çfarë është ruajtur në overflow, që backup-i të mbetet komplet.
      try{
        const overflow=await cuffiOverflowGetAll();
        Object.entries(overflow).forEach(([k,v])=>{
          if(!(k in data.localStorage)) data.localStorage[k]=v;
        });
      }catch(_){}
      downloadBlob(JSON.stringify(data,null,2),`cuffi-backup-${dayKey()}.json`,'application/json');
      showToast('Backup u krijua','Skedari JSON u shkarkua.');
    }catch(err){
      console.error(err);
      alert('Backup-i nuk mund të krijohej.');
    }
  });

  $('#importBackup').addEventListener('change',async e=>{
    const f=e.target.files?.[0];
    if(!f)return;
    try{
      const raw=await f.text();
      let data;
      try{ data=JSON.parse(raw); }
      catch{ throw new Error('JSON_PARSE'); }

      if(!data || !data.localStorage || typeof data.localStorage!=='object' || Array.isArray(data.localStorage)){
        throw new Error('BAD_FORMAT');
      }

      if(!confirm('Të zëvendësohen të dhënat aktuale me backup-in?'))return;

      // Fillojmë pastër.
      localStorage.clear();
      try{ await cuffiOverflowClear(); }catch(_){}

      // Fut çelësat e vegjël të parët. Kjo siguron që të dhënat kryesore të programeve
      // rikthehen edhe kur fotot e vjetra base64 janë shumë të mëdha për localStorage.
      const entries=Object.entries(data.localStorage)
        .map(([k,v])=>[k,typeof v==='string'?v:String(v)])
        .sort((a,b)=>a[1].length-b[1].length);

      const overflowKeys=[];
      for(const [k,v] of entries){
        try{
          localStorage.setItem(k,v);
        }catch(err){
          // QuotaExceededError: ruaje të plotë në IndexedDB, mos e humb.
          try{
            await cuffiOverflowPut(k,v);
            overflowKeys.push(k);
          }catch(idbErr){
            console.error('Nuk u ruajt çelësi:',k,idbErr);
            throw new Error('RESTORE_FAILED');
          }
        }
      }

      if(overflowKeys.length){
        alert(
          'Backup u rikthye. Të dhënat kryesore janë rikthyer.\\n\\n' +
          overflowKeys.length + ' element(e) shumë të mëdha (zakonisht foto të vjetra) ' +
          'u ruajtën në memorien e sigurt të browser-it që të mos humbasin.\\n\\n' +
          'Faqja do të rifreskohet.'
        );
      }else{
        alert('Backup u rikthye plotësisht. Faqja do të rifreskohet.');
      }
      location.reload();
    }catch(err){
      console.error('Backup restore error:',err);
      if(err && err.message==='JSON_PARSE'){
        alert('Skedari nuk është JSON i vlefshëm.');
      }else if(err && err.message==='BAD_FORMAT'){
        alert('Ky JSON nuk është backup i Cuffi Studio.');
      }else{
        alert('Backup-i është i vlefshëm, por pati problem gjatë rikthimit. Të dhënat ekzistuese nuk duhet të fshihen përsëri; provo vetëm me këtë version të app.js.');
      }
    }finally{
      e.target.value='';
    }
  });
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
  const languageSelect = $('#languageSetting');
  if (languageSelect) {
    languageSelect.value = currentLanguage();
    languageSelect.addEventListener('change', event => applyLanguage(event.target.value));
  }
  $('#enableNotifications').onclick = requestNotificationPermission;
  const disableBtn = $('#disableNotifications');
  if (disableBtn) disableBtn.onclick = disableNotifications;
  updateNotificationButton();
  applyLanguage(currentLanguage());
  $('#clearData').onclick = () => {
    if (!confirm('Të fshihen të gjitha të dhënat lokale?')) return;
    ['cc_events', 'cc_notes', 'cc_gallery', 'cc_name', 'cc_timer_start', 'cc_timer_day', 'cc_work_sessions', 'cc_lang', 'cc_notifications_enabled'].forEach(key => localStorage.removeItem(key));
    Object.keys(localStorage).filter(key => key.startsWith('cc_work_')).forEach(key => localStorage.removeItem(key));
    location.reload();
  };
}

function initAuth() {
  const overlay = $('#loginOverlay');
  const remembered = localStorage.getItem('cc_auth') === 'true';
  const session = sessionStorage.getItem('cc_auth') === 'true';
  if (remembered || session) { overlay.classList.add('is-hidden'); return; }
  overlay.classList.remove('is-hidden');
  setTimeout(() => $('#loginUsername')?.focus(), 80);
  $('#togglePassword').onclick = () => {
    const input = $('#loginPassword');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    $('#togglePassword i').className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  };
  $('#loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    const user = $('#loginUsername').value.trim();
    const pass = $('#loginPassword').value;

    if (user === AUTH_USER && pass === AUTH_PASS) {
      $('#loginError').textContent = 'Po lidhet me cloud...';

      const cloudResult = typeof window.cuffiSupabaseSignIn === 'function'
        ? await window.cuffiSupabaseSignIn("gezimtahiri1@web.de", pass)
        : { ok:false, error:'Supabase nuk është ngarkuar ende.' };

      if (!cloudResult.ok) {
        // Mos e blloko hyrjen në aplikacion nëse Supabase nuk lidhet.
        // Login-i lokal vazhdon normalisht; cloud sync thjesht mbetet joaktiv.
        console.warn('Supabase Auth nuk u lidh:', cloudResult.error);
      }

      $('#loginError').textContent = '';
      if ($('#rememberLogin').checked) localStorage.setItem('cc_auth', 'true');
      else sessionStorage.setItem('cc_auth', 'true');
      overlay.classList.add('is-hidden');
      $('#loginPassword').value = '';
    } else {
      $('#loginError').textContent = 'Përdoruesi ose fjalëkalimi është gabim.';
      $('#loginPassword').select();
    }
  });
}

function logout() {
  localStorage.removeItem('cc_auth');
  sessionStorage.removeItem('cc_auth');
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



/* ===== CUFFI SUPABASE SYNC (SHTESË E IZOLUAR) =====
   Nuk ndryshon pamjen apo funksionet ekzistuese.
   Sinkronizon localStorage midis PC dhe telefonit kur ka Supabase session.
*/
(function () {
  const CUFFI_SB_URL = "https://xvnvzadfteklfqaiqdrq.supabase.co";
  const CUFFI_SB_KEY = "sb_publishable_ekRk1TrmEX8wF3DTxx1pZw_hahcOzzu";
  const CUFFI_SB_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  let client = null;
  let user = null;
  let applying = false;
  let started = false;
  let pullTimer = null;
  let queue = new Map();
  let queueTimer = null;

  function ignored(k) {
    return !k || /^sb-.*-auth-token$/.test(k) || k === "cuffi_cloud_last_sync";
  }

  function loadSupabase() {
    if (window.supabase?.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-cuffi-supabase]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const s = document.createElement("script");
      s.src = CUFFI_SB_CDN;
      s.async = true;
      s.dataset.cuffiSupabase = "1";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function wrap(v) { return { raw: String(v ?? "") }; }
  function unwrap(v) {
    if (v && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, "raw")) return String(v.raw ?? "");
    if (typeof v === "string") return v;
    return JSON.stringify(v ?? null);
  }

  async function pushKey(k, v) {
    if (!client || !user || applying || ignored(k)) return;
    const { error } = await client.from("cuffi_sync").upsert({
      user_id: user.id,
      key: k,
      value: wrap(v),
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,key" });
    if (error) console.error("Cuffi sync push:", k, error);
  }

  async function deleteKey(k) {
    if (!client || !user || applying || ignored(k)) return;
    const { error } = await client.from("cuffi_sync")
      .delete()
      .eq("user_id", user.id)
      .eq("key", k);
    if (error) console.error("Cuffi sync delete:", k, error);
  }

  function queuePush(k, v) {
    if (!user || applying || ignored(k)) return;
    queue.set(k, v);
    clearTimeout(queueTimer);
    queueTimer = setTimeout(async () => {
      const batch = [...queue.entries()];
      queue.clear();
      for (const [key, val] of batch) await pushKey(key, val);
    }, 450);
  }

  async function pushAllLocal() {
    const rows = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (ignored(k)) continue;
      rows.push({
        user_id: user.id,
        key: k,
        value: wrap(localStorage.getItem(k)),
        updated_at: new Date().toISOString()
      });
    }
    for (let i = 0; i < rows.length; i += 40) {
      const { error } = await client.from("cuffi_sync")
        .upsert(rows.slice(i, i + 40), { onConflict: "user_id,key" });
      if (error) throw error;
    }
  }

  async function pullCloud() {
    if (!client || !user) return;
    const { data, error } = await client.from("cuffi_sync")
      .select("key,value")
      .eq("user_id", user.id);
    if (error) {
      console.error("Cuffi sync pull:", error);
      return;
    }
    let changed = false;
    applying = true;
    try {
      for (const row of (data || [])) {
        if (ignored(row.key)) continue;
        const incoming = unwrap(row.value);
        if (localStorage.getItem(row.key) !== incoming) {
          localStorage.setItem(row.key, incoming);
          changed = true;
        }
      }
    } finally {
      applying = false;
    }
    if (changed) {
      try {
        renderAllEventViews?.();
        renderWorkHistory?.();
        renderRealStats?.();
        renderNotes?.();
        renderGallery?.();
        updateDateGreeting?.();
      } catch (_) {}
    }
  }

  async function startWithSession(session) {
    if (!session?.user || started) return;
    user = session.user;
    started = true;

    const { data, error } = await client.from("cuffi_sync")
      .select("key")
      .eq("user_id", user.id)
      .limit(1);

    if (error) {
      console.error("Cuffi sync start:", error);
      started = false;
      return;
    }

    if (!data || data.length === 0) {
      // Pajisja e parë me të dhënat ekzistuese i ngarkon në cloud.
      await pushAllLocal();
    } else {
      await pullCloud();
    }

    clearInterval(pullTimer);
    pullTimer = setInterval(pullCloud, 5000);
  }

  window.cuffiSupabaseSignIn = async function(email, password) {
    try {
      await loadSupabase();
      if (!client) {
        client = window.supabase.createClient(CUFFI_SB_URL, CUFFI_SB_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
        });
      }
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { ok:false, error:error.message };
      if (data?.session?.user) await startWithSession(data.session);
      return { ok:true };
    } catch (e) {
      return { ok:false, error:e?.message || String(e) };
    }
  };

  async function initCloud() {
    try {
      await loadSupabase();
      client = window.supabase.createClient(CUFFI_SB_URL, CUFFI_SB_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage }
      });

      const { data: { session } } = await client.auth.getSession();
      if (session) await startWithSession(session);

      client.auth.onAuthStateChange((_event, session) => {
        if (session) startWithSession(session);
        else {
          user = null;
          started = false;
          clearInterval(pullTimer);
        }
      });
    } catch (e) {
      console.error("Cuffi Supabase init:", e);
    }
  }

  // Mos prekim funksionet ekzistuese: dëgjojmë ndryshimet e storage-it.
  window.addEventListener("storage", e => {
    if (!e.key || ignored(e.key) || applying) return;
    if (e.newValue === null) deleteKey(e.key);
    else queuePush(e.key, e.newValue);
  });

  // Për ndryshimet që bëhen në të njëjtën faqe.
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function (k, v) {
    originalSetItem.call(this, k, v);
    if (this === localStorage) queuePush(String(k), String(v));
  };
  Storage.prototype.removeItem = function (k) {
    originalRemoveItem.call(this, k);
    if (this === localStorage) deleteKey(String(k));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCloud, { once: true });
  } else {
    initCloud();
  }
})();
