# Wardrobe App — Project Context

## What this is
A personal mobile-first outfit planning app for Nehal. Pure HTML/CSS/JS, no backend, no build tools — just open the HTML file in a browser. Clothing item images are hosted on Google Drive and referenced directly via Drive file URLs.

## Files
- **wardrobe.html** — the main app (outfit builder). This is the primary file.
- **catalog-view.html** — full catalog browser, lists all clothing items by category
- **wardrobe-config.html** — admin/config page for managing scenarios and styles
- **CLAUDE.md** — this file, read at the start of every session
- **.gitignore** — excludes local mockup/reference images from git

## How the main app works
- **Header**: scenario selector pills (Work, Casual, Formal, etc.) — sets context for AI match scoring
- **Outfit canvas**: 2-column × 4-row grid with slots — Outer (blazer or suit), Top, Pants, Belt, Shoes
  - Suit mode: outer slot spans full height, pants slot hidden
  - Blazer mode: normal 4-row layout
- **Bottom panel**: 3-level tab system
  - Level 1 (cat-tabs): main category — Tops, Bottoms, Outer, Belts, Shoes
  - Level 2 (sub-tabs): sub-category — e.g. Shirts, T-Shirts under Tops
  - Level 3 (subsub-tabs): filter — e.g. color or style variants
  - Horizontal scrollable carousel of clothing cards with AI match star badges

## Clothing catalog built so far
- Shirts (formal, casual — with color swatches)
- T-Shirts (with color swatches)
- Blazers (cropped images, no labels)
- Pants
- Belts (multiple brands including Tommy Hilfiger)
- Suits (4+ items)
- Shoes (19 items)

## Design language
- iOS-inspired, mobile-first
- Color palette: `#1c1c1e` (dark), `#f2f2f7` (light gray), `#fff` (cards)
- Rounded corners (12px–16px), pill buttons, backdrop blur header
- Font: system font stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`)

## Setup & workflow
- Project folder lives in Google Drive — syncs automatically across home and office laptops
- GitHub repo: https://github.com/trivedinehal/wardrobe (for version history/backup)
- No framework, no npm, no build step — just edit HTML and refresh browser

## Current status (as of 2026-06-06)
- All 3 files pushed to GitHub, live at trivedinehal.github.io/wardrobe/
- wardrobe-config.html fully reviewed — categories, subcategories, order all finalised
- wardrobe.html updated to match config exactly
- catalog-view.html — style column removed, classifications aligned, order fixed
- Dress Trousers category added to Pants but items are "coming soon" — Nehal will photograph ~10 standalone formal trousers

## Next steps (do in order)
1. ✅ Create shared `catalog.js`, wire all 3 files to use it. Done.
2. ✅ Design item attributes schema (formality, color, fabric etc) for matching intelligence. Done.
3. ✅ Fill in attributes for every item in catalog.js. Done — all 72 items complete.
4. **Next** — Build matching logic in wardrobe.html using attributes.
5. Photograph dress trousers (~10 items) and add to catalog.

## Key decisions made
- `formality` is an array — items can work across multiple styles e.g. ["Formal", "Smart Casual"]
- `beltLoop` added to pants — "wide", "narrow", or "none" (elastic waist)
- Belt `width` determines what pants it fits — thin (formal trousers), wide (jeans/chinos)
- Denim subcategory renamed to Jeans
- catalog-attributes.html created for reviewing item attributes with list + detail views

## What to update here
At the end of any session where something meaningful changed — new feature, key decision, or shift in direction — update this file before closing the chat.
