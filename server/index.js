const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const multer = require('multer')
const crypto = require('node:crypto')
require('dotenv').config()
const { createReviewImageUrl, insertReview, isConfigured, listReviews, removeReviewImage, updateReviewStatus, uploadReviewImage } = require('./review-store')
const { createModerationLink, verifyModerationLink } = require('./moderation-links')

const app = express()
const reviewImageLimit = (Number(process.env.REVIEW_UPLOAD_MAX_MB) || 5) * 1024 * 1024
const allowedImageTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const requiredSmtpVars = ['SMTP_USER', 'SMTP_PASS']
const reviewUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: reviewImageLimit, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
    callback(null, true)
  },
})

function getMissingEmailVars() {
  if (process.env.RESEND_API_KEY) {
    return process.env.RESEND_FROM_EMAIL ? [] : ['RESEND_FROM_EMAIL']
  }

  return requiredSmtpVars.filter((name) => !process.env[name])
}

function textValue(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function booleanValue(value) {
  return value === true || value === 'true' || value === 'on'
}

function storageErrorResponse(res, error) {
  if (error?.code === 'review_storage_not_configured') {
    return res.status(503).json({ error: error.code, message: 'Hosted review storage is not configured.' })
  }
  console.error('Review storage error:', error)
  return res.status(500).json({ error: 'review_storage_failed', message: 'The review service is temporarily unavailable.' })
}

function publicReview(review) {
  return {
    id: review.id,
    name: review.name,
    rating: review.rating,
    review: review.review,
    imageUrl: review.imageFilename ? `/review-images/${encodeURIComponent(review.imageFilename)}` : null,
    createdAt: review.createdAt,
  }
}

async function adminReview(review) {
  return {
    ...review,
    imageUrl: review.imageFilename ? await createReviewImageUrl(review.imageFilename) : null,
  }
}

function requireReviewAdmin(req, res, next) {
  const configuredToken = process.env.ADMIN_REVIEW_TOKEN
  const receivedToken = req.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!configuredToken) return res.status(503).json({ error: 'review_admin_not_configured' })
  if (!receivedToken || receivedToken !== configuredToken) return res.status(401).json({ error: 'unauthorized' })
  next()
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  })
}

async function sendEmail({ from, to, subject, text, replyTo }) {
  if (!process.env.RESEND_API_KEY) return createTransporter().sendMail({ from, to, subject, text, replyTo })

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [to],
      subject,
      text,
      reply_to: replyTo || undefined,
    }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || body.name || `Resend request failed with ${response.status}`)
  return { messageId: body.id }
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]))
}

function getModerationLinks(review) {
  const secret = process.env.ADMIN_REVIEW_TOKEN
  const baseUrl = process.env.REVIEW_ADMIN_BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://127.0.0.1:3001'
  if (!secret) return null
  return {
    approve: createModerationLink(baseUrl, secret, review.id, 'approved'),
    reject: createModerationLink(baseUrl, secret, review.id, 'rejected'),
  }
}

function renderModerationPage({ title, message, review, status, token, expires }) {
  const actionLabel = status === 'approved' ? 'Approve review' : 'Reject review'
  const formAction = `/admin/reviews/${encodeURIComponent(review.id)}/action`
  return `<!doctype html>
    <html lang="en">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>
      <style>body{font-family:Arial,sans-serif;background:#f8f1e7;color:#231f20;margin:0;padding:32px}.box{max-width:640px;margin:auto;background:#fff;padding:32px;border-radius:14px;box-shadow:0 12px 40px #392b1b1f}h1{margin-top:0}blockquote{border-left:4px solid #d97706;padding-left:16px;white-space:pre-wrap}.actions{display:flex;gap:12px;align-items:center}button{border:0;border-radius:8px;padding:12px 18px;font-weight:700;cursor:pointer}.approve{background:#1f7a45;color:#fff}.reject{background:#a33b2b;color:#fff}</style></head>
      <body><main class="box"><p>No. 1 Masale review moderation</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>
      <p><strong>Reviewer:</strong> ${escapeHtml(review.name)}</p><p><strong>Rating:</strong> ${escapeHtml(review.rating)}/5</p><blockquote>${escapeHtml(review.review)}</blockquote>
      <form method="post" action="${formAction}" class="actions">
        <input type="hidden" name="status" value="${escapeHtml(status)}"><input type="hidden" name="expires" value="${escapeHtml(expires)}"><input type="hidden" name="token" value="${escapeHtml(token)}">
        <button class="${status === 'approved' ? 'approve' : 'reject'}" type="submit">${actionLabel}</button>
      </form></main></body></html>`
}

function renderLegacyModerationPage(review) {
  const links = getModerationLinks(review)
  if (!links) return '<h1>This moderation link is invalid or expired.</h1>'
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Refresh review action</title><style>body{font-family:Arial,sans-serif;background:#f8f1e7;color:#231f20;margin:0;padding:32px}.box{max-width:560px;margin:auto;background:#fff;padding:32px;border-radius:14px;box-shadow:0 12px 40px #392b1b1f}h1{margin-top:0}.actions{display:flex;gap:12px;flex-wrap:wrap}a{border-radius:8px;padding:12px 18px;text-decoration:none;font-weight:700}.approve{background:#1f7a45;color:#fff}.reject{background:#a33b2b;color:#fff}</style></head><body><main class="box"><p>No. 1 Masale review moderation</p><h1>This older email link needs refreshing.</h1><p>Choose the action you intended. A secure confirmation page will open next.</p><div class="actions"><a class="approve" href="${escapeHtml(links.approve)}">Approve review</a><a class="reject" href="${escapeHtml(links.reject)}">Reject review</a></div></main></body></html>`
}

async function notifyAdminOfReview(review) {
  const missing = getMissingEmailVars()
  if (missing.length) {
    console.warn(`Review saved, but admin notification was skipped. Missing email provider config: ${missing.join(', ')}`)
    return false
  }

  const to = process.env.REVIEW_ADMIN_EMAIL || process.env.TO_EMAIL || 'syed.uck@gmail.com'

  try {
    let imageUrl = null
    if (review.imageFilename) {
      try { imageUrl = await createReviewImageUrl(review.imageFilename, 86400) } catch (error) { console.error('Review image preview error:', error) }
    }
    const imageLine = imageUrl ? `Image preview (expires in 24 hours):\n${imageUrl}` : 'No image preview is available.'
    const dashboardLine = 'Open the private admin review endpoint with your ADMIN_REVIEW_TOKEN to approve or reject it.'
    const moderationLinks = getModerationLinks(review)
    const moderationText = moderationLinks
      ? `Approve review:\n${moderationLinks.approve}\nReject review:\n${moderationLinks.reject}`
      : 'Set REVIEW_ADMIN_BASE_URL or deploy on Render to include approve/reject links in future emails.'

    await sendEmail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject: `NEW ACTION LINKS: review ${review.id} awaiting approval`,
      replyTo: review.email || undefined,
      text: [
        'A new customer review is waiting for approval.',
        `Review ID: ${review.id}`,
        `Name: ${review.name}`,
        `Rating: ${review.rating}/5`,
        `Review: ${review.review}`,
        imageLine,
        moderationText,
        dashboardLine,
      ].join('\n'),
      html: `
        <h2>New review awaiting approval</h2>
        <p><strong>Review ID:</strong> ${escapeHtml(review.id)}</p>
        <p><strong>Name:</strong> ${escapeHtml(review.name)}</p>
        <p><strong>Rating:</strong> ${escapeHtml(review.rating)}/5</p>
        <p><strong>Review:</strong> ${escapeHtml(review.review)}</p>
        ${imageUrl ? `<p><a href="${escapeHtml(imageUrl)}">Open uploaded image preview</a></p>` : '<p>No image was uploaded.</p>'}
        ${moderationLinks ? `<p><a href="${escapeHtml(moderationLinks.approve)}">Approve review</a> &nbsp; <a href="${escapeHtml(moderationLinks.reject)}">Reject review</a></p>` : '<p>Set REVIEW_ADMIN_BASE_URL to include approve/reject links in future emails.</p>'}
        <p>Each link opens a confirmation page before changing the review status.</p>
      `,
    })
    return true
  } catch (error) {
    console.error('Review notification error:', error)
    return false
  }
}

function healthHandler(_req, res) {
  const missing = getMissingEmailVars()
  res.json({
    ok: true,
    emailReady: missing.length === 0,
    missing,
    reviewStorage: isConfigured() ? 'supabase' : 'not_configured',
  })
}

app.get(['/health', '/healthz'], healthHandler)

app.get('/reviews', async (_req, res) => {
  try {
    const reviews = await listReviews({ approvedOnly: true })
    return res.json({ reviews: reviews.map(publicReview) })
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.get('/review-images/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename)
    const reviews = await listReviews({ approvedOnly: true })
    const review = reviews.find((item) => item.imageFilename === filename)
    if (!review) return res.sendStatus(404)
    const signedUrl = await createReviewImageUrl(filename)
    return res.redirect(signedUrl)
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.post('/reviews', (req, res) => {
  reviewUpload.single('photo')(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({ error: uploadError.code === 'LIMIT_FILE_SIZE' ? 'image_too_large' : 'invalid_image' })
    }

    const name = textValue(req.body?.name, 80)
    const reviewText = textValue(req.body?.review, 1200)
    const rating = Number(req.body?.rating)
    const consentToPublish = booleanValue(req.body?.consentToPublish)
    const consentForUpdates = booleanValue(req.body?.consentForUpdates)
    const email = consentForUpdates ? textValue(req.body?.email, 160).toLowerCase() : ''
    const phone = consentForUpdates ? textValue(req.body?.phone, 40) : ''
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const validPhone = phone.replace(/\D/g, '').length >= 7

    if (!name || !reviewText || !Number.isInteger(rating) || rating < 1 || rating > 5 || !consentToPublish) {
      return res.status(400).json({ error: 'Name, review, rating, and publishing consent are required.' })
    }

    if (consentForUpdates && (!email || !phone || !validEmail || !validPhone)) {
      return res.status(400).json({ error: 'A valid email and phone are required when updates consent is selected.' })
    }

    const now = new Date().toISOString()
    const review = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      rating,
      review: reviewText,
      imageFilename: null,
      consentToPublish,
      consentForUpdates,
      publishConsentedAt: now,
      consentedAt: consentForUpdates ? now : null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    let uploadedImagePath = null
    try {
      if (req.file) {
        uploadedImagePath = `${crypto.randomUUID()}${allowedImageTypes.get(req.file.mimetype)}`
        await uploadReviewImage(req.file, uploadedImagePath)
        review.imageFilename = uploadedImagePath
      }

      const savedReview = await insertReview(review)
      const notificationSent = await notifyAdminOfReview(savedReview)
      return res.status(201).json({ ok: true, reviewId: savedReview.id, status: savedReview.status, notificationSent })
    } catch (error) {
      if (uploadedImagePath) {
        try { await removeReviewImage(uploadedImagePath) } catch (cleanupError) { console.error('Review image cleanup error:', cleanupError) }
      }
      return storageErrorResponse(res, error)
    }
  })
})

app.get('/admin/reviews/:id/action/:status/:expires/:token', async (req, res) => {
  const { status, expires, token } = req.params
  if (!verifyModerationLink(process.env.ADMIN_REVIEW_TOKEN, req.params.id, status, expires, token)) {
    return res.status(401).type('html').send('<h1>This moderation link is invalid or expired.</h1>')
  }

  try {
    const reviews = await listReviews()
    const review = reviews.find((item) => item.id === req.params.id)
    if (!review) return res.status(404).type('html').send('<h1>Review not found.</h1>')
    return res.type('html').send(renderModerationPage({
      title: status === 'approved' ? 'Approve this review?' : 'Reject this review?',
      message: 'Please confirm this moderation action.',
      review,
      status,
      token,
      expires,
    }))
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.get('/admin/reviews/:id/action', async (req, res) => {
  const { status, expires, token } = req.query
  if (!status || !expires || !token) {
    try {
      const reviews = await listReviews()
      const review = reviews.find((item) => item.id === req.params.id)
      if (!review) return res.sendStatus(404)
      return res.type('html').send(renderLegacyModerationPage(review))
    } catch (error) {
      return storageErrorResponse(res, error)
    }
  }
  if (!verifyModerationLink(process.env.ADMIN_REVIEW_TOKEN, req.params.id, status, expires, token)) {
    return res.status(401).type('html').send('<h1>This moderation link is invalid or expired.</h1>')
  }

  try {
    const reviews = await listReviews()
    const review = reviews.find((item) => item.id === req.params.id)
    if (!review) return res.status(404).type('html').send('<h1>Review not found.</h1>')
    return res.type('html').send(renderModerationPage({
      title: status === 'approved' ? 'Approve this review?' : 'Reject this review?',
      message: 'Please confirm this moderation action.',
      review,
      status,
      token,
      expires,
    }))
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.post('/admin/reviews/:id/action', async (req, res) => {
  const { status, expires, token } = req.body || {}
  if (!verifyModerationLink(process.env.ADMIN_REVIEW_TOKEN, req.params.id, status, expires, token)) {
    return res.status(401).type('html').send('<h1>This moderation link is invalid or expired.</h1>')
  }

  try {
    const reviews = await listReviews()
    const existingReview = reviews.find((item) => item.id === req.params.id)
    if (!existingReview) return res.status(404).type('html').send('<h1>Review not found.</h1>')

    const updatedReview = await updateReviewStatus(req.params.id, status)
    if (status === 'rejected' && existingReview.imageFilename) {
      try { await removeReviewImage(existingReview.imageFilename) } catch (error) { console.error('Rejected review image cleanup error:', error) }
    }
    return res.type('html').send(`<h1>Review ${status}.</h1><p>The website will show the updated moderation result when its reviews refresh.</p>`)
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.post('/admin/reviews/:id/notify', requireReviewAdmin, async (req, res) => {
  try {
    const reviews = await listReviews()
    const review = reviews.find((item) => item.id === req.params.id)
    if (!review) return res.sendStatus(404)
    const notificationSent = await notifyAdminOfReview(review)
    return res.json({ ok: true, notificationSent })
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.get('/admin/reviews', requireReviewAdmin, async (_req, res) => {
  try {
    const reviews = await listReviews()
    return res.json({ reviews: await Promise.all(reviews.map(adminReview)) })
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.patch('/admin/reviews/:id', requireReviewAdmin, async (req, res) => {
  const nextStatus = req.body?.status
  if (!['approved', 'rejected'].includes(nextStatus)) return res.status(400).json({ error: 'Status must be approved or rejected.' })

  try {
    const reviews = await listReviews()
    const existingReview = reviews.find((item) => item.id === req.params.id)
    if (!existingReview) return res.sendStatus(404)

    const updatedReview = await updateReviewStatus(req.params.id, nextStatus)
    if (nextStatus === 'rejected' && existingReview.imageFilename) {
      try { await removeReviewImage(existingReview.imageFilename) } catch (error) { console.error('Rejected review image cleanup error:', error) }
    }
    return res.json({ ok: true, review: publicReview(updatedReview), status: updatedReview.status })
  } catch (error) {
    return storageErrorResponse(res, error)
  }
})

app.post('/send', async (req, res) => {
  const { name, email, phone, message, productId, productName, quantity } = req.body || {}
  if (!email || !message) return res.status(400).json({ error: 'Email and message are required' })

  const missing = getMissingEmailVars()
  if (missing.length) {
    return res.status(500).json({ error: 'email_not_configured', message: `Missing email provider config: ${missing.join(', ')}` })
  }

  try {
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER
    const to = process.env.TO_EMAIL || 'syed.uck@gmail.com'
    const productDetails = productName || productId || quantity
      ? `\nProduct ID: ${productId || 'Not specified'}\nProduct: ${productName || 'Not specified'}\nQuantity: ${quantity || 'Not specified'}`
      : ''

    const info = await sendEmail({
      from,
      to,
      subject: `Enquiry from ${name || 'Website visitor'}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}${productDetails}\n\nMessage:\n${message}`,
      replyTo: email,
    })

    return res.json({ ok: true, messageId: info.messageId })
  } catch (error) {
    console.error('Mail send error:', error)
    return res.status(500).json({ error: 'send_failed', message: error.message })
  }
})

const port = Number(process.env.PORT) || (process.env.RENDER ? 10000 : 3001)
app.listen(port, '0.0.0.0', () => console.log(`Mail server listening on http://0.0.0.0:${port}`))
