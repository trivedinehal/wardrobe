// ============================================================
// matching.js — Attribute-based outfit matching engine
// ============================================================
// Exposes: window.scoreItem(candidate, candidateCat, canvas)
//
//   candidate     — item object from catalog.js
//   candidateCat  — 'tops'|'pants'|'belts'|'shoes'|'blazers'|'suits'|'jackets'
//   canvas        — { outer, top, pants, belts, shoes }
//                   each value is null or a selected item (with .cat property)
//
// Returns: { stars: 0|1|2|3|null, excluded: boolean }
//   stars null  = canvas empty, no rating to show
//   stars 0     = no match (greyed out)
//   excluded    = definite X (hard rule violation)
// ============================================================

(function () {

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function toneVal(t) {
    return t === 'light' ? 1 : t === 'medium' ? 2 : 3;
  }

  function toneDiff(a, b) {
    return Math.abs(toneVal(a.tone) - toneVal(b.tone));
  }

  function isSuit(item) {
    return item && item.cat === 'suits';
  }

  function isNeutral(cf) {
    return cf === 'neutral';
  }

  function hasFormal(item)      { return item.formality.includes('Formal'); }
  function hasSmartCasual(item) { return item.formality.includes('Smart Casual'); }
  function hasCasual(item)      { return item.formality.includes('Casual'); }
  function formalOnly(item)     { return hasFormal(item) && !hasSmartCasual(item) && !hasCasual(item); }
  function casualOnly(item)     { return hasCasual(item) && !hasFormal(item) && !hasSmartCasual(item); }

  const X = { excluded: true };  // sentinel for hard exclusion

  // ─── Shared scoring building blocks ───────────────────────────────────────

  // How well do the formality levels of two items align? (0–4 pts)
  function formalityScore(a, b) {
    if (hasFormal(a) && hasFormal(b)) return 4;
    if (hasFormal(a) && hasSmartCasual(b)) return 2;
    if (hasSmartCasual(a) && hasFormal(b)) return 2;
    if (hasSmartCasual(a) && hasSmartCasual(b)) return 3;
    if (hasSmartCasual(a) && hasCasual(b)) return 2;
    if (hasCasual(a) && hasSmartCasual(b)) return 2;
    if (hasCasual(a) && hasCasual(b)) return 3;
    return 1;
  }

  // Tone contrast — contrast is generally good in menswear (0–3 pts)
  function toneScore(a, b) {
    const d = toneDiff(a, b);
    return d === 2 ? 3 : d === 1 ? 2 : 1;
  }

  // Color harmony (0–3 pts)
  // Neutral items are universally safe; same colour family = harmonious
  function colorScore(a, b) {
    let score = 0;
    if (isNeutral(a.colorFamily)) score += 2;
    if (isNeutral(b.colorFamily)) score += 1;
    if (!isNeutral(a.colorFamily) && a.colorFamily === b.colorFamily) score += 2;
    return Math.min(score, 3);
  }

  // ─── Pairwise scoring functions ───────────────────────────────────────────
  // Each returns a numeric score (higher = better) or X (excluded sentinel)
  // or null (skip — no meaningful relationship)

  // TOP vs OUTER ─────────────────────────────────────────────────────────────
  function scoreTopVsOuter(top, outer) {

    // Hard exclusions — definite X
    if (isSuit(outer) && top.sub === 'T-Shirts') return X;              // suit + t-shirt
    if (isSuit(outer) && top.pattern === 'plaid') return X;             // suit + plaid
    if (formalOnly(outer) && top.sub === 'T-Shirts') return X;          // formal blazer + t-shirt
    if (outer.pattern !== 'solid' && top.pattern !== 'solid') return X; // pattern on pattern

    let s = 0;
    s += formalityScore(outer, top);
    s += toneScore(outer, top);
    s += colorScore(outer, top);
    // Patterned outer + solid top = classic rule, small bonus
    if (outer.pattern !== 'solid' && top.pattern === 'solid') s += 1;
    return s;
  }

  // PANTS vs OUTER ───────────────────────────────────────────────────────────
  function scorePantsVsOuter(pants, outer) {

    if (isSuit(outer)) return null;                                      // suit has own pants — skip
    if (pants.fabric === 'utility') return X;                            // cargo/utility with any blazer
    if (casualOnly(pants) && formalOnly(outer)) return X;               // very casual pants + formal blazer

    let s = 0;
    s += formalityScore(outer, pants);
    s += toneScore(outer, pants);
    s += colorScore(outer, pants);
    if (outer.pattern !== 'solid' && pants.pattern === 'solid') s += 1;
    return s;
  }

  // SHOES vs OUTER ───────────────────────────────────────────────────────────
  function scoreShoesVsOuter(shoe, outer) {

    if (shoe.style === 'athletic') return X;                             // athletic shoes with any outer
    if (casualOnly(shoe) && formalOnly(outer)) return X;                // casual sneakers + formal blazer/suit

    let s = 0;
    s += formalityScore(outer, shoe);

    // Shoe style fit for outer type
    if (isSuit(outer)) {
      // Suits — dress shoes best, chelsea boots good, loafers okay, sneakers no
      if (shoe.style === 'dress-shoe')        s += 4;
      else if (shoe.style === 'chelsea-boot') s += 3;
      else if (shoe.style === 'loafer')       s += 2;
      else if (shoe.style === 'sneaker')      s += 0;
    } else if (formalOnly(outer)) {
      // Formal blazer — dress shoes and chelsea boots, loafers borderline
      if (shoe.style === 'dress-shoe')        s += 4;
      else if (shoe.style === 'chelsea-boot') s += 3;
      else if (shoe.style === 'loafer')       s += 2;
      else if (shoe.style === 'sneaker')      s += 0;
    } else {
      // Smart casual / casual blazer — loafers and chelsea boots shine, sneakers work
      if (shoe.style === 'loafer')            s += 4;
      else if (shoe.style === 'chelsea-boot') s += 3;
      else if (shoe.style === 'dress-shoe')   s += 2;
      else if (shoe.style === 'sneaker')      s += 2;
    }

    // Colour pairing: warm shoes great with light/medium outers; dark shoes great with dark outers
    const ot = toneVal(outer.tone);
    if (ot <= 2 && shoe.colorFamily === 'warm') s += 2;
    if (ot === 3 && isNeutral(shoe.colorFamily)) s += 2;
    if (isNeutral(shoe.colorFamily)) s += 1;                            // black shoes always safe-ish

    return s;
  }

  // SHOES vs PANTS ───────────────────────────────────────────────────────────
  function scoreShoesVsPants(shoe, pants) {

    if (shoe.style === 'athletic') return X;
    if (shoe.style === 'dress-shoe' && pants.fabric === 'utility') return X;
    if (formalOnly(shoe) && casualOnly(pants)) return X;

    let s = 0;

    // ── Shoe style vs pants type — the primary differentiator ──────────────
    const isDenim    = pants.fabric === 'denim';
    const isChino    = pants.fabric === 'chino' || pants.fabric === 'cotton';
    const isFormal   = pants.sub === 'Dress Trousers';
    const isRelaxed  = pants.fabric === 'linen' || pants.fabric === 'utility';
    const smartDenim = isDenim && hasSmartCasual(pants);
    const casualDenim = isDenim && !hasSmartCasual(pants);

    if (isFormal) {
      // Dress trousers — formal shoes only
      if (shoe.style === 'dress-shoe')    s += 5;
      else if (shoe.style === 'chelsea-boot') s += 4;
      else if (shoe.style === 'loafer')   s += 3;
      else if (shoe.style === 'sneaker')  s += 0;
    } else if (isChino) {
      // Chinos — loafers and chelsea boots shine, dress shoes work, sneakers okay
      if (shoe.style === 'loafer')        s += 5;
      else if (shoe.style === 'chelsea-boot') s += 5;
      else if (shoe.style === 'dress-shoe')   s += 3;
      else if (shoe.style === 'sneaker')  s += 2;
    } else if (smartDenim) {
      // Smart casual jeans — loafers, chelsea boots and clean sneakers all work
      if (shoe.style === 'loafer')        s += 5;
      else if (shoe.style === 'chelsea-boot') s += 5;
      else if (shoe.style === 'sneaker')  s += 4;
      else if (shoe.style === 'dress-shoe')   s += 2;
    } else if (casualDenim) {
      // Casual jeans — sneakers and boots, dress shoes are overdressed
      if (shoe.style === 'sneaker')       s += 5;
      else if (shoe.style === 'chelsea-boot') s += 4;
      else if (shoe.style === 'loafer')   s += 3;
      else if (shoe.style === 'dress-shoe')   s += 1;
    } else if (isRelaxed) {
      // Linen/utility — relaxed shoes only
      if (shoe.style === 'sneaker')       s += 4;
      else if (shoe.style === 'loafer')   s += 4;
      else if (shoe.style === 'chelsea-boot') s += 2;
      else if (shoe.style === 'dress-shoe')   s += 1;
    }

    // ── Colour family — warm pants + warm shoes, cool pants + neutral/black ─
    if (pants.colorFamily === 'warm' && shoe.colorFamily === 'warm') s += 3; // olive/khaki/beige + brown/tan
    else if (pants.colorFamily === 'cool' && isNeutral(shoe.colorFamily)) s += 2;  // dark jeans + black
    else if (pants.colorFamily === 'cool' && shoe.colorFamily === 'warm') s += 1;  // dark jeans + brown (works)
    else if (isNeutral(pants.colorFamily) && isNeutral(shoe.colorFamily)) s += 2;  // black pants + black

    // ── Tone contrast ───────────────────────────────────────────────────────
    s += toneScore(shoe, pants);

    return s;
  }

  // BELT vs SHOES — the most rule-bound pairing in menswear ─────────────────
  function scoreBeltVsShoes(belt, shoe) {

    const shoeIsBlack = isNeutral(shoe.colorFamily) && shoe.color.toLowerCase().includes('black');
    const shoeIsWarm  = shoe.colorFamily === 'warm';
    const beltIsBlack = isNeutral(belt.colorFamily) && belt.color.toLowerCase().includes('black');
    const beltIsWarm  = belt.colorFamily === 'warm';

    if (shoeIsBlack && beltIsWarm) return X;   // black shoes + brown/tan belt
    if (shoeIsWarm  && beltIsBlack) return X;  // brown/tan shoes + black belt

    let s = 0;
    // Colour family match is the primary criterion for belts
    if (!isNeutral(shoe.colorFamily) && shoe.colorFamily === belt.colorFamily) s += 4;
    if (isNeutral(shoe.colorFamily) && isNeutral(belt.colorFamily)) s += 4;
    // Tone proximity
    const td = toneDiff(belt, shoe);
    s += td === 0 ? 3 : td === 1 ? 2 : 1;
    // Leather belt is always the more coordinated choice
    if (belt.material === 'leather') s += 1;
    // Formality match
    if (hasFormal(shoe) && hasFormal(belt)) s += 2;
    else if (hasSmartCasual(shoe) && hasSmartCasual(belt)) s += 1;

    return s;
  }

  // BELT vs PANTS ────────────────────────────────────────────────────────────
  function scoreBeltVsPants(belt, pants) {

    if (pants.beltLoop === 'none') return X;                             // elastic waist — no belt
    if (pants.beltLoop === 'narrow' && belt.width === 'wide') return X; // wide belt won't fit formal loops

    let s = 0;
    if (pants.beltLoop === 'narrow' && belt.width === 'thin')   s += 3;
    else if (pants.beltLoop === 'wide' && belt.width === 'wide')   s += 3;
    else if (pants.beltLoop === 'wide' && belt.width === 'medium') s += 2;
    else s += 1;

    s += formalityScore(belt, pants);
    return s;
  }

  // TOP vs PANTS (relevant when no outer is on canvas) ──────────────────────
  function scoreTopVsPants(top, pants) {
    let s = 0;
    s += formalityScore(top, pants);
    s += toneScore(top, pants);
    if (isNeutral(top.colorFamily) || isNeutral(pants.colorFamily)) s += 1;
    return s;
  }

  // ─── Stars conversion ─────────────────────────────────────────────────────

  function toStars(avg) {
    if (avg >= 8) return 3;
    if (avg >= 5) return 2;
    if (avg >= 3) return 1;
    return 0;
  }

  // ─── Main export ──────────────────────────────────────────────────────────

  window.scoreItem = function (candidate, candidateCat, canvas, style) {

    const slotMap = {
      tops: 'top', pants: 'pants', belts: 'belts',
      shoes: 'shoes', blazers: 'outer', suits: 'outer', jackets: 'outer'
    };
    const candidateSlot = slotMap[candidateCat];

    // Nothing on canvas — no ratings yet
    const filled = [canvas.outer, canvas.top, canvas.pants, canvas.belts, canvas.shoes].filter(Boolean);
    if (filled.length === 0) return { stars: null, excluded: false };

    // Don't score an item against its own slot (comparing same type)
    const canvasWithoutSelf = { ...canvas };
    canvasWithoutSelf[candidateSlot] = null;

    const scores = [];
    let excluded = false;

    function apply(result) {
      if (result === null || result === undefined) return;   // skip relationship
      if (result && result.excluded) { excluded = true; return; }
      if (typeof result === 'number') scores.push(result);
    }

    // Score candidate against each relevant canvas item
    switch (candidateSlot) {
      case 'top':
        if (canvas.outer) apply(scoreTopVsOuter(candidate, canvas.outer));
        if (canvas.pants && !canvas.outer) apply(scoreTopVsPants(candidate, canvas.pants));
        break;

      case 'outer':
        if (canvas.top)   apply(scoreTopVsOuter(canvas.top, candidate));
        if (canvas.pants) apply(scorePantsVsOuter(canvas.pants, candidate));
        if (canvas.shoes) apply(scoreShoesVsOuter(canvas.shoes, candidate));
        break;

      case 'pants':
        if (canvas.outer) apply(scorePantsVsOuter(candidate, canvas.outer));
        if (canvas.shoes) apply(scoreShoesVsPants(canvas.shoes, candidate));
        if (canvas.belts) apply(scoreBeltVsPants(canvas.belts, candidate));
        if (canvas.top && !canvas.outer) apply(scoreTopVsPants(canvas.top, candidate));
        break;

      case 'shoes':
        if (canvas.outer) apply(scoreShoesVsOuter(candidate, canvas.outer));
        if (canvas.pants) apply(scoreShoesVsPants(candidate, canvas.pants));
        if (canvas.belts) apply(scoreBeltVsShoes(canvas.belts, candidate));
        break;

      case 'belts':
        if (canvas.shoes) apply(scoreBeltVsShoes(candidate, canvas.shoes));
        if (canvas.pants) apply(scoreBeltVsPants(candidate, canvas.pants));
        break;
    }

    if (excluded) return { stars: 0, excluded: true };
    if (scores.length === 0) return { stars: null, excluded: false };

    // Average all pairwise scores — more canvas items = more refined rating
    let avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Style influence — boost items matching selected style, nudge down those that don't
    if (style) {
      const formalityMap = {
        'formal':       'Formal',
        'smart-casual': 'Smart Casual',
        'casual':       'Casual'
      };
      const target = formalityMap[style];
      if (target) {
        if (candidate.formality.includes(target)) avg += 1.5;
        else avg -= 1;
      }
    }

    return { stars: toStars(avg), excluded: false };
  };

})();
