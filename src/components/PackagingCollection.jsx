import React, { useRef, useState } from 'react'
import spiceBowl from '../assets/spice bowl.png'

const PACKAGES = [
  { size: '100g', label: 'Sample size', tone: 'amber' },
  { size: '200g', label: 'Kitchen size', tone: 'copper' },
  { size: '500g', label: 'Family size', tone: 'green' },
  { size: '1kg', label: 'Stock-up size', tone: 'red' },
  { size: 'Bulk', label: 'Supply format', tone: 'brown' },
]

function PackageArtwork({ pack, large = false }) {
  return (
    <div className={`package-artwork package-artwork--${pack.tone} ${large ? 'package-artwork--large' : ''}`}>
      <div className="package-shadow" />
      <div className="package-pack">
        <div className="package-pack-top" />
        <div className="package-pack-label">
          <span>No. 1</span>
          <strong>MASALE</strong>
          <small>Authentic spices</small>
          <b>{pack.size}</b>
        </div>
        <img src={spiceBowl} alt="" />
      </div>
    </div>
  )
}

export default function PackagingCollection() {
  const trackRef = useRef(null)
  const [selectedPack, setSelectedPack] = useState(null)

  function moveCarousel(direction) {
    trackRef.current?.scrollBy({ left: direction * 330, behavior: 'smooth' })
  }

  return (
    <section id="packaging" className="packaging-section">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="packaging-heading-row">
          <div>
            <p className="masala-kicker">Packaging collection</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
              The right format for every kitchen.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
              From a first taste to a larger supply conversation, choose the format that fits the way you cook, share, and stock.
            </p>
          </div>
          <div className="packaging-controls" aria-label="Packaging carousel controls">
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Previous package size">←</button>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Next package size">→</button>
          </div>
        </div>

        <div ref={trackRef} className="packaging-track" tabIndex="0" aria-label="Packaging formats">
          {PACKAGES.map((pack) => (
            <article
              key={pack.size}
              className="package-card"
              role="button"
              tabIndex="0"
              aria-label={`Enlarge ${pack.size} package`}
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
                <p>{pack.label}</p>
                <h3>{pack.size}</h3>
                <span>View format</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedPack && (
        <div className="package-dialog-backdrop" role="presentation" onClick={() => setSelectedPack(null)}>
          <div className="package-dialog" role="dialog" aria-modal="true" aria-label={`${selectedPack.size} package preview`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="package-dialog-close" onClick={() => setSelectedPack(null)} aria-label="Close package preview">×</button>
            <PackageArtwork pack={selectedPack} large />
            <div>
              <p className="masala-kicker">Packaging format</p>
              <h2 className="mt-2 text-4xl font-semibold text-stone-950">{selectedPack.size}</h2>
              <p className="mt-3 text-base leading-7 text-stone-600">{selectedPack.label} for the way your spice story needs to travel.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
