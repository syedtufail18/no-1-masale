import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001'
const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  rating: '5',
  review: '',
  consentToPublish: false,
  consentForUpdates: false,
  photo: null,
}

function getImageUrl(imageUrl) {
  return imageUrl ? `${API_BASE}${imageUrl}` : null
}

function ReviewStars({ rating }) {
  return (
    <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => <span key={star} aria-hidden="true" className={star <= rating ? 'is-filled' : ''}>&#9733;</span>)}
    </span>
  )
}

function ReviewCard({ review, onOpen }) {
  return (
    <article className="review-card">
      {review.imageUrl
        ? <button type="button" className="review-card-media-button" onClick={() => onOpen(review)} aria-label={`Open full review from ${review.name}`}>
            <span className="review-card-media">
              <img src={getImageUrl(review.imageUrl)} alt={`Shared by ${review.name}`} loading="lazy" decoding="async" />
            </span>
          </button>
        : <div className="review-card-media"><span aria-hidden="true">{review.name.charAt(0).toUpperCase()}</span></div>}
      <div className="review-card-content">
        <div className="review-card-topline">
          <ReviewStars rating={review.rating} />
          <span>{review.rating}.0</span>
        </div>
        <p className="review-quote">&ldquo;{review.review}&rdquo;</p>
        <div className="review-byline">
          <strong>{review.name}</strong>
          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  )
}

function ReviewDetailModal({ review, onClose }) {
  return (
    <div className="review-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="review-detail-modal" role="dialog" aria-modal="true" aria-labelledby="review-detail-title">
        <div className="review-modal-heading">
          <div>
            <p className="masala-kicker">Customer story</p>
            <h3 id="review-detail-title">A masala moment from {review.name}.</h3>
          </div>
          <button type="button" className="review-close-button" onClick={onClose} aria-label="Close review">Close</button>
        </div>
        <div className="review-detail-image-wrap">
          <img src={getImageUrl(review.imageUrl)} alt={`Full size shared image from ${review.name}`} />
        </div>
        <div className="review-detail-content">
          <div className="review-card-topline"><ReviewStars rating={review.rating} /><span>{review.rating}.0</span></div>
          <p className="review-detail-quote">&ldquo;{review.review}&rdquo;</p>
          <div className="review-byline"><strong>{review.name}</strong><span>{new Date(review.createdAt).toLocaleDateString()}</span></div>
        </div>
      </div>
    </div>
  )
}

function ReviewForm({ form, sending, status, fileInputRef, updateForm, handlePhotoChange, handleSubmit, onClose }) {
  return (
    <div className="review-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
        <div className="review-modal-heading">
          <div>
            <p className="masala-kicker">Share your experience</p>
            <h3 id="review-modal-title">Tell us about your masala moment.</h3>
          </div>
          <button type="button" className="review-close-button" onClick={onClose} aria-label="Close review form">Close</button>
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
          <label>
            <span>Name shown with review</span>
            <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required placeholder="Your name" />
          </label>

          <fieldset>
            <legend>Rating</legend>
            <div className="review-rating">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating}>
                  <input type="radio" name="review-rating" value={rating} checked={form.rating === String(rating)} onChange={(event) => updateForm('rating', event.target.value)} />
                  <span aria-label={`${rating} star${rating === 1 ? '' : 's'}`}>&#9733;</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            <span>Your review</span>
            <textarea value={form.review} onChange={(event) => updateForm('review', event.target.value)} required maxLength={1200} placeholder="What did you enjoy?" />
          </label>

          <label>
            <span>Photo (optional, maximum 5 MB)</span>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
          </label>

          <label className="review-consent">
            <input type="checkbox" checked={form.consentToPublish} onChange={(event) => updateForm('consentToPublish', event.target.checked)} required />
            <span>I consent to No. 1 Masale publishing this review and photo on its website.</span>
          </label>

          <label className="review-consent">
            <input type="checkbox" checked={form.consentForUpdates} onChange={(event) => updateForm('consentForUpdates', event.target.checked)} />
            <span>I agree to receive occasional product updates by email or WhatsApp.</span>
          </label>

          {form.consentForUpdates && (
            <div className="review-contact-fields">
              <label>
                <span>Email for updates</span>
                <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required={form.consentForUpdates} placeholder="you@example.com" />
              </label>
              <label>
                <span>Phone for WhatsApp updates</span>
                <input type="tel" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} required={form.consentForUpdates} placeholder="Phone number" />
              </label>
            </div>
          )}

          <button type="submit" disabled={sending}>{sending ? 'Submitting...' : 'Submit review'}</button>
          {status.type !== 'idle' && <p className={`review-status review-status--${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.message}</p>}
        </form>
      </div>
    </div>
  )
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [reviewsError, setReviewsError] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let active = true
    async function loadReviews() {
      try {
        const response = await fetch(`${API_BASE}/reviews`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not load reviews.')
        const data = await response.json()
        if (active) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : [])
          setReviewsError(false)
        }
      } catch {
        if (active) setReviewsError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadReviews()
    const refreshTimer = window.setInterval(loadReviews, 10000)
    window.addEventListener('focus', loadReviews)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
      window.removeEventListener('focus', loadReviews)
    }
  }, [])

  useEffect(() => {
    if (!showForm && !selectedReview) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setShowForm(false)
        setSelectedReview(null)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [showForm, selectedReview])

  function updateForm(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    if (status.type !== 'idle') setStatus({ type: 'idle', message: '' })
  }

  function handlePhotoChange(event) {
    const photo = event.target.files?.[0] || null
    if (photo && photo.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Please choose an image smaller than 5 MB.' })
      event.target.value = ''
      return
    }
    updateForm('photo', photo)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.consentToPublish) {
      setStatus({ type: 'error', message: 'Please consent to publishing your review before submitting.' })
      return
    }
    if (form.consentForUpdates && (!form.email || !form.phone)) {
      setStatus({ type: 'error', message: 'Please add your email and phone number for update consent.' })
      return
    }

    const data = new FormData()
    data.set('name', form.name)
    data.set('rating', form.rating)
    data.set('review', form.review)
    data.set('consentToPublish', String(form.consentToPublish))
    data.set('consentForUpdates', String(form.consentForUpdates))
    if (form.consentForUpdates) {
      data.set('email', form.email)
      data.set('phone', form.phone)
    }
    if (form.photo) data.set('photo', form.photo)

    setSending(true)
    setStatus({ type: 'sending', message: 'Submitting your review...' })
    try {
      const response = await fetch(`${API_BASE}/reviews`, { method: 'POST', body: data })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Could not submit your review.')

      setForm(INITIAL_FORM)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setShowForm(false)
      setStatus({ type: 'success', message: 'Thank you. Your review is awaiting a quick moderation check before publishing.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="reviews-section deferred-section">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="reviews-heading-row">
          <div>
            <p className="masala-kicker">Customer reviews</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">Stories from the table.</h2>
            <p className="reviews-intro">Real moments, shared by people who bring No. 1 Masale home.</p>
          </div>
          <div className="review-header-actions">
            <span className="review-placeholder-label">{reviews.length ? `${reviews.length} approved stories` : 'Moderated customer stories'}</span>
            <button type="button" className="review-share-button" onClick={() => setShowForm(true)}>Share your experience</button>
          </div>
        </div>

        {status.type === 'success' && <p className="review-status review-status--success review-section-status" role="status">{status.message}</p>}
        {reviewsError && !reviews.length && !showForm && <p className="review-status review-status--error review-section-status" role="alert">Approved stories are temporarily unavailable.</p>}

        <div className="review-gallery">
          {loading && <div className="review-empty-card"><span className="review-empty-mark">...</span><p>Loading customer stories...</p></div>}
          {!loading && !reviews.length && (
            <div className="review-empty-card">
              <span className="review-empty-mark">&ldquo;</span>
              <p>Be the first to share how No. 1 Masale reached your table.</p>
            </div>
          )}
          {!loading && reviews.length > 0 && <div className="review-gallery-grid">{reviews.map((review) => <ReviewCard key={review.id} review={review} onOpen={setSelectedReview} />)}</div>}
        </div>
      </div>
      {showForm && createPortal(<ReviewForm form={form} sending={sending} status={status} fileInputRef={fileInputRef} updateForm={updateForm} handlePhotoChange={handlePhotoChange} handleSubmit={handleSubmit} onClose={() => setShowForm(false)} />, document.body)}
      {selectedReview && createPortal(<ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />, document.body)}
    </section>
  )
}
