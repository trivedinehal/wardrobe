// ============================================================
// matching.js — v2 rebuilt matching engine
// ============================================================
// Exposes:
//   window.MATCH_CONFIG  — all rules as structured data
//   window.scoreItem(candidate, candidateCat, canvas, style, outfitType)
//
// Score model (0–10 scale):
//   Context fit (0–5): how well item fits style + outfit type combined
//   Harmony    (0–5): how well item works visually with canvas items
//   Final = contextFit + avgHarmony  (or ×2 if one component is missing)
//   Stars: 8+ = ⭐⭐⭐,  5–7 = ⭐⭐,  3–4 = ⭐,  <3 = 0
// ============================================================

(function () {

  // ─── Config ───────────────────────────────────────────────────────────────────

  const MATCH_CONFIG = {

    thresholds: { three: 8, two: 5, one: 3 },

    // ── Context fit tables ──────────────────────────────────────────────────────
    // Key format: 'style/outfitType'
    // null = excluded (✕),  0–5 = fit score
    //
    // Top item types:   'dress-shirt' (Formal/Semi-Formal in formality array)
    //                   'casual-shirt' (Shirts sub, no Formal)
    //                   't-shirt'
    //
    // Pants item types: 'dress-trousers', 'chinos', 'smart-denim', 'casual-denim', 'relaxed'
    //
    // Shoe item types:  'dress-shoe', 'chelsea-boot', 'loafer', 'sneaker', 'athletic'
    //
    // Outer item types: 'suit-wool', 'suit-linen', 'formal-blazer', 'casual-blazer'

    contextFit: {

      tops: {
        'formal/suit':                       { 'dress-shirt': 5, 'casual-shirt': null, 't-shirt': null },
        'formal/blazer-formal-trouser':      { 'dress-shirt': 5, 'casual-shirt': 1,    't-shirt': null },
        'formal/no-outer':                   { 'dress-shirt': 5, 'casual-shirt': 2,    't-shirt': null },
        'semi-formal/blazer-formal-trouser': { 'dress-shirt': 5, 'casual-shirt': 3,    't-shirt': null },
        'semi-formal/blazer-chinos':         { 'dress-shirt': 4, 'casual-shirt': 5,    't-shirt': null },
        'semi-formal/jacket-formal-trouser': { 'dress-shirt': 4, 'casual-shirt': 3,    't-shirt': null },
        'semi-formal/no-outer':              { 'dress-shirt': 4, 'casual-shirt': 4,    't-shirt': null },
        'smart-casual/blazer-chinos':        { 'dress-shirt': 2, 'casual-shirt': 5,    't-shirt': 3   },
        'smart-casual/blazer-jeans':         { 'dress-shirt': 1, 'casual-shirt': 5,    't-shirt': 4   },
        'smart-casual/jacket-chinos':        { 'dress-shirt': 2, 'casual-shirt': 5,    't-shirt': 3   },
        'smart-casual/jacket-jeans':         { 'dress-shirt': 1, 'casual-shirt': 4,    't-shirt': 4   },
        'smart-casual/no-outer':             { 'dress-shirt': 1, 'casual-shirt': 5,    't-shirt': 4   },
        'casual/jacket-jeans':               { 'dress-shirt': 1, 'casual-shirt': 3,    't-shirt': 5   },
        'casual/no-outer':                   { 'dress-shirt': 1, 'casual-shirt': 3,    't-shirt': 5   },
      },

      pants: {
        // formal/suit → pants hidden in suit mode, no scoring
        'formal/blazer-formal-trouser':      { 'dress-trousers': 5, 'chinos': 1,    'smart-denim': null, 'casual-denim': null, 'relaxed': null },
        'formal/no-outer':                   { 'dress-trousers': 5, 'chinos': 2,    'smart-denim': null, 'casual-denim': null, 'relaxed': null },
        'semi-formal/blazer-formal-trouser': { 'dress-trousers': 5, 'chinos': 2,    'smart-denim': null, 'casual-denim': null, 'relaxed': null },
        'semi-formal/blazer-chinos':         { 'dress-trousers': 2, 'chinos': 5,    'smart-denim': 1,    'casual-denim': null, 'relaxed': null },
        'semi-formal/jacket-formal-trouser': { 'dress-trousers': 5, 'chinos': 2,    'smart-denim': null, 'casual-denim': null, 'relaxed': null },
        'semi-formal/no-outer':              { 'dress-trousers': 3, 'chinos': 5,    'smart-denim': 2,    'casual-denim': null, 'relaxed': null },
        'smart-casual/blazer-chinos':        { 'dress-trousers': 2, 'chinos': 5,    'smart-denim': 2,    'casual-denim': null, 'relaxed': null },
        'smart-casual/blazer-jeans':         { 'dress-trousers': null, 'chinos': 2, 'smart-denim': 5,    'casual-denim': 2,    'relaxed': null },
        'smart-casual/jacket-chinos':        { 'dress-trousers': 2, 'chinos': 5,    'smart-denim': 2,    'casual-denim': null, 'relaxed': null },
        'smart-casual/jacket-jeans':         { 'dress-trousers': null, 'chinos': 2, 'smart-denim': 5,    'casual-denim': 3,    'relaxed': null },
        'smart-casual/no-outer':             { 'dress-trousers': 2, 'chinos': 4,    'smart-denim': 4,    'casual-denim': 2,    'relaxed': 1   },
        'casual/jacket-jeans':               { 'dress-trousers': null, 'chinos': 1, 'smart-denim': 3,    'casual-denim': 5,    'relaxed': 2   },
        'casual/no-outer':                   { 'dress-trousers': null, 'chinos': 2, 'smart-denim': 3,    'casual-denim': 5,    'relaxed': 4   },
      },

      shoes: {
        // athletic is always null (excluded from all outfit scoring)
        'formal/suit':                       { 'dress-shoe': 5, 'chelsea-boot': 4, 'loafer': 2,    'sneaker': null, 'athletic': null },
        'formal/blazer-formal-trouser':      { 'dress-shoe': 5, 'chelsea-boot': 4, 'loafer': 3,    'sneaker': null, 'athletic': null },
        'formal/no-outer':                   { 'dress-shoe': 4, 'chelsea-boot': 4, 'loafer': 3,    'sneaker': null, 'athletic': null },
        'semi-formal/blazer-formal-trouser': { 'dress-shoe': 5, 'chelsea-boot': 5, 'loafer': 3,    'sneaker': null, 'athletic': null },
        'semi-formal/blazer-chinos':         { 'dress-shoe': 3, 'chelsea-boot': 5, 'loafer': 5,    'sneaker': null, 'athletic': null },
        'semi-formal/jacket-formal-trouser': { 'dress-shoe': 4, 'chelsea-boot': 5, 'loafer': 3,    'sneaker': null, 'athletic': null },
        'semi-formal/no-outer':              { 'dress-shoe': 3, 'chelsea-boot': 4, 'loafer': 4,    'sneaker': 1,    'athletic': null },
        'smart-casual/blazer-chinos':        { 'dress-shoe': 2, 'chelsea-boot': 4, 'loafer': 5,    'sneaker': 2,    'athletic': null },
        'smart-casual/blazer-jeans':         { 'dress-shoe': 1, 'chelsea-boot': 5, 'loafer': 4,    'sneaker': 3,    'athletic': null },
        'smart-casual/jacket-chinos':        { 'dress-shoe': 2, 'chelsea-boot': 4, 'loafer': 5,    'sneaker': 3,    'athletic': null },
        'smart-casual/jacket-jeans':         { 'dress-shoe': 1, 'chelsea-boot': 4, 'loafer': 3,    'sneaker': 5,    'athletic': null },
        'smart-casual/no-outer':             { 'dress-shoe': 2, 'chelsea-boot': 4, 'loafer': 4,    'sneaker': 4,    'athletic': null },
        'casual/jacket-jeans':               { 'dress-shoe': null, 'chelsea-boot': 3, 'loafer': 3,  'sneaker': 5,    'athletic': null },
        'casual/no-outer':                   { 'dress-shoe': null, 'chelsea-boot': 3, 'loafer': 3,  'sneaker': 5,    'athletic': null },
      },

      outer: {
        // item types: 'suit-wool', 'suit-linen', 'formal-blazer', 'casual-blazer'
        // no-outer contexts are not listed — outer items return null (no score, not excluded)
        'formal/suit':                       { 'suit-wool': 5, 'suit-linen': 2,    'formal-blazer': null, 'casual-blazer': null },
        'formal/blazer-formal-trouser':      { 'suit-wool': null, 'suit-linen': null, 'formal-blazer': 5,  'casual-blazer': 1   },
        'semi-formal/blazer-formal-trouser': { 'suit-wool': null, 'suit-linen': null, 'formal-blazer': 5,  'casual-blazer': 3   },
        'semi-formal/blazer-chinos':         { 'suit-wool': null, 'suit-linen': 2,    'formal-blazer': 4,  'casual-blazer': 5   },
        'semi-formal/jacket-formal-trouser': { 'suit-wool': null, 'suit-linen': null, 'formal-blazer': 3,  'casual-blazer': 4   },
        'smart-casual/blazer-chinos':        { 'suit-wool': null, 'suit-linen': 2,    'formal-blazer': 3,  'casual-blazer': 5   },
        'smart-casual/blazer-jeans':         { 'suit-wool': null, 'suit-linen': 1,    'formal-blazer': 2,  'casual-blazer': 5   },
        'smart-casual/jacket-chinos':        { 'suit-wool': null, 'suit-linen': 2,    'formal-blazer': 2,  'casual-blazer': 5   },
        'smart-casual/jacket-jeans':         { 'suit-wool': null, 'suit-linen': 1,    'formal-blazer': 1,  'casual-blazer': 5   },
        'casual/jacket-jeans':               { 'suit-wool': null, 'suit-linen': null, 'formal-blazer': null, 'casual-blazer': 5 },
      },
    },

    // Belt width vs pants loop width (hard rules)
    beltVsPants: {
      'narrow': { label: 'Narrow loops', scores: { 'thin': 3, 'medium': 1, 'wide': null } },
      'wide':   { label: 'Wide loops',   scores: { 'wide': 3, 'medium': 2, 'thin': 1   } },
    },

    // Hard exclusion rules (displayed on matching-logic.html)
    exclusions: [
      { id: 'tshirt-formal',         pair: 'Top + Context',   reason: 'T-shirts excluded from Formal and Semi-Formal contexts — a collar is required' },
      { id: 'plaid-suit',            pair: 'Outer + Top',     reason: 'Plaid shirt clashes with the formality of a suit' },
      { id: 'pattern-on-pattern',    pair: 'Outer + Top',     reason: 'Two patterned items together — too busy' },
      { id: 'utility-pants-outer',   pair: 'Pants + Outer',   reason: 'Cargo / utility pants with any blazer or jacket' },
      { id: 'athletic-shoes',        pair: 'Shoes',           reason: 'Athletic shoes are excluded from all outfit scoring' },
      { id: 'elastic-waist-belt',    pair: 'Belt + Pants',    reason: 'Elastic waist pants have no belt loop' },
      { id: 'wide-belt-narrow-loop', pair: 'Belt + Pants',    reason: 'Wide belt will not fit through narrow formal trouser loops' },
      { id: 'black-shoe-warm-belt',  pair: 'Belt + Shoes',    reason: 'Black shoes must pair with a black belt' },
      { id: 'warm-shoe-black-belt',  pair: 'Belt + Shoes',    reason: 'Brown / tan shoes must pair with a warm belt' },
    ],

  };

  window.MATCH_CONFIG = MATCH_CONFIG;

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  function toneVal(t) { return t === 'light' ? 1 : t === 'medium' ? 2 : 3; }
  function isNeutral(cf) { return cf === 'neutral'; }
  function isSuit(item) { return item && item.cat === 'suits'; }

  function getTopType(item) {
    if (item.sub === 'T-Shirts') return 't-shirt';
    if (item.formality.includes('Formal') || item.formality.includes('Semi-Formal')) return 'dress-shirt';
    return 'casual-shirt';
  }

  function getPantsType(item) {
    if (item.sub === 'Dress Trousers') return 'dress-trousers';
    if (item.fabric === 'denim') return item.formality.includes('Smart Casual') ? 'smart-denim' : 'casual-denim';
    if (item.fabric === 'chino' || item.fabric === 'cotton') return 'chinos';
    return 'relaxed';
  }

  function getOuterType(item) {
    if (isSuit(item)) return item.fabric === 'linen' ? 'suit-linen' : 'suit-wool';
    return item.sub === 'Formal' ? 'formal-blazer' : 'casual-blazer';
  }

  // ─── Context fit ──────────────────────────────────────────────────────────────

  function getContextFit(item, candidateCat, context) {
    const outfitType = context.split('/')[1];
    const isOuter = candidateCat === 'blazers' || candidateCat === 'suits' || candidateCat === 'jackets';

    // Outer in no-outer context → null score (not excluded, just no guidance)
    if (isOuter && outfitType === 'no-outer') return undefined;

    // Pants in suit context → hidden in UI, no scoring
    if (candidateCat === 'pants' && outfitType === 'suit') return undefined;

    let table, type;
    if (candidateCat === 'tops')       { table = MATCH_CONFIG.contextFit.tops[context];  type = getTopType(item); }
    else if (candidateCat === 'pants') { table = MATCH_CONFIG.contextFit.pants[context]; type = getPantsType(item); }
    else if (candidateCat === 'shoes') { table = MATCH_CONFIG.contextFit.shoes[context]; type = item.style; }
    else if (isOuter)                  { table = MATCH_CONFIG.contextFit.outer[context]; type = getOuterType(item); }

    if (!table) return undefined; // context not in table
    const score = table[type];
    return score === undefined ? null : score; // undefined type → null (excluded)
  }

  // ─── Harmony scoring ─────────────────────────────────────────────────────────

  function harmonyScore(a, b) {
    let s = 0;
    // Tone contrast — difference is good in menswear
    const d = Math.abs(toneVal(a.tone) - toneVal(b.tone));
    s += d === 2 ? 2 : d === 1 ? 1 : 0;
    // Colour harmony — neutral items are universally safe
    if (isNeutral(a.colorFamily) || isNeutral(b.colorFamily)) s += 2;
    else if (a.colorFamily === b.colorFamily) s += 1;
    else s += 1; // contrasting non-neutrals — fine
    // Pattern bonus — one patterned item against a solid reads well
    if (a.pattern && b.pattern) {
      const aPat = a.pattern !== 'solid';
      const bPat = b.pattern !== 'solid';
      if (aPat !== bPat) s += 1; // one pattern, one solid
    }
    return Math.min(s, 5);
  }

  // ─── Exclusion check ──────────────────────────────────────────────────────────

  function isExcluded(candidate, candidateCat, candidateSlot, canvas, context, ctxFit) {
    // Athletic shoes always excluded
    if (candidateCat === 'shoes' && candidate.style === 'athletic') return true;

    // Context-driven exclusion (ctxFit === null means excluded by context table)
    if (ctxFit === null && context) return true;

    // Pairwise — top vs outer
    if (candidateSlot === 'top' && canvas.outer) {
      if (isSuit(canvas.outer) && candidate.pattern === 'plaid') return true;
      if (canvas.outer.pattern !== 'solid' && candidate.pattern && candidate.pattern !== 'solid') return true;
    }

    // Pairwise — outer vs top/pants
    if (candidateSlot === 'outer') {
      if (canvas.top && candidate.pattern !== 'solid' && canvas.top.pattern && canvas.top.pattern !== 'solid') return true;
      if (canvas.pants && canvas.pants.fabric === 'utility') return true;
    }

    // Pairwise — utility pants vs outer
    if (candidateSlot === 'pants' && canvas.outer && candidate.fabric === 'utility') return true;

    // Belt pairwise exclusions
    if (candidateSlot === 'belts') {
      if (canvas.pants) {
        if (canvas.pants.beltLoop === 'none') return true;
        if (canvas.pants.beltLoop === 'narrow' && candidate.width === 'wide') return true;
      }
      if (canvas.shoes) {
        const shoeBlack = isNeutral(canvas.shoes.colorFamily) && canvas.shoes.color.toLowerCase().includes('black');
        const shoeWarm  = canvas.shoes.colorFamily === 'warm';
        const beltBlack = isNeutral(candidate.colorFamily) && candidate.color.toLowerCase().includes('black');
        const beltWarm  = candidate.colorFamily === 'warm';
        if (shoeBlack && beltWarm) return true;
        if (shoeWarm  && beltBlack) return true;
      }
    }

    return false;
  }

  // ─── Belt scoring (pairwise) ─────────────────────────────────────────────────

  function scoreBelt(belt, canvas) {
    let score = 0;
    let pairs = 0;

    if (canvas.shoes) {
      const td = Math.abs(toneVal(belt.tone) - toneVal(canvas.shoes.tone));
      score += td === 0 ? 5 : td === 1 ? 4 : 2;
      if (belt.material === 'leather') score += 1;
      pairs++;
    }

    if (canvas.pants && canvas.pants.beltLoop !== 'none') {
      const loopKey = canvas.pants.beltLoop === 'narrow' ? 'narrow' : 'wide';
      const pts = MATCH_CONFIG.beltVsPants[loopKey].scores[belt.width];
      if (pts !== null && pts !== undefined) {
        score += pts;
        pairs++;
      }
    }

    if (pairs === 0) return null;
    return score; // raw 0–9 range, same scale as combined scores
  }

  // ─── Stars ────────────────────────────────────────────────────────────────────

  function toStars(score) {
    if (score >= MATCH_CONFIG.thresholds.three) return 3;
    if (score >= MATCH_CONFIG.thresholds.two)   return 2;
    if (score >= MATCH_CONFIG.thresholds.one)   return 1;
    return 0;
  }

  // ─── Main export ──────────────────────────────────────────────────────────────

  window.scoreItem = function (candidate, candidateCat, canvas, style, outfitType) {

    const slotMap = { tops: 'top', pants: 'pants', belts: 'belts', shoes: 'shoes', blazers: 'outer', suits: 'outer', jackets: 'outer' };
    const candidateSlot = slotMap[candidateCat];
    const context = (style && outfitType) ? `${style}/${outfitType}` : null;
    const filled = [canvas.outer, canvas.top, canvas.pants, canvas.belts, canvas.shoes].filter(Boolean);
    const hasCanvas = filled.length > 0;
    const hasContext = !!context;

    if (!hasCanvas && !hasContext) return { stars: null, excluded: false };

    // Pants hidden in suit mode
    if (candidateCat === 'pants' && outfitType === 'suit') return { stars: null, excluded: false };

    // ── Belt: pairwise only ──
    if (candidateSlot === 'belts') {
      if (!hasCanvas) return { stars: null, excluded: false };
      const ctxFit = hasContext ? getContextFit(candidate, candidateCat, context) : undefined;
      if (isExcluded(candidate, candidateCat, candidateSlot, canvas, context, ctxFit)) return { stars: 0, score: -1, excluded: true };
      const s = scoreBelt(candidate, canvas);
      if (s === null) return { stars: null, excluded: false };
      return { stars: toStars(s), score: s, excluded: false };
    }

    // ── Context fit ──
    const ctxFit = hasContext ? getContextFit(candidate, candidateCat, context) : undefined;

    // undefined = no score for this category in this context (not excluded)
    if (ctxFit === undefined && !hasCanvas) return { stars: null, excluded: false };

    // Exclusion check
    if (isExcluded(candidate, candidateCat, candidateSlot, canvas, context, ctxFit)) return { stars: 0, score: -1, excluded: true };

    // Outer in no-outer context → no stars, not excluded
    if ((candidateCat === 'blazers' || candidateCat === 'suits' || candidateCat === 'jackets') && outfitType === 'no-outer') {
      return { stars: null, excluded: false };
    }

    // ── Harmony scores vs canvas items ──
    const harmScores = [];
    if (hasCanvas) {
      switch (candidateSlot) {
        case 'top':
          if (canvas.outer) harmScores.push(harmonyScore(candidate, canvas.outer));
          else if (canvas.pants) harmScores.push(harmonyScore(candidate, canvas.pants));
          break;
        case 'outer':
          if (canvas.top)   harmScores.push(harmonyScore(candidate, canvas.top));
          if (canvas.pants) harmScores.push(harmonyScore(candidate, canvas.pants));
          break;
        case 'pants':
          if (canvas.outer) harmScores.push(harmonyScore(candidate, canvas.outer));
          else if (canvas.top) harmScores.push(harmonyScore(candidate, canvas.top));
          if (canvas.shoes) harmScores.push(harmonyScore(candidate, canvas.shoes));
          break;
        case 'shoes':
          if (canvas.pants) harmScores.push(harmonyScore(candidate, canvas.pants));
          if (canvas.outer) harmScores.push(harmonyScore(candidate, canvas.outer));
          break;
      }
    }

    const avgHarm = harmScores.length > 0
      ? harmScores.reduce((a, b) => a + b, 0) / harmScores.length
      : null;

    // ── Final score ──
    let finalScore;
    const cf = (ctxFit !== null && ctxFit !== undefined) ? ctxFit : null;

    if (cf !== null && avgHarm !== null) finalScore = cf + avgHarm;       // both: 0–10
    else if (cf !== null)               finalScore = cf * 2;              // context only: 0–10
    else if (avgHarm !== null)          finalScore = avgHarm * 2;         // harmony only: 0–10
    else                                return { stars: null, excluded: false };

    return { stars: toStars(finalScore), score: finalScore, excluded: false };
  };

})();
