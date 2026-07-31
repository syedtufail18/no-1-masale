const publicEnvironment = import.meta.env || {}

function readPublicValue(key) {
  const value = publicEnvironment[key]
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Public business contact settings. These may be exposed to browser users, so
 * only VITE_ variables belong here. SMTP credentials stay on the mail server.
 */
export const CONTACT = Object.freeze({
  businessEmail: readPublicValue('VITE_BUSINESS_EMAIL'),
  businessPhone: readPublicValue('VITE_BUSINESS_PHONE'),
  whatsappNumber: readPublicValue('VITE_WHATSAPP_NUMBER'),
})
