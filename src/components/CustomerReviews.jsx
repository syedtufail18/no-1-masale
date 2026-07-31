import React from 'react'

const REVIEWS = [
  { quote: 'Verified customer story will appear here.', name: 'Customer name', detail: 'City or business type' },
  { quote: 'Add a favourite recipe or product experience here.', name: 'Customer name', detail: 'City or business type' },
  { quote: 'A short note about the spice journey belongs here.', name: 'Customer name', detail: 'City or business type' },
]

export default function CustomerReviews() {
  return (
    <section className="reviews-section">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="masala-kicker">Customer reviews</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">Stories from the table.</h2>
          </div>
          <span className="review-placeholder-label">Awaiting verified stories</span>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((review) => (
            <article key={review.quote} className="review-card">
              <span className="review-mark">“</span>
              <p className="review-quote">{review.quote}</p>
              <div className="review-byline">
                <strong>{review.name}</strong>
                <span>{review.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
