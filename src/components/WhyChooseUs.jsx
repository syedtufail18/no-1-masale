import React from 'react'

const REASONS = [
  { number: '01', title: 'Carefully selected', text: 'A clear starting point for conversations about spice quality and sourcing.' },
  { number: '02', title: 'Made for real recipes', text: 'Formats and details that make it easier to choose for homes, kitchens, and supply needs.' },
  { number: '03', title: 'A warmer experience', text: 'A spice catalogue that feels as considered as the meals it belongs in.' },
  { number: '04', title: 'Ready to talk', text: 'Send an enquiry for product details, packaging information, or a supply follow-up.' },
]

export default function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="masala-kicker">Why choose us</p>
            <h2 className="mt-3 max-w-lg text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
              A little more care in every detail.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-stone-600">
            No. 1 Masale brings product discovery, packaging clarity, and a human path to enquiry into one calm experience.
          </p>
        </div>

        <div className="why-grid">
          {REASONS.map((reason) => (
            <article key={reason.number} className="why-item">
              <span>{reason.number}</span>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
