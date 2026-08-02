import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { createModerationLink, verifyModerationLink } = require('../server/moderation-links.js')

test('moderation links verify for the intended review and status', () => {
  const now = Date.UTC(2026, 7, 2)
  const link = new URL(createModerationLink('https://example.com', 'private-secret', 'review-1', 'approved', now))
  const [, , , , , status, expires, token] = link.pathname.split('/')

  assert.equal(verifyModerationLink('private-secret', 'review-1', status, expires, token, now), true)
  assert.equal(verifyModerationLink('private-secret', 'review-1', 'rejected', expires, token, now), false)
})

test('moderation links expire and cannot be reused with another secret', () => {
  const now = Date.UTC(2026, 7, 2)
  const link = new URL(createModerationLink('https://example.com', 'private-secret', 'review-1', 'approved', now))
  const [, , , , , status, expires, token] = link.pathname.split('/')
  const expiredNow = Number(expires) * 1000

  assert.equal(verifyModerationLink('private-secret', 'review-1', status, expires, token, expiredNow), false)
  assert.equal(verifyModerationLink('wrong-secret', 'review-1', status, expires, token, now), false)
})
