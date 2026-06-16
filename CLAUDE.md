# Wardrobe App — Project Context

## FIRST THING: Read all memory files

At the start of every session, before doing anything else, read ALL `.md` files in this folder:

`G:\My Drive\Assistant - Nehal\Wardrobe Base\memory\`

Read every file in that folder — do not skip any. Do NOT rely on any other memory index or folder.

---

## What this is
A personal mobile-first outfit planning app for Nehal. Pure HTML/CSS/JS, no backend, no build tools. Clothing item images hosted on Google Drive. Will eventually run on a Raspberry Pi + HyperPixel 4 (800×480 landscape) mounted in Nehal's walk-in wardrobe.

## File architecture
- **wardrobe.html** — home hub, links to all pages
- **builder.html** — main outfit builder UI
- **builder-logic.js** — outfit building brain (state, bestForSlot, completeOutfit, shuffleCategory, clearOutfit, swipe snapshot)
- **matching.js** — v2 scoring engine (Context Fit + Visual Harmony, 0–10 scale). Called by builder.
- **catalog.js** — single source of truth for all wardrobe data (72 items, full attributes, STYLE_ORDER, OUTFIT_TYPES)
- **catalog-view.html** — catalog browser with list/detail toggle
- **catalog-attributes.html** — attribute review with list/detail toggle
- **wardrobe-config.html** — config/planning page (styles, outfit types, categories — all dynamic from catalog.js)
- **matching-logic.html** — visual reference for matching rules, reads from MATCH_CONFIG
- **architecture.html** — visual file dependency diagram
- **CLAUDE.md** — this file
- **memory/** — persistent memory files (listed above — read all at session start)

## How the builder works
- **Header row 1**: WHERE pills (Office/Dinner/Event/Weekend/Travel) — context only, no matching effect
- **Header row 2**: STYLE pills (Formal / Semi-Formal / Smart Casual / Casual) — drives context fit scoring
- **Header row 3**: OUTFIT TYPE pills — updates when style is tapped, drives canvas mode + slot labels
- **Canvas**: 2-column grid — Outer, Shirt, Pants, Belt, Shoes. Suit mode hides pants slot.
- **Action row**: Complete Outfit + Clear
- **Bottom panel**: 3-level tabs (category → sub → sub-sub) + carousel. Per-category 🔀 in sub-tabs.
- **Swipe**: left/right on any filled canvas slot to cycle through ranked items in that category
- **Stars**: on carousel items (bottom right, plain gold 8px) and canvas slots (above name bar, right aligned)
- **Lock**: 🔒 on each filled slot — locked slots ignored by Complete Outfit and shuffle

## Matching engine v2 summary
- Score = Context Fit (0–5) + Visual Harmony (0–5) = 0–10
- Context Fit: how well item fits selected Style + Outfit Type (fires as soon as style/type are set)
- Visual Harmony: tone contrast + colour harmony + pattern pairing against canvas items
- Stars: 8+ = ⭐⭐⭐, 5–7 = ⭐⭐, 3–4 = ⭐, <3 = none
- Hard X exclusions are context-aware (e.g. t-shirt excluded in Formal/Semi-Formal, fine in Casual)
- Belt scoring is pairwise (width vs loops, colour vs shoes)

## Design language
- iOS-inspired, mobile-first
- Colour palette: `#1c1c1e` (dark), `#f2f2f7` (light gray), `#fff` (cards), `#007aff` (blue accent)
- Rounded corners (12–16px), pill buttons, backdrop blur header
- Font: system font stack (-apple-system, BlinkMacSystemFont, Segoe UI)
- Carousel tiles: 80×90px image, 9px name label, plain gold stars bottom right

## Setup
- Project folder in Google Drive — syncs across laptops
- GitHub: https://github.com/trivedinehal/wardrobe
- Live: https://trivedinehal.github.io/wardrobe/
- No framework, no npm, no build step — just edit and refresh
