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
  pants:   ['All', 'Dress Trousers', 'Jeans', 'Chinos', 'Linen & Utility'],
  belts:   ['All', 'Formal', 'Smart Casual', 'Casual'],
  shoes:   ['All', 'Formal', 'Smart Casual', 'Casual', 'Athletic'],
  blazers: ['All', 'Formal', 'Casual'],
  suits:   ['All', 'Formal (Wool)', 'Casual (Linen)'],
  jackets: ['All'],
};

// Sub-sub-categories: cat -> sub -> [subsubs]
const SUBSUB_CATS = {
  pants: {
    'Jeans': ['All', 'Smart Casual', 'Casual'],
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
      formality: ["Formal", "Smart Casual", "Casual"], colorFamily: "neutral", tone: "light", season: "All Season", description: "White shirt — the most versatile top in the wardrobe, works with everything from suits to casual jeans.",
      fabric: "cotton", pattern: "solid", collar: "spread", tuck: "full" },
    { swatch: true, color: "#AEC6CF", border: "#AEC6CF", name: "Light Blue",  sub: "Shirts",
      formality: ["Formal", "Smart Casual"], colorFamily: "cool", tone: "light", season: "All Season", description: "Light blue shirt — a classic office staple, works beautifully under a suit or with chinos.",
      fabric: "cotton", pattern: "solid", collar: "spread", tuck: "full" },
    { swatch: true, color: "#F4C2C2", border: "#F4C2C2", name: "Pale Pink",   sub: "Shirts",
      formality: ["Formal", "Smart Casual"], colorFamily: "warm", tone: "light", season: "All Season", description: "Pale pink shirt — soft and smart, works well under blazers and with dark trousers.",
      fabric: "cotton", pattern: "solid", collar: "spread", tuck: "full" },
    { swatch: true, color: "#E8A0A0", border: "#E8A0A0", name: "Mid Pink",    sub: "Shirts",
      formality: ["Smart Casual"], colorFamily: "warm", tone: "light", season: "All Season", description: "Mid pink shirt — more casual than pale pink, best with chinos, jeans and casual blazers.",
      fabric: "cotton", pattern: "solid", collar: "spread", tuck: "french" },
    { swatch: true, color: "#B2C9B2", border: "#B2C9B2", name: "Sage Green",  sub: "Shirts",
      formality: ["Smart Casual", "Casual"], colorFamily: "warm", tone: "light", season: "Summer", description: "Sage green shirt — earthy and relaxed, works with chinos, casual jeans and linen blazers.",
      fabric: "cotton", pattern: "solid", collar: "spread", tuck: "french" },
    { swatch: true, color: "#6B8CAE", border: "#6B8CAE", name: "Navy Stripe", sub: "Shirts",
      formality: ["Smart Casual"], colorFamily: "cool", tone: "medium", season: "All Season", description: "Navy stripe shirt — classic pattern that works well with chinos, dark jeans and blazers.",
      fabric: "cotton", pattern: "stripe", collar: "spread", tuck: "full" },
    { swatch: true, color: "#89CFF0", border: "#89CFF0", name: "Blue Gingham",sub: "Shirts",
      formality: ["Smart Casual", "Casual"], colorFamily: "cool", tone: "light", season: "Summer", description: "Blue gingham shirt — casual and fresh, works with chinos, jeans and casual blazers.",
      fabric: "cotton", pattern: "gingham", collar: "button-down", tuck: "french" },
    { swatch: true, color: "#8B4513", border: "#8B4513", name: "Plaid",       sub: "Shirts",
      formality: ["Casual"], colorFamily: "warm", tone: "medium", season: "All Season", description: "Plaid shirt — casual only, best untucked with jeans and casual boots or sneakers.",
      fabric: "cotton", pattern: "plaid", collar: "button-down", tuck: "untucked" },
    { swatch: true, color: "#FFFFFF", border: "#e0e0e0", name: "White",       sub: "T-Shirts",
      formality: ["Casual"], colorFamily: "neutral", tone: "light", season: "All Season", description: "White t-shirt — casual essential, works with any jeans or casual pants.",
      fabric: "cotton", pattern: "solid", collar: "none", tuck: "untucked" },
    { swatch: true, color: "#1c1c1e", border: "#444",    name: "Black",       sub: "T-Shirts",
      formality: ["Casual"], colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black t-shirt — versatile casual top, works with most casual pants and sneakers.",
      fabric: "cotton", pattern: "solid", collar: "none", tuck: "untucked" },
    { swatch: true, color: "#9E9E9E", border: "#9E9E9E", name: "Grey",        sub: "T-Shirts",
      formality: ["Casual"], colorFamily: "neutral", tone: "medium", season: "All Season", description: "Grey t-shirt — relaxed everyday casual wear.",
      fabric: "cotton", pattern: "solid", collar: "none", tuck: "untucked" },
    { swatch: true, color: "#1B3A6B", border: "#1B3A6B", name: "Navy",        sub: "T-Shirts",
      formality: ["Casual"], colorFamily: "cool", tone: "dark", season: "All Season", description: "Navy t-shirt — clean and casual, works with beige, khaki and casual jeans.",
      fabric: "cotton", pattern: "solid", collar: "none", tuck: "untucked" },
    { swatch: true, color: "#6B7C4A", border: "#6B7C4A", name: "Olive",       sub: "T-Shirts",
      formality: ["Casual"], colorFamily: "warm", tone: "medium", season: "All Season", description: "Olive t-shirt — earthy casual tone, works with beige, khaki and casual jeans.",
      fabric: "cotton", pattern: "solid", collar: "none", tuck: "untucked" },
    { swatch: true, color: "#D2B48C", border: "#D2B48C", name: "Beige",       sub: "T-Shirts",
      formality: ["Casual"], colorFamily: "warm", tone: "light", season: "Summer", description: "Beige t-shirt — light and summery, works with navy, olive and casual jeans.",
      fabric: "cotton", pattern: "solid", collar: "none", tuck: "untucked" },
  ],
  pants: [
    { file: "pants_denim_levis_dark_wash.png",            name: "Levi's Dark Wash",       sub: "Jeans", subsub: "Smart Casual",
      brand: "Levi's", formality: ["Smart Casual", "Casual"], color: "dark indigo", colorFamily: "cool", tone: "dark", season: "All Season", description: "Deep indigo slim-straight Levi's denim, clean and dark enough to dress up with a blazer.",
      fabric: "denim", pattern: "solid", cut: "slim", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_levis_dark_blue.png",            name: "Levi's Dark Blue",        sub: "Jeans", subsub: "Casual",
      brand: "Levi's", formality: ["Smart Casual", "Casual"], color: "dark blue", colorFamily: "cool", tone: "dark", season: "All Season", description: "Dark blue straight-cut Levi's denim, casual everyday wear despite the darker wash.",
      fabric: "denim", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_westbay_dark_indigo.png",        name: "Westbay Dark Indigo",     sub: "Jeans", subsub: "Casual",
      brand: "Westbay", formality: ["Smart Casual", "Casual"], color: "dark indigo", colorFamily: "cool", tone: "dark", season: "All Season", description: "Dark indigo slim-cut denim, casual in feel despite the dark colour.",
      fabric: "denim", pattern: "solid", cut: "slim", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_levis_mid_blue.png",             name: "Levi's Mid Blue",         sub: "Jeans", subsub: "Smart Casual",
      brand: "Levi's", formality: ["Smart Casual", "Casual"], color: "mid blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Medium blue straight Levi's denim, smart enough to dress up with a blazer.",
      fabric: "denim", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_levis_light_wash.png",           name: "Levi's Light Wash",       sub: "Jeans", subsub: "Smart Casual",
      brand: "Levi's", formality: ["Smart Casual", "Casual"], color: "light blue", colorFamily: "cool", tone: "light", season: "All Season", description: "Light wash Levi's denim, clean and neat enough for smart casual looks.",
      fabric: "denim", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_lee_mid_blue_faded.png",         name: "Lee Mid Blue Faded",      sub: "Jeans", subsub: "Casual",
      brand: "Lee", formality: ["Casual"], color: "faded blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Faded mid-blue Lee denim with a worn casual look, straight cut with visible whiskering.",
      fabric: "denim", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_denim_casualjeans_light_blue.png",     name: "Light Blue Casual Jeans", sub: "Jeans", subsub: "Casual",
      brand: "", formality: ["Casual"], color: "light blue", colorFamily: "cool", tone: "light", season: "All Season", description: "Very light blue casual jeans, relaxed and easy for everyday casual wear.",
      fabric: "denim", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_chino_allensolly_black.png",           name: "Allen Solly Black Chino", sub: "Chinos",
      brand: "Allen Solly", formality: ["Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Jet black Allen Solly chino with a clean straight cut, pairs well with both casual and smart casual looks.",
      fabric: "chino", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_chino_allensolly_dark_olive.png",      name: "Allen Solly Dark Olive",  sub: "Chinos",
      brand: "Allen Solly", formality: ["Smart Casual", "Casual"], color: "dark olive", colorFamily: "warm", tone: "dark", season: "All Season", description: "Dark olive green Allen Solly chino, earthy and versatile for smart casual outfits.",
      fabric: "chino", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_chino_allensolly_khaki.png",           name: "Allen Solly Khaki",       sub: "Chinos",
      brand: "Allen Solly", formality: ["Smart Casual", "Casual"], color: "khaki", colorFamily: "warm", tone: "medium", season: "All Season", description: "Classic khaki Allen Solly chino, a wardrobe staple that works with almost any top or blazer.",
      fabric: "chino", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_chino_white_cotton.png",               name: "White Cotton Chino",      sub: "Chinos",
      brand: "", formality: ["Smart Casual", "Casual"], color: "off-white", colorFamily: "neutral", tone: "light", season: "Summer", description: "Off-white cotton chino with a clean flat-front cut, great for summer smart casual looks.",
      fabric: "cotton", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_chino_beige_cotton.png",               name: "Beige Cotton Chino",      sub: "Chinos",
      brand: "", formality: ["Smart Casual", "Casual"], color: "beige", colorFamily: "warm", tone: "light", season: "Summer", description: "Light beige cotton chino, warm-toned and versatile for relaxed smart casual summer outfits.",
      fabric: "cotton", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_chino_wrangler_beige.png",             name: "Wrangler Beige Jeans",    sub: "Jeans", subsub: "Casual",
      brand: "Wrangler", formality: ["Casual"], color: "beige", colorFamily: "warm", tone: "medium", season: "All Season", description: "Beige Wrangler jeans with 5-pocket denim-style construction, casual and relaxed in a warm neutral tone.",
      fabric: "denim", pattern: "solid", cut: "straight", hem: "full", beltLoop: "wide" },
    { file: "pants_casual_levis_linen_olive.png",         name: "Levi's Linen Olive",      sub: "Linen & Utility",
      brand: "Levi's", formality: ["Casual"], color: "olive", colorFamily: "warm", tone: "medium", season: "Summer", description: "Olive green Levi's linen pant with a relaxed fit, lightweight and breathable for casual summer wear.",
      fabric: "linen", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_casual_levis_nylon_khaki_utility.png", name: "Levi's Khaki Utility",    sub: "Linen & Utility",
      brand: "Levi's", formality: ["Casual"], color: "khaki olive", colorFamily: "warm", tone: "medium", season: "All Season", description: "Khaki olive utility cargo pant with side pockets, relaxed fit and functional for casual everyday wear.",
      fabric: "utility", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
    { file: "pants_casual_olive_linen_elastic.png",       name: "Olive Linen Elastic",     sub: "Linen & Utility",
      brand: "", formality: ["Casual"], color: "olive", colorFamily: "warm", tone: "medium", season: "Summer", description: "Olive linen pant with elastic waistband, very relaxed and casual, ideal for warm weather.",
      fabric: "linen", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "none" },
    { file: "pants_casual_cat_cotton_brown_work.png",     name: "CAT Brown Work Pant",     sub: "Linen & Utility",
      brand: "CAT", formality: ["Casual"], color: "taupe brown", colorFamily: "warm", tone: "medium", season: "All Season", description: "Taupe brown CAT workwear pant with cargo pocket, rugged and casual for outdoor or relaxed looks.",
      fabric: "utility", pattern: "solid", cut: "relaxed", hem: "full", beltLoop: "wide" },
  ],
  belts: [
    { file: "belt_leather_black_silver_plain.png",                 name: "Black Leather Plain",          sub: "Formal",
      brand: "", formality: ["Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Wide plain black leather belt with silver pin buckle. Fits jeans and chinos but too wide for formal trouser loops.",
      buckleStyle: "pin", width: "wide" },
    { file: "belt_leather_black_silver_stitched.png",              name: "Black Leather Stitched",       sub: "Formal",
      brand: "", formality: ["Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Wide black leather belt with contrast stitching and silver pin buckle. Fits jeans and chinos but too wide for formal trouser loops.",
      buckleStyle: "pin", width: "wide" },
    { file: "belt_leather_darkbrown_silver.png",                   name: "Dark Brown Leather",           sub: "Formal",
      brand: "", formality: ["Smart Casual", "Casual"], color: "dark brown", colorFamily: "warm", tone: "dark", season: "All Season", description: "Wide dark brown leather belt with silver pin buckle. Fits jeans and chinos but too wide for formal trouser loops.",
      buckleStyle: "pin", width: "wide" },
    { file: "belt_leather_black_platebuckle.png",                  name: "Black Leather Plate Buckle",   sub: "Formal",
      brand: "", formality: ["Formal", "Smart Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Thin black leather belt with sleek plate buckle. Fits formal trouser and suit loops as well as jeans.",
      buckleStyle: "plate", width: "thin" },
    { file: "belt_leather_black_silver_diesel.png",                name: "Black Leather Diesel",         sub: "Smart Casual",
      brand: "Diesel", formality: ["Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Wide black Diesel leather belt with silver pin buckle. Best with jeans and casual chinos.",
      buckleStyle: "pin", width: "wide" },
    { file: "belt_leather_tan_gunmetal.png",                       name: "Tan Leather Gunmetal",         sub: "Smart Casual",
      brand: "", formality: ["Smart Casual", "Casual"], color: "tan", colorFamily: "warm", tone: "medium", season: "All Season", description: "Wide tan leather belt with gunmetal buckle. Best with jeans and chinos, warm toned.",
      buckleStyle: "pin", width: "wide" },
    { file: "belt_woven_navy_tommyhilfiger.png",                   name: "Navy Woven Tommy Hilfiger",    sub: "Casual",
      brand: "Tommy Hilfiger", formality: ["Casual"], color: "navy", colorFamily: "cool", tone: "dark", season: "All Season", description: "Navy elastic woven Tommy Hilfiger belt with gunmetal buckle. Casual only, best with jeans.",
      buckleStyle: "casual", width: "medium" },
    { file: "belt_canvas_stripe_navyredwhite_tommyhilfiger.png",   name: "Stripe Canvas Tommy Hilfiger", sub: "Casual",
      brand: "Tommy Hilfiger", formality: ["Casual"], color: "navy/red/white", colorFamily: "cool", tone: "medium", season: "Summer", description: "Navy, red and white striped canvas Tommy Hilfiger belt with tan leather trim. Casual only, summery.",
      buckleStyle: "pin", width: "medium" },
  ],
  shoes: [
    { file: "shoes_dress_laceup_florsheim_brown.png",              name: "Florsheim Brown Lace-Up",      sub: "Formal", subsub: "Dress Shoes",
      brand: "Florsheim", formality: ["Formal", "Smart Casual"], color: "tan brown", colorFamily: "warm", tone: "medium", season: "All Season", description: "Classic brown leather Oxford lace-up by Florsheim with a pointed toe and leather sole. Best with suits and dress trousers but works with dark chinos too.",
      closure: "lace-up", sole: "leather" },
    { file: "shoes_dress_laceup_florsheim_black.png",              name: "Florsheim Black Lace-Up",      sub: "Formal", subsub: "Dress Shoes",
      brand: "Florsheim", formality: ["Formal", "Smart Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Sleek black leather Oxford lace-up by Florsheim with a pointed toe and leather sole. The most formal shoe in the collection.",
      closure: "lace-up", sole: "leather" },
    { file: "shoes_dress_slipon_colorado_black.png",               name: "Colorado Black Slip-On",       sub: "Formal", subsub: "Dress Shoes",
      brand: "Colorado", formality: ["Formal", "Smart Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather slip-on dress shoe by Colorado with a pointed toe. Smart and easy to wear with suits, formal trousers and dark chinos.",
      closure: "slip-on", sole: "leather" },
    { file: "shoes_dress_slipon_florsheim_black.png",              name: "Florsheim Black Slip-On",      sub: "Formal", subsub: "Dress Shoes",
      brand: "Florsheim", formality: ["Formal", "Smart Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather slip-on by Florsheim with a square toe. Formal and polished, works well with suits and smart casual.",
      closure: "slip-on", sole: "leather" },
    { file: "shoes_boots_chelsea_florsheim_brown.png",             name: "Florsheim Brown Chelsea",      sub: "Formal", subsub: "Boots",
      brand: "Florsheim", formality: ["Formal", "Smart Casual", "Casual"], color: "dark brown", colorFamily: "warm", tone: "dark", season: "All Season", description: "Rich dark brown leather chelsea boot by Florsheim. Highly versatile — works with suits, smart casual jeans, chinos and casual outfits.",
      closure: "chelsea", sole: "leather" },
    { file: "shoes_boots_chelsea_hushpuppies_black.png",           name: "Hush Puppies Black Chelsea",   sub: "Formal", subsub: "Boots",
      brand: "Hush Puppies", formality: ["Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather chelsea boot by Hush Puppies. Clean and versatile — works with suits, smart casual and casual outfits.",
      closure: "chelsea", sole: "leather" },
    { file: "shoes_boots_chelsea_hushpuppies_black_elastic.png",   name: "Hush Puppies Black (Elastic)", sub: "Formal", subsub: "Boots",
      brand: "Hush Puppies", formality: ["Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather ankle boot by Hush Puppies with full elastic side panel. Easy to slip on, versatile across formal and casual looks.",
      closure: "elastic", sole: "leather" },
    { file: "shoes_boots_chelsea_hushpuppies_black_zip.png",       name: "Hush Puppies Black (Zip)",     sub: "Formal", subsub: "Boots",
      brand: "Hush Puppies", formality: ["Formal", "Smart Casual", "Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather ankle boot by Hush Puppies with side zip. Versatile across formal and casual looks.",
      closure: "zip", sole: "leather" },
    { file: "shoes_loafer_modaitaliano_tan_brown.png",             name: "Moda Italiano Tan Loafer",     sub: "Smart Casual", subsub: "Loafers",
      brand: "Moda Italiano", formality: ["Smart Casual", "Casual"], color: "tan", colorFamily: "warm", tone: "medium", season: "Summer", description: "Tan leather bit-loafer by Moda Italiano with gold hardware. Works beautifully with chinos, formal jeans and casual outfits.",
      closure: "slip-on", sole: "leather" },
    { file: "shoes_loafer_hushpuppies_blue.png",                   name: "Hush Puppies Blue Loafer",     sub: "Smart Casual", subsub: "Loafers",
      brand: "Hush Puppies", formality: ["Smart Casual", "Casual"], color: "navy blue", colorFamily: "cool", tone: "medium", season: "Summer", description: "Navy suede driver moccasin by Hush Puppies. Relaxed loafer style, best with chinos and smart casual jeans.",
      closure: "slip-on", sole: "rubber" },
    { file: "shoes_loafer_hushpuppies_brown.png",                  name: "Hush Puppies Brown Loafer",    sub: "Smart Casual", subsub: "Loafers",
      brand: "Hush Puppies", formality: ["Smart Casual", "Casual"], color: "dark brown", colorFamily: "warm", tone: "dark", season: "All Season", description: "Dark brown pebbled leather driver moccasin by Hush Puppies. Comfortable and casual, best with chinos and jeans.",
      closure: "slip-on", sole: "rubber" },
    { file: "shoes_sneaker_wildrhino_brown_leather_whitesole.png", name: "Wild Rhino Brown Leather",     sub: "Smart Casual", subsub: "Sneakers",
      brand: "Wild Rhino", formality: ["Smart Casual", "Casual"], color: "tan brown", colorFamily: "warm", tone: "medium", season: "All Season", description: "Clean tan leather sneaker by Wild Rhino with white rubber sole. Elevated — works great with dark jeans, chinos and casual outfits.",
      closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_wildrhino_olive.png",                   name: "Wild Rhino Olive",             sub: "Smart Casual", subsub: "Sneakers",
      brand: "Wild Rhino", formality: ["Casual"], color: "olive", colorFamily: "warm", tone: "medium", season: "All Season", description: "Distressed olive leather trainer by Wild Rhino with a rugged casual look. Best with casual jeans.",
      closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_adidas_black_white.png",                name: "Adidas Black & White",         sub: "Casual", subsub: "Sneakers",
      brand: "Adidas", formality: ["Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black suede Adidas sneaker with white 3-stripe detail. Classic casual streetwear sneaker.",
      closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_uspolo_white_rednavy.png",              name: "US Polo White (Red/Navy)",     sub: "Casual", subsub: "Sneakers",
      brand: "US Polo", formality: ["Casual"], color: "white", colorFamily: "neutral", tone: "light", season: "Summer", description: "White US Polo sneaker with red and navy detailing. Casual and sporty, best for summer outfits.",
      closure: "lace-up", sole: "rubber" },
    { file: "shoes_sneaker_uspolo_black_whitelaces.png",           name: "US Polo Black",                sub: "Casual", subsub: "Sneakers",
      brand: "US Polo", formality: ["Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black US Polo sneaker with white laces and red accent. Casual everyday sneaker.",
      closure: "lace-up", sole: "rubber" },
    { file: "shoes_boots_casual_colorado_black.png",               name: "Colorado Black Casual Boot",   sub: "Casual", subsub: "Boots",
      brand: "Colorado", formality: ["Casual"], color: "black", colorFamily: "neutral", tone: "dark", season: "All Season", description: "Black leather chelsea-style ankle boot by Colorado. More casual construction than the Hush Puppies — best with casual jeans.",
      closure: "chelsea", sole: "rubber" },
    { file: "shoes_athletic_colorado_white_blue.png",              name: "Colorado White & Blue",        sub: "Athletic",
      brand: "Colorado", formality: ["Casual"], color: "white/blue", colorFamily: "cool", tone: "light", season: "All Season", description: "White and blue retro running shoe by Colorado. Sport and casual use only.",
      closure: "lace-up", sole: "rubber" },
    { file: "shoes_athletic_reebok_grey_teal.png",                 name: "Reebok Grey & Teal",           sub: "Athletic",
      brand: "Reebok", formality: ["Casual"], color: "grey/teal", colorFamily: "cool", tone: "medium", season: "All Season", description: "Grey and teal Reebok retro runner with chunky sole. Sport and gym use only.",
      closure: "lace-up", sole: "rubber" },
  ],
  blazers: [
    { file: "blazer_formal_charcoal_grey.png",                 name: "Charcoal Grey Blazer", sub: "Formal",
      brand: "", formality: ["Formal", "Smart Casual"], color: "charcoal grey", colorFamily: "cool", tone: "medium", season: "All Season", description: "Classic charcoal grey slim-fit blazer with notch lapel. Versatile — works with suits, dress trousers and smart casual jeans.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_formal_mid_blue.png",                      name: "Mid Blue Blazer",       sub: "Formal",
      brand: "", formality: ["Formal", "Smart Casual"], color: "mid blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Mid blue slim-fit blazer with a subtle texture. Pairs well with grey trousers, chinos and dark jeans.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_formal_navy.png",                          name: "Navy Blazer",            sub: "Formal",
      brand: "", formality: ["Formal", "Smart Casual"], color: "navy", colorFamily: "cool", tone: "dark", season: "All Season", description: "Deep navy slim-fit blazer. A wardrobe essential — works with almost every pant colour and style.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_formal_dark_charcoal_burgundy_lining.png", name: "Dark Charcoal Blazer",  sub: "Formal",
      brand: "", formality: ["Formal", "Smart Casual"], color: "dark charcoal", colorFamily: "cool", tone: "dark", season: "All Season", description: "Very dark charcoal blazer with burgundy lining detail. Sharp and formal, best with dark trousers and suits.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_casual_blue_wool.png",                     name: "Blue Wool Blazer",       sub: "Casual",
      brand: "", formality: ["Smart Casual", "Casual"], color: "cobalt blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Vibrant cobalt blue wool blazer with floral lining. A statement piece — best with neutral pants like khaki, beige or dark jeans.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "blazer_casual_beige_linen.png",                   name: "Beige Linen Blazer",     sub: "Casual",
      brand: "", formality: ["Smart Casual", "Casual"], color: "beige", colorFamily: "warm", tone: "light", season: "Summer", description: "Light beige linen blazer with floral lining. Lightweight and relaxed, perfect for summer smart casual outfits.",
      fabric: "linen", pattern: "solid", cut: "slim" },
    { file: "blazer_casual_grey_check.png",                    name: "Grey Check Blazer",      sub: "Casual",
      brand: "", formality: ["Smart Casual", "Casual"], color: "light grey", colorFamily: "cool", tone: "light", season: "All Season", description: "Light grey windowpane check blazer with blue lining. Casual and stylish, best with dark jeans or navy chinos.",
      fabric: "wool", pattern: "check", cut: "slim" },
  ],
  suits: [
    { file: "suit_dark_charcoal_purple_lining.png",  name: "Dark Charcoal Suit",      sub: "Formal (Wool)",
      brand: "", formality: ["Formal"], color: "dark charcoal", colorFamily: "cool", tone: "dark", season: "All Season", description: "Very dark charcoal two-piece wool suit with purple lining detail. Sharp and commanding for important formal occasions.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_beige_linen.png",                  name: "Beige Linen Suit",         sub: "Casual (Linen)",
      brand: "", formality: ["Smart Casual", "Casual"], color: "beige", colorFamily: "warm", tone: "light", season: "Summer", description: "Beige linen two-piece suit. Lightweight and relaxed, perfect for summer weddings, garden parties and smart casual occasions.",
      fabric: "linen", pattern: "solid", cut: "slim" },
    { file: "suit_light_grey.png",                   name: "Light Grey Suit",          sub: "Formal (Wool)",
      brand: "", formality: ["Formal"], color: "light grey", colorFamily: "cool", tone: "light", season: "All Season", description: "Light grey two-piece wool suit. Elegant and classic, works well for weddings, events and formal office days.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_mid_grey.png",                     name: "Mid Grey Suit",            sub: "Formal (Wool)",
      brand: "", formality: ["Formal"], color: "mid grey", colorFamily: "cool", tone: "medium", season: "All Season", description: "Mid grey two-piece wool suit. A boardroom staple — professional and versatile for everyday formal wear.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_mid_blue.png",                     name: "Mid Blue Suit",            sub: "Formal (Wool)",
      brand: "", formality: ["Formal"], color: "mid blue", colorFamily: "cool", tone: "medium", season: "All Season", description: "Mid blue two-piece wool suit. A classic business suit, versatile for most formal occasions.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_light_blue_grey.png",              name: "Light Blue Grey Suit",     sub: "Formal (Wool)",
      brand: "", formality: ["Formal"], color: "light blue grey", colorFamily: "cool", tone: "light", season: "All Season", description: "Light blue-grey two-piece wool suit. Sits between blue and grey, fresh and versatile for daytime formal events.",
      fabric: "wool", pattern: "solid", cut: "slim" },
    { file: "suit_blue_grey_check.png",              name: "Blue Grey Check Suit",     sub: "Formal (Wool)",
      brand: "", formality: ["Formal"], color: "blue grey", colorFamily: "cool", tone: "medium", season: "All Season", description: "Blue-grey wool suit with a visible check pattern. Darker and more textured than the light blue grey.",
      fabric: "wool", pattern: "check", cut: "slim" },
  ],
  jackets: [],
};
