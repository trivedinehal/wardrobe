// ============================================================
// matching.js — Config-driven outfit matching engine
// ============================================================
// Exposes:
//   window.MATCH_CONFIG  — all rules as structured data (used by matching-logic.html)
//   window.scoreItem(candidate, candidateCat, canvas, style, outfitType)
//
// Returns: { stars: 0|1|2|3|null, score: number|null, excluded: boolean }
// ============================================================

(function () {

  // ─── Config — all rules live here ────────────────────────────────────────────

  const MATCH_CONFIG = {

    // Star thresholds — avg pairwise score → star rating
    thresholds: { three: 8, two: 5, one: 3 },

    // Style pill modifier — applied after averaging pairwise scores
    stylePill: { boost: 1.5, penalty: 1.0 },

    // Base scoring components (max points each contributes)
    baseScoring: {
      formality: { max: 4, desc: 'How well formality levels align between two items' },
      tone:      { max: 3, desc: 'Tone contrast — contrast is generally good in menswear' },
      color:     { max: 3, desc: 'Colour harmony — neutral items are universally safe' },
    },

    // Formality alignment table — how well two formality levels pair (0–4 pts)
    formalityMatrix: {
      'Formal+Formal':               4,
      'Formal+Semi-Formal':          3,
      'Semi-Formal+Formal':          3,
      'Semi-Formal+Semi-Formal':     4,
      'Semi-Formal+Smart Casual':    3,
      'Smart Casual+Semi-Formal':    3,
      'Semi-Formal+Casual':          1,
      'Casual+Semi-Formal':          1,
      'Formal+Smart Casual':         2,
      'Smart Casual+Formal':         2,
      'Smart Casual+Smart Casual':   3,
      'Smart Casual+Casual':         2,
      'Casual+Smart Casual':         2,
      'Casual+Casual':               3,
      'default':                     1,
    },

    // Outfit type → shoe-vs-outer context mapping
    // Used when outfitType is passed to scoreItem to pick the right shoe bonus table row
    outfitTypeShoeContext: {
      'suit':                  'suit',
      'blazer-formal-trouser': 'formal-blazer',
      'jacket-formal-trouser': 'formal-blazer',
      'blazer-chinos':         'casual-blazer',
      'blazer-jeans':          'casual-blazer',
      'jacket-chinos':         'casual-blazer',
      'jacket-jeans':          'casual-blazer',
      'no-outer':              null,
    },

    // Hard exclusion rules — result in ✕ (greyed out, never suggested)
    exclusions: [
      { id: 'suit-tshirt',              pair: 'Outer + Top',   reason: 'Suits require a proper shirt — t-shirt is too casual' },
      { id: 'suit-plaid',               pair: 'Outer + Top',   reason: 'Plaid shirt clashes with suit formality' },
      { id: 'formal-blazer-tshirt',     pair: 'Outer + Top',   reason: 'Formal blazer requires a proper shirt' },
      { id: 'pattern-on-pattern',       pair: 'Outer + Top',   reason: 'Two patterned items together — too busy' },
      { id: 'athletic-outer',           pair: 'Shoes + Outer', reason: 'Athletic shoes with any outer garment' },
      { id: 'casual-shoe-formal-outer', pair: 'Shoes + Outer', reason: 'Casual-only sneakers with a formal blazer or suit' },
      { id: 'utility-pants-outer',      pair: 'Pants + Outer', reason: 'Cargo / utility pants with any blazer or jacket' },
      { id: 'casual-pants-formal-outer',pair: 'Pants + Outer', reason: 'Casual-only pants with a formal-only blazer' },
      { id: 'athletic-pants',           pair: 'Shoes + Pants', reason: 'Athletic shoes excluded from outfit scoring' },
      { id: 'dress-shoe-utility-pants', pair: 'Shoes + Pants', reason: 'Dress shoes with cargo / utility pants' },
      { id: 'formal-shoe-casual-pants', pair: 'Shoes + Pants', reason: 'Formal-only dress shoes with casual-only pants' },
      { id: 'black-shoe-warm-belt',     pair: 'Belt + Shoes',  reason: 'Black shoes always paired with a black belt' },
      { id: 'warm-shoe-black-belt',     pair: 'Belt + Shoes',  reason: 'Brown / tan shoes always paired with a warm belt' },
      { id: 'elastic-waist-belt',       pair: 'Belt + Pants',  reason: 'Elastic waist pants have no belt loop' },
      { id: 'wide-belt-narrow-loop',    pair: 'Belt + Pants',  reason: 'Wide belt won\'t fit through formal trouser loops' },
    ],

    // Shoe style bonuses vs outer garment type (points added on top of base score)
    shoeVsOuter: {
      'suit':          { label: 'Suit',                 scores: { 'dress-shoe': 4, 'chelsea-boot': 3, 'loafer': 2, 'sneaker': 0 } },
      'formal-blazer': { label: 'Formal Blazer',        scores: { 'dress-shoe': 4, 'chelsea-boot': 3, 'loafer': 2, 'sneaker': 0 } },
      'casual-blazer': { label: 'Smart Casual Blazer',  scores: { 'loafer': 4, 'chelsea-boot': 3, 'dress-shoe': 2, 'sneaker': 2 } },
    },

    // Shoe style bonuses vs pants type (points added on top of base score)
    shoeVsPants: {
      'dress-trousers': { label: 'Dress Trousers', scores: { 'dress-shoe': 5, 'chelsea-boot': 4, 'loafer': 3, 'sneaker': 0 } },
      'chinos':         { label: 'Chinos',         scores: { 'loafer': 5, 'chelsea-boot': 5, 'dress-shoe': 3, 'sneaker': 2 } },
      'smart-denim':    { label: 'Smart Denim',    scores: { 'loafer': 5, 'chelsea-boot': 5, 'sneaker': 4, 'dress-shoe': 2 } },
      'casual-denim':   { label: 'Casual Denim',   scores: { 'sneaker': 5, 'chelsea-boot': 4, 'loafer': 3, 'dress-shoe': 1 } },
      'relaxed':        { label: 'Linen / Utility', scores: { 'sneaker': 4, 'loafer': 4, 'chelsea-boot': 2, 'dress-shoe': 1 } },
    },

    // Belt width vs pants belt loop width
    beltVsPants: {
      'narrow': { label: 'Narrow loops (formal trousers)', scores: { 'thin': 3, 'medium': 1, 'wide': null } },
      'wide':   { label: 'Wide loops (casual / chinos)',   scores: { 'wide': 3, 'medium': 2, 'thin': 1 } },
    },

  };

  // Expose config for the matching-logic page
  window.MATCH_CONFIG = MATCH_CONFIG;

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  function toneVal(t) { return t === 'light' ? 1 : t === 'medium' ? 2 : 3; }
  function toneDiff(a, b) { return Math.abs(toneVal(a.tone) - toneVal(b.tone)); }
  function isSuit(item)         { return item && item.cat === 'suits'; }
  function isNeutral(cf)        { return cf === 'neutral'; }
  function hasFormal(item)      { return item.formality.includes('Formal'); }
  function hasSemiFormal(item)  { return item.formality.includes('Semi-Formal'); }
  function hasSmartCasual(item) { return item.formality.includes('Smart Casual'); }
  function hasCasual(item)      { return item.formality.includes('Casual'); }
  function formalOnly(item)     { return hasFormal(item) && !hasSmartCasual(item) && !hasCasual(item); }
  function casualOnly(item)     { return hasCasual(item) && !hasFormal(item) && !hasSemiFormal(item) && !hasSmartCasual(item); }

  const X = { excluded: true };

  // ─── Base scoring functions ───────────────────────────────────────────────────

  function formalityScore(a, b) {
    const fm = MATCH_CONFIG.formalityMatrix;
    // Find best score across all formality levels each item has
    const levels = ['Formal', 'Semi-Formal', 'Smart Casual', 'Casual'];
    let best = fm['default'];
    for (const la of levels) {
      if (!a.formality.includes(la)) continue;
      for (const lb of levels) {
        if (!b.formality.includes(lb)) continue;
        const key = `${la}+${lb}`;
        const val = fm[key] ?? fm['default'];
        if (val > best) best = val;
      }
    }
    return best;
  }

  function toneScore(a, b) {
    const d = toneDiff(a, b);
    return d === 2 ? 3 : d === 1 ? 2 : 1;
  }

  function colorScore(a, b) {
    let score = 0;
    if (isNeutral(a.colorFamily)) score += 2;
    if (isNeutral(b.colorFamily)) score += 1;
    if (!isNeutral(a.colorFamily) && a.colorFamily === b.colorFamily) score += 2;
    return Math.min(score, 3);
  }

  // ─── Pairwise scoring functions ───────────────────────────────────────────────

  function scoreTopVsOuter(top, outer) {
    if (isSuit(outer) && top.sub === 'T-Shirts')                       return X;
    if (isSuit(outer) && top.pattern === 'plaid')                      return X;
    if (formalOnly(outer) && top.sub === 'T-Shirts')                   return X;
    if (outer.pattern !== 'solid' && top.pattern !== 'solid')          return X;

    let s = 0;
    s += formalityScore(outer, top);
    s += toneScore(outer, top);
    s += colorScore(outer, top);
    if (outer.pattern !== 'solid' && top.pattern === 'solid') s += 1;
    return s;
  }

  function scorePantsVsOuter(pants, outer) {
    if (isSuit(outer))                                    return null;
    if (pants.fabric === 'utility')                       return X;
    if (casualOnly(pants) && formalOnly(outer))           return X;

    let s = 0;
    s += formalityScore(outer, pants);
    s += toneScore(outer, pants);
    s += colorScore(outer, pants);
    if (outer.pattern !== 'solid' && pants.pattern === 'solid') s += 1;
    return s;
  }

  function scoreShoesVsOuter(shoe, outer, outfitType) {
    if (shoe.style === 'athletic')                        return X;
    if (casualOnly(shoe) && formalOnly(outer))            return X;

    let s = 0;
    s += formalityScore(outer, shoe);

    const mappedContext = outfitType ? MATCH_CONFIG.outfitTypeShoeContext[outfitType] : null;
    const context = mappedContext || (isSuit(outer) ? 'suit' : formalOnly(outer) ? 'formal-blazer' : 'casual-blazer');
    const bonuses = MATCH_CONFIG.shoeVsOuter[context].scores;
    s += bonuses[shoe.style] ?? 0;

    const ot = toneVal(outer.tone);
    if (ot <= 2 && shoe.colorFamily === 'warm') s += 2;
    if (ot === 3 && isNeutral(shoe.colorFamily)) s += 2;
    if (isNeutral(shoe.colorFamily)) s += 1;

    return s;
  }

  function scoreShoesVsPants(shoe, pants) {
    if (shoe.style === 'athletic')                                    return X;
    if (shoe.style === 'dress-shoe' && pants.fabric === 'utility')   return X;
    if (formalOnly(shoe) && casualOnly(pants))                        return X;

    let s = 0;

    const isDenim    = pants.fabric === 'denim';
    const isChino    = pants.fabric === 'chino' || pants.fabric === 'cotton';
    const isFormal   = pants.sub === 'Dress Trousers';
    const isRelaxed  = pants.fabric === 'linen' || pants.fabric === 'utility';
    const smartDenim = isDenim && hasSmartCasual(pants);
    const casualDenim = isDenim && !hasSmartCasual(pants);

    let pantsContext = 'relaxed';
    if (isFormal)      pantsContext = 'dress-trousers';
    else if (isChino)  pantsContext = 'chinos';
    else if (smartDenim) pantsContext = 'smart-denim';
    else if (casualDenim) pantsContext = 'casual-denim';

    const bonuses = MATCH_CONFIG.shoeVsPants[pantsContext].scores;
    s += bonuses[shoe.style] ?? 0;

    if (pants.colorFamily === 'warm' && shoe.colorFamily === 'warm') s += 3;
    else if (pants.colorFamily === 'cool' && isNeutral(shoe.colorFamily)) s += 2;
    else if (pants.colorFamily === 'cool' && shoe.colorFamily === 'warm') s += 1;
    else if (isNeutral(pants.colorFamily) && isNeutral(shoe.colorFamily)) s += 2;

    s += toneScore(shoe, pants);
    return s;
  }

  function scoreBeltVsShoes(belt, shoe) {
    const shoeIsBlack = isNeutral(shoe.colorFamily) && shoe.color.toLowerCase().includes('black');
    const shoeIsWarm  = shoe.colorFamily === 'warm';
    const beltIsBlack = isNeutral(belt.colorFamily) && belt.color.toLowerCase().includes('black');
    const beltIsWarm  = belt.colorFamily === 'warm';

    if (shoeIsBlack && beltIsWarm)  return X;
    if (shoeIsWarm  && beltIsBlack) return X;

    let s = 0;
    if (!isNeutral(shoe.colorFamily) && shoe.colorFamily === belt.colorFamily) s += 4;
    if (isNeutral(shoe.colorFamily) && isNeutral(belt.colorFamily)) s += 4;
    const td = toneDiff(belt, shoe);
    s += td === 0 ? 3 : td === 1 ? 2 : 1;
    if (belt.material === 'leather') s += 1;
    if (hasFormal(shoe) && hasFormal(belt)) s += 2;
    else if (hasSmartCasual(shoe) && hasSmartCasual(belt)) s += 1;
    return s;
  }

  function scoreBeltVsPants(belt, pants) {
    if (pants.beltLoop === 'none') return X;
    if (pants.beltLoop === 'narrow' && belt.width === 'wide') return X;

    const loopKey = pants.beltLoop === 'narrow' ? 'narrow' : 'wide';
    const points = MATCH_CONFIG.beltVsPants[loopKey].scores[belt.width];
    if (points === null) return X;

    let s = points ?? 1;
    s += formalityScore(belt, pants);
    return s;
  }

  function scoreTopVsPants(top, pants) {
    let s = 0;
    s += formalityScore(top, pants);
    s += toneScore(top, pants);
    if (isNeutral(top.colorFamily) || isNeutral(pants.colorFamily)) s += 1;
    return s;
  }

  // ─── Stars conversion ─────────────────────────────────────────────────────────

  function toStars(avg) {
    if (avg >= MATCH_CONFIG.thresholds.three) return 3;
    if (avg >= MATCH_CONFIG.thresholds.two)   return 2;
    if (avg >= MATCH_CONFIG.thresholds.one)   return 1;
    return 0;
  }

  // ─── Main export ──────────────────────────────────────────────────────────────

  window.scoreItem = function (candidate, candidateCat, canvas, style, outfitType) {

    const slotMap = {
      tops: 'top', pants: 'pants', belts: 'belts',
      shoes: 'shoes', blazers: 'outer', suits: 'outer', jackets: 'outer'
    };
    const candidateSlot = slotMap[candidateCat];

    const filled = [canvas.outer, canvas.top, canvas.pants, canvas.belts, canvas.shoes].filter(Boolean);
    if (filled.length === 0) return { stars: null, excluded: false };

    const scores = [];
    let excluded = false;

    function apply(result) {
      if (result === null || result === undefined) return;
      if (result && result.excluded) { excluded = true; return; }
      if (typeof result === 'number') scores.push(result);
    }

    switch (candidateSlot) {
      case 'top':
        if (canvas.outer) apply(scoreTopVsOuter(candidate, canvas.outer));
        if (canvas.pants && !canvas.outer) apply(scoreTopVsPants(candidate, canvas.pants));
        break;

      case 'outer':
        if (canvas.top)   apply(scoreTopVsOuter(canvas.top, candidate));
        if (canvas.pants) apply(scorePantsVsOuter(canvas.pants, candidate));
        if (canvas.shoes) apply(scoreShoesVsOuter(canvas.shoes, candidate, outfitType));
        break;

      case 'pants':
        if (canvas.outer) apply(scorePantsVsOuter(candidate, canvas.outer));
        if (canvas.shoes) apply(scoreShoesVsPants(canvas.shoes, candidate));
        if (canvas.belts) apply(scoreBeltVsPants(canvas.belts, candidate));
        if (canvas.top && !canvas.outer) apply(scoreTopVsPants(canvas.top, candidate));
        break;

      case 'shoes':
        if (canvas.outer) apply(scoreShoesVsOuter(candidate, canvas.outer, outfitType));
        if (canvas.pants) apply(scoreShoesVsPants(candidate, canvas.pants));
        if (canvas.belts) apply(scoreBeltVsShoes(canvas.belts, candidate));
        break;

      case 'belts':
        if (canvas.shoes) apply(scoreBeltVsShoes(candidate, canvas.shoes));
        if (canvas.pants) apply(scoreBeltVsPants(candidate, canvas.pants));
        break;
    }

    if (excluded) return { stars: 0, score: -1, excluded: true };
    if (scores.length === 0) return { stars: null, score: null, excluded: false };

    let avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Style pill modifier
    if (style) {
      if (style === 'semi-formal') {
        // Semi-formal bridges Formal and Smart Casual — boost either, penalise casual-only
        if (hasFormal(candidate) || hasSemiFormal(candidate) || hasSmartCasual(candidate)) avg += MATCH_CONFIG.stylePill.boost;
        else if (casualOnly(candidate)) avg -= MATCH_CONFIG.stylePill.penalty;
      } else {
        const formalityMap = {
          'formal':       'Formal',
          'smart-casual': 'Smart Casual',
          'casual':       'Casual',
        };
        const target = formalityMap[style];
        if (target) {
          if (candidate.formality.includes(target))  avg += MATCH_CONFIG.stylePill.boost;
          else                                        avg -= MATCH_CONFIG.stylePill.penalty;
        }
      }
    }

    return { stars: toStars(avg), score: avg, excluded: false };
  };

})();
