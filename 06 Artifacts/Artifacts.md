---
type: index
citable: true
status: draft
tags: [artifact, media-evaluation]
created: 2026-07-01
---
# Media Evaluation — Artifacts (grouped + tagged hub)

The working index for evaluating the vault's **artifact media** against the lore. One place to see every *discovered* Hall of Mirrors artifact, what it is, which media file holds it, and where it ties into the canon. Items are **grouped, not given a page each**; overlapping tags let one item surface in several views.

## Sources of truth
- **Master table** (names · codes · discoverers · dates): [[Hall of Mirrors]] — 149 rows, gallery order.
- **The media files:** `Media/images/hom-artifacts/complete/` — every file named `{#}-{NAME}-{hash}.{ext}`, so the leading number = the gallery row (audio `.mp3`, video `.mp4`, images `.png/.jpg`). `_manifest.json` there holds the hash↔name↔code map. **148 local files** (row `#11 Happy Face` is a MINT-room, no file).
- **Deep-dives already written** (don't duplicate — link): Walking the Edge of a Knife · Sir Rabbit · Grandma VI · RAPhael / Christmas Spider · Audio artifacts · Grey in A# / Stardust · In My Father's Shoes · Complete Artifact Archive.

## The tag scheme (overlapping — an item can carry several)
Every entry carries `#artifact` plus one or more content tags, so any tag is a "group." With Dataview / Bases installed these become **live views** (an *Artifacts* view = `#artifact`; a *Drawings* view = `#drawing`; etc.).

| Tag | Meaning |
|---|---|
| `#artifact` | every discovered, coded artifact (the universe) |
| `#drawing` | hand-drawn by Roy — sketches, diagrams, portraits, maps |
| `#poem` · `#story` · `#diary` | text artifacts (handwritten or typed) |
| `#song-demo` | audio: demos, lost songs, voice memos |
| `#mint-song` | on-chain MINT-room song releases |
| `#video-clip` | video artifacts (home video, performance, animation) |
| `#photo` | photographs (family, studio, stage) |
| `#cipher` | part of a coded series (Flood glyphs, body-part codes, SA-RA-VI links, numeric IDs) |
| `#concept-code` | the unlock code IS a vault concept (fold into that page) |
| `#personal-family` | family / father / childhood material |
| `#social-artifact` | a minted screenshot of a post/message (the only socials in scope) |
| `#possibly-trash` | low-signal or unclear; kept but flagged, with a reason |

## Groups
**Standard format (all groups):** clickable **GCS thumbnail** (his image, opens full-size) · deep analysis · **adversarially-verified song ties** as `[[links]]` (only grounded strong/moderate survive) · reciprocal Artifact section on each tied song page · gallery backlink. Videos evaluated via extracted frames; audio from metadata (flagged *not auditioned*).
- [[Artifacts - Drawings and Sketches]] — hand-drawn sketches, cosmology maps, portraits, the **planetary bestiary**. **✅ complete (25, deep format)**
- [[Artifacts - Poems, Texts and Social Posts]] — poems, diaries, aphorisms + the 3 minted social posts. **✅ complete (deep format)**
- [[Artifacts - Songs, Demos and Mints]] — audio demos, lost songs, early-band videos, the MINT-room releases. **✅ complete (deep format)**
- [[Artifacts - Family, Friends and Moments]] — grandma / dad / childhood / pets / live-moment photos & videos. **✅ complete (deep format)**
- [[Artifacts - Ciphers and Code-Series]] — Flood glyphs, numeric IDs, the SA-RA-VI / True-Voice / gate chains. **✅ complete (deep format)**
- [[Artifacts - Concept Images and Emblems]] — images & clips whose code or content IS canon-concept material. **✅ complete (deep format)**

## Migration (public site) — ✅ done
Migrated to **The Jagwar Files → `06 Artifacts/`** (hub = [[Artifacts]] + 6 group pages), with reciprocal **Artifacts** sections on the public song pages and the public [[Hall of Mirrors]] page pointing here. Images are hotlinked GCS (light); local media kept here as backup.

## The "I'm 33" board (separate enrichment track)
Roy's own spreadsheet is already captured as **one consolidated doc**: [[The I'm 33 Board]] (decode: [[The I'm 33 Board]]). So this track is **enrichment, not capture** — weave the board's concepts into the relevant song/concept pages, each pointing *back* to that board doc.

> **★ Finding (Drawings pass):** many HoM drawing-artifacts *are the board's own diagrams*, minted individually — the Eye-of-Horus fractions (#71/#84), Platonic Lambda (#45), "A Head of Adam" (#86), "Tree thinking / Abyss" (#15), "suggestion of apex — 6 sides" (#26), the Lightning-Flash (#125). So the artifact pass and this enrichment track feed each other: the board decodes the artifacts, and the artifacts are the board's cosmology made collectible. Its own "Connections" section already lists the target pages ([[The Labors of Hercules]], [[It's Your Time]], [[Sir Lucius]], [[33 (album)]], [[Soul Is A Star]], [[Online]], [[The Pattern]]…) — that list is the enrichment worklist.

## Method notes
- **Evaluation = look at the item, then place it.** Entries here are sourced from the existing catalog analysis and the standout-visuals notes; where an item hasn't been visually confirmed it's marked *(to verify)* rather than asserted.
- File references use Obsidian wikilinks to the `complete/` filename (unique per artifact). Switch to `![[…]]` embeds if a thumbnail gallery is preferred.
