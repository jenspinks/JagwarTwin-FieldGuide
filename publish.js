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
