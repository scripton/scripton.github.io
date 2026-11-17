/* daniel.fyi · version 3 · Neural theme */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var hasThree = typeof THREE !== 'undefined';

  /* ---------- Particle field ---------- */
  var setHudShape = function () {};
  if (hasThree) {
    var small = window.innerWidth < 800;
    var N = small ? 5000 : 9000;
    document.getElementById('hudNodes').textContent = N.toLocaleString('en-US');

    var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 7;

    var shape = function (fn) { var a = new Float32Array(N * 3); for (var i = 0; i < N; i++) a.set(fn(i), i * 3); return a; };
    var side = Math.ceil(Math.sqrt(N));
    var shapes = [
      // sphere (fibonacci)
      shape(function (i) { var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = i * 2.399963; return [Math.cos(t) * r * 2.6, y * 2.6, Math.sin(t) * r * 2.6]; }),
      // cortex
      shape(function () { var u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI, k = 1 + 0.18 * Math.sin(u * 6) * Math.sin(v * 5); return [Math.cos(u) * Math.sin(v) * 2.9 * k, Math.cos(v) * 1.9 * k, Math.sin(u) * Math.sin(v) * 2.2 * k]; }),
      // double helix
      shape(function (i) { var s = i % 2, t = (i / N) * Math.PI * 10, j = (Math.random() - 0.5) * 0.25; return [Math.cos(t + s * Math.PI) * 1.3 + j, (i / N - 0.5) * 9, Math.sin(t + s * Math.PI) * 1.3 + j]; }),
      // lattice wave
      shape(function (i) { var x = (i % side) / side - 0.5, z = Math.floor(i / side) / side - 0.5; return [x * 11, Math.sin(x * 9) * 0.5 + Math.cos(z * 8) * 0.5 - 1, z * 11]; }),
      // burst
      shape(function () { var u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1), r = 1.2 + Math.pow(Math.random(), 3) * 5; return [Math.cos(u) * Math.sin(v) * r, Math.cos(v) * r, Math.sin(u) * Math.sin(v) * r]; })
    ];
    var names = ['SPHERE', 'CORTEX', 'HELIX', 'LATTICE', 'SIGNAL'];

    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(N * 3); pos.set(shapes[0]);
    var col = new Float32Array(N * 3);
    var cA = new THREE.Color('#4da3ff'), cB = new THREE.Color('#2dd4bf'), cC = new THREE.Color('#7c8cff');
    for (var i = 0; i < N; i++) {
      var t = Math.random();
      var c = t < 0.5 ? cA.clone().lerp(cC, t * 2) : cC.clone().lerp(cB, (t - 0.5) * 2);
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    var dot = document.createElement('canvas'); dot.width = dot.height = 64;
    var g = dot.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);

    var mat = new THREE.PointsMaterial({ size: 0.06, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true, opacity: small ? 0.5 : 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    var group = new THREE.Group(); group.add(new THREE.Points(geo, mat)); scene.add(group);

    var resize = function () {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      group.position.x = w > 800 ? 1.6 : 0; group.scale.setScalar(w > 800 ? 1 : 0.62);
    };
    window.addEventListener('resize', resize); resize();

    var mx = 0, my = 0, tx = 0, ty = 0, prog = 0, smooth = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; });
    var onScroll = function () { var m = document.documentElement.scrollHeight - window.innerHeight; prog = m > 0 ? window.scrollY / m : 0; };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    var ease = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    var hudShape = document.getElementById('hudShape'), hudSig = document.getElementById('hudSig');
    var clock = new THREE.Clock(), lastName = '';

    var frame = function () {
      var t = clock.getElapsedTime();
      smooth += (prog - smooth) * (reduce ? 1 : 0.06);
      var s = smooth * (shapes.length - 1), k = Math.min(Math.floor(s), shapes.length - 2), f = ease(Math.min(Math.max(s - k, 0), 1));
      var A = shapes[k], B = shapes[k + 1], wob = reduce ? 0 : 0.035;
      for (var n = 0; n < N; n++) {
        var o = n * 3, w = Math.sin(t * 1.2 + n * 0.013) * wob;
        pos[o] = A[o] + (B[o] - A[o]) * f + w;
        pos[o + 1] = A[o + 1] + (B[o + 1] - A[o + 1]) * f + w;
        pos[o + 2] = A[o + 2] + (B[o + 2] - A[o + 2]) * f;
      }
      geo.attributes.position.needsUpdate = true;
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      group.rotation.y = (reduce ? 0 : t * 0.08) + mx * 0.8;
      group.rotation.x = my * 0.5 + (reduce ? 0 : Math.sin(t * 0.2) * 0.1);
      renderer.render(scene, camera);
      var nm = names[Math.round(s)]; if (nm !== lastName) { hudShape.textContent = nm; lastName = nm; }
      hudSig.textContent = (Math.abs(Math.sin(t)) * 0.99).toFixed(2);
      requestAnimationFrame(frame);
    };
    frame();
  }

  /* ---------- Hero letters ---------- */
  var rows = document.querySelectorAll('h1 .row');
  Array.prototype.forEach.call(rows, function (r) {
    r.innerHTML = r.textContent.split('').map(function (ch) { return '<span class="ch">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>'; }).join('');
  });
  var grad = ['#4da3ff', '#7c8cff', '#2dd4bf'];
  var last = document.querySelectorAll('h1 .row:last-child .ch');
  if (hasThree && last.length > 1) {
    var c1 = new THREE.Color(grad[0]), c2 = new THREE.Color(grad[1]), c3 = new THREE.Color(grad[2]);
    Array.prototype.forEach.call(last, function (el, idx) {
      var p = idx / (last.length - 1);
      el.style.color = '#' + (p < 0.5 ? c1.clone().lerp(c2, p * 2) : c2.clone().lerp(c3, (p - 0.5) * 2)).getHexString();
    });
  }

  /* ---------- Typed role ---------- */
  var typed = document.getElementById('typed');
  var words = ['AI into everything we do.', 'MCP servers for real product knowledge.', 'teams that solve hard problems.', 'automation into repetitive work.'];
  if (typed && !reduce) {
    var wi = 0, ci = words[0].length, del = false;
    var type = function () {
      var w = words[wi]; typed.textContent = w.slice(0, ci);
      if (!del && ci < w.length) { ci++; setTimeout(type, 45); }
      else if (!del) { del = true; setTimeout(type, 1800); }
      else if (ci > 0) { ci--; setTimeout(type, 22); }
      else { del = false; wi = (wi + 1) % words.length; setTimeout(type, 300); }
    };
    setTimeout(type, 2400);
  }

  /* ---------- Capability spotlight ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.cap'), function (cap) {
    cap.addEventListener('pointermove', function (e) {
      var r = cap.getBoundingClientRect();
      cap.style.setProperty('--x', e.clientX - r.left + 'px');
      cap.style.setProperty('--y', e.clientY - r.top + 'px');
    });
  });

  /* ---------- Animations ---------- */
  var showAll = function () {
    document.documentElement.classList.remove('js');
    Array.prototype.forEach.call(document.querySelectorAll('.node'), function (n) { n.classList.add('on'); });
  };
  if (!hasGsap || reduce) { showAll(); return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.to('h1 .ch', { y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035, delay: 0.2 });
  gsap.from('.hero .eyebrow, .role, .meta, .scroll-cue', { opacity: 0, y: 20, duration: 1, delay: 0.9, stagger: 0.15 });

  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', onEnter: function () { el.classList.add('on'); } }
    });
  });

  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count'), suffix = el.getAttribute('data-suffix') || '';
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        var o = { v: 0 };
        gsap.to(o, { v: to, duration: 2, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
      }
    });
  });
})();
