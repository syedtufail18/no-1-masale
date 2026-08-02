const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const {
  findReviewById,
  insertReview,
  isConfigured,
  uploadReviewImage,
} = require('../review-store')

const reviewsFile = path.resolve(__dirname, '../data/reviews.json')
const uploadsDir = path.resolve(__dirname, '../uploads')

async function migrate() {
  if (!isConfigured()) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
  if (!fs.existsSync(reviewsFile)) {
    console.log('No local review file found. Nothing to migrate.')
    return
  }

  const localReviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'))
  for (const review of localReviews) {
    if (await findReviewById(review.id)) {
      console.log(`Skipping existing review ${review.id}`)
      continue
    }

    const localImagePath = review.imageFilename ? path.join(uploadsDir, path.basename(review.imageFilename)) : null
    let imageFilename = null
    if (localImagePath && fs.existsSync(localImagePath)) {
      const imagePath = `${crypto.randomUUID()}${path.extname(localImagePath).toLowerCase() || '.jpg'}`
      await uploadReviewImage({
        buffer: fs.readFileSync(localImagePath),
        mimetype: review.imageFilename.endsWith('.png') ? 'image/png' : 'image/jpeg',
      }, imagePath)
      imageFilename = imagePath
    }

    await insertReview({ ...review, imageFilename })
    console.log(`Migrated review ${review.id}`)
  }
}

migrate().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
