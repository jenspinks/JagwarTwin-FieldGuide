/* publish.js — The Jagwar Twin Field Guide
 *
 * Make clicking a NAV FOLDER open its "folder note": a page named the same as the
 * folder (e.g. clicking "Characters" opens Characters/Characters; clicking
 * "Albums & Eras" opens Albums & Eras/Albums & Eras). Folders that have no such
 * page (Stars, Supporting Cast, Source & Structure, Reading Paths, …) are left to
 * behave normally — they just expand/collapse.
 *
 * How it works: Obsidian Publish expands a folder on click. We wait a beat for the
 * folder's children to render, find the child note whose path equals folder/foldername,
 * and trigger Publish's own navigation by clicking it (no URL guessing, so names with
 * spaces or "&" like "Albums & Eras" are handled correctly).
 */
(function () {
  "use strict";

  function openFolderNote(folderPath) {
    if (!folderPath) return;
    var name = folderPath.split("/").pop();
    var notePath = folderPath + "/" + name; // e.g. "Characters" -> "Characters/Characters"
    var items = document.querySelectorAll(
      ".site-body-left-column .tree-item-self[data-path]"
    );
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute("data-path") === notePath) {
        items[i].click(); // let Publish's router do the navigation
        return;
      }
    }
    // No folder note for this folder — leave the normal expand/collapse alone.
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
      // Let the folder expand + render its children, then open its page.
      setTimeout(function () {
        try {
          openFolderNote(folderPath);
        } catch (e) {
          /* fail safe: never break the nav */
        }
      }, 50);
    },
    true
  );
})();
