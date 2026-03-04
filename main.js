/* ============================================================
   RISHIT CHUGH — PORTFOLIO
   Main script: WebGL shader bg, GSAP animations, scroll triggers
   ============================================================ */

(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(init, 50);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') {
      gsap.registerPlugin(ScrollToPlugin);
    }
    initShaderBg();
    initNavScroll();
    initHeroAnimation();
    initMorphingText();
    initLetterSwapPingPong();
    initSectionAnimations();
    initAcTimeline();
    initProjectDeck();
    initScrollTablet();
    initDottedSurface();
    initSmoothNav();
  }

  /* ========== CYBERNETIC GRID SHADER BACKGROUND ========== */
  function initShaderBg() {
    var container = document.getElementById('shader-bg');
    if (!container || typeof THREE === 'undefined') return;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var clock = new THREE.Clock();

    var vertexShader = 'void main() { gl_Position = vec4(position, 1.0); }';

    var fragmentShader = [
      'precision highp float;',
      'uniform vec2 iResolution;',
      'uniform float iTime;',
      'uniform vec2 iMouse;',
      '',
      'float random(vec2 st) {',
      '  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);',
      '}',
      '',
      'void main() {',
      '  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;',
      '  vec2 mouse = (iMouse - 0.5 * iResolution.xy) / iResolution.y;',
      '',
      '  float t = iTime * 0.2;',
      '  float mouseDist = length(uv - mouse);',
      '',
      '  // warp near mouse',
      '  float warp = sin(mouseDist * 20.0 - t * 4.0) * 0.1;',
      '  warp *= smoothstep(0.4, 0.0, mouseDist);',
      '  uv += warp;',
      '',
      '  // grid lines',
      '  vec2 gridUv = abs(fract(uv * 10.0) - 0.5);',
      '  float line = pow(1.0 - min(gridUv.x, gridUv.y), 50.0);',
      '',
      '  // orange grid pulsing',
      '  vec3 gridColor = vec3(0.976, 0.451, 0.0);',
      '  vec3 color = gridColor * line * (0.5 + sin(t * 2.0) * 0.2);',
      '',
      '  // warm energy pulses along grid',
      '  float energy = sin(uv.x * 20.0 + t * 5.0) * sin(uv.y * 20.0 + t * 3.0);',
      '  energy = smoothstep(0.8, 1.0, energy);',
      '  color += vec3(1.0, 0.65, 0.15) * energy * line;',
      '',
      '  // glow around mouse',
      '  float glow = smoothstep(0.12, 0.0, mouseDist);',
      '  color += vec3(1.0, 0.55, 0.05) * glow * 0.5;',
      '',
      '  // subtle noise',
      '  color += random(uv + t * 0.1) * 0.03;',
      '',
      '  // dim for background subtlety',
      '  gl_FragColor = vec4(color * 0.55, 1.0);',
      '}'
    ].join('\n');

    var uniforms = {
      iTime:       { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse:      { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) }
    };

    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms
    });

    var geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    function onResize() {
      var w = container.clientWidth;
      var h = container.clientHeight;
      renderer.setSize(w, h);
      // Must match gl_FragCoord which uses actual device pixels
      var dpr = renderer.getPixelRatio();
      uniforms.iResolution.value.set(w * dpr, h * dpr);
    }
    window.addEventListener('resize', onResize);
    onResize();

    window.addEventListener('mousemove', function (e) {
      var dpr = renderer.getPixelRatio();
      uniforms.iMouse.value.set(e.clientX * dpr, (container.clientHeight - e.clientY) * dpr);
    });

    // Touch support
    window.addEventListener('touchmove', function (e) {
      var dpr = renderer.getPixelRatio();
      uniforms.iMouse.value.set(
        e.touches[0].clientX * dpr,
        (container.clientHeight - e.touches[0].clientY) * dpr
      );
    }, { passive: true });

    renderer.setAnimationLoop(function () {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });
  }

  /* ========== NAV SCROLL BACKGROUND ========== */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    ScrollTrigger.create({
      start: 60,
      onUpdate: function (self) {
        nav.classList.toggle('scrolled', self.scroll() > 60);
      },
    });
  }

  /* ========== HERO ENTRANCE ANIMATION ========== */
  function initHeroAnimation() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-char-wrap', {
      y: 0,
      duration: 1,
      stagger: 0.04,
      delay: 0.3,
      onComplete: initLetterSwap,
    });

    tl.to('.hero-overline', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.5');

    tl.to('.hero-meta', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.4');

    tl.to('.scroll-indicator', {
      opacity: 1,
      duration: 0.6,
    }, '-=0.2');

    tl.from('.nav-link', {
      opacity: 0,
      y: -10,
      stagger: 0.1,
      duration: 0.5,
    }, '-=0.8');

    tl.from('.nav-logo', {
      opacity: 0,
      x: -10,
      duration: 0.5,
    }, '<');

    gsap.to('.scroll-indicator', {
      opacity: 0,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '15% top',
        scrub: true,
      },
    });
  }

  /* ========== TYPEWRITER TEXT ========== */
  function initMorphingText() {
    var words = ['Inferencing.', 'Thinking.', 'Training.', 'Evaluating.', 'Optimizing.', 'Building.'];
    var el = document.getElementById('typewriter-text');
    if (!el) return;

    var wordIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typeSpeed = 90;
    var deleteSpeed = 50;
    var pauseAfterWord = 1800;
    var pauseAfterDelete = 400;

    function tick() {
      var currentWord = words[wordIndex % words.length];

      if (!isDeleting) {
        charIndex++;
        el.textContent = currentWord.substring(0, charIndex);
        if (charIndex === currentWord.length) {
          isDeleting = true;
          setTimeout(tick, pauseAfterWord);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        el.textContent = currentWord.substring(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex++;
          setTimeout(tick, pauseAfterDelete);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    // Start after a short delay
    setTimeout(tick, 1000);
  }

  /* ========== LETTER SWAP ON NAME (applied after entrance) ========== */
  function initLetterSwap() {
    document.querySelectorAll('.hero-name-row[data-swap-label]').forEach(function (row) {
      var label = row.getAttribute('data-swap-label');
      if (!label) return;

      // Clear entrance char-wraps, rebuild with GSAP-friendly structure
      row.innerHTML = '';

      label.split('').forEach(function (ch) {
        var outer = document.createElement('span');
        outer.className = 'lsp-char';

        var primary = document.createElement('span');
        primary.className = 'lsp-primary';
        primary.textContent = ch;

        var secondary = document.createElement('span');
        secondary.className = 'lsp-secondary';
        secondary.textContent = ch;

        outer.appendChild(primary);
        outer.appendChild(secondary);
        row.appendChild(outer);
      });

      var primaries = row.querySelectorAll('.lsp-primary');
      var secondaries = row.querySelectorAll('.lsp-secondary');

      // Let GSAP own the initial transform state
      gsap.set(primaries, { yPercent: 0 });
      gsap.set(secondaries, { yPercent: -110 });

      var isAnimating = false;

      row.addEventListener('mouseenter', function () {
        if (isAnimating) return;
        isAnimating = true;
        gsap.to(primaries, {
          yPercent: 110,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
        });
        gsap.to(secondaries, {
          yPercent: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
          onComplete: function () { isAnimating = false; },
        });
      });

      row.addEventListener('mouseleave', function () {
        isAnimating = false;
        gsap.to(primaries, {
          yPercent: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
        });
        gsap.to(secondaries, {
          yPercent: -110,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
        });
      });
    });
  }

  /* ========== LETTER SWAP PING-PONG (role hover) ========== */
  function initLetterSwapPingPong() {
    document.querySelectorAll('.letter-swap-pingpong').forEach(function (el) {
      var label = el.getAttribute('data-label');
      if (!label) return;

      el.textContent = '';
      label.split('').forEach(function (ch) {
        var outer = document.createElement('span');
        outer.className = 'lsp-char';

        var primary = document.createElement('span');
        primary.className = 'lsp-primary';
        primary.textContent = ch === ' ' ? '\u00A0' : ch;

        var secondary = document.createElement('span');
        secondary.className = 'lsp-secondary';
        secondary.textContent = ch === ' ' ? '\u00A0' : ch;

        outer.appendChild(primary);
        outer.appendChild(secondary);
        el.appendChild(outer);
      });

      var primaries = el.querySelectorAll('.lsp-primary');
      var secondaries = el.querySelectorAll('.lsp-secondary');

      // Let GSAP own the initial transform state
      gsap.set(primaries, { yPercent: 0 });
      gsap.set(secondaries, { yPercent: -110 });

      el.addEventListener('mouseenter', function () {
        gsap.to(primaries, {
          yPercent: 110,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
        });
        gsap.to(secondaries, {
          yPercent: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
        });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(primaries, {
          yPercent: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
        });
        gsap.to(secondaries, {
          yPercent: -110,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'center' },
        });
      });
    });
  }

  /* ========== SECTION SCROLL ANIMATIONS ========== */
  function initSectionAnimations() {
    gsap.utils.toArray('.section-header').forEach(function (header) {
      var num = header.querySelector('.section-num');
      var title = header.querySelector('.section-title');
      var rule = header.querySelector('.section-rule');

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.from(num, { opacity: 0, x: -20, duration: 0.5 });
      tl.from(title, { opacity: 0, y: 30, duration: 0.6 }, '-=0.3');
      tl.from(rule, { scaleX: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');
    });

    gsap.utils.toArray('.ac-entry').forEach(function (entry) {
      gsap.from(entry.querySelector('.ac-entry-right'), {
        opacity: 0,
        y: 30,
        duration: 0.7,
        scrollTrigger: {
          trigger: entry,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    gsap.utils.toArray('.display-card').forEach(function (card, i) {
      gsap.from(card, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        delay: i * 0.12,
        scrollTrigger: {
          trigger: '.display-cards',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    var collabTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section--collab',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    collabTl.from('.collab-overline', { opacity: 0, y: 20, duration: 0.5 });
    collabTl.from('.collab-heading', { opacity: 0, y: 40, duration: 0.7 }, '-=0.2');
    collabTl.from('.collab-email', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3');
    collabTl.from('.collab-cta', { opacity: 0, y: 20, duration: 0.5 }, '-=0.2');
  }

  /* ========== ACETERNITY SCROLL TIMELINE ========== */
  function initAcTimeline() {
    var timeline = document.getElementById('ac-timeline');
    var fill = document.getElementById('ac-line-fill');
    var entries = gsap.utils.toArray('.ac-entry');
    if (!timeline || !fill) return;

    ScrollTrigger.create({
      trigger: timeline,
      start: 'top 10%',
      end: 'bottom 50%',
      scrub: 0.2,
      onUpdate: function (self) {
        fill.style.height = (self.progress * 100) + '%';
      },
    });

    entries.forEach(function (entry) {
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 55%',
        end: 'bottom 40%',
        onEnter: function () { entry.classList.add('is-active'); },
        onLeaveBack: function () { entry.classList.remove('is-active'); },
      });
    });
  }

  /* ========== EVERVAULT PROJECT DECK ========== */
  function initProjectDeck() {
    var deck = document.getElementById('project-deck');
    if (!deck) return;

    var cards = gsap.utils.toArray('.deck-card');
    var counterEl = deck.parentElement.querySelector('.deck-current');
    var totalCards = cards.length;
    var currentIndex = 0;
    var isDragging = false;
    var startX = 0;
    var currentX = 0;
    var dismissThreshold = 120;

    // Characters for the Evervault pattern
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:<>,.?/~`+-=_';

    // Generate random character fill for each card
    cards.forEach(function (card) {
      var pattern = card.querySelector('.card-pattern');
      if (!pattern) return;
      var text = '';
      for (var i = 0; i < 5000; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      pattern.textContent = text;
    });

    // Set initial stack positions
    function layoutStack() {
      cards.forEach(function (card, i) {
        var stackPos = (i - currentIndex + totalCards) % totalCards;
        card.setAttribute('data-stack', stackPos);
        // GSAP animate to position
        if (stackPos === 0) {
          gsap.to(card, {
            scale: 1,
            y: 0,
            opacity: 1,
            rotateZ: 0,
            x: 0,
            duration: 0.5,
            ease: 'power3.out',
            clearProps: 'filter',
          });
        } else if (stackPos === 1) {
          gsap.to(card, {
            scale: 0.94,
            y: 24,
            opacity: 0.6,
            rotateZ: 0,
            x: 0,
            duration: 0.5,
            ease: 'power3.out',
          });
        } else {
          gsap.to(card, {
            scale: 0.88,
            y: 48,
            opacity: 0.3,
            rotateZ: 0,
            x: 0,
            duration: 0.5,
            ease: 'power3.out',
          });
        }
      });
      if (counterEl) {
        counterEl.textContent = currentIndex + 1;
      }
    }

    layoutStack();

    // Mouse tracking for Evervault radial gradient
    deck.addEventListener('mousemove', function (e) {
      var frontCard = cards.find(function (c) {
        return c.getAttribute('data-stack') === '0';
      });
      if (!frontCard) return;
      var rect = frontCard.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      frontCard.style.setProperty('--mouse-x', x + 'px');
      frontCard.style.setProperty('--mouse-y', y + 'px');
    });

    // Drag to dismiss
    function onPointerDown(e) {
      var frontCard = cards.find(function (c) {
        return c.getAttribute('data-stack') === '0';
      });
      if (!frontCard || e.target.closest('.card-link')) return;
      isDragging = true;
      startX = e.clientX || e.touches[0].clientX;
      startY = e.clientY || e.touches[0].clientY;
      currentX = 0;
      frontCard.style.transition = 'none';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      var clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX === undefined) return;
      currentX = clientX - startX;
      var frontCard = cards.find(function (c) {
        return c.getAttribute('data-stack') === '0';
      });
      if (!frontCard) return;
      var rotation = currentX * 0.08;
      var opacity = 1 - Math.min(Math.abs(currentX) / 300, 0.4);
      gsap.set(frontCard, {
        x: currentX,
        rotateZ: rotation,
        opacity: opacity,
      });
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      var frontCard = cards.find(function (c) {
        return c.getAttribute('data-stack') === '0';
      });
      if (!frontCard) return;

      if (Math.abs(currentX) > dismissThreshold) {
        // Dismiss: fly out, then reposition to back
        var flyDir = currentX > 0 ? 1 : -1;
        gsap.to(frontCard, {
          x: flyDir * 600,
          rotateZ: flyDir * 25,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: function () {
            currentIndex = (currentIndex + 1) % totalCards;
            layoutStack();
          },
        });
      } else {
        // Snap back
        gsap.to(frontCard, {
          x: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    }

    deck.addEventListener('mousedown', onPointerDown);
    deck.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Navigation buttons
    var prevBtn = deck.parentElement.querySelector('.deck-btn--prev');
    var nextBtn = deck.parentElement.querySelector('.deck-btn--next');

    function goNext() {
      if (isDragging) return;
      var frontCard = cards.find(function (c) {
        return c.getAttribute('data-stack') === '0';
      });
      if (!frontCard) return;
      gsap.to(frontCard, {
        x: -600,
        rotateZ: -20,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: function () {
          currentIndex = (currentIndex + 1) % totalCards;
          layoutStack();
        },
      });
    }

    function goPrev() {
      if (isDragging) return;
      currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      var incomingCard = cards[currentIndex];
      gsap.set(incomingCard, { x: -600, rotateZ: -20, opacity: 0, scale: 1 });
      layoutStack();
      gsap.fromTo(incomingCard, {
        x: -600,
        rotateZ: -20,
        opacity: 0,
      }, {
        x: 0,
        rotateZ: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'power3.out',
      });
    }

    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (prevBtn) prevBtn.addEventListener('click', goPrev);

    // Keyboard nav
    document.addEventListener('keydown', function (e) {
      // Only respond if deck is in viewport
      var rect = deck.getBoundingClientRect();
      var inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    });

    // Scroll-triggered entrance
    gsap.from(deck, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      scrollTrigger: {
        trigger: deck,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ========== RESEARCH — CONTAINER SCROLL TABLET ========== */
  function initScrollTablet() {
    var container = document.getElementById('scroll-tablet');
    var card = document.getElementById('scroll-tablet-card');
    var header = document.getElementById('scroll-tablet-header');
    if (!container || !card || !header) return;

    var isMobile = window.innerWidth <= 768;

    // Set initial state: card starts rotated and slightly scaled up
    gsap.set(card, {
      rotationX: 20,
      scale: isMobile ? 0.75 : 1.05,
      transformPerspective: 1000,
      transformOrigin: 'center top',
    });

    // Scroll-driven: card rotates flat + scales to 1
    gsap.to(card, {
      rotationX: 0,
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'top 10%',
        scrub: 0.3,
      },
    });

    // Header slides up and behind the card
    gsap.to(header, {
      yPercent: -50,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top 60%',
        end: 'top 10%',
        scrub: 0.3,
      },
    });
  }

  /* ========== DOTTED SURFACE (bottom section bg) ========== */
  function initDottedSurface() {
    var container = document.getElementById('dotted-bg');
    if (!container || typeof THREE === 'undefined') return;

    var SEPARATION = 150;
    var AMOUNTX = 40;
    var AMOUNTY = 60;

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      10000
    );
    camera.position.set(0, 355, 1220);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Build particle grid
    var positions = [];
    var colors = [];

    for (var ix = 0; ix < AMOUNTX; ix++) {
      for (var iy = 0; iy < AMOUNTY; iy++) {
        var x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        var z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        positions.push(x, 0, z);
        // Orange dots matching accent color (249, 115, 0) normalized
        colors.push(0.976, 0.451, 0.0);
      }
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    var points = new THREE.Points(geometry, material);
    scene.add(points);

    var count = 0;

    function animate() {
      requestAnimationFrame(animate);

      var posArr = geometry.attributes.position.array;
      var i = 0;
      for (var ix = 0; ix < AMOUNTX; ix++) {
        for (var iy = 0; iy < AMOUNTY; iy++) {
          var idx = i * 3;
          posArr[idx + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.1;
    }

    function onResize() {
      var w = container.clientWidth;
      var h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);
    animate();
  }

  /* ========== SMOOTH NAV SCROLL ========== */
  function initSmoothNav() {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var target = document.querySelector(href);
          if (target) {
            if (typeof ScrollToPlugin !== 'undefined') {
              gsap.to(window, {
                scrollTo: { y: target, offsetY: 80 },
                duration: 1,
                ease: 'power2.inOut',
              });
            } else {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
