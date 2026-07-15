/* ============================================================
   Rishit's Kitchen — browse page
   Fetches the manifest + each recipe, renders a filterable bento grid.
   ============================================================ */

/* ---------- theme toggle (own key: recipe-theme) ---------- */
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

// star markup with fractional fill (out of 5)
function starsHTML(val, inkClass) {
  var pct = Math.max(0, Math.min(100, (val / 5) * 100));
  return (
    '<span class="stars ' + (inkClass ? 'stars--ink' : '') + '" title="' + val + ' / 5">' +
      '<span class="stars__bg">★★★★★</span>' +
      '<span class="stars__fill" style="width:' + pct + '%">★★★★★</span>' +
    '</span>'
  );
}

function titleCase(s) {
  return s.replace(/(^|[\s-])\w/g, function (m) { return m.toUpperCase(); }).replace(/-/g, ' ');
}

// Stable hue (0..359) from a slug, so each photo-less card gets its own
// distinct fallback colour instead of a wall of identical terracotta tiles.
function hueFor(slug) {
  var h = 0, s = String(slug || '');
  for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) % 360; }
  return h;
}

/* ---------- state ---------- */
var RECIPES = [];
var state = {
  q: '',
  diet: '',
  cuisine: '',
  chef: '',
  course: '',
  tags: new Set(),
  protein: 0,
  calMax: 1200,
  carbMax: 150,
  fatMax: 80,
  minRating: 0,
  sort: 'rating'
};

var els = {
  grid: document.getElementById('grid'),
  status: document.getElementById('status'),
  sidebar: document.getElementById('sidebar'),
  search: document.getElementById('search'),
  dietSeg: document.getElementById('diet-seg'),
  cuisine: document.getElementById('cuisine'),
  chef: document.getElementById('chef'),
  course: document.getElementById('course'),
  sort: document.getElementById('sort'),
  tagChips: document.getElementById('tag-chips'),
  protein: document.getElementById('protein'),
  proteinVal: document.getElementById('protein-val'),
  calories: document.getElementById('calories'),
  caloriesVal: document.getElementById('calories-val'),
  carbs: document.getElementById('carbs'),
  carbsVal: document.getElementById('carbs-val'),
  fat: document.getElementById('fat'),
  fatVal: document.getElementById('fat-val'),
  rateStars: document.getElementById('rate-stars'),
  count: document.getElementById('count'),
  countWord: document.getElementById('count-word'),
  clear: document.getElementById('clear'),
  filterToggle: document.getElementById('filter-toggle'),
  drawerClose: document.getElementById('drawer-close'),
  drawerScrim: document.getElementById('drawer-scrim'),
  activeCount: document.getElementById('active-count')
};

/* ---------- load ---------- */
(async function load() {
  try {
    var manifest = await fetch('data/manifest.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('manifest');
      return r.json();
    });
    var results = await Promise.all(manifest.map(function (slug) {
      return fetch('data/' + slug + '/' + slug + '.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }));
    RECIPES = results.filter(Boolean);
    if (!RECIPES.length) throw new Error('empty');
    buildControls();
    render();
  } catch (e) {
    els.status.innerHTML = 'Could not load recipes. If you opened this file directly, serve it with a local server ' +
      '(<code>python3 -m http.server</code>) — the recipe data is fetched, which browsers block on <code>file://</code>.';
  }
})();

/* ---------- build filter controls from data ---------- */
function fillSelect(sel, values) {
  values.forEach(function (v) {
    var o = document.createElement('option');
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  });
}
function uniqSorted(key) {
  return Array.from(new Set(RECIPES.map(key).filter(Boolean))).sort();
}

function buildControls() {
  els.sidebar.hidden = false;

  // dropdowns from data
  fillSelect(els.cuisine, uniqSorted(function (r) { return r.cuisine; }));
  fillSelect(els.chef, uniqSorted(function (r) { return r.chef; }));
  fillSelect(els.course, uniqSorted(function (r) { return r.course; }));

  // diet segmented control
  Array.prototype.forEach.call(els.dietSeg.children, function (btn) {
    btn.addEventListener('click', function () {
      state.diet = btn.dataset.diet;
      Array.prototype.forEach.call(els.dietSeg.children, function (b) { b.classList.toggle('on', b === btn); });
      render();
    });
  });

  // tags (union of tags + flavor), most common first
  var freq = {};
  RECIPES.forEach(function (r) {
    (r.tags || []).concat(r.flavor || []).forEach(function (t) { freq[t] = (freq[t] || 0) + 1; });
  });
  Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a] || a.localeCompare(b); }).forEach(function (t) {
    var b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.dataset.tag = t;
    b.textContent = titleCase(t);
    b.addEventListener('click', function () {
      if (state.tags.has(t)) { state.tags.delete(t); b.setAttribute('aria-pressed', 'false'); }
      else { state.tags.add(t); b.setAttribute('aria-pressed', 'true'); }
      render();
    });
    els.tagChips.appendChild(b);
  });

  // min-rating stars
  for (var i = 1; i <= 5; i++) {
    (function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = '★';
      b.setAttribute('aria-label', n + ' stars and up');
      b.addEventListener('click', function () {
        state.minRating = (state.minRating === n) ? 0 : n; // click same value clears
        paintRateStars();
        render();
      });
      els.rateStars.appendChild(b);
    })(i);
  }

  // listeners
  els.search.addEventListener('input', function () { state.q = this.value.trim().toLowerCase(); render(); });
  els.cuisine.addEventListener('change', function () { state.cuisine = this.value; render(); });
  els.chef.addEventListener('change', function () { state.chef = this.value; render(); });
  els.course.addEventListener('change', function () { state.course = this.value; render(); });
  els.sort.addEventListener('change', function () { state.sort = this.value; render(); });
  els.protein.addEventListener('input', function () {
    state.protein = +this.value;
    els.proteinVal.textContent = state.protein ? state.protein + ' g' : '0 g';
    render();
  });
  els.calories.addEventListener('input', function () {
    state.calMax = +this.value;
    els.caloriesVal.textContent = state.calMax >= 1200 ? 'Any' : state.calMax + ' kcal';
    render();
  });
  els.carbs.addEventListener('input', function () {
    state.carbMax = +this.value;
    els.carbsVal.textContent = state.carbMax >= 150 ? 'Any' : state.carbMax + ' g';
    render();
  });
  els.fat.addEventListener('input', function () {
    state.fatMax = +this.value;
    els.fatVal.textContent = state.fatMax >= 80 ? 'Any' : state.fatMax + ' g';
    render();
  });
  els.clear.addEventListener('click', resetFilters);

  // mobile drawer
  function openDrawer() {
    els.sidebar.classList.add('open');
    els.drawerScrim.hidden = false;
    requestAnimationFrame(function () { els.drawerScrim.classList.add('show'); });
    els.filterToggle.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    els.sidebar.classList.remove('open');
    els.drawerScrim.classList.remove('show');
    setTimeout(function () { els.drawerScrim.hidden = true; }, 320);
    els.filterToggle.setAttribute('aria-expanded', 'false');
  }
  els.filterToggle.addEventListener('click', openDrawer);
  els.drawerClose.addEventListener('click', closeDrawer);
  els.drawerScrim.addEventListener('click', closeDrawer);
}

function paintRateStars() {
  Array.prototype.forEach.call(els.rateStars.children, function (b, idx) {
    b.classList.toggle('on', idx < state.minRating);
  });
}

function resetFilters() {
  state.q = ''; state.diet = ''; state.cuisine = ''; state.chef = ''; state.course = '';
  state.tags.clear();
  state.protein = 0; state.calMax = 1200; state.carbMax = 150; state.fatMax = 80; state.minRating = 0;
  els.search.value = '';
  els.cuisine.value = ''; els.chef.value = ''; els.course.value = '';
  els.protein.value = 0; els.proteinVal.textContent = '0 g';
  els.calories.value = 1200; els.caloriesVal.textContent = 'Any';
  els.carbs.value = 150; els.carbsVal.textContent = 'Any';
  els.fat.value = 80; els.fatVal.textContent = 'Any';
  Array.prototype.forEach.call(els.dietSeg.children, function (b) { b.classList.toggle('on', b.dataset.diet === ''); });
  Array.prototype.forEach.call(els.tagChips.querySelectorAll('.chip'), function (c) { c.setAttribute('aria-pressed', 'false'); });
  paintRateStars();
  render();
}

// count of active (non-default) filters, for the mobile toggle badge
function activeFilterCount() {
  var n = 0;
  if (state.q) n++;
  if (state.diet) n++;
  if (state.cuisine) n++;
  if (state.chef) n++;
  if (state.course) n++;
  n += state.tags.size;
  if (state.protein) n++;
  if (state.calMax < 1200) n++;
  if (state.carbMax < 150) n++;
  if (state.fatMax < 80) n++;
  if (state.minRating) n++;
  return n;
}

/* ---------- filtering + sorting ---------- */
function matches(r) {
  if (state.diet && r.diet !== state.diet) return false;
  if (state.cuisine && r.cuisine !== state.cuisine) return false;
  if (state.chef && r.chef !== state.chef) return false;
  if (state.course && r.course !== state.course) return false;
  var ps = r.macros.perServing;
  if (state.protein && (ps.protein || 0) < state.protein) return false;
  if (state.calMax < 1200 && (ps.calories || 0) > state.calMax) return false;
  if (state.carbMax < 150 && (ps.carbs || 0) > state.carbMax) return false;
  if (state.fatMax < 80 && (ps.fat || 0) > state.fatMax) return false;
  if (state.minRating && (r.ratings.overall || 0) < state.minRating) return false;
  if (state.tags.size) {
    var have = new Set((r.tags || []).concat(r.flavor || []));
    for (var t of state.tags) if (!have.has(t)) return false;
  }
  if (state.q) {
    var hay = [
      r.title, r.chef, r.cuisine, r.course,
      (r.tags || []).join(' '), (r.flavor || []).join(' '),
      (r.ingredients || []).map(function (g) { return g.items.join(' '); }).join(' ')
    ].join(' ').toLowerCase();
    if (hay.indexOf(state.q) === -1) return false;
  }
  return true;
}

function sortList(list) {
  var s = state.sort;
  var by = {
    rating: function (a, b) { return (b.ratings.overall || 0) - (a.ratings.overall || 0); },
    protein: function (a, b) { return (b.macros.perServing.protein || 0) - (a.macros.perServing.protein || 0); },
    calories: function (a, b) { return (a.macros.perServing.calories || 0) - (b.macros.perServing.calories || 0); },
    time: function (a, b) { return (a.time.total || 0) - (b.time.total || 0); },
    difficulty: function (a, b) { return (a.ratings.difficulty || 0) - (b.ratings.difficulty || 0); },
    az: function (a, b) { return a.title.localeCompare(b.title); }
  };
  return list.slice().sort(by[s] || by.rating);
}

/* ---------- render ---------- */
function render() {
  var list = sortList(RECIPES.filter(matches));
  var total = list.length;

  // count + active-filter indicator
  els.count.textContent = total;
  els.countWord.textContent = total === 1 ? 'recipe' : 'recipes';
  var active = activeFilterCount();
  els.clear.classList.toggle('show', active > 0);
  els.activeCount.textContent = active;
  els.activeCount.hidden = active === 0;

  if (!total) {
    els.grid.innerHTML =
      '<div class="empty"><div class="empty__mark">🍽️</div><h3>Nothing on the menu</h3>' +
      '<p>No recipes match those filters — try loosening them.</p></div>';
    return;
  }

  els.grid.innerHTML = list.map(function (r, i) {
    var href = 'recipe.html?r=' + encodeURIComponent(r.slug);
    var img = r.image
      ? '<div class="card__media"><img src="data/' + esc(r.slug) + '/' + esc(r.image) + '" alt="' + esc(r.title) + '" loading="lazy" onerror="this.closest(\'.card__media\').remove()"></div>'
      : '';
    var tags = (r.tags || []).slice(0, 3).map(function (t) {
      return '<span class="card__tag">' + esc(titleCase(t)) + '</span>';
    }).join('');

    return (
      '<a class="tile" href="' + href + '" style="--i:' + i + ';--tile-h:' + hueFor(r.slug) + '">' +
        '<article class="card">' +
          '<div class="card__fallback"><span>' + esc(r.emoji || '🍲') + '</span></div>' +
          img +
          '<div class="card__scrim"></div>' +
          '<div class="card__body">' +
            '<div class="card__top">' +
              '<span class="card__badges">' +
                (r.diet ? '<span class="veg-dot veg-dot--' + esc(r.diet) + '" title="' + (r.diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian') + '"></span>' : '') +
                '<span class="card__cuisine">' + esc(r.cuisine || '') + '</span>' +
              '</span>' +
              '<span class="card__time">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
                esc(r.time.total) + 'm</span>' +
            '</div>' +
            '<h3 class="card__title">' + esc(r.title) + '</h3>' +
            '<p class="card__tagline">' + esc(r.tagline || '') + '</p>' +
            '<div class="card__foot">' +
              '<div class="card__tags">' + tags + '</div>' +
              '<span class="card__rating">' + starsHTML(r.ratings.overall) + '<b>' + (r.ratings.overall).toFixed(1).replace(/\.0$/, '') + '</b></span>' +
            '</div>' +
          '</div>' +
        '</article>' +
      '</a>'
    );
  }).join('');
}
