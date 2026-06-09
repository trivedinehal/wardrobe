# Wardrobe App — Project Context

## What this is
A personal mobile-first outfit planning app for Nehal. Pure HTML/CSS/JS, no backend, no build tools. Clothing item images are hosted on Google Drive and referenced directly via Drive file URLs. Will eventually run on a Raspberry Pi + HyperPixel 4 (800x480 landscape) mounted in Nehal's walk-in wardrobe.

## File architecture
- **wardrobe.html** — home hub page. Navigation to builder, catalog, future pages (Outfits, History).
- **builder.html** — the main outfit builder app
- **builder-logic.js** — outfit building brain: state (selected, lockedSlots), bestForSlot, completeOutfit, shuffleCategory, clearOutfit, swipe snapshot logic
- **matching.js** — attribute-based scoring engine. Returns stars (0-3) + raw score. Called by builder.
- **catalog.js** — single source of truth for all wardrobe data (72 items, full attributes)
- **catalog-view.html** — catalog browser
- **catalog-attributes.html** — attribute review page
- **wardrobe-config.html** — category/structure planning sandbox
- **CLAUDE.md** — this file, read at start of every session
- **memory/** — persistent memory files, ALWAYS read all of them at session start

## How the builder works
- **Header row 1**: WHERE pills (Office/Dinner/Event/Weekend/Travel) — context only, no matching effect
- **Header row 2**: STYLE pills (Formal/Smart Casual/Casual) — affects matching scores
- **Canvas**: 2-column grid — Outer (blazer/suit), Shirt, Pants, Belt, Shoes. Suit mode hides pants.
- **Action row**: Complete Outfit + Clear
- **Bottom panel**: 3-level tabs (category → sub → sub-sub) + carousel. Per-category 🔀 in sub-tabs.
- **Swipe**: swipe left/right on any filled canvas slot to cycle through that category
- **Stars**: on carousel items (bottom right, plain gold 8px) and canvas slots (above name bar, right aligned)
- **Lock**: 🔒 on each filled slot. Locked slots ignored by Complete Outfit and shuffle.

## Matching logic summary
- Attribute-based pairwise scoring: formality alignment (+0-4), tone contrast (+0-3), colour harmony (+0-3), pattern bonus (+0-2)
- Hard X exclusions: suit+tshirt, suit+plaid, pattern-on-pattern, athletic shoes with outer, wide belt in narrow loops, brown/black shoe-belt clash, elastic waist + belt
- Style pill: +1.5 for matching formality, -1 for mismatch
- Complete Outfit: deterministic (highest score) when filling empty slots, random-from-⭐⭐⭐-tier when shuffling full canvas
- Swipe snapshot: ranked order frozen at first swipe, resets on canvas change

## Current status (as of 2026-06-09)
- All builder features complete and working
- wardrobe.html = home hub, builder.html = outfit builder
- Matching logic tuning deferred — Nehal using app to build list of issues
- Architecture: catalog.js (data) → matching.js (scoring) → builder-logic.js (logic) → builder.html (UI)

## Matching tuning list (collected during use — fix in one pass)
- Light wash jeans + shirts → should show ⭐⭐⭐ without blazer
- Casual jeans + t-shirts → style penalty too harsh
- Brown shoes + light grey/blue suit → wrongly getting X
- Style pill not differentiating shoe rankings enough
- Only pants on canvas, no outer → don't penalise shirts on formality

## Next steps
1. Matching logic tuning pass (after Nehal collects more real-use feedback)
2. Outfit history page (history.html)
3. Catalog updates — shirts photos, dress trousers, jackets (Nehal to photograph)

## Backlog
- Outfits page — carousel of complete outfit suggestions
- HyperPixel kiosk home screen (when Pi is bought)
- Styling tips — contextual advice based on outfit combination

## Design language
- iOS-inspired, mobile-first
- Colour palette: `#1c1c1e` (dark), `#f2f2f7` (light gray), `#fff` (cards), `#007aff` (blue accent)
- Rounded corners (12-16px), pill buttons, backdrop blur header
- Font: system font stack (-apple-system, BlinkMacSystemFont, Segoe UI)
- Carousel tiles: 80x90px image, 9px name label, plain gold stars bottom right

## Setup
- Project folder in Google Drive — syncs across laptops
- GitHub repo: https://github.com/trivedinehal/wardrobe
- Live at: trivedinehal.github.io/wardrobe/
- No framework, no npm, no build step — just edit and refresh

## Important: always read memory files
At session start, read ALL files in the memory/ folder. They have the full context, decisions, and history.
