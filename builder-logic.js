// ============================================================
// builder-logic.js — Outfit building brain
// ============================================================
// Depends on: catalog.js, matching.js
// Exposes globals used by builder.html:
//   selected, lockedSlots
//   buildCanvas(), outerCats()
//   bestForSlot(), fillBestForSlot()
//   completeOutfit(), shuffleCategory(), clearOutfit()
// Calls DOM functions defined in builder.html:
//   fillSlot(), fillSwatchSlot(), clearSlot()
//   updateSuitMode(), refreshAllSlotStars(), renderCarousel()
// ============================================================

// ── Shared state ──────────────────────────────────────────────────────────────

let selected    = {};   // items currently on canvas, keyed by slot
let lockedSlots = {};   // slots that are locked from shuffle

// ── Canvas helpers ────────────────────────────────────────────────────────────

// Build canvas object for matching engine from current selections
function buildCanvas() {
  return {
    outer: selected['outer'] || null,
    top:   selected['top']   || null,
    pants: selected['pants'] || null,
    belts: selected['belts'] || null,
    shoes: selected['shoes'] || null,
  };
}

// Outer categories to search based on style and locked slots
function outerCats() {
  // If pants are locked, never pick a suit — would conflict with locked pants
  if (lockedSlots['pants'] && selected['pants']) return ['blazers', 'jackets'];
  if (currentStyle === 'casual')  return ['blazers', 'jackets'];
  if (currentStyle === 'formal')  return ['suits', 'blazers'];
  return ['blazers', 'suits']; // smart casual — blazers preferred
}

// ── Core scoring + picking ────────────────────────────────────────────────────

// Find best item for a slot across given categories
// random=false → always pick highest scorer (for initial fill)
// random=true  → pick randomly from top star tier (for shuffle variety)
function bestForSlot(cats, excludeKey, random = false) {
  const canvas = buildCanvas();
  const scored = [];

  cats.forEach(cat => {
    (catalog[cat] || []).forEach(item => {
      const key = item.file || item.name;
      if (excludeKey && key === excludeKey) return;

      const result = window.scoreItem ? window.scoreItem(item, cat, canvas, currentStyle) : null;
      if (!result || result.excluded) return;
      scored.push({ item, cat, stars: result.stars ?? 0, score: result.score ?? 0 });
    });
  });

  if (scored.length === 0) return null;

  if (random) {
    // Pick randomly from top available star tier
    for (const minStars of [3, 2, 1, 0]) {
      const tier = scored.filter(s => s.stars >= minStars);
      if (tier.length > 0) {
        const pick = tier[Math.floor(Math.random() * tier.length)];
        return { item: pick.item, cat: pick.cat };
      }
    }
  } else {
    // Pick deterministically — highest score
    scored.sort((a, b) => b.score - a.score);
    return { item: scored[0].item, cat: scored[0].cat };
  }

  return null;
}

// Fill a single slot with the best available item
function fillBestForSlot(slot, cats, excludeKey, random = false) {
  if (lockedSlots[slot]) return;                                          // locked — skip
  if (slot === 'pants' && selected['outer']?.cat === 'suits') return;    // suit mode — no pants

  const best = bestForSlot(cats, excludeKey, random);
  if (!best) return;

  selected[slot] = { ...best.item, cat: best.cat };
  if (best.item.swatch) fillSwatchSlot(slot, best.item);
  else fillSlot(slot, best.cat, best.item);
  updateSuitMode();
}

// ── Swipe navigation ─────────────────────────────────────────────────────────

const swipeSnapshots = {}; // slot → [{ item, cat }] ranked list
const swipeIndex     = {}; // slot → current position in snapshot

// Which catalog category to use for a given slot when swiping
function catForSlot(slot) {
  if (slot === 'outer') {
    // Stay within whatever category is currently in the slot
    return selected['outer']?.cat || outerCats()[0];
  }
  return { top: 'tops', pants: 'pants', belts: 'belts', shoes: 'shoes' }[slot];
}

// Build and freeze the ranked item list for a slot
function buildSwipeSnapshot(slot) {
  const cat = catForSlot(slot);
  if (!cat || !catalog[cat]) return;

  const canvas = buildCanvas();
  const scored = (catalog[cat] || [])
    .map(item => {
      const result = window.scoreItem ? window.scoreItem(item, cat, canvas, currentStyle) : null;
      return { item, cat, stars: result?.stars ?? 0, score: result?.score ?? 0, excluded: result?.excluded ?? false };
    })
    .filter(s => !s.excluded)
    .sort((a, b) => b.score - a.score);

  swipeSnapshots[slot] = scored.map(s => ({ item: s.item, cat: s.cat }));

  // Set index to currently selected item
  const currentKey = selected[slot] ? (selected[slot].file || selected[slot].name) : null;
  const idx = currentKey
    ? swipeSnapshots[slot].findIndex(s => (s.item.file || s.item.name) === currentKey)
    : 0;
  swipeIndex[slot] = idx >= 0 ? idx : 0;
}

// Swipe a slot forward (next) or backward (prev)
function swipeSlot(slot, direction) {
  if (lockedSlots[slot]) return;

  // Build snapshot on first swipe
  if (!swipeSnapshots[slot]) buildSwipeSnapshot(slot);

  const snapshot = swipeSnapshots[slot];
  if (!snapshot || snapshot.length === 0) return;

  const len = snapshot.length;
  const currentIdx = swipeIndex[slot] ?? 0;
  const newIdx = direction === 'next'
    ? (currentIdx + 1) % len
    : (currentIdx - 1 + len) % len;

  swipeIndex[slot] = newIdx;

  const { item, cat } = snapshot[newIdx];
  selected[slot] = { ...item, cat };

  if (item.swatch) fillSwatchSlot(slot, item);
  else fillSlot(slot, cat, item);

  updateSuitMode();
  refreshAllSlotStars();
  // Deliberately don't re-render carousel — keep it stable while swiping
}

// Reset all snapshots (call when canvas context changes)
function resetAllSwipeSnapshots() {
  Object.keys(swipeSnapshots).forEach(k => delete swipeSnapshots[k]);
  Object.keys(swipeIndex).forEach(k => delete swipeIndex[k]);
}

// ── Action functions ──────────────────────────────────────────────────────────

function completeOutfit() {
  resetAllSwipeSnapshots();
  const slots = ['outer', 'pants', 'top', 'shoes', 'belts'];
  const cats  = {
    outer: outerCats(),
    pants: ['pants'],
    top:   ['tops'],
    shoes: ['shoes'],
    belts: ['belts'],
  };

  // Check if canvas is fully filled (all non-locked slots have items)
  // In suit mode, pants slot is hidden — exclude it from the full check
  const inSuitMode = selected['outer']?.cat === 'suits';
  const allFilled = slots.every(slot => {
    if (slot === 'pants' && inSuitMode) return true;
    return selected[slot] || lockedSlots[slot];
  });

  if (allFilled) {
    // Canvas full — randomly pick from top tier for each unlocked slot
    const prev = {};
    slots.forEach(slot => {
      if (!lockedSlots[slot] && selected[slot]) {
        prev[slot] = selected[slot].file || selected[slot].name;
        delete selected[slot];
        clearSlot(slot);
      }
    });
    updateSuitMode();
    slots.forEach(slot => fillBestForSlot(slot, cats[slot], prev[slot], true));
  } else {
    // Fill empty slots deterministically (best match)
    slots.forEach(slot => fillBestForSlot(slot, cats[slot], null, false));
  }

  refreshAllSlotStars();
  renderCarousel(currentCat, currentSub, currentSubSub);
}

// Shuffle just the current category's slot
function shuffleCategory(cat) {
  const slotKey = SLOT_MAP[cat];
  if (!slotKey) return;
  if (lockedSlots[slotKey]) return;   // respect lock

  // Always search current tab's category only
  const cats = [cat];

  if (selected[slotKey]) {
    // Item exists — randomly pick from top tier excluding current
    const excludeKey = selected[slotKey].file || selected[slotKey].name;
    delete selected[slotKey];
    clearSlot(slotKey);
    updateSuitMode();
    fillBestForSlot(slotKey, cats, excludeKey, true);
  } else {
    // Nothing selected — autofill with best item
    fillBestForSlot(slotKey, cats, null, false);
  }

  refreshAllSlotStars();
  renderCarousel(currentCat, currentSub, currentSubSub);
}

function clearOutfit() {
  resetAllSwipeSnapshots();
  ['outer', 'pants', 'top', 'shoes', 'belts'].forEach(slot => {
    delete selected[slot];
    delete lockedSlots[slot];
    clearSlot(slot);
  });
  updateSuitMode();
  renderCarousel(currentCat, currentSub, currentSubSub);
}
