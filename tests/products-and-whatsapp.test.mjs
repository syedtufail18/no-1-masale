import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PRODUCTS,
  getProductByCompartmentIndex,
  getProductById,
  getProductBySlug,
  getProductRotationAngle,
} from '../src/data/products.mjs'
import { buildWhatsAppEnquiryMessage, createWhatsAppEnquiryUrl } from '../src/utils/whatsapp.mjs'
import { getMasalaSequenceState } from '../src/utils/masalaSequence.mjs'

test('product catalogue uses stable IDs, slugs, and unique compartment positions', () => {
  assert.equal(PRODUCTS.length, 6)
  assert.equal(new Set(PRODUCTS.map((product) => product.id)).size, PRODUCTS.length)
  assert.equal(new Set(PRODUCTS.map((product) => product.slug)).size, PRODUCTS.length)
  assert.equal(new Set(PRODUCTS.map((product) => product.compartmentIndex)).size, PRODUCTS.length)
})

test('products can be found by ID, slug, and compartment index', () => {
  assert.equal(getProductById('turmeric')?.name, 'Turmeric')
  assert.equal(getProductBySlug('red-chilli')?.id, 'red-chilli')
  assert.equal(getProductByCompartmentIndex(5)?.name, 'Mustard Seeds')
  assert.equal(getProductBySlug('missing-product'), undefined)
})

test('rotation angles map to each product compartment', () => {
  assert.equal(getProductRotationAngle('turmeric'), 0)
  assert.equal(getProductRotationAngle('garam-masala'), 240)
  assert.deepEqual(PRODUCTS.map((product) => product.rotationAngle), [0, 60, 120, 180, 240, 300])
})

test('WhatsApp message includes all enquiry details', () => {
  const message = buildWhatsAppEnquiryMessage({
    productName: 'Garam Masala',
    quantity: '25 kg',
    packagingPreference: '500 g pouch',
    city: 'Mumbai',
    businessType: 'Restaurant',
  })

  assert.match(message, /Product: Garam Masala/)
  assert.match(message, /Quantity: 25 kg/)
  assert.match(message, /Business type: Restaurant/)
})

test('WhatsApp URL normalizes the number and encodes the message', () => {
  const url = createWhatsAppEnquiryUrl('+91 98765 43210', {
    productName: 'Masala & Spice',
    quantity: '10 kg',
    packagingPreference: 'Pouch / jar',
    city: 'Pune',
    businessType: 'Retail & wholesale',
  })

  assert.match(url, /^https:\/\/wa\.me\/919876543210\?text=/)
  assert.ok(url.includes('Masala%20%26%20Spice'))
  assert.ok(url.includes('Pouch%20%2F%20jar'))
  assert.equal(new URL(url).searchParams.get('text')?.includes('Retail & wholesale'), true)
})

test('scroll progress selects one product at a time and opens then closes its panel', () => {
  const turmericStart = getMasalaSequenceState(0.05, PRODUCTS.length)
  const cuminFocus = getMasalaSequenceState(0.25, PRODUCTS.length)
  const finalRest = getMasalaSequenceState(1, PRODUCTS.length)

  assert.equal(turmericStart.activeIndex, 0)
  assert.equal(cuminFocus.activeIndex, 1)
  assert.ok(cuminFocus.focusProgress > 0)
  assert.ok(cuminFocus.panelProgress > 0)
  assert.equal(finalRest.activeIndex, PRODUCTS.length - 1)
  assert.equal(finalRest.panelProgress, 0)
  assert.equal(finalRest.isComposed, true)
})
