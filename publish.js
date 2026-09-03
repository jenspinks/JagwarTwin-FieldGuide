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

/* Six main sections, six hub links (2026-09-03).
 * Keep the underlying folders and URLs. Native rows remain as a fallback;
 * only the six replaced rows are hidden after the real links exist.
 * Source & Structure and A–Z keep their native navigation and visibility.
 */
(function () {
  "use strict";
  if (window.__jtHubDoors) return;
  window.__jtHubDoors = true;

  var DOORS = [
    ["Hall of Mirrors", "Hall of Mirrors/Hall of Mirrors"],
    ["Characters", "Characters/Characters"],
    ["Concepts", "Concepts/Concepts"],
    ["Influences", "Influences/Influences"],
    ["Symbols", "Symbols/Symbols"],
    ["Songs", "Songs"]
  ];

  function pathOf(path) {
    try { path = decodeURIComponent(path.replace(/\+/g, " ")); }
    catch (e) { /* preserve a malformed path without breaking navigation */ }
    return path.replace(/^\/+|\/+$/g, "").replace(/\.md$/, "");
  }

  function sync() {
    var side = document.querySelector(".site-body-left-column");
    if (!side) return;
    var rootRow = side.querySelector('.tree-item-self[data-path="Characters"]');
    if (!rootRow || !rootRow.parentElement || !rootRow.parentElement.parentElement) return;
    var list = rootRow.parentElement.parentElement;
    var host = list.parentElement;
    if (!host) return;
    var nav = host.querySelector(".jt-hub-doors");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "jt-hub-doors";
      nav.setAttribute("aria-label", "Main sections");
      DOORS.forEach(function (door) {
        var link = document.createElement("a");
        link.textContent = door[0];
        // Publish's <base> points at publish.obsidian.md, not our custom host.
        link.href = window.location.origin + "/" + door[1].split("/").map(encodeURIComponent).join("/");
        link.setAttribute("data-jt-hub", door[1]);
        nav.appendChild(link);
      });
      host.insertBefore(nav, list);
    }
    // Do not depend on a child row being rendered, expanded, or unhidden.
    DOORS.forEach(function (door) {
      var path = door[0] === "Songs" ? "Songs.md" : door[0];
      var row = side.querySelector('.tree-item-self[data-path="' + path + '"]');
      if (row && row.parentElement) row.parentElement.classList.add("jt-hub-door-source");
    });
    var current = pathOf(window.location.pathname);
    nav.querySelectorAll("a[data-jt-hub]").forEach(function (link) {
      var selected = current === link.getAttribute("data-jt-hub");
      if (selected && link.getAttribute("aria-current") !== "page") link.setAttribute("aria-current", "page");
      if (!selected && link.hasAttribute("aria-current")) link.removeAttribute("aria-current");
    });
  }

  // Publish replaces parts of the sidebar on navigation. Reinstall once per
  // replacement, and update the current-page marker on SPA/back navigation.
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () { pending = false; sync(); });
  }
  function start() {
    if (!document.body) return;
    sync();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
  window.addEventListener("popstate", schedule);
  window.addEventListener("hashchange", schedule);
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
