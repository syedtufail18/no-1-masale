import React, { useRef, useState } from 'react'
import spiceBowl from '../assets/spice bowl.png'
import { CONTACT } from '../config/contact.mjs'
import { createWhatsAppEnquiryUrl } from '../utils/whatsapp.mjs'
import cuminSeed from '../assets/products/cumin-seed.png'
import corianderSeed from '../assets/products/coriander-seed.png'
import driedRedChilli from '../assets/products/dried-red-chilli.png'
import turmericRoot from '../assets/products/turmeric-root.png'
import blackPepper from '../assets/products/black-pepper.png'

const QUANTITY_OPTIONS = ['100g', '200g', '500g', '1kg', 'Bulk']
const PACKAGE_TONES = ['amber', 'copper', 'green', 'red', 'brown', 'amber']
const PRODUCT_IMAGES = {
  turmeric: turmericRoot,
  cumin: cuminSeed,
  coriander: corianderSeed,
  'red-chilli': driedRedChilli,
  'garam-masala': blackPepper,
}

function getPackage(product, index, quantity) {
  return {
    product,
    size: quantity,
    tone: PACKAGE_TONES[index % PACKAGE_TONES.length],
  }
}

function stopCardClick(event) {
  event.stopPropagation()
}

function PackageActions({ pack, quantity, onProductChange }) {
  const whatsappUrl = CONTACT.whatsappNumber
    ? createWhatsAppEnquiryUrl(CONTACT.whatsappNumber, {
        productName: pack.product.name,
        quantity,
        packagingPreference: quantity,
        city: '',
        businessType: '',
      })
    : null

  return (
    <div className="package-actions" onClick={stopCardClick}>
      <a
        className="masala-action masala-action-primary"
        href="#enquiry"
        onClick={() => onProductChange?.(pack.product.id, quantity)}
      >
        Enquiry
      </a>
      {whatsappUrl ? (
        <a className="masala-action masala-action-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      ) : (
        <span className="masala-action masala-action-muted" aria-disabled="true" title="Add VITE_WHATSAPP_NUMBER to enable WhatsApp enquiries">
          WhatsApp
        </span>
      )}
    </div>
  )
}

function PackageArtwork({ pack, large = false }) {
  const productImage = PRODUCT_IMAGES[pack.product.id]

  return (
    <div className={`package-artwork package-artwork--${pack.tone} ${large ? 'package-artwork--large' : ''}`}>
      <div className="package-shadow" />
      <div className="package-pack">
        <div className="package-pack-top" />
        <div className="package-pack-label">
          <span>No. 1</span>
          <strong>{pack.product.name}</strong>
          <small>Authentic spice</small>
          <b>{pack.size}</b>
        </div>
        <img src={productImage || spiceBowl} alt="" loading={large ? 'eager' : 'lazy'} decoding="async" />
      </div>
    </div>
  )
}

export default function PackagingCollection({ products = [], onProductChange }) {
  const trackRef = useRef(null)
  const [selectedPack, setSelectedPack] = useState(null)
  const [quantities, setQuantities] = useState(() => (
    Object.fromEntries(products.map((product) => [product.id, QUANTITY_OPTIONS[0]]))
  ))

  function moveCarousel(direction) {
    trackRef.current?.scrollBy({ left: direction * 330, behavior: 'smooth' })
  }

  return (
    <section id="packaging" className="packaging-section deferred-section">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="packaging-heading-row">
          <div>
            <p className="masala-kicker">Packaging collection</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
              Choose the spice and format for every kitchen.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
              Select a product, choose your quantity, and send an enquiry directly from its card.
            </p>
          </div>
          <div className="packaging-controls" aria-label="Packaging carousel controls">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Previous spice">&#8592;</button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Next spice">&#8594;</button>
          </div>
        </div>

        <div ref={trackRef} className="packaging-track" tabIndex="0" aria-label="Spice products">
          {products.map((product, index) => {
            const quantity = quantities[product.id] || QUANTITY_OPTIONS[0]
            const pack = getPackage(product, index, quantity)

            return (
              <article
                key={product.id}
                className="package-card"
                role="button"
                tabIndex="0"
                aria-label={`Enlarge ${product.name} package`}
                onClick={() => setSelectedPack(pack)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedPack(pack)
                  }
                }}
              >
                <PackageArtwork pack={pack} />
                <div className="package-card-copy">
                  <p>{product.category} · {product.origin}</p>
                  <h3>{product.name}</h3>
                  <span>{product.shortDescription}</span>
                  <label className="package-quantity" onClick={stopCardClick}>
                    <span>Quantity</span>
                    <select
                      value={quantity}
                      aria-label={`Quantity for ${product.name}`}
                      onChange={(event) => {
                        stopCardClick(event)
                        setQuantities((current) => ({ ...current, [product.id]: event.target.value }))
                      }}
                    >
                      {QUANTITY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <PackageActions pack={pack} quantity={quantity} onProductChange={onProductChange} />
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {selectedPack && (
        <div className="package-dialog-backdrop" role="presentation" onClick={() => setSelectedPack(null)}>
          <div className="package-dialog" role="dialog" aria-modal="true" aria-label={`${selectedPack.product.name} package preview`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="package-dialog-close" onClick={() => setSelectedPack(null)} aria-label="Close package preview">&#215;</button>
            <PackageArtwork pack={selectedPack} large />
            <div>
              <p className="masala-kicker">Packaging format</p>
              <h2 className="mt-2 text-4xl font-semibold text-stone-950">{selectedPack.product.name}</h2>
              <p className="mt-3 text-base leading-7 text-stone-600">{selectedPack.size} format for the way your spice story needs to travel.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
