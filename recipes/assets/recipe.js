/* ============================================================
   Rishit's Kitchen — recipe detail page
   Reads ?r=<slug>, fetches that one recipe, renders it.
   One template serves every recipe (works on static GitHub Pages).
   ============================================================ */

/* ---------- theme toggle ---------- */
(function themeToggle() {
  var btn = document.getElementById('theme-btn');
  btn.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('recipe-theme', next);
  });
})();

/* ---------- helpers ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function titleCase(s) {
  return s.replace(/(^|[\s-])\w/g, function (m) { return m.toUpperCase(); }).replace(/-/g, ' ');
}
function hueFor(slug) {
  var h = 0, s = String(slug || '');
  for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) % 360; }
  return h;
}
function starsHTML(val) {
  var pct = Math.max(0, Math.min(100, (val / 5) * 100));
  return '<span class="stars stars--ink" title="' + val + ' / 5">' +
    '<span class="stars__bg">★★★★★</span>' +
    '<span class="stars__fill" style="width:' + pct + '%">★★★★★</span></span>';
}
function pips(val) {
  var out = '';
  for (var i = 1; i <= 5; i++) out += '<span class="pip' + (i <= val ? ' on' : '') + '"></span>';
  return '<span class="pips">' + out + '</span>';
}
var DIFFICULTY = { 1: 'Very easy', 2: 'Easy', 3: 'Moderate', 4: 'Involved', 5: 'Hard' };
var AVAILABILITY = { 5: 'Everyday staples', 4: 'Common', 3: 'Some hunting', 2: 'Specialty items', 1: 'Hard to find' };

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

var root = document.getElementById('detail');

(async function load() {
  var slug = (qs('r') || '').replace(/[^a-z0-9-]/gi, '');
  if (!slug) return notFound();
  try {
    var r = await fetch('data/' + slug + '/' + slug + '.json', { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error('404');
      return res.json();
    });
    render(r, slug);
  } catch (e) {
    notFound();
  }
})();

function notFound() {
  document.title = 'Not found — Rishit\'s Kitchen';
  root.innerHTML =
    '<div class="notfound"><div class="empty__mark">🍽️</div>' +
    '<h1>Recipe not found</h1>' +
    '<p>That recipe isn\'t on the menu — it may have been renamed or removed.</p>' +
    '<a class="btn" href="index.html">← Browse all recipes</a></div>';
}

function macroRow(label, perServing, whole, unit, hl) {
  var f = function (v) { return v == null ? '—' : v + (unit || ''); };
  return '<tr' + (hl ? ' class="hl"' : '') + '><th scope="row">' + label + '</th>' +
    '<td>' + f(perServing) + '</td><td>' + f(whole) + '</td></tr>';
}

function render(r, slug) {
  document.title = r.title + ' — Rishit\'s Kitchen';

  var ps = r.macros.perServing, wh = r.macros.whole;
  var hasFibre = (ps.fibre != null) || (wh.fibre != null);

  var media = r.image
    ? '<img src="data/' + esc(slug) + '/' + esc(r.image) + '" alt="' + esc(r.title) + '" onerror="this.closest(\'.r-hero__media\').classList.add(\'no-img\');this.remove()">'
    : '';

  var kicker = [r.cuisine, r.course].filter(Boolean)
    .map(function (x) { return esc(x); }).join('<span class="dot"></span>');

  var metaCells = [
    ['Serves', esc(r.servings) + (r.servingsNote ? '<small>' + esc(r.servingsNote) + '</small>' : '')],
    ['Prep', esc(r.time.prep) + ' min'],
    ['Cook', esc(r.time.cook) + ' min'],
    ['Total', '~' + esc(r.time.total) + ' min']
  ].map(function (c) {
    return '<div class="r-meta__cell"><div class="k">' + c[0] + '</div><div class="v">' + c[1] + '</div></div>';
  }).join('');

  var ratesHTML =
    '<div class="rate-card"><div class="k">My rating</div>' + starsHTML(r.ratings.overall) +
      '<span class="lab">' + r.ratings.overall + ' / 5</span></div>' +
    '<div class="rate-card"><div class="k">Difficulty</div>' + pips(r.ratings.difficulty) +
      '<span class="lab">' + (DIFFICULTY[r.ratings.difficulty] || '') + '</span></div>' +
    '<div class="rate-card"><div class="k">Ingredient availability</div>' + pips(r.ratings.availability) +
      '<span class="lab">' + (AVAILABILITY[r.ratings.availability] || '') + '</span></div>';

  var macrosHTML =
    '<table class="macros"><thead><tr><th>Per</th><th>Serving</th><th>Whole recipe</th></tr></thead><tbody>' +
      macroRow('Calories', ps.calories, wh.calories, ' kcal', true) +
      macroRow('Protein', ps.protein, wh.protein, ' g') +
      macroRow('Carbs', ps.carbs, wh.carbs, ' g') +
      macroRow('Fat', ps.fat, wh.fat, ' g') +
      (hasFibre ? macroRow('Fibre', ps.fibre, wh.fibre, ' g') : '') +
    '</tbody></table>' +
    ((r.macroNotes && r.macroNotes.length)
      ? '<div class="macro-notes">' + r.macroNotes.map(function (n) { return '<p class="macro-note">' + esc(n) + '</p>'; }).join('') + '</div>'
      : '');

  var ingHTML = (r.ingredients || []).map(function (g) {
    return '<div class="ing-group"><h4>' + esc(g.group) + '</h4><ul>' +
      g.items.map(function (it) { return '<li>' + esc(it) + '</li>'; }).join('') + '</ul></div>';
  }).join('');

  // steps with per-recipe "cooked" memory
  var doneKey = 'recipe-steps-' + slug;
  var done = {};
  try { (JSON.parse(localStorage.getItem(doneKey)) || []).forEach(function (i) { done[i] = true; }); } catch (e) {}
  var stepsHTML = (r.steps || []).map(function (st, i) {
    return '<div class="step' + (done[i] ? ' done' : '') + '" data-i="' + i + '" role="button" tabindex="0">' +
      '<div class="step__num">' + (i + 1) + '</div>' +
      '<div class="step__body"><h5>' + esc(st.title) + '</h5><p>' + esc(st.body) + '</p></div></div>';
  }).join('');

  var notesHTML = (r.notes && r.notes.length)
    ? '<section class="r-sec"><h2 class="r-sec__title">Notes</h2><div class="r-notes">' +
        r.notes.map(function (n) { return '<div class="r-note">' + esc(n) + '</div>'; }).join('') + '</div></section>'
    : '';

  root.innerHTML =
    '<a class="backlink" href="index.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> All recipes</a>' +

    '<div class="r-hero"><div class="r-hero__media" style="--tile-h:' + hueFor(slug) + '">' +
      '<div class="card__fallback"><span>' + esc(r.emoji || '🍲') + '</span></div>' + media +
    '</div></div>' +

    '<header class="r-head">' +
      '<div class="r-head__kicker">' + kicker + '</div>' +
      '<h1>' + esc(r.title) + '</h1>' +
      (r.tagline ? '<p class="r-head__tag">' + esc(r.tagline) + '</p>' : '') +
      '<p class="r-head__chef">Original chef — <b>' + esc(r.chef) + '</b></p>' +
    '</header>' +

    '<div class="r-meta">' + metaCells + '</div>' +
    '<div class="r-rates">' + ratesHTML + '</div>' +

    '<section class="r-sec"><h2 class="r-sec__title">Macros</h2>' + macrosHTML + '</section>' +
    '<section class="r-sec"><h2 class="r-sec__title">Ingredients</h2><div class="ingredients">' + ingHTML + '</div></section>' +
    '<section class="r-sec"><h2 class="r-sec__title">Method</h2><div class="steps">' + stepsHTML + '</div></section>' +
    notesHTML +
    (r.source ? '<p class="r-source">' + esc(r.source) + '</p>' : '');

  // wire step check-off
  var steps = root.querySelectorAll('.step');
  function toggle(el) {
    el.classList.toggle('done');
    var ids = [];
    steps.forEach(function (s) { if (s.classList.contains('done')) ids.push(+s.dataset.i); });
    try { localStorage.setItem(doneKey, JSON.stringify(ids)); } catch (e) {}
  }
  steps.forEach(function (el) {
    el.addEventListener('click', function () { toggle(el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(el); }
    });
  });
}
