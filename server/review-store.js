const { createClient } = require('@supabase/supabase-js')

const REVIEW_BUCKET = process.env.SUPABASE_REVIEW_BUCKET || 'review-images'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

function isConfigured() {
  return Boolean(supabase)
}

function requireConfigured() {
  if (!supabase) {
    const error = new Error('Supabase review storage is not configured.')
    error.code = 'review_storage_not_configured'
    throw error
  }
}

function toDbReview(review) {
  return {
    id: review.id,
    name: review.name,
    email: review.email || null,
    phone: review.phone || null,
    rating: review.rating,
    review: review.review,
    image_path: review.imageFilename || null,
    consent_to_publish: review.consentToPublish,
    consent_for_updates: review.consentForUpdates,
    publish_consented_at: review.publishConsentedAt,
    consented_at: review.consentedAt,
    status: review.status,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
  }
}

function fromDbReview(review) {
  return {
    id: review.id,
    name: review.name,
    email: review.email || '',
    phone: review.phone || '',
    rating: review.rating,
    review: review.review,
    imageFilename: review.image_path || null,
    consentToPublish: review.consent_to_publish,
    consentForUpdates: review.consent_for_updates,
    publishConsentedAt: review.publish_consented_at,
    consentedAt: review.consented_at,
    status: review.status,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
  }
}

async function listReviews({ approvedOnly = false } = {}) {
  requireConfigured()
  let query = supabase
    .from('customer_reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (approvedOnly) query = query.eq('status', 'approved')
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(fromDbReview)
}

async function insertReview(review) {
  requireConfigured()
  const { data, error } = await supabase
    .from('customer_reviews')
    .insert(toDbReview(review))
    .select('*')
    .single()
  if (error) throw error
  return fromDbReview(data)
}

async function findReviewById(id) {
  requireConfigured()
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? fromDbReview(data) : null
}

async function updateReviewStatus(id, status) {
  requireConfigured()
  const { data, error } = await supabase
    .from('customer_reviews')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return fromDbReview(data)
}

async function uploadReviewImage(file, imagePath) {
  requireConfigured()
  const { error } = await supabase.storage
    .from(REVIEW_BUCKET)
    .upload(imagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })
  if (error) throw error
  return imagePath
}

async function removeReviewImage(imagePath) {
  if (!imagePath || !supabase) return
  const { error } = await supabase.storage.from(REVIEW_BUCKET).remove([imagePath])
  if (error) throw error
}

async function createReviewImageUrl(imagePath, expiresIn = 86400) {
  if (!imagePath) return null
  requireConfigured()
  const { data, error } = await supabase.storage
    .from(REVIEW_BUCKET)
    .createSignedUrl(imagePath, expiresIn)
  if (error) throw error
  return data.signedUrl
}

module.exports = {
  REVIEW_BUCKET,
  createReviewImageUrl,
  findReviewById,
  fromDbReview,
  insertReview,
  isConfigured,
  listReviews,
  removeReviewImage,
  requireConfigured,
  supabase,
  updateReviewStatus,
  uploadReviewImage,
}
