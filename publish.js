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
