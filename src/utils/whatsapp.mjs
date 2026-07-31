/**
 * @typedef {Object} WhatsAppEnquiry
 * @property {string} productName
 * @property {string} quantity
 * @property {string} packagingPreference
 * @property {string} city
 * @property {string} businessType
 */

function valueOrNotSpecified(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed || 'Not specified'
}

/** @param {WhatsAppEnquiry} enquiry */
export function buildWhatsAppEnquiryMessage(enquiry) {
  return [
    'Hello, I would like to enquire about your masala products.',
    '',
    `Product: ${valueOrNotSpecified(enquiry.productName)}`,
    `Quantity: ${valueOrNotSpecified(enquiry.quantity)}`,
    `Packaging preference: ${valueOrNotSpecified(enquiry.packagingPreference)}`,
    `City: ${valueOrNotSpecified(enquiry.city)}`,
    `Business type: ${valueOrNotSpecified(enquiry.businessType)}`,
  ].join('\n')
}

/** @param {string} whatsappNumber */
export function normalizeWhatsAppNumber(whatsappNumber) {
  const normalized = typeof whatsappNumber === 'string' ? whatsappNumber.replace(/\D/g, '') : ''
  if (!normalized) throw new Error('A WhatsApp number is required to create an enquiry link.')
  return normalized
}

/** @param {string} whatsappNumber @param {WhatsAppEnquiry} enquiry */
export function createWhatsAppEnquiryUrl(whatsappNumber, enquiry) {
  const number = normalizeWhatsAppNumber(whatsappNumber)
  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppEnquiryMessage(enquiry))}`
}
