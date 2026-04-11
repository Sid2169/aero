import dayjs from 'dayjs';
import loadingAnimation from '../assets/loading-2.gif';
import getWeather, { getAutoCompleteResults } from './WeatherApi';
import { getSummaryForecast, getUnitKey, calculateAqi, airQualityLabel } from './Util';
import getAssets from './WeatherCode';
import weatherEmoji from './WeatherIcon';
import iconPack from './Icon';

let UNIT = 'c';

// ── Helpers ──────────────────────────────────────────────────────────────
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function getEmoji(condition, isDay) {
  const assets = getAssets({ condition, is_day: isDay ? 1 : 0 });
  // Map the text key back to an emoji key
  const map = {
    'Sunny': 'clear', 'Clear': 'clear',
    'Partly Cloudy': 'partlyCloudy',
    'Overcast': 'cloudy', 'Cloudy': 'cloudy',
  };
  const key = map[assets.text] || 'clear';
  return weatherEmoji[key]?.[isDay ? 'day' : 'night'] || '🌤';
}

// ── Static shell builders ─────────────────────────────────────────────────
function buildHeader(location) {
  const header = el('div', 'flex items-center justify-between mb-9');

  const pill = el('div', 'location-pill');
  pill.innerHTML = `
    ${iconPack.location}
    <span id="loc-name" style="font-size:13px;font-weight:500;">${location?.name ?? '…'}</span>
    <span style="font-size:10px;color:var(--text-mid);margin-left:2px;">▾</span>`;

  const searchInput = el('input');
  searchInput.placeholder = 'Search city…';
  searchInput.style.cssText = 'display:none;position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.6);border:1px solid var(--accent);border-radius:999px;color:var(--text-bright);padding:0 16px;font-family:DM Sans,sans-serif;font-size:13px;outline:none;z-index:10;';

  const autocomplete = el('div', 'absolute top-12 left-0 w-full z-50 flex flex-col px-1 gap-1');

  const pillWrap = el('div', 'relative');
  pillWrap.appendChild(pill);
  pillWrap.appendChild(searchInput);
  pillWrap.appendChild(autocomplete);

  pill.addEventListener('click', () => {
    searchInput.style.display = 'block';
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') searchInput.style.display = 'none';
  });

  searchInput.addEventListener('input', () => {
    if (!searchInput.value) { autocomplete.innerHTML = ''; return; }
    getAutoCompleteResults(searchInput.value).then(results => {
      autocomplete.innerHTML = '';
      results.forEach(place => {
        const btn = el('button', '', `<strong style="font-size:13px;color:var(--text-bright);">${place.name}</strong><br><span style="font-size:11px;color:var(--text-mid);">${place.region}, ${place.country}</span>`);
        btn.style.cssText = 'text-align:left;background:rgba(0,0,0,0.7);border:0.5px solid var(--card-border);border-radius:12px;padding:10px 14px;color:inherit;cursor:pointer;';
        btn.addEventListener('click', () => {
          searchInput.style.display = 'none';
          autocomplete.innerHTML = '';
          const root = document.querySelector('#root');
          root.innerHTML = '';
          root.appendChild(buildLoading());
          fetchAndRender(place.name);
        });
        autocomplete.appendChild(btn);
      });
    });
  });

  const toggle = el('div', 'unit-toggle');
  const cBtn = el('button', `unit-btn${UNIT === 'c' ? ' active' : ''}`, '°C');
  const fBtn = el('button', `unit-btn${UNIT === 'f' ? ' active' : ''}`, '°F');
  cBtn.addEventListener('click', () => switchUnit('c', cBtn, fBtn));
  fBtn.addEventListener('click', () => switchUnit('f', fBtn, cBtn));
  toggle.append(cBtn, fBtn);
  header.append(pillWrap, toggle);
  return header;
}

function switchUnit(unit, activeBtn, inactiveBtn) {
  if (UNIT === unit) return;
  UNIT = unit;
  activeBtn.classList.add('active');
  inactiveBtn.classList.remove('active');
  const root = document.querySelector('#root');
  root.innerHTML = '';
  root.appendChild(buildLoading());
  fetchAndRender(document.querySelector('#root').dataset.loc);
}

function buildHero() {
  const hero = el('div', 'text-center py-5 mb-2');
  hero.innerHTML = `
    <div style="width:90px;height:90px;margin:0 auto 20px;position:relative;">
      <div class="icon-glow"></div>
      <div id="hero-icon" style="width:90px;height:90px;display:flex;align-items:center;justify-content:center;font-size:72px;line-height:1;"></div>
    </div>
    <div id="main-temp" style="font-size:88px;line-height:1;font-weight:300;letter-spacing:-4px;color:var(--text-bright);"></div>
    <div id="condition-text" style="font-size:18px;font-weight:400;color:var(--text-mid);margin-top:10px;"></div>
    <div style="display:inline-flex;gap:20px;margin-top:14px;font-size:13px;color:var(--text-mid);font-family:'DM Mono',monospace;">
      H <span id="temp-hi" style="color:var(--text-bright);font-weight:500;"></span>
      &nbsp;&nbsp;L <span id="temp-lo" style="color:var(--text-bright);font-weight:500;"></span>
    </div>
    <div id="date-line" style="font-size:11px;color:var(--text-dim);margin-top:8px;letter-spacing:.5px;text-transform:uppercase;font-family:'DM Mono',monospace;"></div>`;
  return hero;
}

function buildHourlyStrip() {
  const wrap = el('div');
  wrap.appendChild(el('div', 'section-label', 'Hourly forecast'));
  const strip = el('div', 'hourly-scroll');
  strip.id = 'hourly-strip';
  wrap.appendChild(strip);
  return wrap;
}

function buildStatGrid() {
  const grid = el('div', 'grid grid-cols-3 gap-2.5 mb-3');
  grid.id = 'stat-grid';
  return grid;
}

function buildUVCard() {
  const card = el('div', 'glass-card');
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
      <span style="font-size:16px;">☀️</span>
      <span class="section-label" style="margin:0;">UV Index</span>
    </div>
    <div style="font-size:32px;font-weight:300;color:var(--text-bright);margin-bottom:10px;">
      <span id="uv-val">—</span>
      <span id="uv-label" style="font-size:16px;color:var(--text-mid);font-weight:400;margin-left:6px;"></span>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <span style="font-size:11px;color:var(--text-mid);">Low</span>
      <div style="flex:1;height:4px;border-radius:2px;position:relative;background:linear-gradient(to right,#4ade80,#facc15,#fb923c,#ef4444,#a855f7);">
        <div id="uv-dot" style="position:absolute;width:10px;height:10px;border-radius:50%;background:#fff;top:-3px;border:2px solid #1a3450;transform:translateX(-50%);left:10%;"></div>
      </div>
      <span style="font-size:11px;color:var(--text-mid);">High</span>
    </div>`;
  return card;
}

function buildSunTimes() {
  const row = el('div', 'flex gap-2.5 mb-3');
  row.innerHTML = `
    <div class="glass-card flex-1" style="margin-bottom:0;">
      <div class="section-label">🌅 Sunrise</div>
      <div id="sunrise-time" style="font-size:22px;font-weight:500;color:var(--text-bright);font-family:'DM Mono',monospace;">—</div>
    </div>
    <div class="glass-card flex-1" style="margin-bottom:0;">
      <div class="section-label">🌇 Sunset</div>
      <div id="sunset-time" style="font-size:22px;font-weight:500;color:var(--text-bright);font-family:'DM Mono',monospace;">—</div>
    </div>`;
  return row;
}

function buildAQICard() {
  const card = el('div', 'glass-card');
  card.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
      <div>
        <div class="section-label" style="margin-bottom:4px;">Air quality</div>
        <div id="aqi-number" style="font-size:42px;font-weight:300;color:var(--text-bright);line-height:1;">—</div>
      </div>
      <div id="aqi-badge" style="font-size:11px;font-weight:500;padding:4px 10px;border-radius:999px;margin-top:4px;"></div>
    </div>
    <div style="position:relative;height:6px;border-radius:3px;overflow:visible;background:linear-gradient(to right,#4ade80 0%,#a3e635 20%,#facc15 40%,#fb923c 60%,#ef4444 80%,#7c3aed 100%);">
      <div id="aqi-pointer" style="position:absolute;top:-5px;transform:translateX(-50%);width:16px;height:16px;border-radius:50%;background:#fff;border:2.5px solid var(--sky-dark);left:5%;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:6px;">
      ${['0','100','200','300','400','500'].map(n=>`<span style="font-size:10px;color:var(--text-dim);">${n}</span>`).join('')}
    </div>
    <div id="aqi-desc" style="font-size:12px;color:var(--text-mid);margin-top:12px;line-height:1.6;"></div>`;
  return card;
}

function buildForecastCard() {
  const card = el('div', 'glass-card');
  card.innerHTML = `<div class="section-label">7-day forecast</div><div id="forecast-list" style="margin-top:16px;"></div>`;
  return card;
}

function buildLoading() {
  const wrap = el('div', 'flex items-center justify-center', '');
  wrap.style.height = '100vh';
  const img = el('img');
  img.src = loadingAnimation;
  img.style.width = '200px';
  wrap.appendChild(img);
  return wrap;
}

// ── Data refresh ──────────────────────────────────────────────────────────
function refreshData(data) {
  const { current, forecast, location } = data;
  const isDay = current.is_day;
  const assets = getAssets(current);
  const summary = getSummaryForecast(data);
  const sym = UNIT === 'c' ? 'C' : 'F';

  // Location name
  const locEl = document.getElementById('loc-name');
  if (locEl) locEl.textContent = `${location.name}, ${location.country}`;

  // Hero icon (emoji for simplicity; swap for SVG if preferred)
  const heroIcon = document.getElementById('hero-icon');
  if (heroIcon) heroIcon.textContent = getEmoji(current.condition, isDay);

  // Temperature
  const tempEl = document.getElementById('main-temp');
  if (tempEl) tempEl.innerHTML = `${Math.round(current[getUnitKey('temp', UNIT)])}<sup style="font-size:36px;font-weight:400;vertical-align:super;letter-spacing:0;margin-left:4px;">°${sym}</sup>`;

  document.getElementById('condition-text').textContent = assets.text;
  document.getElementById('temp-hi').textContent = `${Math.round(summary[getUnitKey('maxtemp', UNIT)])}°`;
  document.getElementById('temp-lo').textContent = `${Math.round(summary[getUnitKey('mintemp', UNIT)])}°`;
  document.getElementById('date-line').textContent =
    `${dayjs(location.localtime).format('dddd · MMM D · h:mm A')}`;

  // Hourly strip
  const strip = document.getElementById('hourly-strip');
  if (strip) {
    strip.innerHTML = '';
    forecast.forecastday[0].hour.forEach(hour => {
      const isNow = dayjs(hour.time).format('H') === dayjs(location.localtime).format('H');
      const card = el('div', `hour-card${isNow ? ' now' : ''}`);
      card.innerHTML = `
        <div style="font-size:11px;color:${isNow ? 'var(--accent)' : 'var(--text-dim)'};margin-bottom:8px;font-family:'DM Mono',monospace;">${isNow ? 'Now' : dayjs(hour.time).format('hA')}</div>
        <div style="font-size:20px;margin-bottom:8px;">${getEmoji(hour.condition, hour.is_day)}</div>
        <div style="font-size:13px;font-weight:500;color:var(--text-bright);">${Math.round(hour[getUnitKey('temp', UNIT)])}°</div>`;
      strip.appendChild(card);
    });
    strip.scrollLeft = 65 * parseInt(dayjs(location.localtime).format('H'), 10);
  }

  // Stat grid
  const statGrid = document.getElementById('stat-grid');
  if (statGrid) {
    const stats = [
      { icon: '💧', val: `${Math.round(current.humidity)}%`,            label: 'Humidity' },
      { icon: '💨', val: `${Math.round(current.wind_kph)} km/h`,        label: 'Wind' },
      { icon: '👁',  val: `${Math.round(current.vis_km)} km`,           label: 'Visibility' },
      { icon: '🌡',  val: `${Math.round(current[getUnitKey('feelslike', UNIT)])}°`, label: 'Feels like' },
      { icon: '🌧',  val: `${forecast.forecastday[0].day.daily_chance_of_rain}%`, label: 'Precip.' },
      { icon: '⏱',  val: `${current.pressure_in} in`,                  label: 'Pressure' },
    ];
    statGrid.innerHTML = stats.map(s => `
      <div class="stat-card">
        <div style="font-size:22px;line-height:1;">${s.icon}</div>
        <div style="font-size:20px;font-weight:600;color:var(--text-bright);line-height:1;">${s.val}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:-4px;">${s.label}</div>
      </div>`).join('');
  }

  // UV
  const uv = current.uv;
  const uvLabels = ['Low','Low','Moderate','Moderate','Moderate','High','High','Very High','Very High','Extreme','Extreme','Extreme'];
  document.getElementById('uv-val').textContent = uv;
  document.getElementById('uv-label').textContent = uvLabels[Math.min(uv, 11)] ?? 'Extreme';
  document.getElementById('uv-dot').style.left = `${Math.min((uv / 11) * 100, 96)}%`;

  // Sun times
  document.getElementById('sunrise-time').textContent =
    forecast.forecastday[0].astro.sunrise.replace(/^0/, '');
  document.getElementById('sunset-time').textContent =
    forecast.forecastday[0].astro.sunset.replace(/^0/, '');

  // AQI
  const aqi = calculateAqi(current.air_quality);
  const aqiInfo = airQualityLabel(aqi);
  document.getElementById('aqi-number').textContent = aqi;
  document.getElementById('aqi-pointer').style.left = `${Math.min((aqi / 500) * 100, 96)}%`;
  document.getElementById('aqi-desc').textContent = aqiInfo.description;
  const badge = document.getElementById('aqi-badge');
  badge.textContent = aqiInfo.label;
  const aqiColors = {
    Good:      { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
    Satisfactory: { bg: 'rgba(163,230,53,0.15)', color: '#a3e635', border: 'rgba(163,230,53,0.3)' },
    Moderate:  { bg: 'rgba(250,204,21,0.15)', color: '#facc15', border: 'rgba(250,204,21,0.3)' },
    Poor:      { bg: 'rgba(251,146,60,0.15)', color: '#fb923c', border: 'rgba(251,146,60,0.3)' },
    'Very Poor': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    Severe:    { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  };
  const c = aqiColors[aqiInfo.label] || aqiColors.Good;
  badge.style.cssText = `font-size:11px;font-weight:500;padding:4px 10px;border-radius:999px;background:${c.bg};color:${c.color};border:0.5px solid ${c.border};`;

  // 7-day forecast
  const list = document.getElementById('forecast-list');
  if (list) {
    const allTemps = forecast.forecastday.flatMap(d => [
      d.day[getUnitKey('mintemp', UNIT)],
      d.day[getUnitKey('maxtemp', UNIT)],
    ]);
    const minT = Math.min(...allTemps);
    const maxT = Math.max(...allTemps);
    const range = maxT - minT || 1;

    list.innerHTML = forecast.forecastday.map((day, i) => {
      const lo = Math.round(day.day[getUnitKey('mintemp', UNIT)]);
      const hi = Math.round(day.day[getUnitKey('maxtemp', UNIT)]);
      const loPct = ((lo - minT) / range * 70).toFixed(1);
      const hiPct = ((hi - minT) / range * 70 + 5).toFixed(1);
      const dayLabel = i === 0 ? 'Today' : dayjs(day.date).format('ddd');
      const emoji = getEmoji(day.day.condition, isDay);
      return `
        <div class="forecast-row">
          <div style="font-size:13px;font-weight:500;color:var(--text-bright);">${dayLabel}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">${emoji}</span>
            <div class="temp-range-bar" style="flex:1;min-width:60px;">
              <div class="temp-range-fill" style="left:${loPct}%;right:${(100 - parseFloat(hiPct)).toFixed(1)}%;"></div>
            </div>
          </div>
          <div style="font-size:13px;color:var(--text-mid);font-family:'DM Mono',monospace;">${lo}°</div>
          <div style="font-size:13px;font-weight:500;color:var(--text-bright);font-family:'DM Mono',monospace;">${hi}°</div>
        </div>`;
    }).join('');
  }
}

// ── Main fetch + render orchestrator ─────────────────────────────────────
function fetchAndRender(location) {
  getWeather(location).then(data => {
    const root = document.querySelector('#root');
    root.innerHTML = '';
    root.dataset.loc = `${data.location.lat},${data.location.lon}`;

    root.appendChild(buildHeader(data.location));
    root.appendChild(buildHero());
    root.appendChild(buildHourlyStrip());
    root.appendChild(buildStatGrid());
    root.appendChild(buildUVCard());
    root.appendChild(buildSunTimes());
    root.appendChild(buildAQICard());
    root.appendChild(buildForecastCard());

    refreshData(data);
  });
}

export default function Render(location) {
  const root = document.querySelector('#root');
  root.innerHTML = '';
  root.appendChild(buildLoading());
  fetchAndRender(location);
}