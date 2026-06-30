---
title: Migration Playbook
type: meta
status: internal
confidence: grounded
---
# Migration Playbook — internal, do not publish

How content moves from the **lab vault** (`/Users/jenniferspinks/Vaults/JagwarTwin/`) into this public guide. This page is for the builder, not the reader. Keep it out of the Obsidian Publish selection.

## Which file to migrate

The lab vault has three layers. Pick the source by topic:

| Topic | Migrate from | Why |
|---|---|---|
| **Songs** | `Essays/Concepts/Songs/<Song>.md` | ~48 finished prose essays already exist. |
| **Characters / Concepts with an essay** | `Essays/...` | Already human-facing prose. |
| **Characters / Concepts without an essay** (Mary, Jagwar Twin, most concepts) | `Brain/...` | Only source; must be prose-written, not pasted. |
| **Best content is often split** | both | e.g. Lucius's three-register "nature" paragraph is Brain-only; his prose timeline is Essay-only. Merge. |

Never migrate `Sources/` directly (raw lyrics = copyright; transcripts = dumps).

## The cleanup standard (every page)

Strip all of this:

- Epistemic markers: `[G]` `[W]` `[P]` `[~]` `[?]`. Convert meaning into prose instead (see below).
- Tiering tables, "Tiering (this section)" blocks, Counterargument scaffolding meant for the analyst.
- Discord permalink dumps, `referenced_by:`, `CONCEPT-*`/`CHAR-*`/`SONG-*` IDs, `active_systems`/`dominant_pole`/etc. tracking fields.
- Any "Claude / GPT / verify / TODO / draft / pending pin" housekeeping.
- Folder paths inside wikilinks: `[[Brain/Songs/Welcome to the Circus]]` → `[[Welcome to the Circus]]`.
- Full lyric transclusions `![[Sources/Lyrics/...]]` → short excerpts + a link out.
- Anything sourced only to private/Secret-Document material, unless independently public.

Convert markers into voice:

- `[G]` grounded → plain statement: *"Roy has said…", "the video shows…", "on release the post read…"*
- `[W]` / `[P]` strong read → *"reads as / suggests / can be understood as / one reading is…"*
- `[~]` / `[?]` resonance/speculative → *"speculatively…", "in <named framework> terms…"* — and name the framework.

## The shape of every page

1. **One-line reading** in a `>` quote block — the single best sentence.
2. Grounded basics first, interpretation after.
3. Short sections, strong internal links (up to a hub, sideways to related, down to songs/symbols).
4. Confidence carried by wording, not brackets.
5. Lean frontmatter only: `title`, `type`, `status`, `confidence`.

## Frontmatter values

```yaml
---
title: Sir Lucius
type: character          # character | concept | symbol | song | album-era | reading-path | meta
status: published        # published | draft | internal
confidence: mixed        # grounded | reading | mixed
source: ["Brain/Characters/Sir Lucius.md", "Essays/Characters/Sir Lucius.md"]
---
```

- `source:` is the **non-intrusive tie-back to the lab vault** — a list of the lab-vault-relative path(s) each page was migrated from. Readers never see it (Obsidian Publish hides frontmatter); it exists so a future sync pass can diff a public page against its source(s) and know exactly what to re-check. **Always populate it.** Never list a `_Private/` path.

## Sourcing by type

- **Characters** → `Brain/Characters/<Name>.md` is the MAIN file; fold in `Essays/Characters/<Name>.md` if it exists.
- **Songs** → `Essays/Concepts/Songs/<Song>.md` is the MAIN file; fold in `Brain/Songs/.../<Song>.md`. Excerpt lyrics, never transclude.
- **Concepts / Symbols** → `Brain/Concepts/<Name>.md` is the MAIN file; fold in any `Essays/Concepts/<Name>.md`.
- **Albums/Eras** → `Brain/Albums/<Name>.md` + `Essays/Arcs/<Name>.md`.
- **Symbols with no single source file** (Green Apple, Rose, Rabbit, Moon) → synthesize from distributed mentions: `grep -rli "green apple"` across the lab vault, read the hits, write the page.

## Esoteric / framework material

Compress it the way the **Mary** exemplar does: one clearly-labeled "here's a framework reading" paragraph ("one strong interpretive frame, drawn from the Kabbalah Roy studies, reads X as…"), never raw jargon dumped as fact. Name the tradition. Keep the grounded layer in front.

## Pre-publish audit (per page)

Grep the page for leak words before marking `status: published`: `private`, `unreleased`, `secret`, `Claude`, `GPT`, `verify`, `TODO`, `[W]`, `[G]`, `[P]`, `Discord`, `Secret Document`. Check: no full lyrics, no broken-intent wikilinks left pointing at lab-vault folders, every speculative claim labeled.
