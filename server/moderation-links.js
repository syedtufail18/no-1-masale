const crypto = require('node:crypto')

const MODERATION_LINK_TTL_SECONDS = 48 * 60 * 60

function getModerationToken(secret, reviewId, status, expiresAt) {
  const payload = `${reviewId}.${status}.${expiresAt}`
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function createModerationLink(baseUrl, secret, reviewId, status, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + MODERATION_LINK_TTL_SECONDS
  const token = getModerationToken(secret, reviewId, status, expiresAt)
  const url = new URL(`/admin/reviews/${encodeURIComponent(reviewId)}/action/${status}/${expiresAt}/${token}`, `${baseUrl}/`)
  return url.toString()
}

function verifyModerationLink(secret, reviewId, status, expiresAt, token, now = Date.now()) {
  const expires = Number(expiresAt)
  if (!secret || !reviewId || !['approved', 'rejected'].includes(status) || !Number.isInteger(expires) || expires <= Math.floor(now / 1000) || !/^[a-f0-9]{64}$/i.test(token || '')) return false

  const expected = getModerationToken(secret, reviewId, status, expires)
  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(token, 'hex')
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

module.exports = {
  MODERATION_LINK_TTL_SECONDS,
  createModerationLink,
  verifyModerationLink,
}
