/* publish.js — The Jagwar Twin Field Guide
 *
 * Make clicking a NAV FOLDER open its "folder note": a page named the same as the
 * folder (clicking "Characters" opens Characters/Characters; "Albums & Eras" opens
 * Albums & Eras/Albums & Eras, etc.). Folders with no such page (Stars, Supporting
 * Cast, Source & Structure, Reading Paths, …) just expand/collapse as normal.
 *
 * Verified live on 2026-07-13 against publish.obsidian.md/jagwar-twin: notes carry a
 * ".md" suffix in data-path, folders do not; clicking the folder-note tree item
 * triggers Publish's own router (so "&" and spaces in names are handled correctly).
 *
 * NOTE: for this to run, custom JavaScript must be enabled in the Obsidian Publish
 * site settings, and this file must be published.
 */
(function () {
  "use strict";
  if (window.__jtFolderNav) return;
  window.__jtFolderNav = true;

  function openFolderNote(folderPath, attempt) {
    var name = folderPath.split("/").pop();
    var notePath = folderPath + "/" + name + ".md"; // "Characters" -> "Characters/Characters.md"
    var items = document.querySelectorAll(
      ".site-body-left-column .tree-item-self[data-path]"
    );
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute("data-path") === notePath) {
        items[i].click(); // let Publish's router do the navigation
        return;
      }
    }
    // The folder's children render asynchronously after it expands; retry briefly.
    if ((attempt || 0) < 6) {
      setTimeout(function () {
        openFolderNote(folderPath, (attempt || 0) + 1);
      }, 40);
    }
  }

  document.addEventListener(
    "click",
    function (evt) {
      var t = evt.target;
      if (!t || !t.closest) return;
      var folderSelf = t.closest(".tree-item-self.mod-collapsible");
      if (!folderSelf) return;
      var folderPath = folderSelf.getAttribute("data-path");
      if (!folderPath) return;
      setTimeout(function () {
        try {
          openFolderNote(folderPath, 0);
        } catch (e) {
          /* never break the nav */
        }
      }, 0);
    },
    true
  );
})();

/* Rooms Behind the Gallery — stand-alone page.
 *
 * That page is meant to open with no navigation in or out. CSS can't see the
 * route, and keying off an element inside the note proved unreliable, so this
 * stamps `jt-standalone` on <body> whenever that route is showing and strips
 * it everywhere else. Publish is a single-page app, so the check re-runs on
 * navigation as well as on load.
 *
 * To make another page stand alone, add its path (lowercase, no extension) to
 * PAGES and give it the same treatment in publish.css.
 */
(function () {
  "use strict";
  if (window.__jtStandalone) return;
  window.__jtStandalone = true;

  var PAGES = ["/rooms behind the gallery"];

  function currentPath() {
    var p = window.location.pathname || "";
    p = p.replace(/\+/g, " ");
    try {
      p = decodeURIComponent(p);
    } catch (e) {
      /* a malformed escape must never break the nav */
    }
    return p.toLowerCase().replace(/\.md$/, "").replace(/\/+$/, "");
  }

  function sync() {
    if (!document.body) return;
    var standalone = PAGES.indexOf(currentPath()) !== -1;
    document.body.classList.toggle("jt-standalone", standalone);
  }

  sync();
  window.addEventListener("popstate", sync);

  ["pushState", "replaceState"].forEach(function (name) {
    var original = history[name];
    if (typeof original !== "function") return;
    history[name] = function () {
      var result = original.apply(this, arguments);
      setTimeout(sync, 0);
      return result;
    };
  });

  // Publish can swap the rendered note without touching history; poll cheaply.
  setInterval(sync, 500);
})();

/* Complete Hall of Mirrors — card filter + image loading.
 *
 * The page carries every artifact in the maze on one very long note, so two
 * things are done to it here that a note cannot do for itself:
 *
 *   1. Images are switched to lazy loading. There are 200-odd of them, some
 *      several megabytes, and without this the page tries to fetch all of them
 *      at once.
 *   2. A filter bar is inserted above the cards. Rows carrying a `.jt-u`
 *      marker are the artifacts with no NFT generated yet.
 *
 * Both are confined to the stand-alone page, which the block above marks with
 * `jt-standalone` on <body>.
 */
(function () {
  "use strict";
  if (window.__jtCards) return;
  window.__jtCards = true;

  var FILTERS = [
    { id: "all", label: "All", match: function () { return true; } },
    { id: "unresolved", label: "No NFT yet",
      match: function (row) { return !!row.querySelector(".jt-u"); } }
  ];

  function lazyLoad(table) {
    var imgs = table.querySelectorAll("img:not([loading])");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].setAttribute("loading", "lazy");
      imgs[i].setAttribute("decoding", "async");
    }
  }

  function apply(table, id) {
    var f = FILTERS.filter(function (x) { return x.id === id; })[0] || FILTERS[0];
    var rows = table.querySelectorAll("tbody > tr");
    for (var i = 0; i < rows.length; i++) {
      rows[i].style.display = f.match(rows[i]) ? "" : "none";
    }
  }

  function build(table) {
    var bar = document.createElement("div");
    bar.className = "jt-filterbar";
    var rows = table.querySelectorAll("tbody > tr");
    FILTERS.forEach(function (f, n) {
      var count = 0;
      for (var i = 0; i < rows.length; i++) if (f.match(rows[i])) count++;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "jt-filterbtn" + (n === 0 ? " is-on" : "");
      b.textContent = f.label + " (" + count + ")";
      b.addEventListener("click", function () {
        var all = bar.querySelectorAll(".jt-filterbtn");
        for (var i = 0; i < all.length; i++) all[i].classList.remove("is-on");
        b.classList.add("is-on");
        apply(table, f.id);
      });
      bar.appendChild(b);
    });
    table.parentNode.insertBefore(bar, table);
  }

  function sync() {
    if (!document.body.classList.contains("jt-standalone")) return;
    var table = document.querySelector(".markdown-preview-view table");
    if (!table || !table.querySelector("tbody > tr")) return;
    lazyLoad(table);
    if (!table.__jtFiltered) {
      table.__jtFiltered = true;
      build(table);
    }
  }

  setInterval(sync, 600);
  document.addEventListener("DOMContentLoaded", sync);
  sync();
})();

/* >>> JT MOON START — generated by JagWeb/moon-graph/build_publish.py; edit the source there, not here */
/* The Jagwar Files — moon graph
 * A segmented star map of the public guide: the homepage at the centre, each
 * section a wedge of the moon, its hub on the inner ring, its pages fanning out.
 * Reads Obsidian Publish's own page index, so it stays current with every upload.
 *
 *   JagMoon.mount(container, { cache, currentPath, navigate, mode })
 *     cache       Publish cache object (path -> { links, frontmatter, ... })
 *     currentPath vault path of the page being viewed, e.g. "Characters/Stars/Roy.md"
 *     navigate    fn(path) called on open; falls back to location.href
 *     mode        "full" (default) or "mini"
 *
 * One palette on purpose: colour carries meaning in this world, so sections are
 * told apart by position and label, never by hue. The only accent is the carmine
 * ring on the page you are standing on.
 */
(function (global) {
  "use strict";

  var GOLD = "212,166,58", GOLD_BRIGHT = "236,200,97", CREAM = "242,227,198", CARMINE = "194,58,72";
  var R_MOON = 1000, R_IN = 265, R_OUT = 940, PHI = 0.6180339887498949, TAU = Math.PI * 2;

  // Section order clockwise from the top. `sub` splits a section into contiguous
  // sub-wedges (albums, character ranks) so related pages sit together.
  var SECTIONS = [
    { id: "start", label: "Start Here", hub: "Start Here/So You Found Jagwar Twin.md" },
    { id: "characters", label: "Characters", hub: "Characters/Characters.md" },
    { id: "symbols", label: "Symbols", hub: "Symbols/Symbols.md" },
    { id: "hom", label: "Hall of Mirrors", hub: "Hall of Mirrors/Hall of Mirrors.md" },
    { id: "songs", label: "Songs", hub: "Songs.md" },
    { id: "influences", label: "Influences", hub: "Influences/Influences.md" },
    { id: "sources", label: "Source & Structure", hub: null },
    { id: "concepts", label: "Concepts", hub: "Concepts/Concepts.md" },
    { id: "deep", label: "The Deep End", hub: "The Deep End.md" }
  ];

  var HOME = "Start Here/The Jagwar Twin Field Guide.md";
  // Index surfaces and tombstones would sit in the middle of every constellation
  // and say nothing about the work; the A–Z stays the place for a complete list.
  var EXCLUDE = { "A–Z.md": 1, "The Map.md": 1, "Rooms Behind the Gallery.md": 1 };

  function classify(path) {
    if (path.indexOf("Concepts/The Deep End/") === 0 || path === "Symbols/Water — The Deep End.md" || path === "The Deep End.md") return { id: "deep", sub: "" };
    if (path.indexOf("Concepts/") === 0) return { id: "concepts", sub: path.indexOf("Concepts/The Sacred Truths/") === 0 ? "The Sacred Truths" : "" };
    if (path.indexOf("Characters/") === 0 || path === "Brandon.md") return { id: "characters", sub: path.split("/").length > 2 ? path.split("/")[1] : "" };
    if (path.indexOf("Symbols/") === 0) return { id: "symbols", sub: "" };
    if (path.indexOf("Hall of Mirrors/") === 0) return { id: "hom", sub: "" };
    if (path.indexOf("Albums & Eras/") === 0 || path === "Songs.md") return { id: "songs", sub: path.split("/").length > 2 ? path.split("/")[1] : "" };
    if (path.indexOf("Influences/") === 0) return { id: "influences", sub: "" };
    if (path.indexOf("Source & Structure/") === 0) return { id: "sources", sub: "" };
    if (path.indexOf("Reading Paths/") === 0) return { id: "start", sub: "Trails" };
    if (path.indexOf("Start Here/") === 0) return { id: "start", sub: "" };
    return { id: "concepts", sub: "" };
  }

  function publishUrl(path) {
    var keep = { "%20": "+", "%26": "&", "%28": "(", "%29": ")", "%27": "'", "%21": "!", "%24": "$", "%2C": ",", "%3B": ";", "%3D": "=", "%3A": ":", "%40": "@" };
    return path.replace(/\.md$/, "").split("/").map(function (seg) {
      return encodeURIComponent(seg).replace(/%[0-9A-F]{2}/g, function (m) { return keep[m] || m; });
    }).join("/");
  }

  function titleOf(path, fm) {
    if (fm && typeof fm.title === "string" && fm.title.trim()) return fm.title.trim();
    return path.split("/").pop().replace(/\.md$/, "");
  }

  /* ---------- graph ---------- */

  function buildGraph(cache, opts) {
    opts = opts || {};
    var nodes = [], byPath = {}, byBase = {}, byAlias = {};
    Object.keys(cache).forEach(function (path) {
      if (!/\.md$/.test(path) || path.indexOf("_internal/") === 0) return;
      var entry = cache[path] || {}, fm = entry.frontmatter || {};
      if (EXCLUDE[path] && !opts.includeIndexes) return;
      if (String(fm.status || "").toLowerCase() === "merged" && !opts.includeMerged) return;
      var seg = classify(path);
      var node = {
        path: path, title: titleOf(path, fm), section: seg.id, sub: seg.sub,
        url: publishUrl(path), deg: 0, links: [], isHub: false, isHome: path === HOME,
        x: 0, y: 0, r: 3
      };
      nodes.push(node);
      byPath[path] = node;
      var base = node.path.split("/").pop().replace(/\.md$/, "").toLowerCase();
      if (!byBase[base] || byPath[base] === undefined) byBase[base] = byBase[base] || node;
      var aliases = fm.aliases || fm.alias;
      if (typeof aliases === "string") aliases = [aliases];
      (aliases || []).forEach(function (a) { if (a) byAlias[String(a).toLowerCase()] = node; });
    });

    function resolve(raw) {
      if (!raw) return null;
      var t = String(raw).split("|")[0].split("#")[0].replace(/\\/g, "").trim();
      if (!t) return null;
      if (byPath[t]) return byPath[t];
      if (byPath[t + ".md"]) return byPath[t + ".md"];
      var base = t.split("/").pop().toLowerCase();
      return byBase[base] || byAlias[t.toLowerCase()] || null;
    }

    var seen = {}, edges = [];
    nodes.forEach(function (node) {
      var entry = cache[node.path] || {};
      (entry.links || []).forEach(function (l) {
        var target = resolve(l.link);
        if (!target || target === node) return;
        var key = node.path < target.path ? node.path + " " + target.path : target.path + " " + node.path;
        if (seen[key]) { seen[key].w++; return; }
        var edge = { a: node, b: target, w: 1 };
        seen[key] = edge; edges.push(edge);
        node.links.push(target); target.links.push(node);
        node.deg++; target.deg++;
      });
    });

    var sections = SECTIONS.map(function (s) {
      var members = nodes.filter(function (n) { return n.section === s.id && !n.isHome; });
      var hub = s.hub && byPath[s.hub];
      if (hub) hub.isHub = true;
      return { id: s.id, label: s.label, hub: hub || null, members: members, count: members.length, a0: 0, a1: 0, mid: 0 };
    }).filter(function (s) { return s.count; });

    layout(sections, byPath[HOME]);
    return { nodes: nodes, edges: edges, sections: sections, byPath: byPath, home: byPath[HOME] || null };
  }

  // Fixed wedges: section angle by sqrt(size) so small sections stay legible,
  // equal-area radii inside so a wedge fills evenly, golden-angle spread so
  // neighbours never line up in spokes. Deterministic: the map looks the same
  // every visit, which is what makes it navigable.
  function layout(sections, home) {
    if (home) { home.x = 0; home.y = 0; home.r = 9; }
    var gap = 0.022, total = 0;
    sections.forEach(function (s) { s.w = 0.75 + Math.sqrt(s.count); total += s.w; });
    var span = TAU - gap * sections.length, angle = -Math.PI / 2 + gap / 2;
    sections.forEach(function (s) {
      var width = span * (s.w / total);
      s.a0 = angle; s.a1 = angle + width; s.mid = angle + width / 2;
      angle += width + gap;

      var subs = {}, order = [];
      s.members.forEach(function (n) { if (!subs[n.sub]) { subs[n.sub] = []; order.push(n.sub); } subs[n.sub].push(n); });
      order.sort(function (a, b) { return subs[b].length - subs[a].length; });
      var subTotal = order.reduce(function (acc, k) { return acc + 0.5 + Math.sqrt(subs[k].length); }, 0);
      var cursor = s.a0;
      s.subs = [];
      order.forEach(function (key) {
        var group = subs[key], wsub = (0.5 + Math.sqrt(group.length)) / subTotal * width;
        var b0 = cursor, b1 = cursor + wsub; cursor += wsub;
        group.sort(function (a, b) { return b.deg - a.deg || a.title.localeCompare(b.title); });
        var inner = b0 + Math.min(0.012, wsub * 0.08), outer = b1 - Math.min(0.012, wsub * 0.08);
        group.forEach(function (n, i) {
          var t = (i + 0.5) / group.length;
          var r = Math.sqrt(R_IN * R_IN + t * (R_OUT * R_OUT - R_IN * R_IN));
          var a = inner + ((i * PHI) % 1) * Math.max(outer - inner, 0.001);
          if (n.isHub) { r = R_IN * 0.86; a = s.mid; }
          n.x = Math.cos(a) * r; n.y = Math.sin(a) * r;
          n.r = (n.isHub ? 7 : 2.6) + Math.sqrt(n.deg) * 0.85;
        });
        if (key) s.subs.push({ label: key, a: (b0 + b1) / 2, r: (R_IN + R_OUT) / 2 });
      });
    });
  }

  /* ---------- view ---------- */

  function mount(container, options) {
    options = options || {};
    var graph = buildGraph(options.cache, options);
    var mini = options.mode === "mini";
    var reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var navigate = options.navigate || function (path) { global.location.href = "/" + publishUrl(path); };
    var current = options.currentPath && graph.byPath[options.currentPath] ? graph.byPath[options.currentPath] : null;

    var root = document.createElement("div");
    root.className = "jagmoon" + (mini ? " jagmoon--mini" : "");
    root.innerHTML = [
      '<canvas class="jagmoon-canvas"></canvas>',
      '<div class="jagmoon-ui">',
      mini ? "" : '<div class="jagmoon-top"><input class="jagmoon-search" type="search" placeholder="Find a page…" aria-label="Find a page" autocomplete="off"><ul class="jagmoon-hits" role="listbox"></ul></div>',
      mini ? "" : '<div class="jagmoon-chips" role="group" aria-label="Jump to a section"></div>',
      '<div class="jagmoon-card" hidden></div>',
      mini ? "" : '<button class="jagmoon-listbtn" type="button">List view</button>',
      mini ? "" : '<div class="jagmoon-list" hidden></div>',
      mini ? "" : '<p class="jagmoon-hint">drag to move · scroll to zoom · click a star to open it</p>',
      "</div>"
    ].join("");
    container.appendChild(root);

    var canvas = root.querySelector(".jagmoon-canvas"), ctx = canvas.getContext("2d");
    var card = root.querySelector(".jagmoon-card");
    var W = 0, H = 0, dpr = 1, stars = null;
    var view = { k: 0.3, x: 0, y: 0 }, target = null, anim = 0;
    var hover = null, selected = current || null, needsDraw = true;

    function resize() {
      var rect = root.getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      stars = null; needsDraw = true;
    }

    // The rim labels sit outside the disk, so fitting to the disk alone crops them.
    // The whole map always opens centred: you orient yourself first, and the page
    // you came from is marked rather than chased.
    function fit() {
      var pad = mini ? 40 : Math.min(W, H) < 560 ? 95 : 200;
      view.k = Math.min(W, H) / ((R_OUT + pad) * 2);
      view.x = 0; view.y = 0;
      needsDraw = true;
    }

    function rimSize() { return Math.max(12, Math.min(26, Math.min(W, H) / 26)); }

    function toWorld(px, py) { return [(px - W / 2 - view.x) / view.k, (py - H / 2 - view.y) / view.k]; }
    function toScreen(wx, wy) { return [wx * view.k + W / 2 + view.x, wy * view.k + H / 2 + view.y]; }

    function flyTo(k, x, y) {
      // No animation when motion is reduced, or when the tab is hidden and
      // requestAnimationFrame would never fire (the view must still be correct).
      if (reduce || document.hidden) { view.k = k; view.x = x; view.y = y; draw(); return; }
      target = { k: k, x: x, y: y, t0: performance.now(), from: { k: view.k, x: view.x, y: view.y } };
      tick();
    }

    function focusSection(section) {
      var r = (R_IN + R_OUT) / 2, k = Math.min(W, H) / (R_MOON * 1.15);
      flyTo(k, -Math.cos(section.mid) * r * k, -Math.sin(section.mid) * r * k);
    }

    function drawStars() {
      stars = document.createElement("canvas");
      stars.width = W * dpr; stars.height = H * dpr;
      var s = stars.getContext("2d"); s.scale(dpr, dpr);
      for (var i = 0; i < 190; i++) {
        s.fillStyle = "rgba(" + CREAM + "," + (0.03 + Math.random() * 0.1).toFixed(3) + ")";
        s.beginPath(); s.arc(Math.random() * W, Math.random() * H, Math.random() * 1.1 + 0.25, 0, TAU); s.fill();
      }
      var g = s.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.8);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.55)");
      s.fillStyle = g; s.fillRect(0, 0, W, H);
    }

    function draw() {
      needsDraw = false;
      if (!stars) drawStars();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#121013"; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(stars, 0, 0, W, H);

      ctx.save();
      ctx.translate(W / 2 + view.x, H / 2 + view.y); ctx.scale(view.k, view.k);

      // the moon
      var disk = ctx.createRadialGradient(-R_MOON * 0.25, -R_MOON * 0.3, R_MOON * 0.1, 0, 0, R_MOON);
      disk.addColorStop(0, "rgba(46,42,44,0.95)"); disk.addColorStop(0.65, "rgba(30,27,29,0.92)"); disk.addColorStop(1, "rgba(20,18,20,0.9)");
      ctx.beginPath(); ctx.arc(0, 0, R_MOON, 0, TAU); ctx.fillStyle = disk; ctx.fill();
      ctx.lineWidth = 1.5 / view.k; ctx.strokeStyle = "rgba(" + GOLD + ",0.22)"; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, R_IN, 0, TAU); ctx.strokeStyle = "rgba(" + GOLD + ",0.1)"; ctx.stroke();

      // section wedges: alternating brightness, never hue, so the segments read at a glance
      graph.sections.forEach(function (s, i) {
        ctx.beginPath();
        ctx.arc(0, 0, R_OUT + 30, s.a0, s.a1);
        ctx.arc(0, 0, R_IN - 12, s.a1, s.a0, true);
        ctx.closePath();
        ctx.fillStyle = "rgba(" + GOLD + "," + (i % 2 ? 0.035 : 0.012) + ")";
        ctx.fill();
        ctx.strokeStyle = "rgba(" + GOLD + ",0.1)"; ctx.lineWidth = 1 / view.k; ctx.stroke();
      });

      // threads: only for what is hovered or selected, so the map stays readable
      var focus = hover || selected;
      if (focus) {
        ctx.lineWidth = 1.1 / view.k; ctx.strokeStyle = "rgba(" + GOLD_BRIGHT + ",0.42)";
        ctx.beginPath();
        focus.links.forEach(function (n) { ctx.moveTo(focus.x, focus.y); ctx.lineTo(n.x, n.y); });
        ctx.stroke();
      }

      // stars
      var near = focus ? focus.links.reduce(function (m, n) { m[n.path] = 1; return m; }, {}) : null;
      graph.nodes.forEach(function (n) {
        var lit = !focus || n === focus || (near && near[n.path]);
        var alpha = lit ? 1 : 0.22;
        ctx.globalAlpha = alpha;
        var glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4.5);
        glow.addColorStop(0, "rgba(" + (n.isHub || n.isHome ? GOLD_BRIGHT : GOLD) + ",0.5)");
        glow.addColorStop(1, "rgba(" + GOLD + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4.5, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, TAU);
        ctx.fillStyle = n.isHub || n.isHome ? "rgba(" + GOLD_BRIGHT + ",0.95)" : "rgba(" + GOLD + ",0.85)";
        ctx.fill();
        if (n === current) {
          ctx.strokeStyle = "rgba(" + CARMINE + ",0.95)"; ctx.lineWidth = 2.2 / view.k;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5 / view.k, 0, TAU); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });

      // labels: placed by priority and skipped when they would collide, so the
      // map never turns into a pile of overlapping names
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var placed = [], budget = view.k > 0.9 ? 90 : view.k > 0.45 ? 45 : 22;
      var candidates = graph.nodes.slice().sort(function (a, b) {
        return (b.isHome ? 1e6 : 0) + (b.isHub ? 1e5 : 0) + b.deg - ((a.isHome ? 1e6 : 0) + (a.isHub ? 1e5 : 0) + a.deg);
      });
      if (!mini) candidates.forEach(function (n) {
        if (placed.length >= budget) return;
        var starred = n === focus || (near && near[n.path]);
        if (focus && !starred) return;
        if (!focus && !(n.isHub || n.isHome) && view.k < 0.3) return;
        // on a phone the section names own the map until you lean in
        if (!focus && Math.min(W, H) < 560 && view.k < 0.3 && !n.isHome) return;
        var size = n.isHub || n.isHome ? 15 : 11;
        var sp = toScreen(n.x, n.y), w = ctx.measureText ? 0 : 0;
        ctx.font = (n.isHub || n.isHome ? "500 " : "") + size + 'px Karla, ui-sans-serif, system-ui, sans-serif';
        var tw = ctx.measureText(n.title).width, th = size * 1.25;
        var cx = sp[0], cy = sp[1] + n.r * view.k + th * 0.8;
        var box = [cx - tw / 2 - 3, cy - th / 2, cx + tw / 2 + 3, cy + th / 2];
        if (box[0] < -40 || box[2] > W + 40 || box[1] < -20 || box[3] > H + 20) return;
        for (var i = 0; i < placed.length; i++) {
          var p = placed[i];
          if (box[0] < p[2] && box[2] > p[0] && box[1] < p[3] && box[3] > p[1]) return;
        }
        placed.push(box);
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = (n.isHub || n.isHome ? "500 " : "") + size + 'px Karla, ui-sans-serif, system-ui, sans-serif';
        ctx.fillStyle = "rgba(" + CREAM + "," + (n.isHub || n.isHome ? 0.95 : starred ? 0.85 : 0.62) + ")";
        ctx.fillText(n.title, cx, cy);
        ctx.restore();
      });

      ctx.restore();

      // rim and sub-section labels: drawn in screen space at a readable size on
      // any viewport, instead of scaling with the map
      if (mini) return;
      var rs = rimSize();
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (view.k > 0.5) {
        graph.sections.forEach(function (s) {
          (s.subs || []).forEach(function (sub) {
            var p = toScreen(Math.cos(sub.a) * (R_OUT + 26), Math.sin(sub.a) * (R_OUT + 26));
            ctx.font = "italic " + Math.max(11, rs * 0.62) + 'px Fraunces, Georgia, serif';
            ctx.fillStyle = "rgba(" + GOLD_BRIGHT + ",0.5)";
            ctx.fillText(sub.label, p[0], p[1]);
          });
        });
      }
      var narrow = Math.min(W, H) < 560;
      graph.sections.forEach(function (s) {
        // On a phone the disk fills the width, so the names ride inside the rim
        var r = narrow ? R_OUT * 0.66 : R_OUT + 78;
        var p = toScreen(Math.cos(s.mid) * r, Math.sin(s.mid) * r);
        ctx.font = "500 " + (narrow ? rs * 0.85 : rs) + 'px Fraunces, Georgia, serif';
        ctx.fillStyle = "rgba(" + GOLD_BRIGHT + ",0.85)";
        ctx.letterSpacing = "0.16em";
        var half = ctx.measureText(s.label.toUpperCase()).width / 2 + 6;
        ctx.fillText(s.label.toUpperCase(), Math.min(Math.max(p[0], half), W - half), p[1]);
        ctx.letterSpacing = "0px";
      });
      ctx.restore();
    }

    function tick() {
      if (anim) return;
      anim = requestAnimationFrame(function step() {
        anim = 0;
        if (target) {
          var t = Math.min(1, (performance.now() - target.t0) / 520), e = t * t * (3 - 2 * t);
          view.k = target.from.k + (target.k - target.from.k) * e;
          view.x = target.from.x + (target.x - target.from.x) * e;
          view.y = target.from.y + (target.y - target.from.y) * e;
          needsDraw = true;
          if (t >= 1) target = null;
        }
        if (needsDraw) draw();
        if (target) tick();
      });
    }

    function nodeAt(px, py) {
      var w = toWorld(px, py), best = null, bestD = Infinity;
      graph.nodes.forEach(function (n) {
        var dx = n.x - w[0], dy = n.y - w[1], d = dx * dx + dy * dy;
        var hitR = n.r + 9 / view.k;
        if (d < hitR * hitR && d < bestD) { bestD = d; best = n; }
      });
      return best;
    }

    function showCard(n) {
      if (!n) { card.hidden = true; return; }
      var section = graph.sections.filter(function (s) { return s.id === n.section; })[0];
      card.innerHTML = '<h3>' + escapeHtml(n.title) + "</h3>" +
        '<p class="jagmoon-meta">' + escapeHtml((section ? section.label : "") + (n.sub ? " · " + n.sub : "")) + " · " + n.deg + " connections</p>" +
        '<button class="jagmoon-open" type="button">Open page</button>';
      card.hidden = false;
      card.querySelector(".jagmoon-open").onclick = function () { navigate(n.path, n.url); };
      var p = toScreen(n.x, n.y);
      var cw = mini ? 180 : 224;
      card.style.left = Math.max(8, Math.min(p[0] + 16, W - cw - 8)) + "px";
      card.style.top = Math.max(8, Math.min(p[1] + 14, H - 120)) + "px";
    }

    function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    /* pointer handling: drag to pan, wheel to zoom, click to select, open explicitly */
    var dragging = false, moved = false, last = null, pointers = {}, pinch = 0;
    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = [e.clientX, e.clientY];
      dragging = !mini; moved = false; last = [e.clientX, e.clientY];
    });
    canvas.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      if (pointers[e.pointerId]) pointers[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(pointers);
      if (ids.length === 2 && !mini) {
        var a = pointers[ids[0]], b = pointers[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinch) { var f = d / pinch; view.k = Math.max(0.12, Math.min(4, view.k * f)); needsDraw = true; tick(); }
        pinch = d; moved = true; return;
      }
      if (dragging && last) {
        var dx = e.clientX - last[0], dy = e.clientY - last[1];
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        view.x += dx; view.y += dy; last = [e.clientX, e.clientY]; needsDraw = true; tick();
        return;
      }
      var n = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (n !== hover) { hover = n; canvas.style.cursor = n ? "pointer" : "grab"; needsDraw = true; tick(); if (n) showCard(n); else if (!selected || mini) card.hidden = true; }
    });
    function endPointer(e) { delete pointers[e.pointerId]; if (!Object.keys(pointers).length) { dragging = false; pinch = 0; last = null; } }
    canvas.addEventListener("pointerup", function (e) {
      var rect = canvas.getBoundingClientRect();
      if (!moved) {
        var n = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
        if (n) {
          if (mini) { navigate(n.path, n.url); }
          else if (selected === n) { navigate(n.path, n.url); }
          else { selected = n; showCard(n); needsDraw = true; tick(); }
        } else { selected = null; card.hidden = true; needsDraw = true; tick(); }
      }
      endPointer(e);
    });
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("wheel", function (e) {
      if (mini) return; // the sidebar moon never hijacks page scrolling
      e.preventDefault();
      var rect = canvas.getBoundingClientRect(), px = e.clientX - rect.left, py = e.clientY - rect.top;
      var before = toWorld(px, py);
      view.k = Math.max(0.12, Math.min(4, view.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
      var after = toWorld(px, py);
      view.x += (after[0] - before[0]) * view.k; view.y += (after[1] - before[1]) * view.k;
      needsDraw = true; tick();
    }, { passive: false });

    /* search, chips, list view */
    if (!mini) {
      var search = root.querySelector(".jagmoon-search"), hits = root.querySelector(".jagmoon-hits");
      search.addEventListener("input", function () {
        var q = search.value.trim().toLowerCase();
        hits.innerHTML = "";
        if (!q) return;
        graph.nodes.filter(function (n) { return n.title.toLowerCase().indexOf(q) >= 0; })
          .sort(function (a, b) { return b.deg - a.deg; }).slice(0, 8)
          .forEach(function (n) {
            var li = document.createElement("li");
            li.textContent = n.title; li.tabIndex = 0;
            li.onclick = function () { selected = n; showCard(n); flyTo(Math.max(view.k, 0.9), -n.x * Math.max(view.k, 0.9), -n.y * Math.max(view.k, 0.9)); hits.innerHTML = ""; search.value = ""; };
            hits.appendChild(li);
          });
      });

      var chips = root.querySelector(".jagmoon-chips");
      var all = document.createElement("button");
      all.type = "button"; all.textContent = "Whole map";
      all.onclick = function () { selected = null; card.hidden = true; fit(); tick(); };
      chips.appendChild(all);
      graph.sections.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = s.label + " (" + s.count + ")";
        b.onclick = function () { focusSection(s); };
        chips.appendChild(b);
      });

      var listBtn = root.querySelector(".jagmoon-listbtn"), list = root.querySelector(".jagmoon-list");
      listBtn.onclick = function () {
        if (list.hidden) {
          list.innerHTML = graph.sections.map(function (s) {
            var items = s.members.slice().sort(function (a, b) { return a.title.localeCompare(b.title); })
              .map(function (n) { return '<li><a href="/' + n.url + '">' + escapeHtml(n.title) + "</a></li>"; }).join("");
            return "<h3>" + escapeHtml(s.label) + "</h3><ul>" + items + "</ul>";
          }).join("");
          list.hidden = false; listBtn.textContent = "Close list";
        } else { list.hidden = true; listBtn.textContent = "List view"; }
      };
    }

    function onResize() { if (!root.isConnected) return; resize(); fit(); draw(); }
    global.addEventListener("resize", onResize);
    resize();
    fit();
    if (current) { selected = current; if (!mini) showCard(current); }
    draw();

    // Publish is a single-page app: the host tells the map when the reader moves.
    function setCurrent(path) {
      current = path && graph.byPath[path] ? graph.byPath[path] : null;
      selected = current; hover = null;
      if (current && !mini) showCard(current); else card.hidden = true;
      draw();
    }

    // Call after the container becomes visible (a hidden overlay measures 0x0).
    function refresh() { resize(); fit(); draw(); if (selected && !mini) showCard(selected); }

    return {
      graph: graph,
      destroy: function () { global.removeEventListener("resize", onResize); root.remove(); },
      focusSection: focusSection,
      setCurrent: setCurrent,
      refresh: refresh,
      element: root
    };
  }

  global.JagMoon = { mount: mount, buildGraph: buildGraph, publishUrl: publishUrl, SECTIONS: SECTIONS };
})(window);

/* The moon — Wander the Web.
 *
 * Replaces Publish's own graph with the moon map (the JagMoon engine above):
 *   - a compact moon at the top of the right-hand column: the page you are on is
 *     ringed and its threads are lit; a star opens its page, the button opens the
 *     whole map
 *   - a full-screen map, also opened by any link ending in #wander-the-web
 *   - a floating "The map" button whenever the right-hand column is hidden
 *     (phones and narrow windows, where Publish shows no graph at all)
 * Publish's native graph is hidden only after the moon has mounted
 * (body.jt-moon-ready), so if anything here fails readers still get a graph.
 *
 * Source of truth: JagWeb/moon-graph/. Edit there and run build_publish.py;
 * this block is regenerated between its START/END markers.
 */
(function () {
  "use strict";
  if (window.__jtMoon) return;
  window.__jtMoon = true;

  var HASH = "#wander-the-web";
  var cache = null, panel = null, mini = null, overlay = null, full = null, fab = null, lastPath = null;

  function whenReady(cb, tries) {
    var P = window.publish;
    if (window.JagMoon && P && P.site && P.site.cache && P.site.cache.cache &&
        Object.keys(P.site.cache.cache).length) return cb(P);
    if ((tries || 0) > 120) return; // about 30 seconds, then give up quietly
    setTimeout(function () { whenReady(cb, (tries || 0) + 1); }, 250);
  }

  function go(P, path) {
    closeMap();
    try { P.navigate(path, ""); }
    catch (e) { window.location.href = "/" + window.JagMoon.publishUrl(path); }
  }

  function mountPanel(P) {
    var inner = document.querySelector(".site-body-right-column-inner");
    if (!inner || (panel && inner.contains(panel))) return;
    panel = document.createElement("div");
    panel.className = "jt-moon-panel";
    panel.innerHTML =
      '<div class="jt-moon-panel-head"><span>Wander the Web</span>' +
      '<button type="button" class="jt-moon-expand" aria-label="Open the whole map">Open the map</button></div>' +
      '<div class="jt-moon-panel-body"></div>';
    inner.insertBefore(panel, inner.firstChild);
    if (mini) mini.destroy();
    mini = window.JagMoon.mount(panel.querySelector(".jt-moon-panel-body"), {
      cache: cache, currentPath: P.currentFilepath, mode: "mini",
      navigate: function (path) { go(P, path); }
    });
    panel.querySelector(".jt-moon-expand").addEventListener("click", openMap);
    document.body.classList.add("jt-moon-ready");
  }

  function openMap() {
    var P = window.publish;
    if (!cache || !P) return;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "jt-moon-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "The whole map");
      overlay.innerHTML = '<button type="button" class="jt-moon-close" aria-label="Close the map">Close ✕</button>' +
        '<div class="jt-moon-stage"></div>';
      document.body.appendChild(overlay);
      overlay.querySelector(".jt-moon-close").addEventListener("click", closeMap);
      full = window.JagMoon.mount(overlay.querySelector(".jt-moon-stage"), {
        cache: cache, currentPath: P.currentFilepath,
        navigate: function (path) { go(P, path); }
      });
    }
    overlay.hidden = false;
    document.body.classList.add("jt-moon-open");
    full.setCurrent(P.currentFilepath);
    full.refresh();
    overlay.querySelector(".jt-moon-close").focus();
  }

  function closeMap() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("jt-moon-open");
    if (window.location.hash === HASH) {
      // Absolute URL on purpose: Publish sets <base href="https://publish.obsidian.md">,
      // so a relative path would resolve cross-origin and the browser would refuse it.
      try {
        history.replaceState(history.state, "", window.location.origin + window.location.pathname + window.location.search);
      } catch (e) { /* leaving the hash in place is harmless */ }
    }
    if (fab && document.body.classList.contains("jt-moon-norail")) fab.focus();
  }

  function mountFab() {
    if (fab) return;
    fab = document.createElement("button");
    fab.type = "button";
    fab.className = "jt-moon-fab";
    fab.textContent = "✦ The map";
    fab.setAttribute("aria-label", "Open the whole map");
    fab.addEventListener("click", openMap);
    document.body.appendChild(fab);
  }

  // The floating button stands in for the right-hand column whenever Publish hides it.
  function syncRail() {
    var rail = document.querySelector(".site-body-right-column");
    var hidden = !rail || window.getComputedStyle(rail).display === "none";
    document.body.classList.toggle("jt-moon-norail", hidden);
  }

  // Publish rewrites the URL while it boots and when it scrolls to a fragment, so a
  // one-time check can miss #wander-the-web; re-check on every sync, once per arrival.
  var hashSeen = false;
  function checkHash() {
    if (window.location.hash === HASH) {
      if (!hashSeen) { hashSeen = true; openMap(); }
    } else {
      hashSeen = false;
    }
  }

  function sync(P) {
    mountPanel(P); // Publish can rebuild the right-hand column; put the moon back
    syncRail();
    checkHash();
    var path = P.currentFilepath;
    if (path === lastPath) return;
    lastPath = path;
    if (mini) mini.setCurrent(path);
    if (full && overlay && !overlay.hidden) full.setCurrent(path);
  }

  whenReady(function (P) {
    cache = P.site.cache.cache;
    mountFab();
    sync(P);
    try { P.on("navigated", function () { setTimeout(function () { sync(P); }, 60); }); } catch (e) { /* polling covers it */ }
    setInterval(function () { sync(P); }, 800);
    window.addEventListener("resize", syncRail);

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMap(); });
    window.addEventListener("hashchange", checkHash);
    // A homepage door can simply link to …#wander-the-web
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest && e.target.closest("a[href]");
      if (a && (a.getAttribute("href") || "").slice(-HASH.length) === HASH) { e.preventDefault(); openMap(); }
    }, true);
  });
})();
/* <<< JT MOON END */
