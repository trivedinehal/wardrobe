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

// Outer categories to search — driven by outfit type, with locked items as constraints
function outerCats() {
  // If outer is locked, stay within that locked item's category
  if (lockedSlots['outer'] && selected['outer']) {
    return [selected['outer'].cat];
  }

  // Use outfit type as primary signal — takes priority over locked pants
  const type = currentOutfitType;
  if (type === 'suit')    return ['suits'];
  if (type === 'no-outer') return [];
  if (type && type.startsWith('blazer')) return ['blazers'];
  if (type && type.startsWith('jacket')) return ['jackets'];

  // Fallback to style if no outfit type set
  if (currentStyle === 'casual')  return ['blazers', 'jackets'];
  if (currentStyle === 'formal')  return ['suits', 'blazers'];
  return ['blazers', 'suits'];
}

// ── Core scoring + picking ────────────────────────────────────────────────────

// Returns pants sub-category filter function based on outfit type
function getPantsFilter() {
  const type = currentOutfitType;
  if (!type) return null;
  if (type.includes('formal-trouser')) return item => item.sub === 'Dress Trousers';
  if (type.includes('chinos'))         return item => item.sub === 'Chinos';
  if (type.includes('jeans'))          return item => item.sub === 'Jeans';
  return null; // no-outer or suit — no pants filter needed
}

// Find best item for a slot across given categories
// random=false → always pick highest scorer (for initial fill)
// random=true  → pick randomly from top star tier (for shuffle variety)
// filter → optional function to pre-filter items (e.g. pants sub-category)
function bestForSlot(cats, excludeKey, random = false, filter = null) {
  const canvas = buildCanvas();
  const scored = [];

  cats.forEach(cat => {
    (catalog[cat] || []).forEach(item => {
      const key = item.file || item.name;
      if (excludeKey && key === excludeKey) return;
      if (filter && !filter(item)) return;

      const result = window.scoreItem ? window.scoreItem(item, cat, canvas, currentStyle, currentOutfitType) : null;
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
function fillBestForSlot(slot, cats, excludeKey, random = false, filter = null) {
  if (lockedSlots[slot]) return;                                          // locked — skip
  if (slot === 'pants' && selected['outer']?.cat === 'suits') return;    // suit mode — no pants
  if (slot === 'outer' && cats.length === 0) return;                     // no-outer mode — skip

  const best = bestForSlot(cats, excludeKey, random, filter);
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
      const result = window.scoreItem ? window.scoreItem(item, cat, canvas, currentStyle, currentOutfitType) : null;
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

// Determine fill order based on locked slots — locked items are anchors,
// unlocked slots fill in order of most locked neighbours first so each pick
// has the richest possible scoring context.
function getFillOrder() {
  // Adjacency for scoring (belt always last — it depends on the main outfit)
  const adjacent = {
    outer: ['pants', 'top'],
    pants: ['outer', 'shoes'],
    top:   ['outer', 'pants'],
    shoes: ['pants', 'outer'],
  };
  const defaultPriority = { outer: 0, pants: 1, top: 2, shoes: 3 };
  const main = ['outer', 'pants', 'top', 'shoes'];

  const locked = new Set(main.filter(s => lockedSlots[s]));
  const remaining = new Set(main.filter(s => !lockedSlots[s]));
  const placed = new Set(locked);
  const result = [];

  while (remaining.size > 0) {
    let best = null, bestCount = -1;
    for (const slot of remaining) {
      const count = (adjacent[slot] || []).filter(n => placed.has(n)).length;
      if (best === null || count > bestCount || (count === bestCount && defaultPriority[slot] < defaultPriority[best])) {
        best = slot; bestCount = count;
      }
    }
    placed.add(best);
    remaining.delete(best);
    result.push(best);
  }

  if (!lockedSlots['belts']) result.push('belts');
  return result;
}

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
  const inSuitMode = selected['outer']?.cat === 'suits';
  const noOuter = currentOutfitType === 'no-outer';
  const allFilled = slots.every(slot => {
    if (slot === 'pants' && inSuitMode) return true;
    if (slot === 'outer' && noOuter) return true;
    return selected[slot] || lockedSlots[slot];
  });

  const fillOrder = getFillOrder();

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
    const pantsFilter = getPantsFilter();
    fillOrder.forEach(slot => fillBestForSlot(slot, cats[slot], prev[slot], true, slot === 'pants' ? pantsFilter : null));
  } else {
    // Fill empty slots deterministically (best match)
    const pantsFilter = getPantsFilter();
    fillOrder.forEach(slot => fillBestForSlot(slot, cats[slot], null, false, slot === 'pants' ? pantsFilter : null));
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

  const filter = slotKey === 'pants' ? getPantsFilter() : null;

  if (selected[slotKey]) {
    // Item exists — randomly pick from top tier excluding current
    const excludeKey = selected[slotKey].file || selected[slotKey].name;
    delete selected[slotKey];
    clearSlot(slotKey);
    updateSuitMode();
    fillBestForSlot(slotKey, cats, excludeKey, true, filter);
  } else {
    // Nothing selected — autofill with best item
    fillBestForSlot(slotKey, cats, null, false, filter);
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

// ── Top type hint ─────────────────────────────────────────────────────────────

// Returns scored top type suggestions based on style, outer, and pants on canvas.
// Each entry: { label, score } — only types that work are included, ordered by score desc.
function getTopTypeHint() {
  const style = currentStyle;
  const outerItem = selected['outer'];
  const pantsItem = selected['pants'];

  // Derive outer type: suit / blazer / jacket / none
  const outerType = !outerItem ? 'none'
    : outerItem.cat === 'suits'   ? 'suit'
    : outerItem.cat === 'blazers' ? 'blazer'
    : outerItem.cat === 'jackets' ? 'jacket'
    : 'none';

  // Derive pants type: formal-trousers / chinos / jeans / linen / utility
  const pantsType = !pantsItem ? null
    : pantsItem.sub === 'Dress Trousers'  ? 'formal-trousers'
    : pantsItem.sub === 'Chinos'          ? 'chinos'
    : pantsItem.sub === 'Jeans'           ? 'jeans'
    : pantsItem.fabric === 'linen'        ? 'linen'
    : pantsItem.fabric === 'utility'      ? 'utility'
    : null;

  // Scoring table: [style, outerType, pantsType] → { dressShirt, shirt, polo, tshirt }
  // null pantsType (no pants on canvas) returns null — no hint yet
  if (!pantsType && outerType === 'none') return null;

  const scores = lookupTopScores(style, outerType, pantsType);
  if (!scores) return null;

  const result = [];
  if (scores.dressShirt) result.push({ label: 'Dress shirt', score: scores.dressShirt });
  if (scores.shirt)      result.push({ label: 'Shirt',       score: scores.shirt });
  if (scores.polo)       result.push({ label: 'Polo',        score: scores.polo });
  if (scores.tshirt)     result.push({ label: 'T-Shirt',     score: scores.tshirt });

  return result.sort((a, b) => b.score - a.score);
}

function lookupTopScores(style, outer, pants) {
  // Returns { dressShirt, shirt, polo, tshirt } — omit a key to exclude that type
  // Scores out of 10. Only include types that genuinely work.

  if (style === 'formal') {
    if (outer === 'suit')   return { dressShirt: 10 };
    if (outer === 'blazer') return { dressShirt: 9, shirt: 5 };
    if (outer === 'none')   return { dressShirt: 9, shirt: 5 };
  }

  if (style === 'semi-formal') {
    if (outer === 'blazer' && pants === 'formal-trousers') return { dressShirt: 8, shirt: 6 };
    if (outer === 'blazer' && pants === 'chinos')          return { dressShirt: 5, shirt: 9, polo: 4 };
    if (outer === 'jacket' && pants === 'formal-trousers') return { dressShirt: 6, shirt: 8 };
    if (outer === 'none'   && pants === 'formal-trousers') return { dressShirt: 8, shirt: 6 };
    if (outer === 'none'   && pants === 'chinos')          return { dressShirt: 4, shirt: 9, polo: 5 };
  }

  if (style === 'smart-casual') {
    if (outer === 'blazer' && pants === 'chinos') return { shirt: 9, polo: 7 };
    if (outer === 'blazer' && pants === 'jeans')  return { shirt: 8, polo: 9 };
    if (outer === 'jacket' && pants === 'chinos') return { shirt: 8, polo: 7, tshirt: 4 };
    if (outer === 'jacket' && pants === 'jeans')  return { shirt: 6, polo: 9, tshirt: 7 };
    if (outer === 'none'   && pants === 'chinos') return { shirt: 9, polo: 7, tshirt: 3 };
    if (outer === 'none'   && pants === 'jeans')  return { shirt: 6, polo: 8, tshirt: 7 };
  }

  if (style === 'casual') {
    if (outer === 'jacket' && pants === 'jeans')   return { shirt: 5, polo: 8, tshirt: 9 };
    if (outer === 'none'   && pants === 'jeans')   return { shirt: 4, polo: 7, tshirt: 10 };
    if (outer === 'none'   && pants === 'linen')   return { shirt: 3, polo: 6, tshirt: 10 };
    if (outer === 'none'   && pants === 'utility') return { polo: 5, tshirt: 10 };
  }

  return null;
}

// ── Tuck style hint ───────────────────────────────────────────────────────────

// Returns tuck scores for a given top type + canvas state.
// Each entry: { label, score } — only tuck styles that work are included, ordered by score desc.
function getTuckHint(topType) {
  if (!topType) return null;

  // Dress shirt and t-shirt are always definitive
  if (topType === 'dressShirt') return [{ label: 'Full tuck', score: 10 }];
  if (topType === 'tshirt')     return [{ label: 'Untucked',  score: 10 }];

  const style = currentStyle;
  const outerItem = selected['outer'];
  const pantsItem = selected['pants'];

  const outerType = !outerItem ? 'none'
    : outerItem.cat === 'suits'   ? 'suit'
    : outerItem.cat === 'blazers' ? 'blazer'
    : outerItem.cat === 'jackets' ? 'jacket'
    : 'none';

  const pantsType = !pantsItem ? null
    : pantsItem.sub === 'Dress Trousers'  ? 'formal-trousers'
    : pantsItem.sub === 'Chinos'          ? 'chinos'
    : pantsItem.sub === 'Jeans'           ? 'jeans'
    : pantsItem.fabric === 'linen'        ? 'linen'
    : pantsItem.fabric === 'utility'      ? 'utility'
    : null;

  const scores = topType === 'polo'
    ? lookupPoloTuckScores(style, outerType, pantsType)
    : lookupShirtTuckScores(style, outerType, pantsType);

  if (!scores) return null;

  const result = [];
  if (scores.fullTuck)    result.push({ label: 'Full tuck',    score: scores.fullTuck });
  if (scores.frenchTuck)  result.push({ label: 'French tuck',  score: scores.frenchTuck });
  if (scores.untucked)    result.push({ label: 'Untucked',     score: scores.untucked });

  return result.sort((a, b) => b.score - a.score);
}

function lookupShirtTuckScores(style, outer, pants) {
  if (style === 'formal') {
    if (outer === 'suit')   return { fullTuck: 10 };
    if (outer === 'blazer') return { fullTuck: 9, frenchTuck: 4 };
    if (outer === 'none')   return { fullTuck: 9, frenchTuck: 4 };
  }

  if (style === 'semi-formal') {
    if (outer === 'blazer' && pants === 'formal-trousers') return { fullTuck: 8, frenchTuck: 5 };
    if (outer === 'blazer' && pants === 'chinos')          return { frenchTuck: 9, fullTuck: 5, untucked: 3 };
    if (outer === 'jacket' && pants === 'formal-trousers') return { fullTuck: 7, frenchTuck: 6 };
    if (outer === 'none'   && pants === 'formal-trousers') return { fullTuck: 8, frenchTuck: 5 };
    if (outer === 'none'   && pants === 'chinos')          return { frenchTuck: 9, fullTuck: 4, untucked: 4 };
  }

  if (style === 'smart-casual') {
    if (outer === 'blazer' && pants === 'chinos') return { frenchTuck: 9, fullTuck: 4, untucked: 5 };
    if (outer === 'blazer' && pants === 'jeans')  return { frenchTuck: 8, untucked: 7, fullTuck: 3 };
    if (outer === 'jacket' && pants === 'chinos') return { frenchTuck: 8, untucked: 6, fullTuck: 3 };
    if (outer === 'jacket' && pants === 'jeans')  return { untucked: 8, frenchTuck: 7 };
    if (outer === 'none'   && pants === 'chinos') return { frenchTuck: 9, untucked: 5, fullTuck: 3 };
    if (outer === 'none'   && pants === 'jeans')  return { untucked: 9, frenchTuck: 7 };
  }

  if (style === 'casual') {
    if (outer === 'jacket' && pants === 'jeans')   return { untucked: 9, frenchTuck: 5 };
    if (outer === 'none'   && pants === 'jeans')   return { untucked: 10, frenchTuck: 4 };
    if (outer === 'none'   && pants === 'linen')   return { untucked: 10, frenchTuck: 3 };
    if (outer === 'none'   && pants === 'utility') return { untucked: 10 };
  }

  return null;
}

function lookupPoloTuckScores(style, outer, pants) {
  // Polo is never french tucked — only tucked or untucked
  if (style === 'semi-formal') {
    if (outer === 'blazer' && pants === 'chinos')          return { fullTuck: 9, untucked: 5 };
    if (outer === 'none'   && pants === 'chinos')          return { fullTuck: 8, untucked: 6 };
  }

  if (style === 'smart-casual') {
    if (outer === 'blazer' && pants === 'chinos') return { fullTuck: 8, untucked: 6 };
    if (outer === 'blazer' && pants === 'jeans')  return { fullTuck: 7, untucked: 8 };
    if (outer === 'jacket' && pants === 'chinos') return { fullTuck: 7, untucked: 7 };
    if (outer === 'jacket' && pants === 'jeans')  return { fullTuck: 5, untucked: 9 };
    if (outer === 'none'   && pants === 'chinos') return { untucked: 9, fullTuck: 4 };
    if (outer === 'none'   && pants === 'jeans')  return { untucked: 10 };
  }

  // Casual — always untucked
  return { untucked: 10 };
}
