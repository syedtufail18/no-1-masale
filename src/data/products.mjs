/**
 * @typedef {'amber' | 'cumin' | 'coriander' | 'chilli' | 'garam' | 'mustard'} ProductAccent
 */

/**
 * @typedef {Object} Product
 * @property {string} id Stable identifier used by UI state and enquiry payloads.
 * @property {string} slug URL-safe identifier reserved for future product routes.
 * @property {string} name
 * @property {string} category
 * @property {string} origin
 * @property {string} heat
 * @property {string} shortDescription
 * @property {string} fullDescription
 * @property {string} flavourProfile
 * @property {string[]} uses
 * @property {string[]} highlights
 * @property {string[]} packSizes Empty until verified pack sizes are supplied.
 * @property {string | null} image Null until individual product photography is supplied.
 * @property {string | null} productUrl Null because product routes are not published yet.
 * @property {number} compartmentIndex Position reserved for the masala box sequence.
 * @property {number} rotationAngle Rotation target in degrees for the masala box.
 * @property {ProductAccent} accent Visual token, not a product claim.
 * @property {string | null} shelfLife Null until verified shelf-life information is supplied.
 * @property {string | null} storageInstructions Null until verified storage guidance is supplied.
 * @property {boolean | null} wholesaleAvailable Null until wholesale availability is confirmed.
 * @property {string} signatureNote
 */

/** @type {readonly Product[]} */
export const PRODUCTS = Object.freeze([
  {
    id: 'turmeric',
    slug: 'turmeric',
    name: 'Turmeric',
    category: 'Root spice',
    origin: 'South India',
    heat: 'Warm',
    shortDescription: 'Earthy and bright, the backbone of color and warmth in many Indian kitchens.',
    fullDescription: 'Turmeric brings a glowing golden tone and a rounded earthy flavor. It is used in tempering, curries, lentils, and marinades for both color and depth.',
    flavourProfile: 'Soft, earthy, slightly bitter',
    uses: ['Dal', 'roasted vegetables', 'curry bases'],
    highlights: ['Root spice', 'South India', 'Warm'],
    packSizes: [],
    image: null,
    productUrl: null,
    compartmentIndex: 0,
    rotationAngle: 0,
    accent: 'amber',
    shelfLife: null,
    storageInstructions: null,
    wholesaleAvailable: null,
    signatureNote: 'A classic daily-use spice that quietly makes the whole dish feel more alive.',
  },
  {
    id: 'cumin',
    slug: 'cumin',
    name: 'Cumin',
    category: 'Seed spice',
    origin: 'Rajasthan',
    heat: 'Toasty',
    shortDescription: 'A warm, nutty note that opens up when it hits hot oil or dry heat.',
    fullDescription: 'Cumin is one of the most instantly recognizable Indian spices. Its toasty profile lifts curries, rice, and vegetable dishes, and it forms the base of many spice blends.',
    flavourProfile: 'Warm, nutty, toasted',
    uses: ['Jeera rice', 'gravies', 'tadka'],
    highlights: ['Seed spice', 'Rajasthan', 'Toasty'],
    packSizes: [],
    image: null,
    productUrl: null,
    compartmentIndex: 1,
    rotationAngle: 60,
    accent: 'cumin',
    shelfLife: null,
    storageInstructions: null,
    wholesaleAvailable: null,
    signatureNote: 'The smell of cumin in oil is basically the sound of dinner starting.',
  },
  {
    id: 'coriander',
    slug: 'coriander',
    name: 'Coriander',
    category: 'Seed spice',
    origin: 'West India',
    heat: 'Mild',
    shortDescription: 'Citrusy and floral, it softens heavy dishes and brings balance.',
    fullDescription: 'Ground coriander is gentle but essential. It rounds out stronger flavors and adds a fresh, bright quality to masala blends, marinades, and vegetable dishes.',
    flavourProfile: 'Fresh, citrusy, slightly sweet',
    uses: ['Sabzi', 'chaat masala', 'marinades'],
    highlights: ['Seed spice', 'West India', 'Mild'],
    packSizes: [],
    image: null,
    productUrl: null,
    compartmentIndex: 2,
    rotationAngle: 120,
    accent: 'coriander',
    shelfLife: null,
    storageInstructions: null,
    wholesaleAvailable: null,
    signatureNote: 'It is one of those spices you miss only when it is gone.',
  },
  {
    id: 'red-chilli',
    slug: 'red-chilli',
    name: 'Red Chilli',
    category: 'Heat spice',
    origin: 'Andhra',
    heat: 'Hot',
    shortDescription: 'Brings the fire, the color, and the edge that wakes up a dish.',
    fullDescription: 'Indian red chilli powders vary from sharp and fiery to deep and smoky. They are used to build heat, brighten color, and balance richer masalas.',
    flavourProfile: 'Sharp, peppery, vivid',
    uses: ['Pickles', 'curries', 'fry masalas'],
    highlights: ['Heat spice', 'Andhra', 'Hot'],
    packSizes: [],
    image: null,
    productUrl: null,
    compartmentIndex: 3,
    rotationAngle: 180,
    accent: 'chilli',
    shelfLife: null,
    storageInstructions: null,
    wholesaleAvailable: null,
    signatureNote: 'A little goes a long way, but the right amount changes everything.',
  },
  {
    id: 'garam-masala',
    slug: 'garam-masala',
    name: 'Garam Masala',
    category: 'Blend',
    origin: 'Pan-Indian',
    heat: 'Layered',
    shortDescription: 'The finishing blend that ties the whole plate together.',
    fullDescription: 'Garam masala is usually added late in the cooking process so the aroma stays bright. It gives curries their warm, rounded finish with cinnamon, clove, cardamom, and more.',
    flavourProfile: 'Rich, warming, fragrant',
    uses: ['Curries', 'kofta', 'biryani finishes'],
    highlights: ['Blend', 'Pan-Indian', 'Layered'],
    packSizes: [],
    image: null,
    productUrl: null,
    compartmentIndex: 4,
    rotationAngle: 240,
    accent: 'garam',
    shelfLife: null,
    storageInstructions: null,
    wholesaleAvailable: null,
    signatureNote: 'Think of it as the final note that makes the whole song feel complete.',
  },
  {
    id: 'mustard-seeds',
    slug: 'mustard-seeds',
    name: 'Mustard Seeds',
    category: 'Tempering spice',
    origin: 'Bengal',
    heat: 'Pungent',
    shortDescription: 'Tiny seeds that pop loudly and bring a sharp, unmistakable character.',
    fullDescription: 'Mustard seeds are central to many tempering styles, especially in coastal and eastern Indian cooking. Their crackle in hot oil creates a bold aromatic start.',
    flavourProfile: 'Pungent, sharp, bold',
    uses: ['Sambhar', 'chutneys', 'fish curry'],
    highlights: ['Tempering spice', 'Bengal', 'Pungent'],
    packSizes: [],
    image: null,
    productUrl: null,
    compartmentIndex: 5,
    rotationAngle: 300,
    accent: 'mustard',
    shelfLife: null,
    storageInstructions: null,
    wholesaleAvailable: null,
    signatureNote: 'The pop in hot oil is part flavor, part little kitchen drama.',
  },
])

/** @param {string} id @returns {Product | undefined} */
export function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id)
}

/** @param {string} slug @returns {Product | undefined} */
export function getProductBySlug(slug) {
  return PRODUCTS.find((product) => product.slug === slug)
}

/** @param {number} compartmentIndex @returns {Product | undefined} */
export function getProductByCompartmentIndex(compartmentIndex) {
  return PRODUCTS.find((product) => product.compartmentIndex === compartmentIndex)
}

/** @param {string} id @returns {number | undefined} */
export function getProductRotationAngle(id) {
  return getProductById(id)?.rotationAngle
}
