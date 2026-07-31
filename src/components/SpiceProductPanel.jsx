import React from 'react'
import ProductActionButtons from './ProductActionButtons'
import spiceBowl from '../assets/spice bowl.png'
import cuminSeed from '../assets/products/cumin-seed.png'
import corianderSeed from '../assets/products/coriander-seed.png'
import driedRedChilli from '../assets/products/dried-red-chilli.png'
import turmericRoot from '../assets/products/turmeric-root.png'
import blackPepper from '../assets/products/black-pepper.png'

const ACCENTS = {
  amber: '#f59e0b',
  chilli: '#dc4a2b',
  coriander: '#628e4d',
  cumin: '#a76434',
  garam: '#74472d',
  mustard: '#c99519',
}

const THUMBNAIL_TRANSFORMS = {
  turmeric: 'scale(3) translateY(18%)',
  cumin: 'scale(3) translate(-15%, 10%)',
  coriander: 'scale(3) translate(-15%, -10%)',
  'red-chilli': 'scale(3) translateY(-18%)',
  'garam-masala': 'scale(3) translate(15%, -10%)',
  'mustard-seeds': 'scale(3) translate(15%, 10%)',
}

const PRODUCT_IMAGES = {
  turmeric: turmericRoot,
  cumin: cuminSeed,
  coriander: corianderSeed,
  'red-chilli': driedRedChilli,
  'garam-masala': blackPepper,
}

export default function SpiceProductPanel({ product, panelProgress = 1, staticLayout = false }) {
  const primaryImage = PRODUCT_IMAGES[product.id]
  const style = staticLayout
    ? undefined
    : {
        opacity: Math.max(0.04, panelProgress),
        transform: `translate3d(0, ${(1 - panelProgress) * 18}px, 0) scale(${0.98 + panelProgress * 0.02})`,
      }

  return (
    <article className="masala-product-panel" style={{ ...style, '--product-accent': ACCENTS[product.accent] }} aria-live="polite">
      <div className="masala-panel-topline">
        <div className="masala-panel-visual" aria-hidden="true">
          <img
            className={primaryImage ? 'masala-panel-product-image' : undefined}
            src={primaryImage || spiceBowl}
            alt=""
            style={primaryImage ? undefined : { transform: THUMBNAIL_TRANSFORMS[product.id] }}
          />
          {!primaryImage && <span>{product.name.slice(0, 1)}</span>}
        </div>
        <div>
          <p className="masala-kicker">{product.category} · {product.origin}</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-950 sm:text-4xl">{product.name}</h2>
        </div>
        <div className="masala-panel-status">
          <span className="masala-heat">{product.heat}</span>
        </div>
      </div>

      <p className="mt-5 text-base leading-7 text-stone-700">{product.shortDescription}</p>

      <dl className="masala-details-grid">
        <div>
          <dt>Flavour profile</dt>
          <dd>{product.flavourProfile}</dd>
        </div>
        <div>
          <dt>Common uses</dt>
          <dd>{product.uses.join(', ')}</dd>
        </div>
        <div>
          <dt>Quality highlights</dt>
          <dd>{product.highlights.join(' · ')}</dd>
        </div>
        <div>
          <dt>Available pack sizes</dt>
          <dd>{product.packSizes.length ? product.packSizes.join(', ') : 'To be confirmed'}</dd>
        </div>
      </dl>

      <ProductActionButtons product={product} />
    </article>
  )
}
