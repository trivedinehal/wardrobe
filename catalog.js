// ============================================================
// catalog.js — Single source of truth for all wardrobe data
// Used by: wardrobe.html, catalog-view.html, wardrobe-config.html
// ============================================================

// Category order
const CAT_ORDER = ['tops', 'pants', 'belts', 'shoes', 'blazers', 'suits', 'jackets'];

// Category metadata (label + icon)
const CAT_META = {
  tops:    { label: "Tops",    icon: "👕" },
  pants:   { label: "Pants",   icon: "👖" },
  belts:   { label: "Belts",   icon: "🪢" },
  shoes:   { label: "Shoes",   icon: "👟" },
  blazers: { label: "Blazers", icon: "🧥" },
  suits:   { label: "Suits",   icon: "🤵" },
  jackets: { label: "Jackets", icon: "🧤" },
};

// Slot mapping (for wardrobe.html outfit canvas)
const SLOT_MAP = {
  blazers: 'outer', suits: 'outer', jackets: 'outer',
  tops: 'top',
  pants: 'pants', belts: 'belts', shoes: 'shoes',
};

const SLOT_LABELS = {
  outer: 'Blazer / Suit', top: 'Shirt / T-Shirt',
  pants: 'Pants', belts: 'Belt', shoes: 'Shoes',
};

// Sub-categories per main category
const SUB_CATS = {
  tops:    ['All', 'Shirts', 'T-Shirts'],
  pants:   ['All', 'Dress Trousers', 'Denim', 'Chinos', 'Linen & Utility'],
  belts:   ['All', 'Formal', 'Smart Casual', 'Casual'],
  shoes:   ['All', 'Formal', 'Smart Casual', 'Casual', 'Athletic'],
  blazers: ['All', 'Formal', 'Casual'],
  suits:   ['All', 'Formal (Wool)', 'Casual (Linen)'],
  jackets: ['All'],
};

// Sub-sub-categories: cat -> sub -> [subsubs]
const SUBSUB_CATS = {
  pants: {
    'Denim': ['All', 'Formal', 'Casual'],
  },
  shoes: {
    'Formal':       ['All', 'Dress Shoes', 'Boots'],
    'Smart Casual': ['All', 'Loafers', 'Sneakers'],
    'Casual':       ['All', 'Sneakers', 'Boots'],
  },
};

// ============================================================
// ATTRIBUTE SCHEMA (all items get these unless marked optional)
//
// ALL ITEMS:
//   formality    — "Formal" / "Smart Casual" / "Casual"
//   color        — specific color name e.g. "navy", "charcoal"
//   colorFamily  — "warm" / "cool" / "neutral"
//   tone         — "light" / "medium" / "dark"
//   season       — "Summer" / "Winter" / "All Season"
//   description  — one natural language sentence
//
// PANTS also:
//   fabric       — "denim" / "chino" / "linen" / "cotton" / "wool" / "utility"
//   pattern      — "solid" / "stripe" / "check"
//   cut          — "slim" / "straight" / "relaxed"
//   hem          — "full" / "tapered" / "cropped"
//
// TOPS also:
//   fabric       — "cotton" / "linen" / "flannel"
//   pattern      — "solid" / "stripe" / "check" / "gingham" / "plaid"
//   collar       — "spread" / "button-down" / "mandarin"
//   tuck         — "full" / "french" / "untucked"
//
// BLAZERS + SUITS also:
//   fabric       — "wool" / "linen" / "cotton" / "tweed"
//   pattern      — "solid" / "stripe" / "check"
//   cut          — "slim" / "regular" / "oversized"
//
// SHOES also:
//   closure      — "lace-up" / "slip-on" / "elastic" / "zip" / "chelsea"
//   sole         — "leather" / "rubber"
//
// BELTS also:
//   buckleStyle  — "pin" / "plate" / "casual"
//   width        — "thin" / "medium" / "wide"
// ============================================================

// Full catalog
const catalog = {
  tops: [
    { swatch: true, color: "#FFFFFF", border: "#e0e0e0", name: "White",       sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#AEC6CF", border: "#AEC6CF", name: "Light Blue",  sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#F4C2C2", border: "#F4C2C2", name: "Pale Pink",   sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#E8A0A0", border: "#E8A0A0", name: "Mid Pink",    sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#B2C9B2", border: "#B2C9B2", name: "Sage Green",  sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#6B8CAE", border: "#6B8CAE", name: "Navy Stripe", sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "stripe", collar: "", tuck: "" },
    { swatch: true, color: "#89CFF0", border: "#89CFF0", name: "Blue Gingham",sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "gingham", collar: "", tuck: "" },
    { swatch: true, color: "#8B4513", border: "#8B4513", name: "Plaid",       sub: "Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "plaid", collar: "", tuck: "" },
    { swatch: true, color: "#FFFFFF", border: "#e0e0e0", name: "White",       sub: "T-Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#1c1c1e", border: "#444",    name: "Black",       sub: "T-Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#9E9E9E", border: "#9E9E9E", name: "Grey",        sub: "T-Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#1B3A6B", border: "#1B3A6B", name: "Navy",        sub: "T-Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#6B7C4A", border: "#6B7C4A", name: "Olive",       sub: "T-Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
    { swatch: true, color: "#D2B48C", border: "#D2B48C", name: "Beige",       sub: "T-Shirts",
      formality: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "solid", collar: "", tuck: "" },
  ],
  pants: [
    { file: "pants_denim_levis_dark_wash.png",            name: "Levi's Dark Wash",       sub: "Denim", subsub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "denim", pattern: "", cut: "", hem: "" },
    { file: "pants_denim_levis_dark_blue.png",            name: "Levi's Dark Blue",        sub: "Denim", subsub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "denim", pattern: "", cut: "", hem: "" },
    { file: "pants_denim_westbay_dark_indigo.png",        name: "Westbay Dark Indigo",     sub: "Denim", subsub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "denim", pattern: "", cut: "", hem: "" },
    { file: "pants_denim_levis_mid_blue.png",             name: "Levi's Mid Blue",         sub: "Denim", subsub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "denim", pattern: "", cut: "", hem: "" },
    { file: "pants_denim_levis_light_wash.png",           name: "Levi's Light Wash",       sub: "Denim", subsub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "denim", pattern: "", cut: "", hem: "" },
    { file: "pants_denim_lee_mid_blue_faded.png",         name: "Lee Mid Blue Faded",      sub: "Denim", subsub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "denim", pattern: "", cut: "", hem: "" },
    { file: "pants_denim_casualjeans_light_blue.png",     name: "Light Blue Casual Jeans", sub: "Denim", subsub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "denim", pattern: "", cut: "", hem: "" },
    { file: "pants_chino_allensolly_black.png",           name: "Allen Solly Black Chino", sub: "Chinos",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "chino", pattern: "", cut: "", hem: "" },
    { file: "pants_chino_allensolly_dark_olive.png",      name: "Allen Solly Dark Olive",  sub: "Chinos",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "chino", pattern: "", cut: "", hem: "" },
    { file: "pants_chino_allensolly_khaki.png",           name: "Allen Solly Khaki",       sub: "Chinos",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "chino", pattern: "", cut: "", hem: "" },
    { file: "pants_chino_white_cotton.png",               name: "White Cotton Chino",      sub: "Chinos",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "cotton", pattern: "", cut: "", hem: "" },
    { file: "pants_chino_beige_cotton.png",               name: "Beige Cotton Chino",      sub: "Chinos",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "cotton", pattern: "", cut: "", hem: "" },
    { file: "pants_chino_wrangler_beige.png",             name: "Wrangler Beige Chino",    sub: "Chinos",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "chino", pattern: "", cut: "", hem: "" },
    { file: "pants_casual_levis_linen_olive.png",         name: "Levi's Linen Olive",      sub: "Linen & Utility",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "linen", pattern: "", cut: "", hem: "" },
    { file: "pants_casual_levis_nylon_khaki_utility.png", name: "Levi's Khaki Utility",    sub: "Linen & Utility",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "utility", pattern: "", cut: "", hem: "" },
    { file: "pants_casual_olive_linen_elastic.png",       name: "Olive Linen Elastic",     sub: "Linen & Utility",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "linen", pattern: "", cut: "", hem: "" },
    { file: "pants_casual_cat_cotton_brown_work.png",     name: "CAT Brown Work Pant",     sub: "Linen & Utility",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "utility", pattern: "", cut: "", hem: "" },
  ],
  belts: [
    { file: "belt_leather_black_silver_plain.png",                 name: "Black Leather Plain",          sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
    { file: "belt_leather_black_silver_stitched.png",              name: "Black Leather Stitched",       sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
    { file: "belt_leather_darkbrown_silver.png",                   name: "Dark Brown Leather",           sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
    { file: "belt_leather_black_platebuckle.png",                  name: "Black Leather Plate Buckle",   sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
    { file: "belt_leather_black_silver_diesel.png",                name: "Black Leather Diesel",         sub: "Smart Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
    { file: "belt_leather_tan_gunmetal.png",                       name: "Tan Leather Gunmetal",         sub: "Smart Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
    { file: "belt_woven_navy_tommyhilfiger.png",                   name: "Navy Woven Tommy Hilfiger",    sub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
    { file: "belt_canvas_stripe_navyredwhite_tommyhilfiger.png",   name: "Stripe Canvas Tommy Hilfiger", sub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      buckleStyle: "", width: "" },
  ],
  shoes: [
    { file: "shoes_dress_laceup_florsheim_brown.png",              name: "Florsheim Brown Lace-Up",      sub: "Formal", subsub: "Dress Shoes",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_dress_laceup_florsheim_black.png",              name: "Florsheim Black Lace-Up",      sub: "Formal", subsub: "Dress Shoes",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_dress_slipon_colorado_black.png",               name: "Colorado Black Slip-On",       sub: "Formal", subsub: "Dress Shoes",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_dress_slipon_florsheim_black.png",              name: "Florsheim Black Slip-On",      sub: "Formal", subsub: "Dress Shoes",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_boots_chelsea_florsheim_brown.png",             name: "Florsheim Brown Chelsea",      sub: "Formal", subsub: "Boots",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_boots_chelsea_hushpuppies_black.png",           name: "Hush Puppies Black Chelsea",   sub: "Formal", subsub: "Boots",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_boots_chelsea_hushpuppies_black_elastic.png",   name: "Hush Puppies Black (Elastic)", sub: "Formal", subsub: "Boots",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_boots_chelsea_hushpuppies_black_zip.png",       name: "Hush Puppies Black (Zip)",     sub: "Formal", subsub: "Boots",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_loafer_modaitaliano_tan_brown.png",             name: "Moda Italiano Tan Loafer",     sub: "Smart Casual", subsub: "Loafers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_loafer_hushpuppies_blue.png",                   name: "Hush Puppies Blue Loafer",     sub: "Smart Casual", subsub: "Loafers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_loafer_hushpuppies_brown.png",                  name: "Hush Puppies Brown Loafer",    sub: "Smart Casual", subsub: "Loafers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_sneaker_wildrhino_brown_leather_whitesole.png", name: "Wild Rhino Brown Leather",     sub: "Smart Casual", subsub: "Sneakers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_sneaker_wildrhino_olive.png",                   name: "Wild Rhino Olive",             sub: "Smart Casual", subsub: "Sneakers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_sneaker_adidas_black_white.png",                name: "Adidas Black & White",         sub: "Casual", subsub: "Sneakers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_sneaker_uspolo_white_rednavy.png",              name: "US Polo White (Red/Navy)",     sub: "Casual", subsub: "Sneakers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_sneaker_uspolo_black_whitelaces.png",           name: "US Polo Black",                sub: "Casual", subsub: "Sneakers",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_boots_casual_colorado_black.png",               name: "Colorado Black Casual Boot",   sub: "Casual", subsub: "Boots",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_athletic_colorado_white_blue.png",              name: "Colorado White & Blue",        sub: "Athletic",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
    { file: "shoes_athletic_reebok_grey_teal.png",                 name: "Reebok Grey & Teal",           sub: "Athletic",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      closure: "", sole: "" },
  ],
  blazers: [
    { file: "blazer_formal_charcoal_grey.png",                 name: "Charcoal Grey Blazer", sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "blazer_formal_mid_blue.png",                      name: "Mid Blue Blazer",       sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "blazer_formal_navy.png",                          name: "Navy Blazer",            sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "blazer_formal_dark_charcoal_burgundy_lining.png", name: "Dark Charcoal Blazer",  sub: "Formal",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "blazer_casual_blue_wool.png",                     name: "Blue Wool Blazer",       sub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "blazer_casual_beige_linen.png",                   name: "Beige Linen Blazer",     sub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "blazer_casual_grey_check.png",                    name: "Grey Check Blazer",      sub: "Casual",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
  ],
  suits: [
    { file: "suit_wool_mid_blue.png",                    name: "Mid Blue Wool Suit",      sub: "Formal (Wool)",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "suit_wool_light_blue.png",                  name: "Light Blue Wool Suit",     sub: "Formal (Wool)",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "suit_wool_blue_grey_check.png",             name: "Blue Grey Check Suit",     sub: "Formal (Wool)",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "suit_wool_dark_charcoal_purple_lining.png", name: "Dark Charcoal Suit",       sub: "Formal (Wool)",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "suit_wool_light_grey.png",                  name: "Light Grey Suit",          sub: "Formal (Wool)",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "suit_wool_mid_grey.png",                    name: "Mid Grey Suit",            sub: "Formal (Wool)",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
    { file: "suit_linen_beige.png",                      name: "Beige Linen Suit",         sub: "Casual (Linen)",
      formality: "", color: "", colorFamily: "", tone: "", season: "", description: "",
      fabric: "", pattern: "", cut: "" },
  ],
  jackets: [],
};
