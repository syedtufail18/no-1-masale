import React from 'react'
import spiceBowl from '../assets/spice bowl.png'

const POSITIONS = [
  ['50%', '23%'],
  ['75%', '36%'],
  ['75%', '65%'],
  ['50%', '78%'],
  ['25%', '65%'],
  ['25%', '36%'],
]

const ACCENTS = {
  amber: '#f59e0b',
  cumin: '#b7793b',
  coriander: '#5b8c4a',
  chilli: '#d44b2d',
  garam: '#7b4a2d',
  mustard: '#d7a72a',
}

export default function MasalaBoxScene({ products, activeIndex, focusProgress, rotation }) {
  return (
    <div className="masala-box-frame" aria-label="Rotating masala box" style={{ '--scene-focus': focusProgress }}>
      <div className="masala-box-shadow" aria-hidden="true" />
      <div className="masala-box" style={{ transform: `perspective(1200px) rotateX(${focusProgress * 7}deg) rotateZ(${rotation * 1.35}deg) scale(${1 + focusProgress * 0.08})` }}>
        <img className="masala-box-image" src={spiceBowl} alt="Circular box filled with Indian spices" />
        <div className="masala-box-tint" aria-hidden="true" />
        {products.map((product, index) => {
          const [left, top] = POSITIONS[product.compartmentIndex] || POSITIONS[index]
          const active = index === activeIndex
          const lift = active ? focusProgress * -68 : 0
          const scale = active ? 1 + focusProgress * 1.02 : 0.76

          return (
            <div
              key={product.id}
              className={`masala-compartment ${active ? 'is-active' : ''}`}
              data-product-id={product.id}
              style={{
                '--compartment-accent': ACCENTS[product.accent],
                left,
                opacity: active ? 1 : 0.52,
                top,
                transform: `translate(-50%, -50%) translateY(${lift}px) scale(${scale})`,
              }}
              aria-hidden="true"
            >
              <span className="masala-compartment-core"><i /><i /><i /></span>
              <span className="masala-compartment-glow" />
              {active && <span className="masala-compartment-label">{product.name}</span>}
            </div>
          )
        })}
      </div>
      <div className="masala-box-caption" aria-hidden="true">Scroll to explore the collection</div>
    </div>
  )
}
