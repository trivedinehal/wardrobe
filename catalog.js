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

// Sub-categories and sub-sub-categories — derived automatically from item sub/subsub fields.
// To change the drawers: edit sub/subsub on the items below. No need to touch anything here.
const SUB_CATS = {};
const SUBSUB_CATS = {};

// WHERE scenarios — context only, no effect on matching scores
const WHERE_ORDER = ['office', 'dinner', 'event', 'weekend', 'travel'];

const WHERE_META = {
  'office':  { label: 'Office',  icon: '💼', desc: 'Work days — smart and professional. Suits, blazers, or smart casual depending on the day.' },
  'dinner':  { label: 'Dinner',  icon: '🍽️', desc: 'Evening out — dressed up but comfortable. Blazer or smart top, polished shoes.' },
  'event':   { label: 'Event',   icon: '🎉', desc: 'Formal occasions — weddings, functions, celebrations. Suit or formal blazer.' },
  'weekend': { label: 'Weekend', icon: '😎', desc: 'Relaxed days off — casual and comfortable. Jeans, t-shirts, sneakers.' },
  'travel':  { label: 'Travel',  icon: '✈️', desc: 'On the move — comfort first. Easy layers, practical shoes, minimal fuss.' },
};

// Style order (formality levels, most formal first)
const STYLE_ORDER = ['formal', 'semi-formal', 'smart-casual', 'casual'];

const STYLE_META = {
  'formal':       { label: 'Formal',       icon: '🎩', desc: 'Full formal look. Suits or dress shirts with formal trousers. Important meetings, events, formal occasions.' },
  'semi-formal':  { label: 'Semi-Formal',  icon: '🧥', desc: 'Dressed up but not a full suit. Blazer or jacket with formal trousers or chinos. Thursday office day, dinner, smart events.' },
  'smart-casual': { label: 'Smart Casual', icon: '👔', desc: 'Relaxed but put together. Blazer or jacket with jeans or chinos, collared shirt. Casual office day, social occasions.' },
  'casual':       { label: 'Casual',       icon: '👕', desc: 'Relaxed look. T-shirts or casual shirts, casual denim, sneakers. Casual Friday, weekends, relaxed days.' },
};

// Outfit types per style
// outerCat: which catalog category to use for the outer slot (null = No Outer)
const OUTFIT_TYPES = {
  'formal': [
    { key: 'suit',                  label: 'Suit',                    outerCat: 'suits'   },
    { key: 'blazer-formal-trouser', label: 'Blazer + Formal Trousers', outerCat: 'blazers' },
    { key: 'no-outer',              label: 'No Outer',                 outerCat: null      },
  ],
  'semi-formal': [
    { key: 'blazer-formal-trouser', label: 'Blazer + Formal Trousers', outerCat: 'blazers' },
    { key: 'blazer-chinos',         label: 'Blazer + Chinos',          outerCat: 'blazers' },
    { key: 'jacket-formal-trouser', label: 'Jacket + Formal Trousers', outerCat: 'jackets' },
    { key: 'no-outer',              label: 'No Outer',                  outerCat: null      },
  ],
  'smart-casual': [
    { key: 'blazer-chinos',  label: 'Blazer + Chinos', outerCat: 'blazers' },
    { key: 'blazer-jeans',   label: 'Blazer + Jeans',  outerCat: 'blazers' },
    { key: 'jacket-chinos',  label: 'Jacket + Chinos', outerCat: 'jackets' },
    { key: 'jacket-jeans',   label: 'Jacket + Jeans',  outerCat: 'jackets' },
    { key: 'no-outer',       label: 'No Outer',         outerCat: null      },
  ],
  'casual': [
    { key: 'jacket-jeans', label: 'Jacket + Jeans', outerCat: 'jackets' },
    { key: 'no-outer',     label: 'No Outer',        outerCat: null      },
  ],
};

// ============================================================
// ATTRIBUTE SCHEMA (all items get these unless marked optional)
//
// ALL ITEMS:
//   brand        — brand name e.g. "Levi's", "Florsheim" — empty string if unknown
//   formality    — array e.g. ["Formal", "Smart Casual"] — all styles the item works with
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
//   sleeve       — "short" / "long"
//
// BLAZERS + SUITS also:
//   fabric       — "wool" / "linen" / "cotton" / "tweed"
//   pattern      — "solid" / "stripe" / "check"
//   cut          — "slim" / "regular" / "oversized"
//
// SHOES also:
//   style        — "dress-shoe" / "loafer" / "chelsea-boot" / "sneaker" / "athletic"
//   closure      — "lace-up" / "slip-on" / "elastic" / "zip"
//   sole         — "leather" / "rubber"
//
// BELTS also:
//   material     — "leather" / "canvas" / "woven"
//   buckleStyle  — "pin" / "plate" / "casual"
//   width        — "thin" / "medium" / "wide"
// ============================================================

// Full catalog
const catalog = {
  tops: [
    { swatch: true, color: "#FFFFFF", border: "#e0e0e0", name: "White",       sub: "Tops", colorFamily: "neutral", tone: "light", season: "All Season", description: "White — the most versatile top in the wardrobe, works with everything from suits to casual jeans.",         type: "swatch" },
    { swatch: true, color: "#AEC6CF", border: "#AEC6CF", name: "Light Blue",  sub: "Tops", colorFamily: "cool",    tone: "light", season: "All Season", description: "Light blue — a classic staple, works beautifully under a suit or with chinos.",                          type: "swatch" },
    { swatch: true, color: "#F4C2C2", border: "#F4C2C2", name: "Pale Pink",   sub: "Tops", colorFamily: "warm",    tone: "light", season: "All Season", description: "Pale pink — soft and smart, works well under blazers and with dark trousers.",                          type: "swatch" },
    { swatch: true, color: "#E8A0A0", border: "#E8A0A0", name: "Mid Pink",    sub: "Tops", colorFamily: "warm",    tone: "light", season: "All Season", description: "Mid pink — more casual than pale pink, best with chinos, jeans and casual blazers.",                   type: "swatch" },
    { swatch: true, color: "#B2C9B2", border: "#B2C9B2", name: "Sage Green",  sub: "Tops", colorFamily: "warm",    tone: "light", season: "Summer",     description: "Sage green — earthy and relaxed, works with chinos, casual jeans and linen blazers.",                 type: "swatch" },
    { swatch: true, color: "#6B8CAE", border: "#6B8CAE", name: "Steel Blue",  sub: "Tops", colorFamily: "cool",    tone: "medium",season: "All Season", description: "Steel blue — works well with chinos, dark jeans and blazers.",                                         type: "swatch" },
    { swatch: true, color: "#89CFF0", border: "#89CFF0", name: "Sky Blue",    sub: "Tops", colorFamily: "cool",    tone: "light", season: "Summer",     description: "Sky blue — fresh and casual, works with chinos, jeans and casual blazers.",                           type: "swatch" },
    { swatch: true, color: "#8B4513", border: "#8B4513", name: "Rust Brown",  sub: "Tops", colorFamily: "warm",    tone: "medium",season: "All Season", description: "Rust brown — earthy warm tone, best with jeans, casual boots or sneakers.",                           type: "swatch" },
    { swatch: true, color: "#1c1c1e", border: "#444",    name: "Black",       sub: "Tops", colorFamily: "neutral", tone: "dark",  season: "All Season", description: "Black — versatile and sharp, works with most pants and shoes.",                                        type: "swatch" },
    { swatch: true, color: "#9E9E9E", border: "#9E9E9E", name: "Grey",        sub: "Tops", colorFamily: "neutral", tone: "medium",season: "All Season", description: "Grey — relaxed and easy to pair, works across casual and smart casual outfits.",                       type: "swatch" },
    { swatch: true, color: "#1B3A6B", border: "#1B3A6B", name: "Navy",        sub: "Tops", colorFamily: "cool",    tone: "dark",  season: "All Season", description: "Navy — clean and versatile, works with beige, khaki, jeans and most outerwear.",                      type: "swatch" },
    { swatch: true, color: "#6B7C4A", border: "#6B7C4A", name: "Olive",       sub: "Tops", colorFamily: "warm",    tone: "medium",season: "All Season", description: "Olive — earthy casual tone, works with beige, khaki and casual jeans.",                              type: "swatch" },
    { swatch: true, color: "#D2B48C", border: "#D2B48C", name: "Beige",       sub: "Tops", colorFamily: "warm",    tone: "light", season: "Summer",     description: "Beige — light and summery, works with navy, olive and casual jeans.",                                 type: "swatch" },
  ],
  pants: [
    { file: "pants_denim_levis_dark_indigo.png",          name: "Levi's Dark Indigo",      sub: "Jeans", subsub: "Slim",
      brand: "Levi's", formality: ["Smart Casual", "Casual"], color: "dark indigo", colorFamily: "cool", tone: "dark", season: "All Season", description: "Very dark indigo slim-straight Levi's denim, clean and deep enough to wear with a blazer.",
      fabric: "denim", pattern: "solid", cut: "slim", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_levis_dark_blue.png",            name: "Levi's Dark Blue",        sub: "Jeans", subsub: "Slim",
      brand: "Levi's", formality: ["Smart Casual", "Casual"], color: "dark blue", colorFamily: "cool", tone: "dark", season: "All Season", description: "Medium-dark blue slim-straight Levi's denim, slightly faded with a versatile everyday feel.",
      fabric: "denim", pattern: "solid", cut: "slim", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_levis_light_wash.png",           name: "Levi's Light Wash",       sub: "Jeans", subsub: "Slim",
      brand: "Levi's", formality: ["Smart Casual", "Casual"], color: "light blue", colorFamily: "cool", tone: "light", season: "All Season", description: "Clean light wash Levi's denim, slim-straight cut with a fresh casual look.",
      fabric: "denim", pattern: "solid", cut: "slim", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_denimsco_light_wash.png",        name: "Denim Co Light Wash",     sub: "Jeans", subsub: "Slim",
      brand: "Denim Co", formality: ["Smart Casual", "Casual"], color: "light blue", colorFamily: "cool", tone: "light", season: "All Season", description: "Pale icy light wash Denim Co jeans, slim-straight cut with a relaxed casual feel.",
      fabric: "denim", pattern: "solid", cut: "slim", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_conner_mid_blue.png",            name: "Conner Mid Blue",         sub: "Jeans", subsub: "Relaxed",
      brand: "Conner", formality: ["Casual"], color: "mid blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Medium blue relaxed-fit Conner denim, casual wash with an easy everyday feel.",
      fabric: "denim", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_levis_mid_blue.png",             name: "Levi's Mid Blue",         sub: "Jeans", subsub: "Relaxed",
      brand: "Levi's", formality: ["Casual"], color: "mid blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Medium blue relaxed-fit Levi's denim, lived-in wash with a casual everyday look.",
      fabric: "denim", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_diesel_dark_blue.png",           name: "Diesel Dark Blue",        sub: "Jeans", subsub: "Relaxed",
      brand: "Diesel", formality: ["Casual"], color: "dark blue", colorFamily: "cool", tone: "dark", season: "All Season", description: "Dark blue relaxed-fit Diesel denim, casual feel despite the deeper wash.",
      fabric: "denim", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_lee_mid_blue_faded.png",         name: "Lee Mid Blue Faded",      sub: "Jeans", subsub: "Relaxed",
      brand: "Lee", formality: ["Casual"], color: "faded blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Faded mid-blue Lee denim with visible whiskering, relaxed cut for a casual worn-in look.",
      fabric: "denim", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_chino_allensolly_black.png",           name: "Allen Solly Black Chino", sub: "Chinos",
      brand: "Allen Solly", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Jet black Allen Solly chino with a clean straight cut, pairs well with both casual and smart casual looks.",
      fabric: "chino", pattern: "solid", cut: "straight", hem: "full", beltLoop: "medium" },
    { file: "pants_chino_allensolly_dark_olive.png",      name: "Allen Solly Dark Olive",  sub: "Chinos",
      brand: "Allen Solly", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "dark olive", colorFamily: "warm", tone: "dark", season: "All Season", description: "Dark olive green Allen Solly chino, earthy and versatile for smart casual outfits.",
      fabric: "chino", pattern: "solid", cut: "straight", hem: "full", beltLoop: "medium" },
    { file: "pants_chino_allensolly_khaki.png",           name: "Allen Solly Khaki",       sub: "Chinos",
      brand: "Allen Solly", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "khaki", colorFamily: "warm", tone: "medium", season: "All Season", description: "Classic khaki Allen Solly chino, a wardrobe staple that works with almost any top or blazer.",
      fabric: "chino", pattern: "solid", cut: "straight", hem: "full", beltLoop: "medium" },
    { file: "pants_chino_white_cotton.png",               name: "White Cotton Chino",      sub: "Chinos",
      brand: "", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "off-white", colorFamily: "neutral", tone: "light", season: "Summer", description: "Off-white cotton chino with a clean flat-front cut, great for summer smart casual looks.",
      fabric: "cotton", pattern: "solid", cut: "straight", hem: "full", beltLoop: "medium" },
    { file: "pants_chino_beige_cotton.png",               name: "Beige Cotton Chino",      sub: "Chinos",
      brand: "", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "beige", colorFamily: "warm", tone: "light", season: "Summer", description: "Light beige cotton chino, warm-toned and versatile for relaxed smart casual summer outfits.",
      fabric: "cotton", pattern: "solid", cut: "straight", hem: "full", beltLoop: "medium" },
    { file: "pants_chino_wrangler_beige.png",             name: "Wrangler Beige Jeans",    sub: "Jeans", subsub: "Relaxed",
      brand: "Wrangler", formality: ["Casual"], color: "beige", colorFamily: "warm", tone: "medium", season: "All Season", description: "Beige Wrangler jeans with 5-pocket denim-style construction, casual and relaxed in a warm neutral tone.",
      fabric: "denim", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_casual_levis_linen_olive.png",         name: "Levi's Linen Olive",      sub: "Linen & Utility",
      brand: "Levi's", formality: ["Casual"], color: "olive", colorFamily: "warm", tone: "medium", season: "Summer", description: "Olive green Levi's linen pant with a relaxed fit, lightweight and breathable for casual summer wear.",
      fabric: "linen", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "medium" },
    { file: "pants_casual_levis_nylon_khaki_utility.png", name: "Levi's Khaki Utility",    sub: "Linen & Utility",
      brand: "Levi's", formality: ["Casual"], color: "khaki olive", colorFamily: "warm", tone: "medium", season: "All Season", description: "Khaki olive utility cargo pant with side pockets, relaxed fit and functional for casual everyday wear.",
      fabric: "utility", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "medium" },
    { file: "pants_casual_olive_linen_elastic.png",       name: "Olive Linen Elastic",     sub: "Linen & Utility",
      brand: "", formality: ["Casual"], color: "olive", colorFamily: "warm", tone: "medium", season: "Summer", description: "Olive linen pant with elastic waistband, very relaxed and casual, ideal for warm weather.",
      fabric: "linen", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "none" },
    { file: "pants_casual_cat_cotton_brown_work.png",     name: "CAT Brown Work Pant",     sub: "Linen & Utility",
      brand: "CAT", formality: ["Casual"], color: "taupe brown", colorFamily: "warm", tone: "medium", season: "All Season", description: "Taupe brown CAT workwear pant with cargo pocket, rugged and casual for outdoor or relaxed looks.",
      fabric: "utility", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_formal_raymond_charcoal_black.png",   name: "Raymond Charcoal Black",  sub: "Dress Trousers",
      brand: "Raymond", formality: ["Formal", "Semi-Formal"], color: "dark charcoal", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Dark charcoal black Raymond dress trouser with a clean flat-front cut. Pairs with suits and formal blazers.",
      fabric: "wool", pattern: "solid", cut: "slim", hem: "full", beltLoop: "thin" },
    { file: "pants_formal_raymond_navy_dark.png",        name: "Raymond Dark Navy",        sub: "Dress Trousers",
      brand: "Raymond", formality: ["Formal", "Semi-Formal"], color: "dark navy", colorFamily: "cool", tone: "dark", season: "All Season", description: "Dark navy Raymond dress trouser, versatile and formal. Works with navy and charcoal blazers.",
      fabric: "wool", pattern: "solid", cut: "slim", hem: "full", beltLoop: "thin" },
    { file: "pants_formal_raymond_steel_blue.png",       name: "Raymond Steel Blue",       sub: "Dress Trousers",
      brand: "Raymond", formality: ["Formal", "Semi-Formal"], color: "steel blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Steel blue Raymond dress trouser with a clean flat-front cut. Works well with navy and charcoal blazers.",
      fabric: "wool", pattern: "solid", cut: "slim", hem: "full", beltLoop: "thin" },
    { file: "pants_formal_raymond_cobalt_blue.png",      name: "Raymond Cobalt Blue",      sub: "Dress Trousers",
      brand: "Raymond", formality: ["Formal", "Semi-Formal"], color: "cobalt blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Cobalt blue Raymond dress trouser, a bold formal choice. Best with navy or charcoal blazers.",
      fabric: "wool", pattern: "solid", cut: "slim", hem: "full", beltLoop: "thin" },
    { file: "pants_formal_raymond_charcoal_pinstripe.png", name: "Raymond Charcoal Pinstripe", sub: "Dress Trousers",
      brand: "Raymond", formality: ["Formal", "Semi-Formal"], color: "charcoal grey", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Charcoal grey Raymond dress trouser with subtle pinstripe. Classic formal look, best with charcoal or navy blazers.",
      fabric: "wool", pattern: "stripe", cut: "slim", hem: "full", beltLoop: "thin" },
  ],
  belts: [
    { file: "belt_leather_black_pierrecardin_platebuckle.png",     name: "Pierre Cardin Plate Buckle",   sub: "Leather",
      brand: "Pierre Cardin", formality: ["Formal", "Semi-Formal"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Slim black Pierre Cardin leather belt with gunmetal plate buckle. The only dress belt in the collection — works with suits and formal trousers.",
      material: "leather", buckleStyle: "plate", width: "thin", pants: ["Formal Trousers", "Chinos"] },
    { file: "belt_leather_black_ratchet_matte.png",                name: "Black Ratchet Matte",           sub: "Leather",
      brand: "", formality: ["Formal", "Semi-Formal"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather ratchet belt with matte black plate buckle. Clean and minimal — works with suits and formal trousers.",
      material: "leather", buckleStyle: "plate", width: "thin", pants: ["Formal Trousers", "Chinos"] },
    { file: "belt_leather_black_ratchet_stripe.png",               name: "Black Ratchet Stripe",          sub: "Leather",
      brand: "", formality: ["Formal", "Semi-Formal"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather ratchet belt with black plate buckle and two silver stripe details. Works with suits and formal trousers.",
      material: "leather", buckleStyle: "plate", width: "thin", pants: ["Formal Trousers", "Chinos"] },
    { file: "belt_leather_black_white_stitch.png",                 name: "Black White Stitch",           sub: "Leather",
      brand: "", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Wide black leather belt with white double stitching and silver pin buckle. Works well with chinos and jeans.",
      material: "leather", buckleStyle: "pin", width: "wide", pants: ["Chinos", "Jeans"] },
    { file: "belt_leather_black_beige_stitch.png",                 name: "Black Beige Stitch",           sub: "Leather",
      brand: "", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Wide black leather belt with beige zigzag stitching and silver pin buckle. Works well with chinos and jeans.",
      material: "leather", buckleStyle: "pin", width: "wide", pants: ["Chinos", "Jeans"] },
    { file: "belt_leather_darkbrown_silver.png",                   name: "Dark Brown Leather",           sub: "Leather",
      brand: "", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "dark brown", colorFamily: "warm", tone: "dark", season: "All Season", description: "Dark brown leather belt with cream stitching and silver pin buckle. Pairs well with warm-toned chinos and jeans.",
      material: "leather", buckleStyle: "pin", width: "wide", pants: ["Chinos", "Jeans"] },
    { file: "belt_leather_espresso_silver_diesel.png",             name: "Diesel Espresso",              sub: "Leather",
      brand: "Diesel", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "espresso", colorFamily: "warm", tone: "dark", season: "All Season", description: "Espresso dark brown Diesel leather belt with silver pin buckle and branded keeper. Works with chinos and jeans.",
      material: "leather", buckleStyle: "pin", width: "thin", pants: ["Chinos", "Jeans"] },
    { file: "belt_leather_tan_gunmetal.png",                       name: "Tan Leather Gunmetal",         sub: "Leather",
      brand: "", formality: ["Semi-Formal", "Smart Casual", "Casual"], color: "tan", colorFamily: "warm", tone: "medium", season: "All Season", description: "Tan leather belt with gunmetal buckle, clean and minimal with no visible stitching. Works with chinos and jeans.",
      material: "leather", buckleStyle: "pin", width: "wide", pants: ["Chinos", "Jeans"] },
    { file: "belt_woven_navy_tommyhilfiger.png",                   name: "Navy Woven Tommy Hilfiger",    sub: "Woven & Canvas",
      brand: "Tommy Hilfiger", formality: ["Smart Casual", "Casual"], color: "navy", colorFamily: "cool", tone: "dark", season: "All Season", description: "Navy elastic woven Tommy Hilfiger belt with gunmetal buckle and leather tips. Works with chinos and jeans in smart casual and casual outfits.",
      material: "woven", buckleStyle: "pin", width: "wide", pants: ["Chinos", "Jeans"] },
    { file: "belt_canvas_stripe_navyredwhite_tommyhilfiger.png",   name: "Stripe Canvas Tommy Hilfiger", sub: "Woven & Canvas",
      brand: "Tommy Hilfiger", formality: ["Smart Casual", "Casual"], color: "navy/red/white", colorFamily: "cool", tone: "medium", season: "Summer", description: "Navy, red and white stripe canvas Tommy Hilfiger belt with silver buckle and tan leather trim. Works with chinos and jeans in smart casual and casual outfits.",
      material: "canvas", buckleStyle: "pin", width: "wide", pants: ["Chinos", "Jeans"] },
  ],
  shoes: [
    { file: "shoes_dress_laceup_florsheim_brown.png",              name: "Florsheim Brown Lace-Up",      sub: "Dress Shoes", subsub: "Lace-Up",
      brand: "Florsheim", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "tan brown", colorFamily: "warm", tone: "medium", season: "All Season", description: "Classic brown leather Oxford lace-up by Florsheim with a pointed toe and leather sole. Best with suits and dress trousers but works with dark chinos too.",
      style: "dress-shoe", closure: "lace-up", sole: "leather" },
    { file: "shoes_dress_laceup_florsheim_black.png",              name: "Florsheim Black Lace-Up",      sub: "Dress Shoes", subsub: "Lace-Up",
      brand: "Florsheim", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Sleek black leather Oxford lace-up by Florsheim with a pointed toe and leather sole. The most formal shoe in the collection.",
      style: "dress-shoe", closure: "lace-up", sole: "leather" },
    { file: "shoes_dress_slipon_colorado_black.png",               name: "Colorado Black Slip-On",       sub: "Dress Shoes", subsub: "Slip-On",
      brand: "Colorado", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather slip-on dress shoe by Colorado with a pointed toe. Smart and easy to wear with suits, formal trousers and dark chinos.",
      style: "dress-shoe", closure: "slip-on", sole: "leather" },
    { file: "shoes_dress_slipon_florsheim_black.png",              name: "Florsheim Black Slip-On",      sub: "Dress Shoes", subsub: "Slip-On",
      brand: "Florsheim", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather slip-on by Florsheim with a square toe. Formal and polished, works well with suits and smart casual.",
      style: "dress-shoe", closure: "slip-on", sole: "leather" },
    { file: "shoes_boots_chelsea_florsheim_brown.png",             name: "Florsheim Brown Chelsea",      sub: "Boots", subsub: "Formal",
      brand: "Florsheim", formality: ["Formal", "Semi-Formal", "Smart Casual", "Casual"], color: "dark brown", colorFamily: "warm", tone: "dark", season: "All Season", description: "Rich dark brown leather chelsea boot by Florsheim. Highly versatile — works with suits, smart casual jeans, chinos and casual outfits.",
      style: "chelsea-boot", closure: "elastic", sole: "leather" },
    { file: "shoes_boots_chelsea_hushpuppies_black.png",           name: "Hush Puppies Black Chelsea",   sub: "Boots", subsub: "Formal",
      brand: "Hush Puppies", formality: ["Formal", "Semi-Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather chelsea boot by Hush Puppies. Clean and versatile — works with suits, smart casual and casual outfits.",
      style: "chelsea-boot", closure: "elastic", sole: "leather" },
    { file: "shoes_boots_chelsea_hushpuppies_black_elastic.png",   name: "Hush Puppies Black (Elastic)", sub: "Boots", subsub: "Formal",
      brand: "Hush Puppies", formality: ["Formal", "Semi-Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather ankle boot by Hush Puppies with full elastic side panel. Easy to slip on, versatile across formal and casual looks.",
      style: "chelsea-boot", closure: "elastic", sole: "leather" },
    { file: "shoes_boots_chelsea_hushpuppies_black_zip.png",       name: "Hush Puppies Black (Zip)",     sub: "Boots", subsub: "Formal",
      brand: "Hush Puppies", formality: ["Formal", "Semi-Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather ankle boot by Hush Puppies with side zip. Versatile across formal and casual looks.",
      style: "chelsea-boot", closure: "zip", sole: "leather" },
    { file: "shoes_loafer_modaitaliano_tan_brown.png",             name: "Moda Italiano Tan Loafer",     sub: "Loafers", subsub: null,
      brand: "Moda Italiano", formality: ["Smart Casual", "Casual"], color: "tan", colorFamily: "warm", tone: "medium", season: "Summer", description: "Tan leather bit-loafer by Moda Italiano with gold hardware. Works beautifully with chinos, smart casual jeans and casual outfits.",
      style: "loafer", closure: "slip-on", sole: "leather" },
    { file: "shoes_loafer_hushpuppies_blue.png",                   name: "Hush Puppies Blue Loafer",     sub: "Loafers", subsub: null,
      brand: "Hush Puppies", formality: ["Smart Casual", "Casual"], color: "blue", colorFamily: "cool", tone: "medium", season: "Summer", description: "Blue suede driver moccasin by Hush Puppies. Relaxed loafer style, best with chinos and smart casual jeans.",
      style: "loafer", closure: "slip-on", sole: "rubber" },
    { file: "shoes_loafer_hushpuppies_brown.png",                  name: "Hush Puppies Brown Loafer",    sub: "Loafers", subsub: null,
      brand: "Hush Puppies", formality: ["Smart Casual", "Casual"], color: "dark brown", colorFamily: "warm", tone: "dark", season: "All Season", description: "Dark brown pebbled leather driver moccasin by Hush Puppies. Comfortable and casual, best with chinos and jeans.",
      style: "loafer", closure: "slip-on", sole: "rubber" },
    { file: "shoes_sneaker_wildrhino_brown_leather_whitesole.png", name: "Wild Rhino Brown Leather",     sub: "Sneakers", subsub: "Leather",
      brand: "Wild Rhino", formality: ["Smart Casual", "Casual"], color: "tan brown", colorFamily: "warm", tone: "medium", season: "All Season", description: "Clean tan leather sneaker by Wild Rhino with white rubber sole. Elevated — works great with dark jeans, chinos and casual outfits.",
      style: "sneaker", closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_wildrhino_olive.png",                   name: "Wild Rhino Olive",             sub: "Sneakers", subsub: "Casual",
      brand: "Wild Rhino", formality: ["Casual"], color: "olive", colorFamily: "warm", tone: "medium", season: "All Season", description: "Distressed olive leather trainer by Wild Rhino with a rugged casual look. Best with casual jeans.",
      style: "sneaker", closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_adidas_black_white.png",                name: "Adidas Black & White",         sub: "Sneakers", subsub: "Casual",
      brand: "Adidas", formality: ["Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black suede Adidas sneaker with white 3-stripe detail. Classic casual streetwear sneaker.",
      style: "sneaker", closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_uspolo_white_rednavy.png",              name: "US Polo White (Red/Navy)",     sub: "Sneakers", subsub: "Casual",
      brand: "US Polo", formality: ["Casual"], color: "white", colorFamily: "neutral", tone: "light", season: "Summer", description: "White US Polo sneaker with red and navy detailing. Casual and sporty, best for summer outfits.",
      style: "sneaker", closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_uspolo_black_whitelaces.png",           name: "US Polo Black",                sub: "Sneakers", subsub: "Casual",
      brand: "US Polo", formality: ["Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black US Polo sneaker with white laces and red accent. Casual everyday sneaker.",
      style: "sneaker", closure: "lace-up", sole: "rubber" },
    { file: "shoes_boots_casual_colorado_black.png",               name: "Colorado Black Casual Boot",   sub: "Boots", subsub: "Casual",
      brand: "Colorado", formality: ["Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather chelsea-style ankle boot by Colorado. More casual construction than the Hush Puppies — best with casual jeans.",
      style: "chelsea-boot", closure: "elastic", sole: "rubber" },
    { file: "shoes_athletic_colorado_white_blue.png",              name: "Colorado White & Blue",        sub: "Athletic", subsub: null,
      brand: "Colorado", formality: ["Casual"], color: "white/blue", colorFamily: "cool", tone: "light", season: "All Season", description: "White and blue retro running shoe by Colorado. Sport and casual use only.",
      style: "athletic", closure: "lace-up", sole: "rubber" },
    { file: "shoes_athletic_reebok_grey_teal.png",                 name: "Reebok Grey & Teal",           sub: "Athletic", subsub: null,
      brand: "Reebok", formality: ["Casual"], color: "grey/teal", colorFamily: "cool", tone: "medium", season: "All Season", description: "Grey and teal Reebok retro runner with chunky sole. Sport and gym use only.",
      style: "athletic", closure: "lace-up", sole: "rubber" },
  ],
  blazers: [
    { file: "blazer_formal_charcoal_grey.png",                 name: "Charcoal Grey Blazer", sub: "Formal",
      brand: "", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "charcoal grey", colorFamily: "cool", tone: "dark", season: "All Season", description: "Classic charcoal grey slim-fit blazer with notch lapel. Versatile — works with suits, dress trousers and smart casual jeans.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_formal_mid_blue.png",                      name: "Steel Blue Blazer",       sub: "Formal",
      brand: "", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "steel blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Mid blue slim-fit blazer with a subtle texture. Pairs well with grey trousers, chinos and dark jeans.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_formal_navy.png",                          name: "Navy Blazer",            sub: "Formal",
      brand: "", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "navy", colorFamily: "cool", tone: "dark", season: "All Season", description: "Deep navy slim-fit blazer. A wardrobe essential — works with almost every pant colour and style.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_formal_dark_charcoal_burgundy_lining.png", name: "Dark Charcoal Blazer",  sub: "Formal",
      brand: "", formality: ["Formal", "Semi-Formal", "Smart Casual"], color: "dark charcoal", colorFamily: "cool", tone: "dark", season: "All Season", description: "Very dark charcoal blazer with burgundy lining detail. Sharp and formal, best with dark trousers and suits.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_casual_blue_wool.png",                     name: "Blue Wool Blazer",       sub: "Smart Casual",
      brand: "", formality: ["Semi-Formal", "Smart Casual"], color: "cobalt blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Vibrant cobalt blue wool blazer with floral lining. A statement piece — best with neutral pants like khaki, beige or dark jeans.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_casual_beige_linen.png",                   name: "Beige Linen Blazer",     sub: "Smart Casual",
      brand: "", formality: ["Semi-Formal", "Smart Casual"], color: "beige", colorFamily: "warm", tone: "light", season: "Summer", description: "Light beige linen blazer with floral lining. Lightweight and relaxed, perfect for summer smart casual outfits.",
      fabric: "linen", pattern: "solid", cut: "slim" },
    { file: "blazer_casual_grey_check.png",                    name: "Grey Check Blazer",      sub: "Smart Casual",
      brand: "", formality: ["Semi-Formal", "Smart Casual"], color: "light grey", colorFamily: "cool", tone: "light", season: "All Season", description: "Light grey windowpane check blazer with blue lining. Casual and stylish, best with dark jeans or navy chinos.",
      fabric: "wool", pattern: "check", cut: "slim" },
  ],
  suits: [
    { file: "suit_dark_charcoal_purple_lining.png", name: "Dark Charcoal Suit",     sub: "Wool",
      brand: "PGH",formality: ["Formal"], color: "dark charcoal", colorFamily: "cool", tone: "dark", season: "All Season", description: "Very dark charcoal two-piece wool suit with purple lining visible at the lapel. The darkest and most formal suit in the collection — commanding and sharp.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_mid_blue.png",                    name: "Mid Blue Suit",           sub: "Wool",
      brand: "YD",formality: ["Formal"], color: "mid blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Bright saturated mid blue two-piece wool suit. Vivid and classic — a confident choice for business and formal occasions.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_light_blue_grey.png",             name: "Light Blue Grey Suit",    sub: "Wool",
      brand: "PGH",formality: ["Formal"], color: "light blue grey", colorFamily: "cool", tone: "light", season: "All Season", description: "Desaturated light blue-grey two-piece wool suit with a subtle weave texture. Softer and less saturated than the mid blue — fresh for daytime formal events.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_blue_grey_check.png",             name: "Blue Grey Check Suit",    sub: "Wool",
      brand: "PGH",formality: ["Formal"], color: "blue grey", colorFamily: "cool", tone: "medium", season: "All Season", description: "Muted blue-grey two-piece wool suit with a subtle windowpane check. Darker and more textured than the solid blue-grey — distinguished and refined.",
      fabric: "wool", pattern: "check", cut: "slim" },
    { file: "suit_light_grey.png",                  name: "Light Grey Suit",         sub: "Wool",
      brand: "Tarocash",formality: ["Formal"], color: "light grey", colorFamily: "neutral", tone: "light", season: "All Season", description: "Clean light grey two-piece wool suit with dark lining. Elegant and classic — ideal for weddings, daytime formal events and smart office days.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_mid_grey.png",                    name: "Mid Grey Suit",           sub: "Wool",
      brand: "Oxford",formality: ["Formal"], color: "mid grey", colorFamily: "neutral", tone: "medium", season: "All Season", description: "Medium charcoal grey two-piece wool suit with a subtle texture. A boardroom staple — versatile and professional for everyday formal wear.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_beige_linen.png",                 name: "Beige Linen Suit",        sub: "Linen",
      brand: "", formality: ["Formal"], color: "beige", colorFamily: "warm", tone: "light", season: "Summer", description: "Warm sandy beige linen two-piece suit with clearly visible linen texture. A lighter alternative to wool — ideal for summer weddings, garden parties and formal occasions in warm weather.",
      fabric: "linen", pattern: "solid", cut: "slim" },
  ],
  jackets: [
    { file: "jacket_harrington_staplesuperior_navy.png",  name: "Staple Superior Navy Harrington", sub: "Casual",
      brand: "Staple Superior", formality: ["Smart Casual", "Casual"], color: "navy", colorFamily: "cool", tone: "dark", season: "All Season", description: "Navy cotton harrington jacket with zip front and elasticated cuffs, smart enough for casual blazer looks.",
      fabric: "cotton", pattern: "solid", cut: "regular" },
    { file: "jacket_leather_benetton_black.png",          name: "Benetton Black Leather Jacket",   sub: "Casual",
      brand: "Benetton", formality: ["Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather biker-style jacket with zip front, a bold casual statement piece.",
      fabric: "leather", pattern: "solid", cut: "regular" },
  ],
};

// Populate SUB_CATS and SUBSUB_CATS from item sub/subsub fields
CAT_ORDER.forEach(cat => {
  const subs = [];
  const subsubs = {};
  (catalog[cat] || []).forEach(item => {
    if (item.sub && !subs.includes(item.sub)) subs.push(item.sub);
    if (item.sub && item.subsub) {
      if (!subsubs[item.sub]) subsubs[item.sub] = [];
      if (!subsubs[item.sub].includes(item.subsub)) subsubs[item.sub].push(item.subsub);
    }
  });
  SUB_CATS[cat] = ['All', ...subs];
  if (Object.keys(subsubs).length > 0) {
    SUBSUB_CATS[cat] = {};
    Object.keys(subsubs).forEach(sub => {
      SUBSUB_CATS[cat][sub] = ['All', ...subsubs[sub]];
    });
  }
});
